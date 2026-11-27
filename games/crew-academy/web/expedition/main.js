import {state, bus} from '../tvijoService.js';
import {rooms, roomById, roomHref, packNames} from './rooms.js';
import {deliverPrize, recoverPrizes, ownsPrize} from './rewards.js';
import {mountAlphabet} from './beacon.js';
import {mountCargo, mountPulse} from './grid.js';
import {mountChain, mountDrones} from './machines.js';
import {mountRadio} from './radio.js';

const scenes = {alphabet:mountAlphabet, cargo:mountCargo, chain:mountChain, drones:mountDrones, pulse:mountPulse, radio:mountRadio};
const $ = id => document.getElementById(id);
const memory = new Map();
let current = null;
let release = null;
let transition = Promise.resolve();
function saved(id) {
  try { return JSON.parse(localStorage.getItem('tvijo.expedition.room.v1.' + id)) ?? memory.get(id) ?? null; }
  catch { return memory.get(id) ?? null; }
}
function keep(id, record) {
  memory.set(id, record);
  try { localStorage.setItem('tvijo.expedition.room.v1.' + id, JSON.stringify(record)); } catch {}
}
function node(tag, cls, text) {
  const item = document.createElement(tag);
  if (cls) item.className = cls;
  if (text) item.textContent = text;
  return item;
}
function inventory() {
  const names = packNames(state);
  $('hub-score').textContent = 'Находки · ' + names.length + ' / ' + rooms.length;
  $('hub-pack').textContent = names.length ? 'В рюкзаке — ' + names.join(', ') + '.' : '';
  if (current) {
    const obtained = ownsPrize(current.id);
    $('obtained').hidden = !obtained;
    $('obtained').textContent = obtained ? 'В рюкзаке · ' + current.prize : '';
    $('prize-strip').hidden = !obtained;
    $('prize-name').textContent = current.prize;
  }
  for (const item of document.querySelectorAll('.room-tile')) {
    const def = roomById(item.dataset.room);
    item.querySelector('.tile-prize').textContent = ownsPrize(def.id) ? 'Получено · ' + def.prize : def.prize;
  }
}
function showHub() {
  $('hub').hidden = false; $('room').hidden = true;
  document.title = 'Кристальный разлом · Академия экипажа';
  $('rooms').replaceChildren(...rooms.map(def => {
    const tile = node('a','room-tile'); tile.href = roomHref(def.id); tile.dataset.room=def.id;
    const art = node('img'); art.src = def.art; art.alt = '';
    const copy = node('div','tile-copy');
    copy.append(node('h3','',def.name),node('p','',def.task),node('span','tile-prize',def.prize));
    tile.append(art,copy); return tile;
  }));
}
function navigate() {
  const room = roomById(location.hash.slice(1));
  release?.(); release = null; $('room-play').replaceChildren();
  current = room || null;
  if (!room) {
    showHub();
    inventory();
    window.scrollTo(0, 0);
    return;
  }
  $('hub').hidden = true; $('room').hidden = false;
  $('room-place').textContent = room.place; $('room-name').textContent = room.name; $('room-task').textContent = room.task;
  $('room-line').textContent = '';
  document.title = room.name + ' · Академия экипажа';
  const id = room.id;
  const api = {
    load: () => saved(id),
    save: record => keep(id, record),
    say: message => { if(current?.id === id) $('room-line').textContent = message; },
    win: () => {
      transition = deliverPrize(id).then(fresh => {
        inventory();
        if(fresh && current?.id === id) $('room-line').textContent = 'Получено: ' + room.prize + '. Можно вернуться в Разлом.';
      });
      return transition;
    }
  };
  release = scenes[id]($('room-play'), api);
  inventory();
  window.scrollTo(0, 0);
}
document.addEventListener('click', async event => {
  const link = event.target.closest('a[data-world]');
  if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); await transition; location.assign(link.href);
});
window.addEventListener('hashchange',navigate);
window.addEventListener('pageshow',inventory);
bus.addEventListener('change',inventory);
navigate(); recoverPrizes().catch(() => {});
