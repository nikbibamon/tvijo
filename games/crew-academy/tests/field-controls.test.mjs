import test from 'node:test';
import assert from 'node:assert/strict';
import {bindFieldPads} from '../web/fieldControls.js';
import {practiceState,practiceStep,relayStage} from '../web/relayMission.js';
import {layout} from '../web/worlds.js';
class Pad extends EventTarget{
 constructor(key){super();this.dataset={pad:key};const c=new Set();this.classList={add:s=>c.add(s),remove:s=>c.delete(s),contains:s=>c.has(s)};}
 fire(name,id){const e=new Event(name,{cancelable:true});Object.assign(e,{pointerId:id,button:0,detail:1});this.dispatchEvent(e);}
}
test('two independent thumbs keep running through jump, action, cancellation and blur reset',()=>{
 const pads=['left','right','jump','use'].map(k=>new Pad(k));let direction=[],jump=0,use=0;
 const original=globalThis.document;globalThis.document={querySelectorAll:()=>pads};
 try{
  const reset=bindFieldPads({movement:d=>direction=d,jump:()=>jump++,use:()=>use++});
  pads[1].fire('pointerdown',11);pads[2].fire('pointerdown',12);
  assert.deepEqual(direction,['right']);assert.equal(jump,1);pads[2].fire('pointerup',12);assert.deepEqual(direction,['right']);
  pads[3].fire('pointerdown',13);assert.equal(use,1);pads[3].fire('pointercancel',13);assert.deepEqual(direction,['right']);
  pads[1].fire('lostpointercapture',11);assert.deepEqual(direction,[]);pads[0].fire('pointerdown',22);reset();assert.deepEqual(direction,[]);
 }finally{globalThis.document=original;}
});
test('a practice transmission uses both separate full courses and exercises the same 3-symbol puzzle',()=>{
 let run=practiceState();assert.match(run.secret,/^[0-3]{3}$/);assert.equal(run.sequence,null);
 const scout=relayStage(run.role);assert.ok(layout(scout).goal>700);
 run=practiceStep(run,'scan');assert.equal(run.secret,run.sequence);run=practiceStep(run,'send');
 const engineer=relayStage(run.role);assert.notEqual(scout.art,engineer.art);assert.throws(()=>practiceStep(run,'tune','000'));
 assert.equal(practiceStep(run,'tune',run.secret).phase,'done');
});
