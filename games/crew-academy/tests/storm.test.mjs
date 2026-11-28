import assert from 'node:assert/strict';
import test from 'node:test';
import {freshStorm, restoreStorm, stepStorm, sceneIndex, waveColumn, HOME, DRONE}
  from '../web/storm/rules.js';
import {riftRooms, stationRooms, collectPrize, packNames} from '../web/expedition/rooms.js';

const apply = (state, scene, ...actions) => actions.reduce((current, action) => stepStorm(current,scene,action).state,state);
const rescueManeuvers = ['wait-wave','right','right','up','up','up','right','attach','wait-wave',
  'left','down','down','down','wait-wave','left','left','return'];
const saved = state => restoreStorm(JSON.parse(JSON.stringify(state)));

function supply(reserve) {
  const signal = apply(freshStorm(),'signal','scout','robot','band-42','lock');
  return apply(signal,'power','add-shield','add-shield','add-drive','add-winch','add-'+reserve,'commit');
}

test('two independent clues disambiguate the correct distress channel and gate later scenes', () => {
  let state = freshStorm();
  assert.equal(sceneIndex(state,'docking'),0);
  assert.equal(stepStorm(state,'rescue','return').state,state);
  state = apply(state,'signal','band-42','scout','lock');
  assert.equal(state.stage,0);
  state = apply(state,'signal','robot','band-61','lock');
  assert.equal(state.stage,0);
  state = apply(saved(state),'signal','band-42','lock');
  assert.equal(state.stage,1);
  assert.equal(sceneIndex(state,'signal'),0);
  assert.equal(sceneIndex(state,'journal'),1);
});

test('the station spends exactly five cells and can move a cell between systems before launch', () => {
  let state = apply(freshStorm(),'signal','scout','robot','band-42','lock');
  state = apply(state,'power','add-shield','add-shield','add-shield','add-shield','add-shield','add-drive','commit');
  assert.deepEqual(state.power,[5,0,0]);
  assert.equal(state.stage,1);
  state = apply(state,'power','sub-shield','sub-shield','add-drive','add-winch','commit');
  assert.deepEqual(state.power,[3,1,1]);
  assert.equal(state.stage,2);
  assert.equal(state.rescue.shield,1);
});

test('a predicted wave returns the pilot to the anchor or consumes the optional shield once', () => {
  assert.equal(waveColumn(0),2);
  const basic = apply(supply('drive'),'rescue','right');
  assert.equal(basic.rescue.cell,HOME);
  assert.equal(basic.rescue.hits,1);
  assert.equal(basic.rescue.turn,1);
  const protectedPilot = apply(supply('shield'),'rescue','right');
  assert.equal(protectedPilot.rescue.cell,HOME+1);
  assert.equal(protectedPilot.rescue.shield,0);
  assert.equal(protectedPilot.rescue.hits,0);
  assert.equal(saved(protectedPilot).rescue.cell,HOME+1);
});

test('an improved winch can tether the drone before stepping onto its exposed tile', () => {
  const path = ['wait-wave','right','right','up','up','up'];
  const withWinch = apply(supply('winch'),'rescue',...path,'attach');
  const withoutWinch = apply(supply('shield'),'rescue',...path,'attach');
  assert.equal(withWinch.rescue.cell,DRONE-1);
  assert.equal(withWinch.rescue.tether,true);
  assert.equal(withoutWinch.rescue.tether,false);
  assert.equal(saved(withWinch).rescue.tether,true);
});

for (const reserve of ['shield','drive','winch']) {
  test('full rescue and docking can be finished and restored with the ' + reserve + ' reserve', () => {
    let state = supply(reserve);
    state = apply(state,'rescue',...rescueManeuvers.slice(0,8));
    assert.equal(state.rescue.tether,true);
    assert.equal(state.rescue.cell,DRONE);
    state = apply(saved(state),'rescue',...rescueManeuvers.slice(8));
    assert.equal(state.stage,3);
    assert.equal(state.rescue.cell,HOME);
    state = apply(state,'docking','align-right','approach','approach','approach','dock');
    assert.equal(state.stage,3);
    assert.equal(state.docking.retries,1);
    assert.equal(state.docking.range,reserve==='drive'?1:2);
    state = apply(saved(state),'docking',reserve==='drive'?'coast':'approach','dock');
    assert.equal(state.stage,4);
    assert.equal(saved(state).stage,4);
    assert.equal(sceneIndex(state,'journal'),4);
  });
}

test('an incomplete save cannot earn a reward and the final badge joins the previous eight exactly once', () => {
  const incomplete = supply('drive');
  assert.equal(restoreStorm({...incomplete,stage:4}).stage,0);
  assert.equal(restoreStorm({...incomplete,power:Array(3)}).stage,0);
  const prior = [...riftRooms,...stationRooms].map(room => room.id);
  const profile = {balance:32, expeditionRewards:prior};
  assert(collectPrize(profile,'orbital-storm'));
  assert(!collectPrize(profile,'orbital-storm'));
  assert.deepEqual(profile.expeditionRewards,[...prior,'orbital-storm']);
  assert.equal(packNames(profile).at(-1),'Знак спасения Светляка');
  assert.equal(packNames(profile).length,9);
  assert.equal(profile.balance,32);
});
