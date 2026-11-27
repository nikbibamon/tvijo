import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {levels,heroOrder,moves} from '../web/catalog.js';
import {intent,planTurn,readyTasks,equilibrium,tacticalDigest} from '../web/strategy.js';
import {makeSpec,worldLevel,encodeWorld,decodeWorld,verifyPlan,routeReachable} from '../web/worlds.js';
import {validateOrder,handleAPI} from '../server/pilot.js';
const packet=(level,text,tier='standard',done=[])=>({level,done,parsed:intent(text),tier,hero:'captain'});
const resolve=p=>planTurn(validateOrder(p));
test('every authored prompt is recognized and all campaign DAGs can be completed',()=>{
 for(const level of levels){const done=[];assert.ok(routeReachable(level));for(const [task] of level.tasks){
  assert.ok(readyTasks(level,done).includes(task),task);const answer=resolve(packet(level.id,moves[task].example,'standard',done));assert.deepEqual(answer.changes,[task]);done.push(...answer.changes);
 }assert.equal(readyTasks(level,done).length,0);}
});
test('an inverted chain, a question and a negated order cannot unlock a prerequisite',()=>{
 assert.deepEqual(resolve(packet('rift','Дочка, открой шлюз')).changes,[]);
 for(const t of ['Робот, не закрепляй мост','Робот, зачем закрепить мост?','Робот, привет!','закрепи мост'])assert.deepEqual(resolve(packet('dock',t)).changes,[]);
});
test('two independent branches join in one compound command and other agents reply',()=>{
 const result=resolve(packet('rift','Самолетик, найди частоту, затем Ассистентка, подай питание, потом Дочка, введи код в шлюз, чтобы пройти.','genius'));
 assert.deepEqual(result.changes,['scan','power','gate']);assert.equal(result.chain,1);assert.equal(result.score,3);assert.equal(result.cost,15);
 assert.deepEqual(new Set(result.lines.filter(l=>l.who!=='tvijo').map(l=>l.who)),new Set(heroOrder));
});
test('minimax value is bounded from both sides, including pure and degenerate cases',()=>{
 for(const m of [[[1,-1],[-1,1]],[[2,2],[2,2]],[[4,4],[3,3]],[[1,5],[8,-2]],[[0,3],[1,2]]]){
 const {route:p,field:q,value:v}=equilibrium(m),[[a,b],[c,d]]=m;assert.ok(p>=0&&p<=1&&q>=0&&q<=1);
 assert.ok(Math.abs(Math.min(p*a+(1-p)*c,p*b+(1-p)*d)-v)<1e-9);assert.ok(Math.abs(Math.max(q*a+(1-q)*b,q*c+(1-q)*d)-v)<1e-9);}
});
test('digest after five attempts changes the next contextual hint',()=>{
 const history=[[false,['gate']],[false,['scan']],[true,['power']],[false,['scan']],[true,['scan']]].map(([ok,targets])=>({ok,targets}));
 const d=tacticalDigest(levels[1],[],history);assert.equal(d.blocks,3);assert.equal(d.focus,'scan');const data=validateOrder({...packet('rift','Как пройти дальше?'),feedback:{blocks:d.blocks,focus:d.focus}});
 assert.match(planTurn(data).lines.at(-1).text,/В прошлых пяти приказах 3/);
});
test('room seed, obstacles and scenery reflect the idea, the shared code is bounded',()=>{
 const sample=makeSpec('Лавовая пещера, три платформы, Робот строит мост без ловушек');assert.equal(sample.steps,3);assert.equal(sample.theme,'lava');assert.equal(sample.path,'build');assert.equal(sample.shadow,false);assert.deepEqual(decodeWorld(encodeWorld(sample)),sample);assert.equal(decodeWorld('javascript:alert(1)'),null);assert.equal(decodeWorld('lava.build.9999999.3.1'),null);
 assert.equal(verifyPlan([['power',['gate']],['gate',['power']]]),false);
 for(const theme of ['sun','rift','lava','beacon'])for(const path of ['build','rescue','survey','signal'])for(const steps of [2,3,4])for(const seed of [0,1,7,256,65537,0xffffffff])assert.ok(routeReachable(worldLevel({theme,path,steps,seed,shadow:true})));
});
test('the public endpoint rejects out-of-order claimed state and unrelated input',async()=>{
 const bad={...packet('rift','Дочка, открой шлюз'),done:['gate']};assert.equal(validateOrder(bad),null);assert.equal(validateOrder({...packet('dock','Робот, закрепи мост'),text:'freeform'}),null);
 const post=(p,h)=>new Request('https://test.local/api/herdr/turn',{method:'POST',body:JSON.stringify(p),headers:{'Content-Type':'application/json',...h}});
 assert.equal((await handleAPI(post(bad),{})).status,422);assert.equal((await handleAPI(post(packet('dock','Робот, закрепи мост'),{Origin:'https://other.local'}),{})).status,403);
 const ok=await (await handleAPI(post(packet('dock','Робот, закрепи мост')),{})).json();assert.equal(ok.real_charge,0);assert.equal(ok.tokens_spent,0);
});
test('pilot events are deduplicated and private per cookie, without transcript storage',async()=>{
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_crew_pilot.sql',import.meta.url),'utf8'));
 const DB={prepare(sql){return {bind(...v){return {run:async()=>db.prepare(sql).run(...v),all:async()=>({results:db.prepare(sql).all(...v)})};}};}};
 const post=(body,cookie)=>handleAPI(new Request('https://test.local/api/herdr/event',{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)}),{DB});const first=await post({event:'mic_click',seconds:14});const cookie=first.headers.get('Set-Cookie').split(';')[0];await post({event:'mic_click',seconds:19},cookie);
 const r=await handleAPI(new Request('https://test.local/api/herdr/parent-report/me',{headers:{Cookie:cookie}}),{DB});assert.deepEqual((await r.json()).first_events,[{event:'mic_click',seconds:14}]);
 assert.deepEqual((await (await handleAPI(new Request('https://test.local/api/herdr/parent-report/me'),{DB})).json()).first_events,[]);
 assert.equal((await post({event:'mic_click',seconds:14,text:'extra'},cookie)).status,422);db.close();
});
