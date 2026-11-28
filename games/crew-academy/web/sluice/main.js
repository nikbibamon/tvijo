import {bus, note, state, write} from '../tvijoService.js';
import {markRoute} from '../crewRoute.js';
import {hasPrize, prizeById} from '../expedition/rooms.js';
import {deliverPrize} from '../expedition/rewards.js';
import {applySluice} from './progress.js';
import {acceptShipment} from '../warehouse/progress.js';
import {atStop, canAssign, crew, dayPrize, GATE, guidance, modes, nightPrize, reportLine, rescued, restoreRun, roleName} from './rules.js';
import {dronePlace, paintTrack} from './track.js';

const STEP_MS = 500;
const template = `
  <section class="wh-delivery" hidden aria-label="Приёмка со склада"><div><strong>Входящий груз · Склад Робота</strong><h2></h2><p>Энергоячейка и хладагент для ремонтников.</p></div>
    <button type="button" data-cmd="receive">Принять оба груза</button><a href="./expedition.html#cargo" data-world>На Склад Робота</a></section>
  <div class="sluice">
    <div class="sl-field" data-phase="day" role="group" aria-label="Пути ремонтного шлюза">
      <canvas width="1500" height="750" aria-hidden="true"></canvas>
      <div class="sl-mode"><i></i><span></span></div>
      <div class="sl-count"><span>В шлюзе</span> <strong>0 / 5</strong></div>
      <span class="sl-stop sl-gap"></span><span class="sl-stop sl-spur">Карман</span>
      <div class="sl-fleet" aria-label="Дроны на поле"></div>
    </div>
    <div class="sl-toolbar">
      <p class="sl-feedback" role="status" aria-live="polite"></p>
      <div class="sl-transport">
        <button type="button" class="sl-main" data-cmd="march">Марш</button>
        <button type="button" data-cmd="step">Один такт</button>
      </div>
    </div>
    <div class="sl-desk">
      <section class="sl-team"><h2>Ремонтная смена</h2><div class="sl-roster" role="group" aria-label="Выбор дрона"></div></section>
      <section class="sl-orders"><h2>Поручение <span></span></h2>
        <div class="sl-buttons"><button type="button" data-cmd="builder"></button><button type="button" data-cmd="signaller"></button></div>
      </section>
      <section class="sl-setting"><h2>Стрелка</h2>
        <div class="sl-buttons" role="group" aria-label="Направление стрелки"><button type="button" data-cmd="gate">К шлюзу</button><button type="button" data-cmd="siding">В карман</button></div>
      </section>
      <section class="sl-power" hidden><h2>Питание</h2>
        <div class="sl-buttons" role="group" aria-label="Питание ночной смены"><button type="button" data-cmd="lift">Лифт</button><button type="button" data-cmd="beacon">Маяк</button></div>
      </section>
    </div>
    <div class="sl-finish" hidden>
      <div><p class="sl-result-kicker"></p><h2>Вся пятёрка в шлюзе</h2><p class="sl-report"></p></div>
      <div class="sl-finish-links"><a class="sl-journal" href="./expedition.html#cargo" data-world>На Склад Робота</a><a class="sl-journal" href="./#journal" data-world>Открыть журнал</a></div>
    </div>
    <div class="sl-footer">
      <button type="button" class="sl-night" data-cmd="night" hidden>Выйти в ночную смену</button>
      <button type="button" data-cmd="day" hidden>Дневная смена</button>
      <button type="button" data-cmd="undo">Шаг назад</button>
      <details class="sl-reset"><summary>Начать заново</summary><button type="button" data-cmd="restart">Вернуться на старт смены</button></details>
    </div>
  </div>`;

function makeDroid(id, onTrack) {
  const unit=crew[id], button=document.createElement('button');
  button.type='button'; button.dataset.drone=String(id);
  button.className=onTrack?'sl-unit':'sl-card';
  button.style.setProperty('--lamp',unit.color);
  if(onTrack){
    const img=document.createElement('img');img.src='./echo/drone.webp';img.alt='';img.draggable=false;
    const call=document.createElement('b');call.textContent=String(id+1);
    const tool=document.createElement('span');tool.className='sl-tool';tool.setAttribute('aria-hidden','true');
    button.append(img,call,tool);
  }else{
    const num=document.createElement('i');num.textContent=String(id+1);
    const name=document.createElement('strong');name.textContent=unit.name;
    button.append(num,name,document.createElement('small'));
  }
  return button;
}

export function mountDrones(root, api) {
  root.innerHTML=template;
  const get = selector=>root.querySelector(selector);
  const field=get('.sl-field'), feed=get('.sl-feedback'), canvas=get('canvas');
  const buttons=Object.fromEntries([...root.querySelectorAll('[data-cmd]')].map(b=>[b.dataset.cmd,b]));
  const sprites=crew.map((_,i)=>makeDroid(i,true)), cards=crew.map((_,i)=>makeDroid(i,false));
  get('.sl-fleet').append(...sprites);get('.sl-roster').append(...cards);
  const legacy=api.load();
  let run, timer, marching=false, disposed=false, lastMessage='', busy=false;
  markRoute('room','drones');
  function pause(){marching=false;clearTimeout(timer);}
  function feedback(text, speak=false){
    if(!text||text===lastMessage)return;
    lastMessage=text;feed.textContent=text;
    if(speak)api.say(text);
  }
  function draw(){
    if(disposed)return;
    run=restoreRun(state.sluice,legacy);
    const {board,selected}=run, count=rescued(board), complete=count===crew.length, night=board.mode==='night';
    if(complete)pause();
    const shipment=state.warehouseReports?.express, delivery=get('.wh-delivery');
    delivery.hidden=!shipment;
    if(shipment){
      delivery.querySelector('h2').textContent=shipment.receivedAt!=null?'Груз принят в шлюзе':'Посылка на разгрузке';
      buttons.receive.hidden=shipment.receivedAt!=null;
      buttons.receive.dataset.shipment=String(shipment.shipment);
    }
    field.dataset.phase=board.mode;field.dataset.complete=String(complete);
    get('.sl-mode span').textContent=modes[board.mode];get('.sl-count strong').textContent=count+' / 5';
    get('.sl-gap').textContent=night?'Грузовой лифт':'Разрыв';
    get('.sl-gap').classList.toggle('ready',board.bridge&&(!night||board.power==='lift'));
    paintTrack(canvas,board);
    for(let i=0;i<crew.length;i++){
      const [x,y]=dronePlace(board.positions,i), role=roleName(board,i), where=atStop(board,i);
      const equipped=i===board.builder||i===board.signaller;
      const selectedNow=i===selected, label='Дрон '+(i+1)+' '+crew[i].name+', '+role+', '+where;
      const sprite=sprites[i],card=cards[i];
      sprite.style.left=x+'%';sprite.style.top=y+'%';
      sprite.dataset.away=String(board.positions[i]===GATE);
      const badge=sprite.querySelector('.sl-tool');
      badge.textContent=i===board.builder?(night?'Л':'Т'):i===board.signaller?'⚑':'';
      badge.hidden=!equipped;
      for(const b of [sprite,card]){b.setAttribute('aria-pressed',String(selectedNow));b.setAttribute('aria-label',label);}
      card.dataset.waiting=String(['В кармане','У разрыва','У лифта','У стрелки'].includes(where));
      card.querySelector('small').textContent=where==='В шлюзе'||where==='В кармане'||where.startsWith('У ')?where:equipped?role:where;
    }
    get('.sl-orders h2 span').textContent='· '+crew[selected].name;
    const setPressed=(key,on)=>buttons[key].setAttribute('aria-pressed',String(on));
    buttons.builder.textContent=(night?'Лифт':'Трап')+(board.builder<0?'':' · '+crew[board.builder].name);
    buttons.signaller.textContent='Стрелка'+(board.signaller<0?'':' · '+crew[board.signaller].name);
    buttons.builder.setAttribute('aria-label',night?'Поручить лифт':'Поручить трап');
    buttons.signaller.setAttribute('aria-label','Поручить стрелку');
    for(const role of ['builder','signaller']){
      buttons[role].disabled=!canAssign(board,selected,role)||complete;setPressed(role,board[role]===selected);
    }
    for(const to of ['gate','siding']){setPressed(to,board.direction===to);buttons[to].disabled=complete;}
    for(const to of ['lift','beacon']){setPressed(to,board.power===to);buttons[to].disabled=complete;}
    get('.sl-power').hidden=!night;get('.sl-desk').classList.toggle('night',night);
    buttons.march.textContent=marching?'Пауза':'Марш';buttons.march.dataset.running=String(marching);
    buttons.march.disabled=complete;buttons.step.disabled=complete||marching;
    get('.sl-transport').hidden=complete;
    get('.sl-desk').classList.toggle('done',complete);
    buttons.undo.disabled=complete||!run.history.length;
    const changeAllowed=complete||(!board.turns&&board.builder<0&&board.signaller<0);
    buttons.night.hidden=night||!hasPrize(state,dayPrize)||!changeAllowed;
    buttons.day.hidden=!night||!changeAllowed;
    const finish=get('.sl-finish');finish.hidden=!complete;
    if(complete){
      get('.sl-result-kicker').textContent='В рюкзаке · '+prizeById(night?nightPrize:dayPrize).prize;
      const saved=state.sluiceReports?.[board.mode];
      get('.sl-report').textContent=saved ? reportLine(saved) : 'Сохранённое прохождение. Пять ремонтников вернулись со смены.';
    }
    feedback(guidance(board));
  }
  function commit(action){
    // Timer ticks carry a revision so a late tick cannot advance a different tab's new shift.
    const op=write(profile=>{
      const result=applySluice(profile,legacy,action,Date.now());
      if(result?.report){
        const name=modes[result.report.mode];
        note(profile,'field','Ремонтный шлюз · '+name+' · спасены 5 из 5. '+reportLine(result.report));
        if(result.fresh)note(profile,'field','В рюкзаке — '+prizeById(result.prize).prize+'.');
      }
      return result;
    });
    api.pending(op);
    return op;
  }
  function announce(result,previous){
    if(!result)return;
    const b=result.run.board;
    if(result.report){feedback('Все пять дронов вошли в шлюз!',true);return;}
    if(!previous.bridge && b.bridge)feedback(crew[b.builder].name+(b.mode==='night'?' запускает лифт.':' раскладывает трап.'),true);
    else if(!previous.routed && b.routed)feedback(crew[b.signaller].name+' переводит стрелку.',true);
    else if(b.detours>previous.detours)feedback(guidance(b),true);
  }
  async function tick(){
    if(!marching||disposed)return;
    const previous=run.board;
    const result=await commit({type:'step',expected:run.revision});
    if(disposed)return;
    if(result?.report){announce(result,previous);return;}
    if(!marching)return;
    if(!result){pause();draw();api.say(guidance(run.board));return;}
    announce(result,previous);
    if(marching)timer=setTimeout(tick,STEP_MS);
  }
  async function handle(event){
    const button=event.target.closest('button');
    if(!button||button.disabled||disposed||busy)return;
    const cmd=button.dataset.cmd;
    if(button.dataset.drone!==undefined){await commit({type:'select',id:Number(button.dataset.drone)});return;}
    if(!cmd)return;
    if(cmd==='receive'){
      const serial=Number(button.dataset.shipment);
      const receipt=write(profile=>{
        if(!acceptShipment(profile,serial,Date.now()))return false;
        note(profile,'field','Ремонтный шлюз принял посылку со Склада Робота. Энергоячейка и хладагент на месте.');
        return true;
      });
      api.pending(receipt);
      if(await receipt && !disposed)api.say('Груз принят. Оба места на разгрузке.');
      return;
    }
    if(cmd==='march'){
      if(marching){pause();draw();}else{marching=true;draw();void tick();}
      return;
    }
    pause();
    const action=['builder','signaller'].includes(cmd)?{type:'assign',role:cmd}:
      ['gate','siding'].includes(cmd)?{type:'direction',to:cmd}:
      ['lift','beacon'].includes(cmd)?{type:'power',to:cmd}:{type:cmd};
    busy=true;
    try{
      const previous=run.board, result=await commit(action);
      if(disposed)return;
      if(cmd==='restart'||cmd==='day'||cmd==='night')get('.sl-reset').open=false;
      if(cmd==='step')announce(result,previous);
      if(cmd==='undo' && result)feedback('Последний такт или приказ отменён.');
    }finally{busy=false;}
  }
  function hide(){if(document.hidden){pause();draw();}}
  function leave(){pause();}
  root.addEventListener('click',handle);
  document.addEventListener('visibilitychange',hide);
  window.addEventListener('pagehide',leave);
  bus.addEventListener('change',draw);
  draw();
  if(api.cargoDeliveryEntry && state.warehouseReports?.express)
    requestAnimationFrame(()=>{if(!disposed)get('.wh-delivery').scrollIntoView({block:'nearest'});});
  if(api.nightEntry){
    history.replaceState(history.state,'',location.pathname+location.search+'#drones');
    if(hasPrize(state,dayPrize) && run.board.mode!=='night')void commit({type:'night'});
  }
  if(!state.sluice && legacy?.rewarded && rescued(run.board)===crew.length && !hasPrize(state,dayPrize))
    api.pending(deliverPrize(dayPrize));
  return ()=>{disposed=true;pause();root.removeEventListener('click',handle);bus.removeEventListener('change',draw);
    document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',leave);};
}
