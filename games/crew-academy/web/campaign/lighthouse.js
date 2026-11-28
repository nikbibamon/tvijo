import {flight,flightLayout} from '../playground/flight.js';
import {traceMirrorPath} from '../expedition/mirror-path.js';
import {finished,riverState} from './river-progress.js';

export const lighthouseTitle = 'Маяк двух времён';
export const eras = {
  past:{year:'1941', art:'lighthouse-1941', alt:'Каменный маяк над рекой в лучах заката. У двери виден маховик.'},
  future:{year:'2041', art:'lighthouse-2041', alt:'Тот же маяк через сто лет. Вода залила причал, у берега ждёт паром.'}
};
export const lens = {name:'Линза Мины', detail:'Мина оставила эту линзу под лестницей маяка. Она собирает свет для зеркал.'};
export const chart = {name:'Карта переправы', detail:'Поднятая заслонка и четыре зеркала возвращают свет на речную переправу.'};
export const lighthouseFilm = [
  {scene:'lighthouse-2041', actor:'orian', text:'Смотрите, паром повернул к огням. Тысяча миль начинается с одного верного сигнала.'},
  {scene:'lighthouse-1941', actor:'selena', text:'Мина знала, что кто-то вернётся за линзой. Вот почему на оттиске был нарисован наш маяк.'},
  {scene:'lighthouse-2041', actor:'lira', text:'Я добавлю на карту новый маршрут. В следующий раз вся семья переправится вместе.'}
];

export const ducts = flightLayout([
  '###T~~###',
  '#####H###',
  '#...S..G#',
  '##H######',
  '##~~T####'
]);
export const optics = {width:6,height:4,source:12,receiver:23,mirrors:[14,2,4,22],walls:[9,17,18]};
const initialMirrors = [1,1,0,1];
const shape = value=>value===0 || value===1;
export const lighthouseAvailable = profile=>finished(riverState(profile.riverChronicle));

export function restoreLighthouse(raw) {
  const saved = raw?.v===1 ? raw : {};
  const era = saved.era==='past' ? 'past' : 'future';
  const braced = saved.braced===true;
  const entered = braced && saved.entered===true;
  const lit = entered ? ducts.switches.filter(index=>Array.isArray(saved.plane?.lit) && saved.plane.lit.includes(index)) : [];
  const open = lit.length===ducts.switches.length;
  const cell = saved.plane?.position;
  const tile = Number.isInteger(cell) ? ducts.tiles[cell] : '';
  const position = entered && (['.','S','T','H','~'].includes(tile) || open && tile==='G') ? cell : ducts.start;
  const angles = initialMirrors.map((angle,i)=>open && shape(saved.angles?.[i]) ? saved.angles[i] : angle);
  const signaled = open && saved.signaled===true && traceMirrorPath(optics,angles).reaches;
  return {v:1,era,braced,entered,plane:{position,lit},angles,signaled};
}

export function lighthouseStage(run) {
  if (!run.entered) return 'gate';
  if (run.plane.lit.length<ducts.switches.length) return 'flight';
  return run.signaled ? 'finish' : 'light';
}

export function lighthouseAction(profile, action) {
  const run = restoreLighthouse(profile.lighthouse);
  const stage = lighthouseStage(run);
  const reply = message=>({run,message});
  function keep(changes, message, journal, motion) {
    const next = {...run,...changes};
    profile.lighthouse = next;
    return {run:next,message,journal,motion};
  }
  if (!lighthouseAvailable(profile) || !action || action.era!==run.era || action.stage!==stage) return reply('');

  if (action.type==='travel' && Object.hasOwn(eras,action.target) && action.target!==run.era) {
    const message = action.target==='past' ? 'Ориан: «В 1941-м до маховика можно дотянуться».'
      : run.braced ? 'Лира: «Люк поднялся над водой. Поворот в прошлом сработал!»' : 'Люк ещё под водой.';
    return keep({era:action.target},message);
  }
  if (run.era==='past') {
    if (!run.braced && action.type==='brace') {
      return keep({braced:true},'Маховик защёлкнулся. Вернись в 2041-й и проверь люк.',
        'Семья закрепила маховик маяка в 1941 году.');
    }
    return reply('');
  }
  if (stage==='gate') {
    if (action.type!=='enter') return reply('');
    return run.braced ? keep({entered:true},'Лира нашла линзу Мины. Самолётик, пора к переключателям.',
      'Люк поднят. Линза Мины в рюкзаке.') : reply('Люк под водой. Закрепи маховик на сухом причале в 1941 году.');
  }
  if (stage==='flight' && action.type==='fly') {
    const moved = flight.move(ducts,run.plane,action.input);
    if (!moved?.state) return reply(moved?.message??'');
    if (moved.won) return keep({plane:moved.state},'Заслонка открыта. Ян вставил линзу в проектор.',
      'Самолётик включил оба переключателя маяка.');
    return keep({plane:moved.state},moved.message,undefined,moved.motion);
  }
  if (stage!=='light') return reply('');
  if (action.type==='mirror' && Number.isInteger(action.index) && action.index>=0 && action.index<optics.mirrors.length) {
    const angles = run.angles.slice();
    angles[action.index] = 1-angles[action.index];
    return keep({angles},traceMirrorPath(optics,angles).reaches ? 'Приёмник освещён. Включи маяк.' : '');
  }
  if (action.type==='signal' && traceMirrorPath(optics,run.angles).reaches) {
    return keep({signaled:true},'Паром увидел свет. Переправа снова открыта.',
      'Маяк зажжён. Карта переправы добавлена в рюкзак.');
  }
  return reply('');
}
