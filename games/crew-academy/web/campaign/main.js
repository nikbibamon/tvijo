import {bus, state, write} from '../tvijoService.js';
import {element} from '../playground/boards.js';
import {games, savedRun} from '../playground/levels.js';
import {current, model, movieUnlocked} from '../chronicles/progress.js';
import {restore as workshopState} from '../clockwork/game.js';
import {crew, ending, scenes, title as riverTitle} from './river-story.js';
import {clearedStops, finished, riverState} from './river-progress.js';
import {mountRiverChapter} from './river-view.js';
import {chart,lens,lighthouseAvailable,lighthouseFilm,lighthouseTitle,restoreLighthouse} from './lighthouse.js';
import {mountLighthouse} from './lighthouse-view.js';

const el = id=>document.getElementById('camp-'+id);
const panels = [...document.querySelectorAll('[data-campaign-panel]')];
const modules = {
  stories:()=>import('../chronicles/main.js'),
  workshop:()=>import('../clockwork/main.js'),
  training:()=>import('../playground/main.js')
};
const notes = el('notes');
const film = el('ending');
let screen, currentHash, noteType, frames, frame = 0;
let routeChange = 0;
const filmArt = id=>'./campaign/art/'+id+'.webp';

function target(value) {
  const hash = typeof value==='string' ? value : '';
  if (hash==='#ch-choices') return {screen:'stories',hash,choices:true};
  if (hash==='#training' || /^#training\/(?:ice|wire|post|flight|duel)$/.test(hash)) return {screen:'training',hash};
  const key = hash.slice(1);
  return ['journey','lighthouse','stories','workshop'].includes(key) ? {screen:key,hash} : {screen:'atlas',hash:'#atlas'};
}

function inventory(run) {
  const stash = scenes.slice(0,clearedStops(run)).map(scene=>scene.item);
  if (finished(run)) {
    const light = restoreLighthouse(state.lighthouse);
    if (light.entered) stash.push(lens);
    if (light.signaled) stash.push(chart);
  }
  const story = model(state.chronicles);
  const chapters = story.generated ? ['origin','bridge','generated'] : ['origin','bridge'];
  const oldItems = new Set(chapters.flatMap(active=>current({...story,active}).pocket));
  return stash.concat([...oldItems].map(name=>({name,detail:'Находка Лиры и Яна.'})));
}

function noteList(entries, empty) {
  if (!entries.length) return element('p','camp-empty',empty);
  const list = element('ul','camp-note-list');
  for (const {name,detail} of entries) {
    const item = element('li');
    item.append(element('strong','',name));
    if (detail) item.append(element('p','',detail));
    list.append(item);
  }
  return list;
}

function renderNotes(run) {
  let content;
  if (noteType==='pack') {
    content = noteList(inventory(run),'Рюкзак пуст. Первую находку можно взять в музее.');
  } else {
    const journal = state.log.filter(item=>item.type==='chronicle' || item.type==='field' &&
      /Хроники Центавра|Игровой полигон|Лестница к Семейным часам|Мастерская/.test(item.text)).slice(-24).reverse();
    content = noteList(journal.map(item=>({name:item.text})),'Здесь появятся записи о находках и пройденных заданиях.');
  }
  el('note-body').replaceChildren(content);
}

function openNotes(type) {
  noteType = type;
  el('note-title').textContent = type==='pack' ? 'Рюкзак' : 'Журнал путешествия';
  renderNotes(riverState(state.riverChronicle));
  notes.showModal();
}

function renderAtlas() {
  const run = riverState(state.riverChronicle);
  const found = clearedStops(run);
  const pack = inventory(run).length;
  const saved = target(state.campaignScreen??'');
  const unlocked = finished(run);
  const light = restoreLighthouse(state.lighthouse);
  const story = model(state.chronicles);
  const chapters = ['origin','bridge'].filter(id=>movieUnlocked(story,id)).length;
  const blueprints = workshopState(state.clockwork).wins.length;
  const training = Object.keys(games).filter(id=>savedRun(state,id).best>0).length;
  el('pack-count').textContent = String(pack);
  el('pack-count').hidden = !pack;
  el('overview').textContent = unlocked ? (light.signaled?'2':'1')+' / 2 главы пройдено' : found ? found+' / '+scenes.length+' остановок пройдено' : '';
  el('chapter-summary').textContent = finished(run) ? 'Глава пройдена · финал открыт' : found ? 'Следующая остановка · '+scenes[Math.min(found,scenes.length-1)].short : 'Музей, поезд, река и подземные рельсы.';
  el('lighthouse-summary').textContent = !unlocked ? 'Откроется после «Чаши приливов».'
    : light.signaled ? 'Переправа открыта · финал доступен'
    : light.braced || light.era==='past' ? 'Продолжить работу на маяке' : 'Восстанови путь к переправе.';
  el('stories-summary').textContent = chapters ? chapters+' / 2 главы пройдено' : 'Три эпохи и Семейные часы';
  el('workshop-summary').textContent = blueprints ? blueprints+' / 3 чертежей готово' : 'Лестница к Семейным часам';
  el('training-summary').textContent = training ? training+' / 5 заданий освоено' : 'Пять коротких вылазок';
  const resume = el('continue');
  if (['atlas','journey'].includes(saved.screen) && unlocked) resume.href = '#lighthouse';
  else if (saved.screen==='atlas' || saved.screen==='lighthouse' && !unlocked) resume.href = '#journey';
  else resume.href = saved.hash;
  resume.textContent = saved.screen!=='atlas' || found ? 'Продолжить игру' : 'Начать с музея';
  if (notes.open) renderNotes(run);
}

function playFrame() {
  const line = frames[frame];
  const name = line.actor==='lira' ? 'Лира' : crew[line.actor].name;
  el('ending-image').src = filmArt(line.scene);
  el('ending-actor').src = line.actor==='lira' ? './art/crew/daughter.webp' : filmArt(line.actor);
  el('ending-line').textContent = name+' · «'+line.text+'»';
  el('ending-next').textContent = frame===frames.length-1 ? 'Готово' : 'Дальше';
}

function openEnding(chapter) {
  const lighthouse = chapter==='lighthouse';
  const unlocked = lighthouse ? lighthouseAvailable(state) && restoreLighthouse(state.lighthouse).signaled
    : finished(riverState(state.riverChronicle));
  if (!unlocked || film.open) return;
  frames = lighthouse ? lighthouseFilm : ending;
  el('ending-title').textContent = 'Мультсцена · '+(lighthouse ? lighthouseTitle : riverTitle);
  frame = 0;
  playFrame();
  film.showModal();
}

el('ending-next').onclick = ()=>{
  if (frame===frames.length-1) film.close();
  else {frame++;playFrame();}
};
el('pack-open').onclick = ()=>openNotes('pack');
el('log-open').onclick = ()=>openNotes('journal');

async function route() {
  const number = ++routeChange;
  const view = target(location.hash);
  const changed = currentHash!==view.hash;
  currentHash = view.hash;
  screen = view.screen;
  for (const panel of panels) panel.hidden = panel.dataset.campaignPanel!==screen;
  if (screen==='atlas') el('map-link').setAttribute('aria-current','page');
  else el('map-link').removeAttribute('aria-current');
  const active = panels.find(panel=>!panel.hidden);
  if (screen==='lighthouse') showLighthouse();
  const load = modules[screen];
  if (load) {
    try {await load();}
    catch (error) {
      active.setAttribute('aria-label','Раздел временно недоступен. Обнови страницу.');
      console.error(error);
      return;
    }
  }
  if (number!==routeChange) return;
  if (changed || view.choices) {
    if (view.choices) document.getElementById('ch-choices').scrollIntoView();
    else {
      window.scrollTo(0,0);
      const heading = [...active.querySelectorAll('h1, h2')].find(item=>!item.closest('[hidden]'));
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({preventScroll:true});
      }
    }
  }
  if (screen!=='atlas' && (screen!=='lighthouse' || lighthouseAvailable(state)) && state.campaignScreen!==view.hash) {
    void write(profile=>{profile.campaignScreen = view.hash;});
  }
}

mountRiverChapter(()=>openEnding('river'));
const showLighthouse = mountLighthouse(()=>openEnding('lighthouse'));
bus.addEventListener('change',renderAtlas);
renderAtlas();
window.addEventListener('hashchange',route);
void route();
