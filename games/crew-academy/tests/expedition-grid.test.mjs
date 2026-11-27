import assert from "node:assert/strict";
import test from "node:test";
import { advanceCargo, advancePulse, initialCargo, initialPulse, pulseZone } from "../web/expedition/grid.js";

const follow = (step, state, actions) => actions.reduce((s, a) => step(s, a).state, state);
const cargoPath = ["up", "up", "left", "up", "right"];
const mineApproach = ["up", "up", "place"];
const mineRetreat = ["left", "down"];
const mineExit = ["right", "up", "up", "up"];

test("Склад имеет решение в пять ходов с двумя толчками по разным осям", () => {
  const final = follow(advanceCargo, initialCargo(), cargoPath);
  assert.deepEqual(final, { player: 7, box: 8, moves: 5, done: true });
  assert.equal(advanceCargo(final, "left").state, final);
  const reached = new Set();
  const pending = [initialCargo()];
  let shortest;
  for (let i = 0; i < pending.length; i++) {
    const state = pending[i];
    const key = state.player + ":" + state.box;
    if (reached.has(key)) continue;
    reached.add(key);
    if (state.done) { shortest = state.moves; break; }
    for (const d of ["up", "right", "down", "left"]) pending.push(advanceCargo(state, d).state);
  }
  assert.equal(shortest, 5);
});

test("Склад учитывает стены, край карты и свободную клетку позади ячейки", () => {
  const start = initialCargo();
  assert.equal(advanceCargo(start, "right").state, start);
  const atEdge = { ...start, player: 10 };
  assert.equal(advanceCargo(atEdge, "left").state, atEdge);
  const jammed = { ...start, player: 12, box: 7 };
  assert.equal(advanceCargo(jammed, "up").state, jammed);
});

test("Шахта показывает область до включения; тратит ровно два допустимых хода", () => {
  assert.deepEqual(new Set(pulseZone(12)), new Set([12, 7, 11, 13, 17]));
  const starting = follow(advancePulse, initialPulse(), mineApproach);
  assert.equal(starting.marker, 12);
  assert.equal(starting.fuse, 2);
  assert.equal(advancePulse(starting, "up").state, starting);
  assert.equal(advancePulse(starting, "place").state, starting);
  const one = advancePulse(starting, "left").state;
  assert.equal(one.fuse, 1);
  const safe = advancePulse(JSON.parse(JSON.stringify(one)), "down").state;
  assert.equal(safe.opened, true);
  assert.equal(safe.marker, null);
  assert.equal(safe.done, false);
  const final = follow(advancePulse, safe, mineExit);
  assert.equal(final.done, true);
  assert.equal(final.player, 2);
});

test("Укрытие и положение маячка влияют на успех; обе ошибки исправимы", () => {
  const fromWrongPlace = follow(advancePulse, initialPulse(), ["place", "up", "up"]);
  assert.equal(fromWrongPlace.opened, false);
  const caught = follow(advancePulse, fromWrongPlace, ["place", "wait", "wait"]);
  assert.equal(caught.opened, false);
  assert.equal(caught.player, initialPulse().player);
  assert.equal(caught.fuse, 0);
  const final = follow(advancePulse, caught, [...mineApproach, ...mineRetreat, ...mineExit]);
  assert.equal(final.done, true);
});
