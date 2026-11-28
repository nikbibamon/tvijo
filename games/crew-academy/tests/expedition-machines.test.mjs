import assert from "node:assert/strict";
import test from "node:test";
import {advanceConvoy, chainOutcome, newConvoy} from "../web/expedition/machines.js";

test("the ball reaches the lamp only through the chute and the contact", () => {
  assert.equal(chainOutcome({ramp:false, contact:false}), "trap");
  assert.equal(chainOutcome({ramp:false, contact:true}), "trap");
  assert.equal(chainOutcome({ramp:true, contact:false}), "gap");
  assert.equal(chainOutcome({ramp:true, contact:true}), "won");
});

function ticks(board, turns) {
  for (let turn = 0; turn < turns; turn++) board = advanceConvoy(board);
  return board;
}

test("every distinct pair of operators can escort all five drones", () => {
  for (let builder=0; builder<5; builder++) {
    for (let signaller=0; signaller<5; signaller++) {
      if (builder === signaller) continue;
      const initial = {...newConvoy(), builder, signaller};
      const result = ticks(initial, 12);
      assert.deepEqual(result.positions, [8,8,8,8,8], `crew ${builder}/${signaller}`);
      assert.equal(result.bridge, true);
      assert.equal(result.routed, true);
      assert.deepEqual(initial.positions, [0,-1,-2,-3,-4]);
    }
  }
});

test("a stopped convoy resumes from either missing mechanism", () => {
  const atRift = ticks(newConvoy(), 15);
  assert.deepEqual(atRift.positions, [2,2,2,2,2]);
  const atSwitch = ticks({...atRift, builder:4}, 15);
  assert.deepEqual(atSwitch.positions, [5,5,5,5,5]);
  const through = ticks({...atSwitch, signaller:0}, 3);
  assert.deepEqual(through.positions, [8,8,8,8,8]);
});
