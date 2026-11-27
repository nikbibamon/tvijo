import {heroes,moves} from './catalog.js';
import {layout} from './worlds.js';
import {state,doneFor} from './tvijoService.js';
import {bindFieldPads} from './fieldControls.js';
import {readyTasks} from './strategy.js';
const W=960,H=448,G=1050,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function createField(ui){
  const canvas=document.querySelector('#stage'),c=canvas.getContext('2d'),status=document.querySelector('#field-feedback'),overlay=document.querySelector('#field-overlay'),time=document.querySelector('#window-time');
  const imgs=new Map(),keys=new Set(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let level,route,hero,started=false,paused=false,ended=false,blocking=false,suspended=false,raf,last=0,clock=0,elapsed=0,x=55,y=0,vy=0,grounded=true,target=null,falls=0,shield=false,checkpoint=55,stamp=0,msgTill=0,camera=0,scale=1,camY=0,airGrace=0,face=1,windowShown=false;
  let stride=0, running=false, relay=false, atTerminal=false, touchDirections=[], sparks=new Set(), motes=[];
  const spriteHeight={captain:91,assistant:86,blue:91,son:82,daughter:75,robot:97,plane:67};
  const loadRunner=h=>load('runner-'+h,'./art/runners/'+h+'.webp');
  const sparkSites=()=>[[176,level.floor-32],[337,level.floor-67],[route.goal-62,route.goalY-30]];
  function clearDust(){motes=[];}
  function dust(n){
    if(reduce)return;
    for(let i=0;i<n;i++)motes.push({x:x-face*(6+i*2),y:y-2,vx:-face*(11+i*7),vy:-13-i*6,age:0});
  }
  function load(id,path='./art/'+id+'.webp'){if(imgs.has(id))return;const im=new Image();im.decoding='async';im.src=path;imgs.set(id,im);}
  const props=()=>heroes[hero]||heroes.captain;
  const opened=()=>level.tasks.every(([id])=>doneFor(level.id).includes(id));
  function speak(msg,secs=3.1){status.textContent=msg;msgTill=clock+secs;}
  function clearMovement(){keys.clear();resetPads();target=null;running=false;}
  function spawn(pos=55){x=pos;y=level.floor;vy=0;grounded=true;airGrace=.1;clearMovement();}
  function start(l,h){
    const same=level?.id===l.id&&started&&!ended;
    level=l;hero=h;relay=l.id.startsWith('pair-');route=layout(l);load(l.art);loadRunner(h);['deck','cell','relay','wraith'].forEach(a=>load(a));
    if(!same){stride=0;face=1;atTerminal=false;sparks=new Set(relay?[]:state.stages[l.id]?.sparks||[]);clearDust();clock=0;elapsed=0;ended=false;blocking=false;falls=0;checkpoint=55;shield=!!props().shield;windowShown=false;status.textContent='';spawn();}started=true;paused=false;last=0;overlay.hidden=true;run();draw();
  }
  function leave(){clearMovement();paused=true;if(raf)cancelAnimationFrame(raf);raf=0;}
  function suspend(v){suspended=v;clearMovement();last=0;if(!v)run();}
  function run(){if(!raf&&started&&!paused&&!ended&&!suspended)raf=requestAnimationFrame(tick);}
  function pause(){if(ended||!started||blocking)return;if(paused){paused=false;overlay.hidden=true;last=0;run();return;}
    paused=true;clearMovement();if(raf)cancelAnimationFrame(raf);raf=0;ui.pauseMenu(resume,warp);}
  function resume(){if(ended)return;paused=false;overlay.hidden=true;last=0;run();canvas.focus({preventScroll:true});}
  function warp(){spawn(Math.max(55,route.gate-45));checkpoint=x;speak('Телепорт к реле выполнен.');resume();}
  function fall(){falls++;if(!relay)ui.fell(falls);if(shield){shield=false;checkpoint=Math.max(55,Math.floor(x-35));if(route.jumpGap&&checkpoint>route.jumpGap[0]-12&&checkpoint<route.jumpGap[1])checkpoint=route.jumpGap[0]-20;speak('Стабилизатор Робота удержал позицию.');}
    else speak(falls>=2?'Контрольная точка. Коснись капсулы — герой сам подберёт момент для прыжка.':'Возврат на контрольную точку · бесплатно');spawn(checkpoint);stamp=clock;}
  function jump(){if(!paused&&!ended&&!suspended&&started&&(grounded||airGrace>0)){vy=-(props().jump||430);grounded=false;airGrace=0;}}
  async function collect(){
    if(!started||ended||paused||suspended||blocking)return;
    if(!opened()){const n=readyTasks(level,doneFor())[0];speak(n?'Сначала дай приказ: '+moves[n].name.toLowerCase()+'.':'Экипаж ещё в пути.');return;}
    if(Math.abs(x-route.goal)>(props().reach||44)||Math.abs(y-route.goalY)>(props().reach?53:40)){speak('Подойди к капсуле и прыгни. Можно коснуться её на карте.');return;}
    if(relay){if(atTerminal)return;atTerminal=true;clearMovement();ui.relayTerminal();return;}
    blocking=true;clearMovement();const orig=level.id;
    try{if(await ui.won(orig)){ended=true;ui.finish(level);}else speak('Проверь задания экипажа.');}finally{blocking=false;}
  }
  function use(){if(paused||suspended||ended)return;const reach=props().reach||50;
    if(Math.abs(x-route.goal)<reach+10){atTerminal=false;collect();return;}
    if(relay){autoGoal();speak('Иду к посту. На последней платформе включится терминал.');return;}
    if(!opened()){const n=readyTasks(level,doneFor())[0];if(n)ui.orderHint(moves[n].example);speak('Приказ можно уточнить в рации.');}else{autoGoal();speak('Иду к капсуле.');}}
  function step(dt){
    clock+=dt;elapsed+=dt;if(status.textContent&&clock>msgTill)status.textContent='';
    const limit=60+(props().time||0),left=Math.max(0,Math.ceil(limit-elapsed));const display=left?'Окно связи · '+left+' с':'Резервный канал';const clockLabel=relay?'Связь между постами':display;if(time.textContent!==clockLabel)time.textContent=clockLabel;
    if(!relay&&!left&&!windowShown){windowShown=true;speak('Окно закрылось. Экипаж перешёл на резервный канал, миссия продолжается.');}
    const active=opened(),px=x,py=y;
    const held=k=>keys.has(k)||touchDirections.includes(k);let direction=Number(held('right'))-Number(held('left'));
    if(!direction&&target!==null){
      if(Math.abs(x-target)<3)target=null;else direction=Math.sign(target-x);
      if(grounded&&direction>0&&target!==null&&route.jumpGap&&x>=route.jumpGap[0]-48&&x<route.jumpGap[0]-4&&target>route.jumpGap[1])jump();
      if(grounded&&direction>0&&target!==null&&route.ledges.some(([a,b,top])=>target>=a&&x>a-72&&x<b-22&&top<y-6))jump();
    }
    if(direction)face=direction;x=clamp(x+direction*220*dt,15,W-15);
    if(!active&&x>route.gate-12){x=route.gate-12;target=null;if(clock-stamp>2){stamp=clock;const id=readyTasks(level,doneFor())[0];speak(id?'Преграда активна. '+moves[id].example:'Проверь задачу экипажа.');}}
    vy+=G*(props().glide&&vy>0?.74:1)*dt;y+=vy*dt;const oldGround=grounded;grounded=false;
    const platforms=[...route.ground,...route.ledges];if(active&&level.id==='dock')platforms.push([408,458,level.floor-32]);if(active&&route.gap)platforms.push([route.gap[0]-4,route.gap[1]+4,level.floor]);
    if(vy>=0){let top=Infinity;for(const [a,b,t] of platforms)if(x>=a&&x<=b&&py<=t+1&&y>=t)top=Math.min(top,t);
      if(Number.isFinite(top)){y=top;vy=0;grounded=true;airGrace=.1;}}
    running=grounded&&Math.abs(x-px)>.002;
    if(running){const prev=Math.floor(stride/20);stride+=Math.abs(x-px);if(Math.floor(stride/20)!==prev)dust(1);}
    if(grounded&&!oldGround)dust(4);
    for(const p of motes){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=75*dt;}motes=motes.filter(p=>p.age<.32);
    if(!relay)sparkSites().forEach(([sx,sy],i)=>{
      if(!sparks.has(i)&&Math.abs(x-sx)<23&&Math.abs(y-30-sy)<35){sparks.add(i);ui.spark(level.id,i);speak('Искра найдена · '+sparks.size+' / 3',1.4);}
    });
    if(Math.abs(x-route.goal)>54)atTerminal=false;
    if(!grounded){if(oldGround&&vy>0)airGrace=.09;else airGrace=Math.max(0,airGrace-dt);}
    if(active&&x>route.gate+32&&grounded&&Math.abs(y-level.floor)<2&&!route.gap)checkpoint=clamp(Math.round(x-30),55,route.goal-140);
    if(route.shadow&&active&&clock-stamp>1.8&&Math.abs(x-(590+48*Math.sin(clock*.9)))<23&&y>level.floor-23){
      if(target!==null&&px<x){vy=-420;grounded=false;}else {fall();return;}}
    if(y>H+44){fall();return;}
    if(active&&Math.abs(x-route.goal)<25&&Math.abs(y-route.goalY)<27)collect();
  }
  function sprite(key,cx,base,h,w=null){const im=imgs.get(key);if(!im?.complete||!im.naturalWidth)return;const width=w||h*im.naturalWidth/im.naturalHeight;c.drawImage(im,cx-width/2,base-h,width,h);}
  function deck(a,b,y){const n=Math.ceil((b-a)/100);for(let i=0;i<n;i++)sprite('deck',a+(i+.5)*(b-a)/n,y+11,14,(b-a)/n+1);}
  function draw(){
    if(!started||!canvas.clientWidth)return;const ratio=Math.min(2,devicePixelRatio||1),sw=canvas.clientWidth,sh=canvas.clientHeight;
    if(Math.abs(canvas.width-sw*ratio)>1||Math.abs(canvas.height-sh*ratio)>1){canvas.width=Math.round(sw*ratio);canvas.height=Math.round(sh*ratio);}
    c.setTransform(canvas.width/sw,0,0,canvas.height/sh,0,0);c.clearRect(0,0,sw,sh);scale=Math.max(sw/W,sh/H);
    camera=clamp(x-sw/scale*.37,0,Math.max(0,W-sw/scale));camY=Math.max(0,(H-sh/scale)*.57);c.scale(scale,scale);c.translate(-camera,-camY);
    const bg=imgs.get(level.art);if(bg?.complete&&bg.naturalWidth)c.drawImage(bg,0,0,W,H);
    const active=opened(),b=reduce?0:Math.sin(clock*3)*2,g=level.floor;
    if(route.jumpGap){const [a,bx]=route.jumpGap;const pit=c.createLinearGradient(0,g-1,0,H);pit.addColorStop(0,'#322039');pit.addColorStop(.55,'#21182e');pit.addColorStop(1,level.theme==='lava'?'#df804c':'#7253ae');c.fillStyle=pit;c.fillRect(a,g-2,bx-a,H-g+2);c.strokeStyle='#d6a6e8';c.lineWidth=2;c.strokeRect(a+1,g-1,bx-a-2,4);}
    for(const [a,z,t] of route.ledges)deck(a,z,t);if(route.gap&&active)deck(route.gap[0]-4,route.gap[1]+4,g);if(active&&level.id==='dock')deck(408,458,g-32);
    if(!active){const gate=route.gate;const beam=c.createLinearGradient(gate-9,0,gate+9,0);beam.addColorStop(0,'#b283fc00');beam.addColorStop(.5,'#edd1ffdc');beam.addColorStop(1,'#b283fc00');c.fillStyle=beam;c.fillRect(gate-9,g-116,18,116);sprite('relay',gate-14,g+1,30);}
    if(route.shadow&&active)sprite('wraith',590+48*Math.sin(clock*.9),g-2+b,49);
    const glow=c.createRadialGradient(route.goal,route.goalY-18,1,route.goal,route.goalY-18,32);glow.addColorStop(0,'#ffe599a0');glow.addColorStop(1,'#ffe59900');c.fillStyle=glow;c.fillRect(route.goal-35,route.goalY-55,70,70);sprite(relay?'relay':'cell',route.goal,route.goalY+(relay?0:b),relay?56:37);
    if(props().glide||props().scan){c.strokeStyle='#94ffdb';c.lineWidth=2;c.beginPath();c.ellipse(route.goal,route.goalY,26,5,0,0,Math.PI*2);c.stroke();}
    if(!relay)sparkSites().forEach(([sx,sy],i)=>{
      if(sparks.has(i))return;const yy=sy+(reduce?0:Math.sin(clock*3+i)*3);
      c.save();c.translate(sx,yy);c.fillStyle='#402837';c.beginPath();c.moveTo(0,-9);c.lineTo(7,0);c.lineTo(0,9);c.lineTo(-7,0);c.closePath();c.fill();
      c.fillStyle='#ffd77c';c.beginPath();c.moveTo(0,-7);c.lineTo(5,0);c.lineTo(0,7);c.lineTo(-5,0);c.closePath();c.fill();c.fillStyle='#fff4cf';c.fillRect(-1,-4,2,4);c.restore();
    });
    const shelf=[...route.ground,...route.ledges].filter(([a,z,t])=>x>=a&&x<=z&&t>=y-1).map(p=>p[2]);
    if(active&&route.gap&&x>route.gap[0]&&x<route.gap[1])shelf.push(g);
    if(shelf.length){const floor=Math.min(...shelf),radius=Math.max(7,19-(floor-y)*.08);c.fillStyle='#27182f77';c.beginPath();c.ellipse(x,floor+1,radius,3.5,0,0,Math.PI*2);c.fill();}
    for(const p of motes){c.fillStyle='rgba(255,222,163,'+(.6-p.age*1.8)+')';c.fillRect(p.x,p.y,3,2);}
    const atlas=imgs.get('runner-'+hero);
    if(atlas?.complete&&atlas.naturalWidth){const frame=!grounded?3:running?1+Math.floor(stride/20)%2:0;
      const h=spriteHeight[hero];c.save();c.translate(x,y);c.scale(face,1);c.imageSmoothingEnabled=false;
      c.drawImage(atlas,frame*128,0,128,128,-h/2,-h*122/128,h,h);c.restore();}

  }
  function tick(t){raf=0;if(paused||ended||suspended||!started)return;let dt=Math.min(.4,(t-(last||t))/1000);last=t;while(dt>0.00001&&!blocking&&!ended){const d=Math.min(dt,1/90);step(d);dt-=d;}draw();run();}
  function key(e,down){
    if(!started||document.querySelector('#field').hidden||document.querySelector('dialog[open]')||e.target.closest?.('input,textarea,select')||e.altKey||e.ctrlKey||e.metaKey)return;
    if(e.code==='Escape'&&down&&!e.repeat){pause();return;}
    const names={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyE:'use'};const move=names[e.code];
    if(!move||paused||ended||suspended||e.code==='Space'&&e.target.closest?.('button'))return;e.preventDefault();
    if(move==='left'||move==='right'){if(down){keys.add(move);target=null;}else keys.delete(move);}else if(down&&!e.repeat){if(move==='jump')jump();else use();}
  }
  window.addEventListener('keydown',e=>key(e,true));window.addEventListener('keyup',e=>key(e,false));window.addEventListener('blur',clearMovement);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused&&!ended&&started&&!document.querySelector('#field').hidden)pause();});
  const resetPads=bindFieldPads({movement:dirs=>{touchDirections=dirs;if(dirs.length)target=null;},jump,use});
  function autoGoal(){if(!started||ended||paused||suspended)return;target=route.goal;if(relay&&Math.abs(x-route.goal)<35){atTerminal=false;collect();}}
  canvas.onpointerdown=e=>{if(ended||paused||suspended)return;canvas.focus({preventScroll:true});const r=canvas.getBoundingClientRect();const dest=clamp(camera+(e.clientX-r.left)/scale,16,W-16);const yy=camY+(e.clientY-r.top)/scale;if(Math.abs(dest-x)<80&&yy<y-20)jump();target=Math.abs(dest-route.goal)<50?route.goal:dest;};
  document.querySelector('#pause').onclick=pause;document.querySelector('#field-target').onclick=autoGoal;
  new ResizeObserver(draw).observe(canvas);return {start,leave,suspend,draw,resume,warp,forget(){started=false;leave();},get active(){return started&&!ended;},setHero(h){hero=h;loadRunner(h);}};
}
