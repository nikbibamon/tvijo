import {bus,note,state,write} from '../tvijoService.js';
import {traceMirrorPath} from '../expedition/mirror-path.js';
import {button,element,showBoard,showControls} from '../playground/boards.js';
import {flight} from '../playground/flight.js';
import {ducts,eras,lighthouseAction,lighthouseAvailable,lighthouseStage,optics,restoreLighthouse} from './lighthouse.js';

const byId = id=>document.getElementById('lh-'+id);
const control = (label,key,act,style='')=>button(label,key,act,'camp-button '+style);
const art = id=>'./campaign/art/'+id+'.webp';
const phases = [['gate','Люк'],['flight','Два переключателя'],['light','Луч маяка']];
const arrowKeys = {ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left'};
const people = {
  orian:{name:'Ориан',portrait:art('orian')},
  lira:{name:'Лира',portrait:'./art/crew/daughter.webp'},
  yan:{name:'Ян',portrait:'./art/crew/son.webp'},
  plane:{name:'Самолётик',portrait:'./art/crew/plane.webp'}
};

function mirrorBoard(run,rotate) {
  const board = element('div','lh-optics');
  board.setAttribute('role','group');
  board.setAttribute('aria-label','Зеркала маяка');
  const {beams,reaches} = traceMirrorPath(optics,run.angles);
  for (const [index,beam] of beams.entries()) {
    const mirror = optics.mirrors.indexOf(index);
    const cell = mirror===-1 ? element('div','lh-optic-cell')
      : control('', 'mirror-'+mirror,()=>rotate(mirror),'lh-optic-cell lh-mirror');
    for (const direction of beam) cell.append(element('i','lh-ray '+direction));
    if (mirror!==-1) {
      const slash = run.angles[mirror]===0;
      cell.setAttribute('aria-label','Зеркало '+(mirror+1)+' · '+(slash?'наклон вправо':'наклон влево'));
      cell.append(element('b','lh-tilt '+(slash?'slash':'back')),element('span','lh-mirror-id',String(mirror+1)));
    } else if (index===optics.source || index===optics.receiver) {
      const source = index===optics.source;
      cell.dataset.mark = source || reaches ? 'lit' : 'receiver';
      cell.setAttribute('role','img');
      cell.setAttribute('aria-label',source?'Источник луча':reaches?'Приёмник освещён':'Приёмник тёмный');
      cell.append(element('strong','lh-symbol',source?'▶':'◆'));
    } else if (optics.walls.includes(index)) cell.dataset.mark = 'wall';
    board.append(cell);
  }
  return {board,reaches};
}

export function mountLighthouse(openFilm) {
  const root = document.getElementById('camp-lighthouse');
  const panel = byId('puzzle');
  const frame = byId('frame');
  const hint = byId('hint');
  const feedback = byId('feedback');
  let run = restoreLighthouse(state.lighthouse);
  let available = lighthouseAvailable(state);
  let busy = false, message = '';

  async function act(type,payload={}) {
    if (busy) return;
    busy = true;
    const stage = lighthouseStage(run);
    const era = run.era;
    try {
      const result = await write(profile=>{
        const change = lighthouseAction(profile,{type,stage,era,...payload});
        if (change.journal) note(profile,'chronicle','Маяк двух времён · '+change.journal);
        return change;
      });
      run = result.run;
      message = result.message??'';
      render(result.motion);
      if (type==='travel') byId(run.era).focus({preventScroll:true});
    } catch {
      feedback.textContent = 'Ход не сохранился. Попробуй ещё раз.';
    } finally {
      busy = false;
    }
  }

  function setGuide(person,line,goal) {
    byId('portrait').src = people[person].portrait;
    byId('speaker').textContent = people[person].name;
    byId('line').textContent = '«'+line+'»';
    byId('goal').textContent = goal;
  }

  function presentPuzzle(stage,motion) {
    hint.hidden = true;
    const link = element('a','camp-button','На карту');
    link.href = '#atlas';
    if (stage==='finish') {
      setGuide('lira','Путь виден даже с другого берега. Отметим переправу на карте!','Маяк зажжён');
      return [control('Смотреть финал','film',openFilm,'camp-primary'),link];
    }
    if (run.era==='past') {
      setGuide('orian','Вот куда Мина хотела привести нас. Здесь пока сухо. Маховик ещё работает.',
        run.braced?'Маховик закреплён':'Закрепи маховик на сухом причале');
      return run.braced ? [control('Вернуться в 2041 год','next-era',()=>act('travel',{target:'future'}),'camp-primary')]
        : [control('Закрепить маховик','brace',()=>act('brace'),'camp-primary')];
    }
    if (stage==='gate') {
      if (run.braced) {
        setGuide('lira','Замок над водой. Мина оставила нам что-то под лестницей.','Открой поднявшийся люк');
        return [control('Открыть люк','enter',()=>act('enter'),'camp-primary')];
      }
      setGuide('lira','На оттиске Чаши приливов был нарисован этот маяк. Сейчас вода скрыла люк.','Перейди в 1941 год');
      return [control('Повернуть часы на 1941','next-era',()=>act('travel',{target:'past'}),'camp-primary')];
    }
    hint.hidden = false;
    if (stage==='flight') {
      setGuide('plane','В верхний и нижний люки пролетаю только я. Покажи, куда лететь.','Включи два переключателя');
      const move = input=>act('fly',{input});
      hint.onclick = ()=>{feedback.textContent = flight.hint(ducts,run.plane)?.text??'';};
      return [showBoard('flight',ducts,run.plane,move,motion),showControls('flight',ducts,run.plane,move)];
    }
    setGuide('yan','Линза Мины уже на месте. Свет меняет направление, когда ты поворачиваешь стекло.','Отрази луч в золотой приёмник');
    const {board,reaches} = mirrorBoard(run,index=>act('mirror',{index}));
    const signal = control('Зажечь маяк','signal',()=>act('signal'),'camp-primary');
    signal.disabled = !reaches;
    hint.onclick = ()=>{feedback.textContent = 'Следи за золотой линией. Если луч упирается в стену, поверни последнее зеркало, которого он коснулся.';};
    return [board,signal];
  }

  function render(motion) {
    byId('locked').hidden = available;
    byId('play').hidden = !available;
    if (!available) return;
    const stage = lighthouseStage(run);
    const focused = document.activeElement===byId('pin') ? 'pin'
      : panel.contains(document.activeElement) ? document.activeElement.dataset.control : null;
    const era = eras[run.era];
    if (frame.dataset.era!==run.era) {
      frame.dataset.era = run.era;
      byId('image').src = art(era.art);
      byId('image').alt = era.alt;
    }
    frame.dataset.open = String(run.era==='future' && run.braced);
    frame.dataset.lit = String(run.era==='future' && run.signaled);
    const pin = byId('pin');
    const brace = run.era==='past' && !run.braced;
    const enter = run.era==='future' && stage==='gate' && run.braced;
    pin.hidden = !brace && !enter;
    pin.setAttribute('aria-label',brace ? 'Закрепить маховик у двери' : 'Открыть люк у двери');
    pin.style.setProperty('--pin-x',brace ? '86%' : '79%');
    pin.onclick = ()=>act(brace ? 'brace' : 'enter');
    for (const key of Object.keys(eras)) byId(key).setAttribute('aria-pressed',String(key===run.era));
    const done = stage==='finish' ? phases.length : phases.findIndex(([key])=>key===stage);
    byId('progress').textContent = done+' / '+phases.length+' задач';
    for (const [i,item] of [...byId('steps').children].entries()) {
      item.toggleAttribute('data-done',i<done);
      if (i===done) item.setAttribute('aria-current','step');
      else item.removeAttribute('aria-current');
    }
    panel.replaceChildren(...presentPuzzle(stage,motion));
    feedback.textContent = message || (run.signaled ? 'Карта переправы в рюкзаке.' : '');
    if (focused) {
      const buttons = [...panel.querySelectorAll('button:not([disabled]),a')];
      (buttons.find(item=>item.dataset.control===focused)??buttons[0])?.focus({preventScroll:true});
    }
  }

  for (const key of Object.keys(eras)) byId(key).onclick = ()=>act('travel',{target:key});
  byId('steps').append(...phases.map(([,name])=>element('li','',name)));
  root.addEventListener('keydown',event=>{
    if (root.hidden || !available || run.era!=='future' || lighthouseStage(run)!=='flight' ||
      event.altKey || event.ctrlKey || event.metaKey || !Object.hasOwn(arrowKeys,event.key)) return;
    event.preventDefault();
    void act('fly',{input:arrowKeys[event.key]});
  });
  bus.addEventListener('change',()=>{
    if (busy || root.hidden) return;
    const fresh = restoreLighthouse(state.lighthouse);
    const unlocked = lighthouseAvailable(state);
    if (unlocked===available && JSON.stringify(fresh)===JSON.stringify(run)) return;
    run = fresh;
    available = unlocked;
    message = '';
    render();
  });
  return ()=>{
    run = restoreLighthouse(state.lighthouse);
    available = lighthouseAvailable(state);
    message = '';
    render();
  };
}
