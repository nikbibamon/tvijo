import test from 'node:test';
import assert from 'node:assert/strict';
import {handleAPI} from '../server/pilot.js';
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
globalThis.localStorage=storage();globalThis.sessionStorage=storage();globalThis.window=new EventTarget();
const service=await import('../web/tvijoService.js');
function online(path,options){return handleAPI(new Request(new URL(path,'https://tvijo.test/'),options),{});}
test('wallet, no-charge fallback, cache, generation and repeat are atomic through the actual service',async()=>{
 globalThis.fetch=online;const [a,b]=await Promise.all([service.turn('Робот, закрепи мост, чтобы пройти.'),service.turn('Робот, закрепи мост, чтобы пройти.')]);
 assert.equal(a.charge+b.charge,1);assert.equal(service.state.balance,99);assert.deepEqual(service.doneFor(),['bridge']);assert.equal(await service.complete('dock'),true);
 const w=await service.buildWorld('Лавовая пещера, 3 платформы, мост');assert.equal(w.cost,25);assert.equal((await service.buildWorld('Лавовая пещера, 3 платформы, мост')).cost,0);assert.equal(service.state.balance,74);
 const {levels}=await import('../web/catalog.js');await service.setLevel(levels[1]);globalThis.fetch=async()=>{throw new Error('offline');};
 const offline=await service.turn('Самолетик, найди частоту');assert.equal(offline.source,'fallback');assert.equal(offline.charge,0);assert.deepEqual(service.doneFor(),['scan']);
 globalThis.fetch=online;await service.setTier('turbo');assert.equal((await service.turn('Ассистентка, подай питание')).charge,5);
 await service.write(s=>{s.balance=0;});assert.equal((await service.turn('Дочка, введи код в шлюз')).charge,0);assert.equal(await service.complete('rift'),true);
 await service.resetStage(levels[0]);await service.setTier('standard');const repeat=await service.turn('Робот, закрепи мост, чтобы пройти.');assert.equal(repeat.source,'cache');assert.equal(repeat.charge,0);
});
test('2.5-second deadline recovers progression and ignores a late success',async()=>{
 const {levels}=await import('../web/catalog.js');await service.resetStage(levels[2]);let arrived;
 globalThis.fetch=(p,o)=>new Promise(r=>{arrived=()=>r(online(p,o));});const before=service.state.balance,t=performance.now();const result=await service.turn('Самолётик, проверь путь');
 assert.equal(result.source,'fallback');assert.equal(result.charge,0);assert.ok(performance.now()-t>=2450&&performance.now()-t<3300);assert.deepEqual(service.doneFor(),['scan']);assert.equal(service.state.balance,before);if(arrived)arrived();
});

test('click-built drawings debit once per seed, award once and can be replayed at zero balance',async()=>{
  const spec={theme:'greenhouse',path:'duet',steps:4,seed:4321,shadow:true};
  await service.write(s=>{s.balance=50;s.claimedAwards=[];});
  const pair=await Promise.all([service.buildWorld('',spec),service.buildWorld('',spec)]);
  assert.equal(pair[0].cost+pair[1].cost,25);assert.equal(service.state.balance,25);
  const claim=await Promise.all([service.claimAward('architect'),service.claimAward('architect')]);
  assert.equal(claim[0]+claim[1],8);assert.equal(service.state.balance,33);
  assert.equal(await service.claimAward('crew'),0);
  await service.write(s=>{s.balance=0;});const before=service.state.worlds.length;
  await assert.rejects(service.buildWorld('',{...spec,seed:4322}),/25/);
  assert.equal(service.state.worlds.length,before);assert.equal((await service.buildWorld('',spec)).cost,0);
});

test('old saves start with quiet hints and both checkbox values persist alongside progress',async()=>{
  const key='tvijo.crew.academy.v1',old=JSON.parse(localStorage.getItem(key));delete old.showHints;
  localStorage.setItem(key,JSON.stringify(old));
  const restored=await import('../web/tvijoService.js?legacy-hints');
  assert.equal(restored.state.showHints,false);assert.deepEqual(restored.state.completed,old.completed);
  await restored.setShowHints(true);
  const on=await import('../web/tvijoService.js?reload-hints-on');assert.equal(on.state.showHints,true);
  await on.setShowHints(false);
  const off=await import('../web/tvijoService.js?reload-hints-off');assert.equal(off.state.showHints,false);
  assert.equal(off.state.balance,old.balance);assert.deepEqual(off.state.stages,old.stages);
});

test('opening the direct First Shift keeps a returning pilot’s gear and resumes an unfinished replay', async()=>{
  await service.write(s=>{s.level='rift'; s.completed=['dock']; s.balance=29; s.expeditionRewards=['alphabet'];
    s.stages.dock={done:['bridge'],turns:3,observed:[{ok:true}],sparks:[1]}; });
  await service.enterFirstShift();
  assert.deepEqual(service.doneFor('dock'),[]); assert.equal(service.state.resumeAfterShift,'rift');
  assert.deepEqual(service.state.stages.dock.sparks,[1]); assert.equal(service.state.stages.dock.turns,3);
  await service.fieldOrder('dock','bridge'); await service.enterFirstShift();
  assert.deepEqual(service.doneFor('dock'),['bridge']); assert.equal(await service.complete('dock'),true);
  assert.deepEqual(service.state.completed,['dock']); assert.equal(service.state.balance,29);
  assert.deepEqual(service.state.expeditionRewards,['alphabet']); assert.equal(service.state.stages.dock.replaying,undefined);
});
