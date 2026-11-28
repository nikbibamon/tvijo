import {angles, capsulePoint, forecast, strengths} from './post.js';
import {ports, power} from './wire.js';

export function element(tag, name, content) {
  const node = document.createElement(tag);
  if (name) node.className = name;
  if (content) node.textContent = content;
  return node;
}

export function button(text, key, onClick, name='pg-button') {
  const control = element('button', name, text);
  control.type = 'button';
  control.dataset.control = key;
  control.onclick = onClick;
  return control;
}

function grid(layout, name) {
  const board = element('div', 'pg-grid '+name);
  board.style.setProperty('--cols',layout.width);
  board.style.setProperty('--rows',layout.height);
  return board;
}

function iceBoard(layout, state, respond, motion) {
  const board = grid(layout,'pg-ice');
  board.setAttribute('role','img');
  const x = state.position % layout.width, y = Math.floor(state.position/layout.width);
  const targetX = layout.goal % layout.width, targetY = Math.floor(layout.goal/layout.width);
  board.setAttribute('aria-label','Самолётик: ряд '+(y+1)+', столбец '+(x+1)+'. Маяк: ряд '+(targetY+1)+', столбец '+(targetX+1)+'.');
  for (let index=0; index<layout.width*layout.height; index++) {
    const cell = element('div','pg-cell');
    cell.dataset.cell = index;
    if (layout.walls.includes(index)) cell.classList.add('wall');
    if (layout.goal===index) cell.append(element('span','pg-beacon'));
    board.append(cell);
  }
  const actor = element('span','pg-sprite plane pg-ice-token');
  actor.style.left = (x+.5)*100/layout.width+'%';
  actor.style.top = (y+.5)*100/layout.height+'%';
  board.append(actor);
  if (motion && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const fromX = motion.from % layout.width, fromY = Math.floor(motion.from/layout.width);
    const dx = (fromX-x)*100/layout.width+'%', dy = (fromY-y)*100/layout.height+'%';
    actor.animate([{left:`calc(${actor.style.left} + ${dx})`,top:`calc(${actor.style.top} + ${dy})`},
      {left:actor.style.left,top:actor.style.top}],{duration:250,easing:'ease-out'});
  }
  board.onclick = event=>{
    const tile=event.target.closest('[data-cell]');
    if (!tile) return;
    const cell=Number(tile.dataset.cell);
    const col=cell%layout.width, row=Math.floor(cell/layout.width);
    if (row===y && col!==x) respond(col>x?'right':'left');
    if (col===x && row!==y) respond(row>y?'down':'up');
  };
  return board;
}

function wireBoard(layout, state, respond) {
  const board = grid(layout,'pg-wire');
  const {masks,lit,won} = power(layout,state.rotations);
  for (const [index, mask] of masks.entries()) {
    if (!mask) {
      board.append(element('span','pg-cell pg-blank'));
      continue;
    }
    const node = button('', index, ()=>respond(index), 'pg-cell pg-module');
    const point = [Math.floor(index/layout.width)+1,index%layout.width+1].join(', ');
    const connectors = ports.filter((_,i)=>mask&(1<<i)).join(', ');
    const terminal = index===layout.inlet ? 'Источник. ' : index===layout.outlet ? 'Лампа. ' : '';
    node.setAttribute('aria-label',terminal+'Модуль '+point+'. Контакты '+connectors+'.');
    node.classList.toggle('lit',lit.has(index));
    for (const [port] of ports.entries()) {
      if (mask & (1<<port)) node.append(element('i','pg-segment p'+port));
    }
    node.append(element('i','pg-pin'));
    if (index===layout.inlet || index===layout.outlet) {
      const mark = element('span','pg-terminal',index===layout.inlet?'+':'●');
      mark.classList.toggle('on',index===layout.inlet||won);
      mark.setAttribute('aria-hidden','true');
      node.append(mark);
    }
    board.append(node);
  }
  return board;
}

function drawPost(canvas, layout, state, progress) {
  const ctx=canvas.getContext('2d');
  ctx.setTransform(canvas.width/100,0,0,canvas.height/100,0,0);
  ctx.clearRect(0,0,100,100);
  ctx.fillStyle='#3a425e';
  ctx.fillRect(4,77,92,1.25);
  ctx.fillStyle='#73d6d2';
  ctx.fillRect(6,77,13,2.2);
  ctx.fillStyle='#ffcb79';
  ctx.fillRect(layout.target-layout.radius,76,2*layout.radius,3);
  ctx.fillStyle='#64442c';
  ctx.fillRect(layout.target-layout.radius,80,2*layout.radius,2.3);
  if (layout.beam) {
    const {x,y}=layout.beam;
    ctx.fillStyle='#db8694';
    ctx.fillRect(x-1,y,2,77-y);
    ctx.fillStyle='#ffa9a1';
    ctx.fillRect(x-1.7,y,3.4,1.5);
  }
  const travel=forecast(layout,state.angle,state.force);
  for (let sample=.04; sample<=travel.progress; sample+=.045) {
    const {x,y}=capsulePoint(state.angle,state.force,sample);
    ctx.fillStyle=travel.result==='dock'?'#91edcf':'#b4a6d4';
    ctx.fillRect(x-.33,y-.45,.66,.9);
  }
  const point=capsulePoint(state.angle,state.force,progress);
  ctx.fillStyle='#b66e43';
  ctx.fillRect(point.x-2.1,point.y-2.6,4.2,5.2);
  ctx.fillStyle='#ffcea2';
  ctx.fillRect(point.x-1.4,point.y-2.0,2.8,3.6);
  ctx.fillStyle='#fff0c0';
  ctx.fillRect(point.x-1.0,point.y-1.55,1.2,1.1);
}

function postBoard(layout,state,motion) {
  const board=element('div','pg-flight');
  const canvas=element('canvas');
  canvas.width=720;
  canvas.height=410;
  const reply=forecast(layout,state.angle,state.force);
  canvas.setAttribute('aria-label','Траектория капсулы. '+{
    short:'Прогноз: до приёмника не долетит.',long:'Прогноз: перелетит площадку.',
    beam:'Прогноз: заденет опору.',dock:'Прогноз: попадёт на площадку.'
  }[reply.result]);
  canvas.setAttribute('role','img');
  const actor=element('span','pg-sprite robot');
  actor.setAttribute('aria-hidden','true');
  board.append(canvas,actor);
  const end=state.last?.progress??0;
  if (!motion || matchMedia('(prefers-reduced-motion: reduce)').matches) drawPost(canvas,layout,state,end);
  else {
    drawPost(canvas,layout,state,0);
    const start=performance.now();
    const animate=time=>{
      if (!canvas.isConnected) return;
      const progress=Math.min(1,(time-start)/560);
      drawPost(canvas,layout,state,progress*end);
      if (progress<1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
  return board;
}

export function showBoard(id, layout, state, respond, motion) {
  if (id==='ice') return iceBoard(layout,state,respond,motion);
  if (id==='wire') return wireBoard(layout,state,respond);
  return postBoard(layout,state,motion);
}

const dpad = [
  ['up','↑','Вверх'],['left','←','Влево'],['down','↓','Вниз'],['right','→','Вправо']
];

export function showControls(id, layout, state, respond) {
  const root=element('div','pg-device');
  if (id==='ice') {
    const pad=element('div','pg-pad');
    for (const [direction,icon,label] of dpad) {
      const key=button(icon,direction,()=>respond(direction));
      key.setAttribute('aria-label',label);
      pad.append(key);
    }
    root.append(pad);
  }
  if (id==='post') {
    const choices=(label,setting,values,options)=>{
      const group=element('fieldset','pg-choice');
      group.append(element('legend','',label));
      for (const value of options) {
        const key=button(values[value],setting+'-'+value,()=>respond({setting,value}));
        key.setAttribute('aria-pressed',String(state[setting]===value));
        group.append(key);
      }
      return group;
    };
    if (layout.angles.length>1) root.append(choices('Дуга','angle',angles,layout.angles));
    root.append(choices('Сила','force',strengths,[0,1,2]));
    root.append(button('Бросить капсулу','throw',()=>respond('throw'),'pg-button primary'));
  }
  return root;
}
