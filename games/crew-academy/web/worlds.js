import {levels,moves} from './catalog.js';
const norm=s=>String(s).toLowerCase().replaceAll('ё','е');
const themes=['sun','rift','lava','beacon','greenhouse','foundry'];
const themeWords=[/солн|причал|лес|сад|парк|джунгл/,/лед|крист|разлом|космос|мороз|водопад/,/лав|огн|шахт|вулкан|пещер/,/маяк|ноч|орбит|звезд|город/,/оранжер|купол|листь|лили|биот/,/кузниц|верф|сбороч|домен/];
const paths=['build','survey','rescue','signal','duet'];
const pathsToTasks={duet:[['scan',[]],['bridge',['scan']],['power',[]],['gate',['bridge','power']],['signal',['gate']]],build:[['bridge',[]],['power',[]],['gate',['bridge','power']]],survey:[['scan',[]],['compare',['scan']]],rescue:[['scan',[]],['compare',['scan']],['rescue',['compare']]],signal:[['power',[]],['scan',[]],['signal',['power','scan']]]};
export const worldNames={sun:'Солнечный архипелаг',rift:'Хрустальные острова',lava:'Лавовая переправа',beacon:'Ночная орбита',greenhouse:'Сады разведчиков',foundry:'Звёздная верфь'};
export function cleanSpec(o){
  if(!o||!themes.includes(o.theme)||!paths.includes(o.path)||!Number.isInteger(o.seed)||o.seed<0||o.seed>0xffffffff||![2,3,4].includes(o.steps)||typeof o.shadow!=='boolean')return null;
  return {theme:o.theme,path:o.path,seed:o.seed,steps:o.steps,shadow:o.shadow};
}
export function hash(s){let n=2166136261;for(const c of s){n=Math.imul(n^c.codePointAt(0),16777619)>>>0;}return n;}
export function makeSpec(input){
  const t=norm(input).trim();if(t.length<6||t.length>300)throw Error('Опиши идею в 6–300 знаках.');
  const seed=hash(t),special=themeWords.findIndex((r,i)=>i>=4&&r.test(t)),idx=special>=0?special:themeWords.findIndex(r=>r.test(t));
  const path=/(?:дрон.{1,16}робот|робот.{1,16}дрон|совместн)/.test(t)?'duet':/спас|погон|эваку|дрон.*потер|преслед/.test(t)?'rescue':/мост|стро|робот|платформ/.test(t)?'build':/развед|тайн|гуманоид|исслед|провер/.test(t)?'survey':/маяк|сигнал|антенн/.test(t)?'signal':paths[seed%4];
  const count=t.replace(/две|два/g,'2').replace(/три/g,'3').replace(/четыре/g,'4').match(/([234])\s*(?:остров|платформ|прыж)/);
  return {theme:themes[idx<0?seed%4:idx],path,seed,steps:count?Number(count[1]):2+(seed>>>5)%3,shadow:!/(без|убери)\s+(?:тен|ловуш|лазер|опасн)/.test(t)&&/тен|погон|ловуш|лазер|страж/.test(t)};
}
export function encodeWorld(s){return [s.theme,s.path,s.seed.toString(36),s.steps,s.shadow?1:0].join('.');}
export function decodeWorld(code){if(typeof code!=='string'||!/^([a-z]+)\.([a-z]+)\.([0-9a-z]{1,7})\.([2-4])\.([01])$/.test(code))return null;const [theme,path,seed,n,b]=code.split('.');return cleanSpec({theme,path,seed:parseInt(seed,36),steps:+n,shadow:b==='1'});}
export function worldLevel(spec){
  const s=cleanSpec(spec);if(!s)throw Error('Код мира не распознан.');
  const base=levels[themes.indexOf(s.theme)];return {...base,id:'world.'+encodeWorld(s),name:worldNames[s.theme],tag:'Авторский мир',tasks:pathsToTasks[s.path],desc:pathsToTasks[s.path].map(t=>moves[t[0]].name).join(' → ')+'. Забери капсулу на последней платформе.',spec:s};
}
export function verifyPlan(tasks){
  const ids=tasks.map(t=>t[0]);if(!tasks.length||new Set(ids).size!==ids.length)return false;
  const seen=new Set();for(let pass=0;pass<ids.length;pass++){for(const [id,deps] of tasks){if(!moves[id]||!Array.isArray(deps))return false;if(deps.every(x=>seen.has(x)))seen.add(id);}}return seen.size===ids.length;
}
export function layout(level){
  const g=level.floor,s=level.spec,dock=level.id==='dock',goal=s?816+s.seed%35:dock?590:838;
  let ledges;
  if(s){
    // A seeded route with a short first climb and a reachable final platform.
    const first=488+(s.seed>>>7)%62;
    ledges=Array.from({length:s.steps},(_,i)=>{
      const center=Math.round(first+i*(goal-first)/(s.steps-1));
      const half=39+((s.seed>>>(i*4))%13);
      return [center-half,center+half,g-25-i*13-((s.seed>>>(i*3))%9)];
    });
  }else if(dock)ledges=[[329,417,g-31],[450,658,g-63]];
  else if(level.id==='greenhouse')ledges=[[338,427,g-32],[500,609,g-60],[667,752,g-29],[785,899,g-66]];
  else if(level.id==='foundry')ledges=[[320,420,g-34],[674,758,g-36],[785,899,g-72]];
  else ledges=[[677,761,g-30],[785,899,g-58]];
  const gap=level.art==='rift'?[408,610]:level.art==='foundry'?[449,641]:null;
  const jumpGap=s?[228,296+((s.seed>>>8)%22)]:level.id==='greenhouse'||level.id==='foundry'?[210,281]:null;
  const ground=[];let start=0;
  for(const cut of [jumpGap,gap].filter(Boolean)){ground.push([start,cut[0],g]);start=cut[1];}ground.push([start,960,g]);
  return {ground,ledges,gap,jumpGap,gate:gap?gap[0]-2:dock?430:475,goal,goalY:ledges.at(-1)[2],
    shadow:s?s.shadow:level.id==='mine'};
}
// Check links with the weakest jump on the crew. Use the descending time to the next platform and a margin for touch controls.
export function routeReachable(level){
  if(!verifyPlan(level.tasks))return false;
  const p=layout(level),all=[...p.ground,...(p.gap?[[p.gap[0]-4,p.gap[1]+4,level.floor]]:[]),...p.ledges];
  const reached=new Set([0]);for(let round=0;round<all.length;round++)for(const i of [...reached])for(let j=0;j<all.length;j++){
    const a=all[i],b=all[j],dy=b[2]-a[2],discriminant=430**2+2*1050*dy;
    if(discriminant<0)continue;const distance=Math.max(0,b[0]-a[1],a[0]-b[1]);
    if(distance<=205*(430+Math.sqrt(discriminant))/1050-8)reached.add(j);
  }return reached.has(all.length-1)&&p.goal>=p.ledges.at(-1)[0]&&p.goal<=p.ledges.at(-1)[1];
}
