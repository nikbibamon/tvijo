import assert from 'node:assert/strict';
import test from 'node:test';
import {changeShift,jobs,matched,move,newShift,plateState,readShift} from '../web/warehouse/rules.js';
import {acceptShipment,activeJob,applyWarehouse,expressOpen} from '../web/warehouse/progress.js';
import {nextRoute} from '../web/crewRoute.js';
import {packNames,riftRooms} from '../web/expedition/rooms.js';

const direction={u:'up',r:'right',d:'down',l:'left'};
const line='rdrrlulur',express='rrddlulursr';
const profile=()=>({balance:55,completed:[],log:[],expeditionRewards:[],level:'dock'});
const action=(p,id,type,extra={})=>applyWarehouse(p,id,{type,...extra},123);
function walk(p,id,path){
  for(const char of path){
    const before=readShift(p.warehouse,id);
    const result=char==='s'?action(p,id,'route',{to:before.board.branch==='upper'?'lower':'upper'}):action(p,id,'move',{dir:direction[char]});
    assert.ok(result && (result.run.board.moves>before.board.moves || result.run.board.switches>before.board.switches),'blocked at '+char+' in '+path);
  }
}
function depart(p,id,path){action(p,id,'open');walk(p,id,path);return action(p,id,'ship');}

test('two distinct loads must match their own plates before the first belt runs',()=>{
  const p=profile();action(p,'line','open');
  assert.ok(!action(p,'line','ship').shipped);
  walk(p,'line',line);
  const {board}=readShift(p.warehouse,'line');
  assert.equal(matched(jobs.line,board),2);
  assert.deepEqual(board.boxes,jobs.line.plates);
  const swapped={...board,boxes:board.boxes.slice().reverse()};
  assert.equal(matched(jobs.line,swapped),0);assert.equal(plateState(jobs.line,swapped,0),'Чужой груз');
  const shipment=action(p,'line','ship');assert.equal(shipment.report.pushes,5);
  assert.equal(shipment.report.moves,9);assert.equal(shipment.report.rides,0);assert.equal(shipment.fresh,true);
});
test('sorting physically carries the load over rollers to the chosen socket, and a blocked receiver leaves both pieces intact',()=>{
  const p=profile();depart(p,'line',line);action(p,'express','open');
  action(p,'express','route',{to:'lower'});walk(p,'express','r');
  const bad=action(p,'express','move',{dir:'right'});assert.deepEqual(bad.travel.path,[19,20,21,22,30]);
  assert.equal(plateState(jobs.express,bad.run.board,1),'Чужой груз');assert.equal(matched(jobs.express,bad.run.board),0);
  const blocked={...newShift('express'),player:18,boxes:[14,19],branch:'upper'};
  assert.strictEqual(move(jobs.express,blocked,'right').board,blocked);
  action(p,'express','rewind');assert.deepEqual(readShift(p.warehouse,'express').board.boxes,[19,26]);
  action(p,'express','route',{to:'upper'});walk(p,'express',express.slice(1));
  const out=action(p,'express','ship');assert.equal(out.report.rides,2);assert.equal(out.report.returns,1);
});
test('one bad push can be recovered after walking and reloading, even beyond the short undo history',()=>{
  const p=profile();action(p,'line','open');const start=readShift(p.warehouse,'line').board;
  walk(p,'line','r');for(let n=0;n<57;n++)walk(p,'line','ud');
  const restored=JSON.parse(JSON.stringify(p));
  assert.equal(readShift(restored.warehouse,'line').history.length,96);
  action(restored,'line','rewind');assert.deepEqual(readShift(restored.warehouse,'line').board,start);
  assert.equal(readShift(restored.warehouse,'line').returns,1);
});
test('walls, nonadjacent taps and undo preserve the box and the same row at map boundaries',()=>{
  let run=readShift(null,'line');const start=run.board;
  assert.equal(changeShift('line',run,{type:'cell',cell:0}).run,run);
  const neighbor=changeShift('line',run,{type:'cell',cell:16});assert.deepEqual(neighbor.run.board.boxes,[17,24]);
  run=changeShift('line',neighbor.run,{type:'undo'}).run;assert.deepEqual(run.board,start);assert.equal(run.returns,1);
  const edge={...start,player:13};assert.strictEqual(move(jobs.line,edge,'right').board,edge);
});
test('switching jobs preserves each layout and the return from headquarters takes the active order',()=>{
  const p=profile();
  assert.equal(action(p,'express','open'),null);assert.equal(expressOpen(p),false);
  depart(p,'line',line);assert.equal(nextRoute(p,{kind:'room',id:'cargo'},null).href,'./expedition.html#cargo/express');
  action(p,'express','open');walk(p,'express','rr');const sorting=readShift(p.warehouse,'express');
  action(p,'line','open');assert.equal(readShift(p.warehouse,'line').board.sent,true);assert.equal(activeJob(p),'line');
  assert.equal(action(p,'express','ship'),null);action(p,'express','open');
  assert.deepEqual(readShift(JSON.parse(JSON.stringify(p.warehouse)),'express'),sorting);
  assert.equal(nextRoute(p,{kind:'room',id:'cargo'},null).action,'Продолжить погрузку');
});
test('the manifest is accepted once for the numbered shipment and a stale receipt cannot confirm its successor',()=>{
  const p=profile();p.expeditionRewards=['cargo'];
  const first=depart(p,'line',line),second=depart(p,'express',express);
  assert.equal(first.fresh,false);assert.equal(second.fresh,true);assert.equal(action(p,'express','ship').shipped,undefined);
  assert.equal(nextRoute(p,{kind:'room',id:'cargo'},null).href,'./expedition.html#drones/delivery');
  assert.equal(acceptShipment(p,1,500),true);assert.equal(acceptShipment(p,1,600),false);
  assert.equal(p.warehouseReports.express.receivedAt,500);
  action(p,'express','restart');const next=depart(p,'express',express);assert.equal(next.report.shipment,2);
  assert.equal(next.fresh,false);assert.equal(acceptShipment(p,1,700),false);assert.equal(acceptShipment(p,2,800),true);
  assert.deepEqual(packNames(p),['Энергоячейка','Марка экспресс-груза']);assert.equal(riftRooms.length,6);
  assert.equal(p.balance,55);assert.deepEqual(p.completed,[]);
});
test('damaged saved coordinates cannot overlap the robot or put loads on an inactive roller',()=>{
  const base=newShift('express');
  for(const change of [{boxes:[base.player,26]},{boxes:[20,26]},{boxes:[14,14]},{sent:true},{pushes:14}]){
    const record={shifts:{express:{board:{...base,...change},history:[],pushHistory:[]}}};
    assert.deepEqual(readShift(record,'express').board,base);
  }
});
