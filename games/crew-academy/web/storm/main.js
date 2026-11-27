import {bindVoiceControls} from '../voiceControls.js';
import {bus, speech, silenceRadio} from '../tvijoService.js';
import {deliverPrize, ownsPrize, recoverPrizes} from '../expedition/rewards.js';
import {
  channels, observations, scenes, systems, POWER, route, HOME, DRONE, COLS, directions,
  readyPower, remaining, waveColumn, openWindow, neighbor, canTether,
  freshStorm, restoreStorm, sceneIndex, stepStorm
} from './rules.js';

import {markRoute, stormKey as SAVE} from '../crewRoute.js';
const PRIZE = 'orbital-storm';
const $ = id => document.getElementById(id);
const pulse = ['слабый','средний','сильный'];
const arrowKeys = {ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left'};
const cover = [
  ['Связь со Светляком пропала. Экипаж ищет его среди помех.',''],
  ['Самолётик нашёл дрон у наружных направляющих. Станции нужна энергия.','Сигнал найден'],
  ['Станция ожила. Гуманоид выходит за борт, пока шторм проходит по кольцу.','Светляк на связи'],
  ['Светляк на борту. Через створки кольца осталось провести шаттл.','Дрон на тросе'],
  ['Шаттл сел, дрон в ангаре, экипаж снова вместе.','Светляк спасён']
];

function load() {
  try { return restoreStorm(JSON.parse(localStorage.getItem(SAVE))); }
  catch { return freshStorm(); }
}
let mission = load();
let current = sceneIndex(mission,location.hash.slice(1));
let report = 'drone';
let awarding = false;

function save() {
  markRoute('storm');
  try { localStorage.setItem(SAVE,JSON.stringify(mission)); } catch {}
}
function award() {
  if (mission.stage !== 4 || awarding || ownsPrize(PRIZE)) return;
  awarding = true;
  deliverPrize(PRIZE).catch(() => {}).finally(() => { awarding = false; });
}
function renderBadge() {
  const badge = $('storm-badge');
  if (!badge) return;
  const received = ownsPrize(PRIZE);
  badge.hidden = !received;
  badge.textContent = received ? 'В рюкзаке · Знак спасения Светляка' : '';
}
function control(action, text, {disabled = false, primary = false, label = '', pressed} = {}) {
  return '<button type="button" data-action="' + action + '"' + (primary ? ' class="storm-primary"' : '')
    + (label ? ' aria-label="' + label + '"' : '') + (pressed !== undefined ? ' aria-pressed="' + pressed + '"' : '')
    + (disabled ? ' disabled' : '') + '>' + text + '</button>';
}

function signalView(locked) {
  const {band,observations:known} = mission.signal;
  const channel = channels[band];
  const wave = channel.beats.map((size,i) => '<i style="--beat:' + size + ';--delay:' + i + '"></i>').join('');
  const bands = channels.map(({number},i) => control('band-'+number,'Канал '+number,{pressed:band===i,disabled:locked})).join('');
  const clues = observations.map(({action,bit,speaker,clue}) =>
    '<div class="clue-line">' + control(action,speaker,{disabled:locked,pressed:Boolean(known&bit)})
    + '<p>' + (known&bit ? clue : 'Получить наблюдение') + '</p></div>').join('');
  return '<div class="storm-split"><div class="signal-monitor' + (locked ? ' signal-locked' : '') + '">'
    + '<p>' + (locked ? 'Позывной подтверждён' : 'Приёмник') + ' · ' + channel.number + '</p>'
    + '<div class="signal-bars" aria-hidden="true">' + wave + '</div>'
    + '<p class="wave-text">' + channel.beats.map(size => pulse[size-1]).join(' · ') + '</p>'
    + '<div class="storm-buttons band-buttons">' + bands + '</div></div>'
    + '<div class="storm-console"><div class="clue-list">' + clues + '</div>'
    + control('lock','Подтвердить позывной',{primary:true,disabled:locked}) + '</div></div>';
}

function powerView(locked) {
  const spare = remaining(mission.power);
  const cards = systems.map(({id,name,need,bonus},i) => {
    const amount = mission.power[i];
    const ready = amount >= need;
    const cells = Array.from({length:POWER},(_,slot) => '<i class="' + (slot < amount ? 'charged' : '') + '"></i>').join('');
    return '<article class="power-system' + (ready ? ' power-live' : '') + '">'
      + '<h3>' + name + '</h3><p>' + amount + ' / ' + need + ' для запуска</p>'
      + '<div class="power-cells" aria-hidden="true">' + cells + '</div>'
      + '<div class="power-steps">'
      + control('sub-'+id,'−',{label:'Снять ячейку · '+name,disabled:locked||amount===0})
      + control('add-'+id,'+',{label:'Добавить ячейку · '+name,disabled:locked||spare===0}) + '</div>'
      + '<p class="system-note">' + bonus + '</p></article>';
  }).join('');
  return '<div class="power-header"><strong>' + (locked ? 'Станция запитана' : 'Свободно ячеек · '+spare+' / '+POWER)
    + '</strong><p>Последняя ячейка даёт запас той системе, которой ты её отдашь.</p></div>'
    + '<div class="power-grid">' + cards + '</div>'
    + '<div class="storm-buttons power-button">' + control('commit','Подать питание',{primary:true,disabled:locked||!readyPower(mission.power)}) + '</div>';
}

function rescueView(locked, before) {
  const r = mission.rescue;
  const wave = waveColumn(r.turn);
  const was = before && waveColumn(before.rescue.turn);
  const previousWave = before && was + 1 === wave ? was : wave;
  const ties = canTether(mission);
  const nearby = directions.map(dir => neighbor(r.cell,dir));
  const tiles = [...route].map((tile,i) => {
    const hazard = i % COLS === wave && !'AG#'.includes(tile);
    const label = [tile==='#'?'Пустота':tile==='G'?'Шлюз':tile==='A'?'Якорь':tile==='D'&&!r.tether?'Светляк':'Направляющая',
      r.cell===i?'здесь Гуманоид':'',hazard?'следующая волна':''].filter(Boolean).join(', ');
    const tileClass = ['rescue-tile',tile==='#'?'void-tile':'',tile==='A'?'anchor-tile':'',
      tile==='G'?'gate-tile':'',hazard?'tile-wave':'',i===r.cell?'pilot-tile':''].filter(Boolean).join(' ');
    const drone = (!r.tether&&i===DRONE)||(r.tether&&i===r.cell);
    const pilot = i===r.cell ? '<img src="./art/crew/blue.webp" alt="">' : '';
    const icon = tile==='G'?'▥':tile==='A'?'◎':'';
    return '<button type="button" tabindex="-1" class="'+tileClass+'" data-action="tile-'+i+'" aria-label="'+label+'"'
      + (locked||tile==='#'||!nearby.includes(i)?' disabled':'') + '><span aria-hidden="true">'+icon+'</span>'
      + pilot + (drone?'<i class="mini-drone" aria-hidden="true"></i>':'') + '</button>';
  }).join('');
  const pads = ['up','left','down','right'].map(id => {
    const dir = directions.find(item => item.id === id);
    return control(id,dir.arrow,{label:dir.label,disabled:locked});
  }).join('');
  return '<div class="storm-split rescue-layout"><div class="rescue-field" role="group" tabindex="0" '
    + 'aria-label="Наружная направляющая. Для движения используй стрелки." style="--wave:'+wave+';--wave-from:'+previousWave+'">'
    + '<i class="gust" aria-hidden="true"></i>'+tiles+'</div><div class="storm-console">'
    + '<div class="rescue-status"><strong>'+(locked?'Светляк в шлюзе':r.tether?'Светляк на тросе':'Трос свободен')+'</strong>'
    + '<p>Следующая волна · столбец '+(wave+1)+' из '+COLS+'. Якоря и шлюз под защитой.</p>'
    + (r.shield?'<p class="shield-status">Запас щита готов</p>':'')+'</div>'
    + '<div class="rescue-pad" role="group" aria-label="Шаг на клетку">'+pads+'</div><div class="storm-buttons">'
    + control('wait-wave','Переждать волну',{disabled:locked})
    + control('attach',r.tether?'Трос закреплён':'Закрепить трос',{primary:ties,disabled:locked||!ties})
    + control('return','Закрыть шлюз',{primary:r.tether&&r.cell===HOME,disabled:locked||!r.tether||r.cell!==HOME})
    + '</div>'+control('reset-rescue','Вернуться ко входу',{disabled:locked})+'</div></div>';
}

function dockingView(locked, before) {
  const d = mission.docking;
  const open = openWindow(d.turn);
  const x = 20 + d.lane * 30;
  const y = 37 + (d.range-1)*14;
  const previous = before?.docking;
  const openChanged = previous && open !== openWindow(previous.turn);
  const shipStyle = '--ship-x:'+x+'%;--ship-y:'+y+'%;--ship-size:'+(1.19-d.range*.13);
  return '<div class="storm-split"><div class="dock-view'+(open?' dock-open':'')+(locked?' dock-cleared':'')
    +(openChanged?' dock-shifting':'')+'" style="'+shipStyle+'" role="img" aria-label="Шаттл и три оси стыковки">'
    + '<i class="dock-track" aria-hidden="true"></i><div class="dock-ring" aria-hidden="true"><i></i><i></i></div>'
    + '<div class="shuttle" aria-hidden="true"><i></i></div><span class="dock-label">'
    + (locked?'Стыковка завершена':open?'Окно открыто':'Створки закрыты')+'</span></div>'
    + '<div class="storm-console"><div class="dock-status"><strong>'
    + (d.lane===1?'Средняя ось':d.lane===0?'Левая ось':'Правая ось')+'</strong>'
    + '<p>Расстояние до кольца · '+d.range+(d.range===1?' деление':' деления')+'</p>'
    + '<p>'+(open?'Зелёное окно. Можно стыковаться с ближней отметки.':'Окно закрыто. Подожди или продолжай сближение.')+'</p></div>'
    + '<div class="storm-buttons">'
    + control('align-left','Левее',{disabled:locked||d.lane===0})
    + control('align-right','Правее',{disabled:locked||d.lane===2})
    + control('approach','Сблизиться',{disabled:locked||d.lane!==1||d.range===1})
    + control('coast','Переждать фазу',{disabled:locked})
    + control('dock','Стыковаться',{primary:true,disabled:locked||d.lane!==1||d.range!==1})
    + '</div></div></div>';
}

const logs = [
  {id:'drone', label:'Запись Светляка'},
  {id:'robot', label:'Запись Робота'},
  {id:'commander', label:'Отчёт Капитана'}
];

function journalView() {
  const reserve = systems.find(({need},i) => mission.power[i]>need);
  const log = {
    drone:'«Снаружи было темно. Потом я увидел огни на кольце и почувствовал трос. Дома».',
    robot:'«Сигнал держался на канале '+channels[mission.signal.band].number+'. Резерв получил контур „'+reserve.name+'“».',
    commander:'«Возвратов на якорь — '+mission.rescue.hits+'. Повторных заходов к створкам — '
      +mission.docking.retries+'. Светляк доставлен».'
  };
  const choices = logs.map(({id,label}) => control('log-'+id,label,{pressed:id===report})).join('');
  return '<div class="journal-scene"><div class="hangar"><img src="./art/crew/crew.webp" alt="Экипаж Академии">'
    + '<p id="storm-badge" hidden></p></div><div class="storm-console"><div class="storm-buttons">'+choices+'</div>'
    + '<p class="journal-quote" role="status">'+log[report]+'</p><div class="storm-buttons">'
    + '<a class="storm-primary" href="./expedition.html#station">На Станцию времени</a><a href="./#hq">В штаб</a></div>'
    + '<details class="replay-storm"><summary>Сыграть ещё раз</summary>'+control('restart','Начать вылазку заново')
    + '</details></div></div>';
}

const views = [signalView,powerView,rescueView,dockingView,journalView];

function render(before) {
  const scene = scenes[current];
  const cleared = current < mission.stage;
  const next = scenes[current+1];
  $('storm').dataset.act = scene.id;
  $('storm').dataset.progress = mission.stage;
  $('storm-cover-text').textContent = cover[mission.stage][0];
  $('storm-cover-status').textContent = cover[mission.stage][1];
  $('storm-cover-status').hidden = mission.stage === 0;
  $('storm').querySelector('.drone-beacon').hidden = mission.stage === 0 || mission.stage > 2;
  $('stage-title').textContent = scene.title;
  $('stage-task').textContent = scene.task;
  $('stage-portrait').src = './art/crew/'+scene.portrait+'.webp';
  $('stage-crew').textContent = scene.crew;
  $('storm-path').innerHTML = scenes.map(({id,name},i) => i > mission.stage
    ? '<span aria-disabled="true">'+name+'</span>'
    : '<a href="#'+id+'"'+(i===current?' aria-current="step"':'')+(i<mission.stage?' class="stage-clear"':'')+'>'+name+'</a>').join('');
  $('storm-play').innerHTML = views[current](cleared,before);
  $('storm-next').hidden = !cleared || !next;
  $('storm-next').innerHTML = cleared && next
    ? '<a class="storm-primary" href="#'+next.id+'">'+['Направить питание','Открыть шлюз','Перейти к стыковке','Открыть журнал'][current]+'</a>' : '';
  renderBadge();
}

function go() {
  silenceRadio();
  const wanted = location.hash.slice(1);
  current = sceneIndex(mission,wanted);
  const blocked = scenes.findIndex(scene => scene.id === wanted) > mission.stage;
  $('storm-message').textContent = blocked ? 'Сначала заверши текущий этап. Он открыт ниже.' : '';
  render();
  $('stage-title').focus({preventScroll:true});
  $('storm-path').scrollIntoView({block:'nearest'});
  award();
}

function interact(action) {
  if (current === 4 && logs.some(({id}) => action === 'log-'+id)) {
    report = action.slice(4);
    render();
    return;
  }
  if (current === 4 && action === 'restart') {
    mission = freshStorm();
    report = 'drone';
    save();
    location.hash = '#signal';
    return;
  }
  if (current === 2 && action.startsWith('tile-')) {
    const cell = Number(action.slice(5));
    action = directions.find(dir => neighbor(mission.rescue.cell,dir)===cell)?.id ?? '';
  }
  const before = mission;
  const result = stepStorm(mission,scenes[current].id,action);
  $('storm-message').textContent = result.note;
  if (result.speak) speech(result.note);
  if (result.state === mission) return;
  mission = result.state;
  save();
  render(before);
  award();
}

$('storm-play').addEventListener('click',event => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const command = button.dataset.action;
  const keepFocus = document.activeElement === button;
  interact(command);
  if (!keepFocus || button.isConnected) return;
  const matching = Array.from($('storm-play').querySelectorAll('button[data-action]'))
    .find(control => control.dataset.action === command && !control.disabled);
  (matching ?? $('storm-next').querySelector('a') ?? $('storm-play').querySelector('button:not(:disabled)'))?.focus({preventScroll:true});
});
$('storm-play').addEventListener('keydown',event => {
  const action = arrowKeys[event.key];
  if (current !== 2 || event.repeat || !action || !event.target.closest('.rescue-field, .rescue-pad')) return;
  event.preventDefault();
  const board = event.target.closest('.rescue-field');
  interact(action);
  if (board && !board.isConnected) $('storm-play').querySelector('.rescue-field')?.focus({preventScroll:true});
  else if (!event.target.isConnected) $('storm-play').querySelector('[data-action="'+action+'"]')?.focus({preventScroll:true});
});
window.addEventListener('hashchange',go);
bus.addEventListener('change',renderBadge);
bindVoiceControls();
if (location.hash) go(); else render();
recoverPrizes().then(award).catch(() => {});
