import {traceMirrorPath} from './mirror-path.js';

const SIZE = 5;
const CELLS = SIZE * SIZE;
const DIRECTIONS = ['up', 'right', 'down', 'left'];
const DELTAS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const SOURCE = 15;
const RECEIVER = 24;
const MIRRORS = [17, 7, 9];
const WALLS = [4, 5, 22];
const MIRROR_LAYOUT = {width:SIZE, height:SIZE, source:SOURCE, receiver:RECEIVER, mirrors:MIRRORS, walls:WALLS};
const ARCHIVE = ['##E##', '#CT##', '#o###', '#oT##', '##S##'].join('');
const ARCHIVE_START = ARCHIVE.indexOf('S');
const KEY_DIRECTIONS = {ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left'};

function neighbor(cell, direction) {
  const [dx, dy] = DELTAS[direction];
  const x = cell % SIZE + dx;
  const y = Math.floor(cell / SIZE) + dy;
  return x >= 0 && x < SIZE && y >= 0 && y < SIZE ? y * SIZE + x : -1;
}

export function traceMirrors(angles) {
  return traceMirrorPath(MIRROR_LAYOUT,angles);
}

export function freshMirrors() {
  return {angles: [1, 1, 0], powered: false, done: false};
}

export function stepMirrors(state, action) {
  if (state.done) return {state};
  if (action === 'power') {
    const powered = !state.powered;
    const reaches = powered && traceMirrors(state.angles).reaches;
    return {
      state: {...state, powered},
      note: reaches ? 'Приёмник загорелся. Призма открыта.' : powered ? 'Луч включён. Проследи, где он останавливается.' : 'Луч выключен.'
    };
  }
  if (action === 'take') {
    return state.powered && traceMirrors(state.angles).reaches
      ? {state: {...state, done: true}, note: 'Призма станции у экипажа.'}
      : {state, note: 'Сначала направь луч в приёмник.'};
  }
  if (!Number.isInteger(action) || action < 0 || action >= MIRRORS.length) return {state};
  const angles = state.angles.slice();
  angles[action] = 1 - angles[action];
  const reaches = state.powered && traceMirrors(angles).reaches;
  const wasLit = state.powered && traceMirrors(state.angles).reaches;
  return {state: {...state, angles}, note: reaches && !wasLit ? 'Приёмник загорелся. Призма открыта.' : ''};
}

export function restoreMirrors(value) {
  if (!Array.isArray(value?.angles) || value.angles.length !== MIRRORS.length
    || MIRRORS.some((_, i) => value.angles[i] !== 0 && value.angles[i] !== 1)
    || typeof value.powered !== 'boolean' || typeof value.done !== 'boolean'
    || (value.done && (!value.powered || !traceMirrors(value.angles).reaches))) return null;
  return {angles: value.angles.slice(), powered: value.powered, done: value.done};
}

export function freshArchive() {
  return {cell: ARCHIVE_START, era: 'now', seal: false, done: false};
}

function archiveFloor(tile, era) {
  return tile === 'T' || tile === 'S' || (era === 'past' ? tile === 'o' || tile === 'C' : tile === 'E');
}

export function stepArchive(state, action) {
  if (state.done) return {state};
  if (action === 'phase') {
    if (ARCHIVE[state.cell] !== 'T') return {state, note: 'Часы слушаются только на круглой площадке.'};
    const era = state.era === 'now' ? 'past' : 'now';
    const note = era === 'past' ? 'Прошлое. Слева появилась дорожка к печати.' : 'Настоящее. Верхний шлюз снова на месте.';
    return {state: {...state, era}, note};
  }
  const direction = DIRECTIONS.indexOf(action);
  if (direction < 0) return {state};
  const cell = neighbor(state.cell, direction);
  const tile = ARCHIVE[cell];
  if (tile === 'E' && !state.seal) return {state, note: 'Для шлюза нужна печать из прошлого.'};
  if (!archiveFloor(tile, state.era)) {
    return {state, note: tile && tile !== '#' ? 'Этой клетки сейчас нет. Ищи площадку с часами.' : 'Здесь край настила.'};
  }
  const seal = state.seal || tile === 'C';
  const done = tile === 'E';
  const note = done ? 'Печать принята. Архив снова открыт.'
    : seal && !state.seal ? 'Печать найдена. Дойди до верхних часов и вернись в настоящее.' : '';
  return {state: {...state, cell, seal, done}, note};
}

export function restoreArchive(value) {
  if (!['now', 'past'].includes(value?.era) || !Number.isSafeInteger(value.cell)
    || !archiveFloor(ARCHIVE[value.cell], value.era) || typeof value.seal !== 'boolean'
    || value.done !== (ARCHIVE[value.cell] === 'E') || (value.done && !value.seal)
    || (ARCHIVE[value.cell] === 'C' && !value.seal)) return null;
  return {cell: value.cell, era: value.era, seal: value.seal, done: value.done};
}

function createScene(root, {kind, title, actor, portrait, guide, controls, gridMarkup, cellMarkup}) {
  const doc = root.ownerDocument;
  const wrap = doc.createElement('section');
  wrap.className = 'station-game ' + kind;
  wrap.setAttribute('aria-label', title);
  wrap.innerHTML = '<div class="station-board" ' + gridMarkup + '></div>'
    + '<div class="station-console"><div class="station-crew"><img alt="" src="' + portrait + '">'
    + '<div><strong>' + actor + '</strong><p>' + guide + '</p></div></div>'
    + '<p class="station-status"></p><div class="station-controls">' + controls + '</div>'
    + '<div class="station-tools"><button type="button" data-action="undo">Ход назад</button>'
    + '<button type="button" data-action="reset">Сначала</button></div></div>';
  const board = wrap.querySelector('.station-board');
  const cells = Array.from({length: CELLS}, (_, i) => {
    const result = cellMarkup(i);
    const cell = doc.createElement(result.button ? 'button' : 'div');
    if (result.button) cell.type = 'button';
    cell.className = 'station-cell';
    if (result.html) cell.innerHTML = result.html;
    board.append(cell);
    return cell;
  });
  root.replaceChildren(wrap);
  return {wrap, board, cells, status: wrap.querySelector('.station-status')};
}

function playScene(wrap, api, {fresh, restore, step, render}) {
  const record = api.load();
  const restored = record?.version === 1 ? restore(record.state) : null;
  let state = restored ?? fresh();
  let history = restored && Array.isArray(record.history)
    ? record.history.slice(-48).map(restore).filter(Boolean) : [];
  let awarded = false;

  function refresh() {
    render(state);
    wrap.querySelector('[data-action="undo"]').disabled = history.length === 0;
    if (state.done && !awarded) {
      awarded = true;
      api.win();
    }
  }
  function dispatch(action) {
    let result;
    if (action === 'undo') {
      if (!history.length) return;
      result = {state: history.pop(), note: 'Последний ход отменён.'};
    } else if (action === 'reset') {
      history = [];
      result = {state: fresh(), note: 'Вернулись ко входу.'};
    } else {
      result = step(state, action);
      if (result.state !== state) history = [...history.slice(-47), state];
    }
    if (result.note) api.say(result.note);
    if (result.state === state) return;
    state = result.state;
    api.save({version: 1, state, history});
    refresh();
  }
  wrap.addEventListener('click', event => {
    const control = event.target.closest('[data-action]');
    if (control) dispatch(control.dataset.action);
  });
  refresh();
  return dispatch;
}

const MARK = '<span class="station-mark" aria-hidden="true"></span>';
const BOLT = '<span class="station-pin" aria-hidden="true"></span>';
const TRACES = DIRECTIONS.map(dir => '<i class="beam beam-' + dir + '" aria-hidden="true"></i>').join('');

export function mountMirrors(root, api) {
  const {wrap, cells, status} = createScene(root, {
    kind: 'mirror-room', title: 'Поле зеркал', actor: 'Ассистентка', portrait: './art/crew/assistant.webp',
    guide: 'Включи луч и поверни зеркала, чтобы свет попал в золотой приёмник.',
    controls: '<button type="button" data-action="power" aria-pressed="false">Включить луч</button>'
      + '<button type="button" data-action="take" class="station-primary">Забрать призму</button>',
    gridMarkup: 'role="group" aria-label="Оптическая схема 5 на 5"',
    cellMarkup: i => ({button: MIRRORS.includes(i), html: TRACES + MARK + BOLT})
  });
  const power = wrap.querySelector('[data-action="power"]');
  const take = wrap.querySelector('[data-action="take"]');
  const displays = cells.map(cell => ({
    mark: cell.querySelector('.station-mark'), traces: Array.from(cell.querySelectorAll('.beam'))
  }));
  const dispatch = playScene(wrap, api, {fresh: freshMirrors, restore: restoreMirrors, step: stepMirrors, render(state) {
    const {beams, reaches} = traceMirrors(state.angles);
    const lit = state.powered && reaches;
    for (const [i, cell] of cells.entries()) {
      const mirror = MIRRORS.indexOf(i);
      const {mark, traces} = displays[i];
      cell.className = 'station-cell';
      if (mirror !== -1) {
        cell.classList.add('station-mirror', state.angles[mirror] === 0 ? 'mirror-slash' : 'mirror-back');
        cell.setAttribute('aria-label', 'Повернуть зеркало ' + (mirror + 1) + (state.angles[mirror] === 0 ? ', наклон вправо' : ', наклон влево'));
        cell.disabled = state.done;
      } else if (i === SOURCE) {
        cell.classList.add('station-source');
        cell.setAttribute('role', 'img');
        cell.setAttribute('aria-label', 'Источник света');
      } else if (i === RECEIVER) {
        cell.classList.add('station-receiver');
        cell.classList.toggle('receiver-lit', lit);
        cell.setAttribute('role', 'img');
        cell.setAttribute('aria-label', lit ? 'Приёмник освещён' : 'Приёмник тёмный');
      } else {
        cell.classList.toggle('station-wall', WALLS.includes(i));
      }
      mark.textContent = i === SOURCE ? '▶' : i === RECEIVER ? '◆' : '';
      for (const [direction, trace] of traces.entries()) trace.hidden = !state.powered || !beams[i].includes(DIRECTIONS[direction]);
    }
    power.textContent = state.powered ? 'Выключить луч' : 'Включить луч';
    power.setAttribute('aria-pressed', String(state.powered));
    power.disabled = state.done;
    take.disabled = state.done || !lit;
    take.textContent = state.done ? 'Призма в рюкзаке' : 'Забрать призму';
    status.textContent = state.done ? 'Оптическая линия восстановлена.'
      : lit ? 'Приёмник освещён. Забери призму.'
      : state.powered ? 'Проследи золотую линию до первого препятствия.' : 'Источник света выключен.';
  }});
  for (const [i, cell] of MIRRORS.entries()) cells[cell].addEventListener('click', () => dispatch(i));
}

const ARCHIVE_KEYS = [
  ['up', '↑', 'Вверх'], ['left', '←', 'Влево'], ['down', '↓', 'Вниз'], ['right', '→', 'Вправо']
];
const TILE_MARKS = {T: '◎', C: '✦', E: '▥'};
const TILE_NAMES = {T: 'площадка часов', S: 'вход', o: 'старый настил', C: 'место печати', E: 'шлюз', '#': 'стена'};

export function mountArchive(root, api) {
  const pad = ARCHIVE_KEYS.map(([action, symbol, label]) =>
    '<button type="button" data-action="' + action + '" aria-label="' + label + '">' + symbol + '</button>').join('');
  const {wrap, board, cells, status} = createScene(root, {
    kind: 'archive-room', title: 'Архив двух времён', actor: 'Синий Гуманоид', portrait: './art/crew/blue.webp',
    guide: 'На круглых площадках меняй эпоху. Возьми печать в прошлом и отнеси её к шлюзу в настоящем.',
    controls: '<div class="station-pad" role="group" aria-label="Шаг на клетку">' + pad + '</div>'
      + '<button type="button" data-action="phase" class="station-primary">Переключить часы</button>',
    gridMarkup: 'role="group" aria-label="Настил архива 5 на 5. Для движения используй стрелки." tabindex="0"',
    cellMarkup: () => ({button: true, html: MARK + '<span class="station-pilot" aria-hidden="true" hidden></span>'})
  });
  const phase = wrap.querySelector('[data-action="phase"]');
  const arrows = Array.from(wrap.querySelectorAll('.station-pad button'));
  const displays = cells.map(cell => ({mark: cell.firstElementChild, pilot: cell.lastElementChild}));
  let currentCell = ARCHIVE_START;
  const dispatch = playScene(wrap, api, {fresh: freshArchive, restore: restoreArchive, step: stepArchive, render(state) {
    currentCell = state.cell;
    wrap.dataset.era = state.era;
    const past = state.era === 'past';
    for (const [i, cell] of cells.entries()) {
      const tile = ARCHIVE[i];
      const active = i === state.cell;
      const floor = archiveFloor(tile, state.era);
      const {mark, pilot} = displays[i];
      cell.className = 'station-cell';
      cell.classList.toggle('station-wall', tile === '#');
      cell.classList.toggle('archive-absent', tile !== '#' && !floor);
      cell.classList.toggle('archive-anchor', tile === 'T');
      cell.classList.toggle('archive-seal', tile === 'C' && !state.seal);
      cell.classList.toggle('archive-exit', tile === 'E');
      cell.classList.toggle('archive-here', active);
      cell.tabIndex = -1;
      cell.disabled = state.done || tile === '#';
      mark.textContent = tile === 'C' && state.seal ? '' : TILE_MARKS[tile] ?? '';
      pilot.hidden = !active;
      const label = tile === 'C' && state.seal ? 'пустая ниша' : TILE_NAMES[tile];
      cell.setAttribute('aria-label', 'Клетка ' + (i + 1) + ', ' + label
        + (active ? ', здесь Гуманоид' : tile !== '#' && !floor ? ', сейчас недоступна' : ''));
    }
    phase.textContent = past ? 'Вернуться в настоящее' : 'Перейти в прошлое';
    phase.disabled = state.done;
    for (const arrow of arrows) arrow.disabled = state.done;
    status.textContent = state.done ? 'Архив открыт. Печать в рюкзаке.'
      : (past ? 'Прошлое' : 'Настоящее') + (state.seal ? ' · Печать найдена' : ' · Печать не найдена');
  }});
  for (const [i, cell] of cells.entries()) {
    cell.addEventListener('click', () => {
      const direction = DIRECTIONS.find((_, n) => neighbor(currentCell, n) === i);
      if (direction) dispatch(direction);
    });
  }
  board.addEventListener('keydown', event => {
    const direction = KEY_DIRECTIONS[event.key];
    if (!direction) return;
    event.preventDefault();
    dispatch(direction);
  });
}
