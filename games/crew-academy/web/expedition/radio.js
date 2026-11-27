// The courier can carry one requested object at a time.
const itemWords = {
  ramp: 'трап трапа трапу трапом трапы трапов трапик трапика мост моста мостом мостик мостика мостки мостков сходни сходней сходнями настил настила настилом доска доску доски доской доску лестница лестницу лестницей міст місток дошка дошку bridge plank ramp',
  rope: 'трос троса тросу тросом тросы тросов тросик тросика тросики веревка веревку веревки веревке веревкой веревкою веревочка веревочку канат каната канату канатом канаты шнур шнура шнурок шнурка линь линя линем фал фала мотузка мотузку мотузкою rope cable',
  lamp: 'фонарь фонаря фонарю фонарем фонари фонарик фонарика фонариком фонарики лампа лампу лампой лампочка лампочку светильник светильника прожектор прожектора ліхтар ліхтарик lantern flashlight lamp',
};
const dictionary = new Map(Object.entries(itemWords).flatMap(([id, words]) =>
  words.split(' ').map(word => [word, id])));
const fresh = () => ({ item: '', near: false, far: false, crossed: false });
const initialMessage = 'За разломом осталась радиометка. Попроси у экипажа предмет для переправы.';
const itemName = { ramp: 'Трап', rope: 'Трос', lamp: 'Фонарь' };

function restorePosition(input) {
  const item = Object.hasOwn(itemName, input?.item) ? input.item : '';
  const spanning = item === 'ramp' || item === 'rope';
  const near = spanning && input.near === true;
  const far = spanning && input.far === true && (item === 'rope' || near);
  return { item, near, far, crossed: near && far && input.crossed === true };
}

export function resolveRadioItem(text) {
  const words = String(text).normalize('NFKC').toLowerCase().replaceAll('ё', 'е').match(/[\p{L}]+/gu) || [];
  const found = new Set(words.map(word => dictionary.get(word)).filter(Boolean));
  return found.size === 1 ? [...found][0] : found.size > 1 ? 'ambiguous' : '';
}

// No scene mutation until a meaningful action succeeds.
export function radioStep(state, action, phrase = '') {
  const result = (message, next = state) => ({ next, message });
  if (state.crossed) return result('Радиометка уже в сумке. Можно попробовать другой способ переправы.');
  if (action === 'request') {
    const item = resolveRadioItem(phrase);
    if (item === 'ambiguous') return result('В грузовой капсуле одно место. Какой предмет прислать первым?');
    if (!item) return result(phrase.trim()
      ? 'Экипаж не нашёл такой предмет на складе. Уточни название или открой подсказку «Слова экипажа».'
      : 'Рация ждёт название предмета. Его можно напечатать или выбрать в «Словах экипажа».');
    if (state.item === item) return result(itemName[item] + ' уже на площадке.');
    const next = { ...fresh(), item };
    if (item === 'rope') return result('Катушка доставлена. По одному концу троса на каждое кольцо.', next);
    if (item === 'ramp') return result('Трап доставлен. У ближнего края есть шарнир, на дальнем виден упор.', next);
    return result('Фонарь выхватил из тумана два кольца по краям разлома. За них можно что-нибудь зацепить.', next);
  }
  if (action === 'cross') {
    if (state.near && state.far) return result('Дочка на другом берегу. Радиометка у экипажа!', { ...state, crossed: true });
    if (state.item === 'rope')
      return result(state.near || state.far ? 'Один конец троса болтается. Закрепи его на свободном кольце.' : 'Трос ещё в катушке. Закрепи оба конца.');
    if (state.item === 'ramp')
      return result(state.near ? 'Между трапом и дальним берегом ещё просвет. Опусти дальний край.' : 'Трап лежит на платформе. Зафиксируй ближний край.');
    return result(state.item === 'lamp' ? 'В свете фонаря хорошо видна пропасть. Для переправы понадобится другой предмет.' : initialMessage);
  }
  if (action !== 'near' && action !== 'far') return result(initialMessage);
  if (state.item !== 'ramp' && state.item !== 'rope') return result('Рядом с кольцом ничего не закреплено. Сделать запрос можно по рации.');
  if (state[action]) return result('Этот край уже закреплён.');
  if (state.item === 'ramp' && action === 'far' && !state.near)
    return result('Трап скользит. Сначала пристегни ближний край к шарниру.');
  const next = { ...state, [action]: true };
  if (next.near && next.far) return result(state.item === 'rope'
    ? 'Трос натянулся между кольцами. Можно переправляться.'
    : 'Дальний край лёг в упор. Мост готов.', next);
  return result(state.item === 'rope'
    ? (action === 'near' ? 'Левое кольцо щёлкнуло. Свободный конец ждёт справа.' : 'Правое кольцо щёлкнуло. Свободный конец ждёт слева.')
    : 'Ближний край зафиксирован. Трап можно опустить на дальний берег.', next);
}

const rocks = [
  [[0,110],[28,111],[43,106],[67,111],[92,106],[112,108],[132,104],[147,105],[145,117],[138,119],[136,133],[124,131],[118,152],[99,153],[94,161],[0,161]],
  [[256,100],[269,98],[288,100],[300,95],[327,96],[346,92],[379,94],[404,90],[404,160],[294,160],[286,148],[282,133],[272,138],[269,122],[260,120]],
];
const nearRing = [141,87], farRing = [263,78];

function drawScene(canvas, state, progress = state.crossed ? 1 : 0) {
  const c = canvas.getContext('2d');
  if (!c) return;
  const rect = (x,y,w,h,color) => { c.fillStyle=color; c.fillRect(Math.round(x),Math.round(y),w,h); };
  const path = (points, color, width = 0) => {
    c.beginPath(); c.moveTo(...points[0]); for (const p of points.slice(1)) c.lineTo(...p);
    if (width) { c.strokeStyle=color; c.lineWidth=width; c.stroke(); }
    else { c.fillStyle=color; c.closePath(); c.fill(); }
  };
  const glow = (x,y,r,color) => {
    const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,color); g.addColorStop(1,'transparent');
    c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2);
  };
  const sky=c.createLinearGradient(0,0,0,160);
  sky.addColorStop(0,'#181741'); sky.addColorStop(.58,'#645788'); sky.addColorStop(1,'#cb8b9c');
  c.fillStyle=sky; c.fillRect(0,0,400,160);
  for (let i=0; i<41; i++) {
    const x=(i*83+15)%400, y=(i*i*5+6)%92;
    rect(x,y,i%9===0?2:1,1,i%3?'#c1cce3':'#ffe3be');
    if (i%11===0) rect(x,y-1,1,3,'#fff1db');
  }
  c.fillStyle='#e7bcaa'; c.beginPath(); c.arc(308,30,13,0,Math.PI*2); c.fill();
  path([[287,39],[302,35],[318,26],[327,21]],'#b79bbb',2);
  path([[0,91],[31,68],[59,75],[92,52],[114,70],[153,38],[167,68],[188,66],[212,83],[243,67],[272,70],[291,53],[323,72],[352,56],[370,72],[400,64],[400,160],[0,160]],'#514a79');
  path([[0,100],[47,81],[72,86],[95,69],[143,93],[181,75],[209,95],[235,80],[279,103],[313,84],[346,96],[374,81],[400,88],[400,160],[0,160]],'#655b89');
  for (let i=0;i<9;i++) {
    const x=148+(i*17)%108, y=142+(i*13)%16;
    path([[x-3,160],[x-3,y],[x+1,y-8],[x+4,y],[x+3,160]],i%2?'#6b93b6':'#78bec6');
  }
  for (const coords of rocks) {
    path(coords,'#422c4e');
    const top=coords.slice(0,8);
    const back=[...top].reverse().map(([x,y])=>[x,y+5]);
    path([...top,...back],'#d89c77'); path(top,'#ffe4ab',1.6);
  }
  path([[9,117],[32,118],[44,127],[61,127],[50,132],[34,127],[22,126]],'#765070');
  path([[86,119],[124,113],[137,115],[129,120],[110,122],[100,131]],'#885d75');
  path([[272,105],[303,103],[330,100],[322,108],[292,116],[284,126]],'#82596c');
  path([[344,108],[375,102],[393,106],[369,108],[353,115]],'#765070');
  rect(0,144,48,2,'#594266'); rect(366,138,34,2,'#594266');
  // Two docking pillars have the same silhouette and an open centre.
  for (const [i,[x,y]] of [nearRing,farRing].entries()) {
    rect(x-2,y+4,4,14,'#2e2849'); rect(x,y+5,2,13,'#c58a66');
    const attached=i?state.far:state.near;
    if (attached || state.item==='lamp') glow(x,y,12,attached?'#60efcd88':'#ffd08088');
    c.strokeStyle=attached?'#7ef3ce':'#f8d59b'; c.lineWidth=2; c.beginPath(); c.arc(x,y,4,0,Math.PI*2); c.stroke();
  }
  // A radio desk and a gold signal capsule mark the two shores.
  rect(31,101,17,7,'#2e2849'); rect(30,98,18,6,'#82657b'); rect(32,99,8,3,'#75ded4');
  rect(46,90,1,8,'#edc08c'); rect(45,89,3,1,'#ffe8ba');
  if(!state.crossed){
    glow(322,84,13,'#ffda6d66'); rect(318,85,9,8,'#603858'); rect(319,83,7,8,'#ffcb70'); rect(321,84,3,4,'#fff4bb');
  }
  if (state.item==='lamp') {
    path([[110,99],[263,69],[262,91]],'#d9bd8466');
    rect(100,98,10,5,'#3d3046'); rect(108,97,4,6,'#ffe2a3');
  }
  if(state.item==='ramp') {
    // Hinged sections unfold, then rest on the far lip.
    const a=state.near?[139,105]:[98,103];
    const b=state.far?[264,99]:state.near?[191,62]:[124,102];
    const [dx,dy]=[b[0]-a[0],b[1]-a[1]];
    path([[a[0],a[1]+4],[b[0],b[1]+4]],'#4a3343',5);
    path([a,b],'#f4c280',5);
    const steps=Math.max(3,Math.round(Math.hypot(dx,dy)/8));
    for(let i=0;i<=steps;i++) { const x=a[0]+dx*i/steps, y=a[1]+dy*i/steps; path([[x,y-2],[x+1,y+2]],'#ab755e',2); }
  }
  if(state.item==='rope') {
    if(state.near&&state.far){
      c.beginPath(); c.moveTo(...nearRing); c.quadraticCurveTo(204,102,...farRing); c.strokeStyle='#45314d';c.lineWidth=4;c.stroke();
      c.strokeStyle='#ffdc8c';c.lineWidth=2;c.stroke();
    }else if(state.near||state.far){
      const p=state.near?nearRing:farRing, sign=state.near?1:-1;
      path([p,[p[0]+8*sign,p[1]+7],[p[0]+14*sign,p[1]+21],[p[0]+12*sign,p[1]+30]],'#ffd389',2);
    }else{
      c.strokeStyle='#ffd389';c.lineWidth=2;
      for(let i=0;i<3;i++){c.beginPath();c.ellipse(106+i*3,101,5,3,0,0,Math.PI*2);c.stroke();}
    }
  }
  // The visible courier follows the ramp or hangs below the cable.
  const x=78+progress*237;
  let y=109-(x<141?Math.max(0,x-78)/63*3:3+Math.min(1,(x-141)/123)*7);
  const hanging=state.item==='rope' && x>=141 && x<=263 && progress>0 && progress<1;
  if(hanging){ const t=(x-141)/122; const cableY=(1-t)**2*87+2*(1-t)*t*102+t*t*78; y=cableY+20; }
  if(progress>.001 && progress<.999 && !hanging)y-=Math.abs(Math.sin(progress*42))*1.3;
  const px=Math.round(x),py=Math.round(y);
  rect(px-5,py-15,8,11,'#48364c');rect(px-4,py-13,7,7,'#f6dfb4');
  rect(px-4,py-13,7,2,'#f26e71');rect(px-4,py-7,3,6,'#655478');rect(px+1,py-7,3,6,'#5e526f');
  rect(px-5,py-2,4,2,'#27253c');rect(px+1,py-2,5,2,'#27253c');
  rect(px-5,py-21,9,8,'#4f3448');rect(px-3,py-19,8,5,'#f4b88c');rect(px+3,py-18,1,1,'#342b3e');
  rect(px-5,py-21,8,2,'#df586a');rect(px-7,py-19,3,5,'#70485b');rect(px-7,py-20,2,2,'#ffe0d0');
  if(hanging){rect(px-5,py-18,2,6,'#f9dcb1');rect(px+4,py-19,2,7,'#f9dcb1');}
  if(state.crossed){rect(px+4,py-10,4,4,'#fbd47e');}
}

export function mountRadio(root, api) {
  const saved=api.load();
  let position=restorePosition(saved?.state);
  let history=Array.isArray(saved?.history)?saved.history.slice(-12).map(restorePosition):[];
  let frame=0, animating=false;
  const persist=()=>api.save({ version:1, state:position, history });
  root.innerHTML = `<section class="radio-workshop" aria-label="Радиомастерская">
    <div class="radio-viewport"><canvas width="400" height="160" role="img" aria-label="Два берега разлома и радиометка на дальней площадке"></canvas></div>
    <p class="radio-note" data-note></p>
    <form class="radio-request" autocomplete="off"><label>Предмет по рации<input name="phrase" type="text" maxlength="80" placeholder="Мостик, верёвка…" enterkeyhint="send" autocomplete="off"></label><button type="submit">Передать</button></form>
    <details class="radio-words"><summary>Слова экипажа</summary><div><button type="button" data-word="Трап">Трап</button><button type="button" data-word="Трос">Трос</button><button type="button" data-word="Фонарь">Фонарь</button></div></details>
    <div class="radio-instrument"><strong data-item></strong><div class="radio-tools"><button type="button" data-move="near"></button><button type="button" data-move="far"></button><button type="button" data-move="cross">Перейти разлом</button></div></div>
    <div class="radio-reset"><button type="button" data-move="undo">Шаг назад</button><button type="button" data-move="reset">Начать заново</button></div>
  </section>`;
  const form=root.querySelector('form');
  const input=form.elements.namedItem('phrase');
  const canvas=root.querySelector('canvas');
  const note=root.querySelector('[data-note]');
  const find=k=>root.querySelector(`[data-move="${k}"]`);
  function announce(message) { note.textContent=message; api.say(message); }
  function render() {
    const validItem=position.item==='ramp'||position.item==='rope';
    root.querySelector('[data-item]').textContent=position.crossed?'Радиометка получена':(itemName[position.item]||'Пустая площадка');
    for(const side of ['near','far']){
      const button=find(side), near=side==='near';
      button.hidden=!validItem || position.crossed;
      button.disabled=position[side] || animating;
      button.textContent=position.item==='rope'
        ? (near?'Закрепить слева':'Закрепить справа')
        : (near?'Пристегнуть ближний край':'Опустить дальний край');
    }
    find('cross').hidden=position.crossed;
    find('cross').disabled=animating;
    find('undo').disabled=!history.length || animating || position.crossed;
    find('reset').disabled=animating || (!position.item&&!history.length);
    input.disabled=position.crossed||animating;
    form.querySelector('button').disabled=input.disabled;
    for (const button of root.querySelectorAll('[data-word]')) button.disabled=input.disabled;
    canvas.setAttribute('aria-label', position.crossed?'Дочка с радиометкой на дальнем берегу.':
      (position.item==='rope'?'Трос':position.item==='ramp'?'Трап':position.item==='lamp'?'Фонарь освещает кольца':'Два берега разлома')+
      (validItem?`. Левый край ${position.near?'закреплён':'свободен'}, правый край ${position.far?'закреплён':'свободен'}.`:'; радиометка на дальней платформе.'));
    drawScene(canvas,position);
  }
  function apply(next,message) {
    history=[...history,position].slice(-12); position=next; persist(); render(); announce(message);
  }
  function move(kind,phrase='') {
    if(animating) return;
    if(kind==='reset'){position=fresh();history=[];persist();render();announce(initialMessage);return;}
    if(kind==='undo'){
      if(history.length && !position.crossed){position=history.pop();persist();render();announce('Предыдущий ход восстановлен.');}
      return;
    }
    const {next,message}=radioStep(position,kind,phrase);
    if(next===position){announce(message);return;}
    if(kind==='request')input.value='';
    if(kind!=='cross'){apply(next,message);return;}
    const finish=()=>{animating=false;frame=0;apply(next,message);api.win();};
    if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){finish();return;}
    animating=true;render();announce(position.item==='rope'?'Дочка скользит по тросу.':'Дочка переходит по трапу.');
    const start=performance.now();
    const tick=now=>{const t=Math.min(1,Math.max(0,(now-start)/800));drawScene(canvas,position,t);
      if(t<1)frame=requestAnimationFrame(tick);else finish();};
    frame=requestAnimationFrame(tick);
  }
  function onSubmit(e){e.preventDefault();move('request',input.value);}
  function onClick(e){const b=e.target.closest('button');if(!b||b.disabled||!root.contains(b))return;
    if(b.dataset.word){move('request',b.dataset.word);return;}if(b.dataset.move)move(b.dataset.move);}
  form.addEventListener('submit',onSubmit);root.addEventListener('click',onClick);
  render();
  note.textContent=position.crossed?'Дочка вернулась с радиометкой. Можно повторить переправу.':
    position.item?'Доставка на площадке. Продолжай с сохранённого хода.':initialMessage;
  return ()=>{if(frame) cancelAnimationFrame(frame); form.removeEventListener('submit',onSubmit); root.removeEventListener('click',onClick);};
}
