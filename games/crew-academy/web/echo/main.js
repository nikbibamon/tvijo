import {heroes} from '../catalog.js';
import {bus, state, write, note, speech, silenceRadio} from '../tvijoService.js';
import {bindVoiceControls} from '../voiceControls.js';
import {markRoute} from '../crewRoute.js';
import {phaseIds, phaseNames, stops, messageFor, gearLabel, restoreMine} from './rules.js';
import {applyMineAction} from './progress.js';

const $ = id => document.getElementById(id);
const goals = ['Найди сигнал дрона', 'Отведи вагонетку на боковой путь', 'Подведи дрон к левому шлюзу', 'Чёрный ящик доставлен'];
let run = restoreMine(state.echoMine);
let lastView = '', animating = false, commitPending = false;
let previousStop = null;
const control = (id, label, attrs = '') => '<button type="button" data-act="'+id+'" '+attrs+'>'+label+'</button>';
function readout(s) {
  if (s.phase===0) return s.heard.length===2?'Выбери источник позывного':'Вызови обоих разведчиков';
  if (s.phase===2) return s.carrying?'Вернись к шлюзу слева':'Дойди до дрона справа';
  return goals[s.phase];
}
function inputs(s) {
  if (s.phase===0) {
    const crew = [['plane','Самолётик'],['blue','Гуманоид']].map(([id,name])=>control(id,
      '<img src="./art/crew/'+id+'.webp" alt="">'+name+(s.heard.includes(id)?' ✓':''),'aria-pressed="'+s.heard.includes(id)+'"')).join('');
    return crew + (s.heard.length===2?control('ore','Проверить жилу')+control('cart','Проверить вагонетку'):'');
  }
  if (s.phase===1) return control('chute','Желоб · '+(s.chute?'к чаше':'в лоток'),'aria-pressed="'+s.chute+'"')
    +control('switch','Стрелка · '+(s.siding?'в депо':'в тупик'),'aria-pressed="'+s.siding+'"')
    +control('run','Пустить шар','class="gold"');
  if (s.phase!==2) return '';
  const atGap=s.pos===1||s.pos===2;
  const move=control('left','‹','aria-label="Шаг влево" '+(s.pos===0?'disabled':''))+
    control('right','›','aria-label="Шаг вправо" '+(s.pos===4?'disabled':''));
  const act=s.pos===4&&!s.carrying?control('use','Зацепить дрон','class="gold"'):
    s.pos===0&&s.carrying?control('use','Принять у шлюза','class="gold"'):'';
  const crossing=atGap?control('cross',s.tool==='rope'?'По тросу':s.tool==='plank'?'По настилу':'Прыжок'):'';
  const rig=atGap?control('rope','Натянуть трос','aria-pressed="'+(s.tool==='rope')+'"')+
    control('plank','Выдвинуть настил','aria-pressed="'+(s.tool==='plank')+'"'):'';
  return '<div class="move">'+move+'</div><div class="gear">'+rig+'</div><div class="context">'+crossing+act+'</div>';
}
function marker(id, label, x, y) {
  return '<button class="marker" data-act="'+id+'" style="--x:'+x+'%;--y:'+y+'%" type="button">'+label+'</button>';
}
function markers(s) {
  if (s.phase===0) {
    let out='';
    if(s.heard.includes('blue')) out+=marker('ore','Рудная жила',14,46);
    if(s.heard.includes('plane')) out+=marker('cart','Вагонетка',56,56);
    return out;
  }
  if(s.phase===1) return marker('chute','Желоб',34,46)+marker('switch','Стрелка',73,62);
  if(s.phase===2 && s.pos===4 && !s.carrying) return marker('use','Зацепить',87,50);
  if(s.phase===2 && s.pos===0 && s.carrying) return marker('use','В шлюз',13,53);
  return '';
}
function render() {
  run=restoreMine(state.echoMine);
  // Keep the ball and the old track visible until its mechanical sequence has played.
  if (animating) return;
  const s=run, scene=$('scene');
  scene.dataset.phase=phaseIds[s.phase];
  scene.dataset.chute=s.chute?'cup':'bin'; scene.dataset.track=s.siding?'siding':'buffer';
  scene.dataset.gear=s.tool; scene.dataset.carry=String(s.carrying);
  scene.dataset.ore=String(s.heard.includes('blue')); scene.dataset.call=String(s.heard.includes('plane'));
  scene.style.setProperty('--pilot-x',(s.phase===2?stops[s.pos]:s.phase===3?15:25)+'%');
  const moved=s.phase===2 && previousStop!==null && previousStop!==s.pos;
  if(moved && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const hop=s.last==='jump'?'24%':s.last==='ride'?'13%':'5%';
    scene.querySelector('.pilot').animate?.([{translate:'0 0'},{translate:'0 -'+hop},{translate:'0 0'}],{duration:s.last==='ride'?380:250});
  }
  previousStop=s.phase===2?s.pos:null;
  $('goal').textContent=readout(s); $('act-name').textContent=phaseNames[s.phase];
  $('stage-count').innerHTML=phaseNames.map((name,i)=>'<i class="'+(i<=s.phase?'lit':'')+'" title="'+name+'"></i>').join('');
  $('stage-count').setAttribute('aria-label',phaseNames[s.phase]+' · '+(s.phase+1)+' из 4');
  const next=JSON.stringify([s.phase,s.heard,s.chute,s.siding,s.pos,s.carrying,s.tool]);
  if (lastView!==next) {
    const focus=document.activeElement, id=focus?.dataset?.act, host=focus?.closest('#markers,#controls');
    $('controls').innerHTML=inputs(s); $('markers').innerHTML=markers(s);
    if(id && host) {
      const target=host.querySelector('[data-act="'+id+'"]:not(:disabled)')||$('controls').querySelector('button:not(:disabled)')||
        (s.phase===3?$('result').querySelector('a'):scene);
      target?.focus({preventScroll:true});
    }
    lastView=next;
  }
  const [who,line]=messageFor(s.last); $('speaker').textContent=heroes[who].name;
  $('speaker-face').src='./art/crew/'+who+'.webp'; $('feedback').textContent=line;
  $('radio-lines').replaceChildren(...s.radio.map(key=>{
    const [speaker,words]=messageFor(key),li=document.createElement('li');li.textContent=heroes[speaker].name+' · '+words;return li;
  }));
  $('controls').hidden=s.phase===3; $('result').hidden=s.phase!==3;
  if(s.phase===3) $('debrief').textContent='Сын доставил разведчика. Переправа — '+gearLabel(s.tool).toLowerCase()+
    '. Пусков шара — '+s.tries+'. Чёрный ящик в рюкзаке.';
}
function trajectory(outcome) {
  const scene=$('scene');animating=true;scene.dataset.motion=outcome;scene.setAttribute('aria-busy','true');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return new Promise(resolve=>{setTimeout(()=>{
    delete scene.dataset.motion;scene.removeAttribute('aria-busy');animating=false;resolve();
  },reduced?30:1250);});
}
async function act(action) {
  if(commitPending||animating) return;
  commitPending=true;
  const animate=action==='run' && run.phase===1;
  // Start from the visible track; write() emits change before its promise resolves.
  if(animate) animating=true;
  try {
    const outcome=await write(profile=>{
      const result=applyMineAction(profile,action,Date.now());
      if(result?.report) {
        note(profile,'field','Шахта эха · дрон спасён. '+gearLabel(result.report.tool)+' · пусков '+result.report.tries+'.');
        if(result.firstPrize) note(profile,'field','В рюкзаке — Чёрный ящик разведчика.');
      }
      return result;
    });
    if(!outcome){animating=false;render();return;}
    markRoute('echo');
    if(animate) await trajectory(outcome.run.last);
    render();
    if(action!=='left' && action!=='right' || outcome.run.last==='gap') speech(messageFor(outcome.run.last)[1]);
  } finally {commitPending=false;}
}
$('mine').addEventListener('click',e=>{const btn=e.target.closest('button[data-act]');if(btn&&!btn.disabled)act(btn.dataset.act);});
$('restart').addEventListener('click',()=>{silenceRadio();act('restart');});
document.addEventListener('keydown',e=>{
  if (e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,summary,details')||run.phase!==2) return;
  const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'cross',KeyE:'use'};
  const action=map[e.code]||map[e.key];if(!action || (e.code==='Space' && e.target.closest('button,a')))return;
  e.preventDefault();if(!e.repeat)act(action);
});
window.addEventListener('pagehide',()=>silenceRadio());
bus.addEventListener('change',render);bindVoiceControls();render();
