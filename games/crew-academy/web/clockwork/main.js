import {boardFor,byRoom,canVisit,demoPrice,elevation,height,materials,rooms,route,stockFor,width} from './game.js';
import {canvasSize,paint,point,tileAt} from './scene.js';
import {strings} from './text.js';
import * as localStore from './local-store.js';

const isSite=document.documentElement.dataset.edition==='site';
const store=isSite?await import('./site-store.js'):localStore;
const lang=isSite&&new URLSearchParams(location.search).get('lang')!=='en'?'ru':'en';
const t=strings(lang);
const el=id=>document.getElementById('cw-'+id);
const canvas=el('canvas'),ctx=canvas.getContext('2d'),marker=el('marker'),actionButton=el('action');
const media=matchMedia('(prefers-reduced-motion: reduce)');
let game=store.read(),selected=byRoom[game.room].guide,material=0,mode='place',busy=false,arrived=game.wins.includes(game.room),line='';
let frameId=0;

const labels={
  series:t.series,title:t.title,place:t.place,remove:t.remove,hint:t.hint,undo:t.undo,reset:t.reset,
  finished:t.finished,ending:t.ending,close:t.close
};
for (const [id,label] of Object.entries(labels)) el(id).textContent=label;
document.title=t.title+' · '+t.series;
document.documentElement.lang=lang;
canvas.setAttribute('aria-label',t.boardHelp);
el('movie').setAttribute('aria-labelledby','cw-finished');
el('materials').setAttribute('aria-label',t.choose);
el('levels').setAttribute('aria-label',t.levels);

function button(text,click) {
  const control=document.createElement('button');
  control.type='button';control.textContent=text;control.onclick=click;
  return control;
}

if (isSite) {
  el('purchase').setAttribute('aria-labelledby','cw-credit-title');
  for(const [id,label] of Object.entries({'credit-title':t.creditTitle,'credit-body':t.creditBody,confirm:t.proceed,cancel:t.cancel,credit:t.credits})) el(id).textContent=label;
  const back=document.createElement('a');
  back.href='./chronicles.html';back.textContent=t.chronicles;
  const language=document.createElement('a');
  language.href=lang==='ru'?'?lang=en':'./clockwork.html';
  language.textContent=lang==='ru'?'English':'Русский';
  el('site-nav').append(back,language);
}

function chooseRoom(id) {
  return dispatch({type:'visit',id});
}

function resetCursor() {
  selected=byRoom[game.room].guide;
  mode='place'; material=0;
  arrived=game.wins.includes(game.room);
}

function render() {
  const room=byRoom[game.room],board=boardFor(game);
  const studio=room.id==='studio',ready=route(room,board.stacks);
  const nextRoom=rooms[rooms.indexOf(room)+1];
  const [title,objective]=t.rooms[room.id];
  const finished=arrived&&!studio&&Boolean(ready);
  const remaining=stockFor(room,board.stacks);
  if (!remaining[material]&&remaining.some(n=>n>0)) material=remaining.findIndex(n=>n>0);
  el('room').textContent=title;
  el('state').textContent=finished?t.completed:studio?t.design:ready?t.ready:t.blocked;
  el('state').classList.toggle('cw-lit',Boolean(finished||ready||studio));
  el('objective').textContent=objective;
  el('feedback').textContent=line;
  el('materials').replaceChildren(...materials.map((name,i)=>{
    const block=button(t[name]+' · '+remaining[i],()=>{material=i;mode='place';render();el('materials').children[i].focus();});
    block.dataset.material=name;block.disabled=busy||!room.stock[i];
    block.setAttribute('aria-pressed',String(i===material));
    return block;
  }));
  for(const key of ['place','remove']){
    el(key).setAttribute('aria-pressed',String(mode===key));
    el(key).disabled=busy;
  }
  el('undo').disabled=busy||!board.history.length;
  el('hint').disabled=busy;
  el('reset').hidden=!studio;
  el('reset').disabled=busy||!board.stacks.some(c=>c.length);
  if(isSite){
    el('credit').hidden=Boolean(game.access)||room.id!=='gap';
    el('credit').disabled=busy;
  }
  actionButton.disabled=busy;
  actionButton.textContent=finished?(room.id==='relay'?t.film:t.next):ready?t.walk:t[mode+'Block'];
  actionButton.onclick=finished?
    (room.id==='relay'?()=>el('movie').showModal():()=>void chooseRoom(nextRoom.id)):
    ready?()=>void dispatch({type:'walk'}):useTool;
  const tile=point(selected,elevation(room,board.stacks,selected));
  marker.style.left=tile.x/canvasSize.width*100+'%';
  marker.style.top=tile.y/canvasSize.height*100+'%';
  marker.disabled=busy;
  marker.classList.toggle('cw-prompt',room.id==='gap'&&!ready&&!finished&&selected===room.guide);
  marker.textContent=room.id==='gap'&&!ready&&!finished&&selected===room.guide?'+':'';
  marker.setAttribute('aria-label',t.selected+' · '+(selected%width+1)+', '+(Math.floor(selected/width)+1));
  paint(ctx,room,board,selected,ready,finished?point(room.end,elevation(room,board.stacks,room.end)):null,finished);
  el('levels').replaceChildren(...rooms.map(level=>{
    const b=button(t.rooms[level.id][0],()=>void chooseRoom(level.id));
    b.disabled=busy||!canVisit(game,level.id);
    b.setAttribute('aria-pressed',String(game.room===level.id));
    return b;
  }));
}

function useTool() {
  void dispatch({type:mode,index:selected,material});
}

function animate(path) {
  if (media.matches) return Promise.resolve();
  const room=byRoom[game.room],board=boardFor(game),start=performance.now(),interval=74;
  const points=path.map(i=>point(i,elevation(room,board.stacks,i)));
  return new Promise(resolve=>{
    function tick(now) {
      const n=Math.min(points.length-1,(now-start)/interval);
      const a=points[Math.floor(n)],b=points[Math.ceil(n)],d=n%1;
      paint(ctx,room,board,selected,path,{x:a.x+(b.x-a.x)*d,y:a.y+(b.y-a.y)*d-Math.sin(d*Math.PI)*7},n===points.length-1);
      if(n<points.length-1) frameId=requestAnimationFrame(tick);
      else {frameId=0;resolve();}
    }
    frameId=requestAnimationFrame(tick);
  });
}

async function dispatch(input) {
  if (busy) return;
  busy=true;
  const previous=game.room;
  try {
    const result=await store.update({room:previous,...input});
    game=result.game;
    line=t[result.status]??'';
    if (previous!==game.room) resetCursor();
    if (result.path) {render();await animate(result.path);arrived=true;}
    else if (['place','remove','undo','reset'].includes(input.type)) arrived=false;
  } catch {line=t.unavailable;}
  finally {busy=false;render();}
}

canvas.onpointerup=event=>{
  if (busy) return;
  const box=canvas.getBoundingClientRect(),room=byRoom[game.room];
  const target=tileAt((event.clientX-box.left)*canvasSize.width/box.width,
    (event.clientY-box.top)*canvasSize.height/box.height,room,boardFor(game).stacks);
  if (target!==null){selected=target;useTool();}
};
canvas.onkeydown=event=>{
  if(busy||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='Enter'||event.key===' '){event.preventDefault();useTool();return;}
  const offsets={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(!Object.hasOwn(offsets,event.key))return;
  const [dx,dz]=offsets[event.key],x=selected%width+dx,z=Math.floor(selected/width)+dz;
  event.preventDefault();
  if(x<0||x>=width||z<0||z>=height)return;
  selected=z*width+x;render();
};
marker.onclick=useTool;
el('place').onclick=()=>{mode='place';render();};
el('remove').onclick=()=>{mode='remove';render();};
el('undo').onclick=()=>void dispatch({type:'undo'});
el('reset').onclick=()=>void dispatch({type:'reset'});
el('hint').onclick=()=>{line=t.rooms[game.room][2];render();};
if(isSite){
  el('credit').onclick=()=>{
    const balance=store.balance();
    el('credit-balance').textContent=t.creditBalance+' · '+balance;
    el('confirm').disabled=balance<demoPrice;
    el('purchase').showModal();
  };
  el('confirm').onclick=()=>{el('purchase').close();void dispatch({type:'credits'});};
}
store.subscribe(()=>{
  if(busy)return;
  const prior=game.room;
  game=store.read();
  if(prior!==game.room)resetCursor();
  render();
});
window.addEventListener('pagehide',event=>{if(!event.persisted)cancelAnimationFrame(frameId);});

render();
el('game').hidden=false;el('levels').hidden=false;
el('game').dataset.interactiveMs=String(Math.round(performance.now()));
