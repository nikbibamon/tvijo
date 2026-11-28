import {directions, directionNames, neighbor, shuffled} from './grid.js';

const first = {width:7, height:5, start:15, goal:20, walls:[2, 11, 23, 25, 29, 32]};

export function slide(board, start, direction) {
  const vector = directions[direction];
  if (!vector || !Object.hasOwn(directions, direction)) return start;
  let position = start;
  for (;;) {
    const next = neighbor(board.width, board.height, position, vector);
    if (next < 0 || board.walls.includes(next)) return position;
    position = next;
  }
}

function landingGraph(board, start) {
  const found = new Map([[start, []]]);
  const queue = [start];
  for (const position of queue) {
    for (const direction of Object.keys(directions)) {
      const next = slide(board, position, direction);
      if (found.has(next)) continue;
      found.set(next, [...found.get(position), direction]);
      queue.push(next);
    }
  }
  return found;
}

export function icePlan(board, position=board.start) {
  return landingGraph(board, position).get(board.goal) ?? null;
}

const fallback = {width:9, height:7, start:50, walls:[1, 2, 5, 9, 13, 15, 21, 25, 28, 31, 35, 37, 43, 46, 48, 53, 60]};

function generated(level, pick) {
  const distance = Math.min(level, 7);
  for (let attempt = 0; attempt < 48; attempt++) {
    const width = level < 4 ? 7 : 9;
    const height = level < 4 ? 5 : 7;
    const cells = shuffled(Array.from({length:width*height}, (_, index)=>index), pick);
    const start = cells.shift();
    const walls = cells.slice(0, level < 4 ? 8 : 15);
    const board = {width, height, start, walls};
    const goals = [...landingGraph(board, start)].filter(([, path])=>path.length===distance);
    if (goals.length) return {...board, goal:goals[pick(goals.length)][0]};
  }
  const goals = [...landingGraph(fallback, fallback.start)].filter(([, path])=>path.length===distance);
  if (!goals.length) throw Error('Ice fallback is too short');
  return {...fallback, goal:goals[pick(goals.length)][0]};
}

export const ice = {
  title:'Ледяной разгон', hero:'Самолётик', sprite:'plane',
  hook:'Скользи до упора и причаль к маяку.',
  instructions:'Выбери направление. Самолётик скользит, пока его не остановит опора или край поля.',
  first, generate:generated, start:board=>({position:board.start}),
  move(board, state, action) {
    const position = slide(board, state.position, action);
    if (position === state.position) return {message:'Там опора. Выбери другое направление.'};
    return {state:{position}, won:position===board.goal, motion:{from:state.position, to:position}};
  },
  hint(board, state) {
    const direction = icePlan(board, state.position)?.[0];
    return direction ? {text:'Попробуй '+directionNames[direction]+'.', control:direction}
      : {text:'До маяка отсюда не докатиться. Сделай шаг назад.', control:'undo'};
  }
};
