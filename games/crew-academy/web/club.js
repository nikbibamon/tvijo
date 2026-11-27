import {heroes,levels} from './catalog.js';
import {interests,radioPhrases,crewBadges} from './crewLabels.js';
import {pixelPreview,pixelStudio} from './pixelAvatar.js';
import {practiceState,relayMap,relayBrief} from './relayMission.js';
import {beaconInvitation} from './beaconInvite.js';
import {invitationLinks,openTelegramShare} from './miniApp.js';
import {state,write,track} from './tvijoService.js';
import {encodeWorld,worldLevel} from './worlds.js';

const campaignTotal=levels.reduce((n,l)=>n+l.tasks.length,0);
const errorText={beacon_unavailable:'Другой пилот уже занял пост, приглашение закрыто или связь между карточками недоступна.',invite_missing:'Ссылка приглашения устарела. Можно начать обычную вылазку.',contacts:'Убери из сообщения ссылки и личные контакты.',text_length:'Напиши от 1 до 180 знаков.',relay_role:'Этот шаг выполняет напарник.',relay_phase:'Этот шаг сейчас недоступен. Обнови сигнал.',wrong_tone:'Импульсы не совпали. Сверь порядок и повтори.',relay_missing:'Эта вылазка уже закрыта. Открой канал напарника.',session:'Позывной на этом устройстве больше не активен.',visibility:'Сначала открой свою карточку в рейтинге.',unavailable_player:'Этот позывной уже скрыт.',already_or_limit:'Приглашение уже отправлено или достигнут дневной лимит.',invitation:'Ответ на это приглашение уже получен.',channel_or_cooldown:'Сообщение не отправилось. Проверь, открыт ли канал, и попробуй через три секунды.',proof:'Время входа истекло. Начни вход заново.',challenge:'Открой вход из этого же браузера ещё раз.',account_mismatch:'На этом устройстве выбран другой аккаунт Tvijo.'};
async function crewRequest(route,data){
 const response=await fetch('./api/crew/'+route,{method:data===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(7000)});
 const payload=await response.json();if(!response.ok)throw Error(errorText[payload.error]||'Станция игроков временно недоступна. Попробуй ещё раз.');return payload;
}
export function createClub({el,group,para,action,avatar,ii,openModal,isOpen,showWorld,playRelay,toast,playCampaign}){
 let room=null,tab='rank',peer=null,generation=0,busy=false,feedback='',sort='fame',returnPeer=null,offer=null;
 let beaconCode='mine',autoPost=false;
 const drafts=new Map();
 const roomURL=()=> 'room?sort='+sort+(tab==='beacon'?'&beacon='+encodeURIComponent(beaconCode):'')+(peer?'&player='+encodeURIComponent(peer):'')+(offer?'&invite='+encodeURIComponent(offer):'');
 function badge(p){if(!p.avatar)return avatar(p.hero);return group('avatar player-pixels',pixelPreview(p.avatar,'Знак пилота '+p.callsign));}

 const namedLink=(text,url)=>{const a=el('a','btn secondary',text);a.href=url;a.rel='noopener noreferrer';a.target='_blank';return a;};
 const row=(label,value)=>group('fact-row',el('span','',label),el('strong','',String(value)));
 function select(label,items,value){
  const box=el('label','club-select',label),sel=el('select');
  for(const [key,text] of Object.entries(items)){const op=el('option','',text);op.value=key;sel.append(op);}
  sel.value=value;box.append(sel);return {box,sel};
 }
 function tabTo(id,other=null){tab=id;peer=other;feedback='';paint();if(['peer','duet','links','rank','invite'].includes(id))sync();}
 function remember(me){try{if(me)localStorage.setItem('tvijo.crew.joined','1');else localStorage.removeItem('tvijo.crew.joined');}catch{}}
 async function earnTeamMark(info){
  if(state.crewMedal||!(info?.qualified>0))return false;
  return write(save=>{if(save.crewMedal)return false;save.crewMedal=true;return true;});
 }
 async function checkMedal(){
  if(state.crewMedal)return false;
  try{if(localStorage.getItem('tvijo.crew.joined')!=='1')return false;
    const snapshot=await crewRequest('room');return await earnTeamMark(snapshot.invite);
  }catch{return false;}
 }
 function playBeacon(offer){
  if(!isOpen()||offer.status!=='active')return;
  autoPost=false;playRelay({...offer.relay,beaconCode:offer.code});
 }
 function beaconPaint(){
  const beacon=room?.beacon;
  if(tab==='beacon'&&beacon){
   if(beacon.status==='waiting'&&beaconCode==='mine'){
    beaconCode=beacon.code;autoPost=true;history.replaceState(null,'','#beacon/'+beaconCode);
   }
   if(beacon.status==='offer')track('beacon_invite_open');
   if(beacon.status==='active'&&autoPost){playBeacon(beacon);return;}
  }
  paint();
 }
 async function beaconRequest(route,payload){
  if(busy)return;busy=true;const current=generation;
  try{
   const result=await crewRequest(route,payload);
   if(!isOpen()||generation!==current||tab!=='beacon')return;
   if(route==='join')remember(true);
   if(result.code){
    beaconCode=result.code;autoPost=true;
    history.replaceState(null,'','#beacon/'+beaconCode);
   }
   if(payload.action==='accept'&&['active','done'].includes(result.beacon?.status)){track('beacon_pair_accept');autoPost=true;}
   feedback='';await sync();
  }catch(e){if(isOpen()&&current===generation){feedback=e.message;await sync();}}finally{busy=false;}
 }
 async function sync(){
  const id=++generation;try{const data=await crewRequest(roomURL());if(id!==generation||!isOpen())return;room=data;remember(data.me);await earnTeamMark(data.invite);if(id===generation&&isOpen())beaconPaint();}
  catch{if(id===generation&&isOpen()){feedback='Не удаётся связаться со станцией игроков. Игровые миссии доступны.';paint();}}
 }
 async function mutate(route,payload,ok='',after){
  if(busy)return;busy=true;const id=generation;
  try{await crewRequest(route,payload);if(id!==generation||!isOpen())return;feedback=ok;if(after)after();await sync();}
  catch(e){if(id===generation&&isOpen()){feedback=e.message;paint();}}
  finally{busy=false;}
 }
 function open(which='rank',id=null){tab=which;beaconCode=which==='beacon'&&id!=null?id:'mine';autoPost=which==='beacon'&&!!id;offer=which==='invite'?id:null;peer=['invite','beacon'].includes(which)?null:id;returnPeer=null;feedback='';room=null;openModal('Станция игроков',para('Подключаемся к станции…'),'club');sync();}
 function google(){
  if(!room?.sso)return namedLink('Вход на tvijo.com','https://tvijo.com/ru/login');
  return action('Войти через Tvijo',async()=>{try{const d=await crewRequest('auth/start',{});if(d.available)location.assign(d.url);else{feedback='Связь со входом Tvijo пока не включена.';paint();}}catch(e){feedback=e.message;paint();}},'btn secondary','person');
 }
 async function finish(ticket){
  history.replaceState(null,'',location.pathname+location.search+'#hq');open('profile');
  try{await crewRequest('auth/finish',{ticket});feedback='Аккаунт Tvijo привязан. Твой позывной доступен на этом устройстве.';await sync();}
  catch(e){feedback=e.message;await sync();}
 }
 function profile(){
  const m=room.me;
  if(!m)return [para('Получи игровой позывной. Станция начнёт считать выполненные поручения. Ты сам выбираешь, когда открывать карточку другим экипажам.'),action('Получить позывной',()=>mutate('join',{hero:state.hero},'Позывной готов.'),'btn primary','users'),group('pilot',el('h3','','Аккаунт Tvijo'),room.sso?para('Сначала получи позывной, затем сможешь привязать его через Google-вход Tvijo.'):para('Google-вход откроется на основном сайте. На этой станции пока действует гостевой позывной.'),...(!room.sso?[google()]:[]))];
  const hero=select('Любимый герой',Object.fromEntries(Object.entries(heroes).map(([k,v])=>[k,v.name])),m.hero),focus=select('Что мне нравится',interests,m.focus);
  const vis=el('input');vis.type='checkbox';vis.checked=Boolean(m.visible);const check=el('label','check-line');check.append(vis,document.createTextNode('Показывать мою карточку в рейтинге и принимать приглашения.'));
  const save=action('Сохранить карточку',()=>mutate('profile',{visible:vis.checked,hero:hero.sel.value,focus:focus.sel.value},'Карточка сохранена.',()=>{if(returnPeer&&vis.checked){tab='peer';peer=returnPeer;returnPeer=null;}}),'btn primary','check');
  const header=group('crew-identity',badge(m),group('',el('h3','',m.callsign),el('small','',m.linked?'Аккаунт Tvijo':'Гостевой позывной')));
  const blocks=[header,action('Нарисовать свой аватар',()=>tabTo('avatar'),'btn secondary','spark'),row('Очки славы',m.fame),row('Маяки с разными напарниками',m.beacons),row('Поручения, подтверждённые станцией',m.points+' / '+campaignTotal),row('Знак за игру',crewBadges[m.badge]),group('club-filters',hero.box,focus.box),check,para('Другие игроки увидят позывной, героя, интерес, аватар, выполненные поручения и парные маяки. Если скрыть карточку, приглашения и переписка закроются.','subtle'),save];
  if(m.visible){
   const url=new URL(location.origin+location.pathname);url.hash='crew/'+m.id;
   const share=action('Ссылка на мою карточку',async()=>{try{await navigator.clipboard.writeText(url.href);share.textContent='Ссылка скопирована';}catch{const input=el('input','world-idea');input.value=url.href;input.readOnly=true;share.after(input);input.select();}},'btn secondary','users');
   blocks.push(group('actions',share));
  }
  if(!m.linked)blocks.push(group('pilot',el('h3','','Аккаунт Tvijo'),para(room.sso?'Войди через Google на сайте Tvijo, чтобы открыть этот игровой профиль с другого устройства.':'На основном сайте доступен Google-вход. Перенос аккаунта сюда включается после подключения игрового шлюза.'),google()));
  if(m.linked)blocks.push(action('Выйти из игрового аккаунта',()=>mutate('logout',{},'Выход выполнен.'),'text-btn'));
  if(room.blocked.length)blocks.push(group('pilot',el('h3','','Скрытые позывные'),...room.blocked.map(p=>group('club-row',el('strong','',p.callsign),action('Показать',()=>mutate('pair',{other:p.id,action:'unmute'},'Позывной снова виден.'),'chip')))));
  return blocks;
 }
 function buttonRow(p,index,label){
  const b=el('button','club-entry');b.type='button';b.append(el('b','rank-num',label||String(index+1)),badge(p),group('crew-bio',el('strong','',p.callsign),el('small','',heroes[p.hero].name+' · '+interests[p.focus])),el('b','points',String(p.points)),ii('chev'));
  b.setAttribute('aria-label',p.callsign+', поручений '+p.points);b.onclick=()=>p.id===room.me?.id?tabTo('profile'):tabTo('peer',p.id);return b;
 }
 function rankings(){
  const arr=[group('rank-tools',el('h3','','Таблица пилотов'),group('chip-group',...([['fame','Слава'],['points','Поручения'],['beacons','Маяки']]).map(([key,label])=>{const b=action(label,()=>{sort=key;sync();},'chip'+(sort===key?' chosen':''));b.setAttribute('aria-pressed',String(sort===key));return b;})))];
  const table=el('table','leaderboard'),head=table.createTHead().insertRow();
  for(const name of ['Место','Пилот','Слава','Поручения','Маяки']){const th=el('th','',name);th.scope='col';head.append(th);}
  const tbody=table.createTBody();let last=null,rank=0;
  for(const [idx,p] of room.board.entries()){
   const score=sort==='fame'?[p.fame,p.points,p.beacons]:sort==='points'?[p.points,p.beacons]:[p.beacons,p.points];if(String(last)!==String(score)){rank=idx+1;last=score;}
   const tr=tbody.insertRow();tr.insertCell().append(el('b','rank-num',String(rank)));
   const who=el('button','rank-player');who.type='button';who.append(badge(p),group('crew-bio',el('strong','',p.callsign),el('small','',interests[p.focus])));
   who.onclick=()=>p.id===room.me?.id?tabTo('profile'):tabTo('peer',p.id);tr.insertCell().append(who);tr.insertCell().textContent=p.fame;tr.insertCell().textContent=p.points;tr.insertCell().textContent=p.beacons;
  }
  if(!room.board.length){const td=tbody.insertRow().insertCell();td.colSpan=5;td.className='no-pilots';td.textContent='Здесь появятся пилоты, открывшие свою карточку.';}
  arr.push(table,para('Слава за первое выполнение поручения — 10, за маяк с новым напарником — 30, за успешное приглашение — 25 каждому. Автопилот тренировочный.','subtle'));
  if(!room.me?.visible)arr.push(action(room.me?'Открыть мою карточку':'Создать мою карточку',()=>tabTo('profile'),'btn primary','person'));
  return arr;
 }
 function inviteView(){
  const info=room.invite||{},m=room.me;
  const art=el('img');art.src='./art/badges/crew.webp';art.alt='';
  const out=[group('invite-banner',art,group('',el('h3','',offer?'Приглашение в экипаж':'Полетим вместе?'),para('Новый пилот выполняет два разных поручения кампании своими командами. Оба получают по 25 очков славы и открывают знак «Две звезды».')))];
  if(offer){
    if(!info.valid){out.push(para('Ссылка приглашения устарела.'),action('Начать вылазку',playCampaign,'btn primary','play'));return out;}
    if(!m){out.push(action('Принять приглашение и играть',async e=>{
      if(busy)return;busy=true;const b=e.currentTarget;b.disabled=true;
      try{const result=await crewRequest('join',{hero:state.hero,referral:offer});remember(true);offer=null;
        toast(result.referralAccepted?'Приглашение принято. Выполни два разных поручения.':'Позывной уже на связи.');playCampaign();
      }catch(error){feedback=error.message;paint();}finally{busy=false;b.disabled=false;}
    },'btn primary','play'));return out;}
    out.push(para(info.incoming?'Твоё приглашение принято. Осталось выполнить два разных поручения своими командами.':'У тебя уже есть позывной. Можешь сыграть и пригласить своих друзей.'),action('В вылазку',playCampaign,'btn primary','play'));return out;
  }
  if(!m){out.push(action('Получить позывной и ссылку',()=>mutate('join',{hero:state.hero},'Личная ссылка готова.'),'btn primary','users'));return out;}
  if(!info.code){out.push(action('Получить личную ссылку',()=>mutate('invite-link',{},'Личная ссылка готова.'),'btn primary','users'));return out;}
  const link=invitationLinks('r',info.code,location,room.telegramBot);
  const telegram=new URL('https://t.me/share/url');telegram.searchParams.set('url',link.inTelegram);
  telegram.searchParams.set('text','Полетим в экипаже Tvijo? В игре можно управлять дроном, строить миры и зажечь маяк вдвоём.');
  const address=el('input','share-url');address.readOnly=true;address.value=link.browser;address.setAttribute('aria-label','Личная ссылка приглашения');
  const copy=action('Скопировать',async()=>{try{await navigator.clipboard.writeText(link.browser);copy.textContent='Скопировано';}catch{address.focus();address.select();}},'btn secondary');
  const send=namedLink('Пригласить в Telegram',telegram.href);send.onclick=event=>openTelegramShare(event,telegram.href);
  out.push(address,group('actions',send,copy),row('Ждём выполнения заданий',info.waiting),row('Успешные приглашения с твоим участием',info.qualified));
  if(info.incoming)out.push(para('Ты тоже участвуешь в приглашении. Выполни два разных поручения кампании.'));
  return out;
 }
 function duet(){
  const out=[el('h3','duet-title','Два пилота. Один сигнал.'),para('Разведчик находит частоту на причале. Инженер получает три импульса по рации и повторяет их на другом конце планеты.'),relayMap(null),
   action('Тренировка с Роботом',()=>playRelay(practiceState()),'btn primary','play'),para('В тренировке ты пробуешь обе роли. В таблицу идут маяки, зажжённые с другим пилотом.','subtle')];
  out.push(action('Пригласить друга на второй пост',()=>open('beacon'),'btn secondary','users'));
  const peers=room.peers.filter(p=>p.status==='accepted');
  if(peers.length){out.push(el('h3','club-head','Сыграть вдвоём'));for(const p of peers)out.push(relayCard(p));}
  else out.push(action('Найти напарника',()=>tabTo(room.me?.visible?'rank':'profile'),'btn secondary','users'));
  return out;
 }
 function relayCard(p){
  const live=room.relays.find(r=>r.other===p.id);
  const summary=live?relayBrief(live):'Новая вылазка на два поста';
  const join=action(!live?'Начать парный маяк':live.phase==='done'?'Новая вылазка':'На свой пост',async()=>{
   join.disabled=true;try{const payload={other:p.id,action:'start'};if(live?.phase==='done')payload.mission=live.mission;
    const result=await crewRequest('relay',payload);if(isOpen())playRelay({...result.relay,other:p.id,partner:p.callsign});
   }catch(e){feedback=e.message;paint();}finally{join.disabled=false;}
  },'btn secondary','radio');
  return group('pair-card',ii('radio'),group('',el('strong','',p.callsign),para(summary)),join);
 }
 async function updateRelay(run,cmd,sequence){
  const result=await crewRequest('relay',{other:run.other,mission:run.mission,action:cmd,...(sequence?{sequence}:{})});return {...run,...result.relay};
 }
 async function refreshRelay(run){
  const fresh=await crewRequest('room?player='+encodeURIComponent(run.other));const r=fresh.relays.find(q=>q.other===run.other&&q.mission===run.mission);
  if(!r)throw Error(errorText.relay_missing);return {...run,...r};
 }
 function editor(){
  const m=room.me;if(!m)return profile();
  return pixelStudio({el,group,action,para},m.avatar,code=>mutate('profile',{visible:Boolean(m.visible),hero:m.hero,focus:m.focus,avatar:code},'Аватар сохранён.',()=>{tab='profile';}),()=>tabTo('profile'));
 }
 function connections(){
  if(!room.me?.visible)return [para('Для связи открой свою карточку в рейтинге. Игроки смогут прислать приглашение, а ты решишь, принимать ли его.'),action('Моя карточка',()=>tabTo('profile'),'btn primary','person')];
  if(!room.peers.length)return [para('Выбери игрового напарника в рейтинге и пригласи на связь. После подтверждения можно обмениваться подсказками и своими мирами.'),action('Искать в рейтинге',()=>tabTo('rank'),'btn primary','users')];
  return [para('Выбери позывной, чтобы открыть приглашение или канал экипажа.'),...room.peers.map(p=>group('club-channel',el('small','',p.status==='accepted'?'Канал открыт':p.sender===room.me.id?'Твоё приглашение':'Входящее приглашение'),buttonRow(p,0,'•')))];
 }
 function contact(){
  const p=room.peers.find(x=>x.id===peer)||room.board.find(x=>x.id===peer)||(room.card?.id===peer?room.card:null);
  if(!p)return [para('Эта карточка теперь скрыта.'),action('К рейтингу',()=>tabTo('rank'))];
  const m=room.me,rel=room.peers.find(x=>x.id===peer);
  const arr=[group('crew-identity',badge(p),group('',el('h3','',p.callsign),el('small','',heroes[p.hero].name+' · '+interests[p.focus]))),row('Очки славы',p.fame),row('Подтверждённые поручения',p.points+' / '+campaignTotal),row('Парные маяки',p.beacons),row('Знак за игру',crewBadges[p.badge])];
  const pair=(cmd,msg)=>mutate('pair',{other:p.id,action:cmd},msg,()=>{if(cmd==='mute'||cmd==='decline'){tab='links';peer=null;}});
  if(!m?.visible)arr.push(action('Открыть мою карточку для связи',()=>{returnPeer=p.id;tabTo('profile');},'btn primary','person'));
  else if(!rel)arr.push(action('Пригласить на связь',()=>pair('invite','Приглашение отправлено.'),'btn primary','radio'));
  else if(rel.status==='waiting'){
   if(rel.sender===m.id)arr.push(para('Приглашение доставлено. Ждём ответа напарника.'));else arr.push(group('actions',action('Принять приглашение',()=>pair('accept','Канал открыт.'),'btn primary','check'),action('Отклонить',()=>pair('decline','Приглашение отклонено.'))));
  }else{
   const history=room.notes.filter(n=>n.sender===p.id||n.recipient===p.id).reverse();
   arr.push(relayCard(p),el('h3','club-head','Общий канал'));
   if(!history.length)arr.push(para('Вы на одной частоте. Поздоровайся или предложи план.'));
   else arr.push(group('club-history',...history.map(n=>{const line=group('club-message',el('b','',n.sender===m.id?'Ты':p.callsign),el('span','',n.phrase==='text'?n.body:radioPhrases[n.phrase]));if(n.world)line.append(action('Открыть мир',()=>showWorld(n.world),'chip','orbit'));
    line.append(n.sender===m.id?action('Удалить',()=>mutate('retract',{other:p.id,note:n.id},'Сообщение удалено.'),'note-control'):action('Скрыть и пожаловаться',()=>mutate('report',{other:p.id,note:n.id,reason:'other'},'Сообщение скрыто. Жалоба сохранена для проверки.'),'note-control'));return line;})));
   const input=el('textarea','world-idea channel-input');input.maxLength=180;input.rows=2;input.placeholder='Сообщение напарнику…';input.setAttribute('aria-label','Личное сообщение напарнику');input.value=drafts.get(p.id)||'';input.oninput=()=>drafts.set(p.id,input.value);
   const submit=action('Отправить сообщение',()=>{const text=input.value.trim();if(text)mutate('note',{other:p.id,phrase:'text',text},'Отправлено.',()=>drafts.delete(p.id));},'btn primary','send');
   arr.push(input,submit);const phrases=Object.fromEntries(Object.entries(radioPhrases).filter(([key])=>key!=='world'));
   const msg=select('Сообщение экипажу',phrases,'hello');
   arr.push(group('club-send',msg.box,action('Передать',()=>mutate('note',{other:p.id,phrase:msg.sel.value},'Сообщение доставлено.'),'btn primary','send')));
   if(state.worlds.length){const worlds=Object.fromEntries(state.worlds.map(spec=>[encodeWorld(spec),worldLevel(spec).name+' · '+spec.steps+' платф.']));const w=select('Мир для напарника',worlds,Object.keys(worlds)[0]);arr.push(group('club-send',w.box,action('Поделиться',()=>mutate('note',{other:p.id,phrase:'world',world:w.sel.value},'Маршрут передан.'),'btn secondary','orbit')));}
  }
  if(m?.visible)arr.push(action('Скрыть этот позывной',()=>pair('mute','Позывной скрыт, канал закрыт.'),'text-btn'));
  return arr;
 }
 function paint(){
  if(!isOpen())return;
  const status=el('div','club-feedback',feedback);status.setAttribute('role','status');
  if(!room&&tab==='beacon'){openModal('Парный маяк',[status,action('Обновить связь',sync),action('Продолжить кампанию',playCampaign)],'club');return;}
  if(!room){openModal('Станция игроков',[status,action('Тренировка с Роботом',()=>playRelay(practiceState()),'btn primary','play'),action('Обновить',sync,'btn secondary')],'club');return;}
  if(tab==='beacon'){
   const view=beaconInvitation({...room,selectedHero:state.hero},{el,group,para,action,ii,request:beaconRequest,track,share:namedLink,play:playBeacon,campaign:playCampaign,code:beaconCode});
   openModal('Связь с напарником',[status,...view],'club');return;
  }
  const menu=group('club-tabs',...([['duet','Парный маяк'],['rank','Рейтинг'],['links','Связь'],['invite','Пригласить'],['profile','Моя карточка']]).map(([id,label])=>{const b=action(label,()=>tabTo(id),'chip'+(tab===id||tab==='peer'&&id==='links'?' chosen':''));b.setAttribute('aria-pressed',String(tab===id));return b;}));
  const view=tab==='invite'?inviteView():tab==='duet'?duet():tab==='avatar'?editor():tab==='rank'?rankings():tab==='profile'?profile():tab==='links'?connections():contact();
  const refresh=action('Обновить',()=>{feedback='';sync();},'text-btn','radio');
  openModal('Станция игроков',[menu,status,...view,group('club-foot',refresh)],'club');
 }
 async function listen(){
  if(!isOpen()||!room||busy||document.hidden||!['links','peer','duet','rank','invite','beacon'].includes(tab)||document.activeElement?.matches('input,textarea,select,option'))return;
  const n=generation,view=tab,person=peer;
  try{const snapshot=await crewRequest(roomURL());if(n===generation&&view===tab&&person===peer&&!busy&&isOpen()&&JSON.stringify(snapshot)!==JSON.stringify(room)){room=snapshot;await earnTeamMark(snapshot.invite);if(n===generation&&isOpen())beaconPaint();}}catch{}
 }
 window.setInterval(listen,5000);
 return {open,finish,updateRelay,refreshRelay,checkMedal};
}
