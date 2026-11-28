import {directionNames,directions,neighbor} from './grid.js';

const width=9, height=5, deck=2;
const index=(x,y)=>y*width+x;

function layout(rows) {
  const tiles=rows.join('');
  const switches=[];
  for (let point=0;point<tiles.length;point++) {
    if (tiles[point]==='T') switches.push(point);
  }
  return {width,height,tiles,start:tiles.indexOf('S'),switches};
}

const first=layout([
  '#########',
  '###~T~###',
  '#...S..G#',
  '#########',
  '#########'
]);

function generate(level,pick) {
  const rows=Array.from({length:height},()=>Array(width).fill('#'));
  rows[deck]=[...'#......G#'];
  const lowerHatch=2+pick(5);
  rows[deck][level===2?lowerHatch:2+pick(5)]='S';

  function branch(row,hatch,distance) {
    const direction=pick(2)?1:-1;
    const room=direction===1?width-2-hatch:hatch-1;
    const length=Math.min(distance,room);
    rows[(row+deck)/2][hatch]='H';
    for (let step=0;step<=length;step++) rows[row][hatch+step*direction]=step===length?'T':'~';
  }

  branch(4,lowerHatch,level>=5?2+pick(2):1);
  if (level>=3) branch(0,2+pick(5),level>=4?1+pick(2):0);
  return layout(rows.map(row=>row.join('')));
}

function passable(layout,point,actor,open) {
  const tile=layout.tiles[point];
  if (tile==='G') return open;
  return tile==='.' || tile==='S' || actor==='plane' && ['~','H','T'].includes(tile);
}

export function canActivate(layout,state) {
  return layout.switches.includes(state.position) && !state.lit.includes(state.position);
}

function start(layout) {
  return {position:layout.start,lit:[]};
}

function move(layout,state,input,actor='plane') {
  if (input==='activate') {
    if (actor!=='plane' || !canActivate(layout,state)) return {message:'Подлети к свободному переключателю.'};
    const lit=[...state.lit,state.position], won=lit.length===layout.switches.length;
    return {state:{...state,lit},won,message:won?'Шлюз открыт.':'Питание подано. Найди второй переключатель.'};
  }
  if (!Object.hasOwn(directions,input)) return null;
  const position=neighbor(layout.width,layout.height,state.position,directions[input]);
  if (!passable(layout,position,actor,state.lit.length===layout.switches.length)) {
    return {message:'Дальше обшивка. Ищи проход.'};
  }
  const next={...state,position};
  return {state:next,motion:{from:state.position},message:canActivate(layout,next)?'Переключатель рядом. Включи его.':undefined};
}

function hint(layout,state) {
  if (canActivate(layout,state)) return {control:'activate',text:'Нажми «Включить переключатель».'};
  const seen=new Set([state.position]), pending=[[state.position,null]];
  for (let cursor=0;cursor<pending.length;cursor++) {
    const [point,firstStep]=pending[cursor];
    if (canActivate(layout,{...state,position:point})) {
      return {control:firstStep,text:'Лети '+directionNames[firstStep]+' к переключателю.'};
    }
    for (const [direction,offset] of Object.entries(directions)) {
      const next=neighbor(layout.width,layout.height,point,offset);
      if (seen.has(next) || !passable(layout,next,'plane',false)) continue;
      seen.add(next);
      pending.push([next,firstStep??direction]);
    }
  }
  return null;
}

function instructions(layout,level) {
  if (layout.switches.length===2) return 'Пролети через оба люка и включи два переключателя.';
  return level===1?'Поднимись к потолочному переключателю и включи его.':
    'Нырни в узкий люк под настилом и включи нижний переключатель.';
}

export const flight={
  title:'Воздушный обход', hero:'Самолётик', sprite:'plane',
  hook:'Поднимись к потолку, затем загляни под настил.',
  first,generate,start,move,hint,instructions
};
