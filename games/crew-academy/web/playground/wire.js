import {directions, neighbor, shuffled} from './grid.js';

const vectors = Object.values(directions);
export const ports = ['сверху', 'справа', 'снизу', 'слева'];

export function rotate(mask, times) {
  for (let turn = 0; turn < times; turn++) mask = ((mask << 1) | (mask >> 3)) & 15;
  return mask;
}

function layout(width, height, path) {
  const modules = Array(width * height).fill(0);
  for (let i = 0; i < path.length; i++) {
    const cell = path[i];
    const link = next => 1 << vectors.findIndex(vector=>neighbor(width,height,cell,vector)===next);
    const incoming = i===0 ? 8 : link(path[i-1]);
    const outgoing = i===path.length-1 ? 2 : link(path[i+1]);
    modules[cell] = incoming | outgoing;
  }
  return {width, height, modules, inlet:path[0], outlet:path.at(-1), turns:modules.map(()=>0)};
}

const first = layout(5,3,[5,6,7,8,9]);
first.turns[7] = 1;

function generated(level, pick) {
  const width = level < 5 ? 5 : 6;
  const height = level < 4 ? 3 : 4;
  const corners = new Set(shuffled(Array.from({length:width-2},(_, i)=>i+1),pick).slice(0,Math.min(level-1,width-2)));
  const path = [];
  let row = pick(height);
  for (let col = 0; col < width; col++) {
    path.push(row * width + col);
    if (corners.has(col)) {
      row += row === 0 || row < height-1 && pick(2) ? 1 : -1;
      path.push(row * width + col);
    }
  }
  const result = layout(width,height,path);
  const mixed = shuffled(path,pick).slice(0,Math.min(level, 8, path.length));
  for (const cell of mixed) result.turns[cell] = result.modules[cell] === 5 || result.modules[cell] === 10 ? 1 : 1+pick(3);
  return result;
}

export function power(board, rotations) {
  const masks = board.modules.map((mask,cell)=>rotate(mask,rotations[cell]));
  const lit = new Set();
  if (masks[board.inlet] & 8) lit.add(board.inlet);
  for (const cell of lit) {
    for (const [port, vector] of vectors.entries()) {
      if (!(masks[cell] & (1 << port))) continue;
      const next = neighbor(board.width,board.height,cell,vector);
      if (next >= 0 && masks[next] & (1 << ((port+2)%4))) lit.add(next);
    }
  }
  return {masks, lit, won:lit.has(board.outlet) && Boolean(masks[board.outlet]&2)};
}

export function wirePlan(board, rotations) {
  return board.modules.flatMap((mask,cell)=>{
    if (!mask) return [];
    let offset = 0;
    while (rotate(mask, (rotations[cell]+offset)%4)!==mask) offset++;
    return Array(offset).fill(cell);
  });
}

export const wire = {
  title:'Световой контур', hero:'Дочка', sprite:'daughter',
  hook:'Поверни контакты и зажги лампу.',
  instructions:'Нажимай на модули, чтобы повернуть их. Проведи свет от источника слева к лампе справа.',
  first, generate:generated, start:board=>({rotations:board.turns.slice()}),
  move(board, state, cell) {
    if (!Number.isInteger(cell) || !board.modules[cell]) return null;
    const rotations = state.rotations.slice();
    rotations[cell] = (rotations[cell]+1)%4;
    const current = power(board,rotations);
    return {state:{rotations}, won:current.won,
      message:current.lit.size ? 'Свет дошёл до '+current.lit.size+' модулей.' : 'Цепь разомкнута у источника.'};
  },
  hint(board, state) {
    const control = wirePlan(board,state.rotations)[0];
    return {text:'Поверни выделенный модуль.', control};
  }
};
