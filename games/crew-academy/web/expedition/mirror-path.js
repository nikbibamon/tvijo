import {directions,neighbor} from '../playground/grid.js';

const names = Object.keys(directions);
const reflection = [[1,0,3,2],[3,2,1,0]];

export function traceMirrorPath(layout, angles) {
  const {width,height,source,receiver,walls,mirrors} = layout;
  const beams = Array.from({length:width*height},()=>[]);
  const visited = new Set();
  let cell = source;
  let direction = 1;

  while (!visited.has(cell*4+direction)) {
    visited.add(cell*4+direction);
    const next = neighbor(width,height,cell,directions[names[direction]]);
    if (next<0) break;
    beams[cell].push(names[direction]);
    beams[next].push(names[(direction+2)%4]);
    if (next===receiver) return {beams,reaches:true};
    if (walls.includes(next)) break;
    const mirror = mirrors.indexOf(next);
    if (mirror!==-1) direction = reflection[angles[mirror]][direction];
    cell = next;
  }
  return {beams,reaches:false};
}
