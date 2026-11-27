import test from 'node:test';
import assert from 'node:assert/strict';
import {rooms} from '../web/mailrun/scenes.js';
import {act, restore, resume, visit} from '../web/mailrun/progress.js';

test('twenty illustrated interactions survive reload, revisits, and a room replay', () => {
  let state = restore();
  assert.equal(rooms.length,5);
  assert.equal(visit(state,4), state);
  for (const [i, room] of rooms.entries()) {
    state = visit(state,i);
    assert.equal(room.steps.length,4);
    for (const [j, step] of room.steps.entries()) {
      assert.ok(step.items.find(item => item.id === step.use));
      for (const item of step.items) {
        assert.ok(item.x > 0 && item.x < 100 && item.y > 0 && item.y < 100);
        if (item.id !== step.use) {
          assert.ok(item.remark);
          assert.equal(act(state,room,item.id),state);
        }
      }
      state = act(state,room,step.use);
      assert.equal(state.progress,4*i+j+1);
      assert.deepEqual(restore(JSON.parse(JSON.stringify(state))),state);
      if (state.progress === 14) {
        state = visit(state,1);
        state = act(state,rooms[1],'give-sock');
        assert.equal(state.socks,true);
        assert.equal(act(state,rooms[1],'give-sock'),state);
        state = resume(state);
        assert.equal(state.room,3);
        assert.equal(state.step,2);
      }
    }
  }
  assert.deepEqual(resume(state),{room:4,step:4,progress:20,socks:true});
  let replay = visit(state,0,true);
  for (const step of rooms[0].steps) replay = act(replay,rooms[0],step.use);
  assert.equal(replay.progress,20);
  assert.equal(replay.socks,true);
  assert.equal(resume(replay).step,4);
});
