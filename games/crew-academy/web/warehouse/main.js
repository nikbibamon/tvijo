import {bus,note,state,write} from '../tvijoService.js';
import {markRoute} from '../crewRoute.js';
import {prizeById} from '../expedition/rooms.js';
import {activeJob,applyWarehouse,expressOpen} from './progress.js';
import {directions,jobs,loads,matched,onBelt,plateState,readShift,reportLine} from './rules.js';

const keys={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left',ц:'up',в:'right',ы:'down',ф:'left'};
const view=`
<section class="warehouse" aria-label="Грузовой отсек">
  <div class="wh-stage">
    <header class="wh-heading"><div><p class="wh-address"></p><h2></h2></div>
      <div class="wh-tally"><span>Плиты</span><strong>0 / 2</strong><i></i><i></i></div></header>
    <div class="wh-deck"><div class="wh-board" role="group" tabindex="0"></div></div>
    <div class="wh-handoff" aria-hidden="true"><i></i><i></i><b class="wh-parcel"></b><b class="wh-parcel"></b></div>
    <section class="wh-manifest" aria-label="Грузовой наряд"><h3>Грузовой наряд</h3><div class="wh-items"></div></section>
  </div>
  <div class="wh-console">
    <div class="wh-feed"><img src="./art/crew/robot.webp" alt=""><div><strong>Робот</strong><p class="wh-status" role="status" aria-live="polite"></p></div></div>
    <div class="wh-pad" role="group" aria-label="Ход Робота">
      <button type="button" data-dir="up" aria-label="Вверх">↑</button><button type="button" data-dir="left" aria-label="Влево">←</button>
      <button type="button" data-dir="down" aria-label="Вниз">↓</button><button type="button" data-dir="right" aria-label="Вправо">→</button>
    </div>
    <div class="wh-switch" role="group" aria-label="Стрелка конвейера" hidden><strong>Стрелка конвейера</strong><div>
      <button type="button" data-route="upper">Верхний</button><button type="button" data-route="lower">Нижний</button></div></div>
    <button type="button" class="wh-ship" data-act="ship">Отправить груз</button>
  </div>
  <section class="wh-result" hidden><div><p class="wh-prize"></p><h2></h2><p class="wh-result-copy"></p></div>
    <div class="wh-follow"><button type="button" data-job="express">Открыть экспресс-сортировку</button>
      <a class="wh-accept" href="./expedition.html#drones/delivery" data-world>Принять груз в шлюзе</a><a href="./#journal" data-world>Открыть журнал</a></div></section>
  <footer class="wh-footer"><div class="wh-undo"><button type="button" data-act="undo">Ход назад</button><button type="button" data-act="rewind">Вернуть толчок</button></div>
    <span class="wh-counts"></span><details class="wh-more"><summary>Управление и наряды</summary><div>
      <p>Стрелки или WASD — ход. Можно коснуться соседней клетки. Z отменяет ход, Backspace возвращает последний толчок.</p>
      <button type="button" data-job="line">Погрузочная линия</button><button type="button" data-job="express">Экспресс-сортировка</button>
      <a href="./expedition.html#cargo/training" data-world>Учебный склад</a><button type="button" data-act="restart">Начать этот наряд заново</button></div></details>
  </footer>
</section>`;
const wordsForTile=(job,b,i)=>{
  const pt=job.plates.indexOf(i),cart=b.boxes.indexOf(i);
  const type=pt>=0?'плита «'+loads[pt].plate+'»':onBelt(job,i)?(job.map[i]==='Y'?'стрелка конвейера':'роликовая лента'):job.map[i]==='#'?'стеллаж':'настил';
  return 'Ряд '+(1+Math.floor(i/job.width))+', столбец '+(1+i%job.width)+', '+type+(cart>=0?', '+loads[cart].name:'')+(b.player===i?', Робот':'');
};
function piece(kind) {
  const el=document.createElement('span');
  el.className='wh-piece '+(kind==='robot'?'wh-bot':'wh-load '+kind);
  el.setAttribute('aria-hidden','true');
  el.innerHTML=kind==='robot'?'<i></i>':'<i><b class="wh-shape"></b></i>';
  return el;
}
const point=(job,cell)=>({left:((cell%job.width)/job.width*100)+'%',top:(Math.floor(cell/job.width)/job.height*100)+'%'});
const initialTip={
  line:'Толкай ящики по одному. Энергоячейке нужна плита с молнией, хладагенту — с каплей.',
  express:'Выбери приёмник и толкни ящик на ролики. Стрелка у конца ленты направляет груз вверх или вниз.'
};

export function mountWarehouse(root,api) {
  root.innerHTML=view;
  const get=selector=>root.querySelector(selector);
  const shell=get('.warehouse'),boardEl=get('.wh-board'),feed=get('.wh-status'),more=get('.wh-more');
  const items=loads.map(load=>{
    const item=document.createElement('div'); item.className='wh-item '+load.symbol;
    item.innerHTML='<i class="wh-mark"><b class="wh-shape"></b></i><div><strong></strong><small></small></div><span></span>';
    item.querySelector('strong').textContent=load.name; item.querySelector('small').textContent='Плита «'+load.plate+'»';
    get('.wh-items').append(item);return item;
  });
  const robot=piece('robot'),crates=loads.map(l=>piece(l.symbol));
  let id,job,run,cells=[],disposed=false,tail=Promise.resolve();
  let lastBoard='',moveFace=1,receiptAnimation;
  function setup(next){
    id=next;job=jobs[id];lastBoard='';shell.dataset.job=id;robot.style.setProperty('--face',1);
    boardEl.style.setProperty('--cols',job.width);boardEl.style.setProperty('--rows',job.height);
    boardEl.setAttribute('aria-label','Поле склада, '+job.width+' на '+job.height);
    cells=Array.from(job.map,(c,i)=>{
      const cell=document.createElement('button');cell.type='button';cell.dataset.cell=i;cell.tabIndex=-1;
      cell.className='wh-tile '+(c==='#'?'rack':onBelt(job,i)?'roller':job.plates.includes(i)?'socket '+loads[job.plates.indexOf(i)].symbol:'floor');
      if(job.plates.includes(i))cell.innerHTML='<i class="wh-plate"><b class="wh-shape"></b></i>';
      if(onBelt(job,i)){cell.innerHTML='<i aria-hidden="true"></i>';cell.classList.toggle('fork',c==='Y');}
      return cell;
    });
    boardEl.replaceChildren(...cells,...crates,robot);
    get('.wh-heading h2').textContent=job.name;
    get('.wh-address').textContent=id==='line'?'Грузовой отсек · Пусковой конвейер':'Грузовой отсек · Отправка в шлюз';
    feed.textContent=initialTip[id];
  }
  function draw(){
    if(disposed)return;
    const next=activeJob(state);
    if(next!==id)setup(next);
    run=readShift(state.warehouse,id);
    const b=run.board,count=matched(job,b),report=state.warehouseReports?.[id];
    const token=JSON.stringify(b);
    if(token!==lastBoard){
      Object.assign(robot.style,point(job,b.player)); b.boxes.forEach((n,i)=>Object.assign(crates[i].style,point(job,n)));
      cells.forEach((cell,i)=>{cell.setAttribute('aria-label',wordsForTile(job,b,i));cell.classList.toggle('powered',job.plates.indexOf(i)>=0&&b.boxes[job.plates.indexOf(i)]===i);});
      lastBoard=token;
      feed.textContent=b.sent?'Оба груза отправлены.':count===2?'Обе плиты готовы. Можно отправлять груз.':b.moves?
        (id==='express'?'Для следующего ящика проверь направление стрелки.':'Подойди к ящику с той стороны, откуда его нужно толкнуть.') :initialTip[id];
    }
    shell.dataset.branch=b.branch;
    get('.wh-tally strong').textContent=count+' / 2';
    items.forEach((item,i)=>{
      const msg=plateState(job,b,i);item.dataset.condition=msg==='На месте'?'on':msg==='Чужой груз'?'wrong':'wait';
      item.querySelector('span').textContent=b.sent?(report?.receivedAt!=null?'Доставлено':'Отправлено'):msg;
      get('.wh-tally').querySelectorAll('i')[i].classList.toggle('on',msg==='На месте');
      get('.wh-handoff').querySelectorAll('i')[i].classList.toggle('on',msg==='На месте');
    });
    get('.wh-counts').textContent='Ходы · '+b.moves+'　Толчки · '+b.pushes;
    get('.wh-switch').hidden=id!=='express'||b.sent;
    root.querySelectorAll('[data-route]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.route===b.branch)));
    get('.wh-pad').hidden=b.sent;get('.wh-undo').hidden=b.sent;
    get('[data-act="undo"]').disabled=!run.history.length;get('[data-act="rewind"]').disabled=!run.pushHistory.length;
    get('.wh-ship').hidden=b.sent;get('.wh-ship').disabled=count!==2;
    get('.wh-result').hidden=!b.sent;
    get('.wh-result [data-job]').hidden=id!=='line';get('.wh-accept').hidden=id!=='express';
    if(b.sent){
      get('.wh-prize').textContent='В рюкзаке · '+prizeById(id==='line'?'cargo':'cargo-express').prize;
      get('.wh-result h2').textContent=id==='line'?'Пусковой конвейер работает':'Груз отправлен в Ремонтный шлюз';
      get('.wh-result-copy').textContent=report?reportLine(report):'Обе плиты приняли груз.';
      get('.wh-accept').textContent=report?.receivedAt!=null?'Посмотреть груз в шлюзе':'Принять груз в шлюзе';
    }
    more.querySelector('[data-job="line"]').hidden=id==='line';
    more.querySelector('[data-job="express"]').hidden=id==='express'||!expressOpen(state);
  }
  function animateCargo(el,job,path){
    if(!el.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    el.getAnimations().forEach(a=>a.cancel());
    el.animate(path.map(n=>point(job,n)),{duration:(path.length-1)*150,easing:'ease-in-out'});
  }
  function commit(action,requested=id) {
    const op=write(profile=>{
      const result=applyWarehouse(profile,requested,action,Date.now());
      if(result?.report){
        note(profile,'field','Склад Робота · '+jobs[requested].name+'. '+reportLine(result.report));
        if(result.fresh)note(profile,'field','В рюкзаке — '+prizeById(result.prize).prize+'.');
      }
      return result;
    });
    return op;
  }
  function issue(action,requested=id){
    const op=tail.then(async()=>{
      if(disposed)return;
      const prev=run.board.player, result=await commit(action,requested);
      if(disposed||!result||requested!==id)return;
      if(action.type==='open'||action.type==='restart')more.open=false;
      if(action.type==='move'||action.type==='cell'){
        if(run.board.player!==prev){
          moveFace=run.board.player%job.width===prev%job.width?moveFace:run.board.player%job.width>prev%job.width?1:-1;
          robot.style.setProperty('--face',moveFace);animateCargo(robot,job,[prev,run.board.player]);
        }
      }
      if(result.travel)animateCargo(crates[result.travel.index],job,result.travel.path);
      if(result.message)feed.textContent=result.message;
      if(result.report){
        const parcel=get('.wh-handoff');parcel.classList.remove('outbound');
        void parcel.offsetWidth;parcel.classList.add('outbound');
        clearTimeout(receiptAnimation);receiptAnimation=setTimeout(()=>parcel.classList.remove('outbound'),1700);
        api.say(id==='express'?'Посылка вышла в Ремонтный шлюз.':'Пусковой конвейер работает.');
      }
    });
    tail=op.catch(()=>{});api.pending(tail);
  }
  function click(event){
    const b=event.target.closest('button');
    if(!b||b.disabled||!root.contains(b))return;
    if(b.dataset.dir)issue({type:'move',dir:b.dataset.dir});
    else if(b.dataset.cell!=null)issue({type:'cell',cell:Number(b.dataset.cell)});
    else if(b.dataset.route)issue({type:'route',to:b.dataset.route});
    else if(b.dataset.job)issue({type:'open'},b.dataset.job);
    else if(b.dataset.act)issue({type:b.dataset.act});
  }
  function keydown(e){
    if(e.ctrlKey||e.metaKey||e.altKey||e.defaultPrevented||!(e.target===document.body||root.contains(e.target)))return;
    if(e.target.closest('details[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    const dir=keys[k];
    if(!dir&&!['z','я','Backspace'].includes(k))return;
    e.preventDefault();if(run.board.sent)return;
    issue(dir?{type:'move',dir}:{type:k==='Backspace'?'rewind':'undo'});
  }
  root.addEventListener('click',click);document.addEventListener('keydown',keydown);bus.addEventListener('change',draw);
  markRoute('room','cargo');draw();
  const entry=api.cargoEntry;
  const target=entry==='express'&&expressOpen(state)?'express':entry==='line'?'line':id;
  if(!state.warehouse||target!==id)issue({type:'open'},target);
  if(entry==='express'&&!expressOpen(state))feed.textContent='Сначала отправь два груза с пускового конвейера.';
  return ()=>{disposed=true;clearTimeout(receiptAnimation);root.removeEventListener('click',click);document.removeEventListener('keydown',keydown);bus.removeEventListener('change',draw);};
}
