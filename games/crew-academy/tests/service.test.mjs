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
