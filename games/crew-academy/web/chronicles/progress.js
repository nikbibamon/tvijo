import {adventure,chapters,eras,family,signs,titleFor} from './episodes.js';
import {readAvatar} from './avatar.js';

const version=1;
const ordinal=(value,max)=>Number.isSafeInteger(value)&&value>=0&&value<=max?value:0;
const eraExists=key=>Object.hasOwn(eras,key);

export function availableEras(episode,step) {
  return [...new Set(episode.steps.slice(0,step+1).map(task=>task.era))];
}

function restore(raw,episode) {
  const step=ordinal(raw?.step,episode.steps.length);
  const available=availableEras(episode,step);
  return {step,era:available.includes(raw?.era)?raw.era:available[0]};
}

export function model(raw) {
  const good=raw?.v===version?raw:{};
  const {seed,era,number}=good.generated??{};
  const valid=Number.isInteger(seed)&&seed>=0&&seed<=0xffffffff&&eraExists(era)&&Number.isSafeInteger(number)&&number>=1;
  const generated=valid?{seed,era,number,run:restore(good.generated.run,adventure({seed,era,number}))}:null;
  const active=good.active==='generated'&&generated||Object.hasOwn(chapters,good.active)?good.active:'origin';
  const avatar=readAvatar(good.avatar);
  return {
    v:version,active,role:Object.hasOwn(family,good.role)?good.role:'reader',
    cast:good.cast==='custom'&&avatar?'custom':'family',avatar,
    runs:{origin:restore(good.runs?.origin,chapters.origin),bridge:restore(good.runs?.bridge,chapters.bridge)},
    generated
  };
}

export function current(state) {
  const {active,generated}=state;
  const episode=active==='generated'?adventure(generated):chapters[active];
  const run=active==='generated'?generated.run:state.runs[active];
  const task=episode.steps[run.step];
  return {episode,run,task,available:availableEras(episode,run.step),
    pocket:episode.steps.slice(0,run.step).map(task=>task.item).filter(Boolean)};
}

export function movieUnlocked(state,id) {
  return Object.hasOwn(chapters,id)&&state.runs[id].step===chapters[id].steps.length;
}

export function applyChronicles(profile,action,entropy=0) {
  const state=model(profile.chronicles);
  const {episode,run,task,available}=current(state);
  const keep=(value,detail={})=>{
    profile.chronicles=value;
    return {state:value,...detail};
  };
  const keepRun=(next,detail)=>{
    if (state.active==='generated') return keep({...state,generated:{...state.generated,run:next}},detail);
    return keep({...state,runs:{...state.runs,[state.active]:next}},detail);
  };
  const reply=message=>({state,message});

  switch (action.type) {
    case 'chapter':
      return action.id==='generated'&&state.generated||Object.hasOwn(chapters,action.id)?
        keep({...state,active:action.id}):reply('Сначала собери вылазку.');
    case 'assemble': {
      if (!eraExists(action.era)) return reply('Выбери эпоху для вылазки.');
      const previous=state.generated;
      if (previous && current({...state,active:'generated'}).task) return keep({...state,active:'generated'});
      const number=(previous?.number??0)+1;
      const next={seed:entropy>>>0,era:action.era,number,run:{era:action.era,step:0}};
      return keep({...state,active:'generated',generated:next},{message:'Новая вылазка собрана за 0 кредитов.'});
    }
    case 'cast': {
      if (action.id==='family') return keep({...state,cast:'family'},{message:'Лира и Ян снова в экипаже.'});
      const avatar=readAvatar(action.avatar);
      if (!avatar) return reply('Выбери позывной, облик и роль.');
      return keep({...state,avatar,cast:'custom',role:avatar.role},{message:'Твой герой присоединился к семье.'});
    }
    case 'role':
      return Object.hasOwn(family,action.id)?keep({...state,role:action.id}):reply('');
    case 'visit':
      return available.includes(action.era)?keepRun({...run,era:action.era},{message:'Переход · '+titleFor(action.era)+'.'}):
        reply('Часы ещё не открыли эту эпоху.');
    case 'work': {
      if (action.chapter!==undefined && (action.chapter!==state.active || action.step!==run.step ||
          action.seed!==(state.active==='generated'?state.generated.seed:undefined))) return reply('');
      if (!task) return reply('Дело сделано. Выбери новую главу.');
      if (run.era!==task.era) return reply('Следующий шаг ждёт в эпохе «'+titleFor(task.era)+'».');
      if (action.object!==task.object) return reply(task.goal);
      if (state.role!==task.role) return reply(task.role==='reader'?'Здесь пригодится тот, кто читает знаки.':'Здесь нужен тот, кто чинит механизмы.');
      if (task.sign && !Object.hasOwn(signs,action.sign)) return reply('Выбери один из знаков и сверь его с находкой.');
      if (task.sign && action.sign!==task.sign) return reply('Часы не узнали этот знак. Подсказка сохранилась в находках.');
      const step=run.step+1;
      return keepRun({...run,step},{message:task.line,completed:step===episode.steps.length?episode.name:null});
    }
    default:
      return reply('');
  }
}
