import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFile} from 'node:fs/promises';
import {assembleCampaign} from '../tools/assemble-campaign.mjs';
import {chapterAction, clearedStops, finished, riverState, seaplaneRadio} from '../web/campaign/river-progress.js';
import {ending, scenes} from '../web/campaign/river-story.js';
import {power, wirePlan} from '../web/playground/wire.js';

test('the family travels through eight playable stops and awards every find once',()=>{
  const profile = {balance:100};
  let found = 0;
  function act(type, payload={}) {
    const step = riverState(profile.riverChronicle).step;
    const result = chapterAction(profile,{type,step,...payload});
    if (result.found) found++;
    return result;
  }
  for (const [index,scene] of scenes.entries()) {
    assert.equal(riverState(profile.riverChronicle).step,index);
    let result;
    if (scene.kind==='inspect') result = act('inspect');
    if (scene.kind==='choice') {
      assert.equal(act('choose',{answer:'invalid'}).run.cleared,false);
      for (const answer of scene.answers) result = act('choose',{answer});
    }
    if (scene.kind==='wire') {
      for (const cell of wirePlan(seaplaneRadio,riverState(profile.riverChronicle).rotations)) {
        result = act('rotate',{cell});
      }
      assert.ok(power(seaplaneRadio,result.run.rotations).won);
    }
    if (scene.kind==='tracks') {
      assert.equal(act('ride').run.cleared,false);
      act('switch',{index:0});
      assert.equal(act('ride').run.cleared,false);
      act('switch',{index:1});
      result = act('ride');
    }
    assert.equal(result.found,scene);
    assert.equal(clearedStops(riverState(profile.riverChronicle)),index+1);
    assert.equal(act('inspect').found,undefined);
    assert.deepEqual(riverState(JSON.parse(JSON.stringify(result.run))),result.run);
    act('next');
  }
  assert.equal(found,8);
  assert.ok(finished(riverState(profile.riverChronicle)));
  assert.equal(profile.balance,100);
  assert.equal(ending.length,3);
});

test('invalid moves leave the route intact and saves retain partial puzzles',()=>{
  const profile = {riverChronicle:{v:1,step:4}};
  const act = (type,payload={})=>chapterAction(profile,{type,step:4,...payload});
  assert.equal(act('next').run.step,4);
  assert.equal(act('choose',{step:2,answer:'reeds'}).run.choiceCount,0);
  assert.equal(act('choose',{answer:'reeds'}).run.choiceCount,1);
  profile.riverChronicle = JSON.parse(JSON.stringify(profile.riverChronicle));
  assert.equal(act('choose',{answer:'rocks'}).run.choiceCount,1);
  assert.equal(act('choose',{answer:'amber'}).run.cleared,true);
  assert.equal(riverState({v:1,step:6,cleared:true,tracks:['star','stone']}).cleared,false);
  assert.equal(riverState({v:1,step:7,cleared:true,choiceCount:0}).cleared,false);
});

test('the campaign bundles the same workshop and five-game views into the document',async()=>{
  const root = new URL('../web/',import.meta.url);
  const [page,clockwork,playground] = await Promise.all(['chronicles','clockwork','playground'].map(name=>readFile(new URL(name+'.html',root),'utf8')));
  const document = assembleCampaign(page,{clockwork,playground});
  const identifiers = [...document.matchAll(/ id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(identifiers).size,identifiers.length);
  assert.ok(!document.includes('<iframe'));
  assert.equal([...document.matchAll(/<main(?:\s|>)/g)].length,1);
  for (const id of ['ch-game','camp-journey','cw-canvas','pg-board','camp-notes']) assert.ok(identifiers.includes(id));
  assert.ok(document.includes('href="#training"'));
  assert.ok(!document.includes('campaign:clockwork'));
});
