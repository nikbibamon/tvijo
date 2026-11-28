import {state, write, note} from '../tvijoService.js';
import {applyCircuit, circuitPrompt, chainRun, chainUnlocked, stations, trajectory, circuitLine} from './rules.js';
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
      <div class="circuit-step">
        <p class="circuit-status" role="status"></p>
        <button class="circuit-launch" type="button" data-play>Пуск шара</button>
        <a class="circuit-launch" data-next hidden></a>
      </div>
      <p class="circuit-goal"></p>
      <fieldset class="circuit-tools"><legend>Настроить стенд</legend>
        <button type="button" data-action="guide">Повернуть желоб<strong></strong></button>
        <button type="button" data-action="lever">Переставить рычаг<strong></strong></button>
        <button type="button" data-action="branch">Перевести стрелку<strong></strong></button>
      </fieldset>
      <div class="circuit-actions">
        <button type="button" data-action="replay">Пройти ещё раз</button>
        <span class="circuit-tries"></span>
        <a class="circuit-back" href="#chain/lamp" hidden>К сигнальной лампе</a>
      </div>
      <div class="circuit-result" hidden>
        <div><strong></strong><p></p></div>
        <a href="./#journal">Журнал смены</a>
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
  const controls = Object.fromEntries(['guide','lever','branch','replay'].map(action=>[action,getButton(action)]));
  const status = get('.circuit-status');
  const panel = get('.circuit-step');
  const primary = get('[data-play]');
  const goal = get('.circuit-goal');
  let run = chainRun(state,station,previous);
  let disposed = false, busy = true, frame = 0;
  get('h2').textContent = chapter.name;
  goal.textContent = chapter.goal;
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
    const prompt = circuitPrompt(station,run);
    for (const action of ['guide','lever','branch']) {
      controls[action].disabled = busy||prompt.action!=='launch';
      controls[action].toggleAttribute('data-hint',action===prompt.control);
    }
    controls.guide.setAttribute('aria-pressed',String(run.guide));
    controls.lever.setAttribute('aria-pressed',String(run.lever));
    controls.branch.setAttribute('aria-pressed',String(run.branch==='pump'));
    primary.hidden = prompt.action==='next';
    primary.disabled = busy;
    primary.dataset.play = prompt.action;
    primary.textContent = prompt.action==='return'?'Вернуть шар':'Пуск шара';
    next.hidden = prompt.action!=='next';
    goal.hidden = run.attempts>0 || run.solved;
    controls.replay.hidden = !run.solved;
    controls.replay.disabled = busy;
    get('.circuit-tries').textContent = 'Пуски · '+run.attempts;
    const result = get('.circuit-result');
    result.hidden = !run.solved;
    if (run.solved) {
      result.querySelector('strong').textContent = station==='lamp'?'Лампа зажжена':'Энергоблок запущен';
      result.querySelector('p').textContent = station==='lamp'?'Получено Световое реле.':'Получен Ключ насоса. Радиомастерская снова принимает вызовы.';
    }
    status.textContent = prompt.message;
    panel.dataset.outcome = prompt.outcome || '';
    show();
    return prompt;
  }

  function mutate(action) {
    const operation = write(profile=>{
      const result=applyCircuit(profile,station,action,previous,Date.now());
      if (result?.report) note(profile,'field','Цепная реакция · '+circuitLine(result.report));
      return result ?? {run:chainRun(profile,station,previous)};
    });
    api.pending(operation.catch(()=>{}));
    return operation;
  }

  async function act(action) {
    if (busy || disposed) return;
    busy = true;
    for (const control of Object.values(controls)) control.disabled = true;
    primary.disabled = true;
    try {
      const result = await mutate(action);
      if (disposed) return;
      if (!result?.shot) {
        if (result) run = result.run;
        busy = false;
        const prompt = render();
        if (action==='return') (controls[prompt.control] ?? (run.solved?next:primary)).focus();
        if (action==='replay') primary.focus();
        return;
      }
      status.textContent = 'Шар идёт по желобу…';
      panel.dataset.outcome = '';
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
        (run.solved?next:primary).focus();
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
  primary.onclick = ()=>act(primary.dataset.play);
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
