import {makeSpec,worldLevel,encodeWorld} from './worlds.js';
import {drawBlueprint} from './sceneArt.js';
import {state,buildWorld} from './tvijoService.js';

const landscapes=[
 ['greenhouse','Оранжерея','greenhouse'],['foundry','Кузница','foundry'],['rift','Кристаллы','rift'],
 ['sun','Причал','dock'],['lava','Лава','mine'],['beacon','Маяк','beacon']
];
const jobs=[['rescue','Дрон','plane'],['build','Робот','robot'],['duet','Вместе','both']];
const flights={rescue:'Спаси дрон и выведи его к капсуле',build:'Закрепи мост с Роботом и открой шлюз',duet:'Дрон разведает путь, а Робот соберёт мост для запуска маяка'};
function draftText(spec){
  const name=landscapes.find(l=>l[0]===spec.theme)[1];
  return name+'. '+flights[spec.path]+'. '+spec.steps+' платформы'+(spec.shadow?' с тенью.':' без тени.');
}
export function workshop({el,group,picture,action,openModal,startMic,play,onDock,wallet}){
  const seed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
  let choice={theme:'greenhouse',path:'rescue',steps:3,shadow:false,seed:seed()},auto=true,busy=false,current=choice;
  const canvas=el('canvas','work-preview');canvas.width=960;canvas.height=448;canvas.setAttribute('role','img');
  const previewLabel=el('strong'),preview=group('blueprint-view',canvas,group('blueprint-caption',previewLabel));
  const input=el('textarea','world-idea');input.id='world-idea';input.maxLength=300;input.rows=2;input.setAttribute('aria-label','Текст задания');
  const subtitle=el('small','blueprint-mission'),note=el('div','work-note');note.id='world-note';note.setAttribute('role','status');
  const picks=new Map();
  function picker(title,key,list,kind){
    const choices=group('blueprint-picks '+kind);
    const shell=el('fieldset','blueprint-options');shell.append(el('legend','',title),choices);
    const buttons=[];
    for(const [value,label,art] of list){
      const b=action(label,()=>{if(busy)return;choice={...choice,[key]:value};refresh();},'blueprint-pick');
      if(kind==='landscapes')b.prepend(picture('./art/'+art+'.webp'));
      if(kind==='crew-picks'&&art!=='both')b.prepend(picture('./art/crew/'+art+'.webp'));
      if(art==='both')b.prepend(group('two-faces',picture('./art/crew/plane.webp'),picture('./art/crew/robot.webp')));
      choices.append(b);buttons.push([value,b]);
    }
    picks.set(key,buttons);return shell;
  }
  const themes=picker('Пейзаж','theme',landscapes,'landscapes'),crew=picker('Напарники','path',jobs,'crew-picks');
  const difficulty=picker('Маршрут','steps',[[2,'2 платформы'],[3,'3 платформы'],[4,'4 платформы']],'steps');
  const shadow=action('Тень',()=>{choice={...choice,shadow:!choice.shadow};refresh();},'chip');
  const reroll=action('Другой рельеф',()=>{choice={...choice,seed:seed()};refresh();},'chip','orbit');
  const flying=el('input');flying.type='checkbox';flying.checked=true;
  const pilot=el('label','pilot-check');pilot.append(flying,document.createTextNode('Экипаж пройдёт мир сам'));
  flying.onchange=()=>{auto=flying.checked;pricing();};
  const details=el('details','brief-editor');details.append(el('summary','','Изменить текст или продиктовать'),input,action('Диктовать',()=>startMic('world'),'text-btn','mic'));
  const build=action('',async()=>{
    if(busy)return;
    if(!state.completed.includes('dock')){onDock();return;}
    if(input.value!==draftText(choice)){try{current=makeSpec(input.value);}catch(e){note.textContent=e.message;return;}}
    busy=true;build.disabled=true;
    try{const result=await buildWorld(input.value,current);await play(result,auto);}
    catch(e){note.textContent=e.message;build.disabled=false;}
    finally{busy=false;}
  },'btn primary','spark');
  const costLabel=el('span');build.append(costLabel);
  const balance=action('',wallet,'text-btn work-balance');
  function pricing(){
    const paid=state.worlds.some(w=>encodeWorld(w)===encodeWorld(current)),price=paid?'бесплатно':'25 демо-кр.';
    costLabel.textContent=!state.completed.includes('dock')?'Открыть мастерскую на причале':(auto?'Нарисовать и пройти':'Нарисовать мир')+' · '+price;
    balance.textContent='Баланс · '+state.balance;build.title='Создание мира. Ход автопилота бесплатный.';
  }
  function showPreview(spec){
    current=spec;const level=worldLevel(spec);previewLabel.textContent=level.name;canvas.setAttribute('aria-label','Чертёж мира «'+level.name+'»');
    subtitle.textContent=input.value;drawBlueprint(canvas,spec);pricing();
  }
  function refresh(){
    input.value=draftText(choice);note.textContent='';
    for(const [key,items] of picks)for(const [v,b] of items)b.setAttribute('aria-pressed',String(choice[key]===v));
    shadow.setAttribute('aria-pressed',String(choice.shadow));showPreview(choice);
  }
  input.oninput=()=>{try{showPreview(makeSpec(input.value));note.textContent='';}catch(e){note.textContent=e.message;}};
  refresh();
  openModal('Мастерская миров',[preview,themes,crew,difficulty,group('work-extras',shadow,reroll),subtitle,details,pilot,
    ...(!state.completed.includes('dock')?[el('p','subtle','Забери первую капсулу на причале, чтобы строить свои миры.')]:[]),
    note,group('work-buy',build,balance)],'workshop');
}
