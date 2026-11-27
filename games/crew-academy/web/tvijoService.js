import {heroOrder,tiers,levels,crewIntro,moves} from './catalog.js';
import {planTurn,tacticalDigest,resolveLevel,intent,readyTasks} from './strategy.js';
import {makeSpec,cleanSpec,worldLevel,routeReachable,encodeWorld} from './worlds.js';
const STORAGE='tvijo.crew.academy.v1', lock='tvijo.crew.wallet.v1';
const initial=()=>({v:1,hero:'captain',tier:'standard',balance:100,level:'dock',stages:{},completed:[],worlds:[],log:[],cache:[],receipts:[],tallies:{orders:0,clear:0,chains:0,voice:0,verified:0,spend:0,falls:0,fallback:0,cache:0},observed:[],digest:null,voice:false,micConsent:false,pilot:null});
let memoryState=null;
function read(){
  try {const s=JSON.parse(localStorage.getItem(STORAGE));if(s?.v===1&&Number.isInteger(s.balance)&&s.balance>=0&&heroOrder.includes(s.hero)&&Object.hasOwn(tiers,s.tier)&&resolveLevel(s.level)&&Array.isArray(s.completed)&&Array.isArray(s.worlds)){const n=initial();return {...n,...s,tallies:{...n.tallies,...s.tallies}};}}catch{}
  return memoryState||initial();
}
export let state=read();
const activeScene=resolveLevel(state.level);
export let chat=state.level==='dock'&&!state.stages.dock?.done?.length?crewIntro.slice():[{who:'captain',text:'Снова на связи. Текущая локация — '+activeScene.name+'.'},{who:'tvijo',text:activeScene.tasks.every(([id])=>(state.stages[state.level]?.done||[]).includes(id))?'Поручения экипажа выполнены. Можно забрать капсулу или выбрать следующий маршрут.':activeScene.desc}];export const bus=new EventTarget();
export const currentLevel=()=>resolveLevel(state.level)||levels[0];
export const doneFor=(id=state.level)=>state.stages[id]?.done||[];
export const isOpen=l=>Boolean(l.spec)||levels.indexOf(l)===0||state.completed.includes(levels[levels.indexOf(l)-1]?.id);
export function note(s,type,text){s.log.push({at:Date.now(),type,text});s.log=s.log.slice(-90);}
let queue=Promise.resolve();export function write(fn){
  const op=()=>{const fresh=read();const result=fn(fresh);state=fresh;memoryState=fresh;try{localStorage.setItem(STORAGE,JSON.stringify(fresh));}catch{}bus.dispatchEvent(new Event('change'));return result;};
  const go=()=>navigator.locks?.request?navigator.locks.request(lock,op):op();
  const result=queue.then(go,go);queue=result.catch(()=>{});return result;
}
window.addEventListener('storage',e=>{if(e.key===STORAGE){state=read();bus.dispatchEvent(new Event('change'));}});
export function addLines(lines){chat=chat.concat(lines).slice(-70);bus.dispatchEvent(new Event('chat'));}
export function setHero(id){return write(s=>{if(heroOrder.includes(id))s.hero=id;});}
export function setTier(t){return write(s=>{if(Object.hasOwn(tiers,t))s.tier=t;});}
export function setLevel(l){return write(s=>{s.level=l.id;s.digest=null;});}
export function complete(id){
  return write(s=>{const l=resolveLevel(id);if(!l||s.level!==id||!l.tasks.every(([t])=>s.stages[id]?.done.includes(t)))return false;if(!s.completed.includes(id)){s.completed.push(id);note(s,'field','Капсула получена · '+l.name);}return true;});
}
function stageOf(s,id){return s.stages[id]||={done:[],observed:[],turns:0,digest:null};}
export function collectSpark(id,index){return write(s=>{const stage=stageOf(s,id);stage.sparks||=[];if(!stage.sparks.includes(index))stage.sparks.push(index);});}
export function resetStage(l){return write(s=>{s.level=l.id;s.stages[l.id]={done:[],observed:[],turns:0,digest:null};note(s,'field','Повторная вылазка · '+l.name);});}
export async function grantDemo(){await write(s=>{s.balance+=50;note(s,'wallet','Учебное пополнение · +50');});track('demo_refill');}
export async function buildWorld(text){
  const spec=makeSpec(text),l=worldLevel(spec);if(!routeReachable(l))throw Error('Схема не прошла проверку прыжков. Измени идею.');
  const result=await write(s=>{if(!s.completed.includes('dock'))throw Error('Сначала забери капсулу на Солнечном причале.');
    const found=s.worlds.some(w=>encodeWorld(w)===encodeWorld(spec));if(!found){if(s.balance<25)throw Error('Для сборки нужно 25 демо-кредитов. Учебное пополнение доступно в кошельке.');
      s.balance-=25;s.tallies.spend+=25;s.worlds.push(spec);note(s,'world','Собран мир «'+l.name+'» · 25 демо-кредитов');}
    return {spec,level:l,cost:found?0:25};});track('world_created');if(state.balance===0)track('out_of_credits');return result;
}
export function importWorld(spec){return write(s=>{const clean=cleanSpec(spec);if(!clean||!routeReachable(worldLevel(clean)))return false;if(!s.worlds.some(w=>encodeWorld(w)===encodeWorld(clean)))s.worlds.push(clean);return true;});}
export function rewind(id){return write(s=>{if(s.level!==id||s.balance<10)return false;s.balance-=10;s.tallies.spend+=10;note(s,'field','Телепорт к реле · 10 демо-кредитов');return true;});}
const now=()=>performance.now();
export async function beforeDeadline(fn,ms=2500){const c=new AbortController();let timer;try{return await Promise.race([Promise.resolve().then(()=>fn(c.signal)),new Promise((_,reject)=>{timer=setTimeout(()=>{c.abort();reject(Error('deadline'));},ms);})]);}finally{clearTimeout(timer);}}
let recordedOrders=Promise.resolve();
function recordLocalOrder(packet){
  let joined=false;try{joined=localStorage.getItem('tvijo.crew.joined')==='1';}catch{}
  if(!joined)return;
  recordedOrders=recordedOrders.then(()=>beforeDeadline(signal=>fetch('./api/herdr/turn',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(packet),signal,credentials:'same-origin'
  }))).catch(()=>{});
}
// The field switch issues one available order locally. Only a pilot's own words earn a prompt score.
export function fieldOrder(levelId,id){
  if(state.level!==levelId||!readyTasks(currentLevel(),doneFor()).includes(id))return Promise.resolve(null);
  return turn(moves[id].example,false,id);
}
export async function turn(raw,voice=false,preset=null){
  const text=raw.trim().slice(0,450);if(!text)return null;const s=state,l=currentLevel(),pre=doneFor().slice(),parsed=intent(text),tier=preset?'standard':s.tier,hero=s.hero;
  const lastDigest=s.stages[l.id]?.digest,feedback=lastDigest?{blocks:lastDigest.blocks,focus:lastDigest.focus}:null;
  const pkt={level:l.id,done:pre,tier,parsed,hero,feedback};const k=JSON.stringify([l.id,pre.slice().sort(),tier,hero,parsed.orders,parsed.who,parsed.kind,parsed.criteria,feedback]);
  const predicted=planTurn({level:l,done:pre,tier,parsed,hero,feedback});const cache=s.cache.includes(k),requestId=crypto.randomUUID();let source=preset?'preset':cache?'cache':'demo',reply=predicted;const began=now();
  addLines([preset?{who:'tvijo',text:'Полевой приказ · '+moves[preset].name}:{who:'you',text}]);
  if(!cache&&!preset){
    try{reply=await beforeDeadline(async signal=>{await recordedOrders;const r=await fetch('./api/herdr/turn',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pkt),signal,credentials:'same-origin'});if(!r.ok)throw Error('offline');const d=await r.json();if(d.engine!=='crew-demo-1'||!Array.isArray(d.reply?.lines)||!Array.isArray(d.reply?.changes)||d.reply.changes.join()!==predicted.changes.join())throw Error('protocol');if(d.source==='fallback')source='fallback';else if(d.source==='cache')source='cache';return d.reply;});}
    catch{source='fallback';reply=predicted;}
  }
  // The public service never debits. One local commit applies the reward and the demo cost together.
  const settled=await write(st=>{
    if(st.level!==l.id)return {discarded:true};const scene=stageOf(st,l.id);
    if(st.receipts.includes(requestId)||preset&&!readyTasks(l,scene.done).includes(preset))return {discarded:true};
    const current=planTurn({level:l,done:scene.done,tier,parsed,hero,feedback});
    if(current.changes.join()!==reply.changes.join()){reply=current;source='cache';}
    if(!preset&&st.cache.includes(k))source='cache';
    let charge=source==='demo'?reply.cost:0;
    if(charge>st.balance){charge=0;source='training';reply=planTurn({level:l,done:scene.done,tier:'standard',parsed,hero,feedback});}
    st.receipts=[...st.receipts.slice(-127),requestId];st.balance-=charge;st.tallies.spend+=charge;
    if(source==='demo')st.cache=[...st.cache.filter(x=>x!==k).slice(-63),k];
    if(source==='fallback')st.tallies.fallback++;if(source==='cache')st.tallies.cache++;
    st.tallies.orders++;if(voice)st.tallies.voice++;if(!preset&&reply.score===3&&reply.changes.length)st.tallies.clear++;st.tallies.chains+=reply.chain;
    if(reply.changes.includes('compare'))st.tallies.verified++;
    scene.done=[...new Set([...scene.done,...reply.changes])];scene.turns=(scene.turns||0)+1;
    const obs={ok:reply.changes.length>0,source,elapsed:Math.round(now()-began),cost:charge,targets:parsed.orders};scene.observed=[...(scene.observed||[]).slice(-39),obs];
    if(scene.turns%5===0)scene.digest={...tacticalDigest(l,scene.done,scene.observed),turn:scene.turns};
    note(st,'turn',(reply.changes.map(a=>moves[a].name).join(' → ')||({social:'Разговор экипажа',hint:'Запрос подсказки',stop:'Отмена приказа'}[parsed.kind]||'Уточнение приказа'))+' · '+charge+' демо-кр.');return {charge,source,reply};
  });
  if(settled.discarded)return settled;if((cache||preset)&&reply.changes.length)recordLocalOrder(pkt);addLines(reply.lines);if(state.balance===0||source==='training')track('out_of_credits');
  if(!preset)track('command_sent');if(voice)track('voice_command');if(reply.changes.length)track('task_done');if(reply.chain)track('dependency_done');if(reply.changes.includes('compare'))track('crosscheck');return settled;
}
const allowedEvents=new Set(['open_map','mic_click','command_sent','task_done','dependency_done','crosscheck','voice_command','field_start','capsule','workshop_open','world_created','out_of_credits','wallet_open','buy_click','demo_refill']);
function firsts(){try{return JSON.parse(sessionStorage.getItem('tvijo.crew.funnel')||'{}');}catch{return {};}}
let first=firsts(),start=performance.timeOrigin;try{const saved=sessionStorage.getItem('tvijo.crew.start');if(saved)start=+saved;else sessionStorage.setItem('tvijo.crew.start',String(start));}catch{}
let posting=Promise.resolve();const sent=new Set();
export function track(name){
  if(!allowedEvents.has(name))return;if(first[name]===undefined){first[name]=Math.min(86400,Math.max(0,Math.floor((Date.now()-start)/1000)));try{sessionStorage.setItem('tvijo.crew.funnel',JSON.stringify(first));}catch{}}
  if(state.pilot!==true||sent.has(name))return;sent.add(name);posting=posting.then(async()=>{
    if(state.pilot!==true){sent.delete(name);return;}try{const r=await beforeDeadline(signal=>fetch('./api/herdr/event',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:name,seconds:first[name]}),signal}),2000);if(!r.ok)sent.delete(name);}catch{sent.delete(name);}
  });
}
export async function pilot(v){await write(s=>{s.pilot=v;});if(v)Object.keys(first).forEach(track);}
export const localFunnel=()=>({...first});
export async function pilotReport(){
  if(state.pilot!==true)return null;
  await posting;if(state.pilot!==true)return null;
  return beforeDeadline(async signal=>{
    const r=await fetch('./api/herdr/parent-report/me',{signal,credentials:'same-origin',cache:'no-store'});
    if(!r.ok)throw Error('pilot');
    const data=await r.json();
    if(!Array.isArray(data.first_events))throw Error('pilot');
    return data.first_events.filter(x=>allowedEvents.has(x.event)&&Number.isInteger(x.seconds));
  });
}
export function speech(text){
  if(!state.voice||!window.speechSynthesis)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.slice(0,200));u.lang='ru-RU';u.rate=1.03;speechSynthesis.speak(u);}catch{}
}
let recorder=null;
export function stopVoice(){if(recorder){try{recorder.abort();}catch{}recorder=null;}}
export function dictate({onText,onState,onHint,onSpeech=()=>{}}){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!R){onHint('Браузер не поддерживает диктовку. Напечатай приказ или выбери готовый.');return;}
  if(recorder){try{recorder.stop();}catch{}return;}
  try{const r=new R();let outcome=false;r.lang='ru-RU';r.continuous=false;r.interimResults=false;recorder=r;
    r.onspeechstart=()=>onSpeech(true);r.onspeechend=()=>onSpeech(false);
    r.onstart=()=>onState(true);r.onend=()=>{onSpeech(false);if(recorder===r)recorder=null;onState(false);if(!outcome)onHint('Диктовка завершена. Можно повторить или напечатать приказ.');};
    r.onerror=e=>{outcome=true;onState(false);onHint(e.error==='not-allowed'?'Микрофон недоступен. Напечатай приказ или выбери готовый.':'Речь не распознана. Попробуй ещё раз или введи текст.');};
    r.onresult=e=>{const words=e.results[e.resultIndex]?.[0]?.transcript?.trim();if(words){outcome=true;onText(words);}};r.start();
  }catch{recorder=null;onState(false);onHint('Микрофон недоступен. Продолжай с клавиатуры.');}
}
