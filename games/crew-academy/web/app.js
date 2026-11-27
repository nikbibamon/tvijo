import {heroes,heroOrder,tiers,levels,moves} from './catalog.js';
import {state,chat,bus,write,note,collectSpark,setHero,setLevel,setTier,setShowHints,complete,currentLevel,doneFor,isOpen,resetStage,addLines,speech,dictate,stopVoice,track,pilot,pilotReport,localFunnel,turn,fieldOrder,buildWorld,importWorld,grantDemo,rewind,claimAward} from './tvijoService.js';
import {readyTasks,tacticalDigest,resolveLevel} from './strategy.js';
import {worldLevel,encodeWorld,decodeWorld} from './worlds.js';
import {icon,populate} from './icons.js';
import {createField} from './field.js';
import {relayBrief,relayStage,relayDiagram,relayMap} from './relayMission.js';
import {crewTerminal} from './relayConsole.js';
import {flightAwards,awardAvailable} from './flightAwards.js';
import {workshop} from './workshop.js';
import {createClub} from './club.js';
const $=s=>document.querySelector(s), el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
const ii=id=>{const n=el('i','ico');n.innerHTML=icon(id);return n;};
const action=(label,fn,cls='btn secondary',sym)=>{const b=el('button',cls);b.type='button';if(sym)b.append(ii(sym));b.append(document.createTextNode(label));b.onclick=fn;return b;};
const picture=(src,alt='',cls)=>{const img=el('img',cls);img.src=src;img.alt=alt;return img;};
const group=(cls,...children)=>{const g=el('div',cls);g.append(...children);return g;};
const para=(t,cls='')=>el('p',cls,t);
const modal=$('#modal'),body=$('#modal-body'),radio=$('#radio');
let page='hq',mapId=state.level,busy=false,voiceDraft=false,spokenInto='',toastTimer,scoreText='',lastHint='',lastShownStage='',lastMessageList=null,activeModal='';
let activeRelay=null,mobileRadio=false,finishedLevel=null,lastHints;
const notice=$('#toast');
const phoneLayout=matchMedia('(max-width: 800px), (orientation: landscape) and (max-height: 540px)');
const fieldLevel=()=>activeRelay?relayStage(activeRelay.role):currentLevel();
function fieldRadio(open){
 if(activeRelay){if(open){if(activeRelay.practice){toast(relayBrief(activeRelay));}else club.open('peer',activeRelay.other);}return;}
 mobileRadio=open&&phoneLayout.matches;
 document.body.classList.toggle('field-radio-open',mobileRadio);
 if(page==='field')field.suspend(mobileRadio||modal.open);
 if(open&&!mobileRadio)$('#radio').scrollIntoView({block:'nearest'});
 if(!open&&page==='field'&&!modal.open)$('#stage').focus({preventScroll:true});
}
phoneLayout.addEventListener('change',()=>{if(mobileRadio&&!phoneLayout.matches)fieldRadio(false);});
const maps={hq:['Ночной штаб','Командный мостик экспедиции Tvijo'],map:['Карта сектора','Выбери локацию и узнай, какой команде она под силу.'],journal:['Журнал смены','Приказы, решения экипажа и результат каждого шага.']};
function toast(t){
 const overlay=$('#field-overlay');
 const inline=modal.open?body:page==='field'&&!overlay.hidden?overlay.firstElementChild:page==='field'?$('#field .field-left'):$('#'+page);
 const host=state.showHints?document.body:inline;host.append(notice);notice.classList.toggle('inline-notice',!state.showHints);
 notice.textContent=t;clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.textContent='',3300);
}
function hintOption(){
 const input=el('input');input.type='checkbox';input.dataset.hints='';input.checked=state.showHints;
 const label=el('label','hint-check');label.append(input,document.createTextNode('Всплывающие подсказки'));return label;
}
document.addEventListener('change',e=>{if(e.target.matches('input[data-hints]'))setShowHints(e.target.checked);});
function syncHints(){
 for(const input of document.querySelectorAll('input[data-hints]'))input.checked=state.showHints;
 if(lastHints===state.showHints)return;
 lastHints=state.showHints;document.body.classList.toggle('quiet-flight',!state.showHints);
 $('#field-brief').open=state.showHints;
 clearTimeout(toastTimer);notice.textContent='';document.body.append(notice);
 $('#field-feedback').textContent='';
 if(finishedLevel&&page==='field')showFinish(finishedLevel);
}
function status(t){lastHint=t;$('#radio-state').textContent=t;}
function openModal(title,content,id=''){activeModal=id;$('#modal-title').textContent=title;body.replaceChildren(...(Array.isArray(content)?content:[content]));if(!modal.open)modal.showModal();if(page==='field')field.suspend(true);}
function close(){if(modal.open)modal.close();}
$('#close-modal').onclick=close;modal.addEventListener('click',e=>{const r=modal.getBoundingClientRect();if(e.target===modal&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))close();});modal.addEventListener('close',()=>{if(modal.open)return;activeModal='';stopVoice();if(page==='field')field.suspend(mobileRadio);});
function avatar(who){const h=heroes[who],a=el('span','avatar'+(who==='tvijo'?' cpu':''));a.style.setProperty('--hc',h?.color||'#c3a1dd');if(h)a.append(picture('./art/crew/'+who+'.webp'));else if(who==='tvijo')a.append(picture('./art/tvijo.png'));else a.append(ii('person'));return a;}
function showMessages(){if(lastMessageList===chat)return;const oldCount=lastMessageList?.length||0;lastMessageList=chat;const box=$('#messages');if(!oldCount||chat.length<=oldCount)box.replaceChildren();const visible=oldCount&&chat.length>oldCount?chat.slice(oldCount):chat;box.append(...visible.map(msg=>{const h=heroes[msg.who],wrap=group('message',avatar(msg.who),group('',el('b','',h?.name||(msg.who==='you'?'Ты':'Бортовой Tvijo')),para(msg.text)));wrap.style.setProperty('--hc',h?.color||(msg.who==='you'?'#f3cc8c':'#c5a3e4'));return wrap;}));box.scrollTop=box.scrollHeight;requestAnimationFrame(()=>{box.scrollTop=box.scrollHeight;});}
function crew(){const wrap=$('#crew');if(!wrap.children.length)for(const id of heroOrder){const h=heroes[id],b=el('button','crew-card');b.dataset.hero=id;b.type='button';b.style.setProperty('--hero-color',h.color);b.title=h.name+' · '+h.ability;b.setAttribute('aria-label','Выбрать: '+h.name+'. '+h.ability);b.append(picture('./art/crew/'+id+'.webp'),el('strong','',h.short||h.name),el('small','',h.role));b.onclick=async()=>{await setHero(id);field.setHero(id);};wrap.append(b);}
  [...wrap.children].forEach(b=>{const chosen=b.dataset.hero===state.hero;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',chosen);});
  const h=heroes[state.hero];$('#selected-skill').replaceChildren(ii('zap'),group('',el('b','',h.name+' · '),document.createTextNode(h.ability)));}
function routeCard(l){const here=state.level===l.id,cleared=state.completed.includes(l.id),opened=isOpen(l);const b=el('button','route-card'+(here?' current':''));b.append(picture('./art/'+l.art+'.webp'),group('',el('strong','',l.name),el('small','',cleared?'Пройдено':here?'Текущая локация':opened?'Доступно':'Разведка')),ii(cleared?'check':opened?'chev':'lock'));b.onclick=()=>{mapId=l.id;go('map');};return b;}
function suggestions(){
  const l=currentLevel(),ready=readyTasks(l,doneFor()),box=$('#suggestions');box.replaceChildren();
  if(ready.length){for(const id of ready.slice(0,2)){const m=moves[id],t=m.example.split(/, чтобы| и найди| и дождись/)[0].replace(/\.$/,'');box.append(action(t,()=>draft(t),'chip'));}}
  else box.append(action('Где капсула?',()=>draft('Где капсула?'),'chip'));
  if(box.children.length<2)box.append(action('Нужна подсказка',()=>draft('Как пройти дальше?'),'chip'));
}
function draft(text){if(page==='field'&&phoneLayout.matches)fieldRadio(true);$('#command').value=text;voiceDraft=false;spokenInto='';$('#command').focus({preventScroll:false});status('Уточни приказ или нажми «Отправить».');}
function radioHud(){const t=tiers[state.tier];$('#tier-label').textContent=t.label+' · '+t.cost;$('#score').textContent=scoreText;suggestions();$('#radio-state').textContent=lastHint;}
function renderMap(){const pins=$('#map-pins'),pos=[[12,73],[31,54],[51,63],[71,45],[82,28],[92,12]];pins.replaceChildren(...levels.map((l,i)=>{const b=action(String(i+1),()=>{mapId=l.id;renderMap();},'pin'+(mapId===l.id?' chosen':''));b.style.left=pos[i][0]+'%';b.style.top=pos[i][1]+'%';b.setAttribute('aria-label',l.name);return b;}));
  const l=resolveLevel(mapId)||levels[0],opened=isOpen(l),idx=levels.indexOf(l),card=$('#map-detail');const items=[picture('./art/'+l.art+'.webp',l.name),el('div','tag',l.tag),el('h2','',l.name),para(l.desc)];
  if(state.hero==='blue')items.push(para('Анализ · '+l.tasks.map(([id,pre])=>moves[id].short+(pre.length?' после '+pre.map(p=>moves[p].short).join(' + '):'')).join(' · '),'subtle'));
  if(opened)items.push(action(state.completed.includes(l.id)?'Пройти ещё раз':'Войти в локацию',()=>launch(l,state.completed.includes(l.id)),'btn primary','play'));else items.push(para('Откроется после миссии «'+levels[idx-1].name+'».','inline-note'));card.replaceChildren(...items);
  const worlds=$('#world-list');if(!state.worlds.length){worlds.replaceChildren(group('empty-worlds',ii('spark'),document.createTextNode('Первый свой мир можно построить после Солнечного причала.')));return;}
  worlds.replaceChildren(group('worlds',...state.worlds.map(spec=>{const w=worldLevel(spec);return group('world-row',ii('orbit'),group('',el('strong','',w.name),el('small','', ' · '+w.spec.steps+' платформы')),action('Играть',()=>launch(w,state.completed.includes(w.id)),'btn secondary'));})));
}
function drawGraph(){
 const l=currentLevel(),done=doneFor(),list=[['entry',[]],...l.tasks.map(([id,ds])=>[id,ds.length?ds:['entry']]),['exit',l.tasks.filter(([id])=>!l.tasks.some(([,d])=>d.includes(id))).map(([id])=>id)]];
 const depths={entry:0};for(const [id,deps] of list.slice(1))depths[id]=1+Math.max(...deps.map(d=>depths[d]));const depthMax=Math.max(...Object.values(depths));
 const coords={};const countByDepth={};for(const [id] of list)(countByDepth[depths[id]]||=[]).push(id);
 for(const [id] of list){const a=countByDepth[depths[id]],idx=a.indexOf(id);coords[id]=[54+depths[id]*488/Math.max(1,depthMax),a.length===1?69:36+idx*67];}
 const observations=state.stages[l.id]?.observed||[];
 const latest=new Map();for(const o of observations)for(const t of o.targets||[])latest.set(t,o);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 600 139');svg.setAttribute('role','img');svg.setAttribute('aria-label','Граф задач '+l.name+'; выполнено '+done.length+' из '+l.tasks.length);
 const node=(s,a,t)=>{const n=document.createElementNS(svg.namespaceURI,s);for(const [k,v] of Object.entries(a))n.setAttribute(k,v);if(t)n.textContent=t;svg.append(n);return n;};
 for(const [id,deps] of list){const [x,y]=coords[id];for(const dep of deps){const [a,b]=coords[dep];node('path',{d:'M'+(a+14)+' '+b+' C'+(a+46)+' '+b+' '+(x-46)+' '+y+' '+(x-14)+' '+y,fill:'none',stroke:done.includes(dep)||dep==='entry'?'#a993ad':'#52485f','stroke-width':2});node('path',{d:'m'+(x-20)+' '+(y-3)+' 6 3 -6 3',fill:'none',stroke:'#b6a2c1','stroke-width':1.5});}}
 for(const [id] of list){const [x,y]=coords[id],ok=id==='entry'||done.includes(id)||id==='exit'&&state.completed.includes(l.id),ready=readyTasks(l,done).includes(id)||id==='exit'&&done.length===l.tasks.length;const color=ok?'#7bdeb0':ready?'#f0bf76':'#80728d';const sample=latest.get(id);
 if(sample&&(!sample.ok||sample.source==='fallback')){const ring=node('circle',{cx:x,cy:y,r:17,fill:'none',stroke:sample.source==='fallback'?'#cf9bf3':'#ec897e','stroke-dasharray':'3 3','stroke-width':2});const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=sample.source==='fallback'?'Сработал резервный канал':'Последний приказ потребовал уточнения';ring.append(title);}
 node('circle',{cx:x,cy:y,r:12,fill:'#262033',stroke:color,'stroke-width':2.3});node('circle',{cx:x,cy:y,r:4,fill:color});node('text',{x,y:y+29,'text-anchor':'middle',fill:'#e1d7e8','font-size':13,'font-family':'Rubik, sans-serif'},id==='entry'?'Старт':id==='exit'?'Капсула':moves[id].short);}
 $('#graph').replaceChildren(svg);$('#graph-alert').hidden=![...latest.values()].some(o=>!o.ok);$('#graph-reserve').hidden=![...latest.values()].some(o=>o.source==='fallback');$('#graph-stage').textContent=l.name;
 $('#plan-json').textContent=JSON.stringify(l.tasks.map(([task,requires])=>({agent:heroes[moves[task].actor].name,task,requires,status:done.includes(task)?'done':readyTasks(l,done).includes(task)?'ready':'waiting'})),null,2);
}
function journal(){
 drawGraph();const filter=$('#log-filter').value;const list=state.log.filter(x=>filter==='all'||x.type===filter).slice(-20).reverse();const target=$('#log-list');if(!list.length)target.replaceChildren(el('li','','Здесь появятся выполненные приказы и найденные капсулы.'));else target.replaceChildren(...list.map(row=>{const li=el('li');li.append(el('time','',new Date(row.at).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})),document.createTextNode(row.text));return li;}));
 const scene=state.stages[state.level],digest=scene?.digest;$('#digest-text').textContent=digest?'Сводка после '+digest.turn+' приказов. Из последних пяти '+digest.blocks+' потребовали уточнения. '+digest.hint:'После пяти приказов появится сводка по реальным ходам этой миссии. Сейчас '+(scene?.turns||0)+' из 5.';}
function fieldHud(){
 $('#field-sparks').hidden=!!activeRelay;
 $('#mic-field').setAttribute('aria-label',activeRelay?'Канал напарника':'Открыть рацию экипажа');
 $('#mic-field span').textContent=activeRelay?'Напарник':'Рация';
 if(activeRelay){const r=activeRelay,progress=$('#field-progress');progress.textContent=r.role==='scout'?'Пост разведчика':'Пост инженера';progress.title=progress.textContent;progress.setAttribute('aria-label',progress.title);$('#field-objective').textContent=relayBrief(r);
  $('#field-tasks').replaceChildren(relayDiagram(r,{el,group,ii}));$('#pair-side').replaceChildren(group('pair-side-crew',avatar(state.hero),ii('radio'),r.practice?avatar('robot'):ii('users')),el('h2','','Парный маяк'),para((r.practice?'Тренировка с Роботом':'Напарник · '+r.partner)),relayMap(r),action(r.practice?'Как пройти':'Канал напарника',()=>fieldRadio(true),'btn secondary','radio'));return;}
 $('#field-sparks').textContent='✦ '+(state.stages[state.level]?.sparks?.length||0)+'/3';$('#field-sparks').setAttribute('aria-label','Собрано искр '+(state.stages[state.level]?.sparks?.length||0)+' из трёх');
 const l=currentLevel(),d=doneFor(),ready=readyTasks(l,d);const progress=$('#field-progress'),count=d.length+'/'+l.tasks.length;progress.textContent=state.showHints?l.tag+' · '+count:count;progress.title='Поручения экипажа · '+count;progress.setAttribute('aria-label',progress.title);$('#field-objective').textContent=!ready.length&&l.id==='mine'?'Нажми E или коснись «Взять капсулу». У правого края её принесёт дрон.':ready.length?(l.id==='dock'?'Нажми «Закрепить мост» или дай Роботу приказ в рацию. Капсула на платформе справа.':l.desc):'Нажми E или коснись капсулы. Герой подойдёт и заберёт её.';
 $('#field-tasks').replaceChildren(...l.tasks.map(([id])=>{const m=moves[id],cls=d.includes(id)?'done':ready.includes(id)?'ready':'locked';const b=action((d.includes(id)?'✓ ':'')+m.name,()=>{if(d.includes(id))toast('Шаг уже подтверждён.');else if(ready.includes(id)){$('#stage').focus({preventScroll:true});field.issue(id);}else toast('Сначала: '+l.tasks.find(t=>t[0]===id)[1].map(n=>moves[n].name).join(', '));},cls);return b;}));}
function render(){
 syncHints();
 $('#balance').textContent=state.balance;$('#wallet').setAttribute('aria-label','Кошелёк: '+state.balance+' демо-кредитов');const sound=$('#sound');sound.replaceChildren(ii(state.voice?'sound':'mute'));sound.setAttribute('aria-label',state.voice?'Выключить озвучку':'Включить озвучку');sound.setAttribute('aria-pressed',state.voice);
 const info=page==='field'?[fieldLevel().name,fieldLevel().tag+' · '+heroes[state.hero].name]:maps[page];$('#page-title').textContent=info[0];$('#page-sub').textContent=info[1];
 for(const nav of document.querySelectorAll('[data-page]')){const on=nav.dataset.page===page;nav.classList.toggle('active',on);if(on)nav.setAttribute('aria-current','page');else nav.removeAttribute('aria-current');}
 if(page==='hq'){crew();$('#home-route').replaceChildren(...levels.map(routeCard));$('#start-mission span').textContent=state.completed.length||doneFor().length?'Продолжить вылазку':'Начать вылазку';}
 if(page==='map')renderMap();
 if(page==='field'){
   if(!activeRelay&&field.stageId&&field.stageId!==state.level)field.start(currentLevel(),state.hero);
   fieldHud();
 }
 if(page==='journal')journal();
 if(page==='hq'||page==='field'){radioHud();showMessages();}
}
function go(next,hash=true){
 if(!['hq','map','field','journal'].includes(next))next='hq';if(modal.open)close();if(page==='field'&&next!=='field'){field.leave();activeRelay=null;mobileRadio=false;}document.body.classList.toggle('in-field',next==='field');document.body.classList.toggle('field-radio-open',next==='field'&&mobileRadio);document.body.classList.toggle('pair-running',next==='field'&&!!activeRelay);if(next!==page){stopVoice();status('');voiceDraft=false;}
 finishedLevel=null;$('#field-result').hidden=true;$('#field').classList.remove('compact-result');
 page=next;for(const n of ['hq','map','field','journal'])$('#'+n).hidden=n!==page;
 if(page==='hq'||page==='field'){const dest=page==='hq'?$('#radio-home'):$('#radio-field');if(radio.parentElement!==dest)dest.append(radio);radio.hidden=false;}else radio.hidden=true;
 if(page==='map')track('open_map');if(page==='field'){track('field_start');field.start(fieldLevel(),state.hero);field.suspend(mobileRadio||modal.open);if(!mobileRadio&&!modal.open)$('#stage').focus({preventScroll:true});}
 if(hash&&location.hash!=='#'+page){history.pushState(null,'','#'+page);}
 render();window.scrollTo({top:0,behavior:'instant'});
}
async function launch(l,replay=false){if(activeRelay){activeRelay=null;field.forget();}if(!isOpen(l)){toast('Сначала пройди предыдущую миссию.');return;}if(replay){await resetStage(l);field.forget();}else if(state.level!==l.id){await setLevel(l);field.forget();}if(lastShownStage!==l.id){lastShownStage=l.id;const completedTasks=doneFor(l.id),remaining=readyTasks(l,completedTasks);const brief=!completedTasks.length?l.desc:remaining.length?'Экипаж уже на маршруте. Следующее поручение — '+moves[remaining[0]].name.toLowerCase()+'.':'Переправа готова. Забирай капсулу!';addLines([{who:l.tasks[0][0]==='bridge'?'robot':'tvijo',text:brief}]);}go('field');}
function continueGame(){const l=currentLevel();if(state.completed.includes(l.id)){const next=levels.find(x=>isOpen(x)&&!state.completed.includes(x.id));return launch(next||l,!next);}return launch(l);}
function launchRelay(run){activeRelay=run;mobileRadio=false;field.forget();go('field');}
function overlay(title,txt,controls,option){const card=group('',el('h2','',title),para(txt),group('actions',...controls));if(option)card.append(option);$('#field-overlay').replaceChildren(card);$('#field-overlay').hidden=false;}
function showFinish(l){
 const idx=levels.indexOf(l),next=idx>=0?levels[idx+1]:null;
 const title=l.id==='beacon'?'Маяк ответил!':'Капсула на борту!';
 const advance=next?action('Дальше: '+next.name,()=>launch(next),'btn primary','play'):null;
 const make=action('Нарисовать мир',openWorkshop,advance?'btn secondary':'btn primary','spark');
 const extras=[];
 if(!next)extras.push(action('Журнал смены',()=>go('journal'),'btn secondary'));
 const prize=flightAwards.find(a=>a.stage===l.id&&!state.claimedAwards.includes(a.id));
 if(prize)extras.push(action('Награда · +'+prize.credits+' демо-кр.',openAwards,'btn secondary','award'));
 if(l.spec)extras.push(action('Поделиться миром',()=>worldResult({level:l,spec:l.spec,cost:0}),'btn secondary','orbit'));
 extras.push(action('Пригласить друга',()=>club.open('invite'),'text-btn','users'));
 const strip=$('#field-result');strip.hidden=state.showHints;
 $('#field').classList.toggle('compact-result',!state.showHints);
 if(state.showHints){
   const description=l.id==='dock'?'Теперь доступен конструктор. Можно собрать свой мир или исследовать Кристальный разлом.':'Экипаж выполнил план. Результат записан в журнал.';
   overlay(title,description,[...(advance?[advance]:[]),make,...extras]);return;
 }
 $('#field-overlay').hidden=true;
 const more=el('details','result-more');more.append(el('summary','','Ещё'),group('actions',...(advance?[make]:[]),...extras));
 const result=el('h2','',title);result.setAttribute('role','status');
 strip.replaceChildren(group('result-title',ii('check'),result),advance||make,more);
}
const field=createField({
 spark:collectSpark,relayTerminal:()=>terminal.arrive(),order:async(level,id,automatic)=>{const r=await fieldOrder(level,id,automatic);if(r?.reply&&page==='field'&&state.level===level&&!activeRelay)speech(r.reply.lines[0].text);return r;},fell:n=>{write(s=>{s.tallies.falls++;note(s,'field','Возвращение на контрольную точку · бесплатно');});if(n===2)addLines([{who:'plane',text:'Вижу точку посадки! Коснись платформы или подойди и нажми прыжок. Подскажу бесплатно.'}]);},
 won:async id=>{const ok=await complete(id);if(ok)track('capsule');return ok;},
 finish:l=>{finishedLevel=l;showFinish(l);addLines([{who:'captain',text:l.id==='beacon'?'«Станция вызывает экипаж!» Мы всё-таки нашли источник. Хорошая работа.':'Капсула у нас. Следующий маршрут выбираешь ты.'}]);},
 pauseMenu:(resume,warp)=>{const options=[action('Продолжить',resume,'btn primary','play'),action('В штаб',()=>go('hq'))];if(!activeRelay&&!state.completed.includes(state.level))options.push(action('К реле · 10 демо',async e=>{const b=e.currentTarget;b.disabled=true;if(await rewind(state.level))warp();else{toast('Недостаточно демо-кредитов. Продолжить можно бесплатно.');b.disabled=false;}}));overlay('Пауза','Окно связи приостановлено.',options,hintOption());}
});
async function send(){
 if(busy)return;const sentFrom=page==='field'?state.level:null,raw=$('#command').value.trim();if(!raw)return;busy=true;const voice=voiceDraft&&raw===spokenInto;voiceDraft=false;spokenInto='';$('#command').value='';$('#radio-form button[type=submit]').disabled=true;status('Экипаж отвечает…');
 try{const result=await turn(raw,voice);if(!result||result.discarded){status('Канал переключён.');return;}const {reply,source,charge}=result;
   scoreText='Приказ · '+reply.score+'/3';$('#score').textContent=scoreText;const tags={fallback:'Резервный канал · бесплатно',cache:'Ответ из памяти · бесплатно',training:'Учебный канал · бесплатно',demo:charge?'Списано '+charge+' демо-кр.':'Без списания'};status(tags[source]+' · '+reply.criteria.map((v,i)=>(v?'✓ ':'○ ')+['кто','что','зачем'][i]).join('  '));const v=reply.lines.find(x=>x.who!=='tvijo')||reply.lines[0];if(v)speech(v.text);render();
   if(sentFrom&&page==='field'&&state.level===sentFrom&&!activeRelay&&!modal.open&&reply.changes.length&&!$('#command').value&&(mobileRadio||radio.contains(document.activeElement)))fieldRadio(false);
 }catch{status('Связь прервалась. Повтори приказ.');}finally{busy=false;$('#radio-form button[type=submit]').disabled=false;}
}
$('#radio-form').onsubmit=e=>{e.preventDefault();send();};$('#command').oninput=()=>{if($('#command').value!==spokenInto)voiceDraft=false;};
function startMic(sink='command'){
 const target=sink==='world'?$('#world-idea'):$('#command');if(!target)return;
 const feedback=t=>{if(sink==='world'){const n=$('#world-note');if(n)n.textContent=t;}else status(t);};
 const begin=()=>{if(!target.isConnected)return;dictate({onSpeech:v=>radio.classList.toggle('speech-active',v),onState:v=>{radio.classList.toggle('listening',v);if(v)feedback('Слушаю…');},onHint:t=>{feedback(t);target.focus();},onText:t=>{target.value=t.slice(0,sink==='world'?300:450);if(sink==='world')target.dispatchEvent(new Event('input'));if(sink!=='world'){spokenInto=target.value;voiceDraft=true;}target.focus();feedback('Проверь распознанный текст.');}});};
 track('mic_click');
 if(!(window.SpeechRecognition||window.webkitSpeechRecognition)){feedback('Диктовка недоступна в этом браузере. Введи текст или выбери пример.');target.focus();return;}
 if(state.micConsent){begin();return;}
 if(sink==='world'&&modal.open){const d=$('#world-note');d.replaceChildren(document.createTextNode('Распознавание выполняет браузер и может передавать звук своей службе. '),action('Включить микрофон',async()=>{await write(s=>{s.micConsent=true;});begin();},'chip'));return;}
 openModal('Голосовая рация',[para('Распознавание выполняет браузер. Браузер может отправить звук своей службе распознавания. Игра получает текст, который можно поправить перед отправкой.'),group('actions',action('Включить микрофон',async()=>{await write(s=>{s.micConsent=true;});modal.addEventListener('close',begin,{once:true});close();},'btn primary','mic'),action('Ввести текст',()=>{close();target.focus();}))],'mic');
}
$('#mic').onclick=()=>startMic();$('#mic-field').onclick=()=>fieldRadio(true);$('#radio-close').onclick=()=>fieldRadio(false);$('#field-home').onclick=()=>go('hq');
$('#sound').onclick=async()=>{await write(s=>{s.voice=!s.voice;});if(!state.voice)window.speechSynthesis?.cancel();else speech('Рация Tvijo на связи.');toast(state.voice?'Озвучка включена':'Озвучка выключена');};
function coreModes(){openModal('Мощность ядра',[para('В демо герои отвечают по сценариям. Цена указана за выполненный приказ в учебных кредитах. Уточнения, повтор из памяти и резервный канал бесплатны.'),...Object.entries(tiers).map(([key,t])=>{const b=el('button','option'+(key===state.tier?' selected':''));b.append(ii('chip'),group('',el('strong','',t.label),el('small','',t.desc)),el('strong','price',String(t.cost)+' кр.'));b.onclick=async()=>{await setTier(key);close();toast('Ядро · '+t.label);};return b;})],'tiers');}
$('#tier-change').onclick=coreModes;
function platformLink(label,href,trackName){const a=el('a','btn secondary',label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';if(trackName)a.onclick=()=>track(trackName);return a;}
function wallet(){track('wallet_open');openModal('Кошелёк Tvijo',[group('fact-row',document.createTextNode('Учебный баланс'),el('strong','',state.balance+' демо-кредитов')),para('Стартовый запас — 100. Пополнение здесь бесплатное. Демо-кредиты действуют в этом браузере.'),group('actions',action('Добавить 50 демо-кредитов',async()=>{await grantDemo();wallet();},'btn primary','plus'),action('Цены действий',coreModes)),group('pilot',el('h3','','Кабинет взрослого'),para('Вход и настоящий баланс Tvijo доступны на платформе. Подключение семейного бюджета к этой игре запланировано.'),group('actions',platformLink('Войти в Tvijo','https://platform.tvijo.com/account'),platformLink('Баланс обучения','https://platform.tvijo.com/billing','buy_click')))],'wallet');}
$('#wallet').onclick=wallet;
function consentControl(changed){
 const wrap=el('label','check-line'),input=el('input');input.type='checkbox';input.checked=state.pilot===true;input.onchange=async()=>{await pilot(input.checked);if(changed)changed();};wrap.append(input,document.createTextNode('Участвовать в тесте: передавать названия игровых действий и секунду первого клика. Без текста и аудиозаписей.'));return wrap;
}
function settings(){openModal('Настройки',[hintOption(),group('fact-row',document.createTextNode('Озвучка героев'),action(state.voice?'Включена':'Выключена',async()=>{await write(s=>{s.voice=!s.voice;});if(!state.voice)window.speechSynthesis?.cancel();settings();},'chip')),consentControl(),para('Прогресс и демо-баланс сохраняются на этом устройстве. Ссылкой на мир передаются только параметры ландшафта.','subtle')],'settings');}
$('#settings').onclick=settings;
function openWorkshop(){
 track('workshop_open');workshop({el,group,picture,action,openModal,startMic,wallet,onDock:()=>launch(levels[0]),play:async(result,auto)=>{
   if(auto){await launch(result.level,state.completed.includes(result.level.id));field.startPilot();}
   else worldResult(result);
 }});
}
function openAwards(){
 const cards=group('medal-grid'),available=flightAwards.filter(a=>awardAvailable(a,state)).length;
 for(const a of flightAwards){
   const earned=state.claimedAwards.includes(a.id),ready=awardAvailable(a,state);
   const card=group('medal-card '+(earned?'owned':ready?'available':'locked'),picture('./art/badges/'+a.id+'.webp',a.title),group('medal-copy',el('h3','',a.title),para(a.goal)));
   if(ready&&!earned){
     const take=action('Забрать +'+a.credits,async()=>{take.disabled=true;const added=await claimAward(a.id);openAwards();if(added)toast('«'+a.title+'» · +'+added+' демо-кредитов');},'medal-take');
     card.append(take);
   }else card.append(el('small','medal-status',earned?'Получено':'+'+a.credits+' демо-кр.'));
   cards.append(card);
 }
 openModal('Награды экипажа',[group('medal-summary',el('strong','',available+' из '+flightAwards.length+' открыто'),el('span','','Баланс · '+state.balance)),cards,group('actions',action('Таблица пилотов',()=>club.open('rank'),'btn secondary','award'),action('Пригласить друга',()=>club.open('invite'),'btn secondary','users'))],'awards');
 club.checkMedal().then(changed=>{if(changed&&activeModal==='awards'&&modal.open)openAwards();});
}
function worldResult({spec,level:l,cost}){const code=encodeWorld(spec);const url=new URL(location.origin+location.pathname);url.hash='w/'+code;
 const share=action('Скопировать ссылку',async()=>{try{await navigator.clipboard.writeText(url.href);share.textContent='Ссылка скопирована';}catch{const input=el('input','world-idea');input.value=url.href;input.readOnly=true;body.append(input);input.select();}},'btn secondary');
 openModal('Мир готов',group('work-result',picture('./art/'+l.art+'.webp',l.name),el('h3','',l.name),para(l.desc),para('Прыжки проверены · '+spec.steps+' платформы · '+cost+' демо-кр.','subtle'),group('actions',action('Играть самому',()=>launch(l,state.completed.includes(l.id)),'btn primary','play'),action('Пройти на автопилоте',async()=>{await launch(l,state.completed.includes(l.id));field.startPilot();},'btn secondary','route'),share)),'world');}
function report(){
 const t=state.tallies,pilotSummary=para('','subtle');
 const showPilot=async()=>{pilotSummary.textContent='';if(state.pilot!==true)return;pilotSummary.textContent='Сверяем первые действия со станцией…';
   try{const records=await pilotReport();if(!records||!pilotSummary.isConnected||state.pilot!==true)return;const names={open_map:'Карта',mic_click:'Микрофон',command_sent:'Приказ',capsule:'Капсула',world_created:'Мир',out_of_credits:'Исчерпан баланс',buy_click:'Кабинет оплаты'};
     const markers=records.filter(e=>names[e.event]).map(e=>names[e.event]+' · '+e.seconds+' c');
     pilotSummary.textContent='Подтверждено станцией в первую минуту: '+records.filter(e=>e.seconds<=60).length+'.'+(markers.length?' '+markers.join(' / '):'');
   }catch{if(pilotSummary.isConnected&&state.pilot===true)pilotSummary.textContent='Серверная сводка временно недоступна. Личные результаты указаны выше.';}
 };
 const row=(a,b)=>group('fact-row',document.createTextNode(a),el('strong','',String(b)));
 openModal('Отчёт для родителей',[group('report-intro',picture('./art/crew/crew.webp','Семь героев экипажа Tvijo'),para('Результаты этого браузера за все смены. Счётчики растут только после игровых действий.')),row('Приказы с исполнителем, действием и целью',t.clear),row('Шаги с выполненными зависимостями',t.chains),row('Сверки показаний двух агентов',t.verified),row('Приказы голосом',t.voice),row('Собрано капсул в разных локациях',state.completed.length),row('Потрачено учебных кредитов',t.spend),row('Бесплатные ответы из памяти / резервные',t.cache+' / '+t.fallback),group('actions',action('Учебный баланс',wallet,'btn secondary','gem')),group('pilot',el('h3','','Тест первой минуты'),consentControl(showPilot),para(Object.entries(localFunnel()).filter(([,s])=>s<=60).length+' разных действий в первую минуту этой сессии.','subtle'),pilotSummary)],'report');showPilot();
}
$('#parent-report').onclick=report;$('#math-details').onclick=()=>{const s=state.stages[state.level],d=s?.digest||tacticalDigest(currentLevel(),doneFor(),[]);openModal('Как экипаж выбирает путь',[para('Граф сверху показывает, какие шаги должны завершиться до следующей команды. Ошибочные приказы остаются в журнале.'),para('Каждые пять приказов компьютер считает число уточнений. В учебной модели есть два маршрута и два состояния помех. Числа в таблице — очки за выбор пути.'),group('mono',document.createTextNode('                 Тихо    Эхо\nПрямой путь       '+d.matrix[0][0]+'       '+d.matrix[0][1]+'\nОбход             '+d.matrix[1][0]+'       '+d.matrix[1][1])),para('Минимакс для этой матрицы: выбрать прямой путь в '+Math.round(d.eq.route*100)+'% раундов при повторной игре. Это доля стратегии, а не вероятность выиграть миссию.'),para(s?.digest?'Наблюдения: '+d.sample+' ходов, '+d.blocks+' уточнений.':'Пока показана исходная матрица, до первого пакета из пяти приказов.','subtle')],'math');};
$('#log-filter').onchange=journal;$('#start-mission').onclick=continueGame;
for(const b of document.querySelectorAll('[data-page],[data-goto]'))b.onclick=()=>{const n=b.dataset.page||b.dataset.goto;if(n==='field')continueGame();else go(n);};
for(const b of document.querySelectorAll('[data-workshop]'))b.onclick=openWorkshop;
const club=createClub({el,group,para,action,avatar,ii,openModal,isOpen:()=>activeModal==='club'&&modal.open,toast,playRelay:launchRelay,playCampaign:continueGame,showWorld:async code=>{const spec=decodeWorld(code);if(spec){await importWorld(spec);go('map');worldResult({spec,level:worldLevel(spec),cost:0});}}});
const terminal=crewTerminal({el,group,ii,action,para,openModal,read:()=>activeRelay,store:r=>{activeRelay=r;fieldHud();},launch:launchRelay,home:()=>go('hq'),channel:r=>{if(r.practice){go('hq');club.open('duet');}else club.open('peer',r.other);},club:()=>club,visible:()=>activeModal==='relay'&&modal.open&&page==='field'});
document.querySelectorAll('[data-awards]').forEach(b=>b.onclick=openAwards);
document.querySelectorAll('[data-invite]').forEach(b=>b.onclick=()=>club.open('invite'));
$('#crew-link').onclick=$('#league-link').onclick=()=>club.open('rank');$('#duet-link').onclick=()=>club.open('duet');
function locationPage(){const h=location.hash.slice(1);
 if(h==='workshop'||h==='awards'||h==='invite'||/^r\/[0-9a-f]{32}$/.test(h)){
   go('hq',false);if(h==='workshop')openWorkshop();else if(h==='awards')openAwards();else club.open('invite',h.startsWith('r/')?h.slice(2):null);return;
 }
 if(h.startsWith('mission/')){const level=levels.find(l=>l.id===h.slice(8));if(level&&isOpen(level)){launch(level);return;}if(level)mapId=level.id;go('map');return;}
 if(h==='duet'||h==='players'){go('hq',false);club.open(h==='duet'?'duet':'rank');return;}if(/^crew\/[0-9a-f]{32}$/.test(h)){go('hq',false);club.open('peer',h.slice(5));return;}if(h.startsWith('tvijo=')){go('hq',false);club.finish(h.slice(6));return;}if(h.startsWith('w/')){const spec=decodeWorld(h.slice(2));if(!spec){go('map',false);toast('Код мира не распознан.');return;}importWorld(spec).then(()=>{go('map',false);worldResult({spec,level:worldLevel(spec),cost:0});});return;}go(h||'hq',false);}
window.addEventListener('popstate',locationPage);window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#w/')&&location.hash.slice(1)!==page)locationPage();});
bus.addEventListener('change',render);bus.addEventListener('chat',showMessages);populate();$('#radio-home').append(radio);locationPage();
