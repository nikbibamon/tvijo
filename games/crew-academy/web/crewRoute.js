import {levels} from './catalog.js';
import {resolveLevel} from './strategy.js';
import {rooms, roomById, roomHref, hasPrize} from './expedition/rooms.js';
import {scenes, restoreStorm} from './storm/rules.js';
import {phaseNames, restoreMine} from './echo/rules.js';

const lastKey = 'tvijo.crew.last-route.v1';
export const stormKey = 'tvijo.crew.storm.v1';
export function readRoute(key = lastKey) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
export function markRoute(kind, id = '') {
  try { localStorage.setItem(lastKey,JSON.stringify({kind,id})); } catch {}
}
const shift = {kind:'first',title:'Первая смена',place:'Солнечный причал',text:'Грузовая капсула за поднятым мостом. Выбери героя и вызови Робота на переправу.',
  action:'Играть в «Первую смену»',href:'./first-shift.html',art:'./art/expedition-cover.webp',detail:'Причал · 1 из 6'};
function echo(m, playing) {
  return {kind:'mine',title:'Шахта эха',place:'Нижняя штольня',
    text: ['Самолётик уловил три импульса под землёй. Найди дрон, пока его ещё слышно.',
      'Дрон под вагонеткой. Настрой желоб и переведи стрелку на свободный путь.',
      'Вагонетка ушла. Проведи разведчика через разрыв и верни его к шлюзу.'][m.phase],
    action:playing?'Продолжить спасение':'Найти дрон',href:'./echo-mine.html',art:'./echo/mine.webp',detail:phaseNames[m.phase]};
}
function storm(s, playing) {
  return {kind:'storm',title:'Орбитальный шторм',place:'Внешнее кольцо',text:[
    'Светляк пропал у внешнего кольца. Экипаж ловит его позывной.',
    'Позывной найден. Распредели энергию перед выходом за борт.',
    'Светляк за бортом. Дойди до него и закрепи трос.',
    'Дрон на борту. Проведи шаттл через створки станции.'][s.stage],
    action:playing?'Продолжить поиск':'Выйти на связь',href:'./storm.html#'+scenes[s.stage].id,art:'./echo/bridge.webp',detail:scenes[s.stage].name};
}
function room(def, playing) {
  return {kind:'room',title:def.name,place:def.place,text:def.task,action:playing?'Продолжить комнату':'Войти в комнату',
    href:roomHref(def.id),art:def.art,detail:def.prize};
}
function campaign(l,profile) {
  if (l.id==='mine' && !profile.stages?.mine?.done?.length && profile.echoMine?.phase!==3) return echo(restoreMine(null),false);
  if (l.id==='dock') return shift;
  return {kind:'campaign',title:l.name,place:'Кампания экипажа',text:l.desc,action:'Продолжить вылазку',
    href:l.spec?'#field':'#mission/'+l.id,art:'./art/'+l.art+'.webp',detail:l.tag};
}
export function nextRoute(profile, last, stormSave) {
  const mine = restoreMine(profile.echoMine), orbit = restoreStorm(stormSave), visited = profile.completed;
  const activeMine = !!profile.echoMine && mine.phase < 3 && (mine.heard.length > 0 || last?.kind==='echo');
  const activeStorm = orbit.stage < 4 && !!stormSave && (orbit.stage>0 || orbit.signal.band>0 || orbit.signal.observations>0);
  const chosen = last?.kind==='room' && roomById(last.id);
  if (last?.kind==='echo' && activeMine) return echo(mine,true);
  if (last?.kind==='storm' && activeStorm) return storm(orbit,true);
  if (chosen && !hasPrize(profile,chosen.id)) return room(chosen,true);
  const current = resolveLevel(profile.level);
  if (last?.kind==='campaign' && current?.id===last.id && !visited.includes(current.id)) return campaign(current,profile);
  if (activeMine) return echo(mine,true);
  if (activeStorm) return storm(orbit,true);
  if (!visited.includes('dock') && (!current || current.id==='dock')) return shift;
  const resume = profile.level==='dock' && resolveLevel(profile.resumeAfterShift);
  const next = [resume,current,...levels].find(l=>l && !visited.includes(l.id) &&
    (l.spec || l===levels[0] || visited.includes(levels[levels.indexOf(l)-1]?.id)));
  if (next) return campaign(next,profile);
  if (!hasPrize(profile,'echo-mine') && mine.phase!==3) return echo(mine,false);
  if (!hasPrize(profile,'orbital-storm') && orbit.stage!==4) return storm(orbit,false);
  const missing=rooms.find(def=>!hasPrize(profile,def.id));
  if (missing) return room(missing,false);
  return {kind:'duet',title:'Парный маяк',place:'Станция игроков',text:'Займи пост разведчика. Робот или другой пилот повторит твой сигнал на втором посту.',
    action:'Занять пост',href:'#beacon',art:'./art/beacon.webp',detail:'Два поста'};
}
