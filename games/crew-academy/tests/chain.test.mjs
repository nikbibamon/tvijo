import test from 'node:test';
import assert from 'node:assert/strict';
import {applyCircuit,ballAt,chainRun,circuitRoute,machine,trajectory} from '../web/chain/rules.js';

const play=(profile,station,...actions)=>actions.map(action=>applyCircuit(profile,station,action,null,27)).at(-1);

test('track and contact send the ball to distinct visible endpoints',()=>{
  const closed={guide:false,lever:false,branch:'lamp'};
  for(const [run,outcome,end] of [
    [closed,'pocket',machine.pocket.at(-1)],
    [{...closed,guide:true},'gap',machine.gap.at(-1)],
    [{...closed,guide:true,lever:true},'lamp',machine.lamp.at(-1)],
    [{guide:true,lever:true,branch:'pump'},'pump',machine.pump.at(-1)]
  ]){
    const shot=trajectory('pump',run);
    assert.equal(shot.outcome,outcome);
    assert.deepEqual(ballAt(shot.path,0),machine.feed[0]);
    assert.deepEqual(ballAt(shot.path,1),end);
  }
});

test('a missed ball and the previous setup survive reload, then both stations award once',()=>{
  let profile={expeditionRewards:[]};
  assert.equal(play(profile,'pump','open'),null);
  assert.equal(play(profile,'lamp','open','launch').shot.outcome,'pocket');
  profile=JSON.parse(JSON.stringify(profile));
  assert.equal(chainRun(profile,'lamp').last,'pocket');
  assert.equal(play(profile,'lamp','guide'),null);
  assert.equal(play(profile,'lamp','return','guide','launch').shot.outcome,'gap');
  assert.equal(play(profile,'lamp','return','lever','launch').report.launches,3);
  assert.equal(circuitRoute(profile).href,'./expedition.html#chain/pump');
  const starting=play(profile,'pump','open').run;
  assert.equal(starting.branch,'lamp');
  assert.equal(play(profile,'pump','launch').shot.outcome,'lamp');
  assert.equal(play(profile,'pump','return','branch','launch').report.launches,2);
  assert.deepEqual(profile.expeditionRewards,['chain','chain-pump']);
  assert.equal(play(profile,'pump','launch'),null);
  play(profile,'pump','replay','branch','launch');
  assert.deepEqual(profile.expeditionRewards,['chain','chain-pump']);
  assert.equal(circuitRoute(profile),null);
});

test('installation keeps a previous successful lamp and restores an old unfinished configuration',()=>{
  const profile={expeditionRewards:[]};
  const old={board:{ramp:true,contact:true,result:'won'},rewarded:true};
  assert.equal(applyCircuit(profile,'lamp','open',old,42).run.solved,true);
  assert.deepEqual(profile.expeditionRewards,['chain']);
  assert.equal(profile.chainReports,undefined);
  const partial=chainRun({},'lamp',{board:{ramp:true,contact:false,result:'gap'}});
  assert.equal(partial.guide,true);
  assert.equal(partial.lever,false);
});
