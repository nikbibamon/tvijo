import {bus, note, state, write} from '../tvijoService.js';
import {button, element, showBoard} from '../playground/boards.js';
import {crew, scenes} from './river-story.js';
import {chapterAction, clearedStops, finished, riverState, seaplaneRadio} from './river-progress.js';

const art = id=>'./campaign/art/'+id+'.webp';
const byId = id=>document.getElementById('camp-'+id);
const control = (label,key,act,style='')=>button(label,key,act,'camp-button '+style);

export function mountRiverChapter(openEnding) {
  const frame = byId('scene-frame');
  const puzzle = byId('puzzle');
  const feedback = byId('feedback');
  const progress = byId('progress');
  const stops = byId('stops');
  const hint = byId('hint');
  let run = riverState(state.riverChronicle);
  let busy = false;
  let message = '';

  async function act(type,payload={}) {
    if (busy) return;
    busy = true;
    try {
      const result = await write(profile=>{
        const change = chapterAction(profile,{type,step:run.step,...payload});
        if (change.found) note(profile,'chronicle',change.found.short+' · '+change.found.found);
        return change;
      });
      const moved = run.step!==result.run.step;
      run = result.run;
      message = result.message ?? '';
      render();
      if (moved) byId('scene-title').focus({preventScroll:true});
    } catch {
      feedback.textContent = 'Ход не сохранился. Попробуй ещё раз.';
    } finally {
      busy = false;
    }
  }

  function sceneArt(scene) {
    if (frame.dataset.scene===scene.id) return;
    frame.dataset.scene = scene.id;
    const img = byId('scene-image');
    img.src = art(scene.id);
    img.alt = scene.alt;
    const person = crew[scene.actor];
    byId('actor-image').src = art(scene.actor);
    byId('actor').textContent = person.name;
    byId('actor').title = person.role;
    byId('line').textContent = '«'+scene.line+'»';
    const following = scenes[run.step+1];
    if (following) new Image().src = art(following.id);
  }

  function mapRoute() {
    const count = clearedStops(run);
    byId('scene-progress').textContent = count+' / '+scenes.length+' остановок';
    progress.replaceChildren(...scenes.map((_,i)=>{
      const segment = element('i');
      if (i<count) segment.dataset.done = '';
      else if (i===run.step) segment.dataset.current = '';
      return segment;
    }));
    stops.replaceChildren(...scenes.map((scene,i)=>{
      const stop = element('li','',scene.short);
      if (i===run.step) stop.setAttribute('aria-current','step');
      if (i<count) stop.dataset.done = '';
      return stop;
    }));
  }

  function puzzleControls(scene) {
    if (finished(run)) {
      const workshop = element('a','camp-button','В мастерскую');
      workshop.href = '#workshop';
      const story = element('a','camp-button','К Лире и Яну');
      story.href = '#stories';
      const map = element('a','camp-button','На карту');
      map.href = '#atlas';
      return [control('Смотреть финал','film',openEnding,'camp-primary'),story,workshop,map];
    }
    if (run.cleared) {
      return [control('Дальше · '+scenes[run.step+1].short,'next',()=>act('next'),'camp-primary')];
    }
    if (scene.kind==='inspect') {
      return [control(scene.hotspot.label,'inspect',()=>act('inspect'),'camp-primary')];
    }
    if (scene.kind==='choice') {
      const actions = scene.choices.map(([answer,label])=>{
        const pick = control(label,answer,()=>act('choose',{answer}));
        if (scene.answers.slice(0,run.choiceCount).includes(answer)) {
          pick.disabled = true;
          pick.dataset.passed = '';
        }
        return pick;
      });
      if (scene.answers.length>1) actions.unshift(element('p','camp-route-cue','Ориентир '+(run.choiceCount+1)+' из '+scene.answers.length));
      return actions;
    }
    if (scene.kind==='wire') {
      return [showBoard('wire',seaplaneRadio,{rotations:run.rotations},cell=>act('rotate',{cell}))];
    }
    const labels = {sun:'☀ Солнце',star:'✦ Звезда',stone:'◆ Камень',water:'≋ Вода'};
    const switches = run.tracks.map((mark,index)=>control('Стрелка '+(index+1)+' · '+labels[mark],'switch-'+index,()=>act('switch',{index})));
    return switches.concat(control('Пустить вагонетку','ride',()=>act('ride'),'camp-primary'));
  }

  function render() {
    const scene = scenes[run.step];
    const focus = document.activeElement?.dataset.control;
    const inside = puzzle.contains(document.activeElement);
    sceneArt(scene);
    frame.dataset.done = String(run.cleared);
    byId('scene-effect').dataset.effect = run.cleared ? scene.id : scene.id==='river' && run.choiceCount ? 'wake' : '';
    byId('scene-place').textContent = scene.place+' · '+scene.year;
    byId('scene-title').textContent = scene.title;
    const done = finished(run);
    byId('goal').textContent = done ? 'Чаша приливов найдена' : run.cleared ? scene.item.name : scene.goal;
    byId('task-status').hidden = !run.cleared;
    if (run.cleared) byId('task-status').textContent = done ? 'Глава пройдена' : 'В рюкзаке';
    const pins = byId('hotspot');
    if (scene.hotspot && !run.cleared && !pins.firstElementChild) {
      const pin = control('✦','pin',()=>act('inspect'),'camp-pin');
      pin.setAttribute('aria-label',scene.hotspot.label+' на витрине');
      pin.style.setProperty('--pin-x',scene.hotspot.x+'%');
      pin.style.setProperty('--pin-y',scene.hotspot.y+'%');
      pins.replaceChildren(pin);
    } else if (run.cleared || !scene.hotspot) pins.replaceChildren();
    puzzle.replaceChildren(...puzzleControls(scene));
    feedback.textContent = message || (run.cleared ? scene.found : run.choiceCount ? scene.between : '');
    hint.hidden = run.cleared || !scene.hint;
    hint.onclick = ()=>{feedback.textContent = scene.hint;};
    mapRoute();
    if (inside) {
      const actions = [...puzzle.querySelectorAll('button:not([disabled])')];
      (actions.find(item=>item.dataset.control===focus)??actions[0])?.focus({preventScroll:true});
    }
  }

  bus.addEventListener('change',()=>{
    if (busy) return;
    const fresh = riverState(state.riverChronicle);
    if (JSON.stringify(fresh)===JSON.stringify(run)) return;
    run = fresh;
    message = '';
    render();
  });
  render();
}
