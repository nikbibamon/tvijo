export const crew = [
  {name:'Искра', color:'#ffe295'},
  {name:'Болт', color:'#8bf0e2'},
  {name:'Луна', color:'#e3b2ff'},
  {name:'Ток', color:'#a9c9ff'},
  {name:'Пикс', color:'#ffac94'}
];
export const GATE = 8;
export const SIDING = 9;
export const dayPrize = 'drones';
export const nightPrize = 'drones-night';
export const modes = {day:'Дневная смена', night:'Ночная смена'};
export const rescued = board => board.positions.filter(p => p === GATE).length;
export const roleName = (board, i) => i === board.builder ? (board.mode === 'night' ? 'Лифт' : 'Трап') : i === board.signaller ? 'Стрелка' : 'В колонне';

export function newConvoy(mode = 'day') {
  return {mode, positions:[0,-1,-2,-3,-4], builder:-1, signaller:-1, bridge:false, routed:false,
    direction:'gate', power:'lift', turns:0, detours:0, switches:0};
}
const validDrone = i => Number.isInteger(i) && i >= 0 && i < crew.length;
const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;

function readBoard(raw, mode) {
  if (!Array.isArray(raw?.positions) || raw.positions.length !== crew.length ||
      !raw.positions.every((p,i) => Number.isInteger(p) && p >= -i && p <= SIDING)) return null;
  if (raw.positions.some(p => p > 2) && raw.bridge !== true ||
      raw.positions.some(p => p > 5) && raw.routed !== true) return null;
  const builder = validDrone(raw.builder) ? raw.builder : -1;
  return {...newConvoy(mode), positions:[...raw.positions], builder,
    signaller:validDrone(raw.signaller) && raw.signaller !== builder ? raw.signaller : -1,
    bridge:raw.bridge === true, routed:raw.routed === true, direction:raw.direction === 'siding' ? 'siding' : 'gate',
    power:raw.power === 'beacon' ? 'beacon' : 'lift', turns:count(raw.turns),
    detours:count(raw.detours), switches:count(raw.switches)};
}

export function restoreRun(record, legacy) {
  const modern = record?.v === 2;
  const raw = modern ? record : legacy;
  const mode = modern && raw.board?.mode === 'night' ? 'night' : 'day';
  const board = readBoard(raw?.board,mode);
  return {v:2, board:board || newConvoy(mode), selected:validDrone(raw?.selected) ? raw.selected : 0,
    revision:modern ? count(raw.revision) : 0,
    history:board && Array.isArray(raw?.history) ? raw.history.slice(-32).map(item => readBoard(item,mode)).filter(Boolean) : []};
}

export function advanceConvoy(board) {
  const p = board.positions;
  const bridge = board.bridge || (validDrone(board.builder) && p[board.builder] >= 2);
  const routed = board.routed || (validDrone(board.signaller) && p[board.signaller] >= 5);
  const liftOn = board.mode !== 'night' || board.power === 'lift';
  const beaconOn = board.mode !== 'night' || board.power === 'beacon';
  const positions = p.map(slot => {
    if (slot === GATE) return GATE;
    if (slot === SIDING) return board.direction === 'gate' && routed && beaconOn ? 5 : SIDING;
    if (slot === 2 && !(bridge && liftOn)) return slot;
    if (slot === 5) {
      if (!(routed && beaconOn)) return slot;
      if (board.direction === 'siding') return SIDING;
    }
    return slot + 1;
  });
  if (bridge === board.bridge && routed === board.routed && positions.every((slot,i) => slot === p[i])) return board;
  const entered = positions.filter((slot,i) => slot === SIDING && p[i] !== SIDING).length;
  return {...board, positions, bridge, routed, turns:board.turns+1, detours:board.detours+entered};
}

export function atStop(board, i) {
  const pos = board.positions[i];
  if (pos === GATE) return 'В шлюзе';
  if (pos === SIDING) return 'В кармане';
  if (pos === 2 && (!board.bridge || board.mode === 'night' && board.power !== 'lift')) return board.mode === 'night' ? 'У лифта' : 'У разрыва';
  if (pos === 5 && (!board.routed || board.mode === 'night' && board.power !== 'beacon')) return 'У стрелки';
  if (pos <= 0) return 'На старте';
  return 'В пути';
}

export function guidance(board) {
  if (rescued(board) === crew.length) return 'Все пятеро у шлюза. Смена в сборе.';
  const naming = slot => crew.filter((_,i) => board.positions[i] === slot).map(d => d.name).join(', ');
  if (board.positions.includes(SIDING) && board.direction === 'siding')
    return naming(SIDING) + ' — в ремонтном кармане. Переведи стрелку к шлюзу и возобнови марш.';
  if (board.positions.includes(2) && !board.bridge && board.builder < 0)
    return naming(2) + (board.mode === 'night' ? ' — у лифта. Выбери дрона и поручи ему лифт.' : ' — у разрыва. Выбери дрона и поручи ему трап.');
  if (board.positions.includes(5) && !board.routed && board.signaller < 0)
    return naming(5) + ' — у развилки. Поручи стрелку свободному дрону.';
  if (board.mode === 'night' && board.power === 'lift' && (board.positions.includes(5) || board.positions.includes(SIDING)))
    return 'У стрелки ждёт колонна. Переключи питание с лифта на маяк, когда нужные дроны пересекут разрыв.';
  if (board.mode === 'night' && board.power === 'beacon' && board.positions.includes(2))
    return naming(2) + ' — у лифта без питания. Верни питание на лифт, чтобы забрать отставших.';
  if (!board.turns && board.builder < 0) return 'Выбери дрона для '+(board.mode === 'night' ? 'лифта' : 'трапа')+' и второго для стрелки. Или отправь колонну к первому препятствию.';
  if (board.routed) return 'Следи за колонной у развилки и огнями шлюза.';
  return board.bridge ? 'Трасса через разрыв готова. Впереди стрелка.' : 'Колонна готова к маршу.';
}

export function canAssign(board, index, role) {
  if (!validDrone(index) || !['builder','signaller'].includes(role) || board.positions[index] === GATE) return false;
  if (role === 'builder') return !board.bridge && !(board.routed && board.signaller === index);
  return !board.routed && !(board.bridge && board.builder === index);
}

export function changeRun(run, action, daylightCleared) {
  const {board, selected} = run;
  if (action.expected !== undefined && action.expected !== run.revision) return run;
  const revision = run.revision+1;
  if (['restart','day','night'].includes(action.type)) {
    if (action.type !== 'restart' && (board.mode === action.type || !daylightCleared ||
        rescued(board) !== crew.length && (board.turns || board.builder >= 0 || board.signaller >= 0))) return run;
    const mode = action.type === 'restart' ? board.mode : action.type;
    return {...restoreRun(null),revision,board:newConvoy(mode)};
  }
  if (action.type === 'select')
    return validDrone(action.id) && action.id !== selected ? {...run,selected:action.id,revision} : run;
  if (action.type === 'undo') {
    if (!run.history.length || rescued(board) === crew.length) return run;
    return {...run,board:run.history.at(-1),history:run.history.slice(0,-1),revision};
  }
  if (rescued(board) === crew.length) return run;
  let next = board;
  switch (action.type) {
    case 'step': next = advanceConvoy(board); break;
    case 'assign': {
      const role = action.role;
      if (!canAssign(board,selected,role)) return run;
      const other = role === 'builder' ? 'signaller' : 'builder';
      const id = board[role] === selected ? -1 : selected;
      next = {...board,[role]:id,[other]:id >= 0 && board[other] === id ? -1 : board[other]};
      break;
    }
    case 'direction':
      if (!['gate','siding'].includes(action.to) || board.direction === action.to) return run;
      next = {...board,direction:action.to}; break;
    case 'power':
      if (board.mode !== 'night' || !['lift','beacon'].includes(action.to) || board.power === action.to) return run;
      next = {...board,power:action.to,switches:board.switches+1}; break;
    default: return run;
  }
  return next === board ? run : {...run,board:next,history:[...run.history.slice(-31),board],revision};
}

export function reportLine(report) {
  const names = [crew[report.builder]?.name,crew[report.signaller]?.name];
  const tool = report.mode === 'night' ? 'Лифт' : 'Трап';
  const roles = (names[0] ? tool+' — '+names[0]+'. ' : '')+(names[1] ? 'Стрелка — '+names[1]+'. ' : '');
  const detours = report.detours ? 'Заездов в ремонтный карман — '+report.detours+'.' : 'Колонна прошла прямо к шлюзу.';
  return roles + detours + (report.mode === 'night' ? ' Переключений питания — '+report.switches+'.' : '');
}
