import {beaconTones} from './crewLabels.js';
import {rescueHref} from './rescue/mission.js';
import {relayDiagram,toneRibbon,relayBrief,practiceStep} from './relayMission.js';

export function crewTerminal({el,group,ii,action,para,openModal,read,store,launch,home,channel,club,visible}){
 let loading=false;
 const parts={el,group,ii};
 function handoff(run){
  if(run.practice)return launch(run);
  store(run);show(run);
 }
 async function command(op,sequence){
  const before=read();if(!before||loading)return;
  loading=true;
  try{
   const next=before.practice?practiceStep(before,op,sequence):await club().updateRelay(before,op,sequence);
   if(read()?.mission!==before.mission||!visible())return;
   if(op==='send')handoff(next);else{store(next);show(next);}
  }catch(e){if(read()?.mission===before.mission&&visible())show(before,e.message);}
  finally{loading=false;}
 }
 async function update(){
  const run=read();if(!run||loading||run.practice)return;
  loading=true;
  try{const latest=await club().refreshRelay(run);if(read()?.mission!==run.mission||!visible())return;store(latest);show(latest);}
  catch(e){if(visible())show(run,e.message);}finally{loading=false;}
 }
 function show(run,error=''){
  const blocks=[el('div','relay-caption',run.practice?'Учебная смена с Роботом':'Напарник · '+run.partner),relayDiagram(run,parts)];
  if(error){const m=para(error,'inline-note');m.setAttribute('role','alert');blocks.push(m);}
  const onChannel=()=>channel(run);
  if(run.phase==='done'){
   blocks.push(group('relay-win',ii('award'),el('h3','','Маяк зажжён!'),para(run.practice?'Ты нашёл частоту и настроил приёмник. Теперь попробуй разделить эти роли с другим пилотом.':'Оба поста подтвердили частоту. Ваш совместный результат появился в таблице пилотов.')),
    group('actions',action(run.practice?'Найти напарника':'Открыть канал напарника',onChannel,run.practice?'btn primary':'btn secondary','users'),action('В штаб',home)));
   if(!run.practice){
    const rescue=el('a','btn primary','В «Линию спасения»');
    rescue.href=rescueHref(run.other);
    blocks.at(-1).prepend(rescue);
   }
  }else if(run.role==='scout'&&run.phase==='scout'){
   blocks.push(el('h3','','Сканер поймал сигнал'),para('Прочитай три импульса на частоте причала.'),action('Считать импульсы',()=>command('scan'),'btn primary','radio'));
  }else if(run.role==='scout'&&run.phase==='found'){
   blocks.push(el('h3','','Частота найдена'),toneRibbon(run.sequence,parts),para(run.practice?'Передай частоту Роботу, затем пройди к приёмнику на втором посту.':'Передай три символа. Напарник получит их на своём реле.'),action('Передать частоту',()=>command('send'),'btn primary','send'));
  }else if(run.role==='engineer'&&run.phase==='sent'){
   blocks.push(el('h3','','Настрой частоту маяка'),para('Вызов с причала. Повтори три символа слева направо.'),toneRibbon(run.sequence,parts));
   let seq='';const picked=el('div','dial-input');picked.setAttribute('aria-live','polite');
   const keys=group('dial-keys');const confirm=action('Зажечь маяк',()=>command('tune',seq),'btn primary','zap');
   function render(){picked.textContent=[0,1,2].map((_,i)=>seq[i]===undefined?'·':beaconTones[+seq[i]].symbol).join('   ');confirm.disabled=seq.length!==3;for(const b of keys.children)b.disabled=seq.length===3;}
   for(const [i,t] of beaconTones.entries()){const b=action(t.symbol,()=>{if(seq.length<3)seq+=i;render();},'dial-key');b.style.setProperty('--tone',t.color);b.title=t.name;b.setAttribute('aria-label',t.name);keys.append(b);}
   render();blocks.push(picked,keys,group('actions',confirm,action('Сбросить ввод',()=>{seq='';render();},'text-btn')));
  }else{
   blocks.push(el('h3','',run.role==='scout'?'Сигнал передан':'Приёмник на связи'),para(relayBrief(run)),group('actions',action('Открыть канал напарника',onChannel,'btn primary','radio'),action('Обновить сигнал',update)));
  }
  openModal(run.role==='scout'?'Сканер разведчика':'Реле инженера',blocks,'relay');
 }
 function arrive(){const r=read();if(!r)return;show(r);if(!r.practice&&((r.role==='engineer'&&r.phase!=='sent')||(r.role==='scout'&&r.phase==='sent')))update();}
 window.setInterval(()=>{const r=read();if(visible()&&!document.hidden&&!r?.practice&&r?.phase!=='done'&&((r?.role==='scout'&&r.phase==='sent')||(r?.role==='engineer'&&r.phase!=='sent')))update();},4500);
 return {arrive};
}
