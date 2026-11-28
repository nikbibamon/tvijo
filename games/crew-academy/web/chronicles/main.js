import {bus,note,state,write} from '../tvijoService.js';
import {pixelPreview} from '../pixelAvatar.js';
import {aliases,avatarPixels,colors,generateAvatar,headwear} from './avatar.js';
import {chapters,eras,family,signs} from './episodes.js';
import {applyChronicles,current,model,movieUnlocked} from './progress.js';
import {createFilm} from './film.js';

const byId=id=>document.getElementById(id);
const el=(tag,text='',className='')=>{
  const node=document.createElement(tag);
  node.textContent=text;
  node.className=className;
  return node;
};
function button(label,key,handler,style='') {
  const node=el('button',label,'ch-button '+style);
  node.type='button';
  node.dataset.key=key;
  node.onclick=handler;
  return node;
}
const watch=createFilm();
const image=byId('ch-scene-art'), plate=byId('ch-plate'), feedback=byId('ch-feedback');
const startEra=byId('ch-start-era');
const avatarDialog=byId('ch-avatar-dialog');
let play=model(state.chronicles), busy=false, draft;

function paintRole(role) {
  const ready=family[role], custom=play.cast==='custom'&&play.avatar.role===role;
  const name=custom?aliases[play.avatar.name]:ready.name;
  const detail=custom?(role==='reader'?'Читает знаки':'Чинит механизмы'):ready.title;
  const portrait=custom?pixelPreview(avatarPixels(play.avatar),name):el('img');
  if(!custom){portrait.src='./art/crew/'+ready.portrait+'.webp';portrait.alt='';}
  return {name,detail,portrait};
}

function showScene(run,task) {
  const era=eras[run.era], target=task?.era===run.era?task.object:null;
  if (plate.dataset.era!==run.era) {
    plate.dataset.era=run.era;
    image.src='./chronicles/art/'+run.era+'.webp';
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
      image.animate([{filter:'brightness(1.45)'},{filter:'brightness(1)'}],{duration:480,easing:'ease-out'});
  }
  image.alt=era.name+'. '+era.dress+'.';
  plate.dataset.finish=String(!task);
  byId('ch-scene-name').textContent=era.period+' · '+era.year;
  byId('ch-costume').textContent=era.dress;
  const marks=Object.entries(era.objects).map(([id,[name,x,y]])=>{
    const mark=button('',id,()=>work(id),'ch-hotspot');
    mark.setAttribute('aria-label',name);
    mark.style.setProperty('--x',x+'%');
    mark.style.setProperty('--y',y+'%');
    if (target===id) mark.dataset.target='';
    mark.append(el('i','✦'),el('span',name));
    return mark;
  });
  if (play.cast==='custom' && play.avatar.role===play.role) {
    const {name,portrait}=paintRole(play.role);
    const token=el('div','','ch-visitor');
    token.append(portrait,el('span',name));
    marks.push(token);
  }
  byId('ch-hotspots').replaceChildren(...marks);
}

function showActions({episode,run,task}) {
  const title=byId('ch-task-title'), goal=byId('ch-goal'), controls=byId('ch-task-actions');
  const role=task&&paintRole(task.role);
  const controlsList=[];
  if (!task) {
    const generated=play.active==='generated';
    title.textContent=generated?'Вылазка пройдена':'Глава пройдена';
    goal.textContent=generated?(play.generated.number===1?'В следующей вылазке появится второй знак.':'Часы запомнили маршрут.'):'Открыта мультсцена по этой главе.';
    controlsList.push(generated?
      button('Следующая вылазка · 0 кредитов','next-adventure',()=>assemble(play.generated.era),'primary'):
      button('Смотреть мультсцену','watch',()=>watch(play.active),'primary'));
  } else if (task.era!==run.era) {
    title.textContent=eras[task.era].name;
    goal.textContent='Следующий шаг ждёт в '+eras[task.era].year+' году.';
    controlsList.push(button('Перейти в '+eras[task.era].year+' год','travel',()=>visit(task.era),'primary'));
  } else {
    title.textContent=eras[run.era].objects[task.object][0];
    goal.textContent=play.cast==='family'?task.goal:
      role.name+' выполнит это поручение. '+(task.sign?'Сверь знак с находкой.':'Нажми на предмет.');
    if (task.sign) {
      controlsList.push(...Object.entries(signs).map(([id,{name,glyph}])=>
        button(glyph+' '+name,'sign-'+id,()=>work(task.object,id),'ch-sign')));
    } else {
      controlsList.push(button('Действовать','act',()=>work(task.object),'primary'));
    }
  }
  const roles=Object.keys(family).map(id=>{
    const {name,detail,portrait}=paintRole(id);
    const choice=button('','role-'+id,()=>commit({type:'role',id}),'ch-role');
    choice.append(portrait,el('span',name),el('small',detail));
    choice.setAttribute('aria-pressed',String(play.role===id));
    if (task?.era===run.era && task?.role===id) choice.dataset.needed='';
    return choice;
  });
  controls.replaceChildren(...controlsList);
  byId('ch-roles').replaceChildren(...roles);
  byId('ch-meter').textContent=run.step+' / '+episode.steps.length+' шагов';
}

function showChoices() {
  for (const id of Object.keys(chapters)) {
    const completed=movieUnlocked(play,id);
    const items=[button(completed?'Открыть главу':play.runs[id].step?'Продолжить · 0 кредитов':'Играть · 0 кредитов',
      'choose-'+id,()=>commit({type:'chapter',id},true))];
    if (completed) items.push(button('Мультсцена','film-'+id,()=>watch(id)));
    byId('ch-'+id).replaceChildren(...items);
  }
  const pending=play.generated&&current({...play,active:'generated'}).task;
  startEra.disabled=Boolean(pending);
  if (pending) startEra.value=play.generated.era;
  byId('ch-assemble').textContent=pending?'Продолжить вылазку':play.generated?'Собрать следующую · 0 кредитов':'Собрать вылазку · 0 кредитов';
}

function paint(message='') {
  const focus=document.activeElement?.dataset.key;
  const detail=current(play);
  const {episode,run,task,available,pocket}=detail;
  byId('ch-chapter').textContent=episode.name;
  byId('ch-label').textContent=episode.label+' · 0 кредитов';
  byId('ch-eras').replaceChildren(...Object.entries(eras).map(([id,{name,year}])=>{
    const choice=button('',id,()=>visit(id),'ch-era');
    choice.append(el('small',year),el('strong',name));
    choice.disabled=!available.includes(id);
    choice.setAttribute('aria-pressed',String(run.era===id));
    return choice;
  }));
  showScene(run,task);
  showActions(detail);
  byId('ch-pocket').replaceChildren(...pocket.map(item=>el('li',item)));
  byId('ch-empty').hidden=pocket.length>0;
  feedback.textContent=message;
  showChoices();
  if(focus) [...document.querySelectorAll('[data-key]')].find(node=>node.dataset.key===focus)?.focus({preventScroll:true});
}

async function commit(action,moveFocus=false) {
  if(busy)return;
  busy=true;
  try {
    const entropy=action.type==='assemble'?newSeed():0;
    const result=await write(profile=>{
      const change=applyChronicles(profile,action,entropy);
      if(change.completed) note(profile,'field','Хроники Центавра · '+change.completed+' пройдена.');
      return change;
    });
    play=result.state;
    paint(result.message);
    if(moveFocus) byId('ch-chapter').focus();
  } catch {
    feedback.textContent='Ход не сохранился. Попробуй ещё раз.';
  } finally {busy=false;}
}

function work(object,sign) {
  const {run,task}=current(play);
  const seed=play.active==='generated'?play.generated.seed:undefined;
  if (task?.object===object && task.sign && !sign) {
    byId('ch-task-actions').querySelector('button')?.focus();
  }
  void commit({type:'work',object,sign,chapter:play.active,step:run.step,seed});
}

const visit=era=>commit({type:'visit',era});
const assemble=era=>commit({type:'assemble',era},true);
const newSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0];

const avatarFields={
  name:['Позывной',aliases],color:['Палитра',colors],hat:['Головной убор',headwear],
  role:['Умение',['Читает знаки','Чинит механизмы']]
};

function avatarPreview() {
  const name=aliases[draft.name];
  byId('ch-avatar-preview').replaceChildren(pixelPreview(avatarPixels(draft),name),el('div',name));
}

function paintAvatar() {
  byId('ch-avatar-fields').replaceChildren(...Object.entries(avatarFields).map(([key,[label,values]])=>{
    const row=el('label',label);
    const select=el('select');
    const value=key==='role'?Object.keys(family).indexOf(draft.role):draft[key];
    values.forEach((name,index)=>select.add(new Option(name,index,index===value,index===value)));
    select.onchange=()=>{
      const index=Number(select.value);
      draft[key]=key==='role'?Object.keys(family)[index]:index;
      avatarPreview();
    };
    row.append(select);
    return row;
  }));
  avatarPreview();
}

function chooseAvatar(id) {
  avatarDialog.close();
  void commit({type:'cast',id,avatar:draft},true);
}

byId('ch-avatar-open').onclick=()=>{
  draft=play.avatar?{...play.avatar}:generateAvatar(newSeed());
  paintAvatar();
  avatarDialog.showModal();
};
byId('ch-avatar-close').onclick=()=>avatarDialog.close();
byId('ch-avatar-random').onclick=()=>{draft=generateAvatar(newSeed());paintAvatar();};
byId('ch-avatar-save').onclick=()=>chooseAvatar('custom');
byId('ch-avatar-family').onclick=()=>chooseAvatar('family');

for (const [id,era] of Object.entries(eras)) startEra.add(new Option(era.name,id));
byId('ch-assemble').onclick=()=>assemble(startEra.value);
bus.addEventListener('change',()=>{if(!busy){play=model(state.chronicles);paint();}});
paint();
