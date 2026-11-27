import {beaconTones,toneText,randomTransmission} from './crewLabels.js';
import {levels} from './catalog.js';
export const relayPhases=['Найти сигнал','Передать код','Зажечь маяк'];
export const relayIndex=phase=>({scout:0,found:1,sent:2,done:3}[phase]??0);
export function relayBrief(m){
 if(m.phase==='done')return 'Маяк зажжён. Оба поста приняли сигнал.';
 if(m.role==='scout')return ({scout:'Добеги до золотого сканера на последней платформе.',found:'Три импульса считаны. Передай частоту инженеру.',sent:'Частота передана. Инженер может настроить реле.'})[m.phase];
 return m.phase==='sent'?'Добеги до приёмника и повтори частоту напарника.':'Разведчик ищет частоту. Пока можно добраться до приёмника.';
}
export function relayStage(role){
 const base=levels[role==='scout'?0:3];
 return {...base,id:'pair-'+role,name:role==='scout'?'Пост разведчика':'Пост инженера',tag:'Парный маяк',tasks:[]};
}
export function practiceState(){return {mission:'practice',practice:true,phase:'scout',role:'scout',sequence:null,secret:randomTransmission(),partner:'Робот'};}
export function practiceStep(run,action,sequence){
 if(action==='scan'&&run.phase==='scout')return {...run,phase:'found',sequence:run.secret};
 if(action==='send'&&run.phase==='found')return {...run,phase:'sent',role:'engineer'};
 if(action==='tune'&&run.phase==='sent'){if(sequence!==run.secret)throw Error('Импульсы не совпали. Сверь порядок и попробуй снова.');return {...run,phase:'done'};}
 throw Error('Открой текущее задание маяка.');
}
export function relayDiagram(run,{el,group,ii}){
 const wrap=el('ol','duet-steps'),idx=relayIndex(run?.phase);
 relayPhases.forEach((txt,i)=>{const li=el('li',i<idx?'done':i===idx?'active':'');li.append(group('relay-crest',ii(['map','radio','zap'][i])),el('strong','',txt));if(i===idx)li.setAttribute('aria-current','step');wrap.append(li);});
 wrap.setAttribute('aria-label','Ход парной миссии');return wrap;
}
export function toneRibbon(sequence,{el,group}){
 const wrap=group('tone-ribbon');for(const n of sequence||''){const t=beaconTones[+n],b=el('span','tone-bead');b.style.setProperty('--tone',t.color);b.append(el('b','',t.symbol),el('small','',t.name));wrap.append(b);}wrap.setAttribute('aria-label',toneText(sequence));return wrap;
}

// The two routes run independently until the engineer needs the scout's three tones.
export function relayMap(run){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 372 150');svg.setAttribute('role','img');svg.classList.add('relay-map');
 svg.setAttribute('aria-label','Два поста. Разведчик добегает до сканера и передаёт частоту. Инженер может одновременно добежать до реле. После передачи он вводит три импульса. Ошибку можно исправить.');
 const add=(type,attrs,text,parent=svg)=>{const n=document.createElementNS(ns,type);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text)n.textContent=text;parent.append(n);return n;};
 const index=relayIndex(run?.phase),gold='#f1c784',blue='#85daca',lilac='#bfa5d7',muted='#82728e';
 function path(d,color,dash=''){add('path',{d,fill:'none',stroke:color,'stroke-width':2,'stroke-linecap':'round',...(dash?{'stroke-dasharray':dash}:{})});}
 function point(x,y,glyph,label,color){add('circle',{cx:x,cy:y,r:12,fill:'#282234',stroke:color,'stroke-width':1.6});add('text',{x,y:y+4,'text-anchor':'middle',fill:color,'font-size':13},glyph);add('text',{x,y:y+27,'text-anchor':'middle',fill:'#e9dfea','font-size':10},label);}
 add('rect',{width:372,height:150,rx:11,fill:'#211d2a'});
 add('text',{x:15,y:23,fill:gold,'font-size':10,'font-weight':600},'ПОСТ РАЗВЕДЧИКА');
 add('text',{x:15,y:96,fill:blue,'font-size':10,'font-weight':600},'ПОСТ ИНЖЕНЕРА');
 path('M42 42 H215',index>=1?gold:muted);path('m201 39 5 3-5 3',gold);
 path('M42 115 H245',blue);path('M250 115 H326',index===3?blue:muted);
 path('M228 42 C271 42 234 94 249 100',index>=2?blue:lilac,'4 4');path('m242 96 7 5 1-8',index>=2?blue:lilac);
 point(40,42,'›','Старт',gold);point(120,42,'⌖','Сканер',index>=1?blue:gold);point(220,42,'≈','Передача',index>=2?blue:lilac);
 point(40,115,'›','Старт',blue);point(251,115,'◇','Реле',index>=2?blue:muted);point(331,115,'✦','Маяк',index===3?gold:muted);
 add('text',{x:270,y:71,fill:'#c6abd9','font-size':10},'3 импульса');
 return svg;
}
