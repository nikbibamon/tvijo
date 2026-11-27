export const scenes = [
  {id:'signal', name:'Сигнал', title:'Поймай позывной', crew:'Самолётик', portrait:'plane',
    task:'Среди помех слышен аварийный сигнал. Сверь наблюдения экипажа и найди канал дрона.'},
  {id:'power', name:'Питание', title:'Оживи станцию', crew:'Ассистентка', portrait:'assistant',
    task:'У тебя пять ячеек энергии. Запусти щит, двигатели и лебёдку, затем выбери, чему дать запас.'},
  {id:'rescue', name:'Спасение', title:'Забери Светляка', crew:'Синий Гуманоид', portrait:'blue',
    task:'Доберись до дрона, закрепи трос и вернись к шлюзу. Смотри, куда идёт следующая волна.'},
  {id:'docking', name:'Стыковка', title:'Поймай окно стыковки', crew:'Капитан', portrait:'captain',
    task:'Выведи шаттл на среднюю ось. Когда створки разойдутся, подойди к кольцу и состыкуйся.'},
  {id:'journal', name:'Журнал', title:'Светляк дома', crew:'Робот', portrait:'robot',
    task:'Дрон в ангаре. Его аварийная запись и отчёт экипажа доступны в журнале.'}
];

export const channels = [
  {number:17, beats:[1,3,2]},
  {number:28, beats:[2,1,1]},
  {number:42, beats:[2,3,1]},
  {number:61, beats:[2,3,2]}
];
const DISTRESS = 2;
export const observations = [
  {action:'scout', bit:1, speaker:'Самолётик', clue:'Первый импульс средней силы, последний слабый.'},
  {action:'robot', bit:2, speaker:'Робот', clue:'Самый сильный импульс идёт вторым.'}
];
export const systems = [
  {id:'shield', name:'Щит', need:2, bonus:'Погасит одну волну, если она заденет Гуманоида.'},
  {id:'drive', name:'Двигатели', need:1, bonus:'Удержат шаттл у закрытых створок без отката.'},
  {id:'winch', name:'Лебёдка', need:1, bonus:'Позволит взять дрон на трос с соседней клетки.'}
];
export const POWER = 5;
export const COLS = 6;
export const route = ['##..D#','#..A.#','#.#..#','#G.A##'].join('');
export const HOME = route.indexOf('G');
export const DRONE = route.indexOf('D');
export const directions = [
  {id:'up', label:'Вверх', arrow:'↑', dx:0, dy:-1},
  {id:'right', label:'Вправо', arrow:'→', dx:1, dy:0},
  {id:'down', label:'Вниз', arrow:'↓', dx:0, dy:1},
  {id:'left', label:'Влево', arrow:'←', dx:-1, dy:0}
];

export function freshStorm() {
  return {
    version:1, stage:0, signal:{band:0, observations:0}, power:[0,0,0],
    rescue:{cell:HOME, anchor:HOME, turn:0, shield:0, hits:0, tether:false},
    docking:{lane:0, range:4, turn:0, retries:0}
  };
}

function between(value, min, max = Number.MAX_SAFE_INTEGER) {
  return Number.isSafeInteger(value) && value >= min && value <= max;
}
const walkable = cell => between(cell,0,route.length-1) && route[cell] !== '#';
const safe = cell => route[cell] === 'A' || route[cell] === 'G';
const used = power => power.reduce((sum, amount) => sum + amount, 0);
export const readyPower = power => used(power) === POWER && systems.every(({need}, i) => power[i] >= need);
export const remaining = power => POWER - used(power);
export const waveColumn = turn => (turn + 2) % COLS;
export const openWindow = turn => turn % 4 >= 2;

export function restoreStorm(record) {
  const {version, stage, signal, power, rescue, docking} = record ?? {};
  if (version !== 1 || !between(stage,0,4)
    || !between(signal?.band,0,channels.length-1) || !between(signal?.observations,0,3)
    || !Array.isArray(power) || power.length !== systems.length || !systems.every((_, i) => between(power[i],0,POWER))
    || used(power) > POWER || !walkable(rescue?.cell) || !safe(rescue?.anchor)
    || !between(rescue.turn,0) || !between(rescue.shield,0,Math.max(0,power[0]-2)) || !between(rescue.hits,0)
    || typeof rescue.tether !== 'boolean' || !between(docking?.lane,0,2) || !between(docking.range,1,4)
    || !between(docking.turn,0) || !between(docking.retries,0)
    || (stage > 0 && (signal.band !== DISTRESS || signal.observations !== 3))
    || (stage > 1 && !readyPower(power))
    || (stage > 2 && (rescue.cell !== HOME || !rescue.tether))
    || (stage === 4 && (docking.lane !== 1 || docking.range !== 1 || !openWindow(docking.turn)))) return freshStorm();
  return {version,stage,signal:{...signal},power:[...power],rescue:{...rescue},docking:{...docking}};
}

const accept = (state, note = '', speak = false) => ({state,note,speak});
const update = (state, patch, note = '', speak = false) => accept({...state,...patch},note,speak);

function signalStep(state, action) {
  const {signal} = state;
  const observer = observations.find(item => item.action === action);
  if (observer) return update(state,{signal:{...signal,observations:signal.observations|observer.bit}},observer.clue,true);
  if (action === 'lock') {
    if (signal.observations !== 3) return accept(state,'Сначала сверь оба наблюдения.');
    if (signal.band !== DISTRESS) return accept(state,'Позывной не совпал. Сверь высоту и порядок импульсов.',true);
    return update(state,{stage:1},'Есть контакт. Светляк находится снаружи станции!',true);
  }
  const channel = channels.findIndex(({number}) => action === 'band-'+number);
  return channel < 0 ? accept(state) : update(state,{signal:{...signal,band:channel}});
}

function powerStep(state, action) {
  if (action === 'commit') {
    if (!readyPower(state.power)) return accept(state,'Запусти все три системы и распредели последнюю ячейку.');
    return update(state,{stage:2,rescue:{...state.rescue,shield:state.power[0]-2}},'Огни загорелись. Шлюз готов к выходу.',true);
  }
  const [mode,id] = action.split('-');
  const index = systems.findIndex(system => system.id === id);
  if (index < 0 || !['add','sub'].includes(mode)) return accept(state);
  if (mode === 'add' && remaining(state.power) === 0) return accept(state,'Свободных ячеек нет. Сними одну с другой системы.');
  if (mode === 'sub' && !state.power[index]) return accept(state);
  const power = state.power.map((amount,i) => i === index ? amount + (mode === 'add' ? 1 : -1) : amount);
  return update(state,{power});
}

export function neighbor(cell, direction) {
  const x = cell % COLS + direction.dx;
  const y = Math.floor(cell / COLS) + direction.dy;
  return x < 0 || x >= COLS || y < 0 || y >= route.length / COLS ? -1 : y * COLS + x;
}

export function canTether(state) {
  const {rescue,power} = state;
  return !rescue.tether && (rescue.cell === DRONE
    || (power[2] === 2 && directions.some(direction => neighbor(rescue.cell,direction) === DRONE)));
}

function rescueStep(state, action) {
  const {rescue,power} = state;
  if (action === 'return') {
    if (rescue.cell !== HOME || !rescue.tether) return accept(state,'Вернись к шлюзу со Светляком на тросе.');
    return update(state,{stage:3},'Светляк в шлюзе. Теперь нужно посадить шаттл.',true);
  }
  if (action === 'attach') {
    if (!canTether(state)) return accept(state,'Подойди к Светляку ближе, чтобы закрепить трос.');
    return update(state,{rescue:{...rescue,tether:true}},'Трос закреплён. Светляк пойдёт за тобой.',true);
  }
  if (action === 'reset-rescue') {
    return update(state,{rescue:{...freshStorm().rescue,shield:power[0]-2}},'Экипаж снова у шлюза.');
  }
  const direction = directions.find(item => item.id === action);
  if (!direction && action !== 'wait-wave') return accept(state);
  const cell = direction ? neighbor(rescue.cell,direction) : rescue.cell;
  if (!walkable(cell)) return accept(state,'Там нет направляющей. Выбери соседнюю клетку маршрута.');
  const wave = cell % COLS === waveColumn(rescue.turn) && !safe(cell);
  const next = {...rescue,cell,turn:rescue.turn+1,anchor:safe(cell)?cell:rescue.anchor};
  if (!wave) return update(state,{rescue:next},action === 'wait-wave' ? 'Волна сместилась на следующий столбец.' : '');
  if (rescue.shield) return update(state,{rescue:{...next,shield:0}},'Запас щита погасил волну. Маршрут сохранён.',true);
  return update(state,{rescue:{...next,cell:rescue.anchor,hits:rescue.hits+1}},
    'Страховка подтянула к последнему якорю. Подожди, пока пройдёт волна.',true);
}

function dockStep(state, action) {
  const {docking,power} = state;
  const turn = docking.turn + 1;
  if (action === 'align-left' || action === 'align-right') {
    const lane = docking.lane + (action === 'align-left' ? -1 : 1);
    if (!between(lane,0,2)) return accept(state);
    return update(state,{docking:{...docking,lane,turn}},lane === 1 ? 'Шаттл на оси кольца.' : '');
  }
  if (action === 'coast') return update(state,{docking:{...docking,turn}},'Створки сменили фазу.');
  if (action === 'approach') {
    if (docking.lane !== 1) return accept(state,'Сначала выйди на среднюю ось.');
    if (docking.range === 1) return accept(state,'Кольцо рядом. Поймай зелёное окно.');
    return update(state,{docking:{...docking,range:docking.range-1,turn}},'Расстояние до кольца уменьшилось.');
  }
  if (action !== 'dock') return accept(state);
  if (docking.lane !== 1 || docking.range !== 1) return accept(state,'Подойди к створкам по средней оси.');
  if (openWindow(docking.turn)) return update(state,{stage:4},'Стыковка завершена. Светляк дома!',true);
  return update(state,{docking:{...docking,range:power[1]===2?1:2,turn,retries:docking.retries+1}},
    power[1]===2 ? 'Двигатели удержали шаттл. Дождись зелёного окна.'
      : 'Закрытые створки заставили отойти. Выровняй заход и дождись окна.',true);
}

const commands = [signalStep,powerStep,rescueStep,dockStep];
export function stepStorm(state, scene, action) {
  const index = scenes.findIndex(item => item.id === scene);
  if (index !== state.stage || !commands[index] || typeof action !== 'string') return accept(state);
  return commands[index](state,action);
}

export function sceneIndex(state, hash) {
  const index = scenes.findIndex(scene => scene.id === hash);
  return index >= 0 && index <= state.stage ? index : state.stage;
}
