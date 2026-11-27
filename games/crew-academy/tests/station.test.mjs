import assert from 'node:assert/strict';
import test from 'node:test';
import {freshMirrors, stepMirrors, traceMirrors, restoreMirrors, freshArchive, stepArchive, restoreArchive}
  from '../web/expedition/station.js';
import {rooms, riftRooms, stationRooms, roomById, roomHref, collectPrize, packNames}
  from '../web/expedition/rooms.js';

const openArchive = ['up', 'phase', 'left', 'up', 'up', 'right', 'phase', 'up'];
const fromSave = state => JSON.parse(JSON.stringify(state));

test('the ray lights the receiver in exactly one of the eight possible arrangements', () => {
  const solutions = [];
  for (let mask = 0; mask < 8; mask++) {
    const angles = [mask & 1, (mask >> 1) & 1, (mask >> 2) & 1];
    const trace = traceMirrors(angles);
    assert.equal(trace.beams.length, 25);
    if (trace.reaches) solutions.push(angles);
  }
  assert.deepEqual(solutions, [[0, 0, 1]]);
});

test('the mirror room needs power and a valid beam to collect its prize after a reload', () => {
  let state = freshMirrors();
  assert.equal(stepMirrors(state, 'take').state, state);
  state = stepMirrors(state, 'power').state;
  state = stepMirrors(state, 0).state;
  state = stepMirrors(state, 1).state;
  state = restoreMirrors(fromSave(state));
  assert.equal(stepMirrors(state, 'take').state, state);
  state = stepMirrors(state, 2).state;
  state = stepMirrors(state, 'take').state;
  assert.equal(restoreMirrors(fromSave(state)).done, true);
  assert.equal(restoreMirrors({...state, powered: false}), null);
  assert.equal(restoreMirrors({...state, angles: Array(3)}), null);
});

test('the archive route uses the past path and present gate with the seal saved between them', () => {
  let state = freshArchive();
  assert.equal(stepArchive(state, 'phase').state, state);
  state = stepArchive(state, 'up').state;
  assert.equal(stepArchive(state, 'left').state, state);
  for (const action of openArchive.slice(1, 6)) state = stepArchive(state, action).state;
  assert.equal(state.era, 'past');
  assert.equal(state.seal, true);
  assert.equal(stepArchive(state, 'up').state, state);
  state = restoreArchive(fromSave(state));
  for (const action of openArchive.slice(6)) state = stepArchive(state, action).state;
  assert.deepEqual(state, {cell: 2, era: 'now', seal: true, done: true});
  assert.equal(restoreArchive({...state, seal: false}), null);
});

test('the station connects both rooms and awards two finds alongside the six existing ones', () => {
  const [mirrors, archive] = stationRooms;
  assert.equal(roomById(mirrors.next), archive);
  assert.equal(roomHref(archive.id), './expedition.html#time-archive');
  assert.equal(new Set(rooms.map(room => room.id)).size, 8);
  const save = {expeditionRewards: riftRooms.map(room => room.id), completed: ['dock'], balance: 27};
  assert.equal(collectPrize(save, mirrors.id), true);
  assert.equal(collectPrize(save, archive.id), true);
  assert.equal(collectPrize(save, archive.id), false);
  assert.deepEqual(packNames(save).slice(-2), ['Призма станции', 'Печать времени']);
  assert.equal(packNames(save).length, 8);
  assert.deepEqual(save.completed, ['dock']);
  assert.equal(save.balance, 27);
});
