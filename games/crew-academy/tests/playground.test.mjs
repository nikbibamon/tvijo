import test from 'node:test';
import assert from 'node:assert/strict';
import {applyPlayground,games,makeLevel,savedRun} from '../web/playground/levels.js';
import {flight} from '../web/playground/flight.js';
import {directions} from '../web/playground/grid.js';
import {ice,icePlan} from '../web/playground/ice.js';
import {wirePlan} from '../web/playground/wire.js';
import {forecast,postPlan} from '../web/playground/post.js';

function act(profile,id,type,input,entropy=0){
  const {level,seed}=savedRun(profile,id);
  return applyPlayground(profile,id,{type,level,seed,input},entropy);
}

function script(id,layout){
  if (id==='flight') {
    let state=flight.start(layout);
    const actions=[];
    for (let step=0;step<30;step++) {
      const command=flight.hint(layout,state).control;
      actions.push(command);
      const result=flight.move(layout,state,command);
      if (result.won) return actions;
      state=result.state;
    }
    throw new Error('Flight route exceeded the expected length');
  }
  if (id==='ice') return icePlan(layout);
  if (id==='wire') return wirePlan(layout,layout.turns);
  const {angle,force}=postPlan(layout)[0];
  return [{setting:'angle',value:angle},{setting:'force',value:force},'throw'];
}

test('authored levels teach one short task and advance only after a win',()=>{
  for (const id of Object.keys(games)){
    const profile={balance:0};
    const first=makeLevel(id,1,0);
    assert.equal(act(profile,id,'next',undefined,25).run.level,1);
    const commands=script(id,first);
    assert.equal(commands.length,{flight:2,ice:1,wire:1,post:3}[id]);
    let win;
    for (const command of commands) win=act(profile,id,'move',command);
    assert.equal(win.run.won,true,id);
    assert.equal(win.firstWin,true);
    assert.equal(win.run.moves,id==='flight'?2:1);
    const old={type:'next',level:1,seed:0};
    const second=applyPlayground(profile,id,old,1523).run;
    assert.deepEqual([second.level,second.seed,second.best,second.won],[2,1523,1,false]);
    assert.deepEqual(applyPlayground(profile,id,old,8291).run,second);
    const replay=act(profile,id,'restart').run;
    assert.equal(replay.seed,1523);
    assert.deepEqual(makeLevel(id,2,replay.seed),makeLevel(id,2,1523));
    assert.equal(profile.balance,0);
  }
});

test('generated levels solve through real inputs with bounded and progressive difficulty',()=>{
  let validated=0;
  for (const id of Object.keys(games)) {
    for (let level=2;level<=9;level++){
      for (let i=0;i<48;i++){
        const seed=(i*3910115819)>>>0;
        const layout=makeLevel(id,level,seed);
        assert.deepEqual(makeLevel(id,level,seed),layout);
        const game=games[id];
        let state=game.start(layout);
        const actions=script(id,layout);
        if(id==='ice')assert.equal(actions.length,Math.min(level,7));
        if(id==='wire')assert.ok(actions.length>=Math.min(level,8));
        if(id==='flight'){
          const deck=Math.floor(layout.start/layout.width);
          const rows=layout.switches.map(point=>Math.floor(point/layout.width));
          if (level===2) assert.equal(layout.tiles[layout.start+layout.width],'H');
          assert.deepEqual(rows,level===2?[deck+2]:[deck-2,deck+2]);
          assert.equal(actions.filter(action=>action==='activate').length,rows.length);
        }
        if(id==='post'){
          assert.notEqual(forecast(layout,state.angle,state.force).result,'dock');
          assert.equal(Boolean(layout.beam),level>=4);
        }
        let solved=false;
        for(const action of actions){
          const result=game.move(layout,state,action);
          if(!result?.state)continue;
          state=result.state;
          solved=result.won;
        }
        assert.equal(solved,true,id+' '+level+' '+seed);
        validated++;
      }
    }
  }
  assert.equal(validated,1536);
});

test('only the aircraft can reach the upper switch or enter the shaft below the deck',()=>{
  for (const level of [1,2,3,9]) {
    const layout=makeLevel('flight',level,3910115819);
    const origin=flight.start(layout), seen=new Set([origin.position]), pending=[origin];
    for (const person of pending) {
      assert.equal(Math.floor(person.position/layout.width),2);
      assert.equal(flight.move(layout,person,'activate','captain').state,undefined);
      for (const direction of Object.keys(directions)) {
        const next=flight.move(layout,person,direction,'captain').state;
        if (next && !seen.has(next.position)) {
          seen.add(next.position);
          pending.push(next);
        }
      }
    }
    for (const position of layout.switches) {
      assert.ok(!seen.has(position));
      assert.equal(flight.move(layout,{...origin,position},'activate','captain').state,undefined);
    }
    assert.equal(flight.move(layout,origin,'activate').state,undefined);
    assert.equal(script('flight',layout).at(-1),'activate');
  }
});

test('flight saves switch progress and opens the gate only when every switch is on',()=>{
  const profile={balance:12};
  const upper=act(profile,'flight','move','up').run;
  assert.equal(upper.won,false);
  assert.deepEqual(upper.board.lit,[]);
  assert.equal(act(profile,'flight','undo').run.board.position,makeLevel('flight',1,0).start);
  act(profile,'flight','move','up');
  const saved=JSON.parse(JSON.stringify(profile));
  assert.equal(act(saved,'flight','move','activate').run.won,true);

  act(saved,'flight','next',null,93);
  const second=savedRun(JSON.parse(JSON.stringify(saved)),'flight');
  assert.deepEqual([second.level,second.seed,second.won],[2,93,false]);
  for (const command of script('flight',makeLevel('flight',2,93))) act(saved,'flight','move',command);
  assert.equal(savedRun(saved,'flight').won,true);

  const third=act(saved,'flight','next',null,1523).run;
  const commands=script('flight',makeLevel('flight',third.level,third.seed));
  const split=commands.indexOf('activate')+1;
  for (const command of commands.slice(0,split)) act(saved,'flight','move',command);
  const partial=savedRun(saved,'flight');
  assert.equal(partial.won,false);
  assert.equal(partial.board.lit.length,1);
  assert.equal(act(saved,'flight','move','activate').run.moves,partial.moves);
  for (const command of commands.slice(split)) act(saved,'flight','move',command);
  assert.equal(savedRun(saved,'flight').won,true);
  assert.equal(saved.balance,12);
});

test('the fallback always has a shortest route of the requested size',()=>{
  for(let level=2;level<=10;level++)assert.equal(icePlan(ice.generate(level,()=>0)).length,Math.min(level,7));
});

test('a miss can be retried, persisted moves can be undone, and replays do not earn again',()=>{
  const profile={balance:12};
  const blocked=act(profile,'ice','move','left');
  assert.equal(blocked.run.won,false);
  assert.equal(blocked.run.moves,1);
  const saved=JSON.parse(JSON.stringify(profile));
  assert.equal(act(saved,'ice','undo').run.board.position,makeLevel('ice',1,0).start);
  assert.equal(act(saved,'ice','move','right').firstWin,true);
  act(saved,'ice','restart');
  assert.equal(act(saved,'ice','move','right').firstWin,false);
  const miss=act(saved,'post','move','throw');
  assert.equal(miss.run.won,false);
  assert.equal(miss.run.board.last.result,'short');
  assert.equal(act(saved,'post','undo').run.board.last,null);
  assert.equal(savedRun(saved,'ice').won,true);
  assert.equal(saved.balance,12);
});
