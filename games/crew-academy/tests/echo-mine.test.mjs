import test from 'node:test';
import assert from 'node:assert/strict';
import {mineAction,freshMine,restoreMine,mineReport} from '../web/echo/rules.js';
import {applyMineAction} from '../web/echo/progress.js';
import {nextRoute} from '../web/crewRoute.js';
import {freshStorm,stepStorm} from '../web/storm/rules.js';
import {levels} from '../web/catalog.js';

const actions=(s,...steps)=>steps.reduce(mineAction,s);
const profile=(completed=[])=>({balance:24,level:'dock',completed:[...completed],stages:{},tallies:{verified:4},expeditionRewards:['alphabet']});
const track=()=>actions(freshMine(),'plane','blue','cart');
const free=()=>actions(track(),'chute','switch','run');
const returnBy=tool=>tool==='rope'?['rope','cross','right','right','use','left','left','cross','use']:
  ['plank','right','right','right','use','left','left','left','left','use'];

test('two independent clues resolve in either order, an early or false guess keeps the player in the mine',()=>{
  for(const pair of [['blue','plane'],['plane','blue']]){
    const observed=actions(freshMine(),pair[0],'cart',pair[0]);assert.equal(observed.phase,0);assert.deepEqual(observed.heard,[pair[0]]);
    const miss=actions(observed,pair[1],'ore');assert.equal(miss.ore,1);assert.equal(miss.last,'ore');
    const hit=mineAction(miss,'cart');assert.equal(hit.phase,1);assert.equal(mineReport(hit).first,pair[0]);
  }
});
test('ball hits the bin or buffer and reaches the siding only when both controls are aligned',()=>{
  const first=actions(track(),'run');assert.equal(first.last,'spill');
  const second=actions(first,'chute','run');assert.equal(second.last,'bump');
  const third=actions(second,'switch','run');assert.deepEqual([third.phase,third.tries,third.last],[2,3,'released']);
  assert.equal(actions(track(),'switch','chute','run').phase,2);
});
test('both rescue routes survive loss of the page after every move',()=>{
  for(const tool of ['rope','plank']){
    let s=free();
    for(const action of returnBy(tool))s=restoreMine(JSON.parse(JSON.stringify(mineAction(s,action))));
    assert.equal(s.phase,3);assert.equal(s.pos,0);assert.equal(s.tool,tool);
    assert.equal(mineAction(s,'use'),s);
  }
});
test('jumping with a load is blocked and the crew can construct a crossing on the far bank',()=>{
  let s=actions(free(),'right');assert.equal(s.pos,1);
  s=actions(s,'cross','right','right','use','left','left','cross');assert.equal(s.last,'load');assert.equal(s.pos,2);
  s=actions(s,'rope','cross','use');assert.equal(s.phase,3);
});
test('fresh, corrupted and older saves lead to playable states',()=>{
  for(const bad of [null,{}, {...freshMine(),phase:-1},{...freshMine(),phase:3},{...freshMine(),pos:99}])
    assert.deepEqual(restoreMine(bad),freshMine());
  const clean=profile();
  assert.equal(nextRoute(clean,null,null).href,'./first-shift.html');
  assert.equal(nextRoute(profile(['dock']),null,null).href,'#mission/rift');
  assert.equal(nextRoute(profile(levels.map(l=>l.id)),null,null).href,'./echo-mine.html');
});
test('HQ resumes the active side route, restores old storm saves and advances beyond a claimed room',()=>{
  const p=profile(['dock','rift']);p.echoMine=actions(freshMine(),'blue');
  const orbit=stepStorm(freshStorm(),'signal','scout').state;
  assert.equal(nextRoute(p,{kind:'echo'},orbit).action,'Продолжить спасение');
  assert.equal(nextRoute(p,{kind:'storm'},orbit).href,'./storm.html#signal');
  assert.equal(nextRoute(p,{kind:'room',id:'cargo'},orbit).href,'./expedition.html#cargo');
  assert.notEqual(nextRoute(p,{kind:'room',id:'alphabet'},orbit).href,'./expedition.html#alphabet');
  assert.equal(nextRoute(profile(['dock']),null,orbit).kind,'storm');
});
test('optional early rescue preserves campaign gates and balance; qualified completion is atomic and replay awards once',()=>{
  for(const cleared of [[],['dock','rift']]){
    const p=profile(cleared);p.stages.mine={sparks:[2],done:[],turns:0};
    const sequence=['blue','plane','cart','switch','chute','run',...returnBy('plank')];
    let result;
    for(const command of sequence)result=applyMineAction(p,command,123);
    assert.equal(result.firstPrize,true);assert.equal(p.balance,24);assert.equal(p.tallies.verified,5);
    assert.equal(p.completed.includes('mine'),cleared.includes('rift'));
    assert.equal(p.echoMineReport.at,123);assert.equal(p.echoMineReport.tool,'plank');
    assert.equal(applyMineAction(p,'use',124),null);
    applyMineAction(p,'restart',125);assert.equal(p.echoMineReport.at,123);
    for(const command of sequence)result=applyMineAction(p,command,126);
    assert.deepEqual(p.expeditionRewards,['alphabet','echo-mine']);assert.equal(result.firstPrize,false);assert.deepEqual(p.stages.mine.sparks,[2]);
    assert.equal(p.completed.filter(id=>id==='mine').length,cleared.includes('rift')?1:0);
  }
});
test('campaign can be continued after a prior side rescue or a partially completed classic mine',()=>{
  const p=profile(['dock','rift']);p.level='mine';p.stages.mine={done:['scan']};
  assert.equal(nextRoute(p,{kind:'campaign',id:'mine'},null).href,'#mission/mine');
  delete p.stages.mine;p.echoMine=actions(free(),...returnBy('rope'));
  assert.equal(nextRoute(p,null,null).href,'#mission/mine');
});
