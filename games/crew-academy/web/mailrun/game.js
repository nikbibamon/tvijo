import {rooms as mailRooms} from './scenes.js';
import {tideRooms} from './tides.js';
import {restore, visit, act, resume, stepsPerRoom} from './progress.js';

const $ = (id) => document.getElementById(id);
const slots = $('choices');
const stage = $('stage');
const dialog = $('dialog');
const tide = document.body.dataset.chapter === 'tide';
const rooms = tide ? tideRooms : mailRooms;
const saveKey = tide ? 'tvijo.tide-beacon.v1' : 'tvijo.mailrun.v1';
let audioContext;
let soundEnabled = false;

function readSave() {
  try { return restore(JSON.parse(localStorage.getItem(saveKey))); }
  catch { return restore(); }
}
let state = readSave();
let uiMode = '';
let focusIndex = 0;
let currentObjects = [];
function save(next) {
  const other = readSave();
  state = {...next, progress: Math.max(next.progress, other.progress), socks: next.socks || other.socks};
  try { localStorage.setItem(saveKey, JSON.stringify(state)); } catch {}
}
function addButton(parent, name, callback, css = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = css;
  button.textContent = name;
  button.addEventListener('click', callback);
  parent.append(button);
  return button;
}
function say(text) { $('reply').textContent = text; }
function go(next) {
  save(next);
  if (dialog.open) dialog.close();
  render();
}
function pop(word) {
  const effect = $('effect');
  effect.classList.remove('pop');
  effect.textContent = word;
  void effect.offsetWidth;
  effect.classList.add('pop');
}
function use(id) {
  const room = rooms[state.room];
  const action = room.steps[state.step];
  const next = act(state, room, id);
  if (next === state) {
    const object = currentObjects.find(obj => obj.id === id);
    if (object?.remark) {
      say(object.remark);
      if (room.art === 'locks' && state.step < 3) {
        pop('Ш-ш-ш…');
        const stream = $('spill');
        stream.style.left = object.x + '%';
        stream.classList.remove('running');
        void stream.offsetWidth;
        stream.classList.add('running');
      }
    }
    return;
  }
  const keyboard = slots.contains(document.activeElement) || $('spots').contains(document.activeElement);
  const bonus = id === 'give-sock';
  if (tide && room.art === 'voices') playSignal(state.step);
  save(next);
  render(bonus ? 'Прачка соединила носки одной прищепкой. «Попробуйте теперь улететь по одному!»' : action.reply);
  pop(bonus ? 'В паре!' : action.sound);
  if (keyboard) slots.querySelector('button')?.focus({preventScroll:true});
}
function playSignal(step) {
  if (!soundEnabled || !audioContext || step > 2) return;
  const t = audioContext.currentTime + .025;
  const tones = step === 0 ? [[0,.12,575],[.23,.12,575],[.49,.49,230]]
    : step === 1 ? [[0,.13,690],[.23,.13,690]] : [[0,.66,180]];
  for (const [delay, length, frequency] of tones) {
    const tone = audioContext.createOscillator();
    const volume = audioContext.createGain();
    tone.type = frequency < 300 ? 'triangle' : 'sine';
    tone.frequency.value = frequency;
    volume.gain.setValueAtTime(.0001,t+delay);
    volume.gain.exponentialRampToValueAtTime(.1,t+delay+.025);
    volume.gain.exponentialRampToValueAtTime(.0001,t+delay+length);
    tone.connect(volume).connect(audioContext.destination);
    tone.start(t+delay);
    tone.stop(t+delay+length+.02);
  }
}
function highlight(id) {
  for (const el of $('spots').children) el.classList.toggle('lit', el.dataset.id === id);
}
function addObject(obj) {
  const target = addButton($('spots'), '', () => use(obj.id), 'spot');
  target.dataset.id = obj.id;
  if (rooms[state.room].art === 'paper' && obj.id === 'chalk') target.classList.add('chalk');
  target.style.left = obj.x + '%';
  target.style.top = obj.y + '%';
  target.tabIndex = -1;
  target.setAttribute('aria-label', obj.name);
  target.title = obj.name;
  const tip = document.createElement('span');
  tip.className = 'tip';
  tip.textContent = obj.name;
  target.append(tip);
  const choice = addButton(slots, obj.name, () => use(obj.id));
  choice.addEventListener('focus', () => highlight(obj.id));
  choice.addEventListener('blur', () => highlight(''));
  choice.addEventListener('mouseenter', () => highlight(obj.id));
  choice.addEventListener('mouseleave', () => highlight(''));
}

function render(reply) {
  const room = rooms[state.room];
  const step = room.steps[state.step];
  const frame = Math.max(0, state.step - 1);
  $('art').style.backgroundImage = 'url("./mailrun/' + room.art + '.webp")';
  $('art').style.backgroundPosition = (frame % 2 ? '100%' : '0') + ' ' + (frame >= 2 ? '100%' : '0');
  $('art').setAttribute('aria-label', room.name + '. ' + (state.step ? room.steps[state.step - 1].reply : room.intro));
  $('plane').style.setProperty('--origin', room.focal);
  stage.classList.toggle('entry', state.step === 0);
  $('socks').hidden = !(!tide && state.room === 1 && state.socks && state.step === 4);
  $('room-name').textContent = room.name;
  $('counter').textContent = state.step + ' / ' + stepsPerRoom;
  say(reply ?? (state.step ? room.steps[state.step - 1].reply : room.intro));
  $('goal').textContent = step?.goal ?? (state.room === rooms.length - 1
    ? (tide ? 'Лодка дома. Обе главы открыты для возвращения.' : 'Письмо с тобой. Его маршрут ведёт к подводному маяку.')
    : 'Путь дальше открыт.');
  const clue = $('clue');
  if (clue) {
    clue.hidden = !(room.art === 'locks' && state.step < 3 || room.art === 'voices' && state.step > 0 && state.step < 4);
    clue.textContent = room.art === 'locks' ? 'Бумажная карта' : 'Повторить позывной';
  }
  $('spots').replaceChildren();
  slots.replaceChildren();
  currentObjects = step?.items ?? [];
  focusIndex = 0;
  currentObjects.forEach(addObject);
  if (step) return;
  if (!tide && state.room === 1 && state.progress >= 14 && !state.socks) {
    const option = {id:'give-sock', name:'Вернуть носок прачке', x:12, y:52};
    currentObjects = [option];
    addObject(option);
  }
  if (state.room + 1 < rooms.length) {
    addButton(slots, room.exit, () => go(visit(state, state.room + 1)), 'next');
  } else {
    if (tide) addButton(slots, 'Открыть маршрут', showMap, 'next');
    else addChapterLink(slots, 'К маяку под волной', './tide-beacon.html', 'next');
  }
  addButton(slots, 'Сыграть сцену снова', () => go(visit(state, state.room, true)));
}

function addChapterLink(parent, text, url, css) {
  const link = document.createElement('a');
  link.className = 'chapter-link ' + css;
  link.textContent = text;
  link.href = url;
  parent.append(link);
}
function openDialog(title, mode) {
  uiMode = mode;
  $('dialog-title').textContent = title;
  $('dialog-body').replaceChildren();
  if (!dialog.open) dialog.showModal();
  return $('dialog-body');
}
function showMap() {
  const body = openDialog(tide ? 'Маршрут к маяку' : 'Почтовый маршрут', 'map');
  const list = document.createElement('div');
  list.className = 'map-list';
  body.append(list);
  rooms.forEach((room, index) => {
    const found = state.progress - index * stepsPerRoom;
    const btn = addButton(list, room.name, () => go(visit(state, index)));
    btn.disabled = found < 0;
    if (index === state.room) btn.setAttribute('aria-current', 'location');
    const small = document.createElement('small');
    small.textContent = found < 0 ? 'Ещё впереди' : found >= stepsPerRoom ? 'Пройдено' : Math.max(0, found) + ' / 4';
    if (!tide && index === 1 && state.progress >= 14) small.textContent = state.socks ? 'Носки на верёвке' : 'Прачка ищет носок';
    btn.append(small);
  });
  const bar = document.createElement('div');
  bar.className = 'dialog-actions';
  body.append(bar);
  addButton(bar, state.progress === 20 ? (tide ? 'К лодочнице' : 'К обратному письму') : 'К моей доставке', () => go(resume(state)), 'resume');
  if (tide) addChapterLink(bar, 'На Нижний остров', './mailrun.html', 'replay');
  else if (state.progress === 20) addChapterLink(bar, 'К маяку под волной', './tide-beacon.html', 'replay');
  if (state.progress >= (state.room + 1) * stepsPerRoom)
    addButton(bar, 'Переиграть эту комнату', () => go(visit(state, state.room, true)), 'replay');
}
function showHelp() {
  const body = openDialog('Как играть', 'help');
  const text = document.createElement('div');
  text.className = 'help-copy';
  text.innerHTML = '<p>Коснись ромба на рисунке или выбери предмет под сценой. Шпуль и Гуманоид действуют вместе. Другие предметы отвечают своими репликами.</p><p><kbd>← →</kbd> или <kbd>Tab</kbd> — выбрать предмет. <kbd>Enter</kbd> или <kbd>E</kbd> — применить. <kbd>Esc</kbd> — маршрут.</p><p>На телефоне удобнее развернуть экран горизонтально. Доставка сохраняется в этом браузере после каждого действия. На карте можно вернуться в открытую комнату.</p>';
  body.append(text);
  addButton(body, 'Вернуться к игре', () => dialog.close(), 'dialog-action');
}
if (tide) {
  $('clue').addEventListener('click', () => {
    if (rooms[state.room].art === 'locks') {
      const body = openDialog('Складная карта', 'chart');
      const p = document.createElement('p');
      p.className = 'chart-symbols';
      p.textContent = '1. Раковина　 2. Камыш　 3. Звезда';
      body.append(p);
      addButton(body, 'К затворам', () => dialog.close(), 'dialog-action');
    } else {
      say('Два коротких, один долгий. Так лодка узнаёт своих на берегу.');
      pop('● ● ━');
      playSignal(0);
    }
  });
  $('audio').addEventListener('click', async () => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) { say('Позывной виден по отметкам над причалом.'); return; }
    try {
      if (!audioContext) audioContext = new Context();
      if (!soundEnabled) await audioContext.resume();
      soundEnabled = !soundEnabled;
      $('audio').setAttribute('aria-pressed',String(soundEnabled));
      $('audio').textContent = soundEnabled ? 'Звук вкл.' : 'Звук';
    } catch { say('Позывной можно прочитать по отметкам над причалом.'); }
  });
}
$('map-button').addEventListener('click', showMap);
$('help-button').addEventListener('click', showHelp);
$('close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { uiMode = ''; });
dialog.addEventListener('click', event => { if (event.target === dialog && !event.target.closest('#dialog-body, .dialog-head')) {
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
}});
document.addEventListener('keydown', event => {
  if (dialog.open || uiMode || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Escape') { event.preventDefault(); showMap(); return; }
  const buttons = Array.from(slots.querySelectorAll('button, a'));
  if (!buttons.length) return;
  const current = buttons.indexOf(document.activeElement);
  const delta = {ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1}[event.key];
  if (delta) {
    event.preventDefault();
    focusIndex = current < 0 ? (delta > 0 ? 0 : buttons.length - 1) : (current + delta + buttons.length) % buttons.length;
    buttons[focusIndex].focus({preventScroll:true});
  } else if (event.code === 'KeyE' || (event.key === 'Enter' && document.activeElement === document.body)) {
    if (event.repeat) return;
    event.preventDefault();
    (buttons[current >= 0 ? current : focusIndex] || buttons[0]).click();
  }
});
render();
