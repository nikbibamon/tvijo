import {state, bus, speech, silenceRadio} from '../tvijoService.js';
import {bindVoiceControls} from '../voiceControls.js';
import {riftRooms, stationRooms, roomById, roomHref, packNames} from './rooms.js';
import {deliverPrize, recoverPrizes, ownsPrize} from './rewards.js';
import {mountAlphabet} from './beacon.js';
import {mountCargo, mountPulse} from './grid.js';
import {mountChain, mountDrones} from './machines.js';
import {mountRadio} from './radio.js';
import {mountMirrors, mountArchive} from './station.js';

import {markRoute} from '../crewRoute.js';

const scenes = {alphabet:mountAlphabet, cargo:mountCargo, chain:mountChain, drones:mountDrones, pulse:mountPulse,
  radio:mountRadio, mirrors:mountMirrors, 'time-archive':mountArchive};
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
  markRoute('room',id);
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
  const riftFound = riftRooms.filter(room => ownsPrize(room.id)).length;
  const stationFound = stationRooms.filter(room => ownsPrize(room.id)).length;
  $('hub-score').textContent = 'Находки · ' + riftFound + ' / ' + riftRooms.length;
  $('station-score').textContent = 'Находки · ' + stationFound + ' / ' + stationRooms.length;
  $('station-result').hidden = stationFound < stationRooms.length;
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
function roomTile(def) {
  const tile = node('a','room-tile'); tile.href = roomHref(def.id); tile.dataset.room=def.id;
  const art = node('img'); art.src = def.art; art.alt = ''; art.loading = 'lazy';
  const copy = node('div','tile-copy');
  copy.append(node('h3','',def.name),node('p','',def.task),node('span','tile-prize',def.prize));
  tile.append(art,copy);
  return tile;
}
function showHub(hash) {
  $('hub').hidden = false; $('room').hidden = true;
  document.title = (hash === 'station' ? 'Станция времени' : 'Кристальный разлом') + ' · Академия экипажа';
  $('rooms').replaceChildren(...riftRooms.map(roomTile));
  $('station-rooms').replaceChildren(...stationRooms.map(roomTile));
}
function navigate() {
  const hash = location.hash.slice(1);
  const room = roomById(hash);
  if (current) silenceRadio();
  release?.(); release = null; $('room-play').replaceChildren();
  current = room || null;
  if (!room) {
    showHub(hash);
    inventory();
    if (hash === 'station' || hash === 'rift-rooms') $(hash).scrollIntoView({block:'start'});
    else window.scrollTo(0, 0);
    return;
  }
  $('hub').hidden = true; $('room').hidden = false;
  $('room-place').textContent = room.place; $('room-name').textContent = room.name; $('room-task').textContent = room.task;
  $('room-line').textContent = '';
  const station = room.chapter === 'station';
  const next = roomById(room.next);
  $('prize-world').hidden = station;
  $('room-next').hidden = !station;
  $('room-next').href = next ? roomHref(next.id) : '#station';
  $('room-next').textContent = next ? 'Открыть «' + next.name + '»' : 'Вернуться на станцию';
  $('room-catalog').href = station ? '#station' : '#rift';
  $('room-catalog').textContent = station ? 'Все комнаты станции' : 'Выбрать другую комнату';
  document.title = room.name + ' · Академия экипажа';
  const id = room.id;
  let interactive = false;
  const api = {
    load: () => saved(id),
    save: record => keep(id, record),
    say: message => {
      if (current?.id !== id) return;
      $('room-line').textContent = message;
      if (interactive) speech(message);
    },
    win: () => {
      transition = deliverPrize(id).then(fresh => {
        inventory();
        if(fresh && current?.id === id) $('room-line').textContent = 'В рюкзаке — ' + room.prize + '.';
      });
      return transition;
    }
  };
  const unmount = scenes[id]($('room-play'), api);
  interactive = true;
  release = () => { interactive = false; unmount?.(); };
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
bindVoiceControls();
navigate(); recoverPrizes().catch(() => {});
