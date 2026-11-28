import assert from 'node:assert/strict';
import test from 'node:test';
import {advanceConvoy, atStop, changeRun, crew, GATE, newConvoy, rescued, restoreRun, SIDING} from '../web/sluice/rules.js';
import {applySluice} from '../web/sluice/progress.js';
import {nextRoute} from '../web/crewRoute.js';
import {packNames} from '../web/expedition/rooms.js';

const prepare = (mode='day', builder=0, signaller=1) => ({...newConvoy(mode),builder,signaller});
const untilStopped = board => {
  for (let t=0;t<45;t++){
    const next=advanceConvoy(board);
    if (next===board)return board;
    board=next;
  }
  throw Error('the convoy did not come to a stop');
};
const profile = () => ({level:'dock',completed:[],expeditionRewards:[],balance:41,log:[]});
function act(p, type, args={}) {return applySluice(p,null,{type,...args},123);}
function assign(p,b,s) {
  act(p,'select',{id:b});act(p,'assign',{role:'builder'});
  act(p,'select',{id:s});act(p,'assign',{role:'signaller'});
}
function march(p) {for(let i=0;i<42;i++)if(!act(p,'step'))return;throw Error('timer did not stop');}

test('the repair siding is a distinct place; every drone can back out and rejoin its original shift',()=>{
  const queued=untilStopped({...prepare(),direction:'siding'});
  assert.deepEqual(queued.positions,Array(5).fill(SIDING));
  assert.equal(queued.detours,5);assert.equal(atStop(queued,2),'В кармане');
  const home=untilStopped({...queued,direction:'gate'});
  assert.equal(rescued(home),5);assert.equal(home.detours,5);
});
test('night power can split the party; bringing it back to the lift recovers only the laggards',()=>{
  let board=prepare('night');
  for(let turn=0;turn<6;turn++)board=advanceConvoy(board);
  const stranded=untilStopped({...board,power:'beacon'});
  const waiting=stranded.positions.filter(p=>p===2).length;
  assert.ok(waiting>0 && waiting<crew.length);
  assert.equal(rescued(stranded),5-waiting);
  const bay=untilStopped({...stranded,power:'lift'});
  assert.equal(rescued(bay),5-waiting);assert.equal(bay.positions.filter(p=>p===5).length,waiting);
  assert.equal(rescued(untilStopped({...bay,power:'beacon'})),5);
});
test('any two different drones can run the two night stations, and the direction still works after a diversion',()=>{
  for(let b=0;b<5;b++)for(let s=0;s<5;s++)if(b!==s){
    const stop=untilStopped({...prepare('night',b,s),direction:'siding'});
    assert.deepEqual(stop.positions,Array(5).fill(5));
    const siding=untilStopped({...stop,power:'beacon'});assert.equal(siding.detours,5);
    assert.equal(rescued(untilStopped({...siding,direction:'gate'})),5);
  }
});
test('a v19 half-finished or completed board is restored with its selected operator and undo history',()=>{
  const old={board:{positions:[5,5,4,3,2],bridge:true,routed:false,builder:3,signaller:0},
    selected:2,history:[newConvoy()],rewarded:false};
  const run=restoreRun(null,old);
  assert.deepEqual(run.board.positions,old.board.positions);
  assert.equal(run.board.mode,'day');assert.equal(run.selected,2);
  assert.equal(changeRun(run,{type:'undo'},false).board.bridge,false);
  assert.equal(atStop(restoreRun(null,{board:{...old.board,positions:Array(5).fill(GATE),routed:true}}).board,2),'В шлюзе');
  assert.deepEqual(restoreRun({v:2,board:{positions:[8,8,8,8,8]}},null).board,newConvoy());
});
test('an interrupted shift keeps assignments, power, siding and exact positions; a stale timer cannot advance it',()=>{
  const p=profile();p.expeditionRewards=['drones'];act(p,'night');assign(p,2,4);act(p,'direction',{to:'siding'});
  march(p);act(p,'power',{to:'beacon'});act(p,'step');
  const copy=JSON.parse(JSON.stringify(p)), oldRevision=copy.sluice.revision;
  assert.deepEqual(restoreRun(copy.sluice),p.sluice);
  act(copy,'direction',{to:'gate'});
  assert.equal(act(copy,'step',{expected:oldRevision}),null);
  march(copy);assert.equal(rescued(copy.sluice.board),5);
});
test('two shifts produce different journal entries, unique prizes and do not change campaign or wallet',()=>{
  const p=profile();
  assert.equal(act(p,'night'),null);
  assign(p,2,4);act(p,'direction',{to:'siding'});march(p);act(p,'direction',{to:'gate'});march(p);
  assert.equal(p.sluiceReports.day.builder,2);assert.equal(p.sluiceReports.day.detours,5);
  assert.deepEqual(p.expeditionRewards,['drones']);
  assert.equal(nextRoute(p,{kind:'room',id:'drones'},null).href,'./expedition.html#drones/night');
  act(p,'night');assign(p,4,1);march(p);
  assert.equal(nextRoute(p,{kind:'room',id:'drones'},null).detail,'Ночная смена · в шлюзе 0 / 5');
  act(p,'power',{to:'beacon'});march(p);
  assert.equal(p.sluiceReports.night.signaller,1);assert.equal(p.sluiceReports.night.switches,1);
  assert.equal(p.sluiceReports.day.detours,5);assert.equal(act(p,'step'),null);
  act(p,'restart');assign(p,0,3);march(p);act(p,'power',{to:'beacon'});march(p);
  assert.deepEqual(packNames(p),['Знак спасателей','Фонарь ночной смены']);
  assert.deepEqual(p.completed,[]);assert.equal(p.balance,41);
});
test('a player can fix a role at a blockage without restarting or reusing the deployed tool',()=>{
  const stalled=untilStopped(newConvoy());assert.deepEqual(stalled.positions,Array(5).fill(2));
  let run=changeRun({...restoreRun(null),board:stalled},{type:'assign',role:'builder'},false);
  run=changeRun(run,{type:'step'},false);
  assert.equal(changeRun(run,{type:'assign',role:'signaller'},false),run);
  assert.equal(changeRun(run,{type:'night'},true),run);
  run=changeRun(run,{type:'select',id:3},false);
  run=changeRun(run,{type:'assign',role:'signaller'},false);
  assert.equal(rescued(untilStopped(run.board)),5);
});
