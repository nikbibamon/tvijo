export const loads = [
  {name:'Энергоячейка', plate:'Питание', symbol:'wh-energy'},
  {name:'Хладагент', plate:'Охлаждение', symbol:'wh-coolant'}
];
export const directions = {up:[0,-1], right:[1,0], down:[0,1], left:[-1,0]};

function plan(name, art, rows) {
  const map=rows.join('');
  return {name,art,map,width:rows[0].length,height:rows.length,robot:map.indexOf('@'),
    start:['a','b'].map(c=>map.indexOf(c)),plates:['A','B'].map(c=>map.indexOf(c))};
}
export const jobs = {
  line:plan('Погрузочная линия','depot',[
    '##...##', '....A..', '.@a.#..', '...b.B.', '.#....#'
  ]),
  express:plan('Экспресс-сортировка','sorting',[
    '##..#..#', '....##A#', '.@a.>>Y#', '..b.##B#', '......##'
  ])
};

export function newShift(id) {
  const job=jobs[id];
  return {player:job.robot,boxes:[...job.start],moves:0,pushes:0,rides:0,switches:0,branch:'upper',sent:false};
}
const floor=(job,n)=>Number.isInteger(n)&&n>=0&&n<job.map.length&&job.map[n]!=='#';
export function neighbor(job,from,dir) {
  const d=directions[dir];if(!d)return -1;
  const x=from%job.width+d[0],y=Math.floor(from/job.width)+d[1];
  return x>=0&&x<job.width&&y>=0&&y<job.height?y*job.width+x:-1;
}
export const matched=(job,b)=>job.plates.filter((plate,i)=>b.boxes[i]===plate).length;
export const onBelt=(job,cell)=>job.map[cell]==='>'||job.map[cell]==='Y';
export function plateState(job,b,i) {
  if(b.boxes[i]===job.plates[i])return 'На месте';
  return b.boxes.includes(job.plates[i])?'Чужой груз':'Ждёт груз';
}
const trapped=(job,cell)=>(!floor(job,neighbor(job,cell,'left'))||!floor(job,neighbor(job,cell,'right')))&&
  (!floor(job,neighbor(job,cell,'up'))||!floor(job,neighbor(job,cell,'down')));

export function move(job,b,dir) {
  if(b.sent || !Object.hasOwn(directions,dir))return {board:b};
  const target=neighbor(job,b.player,dir);
  if(!floor(job,target))return {board:b,message:'Здесь стеллаж. Обойди его по настилу.'};
  const index=b.boxes.indexOf(target);
  if(index<0)return {board:{...b,player:target,moves:b.moves+1}};
  let dest=neighbor(job,target,dir);
  if(!floor(job,dest)||b.boxes.includes(dest))return {board:b,message:'За ящиком занято. Подойди к нему с другой стороны.'};
  const path=[target,dest];
  while(onBelt(job,dest)){
    const nextDir=job.map[dest]==='>'?'right':b.branch==='upper'?'up':'down';
    dest=neighbor(job,dest,nextDir);
    if(!floor(job,dest)||b.boxes.includes(dest)||dest===b.player)
      return {board:b,message:'Приёмник на этой ветке занят. Переведи стрелку или освободи плиту.'};
    path.push(dest);
  }
  const boxes=[...b.boxes];boxes[index]=dest;
  const routed=path.length>2;
  const board={...b,player:target,boxes,moves:b.moves+1,pushes:b.pushes+1,rides:b.rides+Number(routed)};
  let message=loads[index].name+' на новом месте.';
  if(dest===job.plates[index])message='Плита «'+loads[index].plate+'» включилась.';
  else if(job.plates.includes(dest))message='Чужая плита. Верни толчок и выбери другую '+(routed?'ветку.':'сторону подхода.');
  else if(trapped(job,dest))message='Ящик оказался в углу. Кнопка «Вернуть толчок» вернёт его назад.';
  if(matched(job,board)===loads.length)message='Обе плиты готовы. Можно отправлять груз.';
  return {board,message,travel:{index,path}};
}

const counter=n=>Number.isSafeInteger(n)&&n>=0;
function validBoard(job,b) {
  return b && floor(job,b.player) && Array.isArray(b.boxes)&&b.boxes.length===2 &&
    b.boxes.every(n=>floor(job,n)&&!onBelt(job,n)&&n!==b.player)&&b.boxes[0]!==b.boxes[1] &&
    ['moves','pushes','rides','switches'].every(k=>counter(b[k])) && b.pushes<=b.moves && b.rides<=b.pushes &&
    ['upper','lower'].includes(b.branch)&&typeof b.sent==='boolean'&&(!b.sent||matched(job,b)===2);
}
const turn=b=>b.moves+b.switches;
export function readShift(warehouse,id) {
  const job=jobs[id],raw=warehouse?.shifts?.[id];
  if(!validBoard(job,raw?.board))return {board:newShift(id),history:[],pushHistory:[],returns:0};
  const history=(list,max)=>Array.isArray(list)?list.slice(-max).filter(b=>validBoard(job,b)&&!b.sent&&turn(b)<turn(raw.board)):[];
  return {board:raw.board,history:history(raw.history,96),pushHistory:history(raw.pushHistory,24),returns:counter(raw.returns)?raw.returns:0};
}
export function changeShift(id,run,action) {
  const job=jobs[id],b=run.board;
  if(action.type==='restart')return {run:readShift(null,id),message:'Наряд начат заново.'};
  if(b.sent)return {run};
  if(action.type==='undo'||action.type==='rewind'){
    const target=(action.type==='rewind'?run.pushHistory:run.history).at(-1);
    if(!target)return {run};
    const earlier=s=>turn(s)<turn(target);
    return {run:{board:target,history:run.history.filter(earlier),pushHistory:run.pushHistory.filter(earlier),
      returns:run.returns+Number(target.pushes<b.pushes)},message:action.type==='rewind'?'Груз и Робот вернулись к последнему толчку.':'Ход отменён.'};
  }
  if(action.type==='ship'){
    if(matched(job,b)!==2)return {run,message:'Сначала поставь оба груза на свои плиты.'};
    return {run:{...run,board:{...b,sent:true}},shipped:true};
  }
  let result;
  if(action.type==='route'){
    if(id!=='express'||!['upper','lower'].includes(action.to)||b.branch===action.to)return {run};
    result={board:{...b,branch:action.to,switches:b.switches+1},message:action.to==='upper'?'Стрелка ведёт на верхний приёмник.':'Стрелка ведёт на нижний приёмник.'};
  }else if(action.type==='move')result=move(job,b,action.dir);
  else if(action.type==='cell'){
    const dir=Object.keys(directions).find(k=>neighbor(job,b.player,k)===action.cell);
    if(!dir)return {run,message:'Коснись клетки рядом с Роботом или нажми стрелку.'};
    result=move(job,b,dir);
  }else return {run};
  if(result.board===b)return {run,message:result.message};
  return {run:{...run,board:result.board,history:[...run.history.slice(-95),b],
    pushHistory:result.travel?[...run.pushHistory.slice(-23),b]:run.pushHistory},message:result.message,travel:result.travel};
}

export function reportLine(report) {
  return 'Энергоячейка — на плите «Питание», хладагент — на плите «Охлаждение». Толчков — '+report.pushes+
    (report.id==='express'?'. Проездов по ленте — '+report.rides:'')+'. Возвратов груза — '+report.returns+'.';
}
