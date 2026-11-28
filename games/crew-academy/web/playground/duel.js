export const field = {width:120,height:70,water:61};
export const elevations = [29,43,57];
export const powerLabels = [45,60,75,90,100];
const speeds = [23,29,35,40,45];
const radius = 8;
const rounds = 10;
const {width,water} = field;

function arena({wind=0,left=43,right=43,edge=0,offset=0,ridge=0,training=false}={}) {
  const terrain = Array.from({length:width},(_,x)=>{
    if (x>=5 && x<=38+edge) return left+(x<10?2:x>34+edge?3:Math.floor(x/7)%2);
    if (x>=75+edge && x<=115) return right+(x<80+edge?3:x>110?2:Math.floor(x/7)%2);
    if (ridge && Math.abs(x-57-offset)<=5) return ridge+Math.floor(Math.abs(x-57-offset)/2);
    return null;
  });
  return {terrain,wind,spawn:[17,91+offset],training};
}

const first = arena({training:true});

function start(layout) {
  return {
    terrain:layout.terrain, turn:0, outcome:null, last:null,
    angle:layout.training?1:0, force:layout.training?2:1,
    pilots:layout.spawn.map((x,i)=>({x,y:layout.terrain[x],shield:i===1&&layout.training?40:100}))
  };
}

export function trace(layout,board,side,angle=board.angle,force=board.force,trail=false) {
  const pilot=board.pilots[side], rival=board.pilots[1-side];
  const direction=side===0?1:-1;
  const radians=elevations[angle]*Math.PI/180, speed=speeds[force];
  const vx=Math.cos(radians)*speed*direction, vy=-Math.sin(radians)*speed;
  const points=trail?[]:null;
  for (let step=0;step<=180;step++) {
    const t=step/20, x=pilot.x+direction*2+vx*t+layout.wind*t*t/2;
    const y=pilot.y-5+(vy+8.5*t)*t;
    if (points) points.push({x,y});
    if (x<0 || x>=width || y>=water) return {x,y:Math.min(y,water),kind:'water',points};
    if (Math.hypot(x-rival.x,y-(rival.y-3))<=3.2) return {x,y,kind:'hit',points};
    const surface=board.terrain[Math.floor(x)];
    if (surface!==null && y>=surface) return {x,y:surface,kind:'ground',points};
  }
  return {x:width/2,y:water,kind:'water',points};
}

function pulse(board,side,target) {
  if (target.kind==='water') return board;
  const {x,y}=target;
  const terrain=board.terrain.map((surface,col)=>{
    const dx=col+.5-x;
    if (surface===null || Math.abs(dx)>=radius) return surface;
    const depth=Math.sqrt(radius*radius-dx*dx);
    if (y-depth>surface) return surface;
    const bottom=Math.ceil(y+depth);
    return bottom>=water?null:Math.max(surface,bottom);
  });
  const pilots=board.pilots.map((pilot,i)=>{
    const distance=Math.hypot(pilot.x-x,pilot.y-3-y);
    if (distance>radius+2) return pilot;
    const direct=target.kind==='hit' && i!==side;
    const away=Math.sign(pilot.x-x)||(side===0?1:-1);
    const push=direct?5:Math.max(1,Math.round((radius+2-distance)/2));
    const nextX=Math.min(width-1,Math.max(0,pilot.x+away*push));
    const surface=terrain[nextX];
    const damage=direct?(side===0?54:28):Math.ceil((radius+2-distance)*(side===0?3:1.8));
    return {x:nextX,y:surface??water,shield:surface===null?0:Math.max(0,pilot.shield-damage)};
  });
  return {...board,terrain,pilots};
}

function aim(layout,board,side,practice=false) {
  const rival=board.pilots[1-side];
  let best=null;
  for (const [angle] of elevations.entries()) {
    for (const [force] of speeds.entries()) {
      const target=trace(layout,board,side,angle,force);
      const distance=Math.hypot(target.x-rival.x,target.y-(rival.y-3));
      const score=practice?Math.abs(distance-15)+(distance<=radius+2?40:0):
        (target.kind==='hit'?-120:target.kind==='water'?30:0)+distance;
      if (!best || score<best.score) best={angle,force,score};
    }
  }
  return best;
}

function outcome(pilots,turn) {
  if (!pilots[0].shield && !pilots[1].shield) return 'draw';
  if (!pilots[0].shield) return 'lost';
  if (!pilots[1].shield) return 'won';
  if (turn===rounds) return 'draw';
  return null;
}

function playRound(layout,board,animate) {
  const turn=board.turn+1, shots=[], motion=[];
  function fire(side,angle,force) {
    const before=board, target=trace(layout,before,side,angle,force,animate);
    board=pulse(before,side,target);
    const dropped=board.pilots.findIndex((pilot,i)=>pilot.y===water && before.pilots[i].y!==water);
    shots.push({kind:target.kind,side,damage:before.pilots[1-side].shield-board.pilots[1-side].shield,dropped});
    if (animate) motion.push({side,before,after:board,target});
  }

  fire(0,board.angle,board.force);
  if (outcome(board.pilots,0)===null) {
    const reply=aim(layout,board,1,layout.training||turn%3===1);
    fire(1,reply.angle,reply.force);
  }
  const end=outcome(board.pilots,turn);
  return {state:{...board,turn,outcome:end,last:shots},won:end==='won',motion};
}

function solvable(layout) {
  let board=start(layout);
  for (let turn=0;turn<4;turn++) {
    const {angle,force}=aim(layout,board,0);
    const result=playRound(layout,{...board,angle,force},false);
    if (result.state.outcome) return result.won;
    board=result.state;
  }
  return false;
}

function generate(level,pick) {
  const winds=level===2?[-1.2,-.8,.8,1.2]:[-2.1,-1.4,1.4,2.1];
  for (let attempt=0;attempt<6;attempt++) {
    const layout=arena({
      wind:winds[pick(winds.length)], left:40+pick(6),right:40+pick(6),
      edge:pick(9)-4,offset:pick(9)-4,ridge:level>=3?31+pick(8):0
    });
    if (solvable(layout)) return layout;
  }
  return arena({wind:.8,ridge:level>=3?35:0});
}

const names=['Робот','Гуманоид'];

export function report(state) {
  if (state.outcome==='lost') return 'Гуманоид выиграл раунд. Можно отменить последний бросок или сыграть ещё раз.';
  if (state.outcome==='draw') return 'Ничья. Попробуй другую дугу или начни раунд заново.';
  if (!state.last) return '';
  return state.last.map(({side,kind,damage,dropped})=>{
    if (dropped>=0) return names[dropped]+' ушёл с островка. Сработал страховочный луч.';
    if (damage) return names[side]+' попал. Щит −'+damage+'.';
    return names[side]+(kind==='water'?' отправил капсулу в воду.':' оставил воронку.');
  }).join(' ');
}

function hint(layout,state) {
  if (state.outcome) return {control:'undo',text:'Отмени последний бросок и попробуй другую траекторию.'};
  const {angle,force}=aim(layout,state,0);
  if (angle!==state.angle) return {control:'angle-'+angle,text:'Поставь угол '+elevations[angle]+'°.'};
  if (force!==state.force) return {control:'force-'+force,text:'Поставь силу '+powerLabels[force]+'%.'};
  return {control:'launch',text:'Запусти капсулу. Пунктир показывает, куда она долетит.'};
}

export const duel = {
  title:'Пружинная дуэль', hero:'Робот и Гуманоид', sprite:'robot',
  hook:'Капсула летит по дуге, а попадание оставляет воронку.',
  first,generate,start,hint,
  instructions(layout) {
    return layout.training?'Дуга уже наведена. Запусти капсулу и сбей щит Гуманоида.':
      'Подбери угол и силу по пунктиру. После твоего броска Гуманоид сделает ответный ход.';
  },
  move(layout,board,input) {
    if (board.outcome) return null;
    if (input==='launch') {
      const result=playRound(layout,board,true);
      return {...result,message:report(result.state)};
    }
    const setting=input?.setting, value=input?.value;
    if (!Number.isInteger(value) || !['angle','force'].includes(setting) || board[setting]===value) return null;
    if (!(value>=0 && value<(setting==='angle'?elevations.length:speeds.length))) return null;
    return {state:{...board,[setting]:value,last:null},setting:true};
  }
};
