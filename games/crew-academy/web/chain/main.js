import {state, write, note} from '../tvijoService.js';
import {applyCircuit, arrival, chainRun, chainUnlocked, stations, trajectory, circuitLine} from './rules.js';
import {drawCircuit} from './field.js';

const template = `
  <section class="circuit" aria-label="Пусковой стенд">
    <div class="circuit-stage">
      <div class="circuit-head">
        <div><span>Энергоблок</span><h2></h2></div>
        <div class="circuit-lights" aria-label="Состояние приборов">
          <span data-signal="lamp">Лампа</span><span data-signal="pump">Насос</span>
        </div>
      </div>
      <canvas width="960" height="540" aria-hidden="true"></canvas>
    </div>
    <div class="circuit-console">
      <div class="circuit-brief"><p class="circuit-goal"></p><p class="circuit-status" role="status"></p></div>
      <fieldset class="circuit-tools"><legend>Настроить стенд</legend>
        <button type="button" data-action="guide">Повернуть желоб<strong></strong></button>
        <button type="button" data-action="lever">Переставить рычаг<strong></strong></button>
        <button type="button" data-action="branch">Перевести стрелку<strong></strong></button>
      </fieldset>
      <div class="circuit-actions">
        <button class="circuit-launch" type="button" data-action="launch">Пуск шара</button>
        <button type="button" data-action="return">Вернуть шар</button>
        <button type="button" data-action="replay">Пройти ещё раз</button>
        <span class="circuit-tries"></span>
        <a class="circuit-back" href="#chain/lamp" hidden>К сигнальной лампе</a>
      </div>
      <div class="circuit-result" hidden>
        <div><strong></strong><p></p></div>
        <div class="circuit-next"><a class="circuit-launch" data-next></a><a href="./#journal">Журнал смены</a></div>
      </div>
    </div>
  </section>`;

export function mountCircuit(root, api) {
  const previous = api.load();
  api.visit();
  const active = state.chainLab?.active;
  const station = chainUnlocked(state,'pump') && (api.chainEntry==='pump' || !api.chainEntry && (active!=='lamp'||chainRun(state,'lamp',previous).solved))
    ? 'pump' : 'lamp';
  const chapter = stations[station];
  root.innerHTML = template;
  const get = selector => root.querySelector(selector);
  const getButton = action => get('[data-action='+action+']');
  const canvas = get('canvas');
  const controls = Object.fromEntries(['guide','lever','branch','launch','return','replay'].map(action=>[action,getButton(action)]));
  const status = get('.circuit-status');
  let run = chainRun(state,station,previous);
  let disposed = false, busy = true, frame = 0;
  get('h2').textContent = chapter.name;
  get('.circuit-goal').textContent = chapter.goal;
  controls.branch.hidden = station!=='pump';
  get('.circuit-back').hidden = station!=='pump';
  const next = get('[data-next]');
  next.href = station==='lamp'?'#chain/pump':'#radio';
  next.textContent = station==='lamp'?'К контуру охлаждения':'В Радиомастерскую';

  function show(progress=1, shot=run.last?trajectory(station,run):null) {
    const lampLit = station==='pump' || run.solved && station==='lamp';
    const pumpLit = run.solved && station==='pump';
    get('[data-signal=lamp]').classList.toggle('on',lampLit);
    get('[data-signal=pump]').classList.toggle('on',pumpLit);
    drawCircuit(canvas,station,run,{shot,progress,lampLit,pumpLit});
  }
  function render() {
    controls.guide.querySelector('strong').textContent = run.guide?'К рычагу':'В ловушку';
    controls.lever.querySelector('strong').textContent = run.lever?'У контакта':'На дальней опоре';
    controls.branch.querySelector('strong').textContent = run.branch==='lamp'?'Верхняя · лампа':'Нижняя · насос';
    for (const action of ['guide','lever','branch','launch']) controls[action].disabled = busy||!!run.last||run.solved;
    controls.guide.setAttribute('aria-pressed',String(run.guide));
    controls.lever.setAttribute('aria-pressed',String(run.lever));
    controls.branch.setAttribute('aria-pressed',String(run.branch==='pump'));
    controls.return.hidden = !run.last||run.solved;
    controls.return.disabled = busy;
    controls.replay.hidden = !run.solved;
    controls.replay.disabled = busy;
    get('.circuit-tries').textContent = 'Пуски · '+run.attempts;
    const result = get('.circuit-result');
    result.hidden = !run.solved;
    if (run.solved) {
      result.querySelector('strong').textContent = station==='lamp'?'Лампа зажжена':'Энергоблок запущен';
      result.querySelector('p').textContent = station==='lamp'?'Получено Световое реле.':'Получен Ключ насоса. Радиомастерская снова принимает вызовы.';
    }
    const outcome = run.last==='lamp'&&station==='pump'?'Шар дошёл до лампы. Верни шар и переведи стрелку на насос.':arrival[run.last];
    status.textContent = outcome || 'Шар в подающем лотке.';
    status.dataset.outcome = run.solved?'won':run.last?'miss':'';
    show();
  }

  function mutate(action) {
    const operation = write(profile=>{
      const result=applyCircuit(profile,station,action,previous,Date.now());
      if (result?.report) note(profile,'field','Цепная реакция · '+circuitLine(result.report));
      return result;
    });
    api.pending(operation.catch(()=>{}));
    return operation;
  }

  async function act(action) {
    if (busy || disposed) return;
    busy = true;
    for (const control of Object.values(controls)) control.disabled = true;
    try {
      const result = await mutate(action);
      if (disposed) return;
      if (!result?.shot) {
        if (result) run = result.run;
        busy = false;
        render();
        if (action==='return') controls.launch.focus({preventScroll:true});
        return;
      }
      status.textContent = 'Шар идёт по желобу…';
      status.dataset.outcome = '';
      const start = performance.now();
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches?170:1650;
      const advance = time=>{
        const progress = Math.min(1,(time-start)/duration);
        if (progress<1) {
          show(progress,result.shot);
          frame=requestAnimationFrame(advance);
          return;
        }
        run=result.run;
        busy=false;
        render();
        if (run.solved) api.say(status.textContent);
        else controls.return.focus({preventScroll:true});
      };
      frame=requestAnimationFrame(advance);
    } catch {
      if (disposed) return;
      busy=false;
      render();
      status.textContent = 'Стенд ждёт. Повтори действие.';
    }
  }

  for (const [action,control] of Object.entries(controls)) control.onclick = ()=>act(action);
  mutate('open').then(result=>{
    if (disposed) return;
    run=result?.run??run;
    busy=false;
    render();
  }).catch(()=>{
    if (disposed) return;
    busy=false;
    render();
  });
  render();
  return ()=>{
    disposed=true;
    cancelAnimationFrame(frame);
  };
}
