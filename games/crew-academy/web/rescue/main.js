import {crewRequest} from '../crewRequest.js';
import {markRoute} from '../crewRoute.js';
import {note, write} from '../tvijoService.js';
import {rescueHref,rescueLine,rescueSteps} from './mission.js';

const get = id=>document.getElementById(id);
const lobby = get('rescue-lobby'), mission = get('rescue-mission');
const title = get('rescue-title'), task = get('rescue-task'), role = get('rescue-role');
const post = get('rescue-partner'), controls = get('rescue-controls');
const field = mission.querySelector('.rescue-view'), report = get('rescue-field-status');
const alert = get('rescue-alert');
const other = /^#[0-9a-f]{32}$/.test(location.hash)?location.hash.slice(1):null;
const lanes = {upper:'Верхняя линия',lower:'Нижняя линия'};
const roleName = {drone:'Самолётик',robot:'Робот'};
const phaseText = {
  survey:'Самолётик на посадочной площадке. Капсулу видно на другой стороне.',
  mark:'Сканирование завершено. Разведчик готовит отметку.',
  anchor:'Метка передана. Робот может протянуть трос.',
  cross:'Трос натянут. Самолётик может перелететь к капсуле.',
  pull:'Капсула пристёгнута. Робот ждёт команды на подъём.',
  done:'Капсула на платформе. Оба поста подтвердили спасение.'
};
const actions = {
  survey:{title:'Осмотри разлом',task:'Сканер покажет, какая линия перекрыта обломками.',button:'Просканировать разлом'},
  mark:{title:'Отметь путь',task:'Самолётик передаст отметку на пульт Робота.'},
  anchor:{title:'Протяни трос',task:'Выбери линию, которую отметил Самолётик.'},
  cross:{title:'Забери капсулу',task:'Перелети по натянутому тросу и пристегни капсулу.',button:'Перелететь и пристегнуть'},
  pull:{title:'Подними капсулу',task:'Самолётик подтвердил захват. Пора включить лебёдку.',button:'Поднять капсулу'}
};

let snapshot = null, reading = false, sending = false, revision = 0;
const say = text=>{if(alert.textContent!==text)alert.textContent=text;};
function link(label,href,primary=false) {
  const a=document.createElement('a');
  a.className='rescue-button'+(primary?' primary':'');
  a.textContent=label;
  a.href=href;
  return a;
}
function button(label, action, lane) {
  const b=document.createElement('button');
  b.type='button';
  b.className='rescue-button primary';
  b.textContent=label;
  b.onclick=()=>send(action,lane);
  return b;
}

function listPlayers(session) {
  const rows=session.eligible;
  mission.hidden=true;
  lobby.hidden=false;
  get('rescue-lobby-text').textContent = rows.length
    ? 'Выбери пилота, с которым зажёг маяк. Кто начнёт смену, встанет за пульт Самолётика.'
    : !session.signedIn?'Получи позывной на станции игроков и зажги маяк вместе с напарником.'
      : !session.visible?'Открой карточку пилота на станции игроков, чтобы участвовать в парной вылазке.'
      : 'Зажгите Парный маяк вместе. После этого здесь появится позывной напарника.';
  get('rescue-crew').replaceChildren(...rows.map(player=>{
    const label=player.phase==='done'?'Посмотреть итог':player.phase?'На свой пост':'Выбрать напарника';
    const row=document.createElement('div');
    const name=document.createElement('strong');
    name.textContent=player.callsign;
    row.className='rescue-peer';
    row.append(name,link(label,rescueHref(player.id),true));
    return row;
  }));
}

function recordFinish(run) {
  const entry={mission:run.mission, at:run.finished*1000, lane:run.lane, partner:run.partner, role:run.role};
  return write(profile=>{
    const previous=profile.rescueReport;
    if (previous?.mission===entry.mission||previous?.at>entry.at) return;
    profile.rescueReport=entry;
    note(profile,'field','Линия спасения · '+rescueLine(entry));
  });
}

function scene(data) {
  const run=data.rescue;
  lobby.hidden=true;
  mission.hidden=false;
  post.hidden=false;
  post.textContent='Напарник · '+data.partner;
  controls.replaceChildren();
  role.hidden=!run;
  if (run) {
    role.querySelector('img').src='./art/crew/'+(run.role==='robot'?'robot':'plane')+'.webp';
    role.querySelector('strong').textContent=roleName[run.role];
  }
  const phase=run?.phase||'survey';
  const stepIndex=phase==='done'?rescueSteps.length:rescueSteps.findIndex(step=>step.phase===phase);
  field.dataset.phase=phase;
  field.dataset.lane=run?.lane||'';
  field.dataset.role=run?.role||'';
  report.textContent=phaseText[phase];
  get('rescue-steps').replaceChildren(...rescueSteps.map((step,index)=>{
    const item=document.createElement('li');
    item.textContent=step.label;
    if (index<stepIndex) item.dataset.step='complete';
    if (run&&index===stepIndex) item.setAttribute('aria-current','step');
    return item;
  }));

  if (!run) {
    title.textContent='Капсула за разломом';
    task.textContent='Начни вылазку за Самолётика. Напарник получит управление Роботом на своей странице.';
    controls.append(button('Начать спасение','start'));
    return;
  }
  markRoute(phase==='done'?'rescue-result':'rescue',other);
  if (phase==='done') {
    title.textContent='Капсула поднята!';
    task.textContent='Знак спасательной связки получили оба пилота.';
    const journal = link('Открыть журнал','./#journal',true);
    const recorded = recordFinish(run).catch(()=>say('Результат сохранён на станции. Открой смену ещё раз, чтобы обновить свой журнал.'));
    journal.onclick = async event=>{
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      await recorded;
      location.assign(journal.href);
    };
    controls.append(journal);
    return;
  }
  const step=rescueSteps[stepIndex], copy=actions[phase];
  const hint = run.lane ? lanes[run.lane] : '';
  if (run.role!==step.role) {
    title.textContent='Ход напарника';
    task.textContent=roleName[step.role]+' · '+copy.title.toLowerCase()+'.'+(hint&&phase!=='mark'?' Метка — '+hint.toLowerCase()+'.':'');
    return;
  }
  title.textContent=copy.title;
  task.textContent=copy.task+(hint&&(phase==='mark'||phase==='anchor')?' Метка сканера — «'+hint+'».':'');
  if (phase==='mark'||phase==='anchor') {
    for (const [lane,label] of Object.entries(lanes)) controls.append(button(label,step.action,lane));
  } else controls.append(button(copy.button,step.action));
}

function display(data) {
  const changed=JSON.stringify(data)!==JSON.stringify(snapshot);
  snapshot=data;
  if (!changed) return;
  if (other) scene(data);
  else listPlayers(data);
}

async function refresh(manual=false) {
  if (reading||sending) return;
  if (!manual&&snapshot?.rescue?.phase==='done') return;
  reading=true;
  const issued=revision;
  try {
    const data=await crewRequest('rescue'+(other?'?other='+other:''));
    if (issued!==revision) return;
    const changed=JSON.stringify(data)!==JSON.stringify(snapshot);
    if (changed || manual) say('');
    display(data);
  } catch(error) {
    if (issued!==revision) return;
    say(error.message || 'Связь прервалась. Проверь соединение и обнови смену.');
    if (!snapshot) {
      lobby.hidden=false;
      get('rescue-lobby-text').textContent='Открой Парный маяк или вернись к списку напарников.';
    }
  } finally {
    reading=false;
  }
}

async function send(action,lane) {
  if (sending) return;
  sending=true;
  revision++;
  const previous=controls.querySelectorAll('button');
  for (const b of previous) b.disabled=true;
  say('');
  try {
    const data = await crewRequest('rescue',{other,action,...(snapshot?.rescue?{mission:snapshot.rescue.mission}:{}),...(lane?{lane}:{})});
    display(data);
    title.focus({preventScroll:true});
  } catch(error) {
    say(error.message||'Связь прервалась. Повтори действие.');
  } finally {
    sending=false;
    for (const b of previous) b.disabled=false;
  }
}

for (const button of document.querySelectorAll('[data-refresh]')) button.onclick=()=>refresh(true);
window.addEventListener('hashchange',()=>location.reload());
window.addEventListener('pageshow',event=>{if(event.persisted)refresh(true);});
window.addEventListener('online',()=>refresh(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
if (other) window.setInterval(()=>{if(!document.hidden)refresh();},3000);
say('Подключаемся к станции…');
refresh(true);
