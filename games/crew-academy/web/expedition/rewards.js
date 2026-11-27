import {state, write, note} from '../tvijoService.js';
import {rooms, roomById, hasPrize, collectPrize} from './rooms.js';

const pendingKey = id => 'tvijo.expedition.prize.' + id;
const deliveries = new Map();

export function deliverPrize(id) {
  if (!roomById(id)) return Promise.resolve(false);
  if (deliveries.has(id)) return deliveries.get(id);
  const key = pendingKey(id);
  try { localStorage.setItem(key, '1'); } catch {}
  const op = write(profile => {
    if (!collectPrize(profile, id)) return false;
    note(profile, 'field', 'В рюкзаке — ' + roomById(id).prize + '. ' + roomById(id).name);
    return true;
  }).then(added => {
    try { localStorage.removeItem(key); } catch {}
    return added;
  }).finally(() => deliveries.delete(id));
  deliveries.set(id, op);
  return op;
}

export function recoverPrizes() {
  const pending = rooms.filter(room => {
    try { return localStorage.getItem(pendingKey(room.id)) === '1'; } catch { return false; }
  });
  return Promise.all(pending.map(room => deliverPrize(room.id)));
}

export const ownsPrize = id => hasPrize(state, id);
