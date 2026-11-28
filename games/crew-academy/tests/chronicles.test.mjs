import test from 'node:test';
import assert from 'node:assert/strict';
import {validPixelAvatar} from '../web/crewLabels.js';
import {adventure,chapters,eras,signs} from '../web/chronicles/episodes.js';
import {avatarPixels,generateAvatar} from '../web/chronicles/avatar.js';
import {applyChronicles,current,model,movieUnlocked} from '../web/chronicles/progress.js';

function runChapter(profile,actions,seed) {
  let change;
  for (const action of actions) change=applyChronicles(profile,action,seed);
  const {episode,run}=current(change.state);
  assert.equal(run.step,episode.steps.length);
  assert.equal(change.completed,episode.name);
}

const role=id=>({type:'role',id});
const visit=era=>({type:'visit',era});
const work=(object,sign)=>({type:'work',object,sign});

test('the first cartoon requires both siblings and a return from the future',()=>{
  const profile={balance:0};
  assert.equal(movieUnlocked(model(), 'origin'),false);
  assert.equal(applyChronicles(profile,visit('canopy')).state.runs.origin.era,'palace');
  assert.equal(applyChronicles(profile,work('clock')).state.runs.origin.step,0);
  applyChronicles(profile,work('chart'));
  assert.equal(applyChronicles(profile,work('clock')).state.runs.origin.step,1);
  for (const action of [role('engineer'),work('clock'),visit('harbor'),work('lantern'),role('reader'),work('lens','star')])
    applyChronicles(profile,action);
  assert.equal(profile.chronicles.runs.origin.step,3);
  assert.equal(movieUnlocked(profile.chronicles,'origin'),false);
  assert.deepEqual(current(model(profile.chronicles)).pocket,['Карта с луной','Лунный фонарь']);
  runChapter(profile,[work('lens','moon'),visit('canopy'),work('archive'),visit('palace'),role('engineer'),work('clock')]);
  assert.equal(movieUnlocked(model(JSON.parse(JSON.stringify(profile.chronicles))),'origin'),true);
  assert.equal(movieUnlocked(profile.chronicles,'bridge'),false);
  assert.equal(profile.balance,0);
});

test('the bridge can be played first, while its film and save are independent',()=>{
  const profile={balance:12};
  runChapter(profile,[{type:'chapter',id:'bridge'},work('archive'),visit('harbor'),
    role('engineer'),work('crank'),visit('canopy'),role('reader'),work('receiver','star'),role('engineer'),work('gate')]);
  assert.equal(movieUnlocked(profile.chronicles,'bridge'),true);
  applyChronicles(profile,{type:'chapter',id:'origin'});
  assert.equal(current(profile.chronicles).run.step,0);
  assert.equal(profile.balance,12);
});

test('generated expeditions retain the seed, add a second clue, and are solvable for each era',()=>{
  for (const era of Object.keys(eras)) {
    for (let i=0;i<24;i++) {
      const seed=(i*31966377)>>>0, profile={balance:3};
      const action={type:'assemble',era};
      applyChronicles(profile,action,seed);
      const original=model(profile.chronicles).generated;
      applyChronicles(profile,action,123);
      assert.deepEqual(model(profile.chronicles).generated,original);
      for (let number=1;number<=2;number++) {
        const run=model(JSON.parse(JSON.stringify(profile.chronicles))).generated;
        assert.equal(run.number,number);
        const {steps}=adventure(run);
        assert.equal(steps.length,number===1?3:5);
        assert.notEqual(steps[0].era,steps[1].era);
        const clues=steps.filter(task=>task.sign);
        assert.equal(new Set(clues.map(task=>task.sign)).size,number);
        for (const task of steps) {
          assert.ok(task.object in eras[task.era].objects);
          assert.ok(!task.sign||task.sign in signs);
        }
        runChapter(profile,steps.flatMap(task=>[visit(task.era),role(task.role),work(task.object,task.sign)]));
        assert.equal(profile.balance,3);
        applyChronicles(profile,action,seed+71);
      }
    }
  }
});

test('a saved custom hero keeps a valid local portrait and stale work cannot finish another chapter',()=>{
  const profile={};
  const avatar=generateAvatar(123456);
  assert.equal(validPixelAvatar(avatarPixels(avatar)),true);
  applyChronicles(profile,{type:'cast',id:'custom',avatar});
  const restored=model(JSON.parse(JSON.stringify(profile.chronicles)));
  assert.deepEqual(restored.avatar,avatar);
  assert.equal(restored.role,avatar.role);
  assert.equal(restored.cast,'custom');
  applyChronicles(profile,{type:'chapter',id:'bridge'});
  const stale=applyChronicles(profile,{...work('archive'),chapter:'origin',step:0});
  assert.equal(stale.state.runs.bridge.step,0);
  applyChronicles(profile,{type:'cast',id:'family'});
  assert.equal(profile.chronicles.cast,'family');
  assert.deepEqual(profile.chronicles.avatar,avatar);
  assert.equal(chapters.origin.film.length,4);
});
