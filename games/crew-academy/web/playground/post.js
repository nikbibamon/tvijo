export const angles = ['Пологая', 'Средняя', 'Высокая'];
export const strengths = ['Малая', 'Средняя', 'Большая'];
const distances = [31,58,84];
const reach = [.62,1,.84];
const height = [16,31,46];

export function capsulePoint(angle, force, progress) {
  const distance = distances[force] * reach[angle];
  return {x:12+distance*progress, y:76-(height[angle]+force*2)*4*progress*(1-progress)};
}

export function forecast(board, angle, force) {
  const end = capsulePoint(angle,force,1).x;
  if (board.beam && end > board.beam.x) {
    const progress = (board.beam.x-12)/(end-12);
    const {y} = capsulePoint(angle,force,progress);
    if (y >= board.beam.y-2) return {result:'beam', progress};
  }
  const result = end < board.target-board.radius ? 'short' : end > board.target+board.radius ? 'long' : 'dock';
  return {result, progress:1};
}

export function postPlan(board) {
  return board.angles.flatMap(angle=>strengths.map((_,force)=>({angle,force})))
    .filter(({angle,force})=>forecast(board,angle,force).result==='dock');
}

const first = {target:70, radius:11, beam:null, angles:[1]};

function generated(level, pick) {
  const choices = level >= 4 ? [[2,1],[2,2]] : [[0,2],[1,1],[1,2],[2,1],[2,2]];
  const [angle,force] = choices[pick(choices.length)];
  const radius = level === 2 ? 7 : level === 3 ? 5 : Math.max(2,6-Math.floor(level/2));
  const end = capsulePoint(angle,force,1).x;
  const margin = Math.min(4,radius-1);
  const target = Math.min(94,Math.round(end)+pick(2*margin+1)-margin);
  const x = 30+pick(22);
  const y = capsulePoint(angle,force,(x-12)/(end-12)).y;
  const beam = level >= 4 ? {x,y:Math.min(71, y+6+pick(4))} : null;
  return {target,radius,beam,angles:[0,1,2]};
}

export const post = {
  title:'Почта по дуге', hero:'Робот', sprite:'robot',
  hook:'Настрой бросок и доставь капсулу на площадку.',
  instructions:'Пунктир показывает полёт. Подбери силу броска, чтобы капсула попала на золотую площадку.',
  first, generate:generated, start:()=>({angle:1,force:0,last:null}),
  move(board, state, action) {
    if (action==='throw') {
      const shot = forecast(board,state.angle,state.force);
      const message = {short:'Капсула не долетела. Увеличь силу.',long:'Капсула перелетела площадку. Убавь силу.',
        beam:'Капсула задела опору. Попробуй более высокую дугу.'}[shot.result];
      return {state:{...state,last:shot}, won:shot.result==='dock', motion:shot, message};
    }
    if (!action || !Number.isInteger(action.value)) return null;
    if (action.setting==='angle' && !board.angles.includes(action.value)) return null;
    if (action.setting==='force' && !(action.value>=0 && action.value<strengths.length)) return null;
    if (!['angle','force'].includes(action.setting) || state[action.setting]===action.value) return null;
    return {state:{...state,[action.setting]:action.value,last:null}, setting:true};
  },
  hint(board,state) {
    if (forecast(board,state.angle,state.force).result==='dock') return {text:'Брось капсулу.', control:'throw'};
    const {angle,force} = postPlan(board)[0];
    if (angle!==state.angle) return {text:'Выбери дугу «'+angles[angle]+'».', control:'angle-'+angle};
    return {text:'Выбери силу «'+strengths[force]+'».', control:'force-'+force};
  }
};
