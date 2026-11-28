import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {flight} from '../web/playground/flight.js';
import {traceMirrorPath} from '../web/expedition/mirror-path.js';
import {ducts,lighthouseAction,lighthouseAvailable,lighthouseStage,optics,restoreLighthouse} from '../web/campaign/lighthouse.js';
import {scenes} from '../web/campaign/river-story.js';

function profileAfterBowl() {
  return {balance:100,riverChronicle:{v:1,step:scenes.length-1,cleared:true,choiceCount:1}};
}
function send(profile,type,data={}) {
  const run = restoreLighthouse(profile.lighthouse);
  return lighthouseAction(profile,{type,era:run.era,stage:lighthouseStage(run),...data});
}
function fixGate(profile) {
  send(profile,'travel',{target:'past'});
  send(profile,'brace');
  send(profile,'travel',{target:'future'});
  return send(profile,'enter');
}
function finishFlight(profile) {
  const route = [
    'right','up','up','left','left','activate','right','right','down','down','left','left','left',
    'down','down','right','right','activate'
  ];
  for (const input of route) send(profile,'fly',{input});
  return restoreLighthouse(profile.lighthouse);
}

test('the Tide Bowl opens the time gate and only work in 1941 raises the hatch in 2041',()=>{
  const blocked = {};
  assert.equal(lighthouseAvailable(blocked),false);
  assert.equal(send(blocked,'travel',{target:'past'}).run.era,'future');
  assert.equal(blocked.lighthouse,undefined);
  const profile = profileAfterBowl();
  assert.equal(lighthouseAvailable(profile),true);
  assert.equal(send(profile,'brace').run.braced,false);
  assert.match(send(profile,'enter').message,/под водой/);
  assert.equal(send(profile,'travel',{target:'past'}).run.era,'past');
  assert.equal(send(profile,'enter').run.entered,false);
  const ready = send(profile,'brace');
  assert.equal(ready.run.braced,true);
  assert.ok(ready.journal);
  assert.equal(send(profile,'brace').journal,undefined);
  profile.lighthouse = JSON.parse(JSON.stringify(profile.lighthouse));
  assert.equal(send(profile,'travel',{target:'future',era:'future'}).run.era,'past');
  send(profile,'travel',{target:'future'});
  const found = send(profile,'enter');
  assert.equal(lighthouseStage(found.run),'flight');
  assert.match(found.journal,/Линза Мины/);
  assert.equal(send(profile,'enter').journal,undefined);
});

test('only the legless scout reaches both narrow shafts and a partial flight survives reload',()=>{
  const profile = profileAfterBowl();
  fixGate(profile);
  const plane = send(profile,'fly',{input:'right'}).run.plane;
  assert.equal(flight.move(ducts,plane,'up','captain').state,undefined);
  for (const input of ['up','up','left','left','activate']) send(profile,'fly',{input});
  const first = restoreLighthouse(profile.lighthouse);
  assert.equal(first.plane.lit.length,1);
  assert.equal(lighthouseStage(first),'flight');
  send(profile,'travel',{target:'past'});
  assert.deepEqual(send(profile,'fly',{input:'right'}).run.plane,first.plane);
  profile.lighthouse = JSON.parse(JSON.stringify(profile.lighthouse));
  send(profile,'travel',{target:'future'});
  for (const input of ['right','right','down','down','left','left','left','down','down','right','right','activate']) {
    send(profile,'fly',{input});
  }
  assert.equal(lighthouseStage(restoreLighthouse(profile.lighthouse)),'light');
});

test('four mirrors have one route to the receiver, and the ferry reward only enters the log once',()=>{
  const profile = profileAfterBowl();
  fixGate(profile);
  const open = finishFlight(profile);
  assert.equal(lighthouseStage(open),'light');
  const possibilities = Array.from({length:16},(_,mask)=>optics.mirrors.map((_,i)=>(mask>>i)&1));
  const solutions = possibilities.filter(angles=>traceMirrorPath(optics,angles).reaches);
  assert.deepEqual(solutions,[[0,0,1,1]]);
  assert.equal(send(profile,'signal').run.signaled,false);
  send(profile,'mirror',{index:0});
  send(profile,'mirror',{index:1});
  assert.equal(send(profile,'signal').run.signaled,false);
  profile.lighthouse = JSON.parse(JSON.stringify(profile.lighthouse));
  send(profile,'mirror',{index:2});
  const finish = send(profile,'signal');
  assert.equal(lighthouseStage(finish.run),'finish');
  assert.match(finish.journal,/Карта переправы/);
  assert.equal(send(profile,'signal').journal,undefined);
  assert.equal(profile.balance,100);
  assert.equal(restoreLighthouse({...finish.run,angles:[0,0,0,0]}).signaled,false);
});
