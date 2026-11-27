import {levels,moves} from './catalog.js';
const norm=s=>String(s).toLowerCase().replaceAll('ё','е');
const themes=['sun','rift','lava','beacon'];
const themeWords=[/солн|причал|лес|сад|парк|джунгл/,/лед|крист|разлом|космос|мороз|водопад/,/лав|огн|шахт|вулкан|пещер/,/маяк|ноч|орбит|звезд|город/];
const paths=['build','survey','rescue','signal'];
const pathsToTasks={build:[['bridge',[]],['power',[]],['gate',['bridge','power']]],survey:[['scan',[]],['compare',['scan']]],rescue:[['scan',[]],['compare',['scan']],['rescue',['compare']]],signal:[['power',[]],['scan',[]],['signal',['power','scan']]]};
export const worldNames={sun:'Солнечный архипелаг',rift:'Хрустальные острова',lava:'Лавовая переправа',beacon:'Ночная орбита'};
export function cleanSpec(o){
  if(!o||!themes.includes(o.theme)||!paths.includes(o.path)||!Number.isInteger(o.seed)||o.seed<0||o.seed>0xffffffff||![2,3,4].includes(o.steps)||typeof o.shadow!=='boolean')return null;
  return {theme:o.theme,path:o.path,seed:o.seed,steps:o.steps,shadow:o.shadow};
}
export function hash(s){let n=2166136261;for(const c of s){n=Math.imul(n^c.codePointAt(0),16777619)>>>0;}return n;}
export function makeSpec(input){
  const t=norm(input).trim();if(t.length<6||t.length>300)throw Error('Опиши идею в 6–300 знаках.');
  const seed=hash(t),idx=themeWords.findIndex(r=>r.test(t));
  const path=/спас|погон|эваку|дрон.*потер|преслед/.test(t)?'rescue':/мост|стро|робот|платформ/.test(t)?'build':/развед|тайн|гуманоид|исслед|провер/.test(t)?'survey':/маяк|сигнал|антенн/.test(t)?'signal':paths[seed%4];
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
  const g=level.floor,s=level.spec,goal=s?833:level.id==='dock'?590:838;
  const ledges=s?Array.from({length:s.steps},(_,i)=>{const x=526+i*(goal-526)/(s.steps-1);return [x-39,x+45,g-25-i*11-((s.seed>>>(i*3))%10)];}):level.id==='dock'?[[329,417,g-31],[450,658,g-63]]:[[677,761,g-30],[785,899,g-58]];
  const gap=level.art==='rift'?[408,610]:null,jumpGap=s?[228,296+((s.seed>>>8)%22)]:null,ground=gap?[[0,gap[0],g],[gap[1],960,g]]:[[0,960,g]];
  if(jumpGap)ground.splice(0,1,[0,jumpGap[0],g],[jumpGap[1],gap?gap[0]:960,g]);
  return {ground,ledges,gap,jumpGap,gate:level.art==='rift'?406:level.id==='dock'?430:475,goal,goalY:ledges.at(-1)[2],shadow:s?s.shadow:level.id==='mine'};
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
