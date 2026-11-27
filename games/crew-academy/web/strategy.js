import {heroes,heroOrder,moves,tiers,levelById} from './catalog.js';
import {decodeWorld,worldLevel} from './worlds.js';
const actorWords={captain:/капитан|кэп/,assistant:/ассистент|энергетик/,blue:/гуманоид|синий|аналитик/,son:/сын|пилот/,daughter:/доч|девоч|инженер/,robot:/робот|механик/,plane:/самолет|дрон|разведчик|беспилот/};
const acts={bridge:/закреп|перекин|постро|перекин|созда|держ|удерж|включ|почин|опуст|откр|подним|зафикс|соедин/,scan:/скан|найд|на[йи]т|развед|проверь|провер|осмотр|подсвет|ищи|укаж|определи|изуч/,power:/пода[йт]|подключ|запита|подай|включ|направ|дай|перераспред/,gate:/введ|ввод|откр|настро|разблок|примен|набери|взлом/,compare:/сравн|свер|перепров|проверь|провер|сопостав|уточн/,rescue:/вывед|эваку|спас|вывез|забер|вывед|сопровод|вытащ|верни/,signal:/переда|пошл|отправ|включ|зажг|подай|свяж/};
const objects={bridge:/мост|опор|переправ/,scan:/разлом|частот|сигнал|маршрут|путь|эхо|дорог|код|троп|ловуш|платформ/,power:/энерг|питан|реле|контур|ток|шлюз/,gate:/код|шлюз|частот|терминал|ворот/,compare:/эхо|сигнал|развед|показан|данн|гипотез|путь/,rescue:/дрон|самолет|разведчик|напарник/,signal:/сигнал|маяк|ответ|частот|станци/};
const negation=/\bnever\b|(?:^|\s)(?:не|нельзя|отмени|стоп)(?=\s|[,.!?]|$)/u;
const question=/\?|(?:^|\s)(?:зачем|почему|как|что делать|подсказ|какой|какая|кто такой)/u;
export const normalize=s=>String(s).toLowerCase().replaceAll('ё','е').trim();
export function intent(text){
  const t=normalize(text).slice(0,450),clauses=t.split(/(?:[,;.!?]\s*(?=(?:а\s+)?(?:робот|самолет|доч|сын|капитан|гуманоид|ассистент|синий))|\s+(?:затем|потом|после этого|а затем)\s+|→|\n)/u).filter(Boolean).slice(0,7);
  const orders=[];let count=0;let actorSet=new Set();let mentioned=null;
  for(const clause of clauses){
    const who=heroOrder.map(id=>[id,clause.search(actorWords[id])]).filter(v=>v[1]>=0).sort((a,b)=>a[1]-b[1])[0]?.[0];if(!who)continue;
    mentioned??=who;actorSet.add(who);
    const directive=clause.split(/\s+(?:чтобы|для того чтобы)\s+/u)[0];
    if(negation.test(directive)||question.test(clause))continue;
    for(const [id,m] of Object.entries(moves))if(m.actor===who&&acts[id].test(directive)&&objects[id].test(directive)){orders.push(id);count++;break;}
  }
  const goal=/(чтобы|для того|затем|потом|после|→|убедис|дождис|подтверд)/.test(t);
  const social=/привет|здрав|как дела|расскажи|кто ты|познаком|поговор|что любишь/.test(t);
  return {orders,who:mentioned,kind:orders.length?'order':social?'social':question.test(t)?'hint':negation.test(t)?'stop':'clarify',criteria:[actorSet.size>0,count>0,goal],chain:orders.length>1};
}
export function resolveLevel(id){if(typeof id==='string'&&Object.hasOwn(levelById,id))return levelById[id];const spec=typeof id==='string'&&id.startsWith('world.')?decodeWorld(id.slice(6)):null;return spec?worldLevel(spec):null;}
export function readyTasks(level,done){return level.tasks.filter(([id,pre])=>!done.includes(id)&&pre.every(v=>done.includes(v))).map(row=>row[0]);}
const voices={captain:'Я замечаю то, что теряется между докладами. Если двое спорят, попрошу третьего проверить.',assistant:'У реактора свой голос. Если он поёт чисто, у друзей есть запас на ошибку.',blue:'Я люблю красивые гипотезы. Но если приборы спорят со мной — проверим ещё раз!',son:'Я бы рванул вперёд! Только сперва скажи, кого забираем на обратном пути.',daughter:'Слышишь три щелчка? Для меня это как азбука. Дай мне частоту, и я открою замок.',robot:'Собираю необычные гайки. Моя любимая сейчас держит мост номер семь.',plane:'Сверху наш корабль похож на маленькую звезду. Подсветить тебе дорогу?'};
const readings={sun:'Порыв солнечного ветра ушёл.',rift:'Сквозь лёд видно второй контур.',lava:'Жар поднимается. Край платформы выдержит.',beacon:'На тёмной стороне орбиты снова есть окно связи.',greenhouse:'Стеклянный купол снова пропускает свет.',foundry:'Магнитные катушки на верфи вышли на режим.'};
const sceneLines={
 greenhouse:{scan:'За третьей лилией слабый огонёк. Вижу потерявшийся дрон!',power:'Пускаю ток по зелёной жиле купола. Зарядное гнездо готово.',compare:'Первое эхо от стекла. Второе движется — это наш дрон.',rescue:'Вижу его! Вывожу дрон из листвы прямо к капсуле.',signal:'Купол отвечает зелёным светом. Дрон дома.'},
 foundry:{scan:'Между катушками свободен нижний пролёт. Передаю разметку Роботу.',power:'Магниты держат ферму. Кран под напряжением.',bridge:'Захваты защёлкнулись. Поднимаю мост к левому двигателю!',compare:'Датчики на обеих опорах совпали. Балка стоит ровно.',gate:'Стыкую ферму с кольцом. Шлюз сборочной линии открыт.',signal:'Двигатель запущен. Первый корабль с нашей верфи готов.'}
};
export function planTurn({level,done,tier,parsed,hero,feedback=null}){
  const work=[...done],changes=[],lines=[];let chain=0;const l=(who,text)=>lines.push({who,text});
  for(const id of parsed.orders){
    const def=level.tasks.find(row=>row[0]===id),m=moves[id];if(!m)continue;
    if(!def){const needed=readyTasks(level,work)[0];l(m.actor,needed?'В этой локации сейчас важно другое: '+moves[needed].name.toLowerCase()+'.':'В этой локации все поручения выполнены. Идём за капсулой!');continue;}
    if(work.includes(id)){l(m.actor,'Этот шаг уже подтверждён. Результат в журнале.');continue;}
    const missing=def[1].filter(n=>!work.includes(n));if(missing.length){l(m.actor,'Жду результат: '+missing.map(n=>moves[n].name.toLowerCase()).join(' и ')+'. Передай приказ исполнителю.');continue;}
    work.push(id);changes.push(id);l(m.actor,sceneLines[level.id]?.[id]||(level.spec&&changes.length===1?readings[level.spec.theme]+' '+m.reply:m.reply));if(def[1].length)chain++;
    if(tier!=='standard')l(m.partner,m.ack);
  }
  const next=readyTasks(level,work)[0],nextGuide=next?'Попробуй: «'+moves[next].example+'»':'Теперь переправа открыта. Прыгни на светящуюся платформу и возьми капсулу.';
  if(!lines.length){
    if(parsed.kind==='social'){const h=parsed.who||hero;l(h,voices[h]);const friend=h==='plane'?'robot':'plane';l(friend,h==='plane'?'Прикрываю тебя снизу. На моём компасе ты самый быстрый огонёк.':'А я буду наблюдать сверху. Позови, когда понадобится разведка!');}
    else if(parsed.kind==='stop')l(parsed.who||'tvijo','Принято. Экипаж ждёт нового приказа.');
    else if(parsed.kind==='hint')l('tvijo',next?'Сначала '+moves[next].name.toLowerCase()+'. Исполнитель — '+heroes[moves[next].actor].name+'. '+nextGuide:nextGuide);
    else l('tvijo',(parsed.who?'Исполнитель понятен. Добавь действие и объект. ':'Назови напарника и действие. ')+nextGuide);
  }else if(!changes.length)l('tvijo',nextGuide);
  if(changes.length&&tier==='standard'&&lines.length===1)l(moves[changes[0]].partner,moves[changes[0]].ack);
  if(changes.length&&tier==='turbo')l('tvijo','Проверка связи пройдена. '+nextGuide);
  if(changes.length&&tier==='genius'){
    const seen=new Set(lines.map(x=>x.who)),briefs={captain:'Сверяю порядок поручений.',assistant:'Проверяю резерв энергии.',blue:'Сравниваю результаты двух датчиков.',son:'Держу свободным путь к капсуле.',daughter:'Проверяю код на терминале.',robot:'Фиксирую опоры.',plane:'Маршрут просматривается до последней платформы.'};
    for(const h of heroOrder)if(!seen.has(h))l(h,briefs[h]);l('tvijo',nextGuide);
  }
  if(feedback?.blocks>=2&&next&&(tier!=='standard'||!changes.length)){
    const focus=feedback.focus&&readyTasks(level,work).includes(feedback.focus)?feedback.focus:next;
    l('tvijo','В прошлых пяти приказах '+feedback.blocks+' потребовали уточнения. Дай одно поручение: '+moves[focus].example);
  }
  return {lines,changes,chain,score:parsed.criteria.filter(Boolean).length,criteria:parsed.criteria,kind:parsed.kind,tier,cost:changes.length?tiers[tier].cost:0};
}
// Two-route classroom game. The crew maximizes the payoff; the environment minimizes it.
export function equilibrium([[a,b],[c,d]]){
  const den=a-b-c+d;
  const choices=t=>[0,1,...(den&&t>=0&&t<=1?[t]:[])];
  const rows=choices((d-c)/den).map(p=>({p,v:Math.min(p*a+(1-p)*c,p*b+(1-p)*d)})).sort((x,y)=>y.v-x.v);
  const cols=choices((d-b)/den).map(q=>({q,v:Math.max(q*a+(1-q)*b,q*c+(1-q)*d)})).sort((x,y)=>x.v-y.v);
  return {route:rows[0].p,field:cols[0].q,value:rows[0].v};
}
export function tacticalDigest(level,done,observed){
  const next=readyTasks(level,done),hops=observed.slice(-5),blocks=hops.filter(x=>!x.ok).length;
  const misses=new Map();for(const h of hops.filter(e=>!e.ok)){for(const key of h.targets||[])if(moves[key])misses.set(key,(misses.get(key)||0)+1);}
  const focus=next.slice().sort((a,b)=>(misses.get(b)||0)-(misses.get(a)||0))[0]||null;
  const matrix=[[4,1-Math.min(2,blocks)],[1,3]],eq=equilibrium(matrix);
  return {sample:hops.length,blocks,focus,next:next[0]||null,matrix,eq,hint:next.length?'Следующий шаг — '+moves[next[0]].name.toLowerCase()+'. Исполнитель: '+heroes[moves[next[0]].actor].name+'.':'Все зависимости закрыты. Можно взять капсулу.'};
}
