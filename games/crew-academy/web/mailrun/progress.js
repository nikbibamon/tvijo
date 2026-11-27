export const roomCount = 5;
export const stepsPerRoom = 4;
const total = roomCount * stepsPerRoom;
const integer = (v, max) => Number.isInteger(v) ? Math.max(0, Math.min(v, max)) : 0;

export function restore(raw = {}) {
  const progress = integer(raw?.progress, total);
  const room = Math.min(integer(raw?.room, roomCount - 1), Math.floor(progress / stepsPerRoom));
  const step = Math.min(integer(raw?.step, stepsPerRoom), progress - room * stepsPerRoom);
  return {progress, room, step, socks: progress >= 14 && raw?.socks === true};
}

export function visit(state, room, replay = false) {
  if (!Number.isInteger(room) || room < 0 || room >= roomCount || room * stepsPerRoom > state.progress) return state;
  return {...state, room, step: replay ? 0 : Math.min(stepsPerRoom, state.progress - room * stepsPerRoom)};
}

export function act(state, scene, id) {
  if (scene.art === 'laundry' && state.room === 1 && state.step === 4 && state.progress >= 14 && id === 'give-sock' && !state.socks) {
    return {...state, socks: true};
  }
  if (scene.steps[state.step]?.use !== id || state.step >= stepsPerRoom) return state;
  const step = state.step + 1;
  return {...state, step, progress: Math.max(state.progress, state.room * stepsPerRoom + step)};
}

export function resume(state) {
  return visit(state, Math.min(roomCount - 1, Math.floor(state.progress / stepsPerRoom)));
}
