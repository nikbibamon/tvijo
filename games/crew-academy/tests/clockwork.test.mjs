import test from 'node:test';
import assert from 'node:assert/strict';
import {applyWorkshop,boardFor,byRoom,demoPrice,restore,route,stockFor} from '../web/clockwork/game.js';

const act=(profile,type,arguments_={},allowCredits=false)=>
  applyWorkshop(profile,{type,room:restore(profile.clockwork).room,...arguments_},allowCredits);
const place=(profile,index,material=0)=>act(profile,'place',{index,material});

test('a guest with zero credits can solve every blueprint and reach the ending',()=>{
  const profile={balance:0};
  assert.equal(act(profile,'visit',{id:'stairs'}).status,'locked');
  assert.equal(act(profile,'walk').status,'tryPath');
  place(profile,2);
  assert.equal(act(profile,'walk').status,'tryPath');
  act(profile,'undo');
  place(profile,17);
  assert.equal(act(profile,'walk').game.access,'puzzle');
  assert.equal(act(profile,'walk').firstWin,false);

  act(profile,'visit',{id:'stairs'});
  place(profile,17,1);place(profile,18,1);
  assert.equal(act(profile,'walk').status,'tryPath');
  place(profile,18,1);
  assert.equal(act(profile,'walk').firstWin,true);

  const resumed=JSON.parse(JSON.stringify(profile));
  act(resumed,'visit',{id:'relay'});
  place(resumed,10,0);
  for(let i=0;i<3;i++)place(resumed,12,1);
  assert.equal(act(resumed,'walk').status,'tryPath');
  place(resumed,10,2);
  const end=act(resumed,'walk');
  assert.ok(end.path.includes(10));
  assert.deepEqual(end.game.wins,['gap','stairs','relay']);
  assert.equal(resumed.balance,0);
});

test('demo access is atomic, idempotent, site-only and does not finish the puzzle',()=>{
  const profile={balance:20,tallies:{spend:0}};
  assert.equal(act(profile,'credits').status,'locked');
  assert.equal(profile.balance,20);
  const poor={balance:demoPrice-1};
  assert.equal(act(poor,'credits',{},true).status,'balance');
  assert.equal(poor.balance,demoPrice-1);
  const result=act(profile,'credits',{},true);
  assert.equal(result.charged,demoPrice);
  assert.equal(result.game.room,'stairs');
  assert.deepEqual(result.game.wins,[]);
  assert.equal(act(profile,'credits',{},true).charged,undefined);
  assert.equal(profile.balance,20-demoPrice);
  assert.equal(profile.tallies.spend,demoPrice);
  act(profile,'visit',{id:'gap'});
  place(profile,17);
  assert.equal(act(profile,'walk').firstWin,true);
  assert.equal(act(profile,'credits',{},true).charged,undefined);
});

test('building stays within the blueprint and undo works after reloading',()=>{
  const profile={};
  assert.equal(place(profile,14).status,'fixed');
  assert.equal(place(profile,20).status,'fixed');
  place(profile,17);
  assert.equal(place(profile,17).status,'noBlocks');
  const restored=JSON.parse(JSON.stringify(profile));
  assert.ok(route(byRoom.gap,boardFor(restored.clockwork).stacks));
  act(restored,'undo');
  assert.equal(route(byRoom.gap,boardFor(restored.clockwork).stacks),null);
  assert.deepEqual(stockFor(byRoom.gap,boardFor(restored.clockwork).stacks),[1,0,0]);
});

test('free build is reachable and clear can be undone without changing puzzle progress',()=>{
  const profile={};
  act(profile,'visit',{id:'studio'});
  place(profile,17,2);
  assert.deepEqual(boardFor(profile.clockwork).stacks[17],[2]);
  act(profile,'reset');
  assert.deepEqual(boardFor(profile.clockwork).stacks[17],[]);
  act(profile,'undo');
  assert.deepEqual(boardFor(profile.clockwork).stacks[17],[2]);
  assert.deepEqual(profile.clockwork.wins,[]);
  assert.equal(profile.clockwork.access,null);
});
