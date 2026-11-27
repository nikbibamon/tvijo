import {heroes,moves} from './catalog.js';
import {layout} from './worlds.js';
import {state,doneFor} from './tvijoService.js';
import {bindFieldPads} from './fieldControls.js';
import {companionsFor,drawBackdrop} from './sceneArt.js';
import {readyTasks} from './strategy.js';
const W=960,H=448,G=1050,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function createField(ui){
  const canvas=document.querySelector('#stage'),c=canvas.getContext('2d'),status=document.querySelector('#field-feedback'),overlay=document.querySelector('#field-overlay'),time=document.querySelector('#window-time');
  const imgs=new Map(),keys=new Set(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let level,route,hero,started=false,paused=false,ended=false,blocking=false,suspended=false,raf,last=0,clock=0,elapsed=0,x=55,y=0,vy=0,grounded=true,target=null,falls=0,shield=false,checkpoint=55,stamp=0,msgTill=0,camera=0,scale=1,camY=0,airGrace=0,jumpBuffer=0,face=1,windowShown=false;
  let stride=0, running=false, relay=false, atTerminal=false, touchDirections=[], sparks=new Set(), motes=[];
  let outing=0,issuing=null,courier=0,pilot=false,nextOrder=0,team=[];
  const pilotButton=document.querySelector('#pilot-toggle'),pilotCaption=document.querySelector('#pilot-toggle span');
  function setPilot(on){
    pilot=on;
    pilotButton.hidden=relay;const label=on?'Стоп':'Автопилот';
    pilotCaption.textContent=label;pilotButton.setAttribute?.('aria-label',on?'Остановить автопилот':'Автопилот');pilotButton.title=relay?'К парному посту':on?'Взять управление на себя':'Экипаж сам выполнит поручения и заберёт капсулу';
    pilotButton.setAttribute?.('aria-pressed',String(on));
    pilotButton.classList.toggle?.('pilot-on',on);
  }
  function stopPilot(){if(pilot){setPilot(false);target=null;}}
  function shadowAwake(){
    if(!route.shadow)return false;
    const done=doneFor(level.id);
    return !(done.includes('rescue')||level.id==='mine'&&done.includes('compare'));
  }
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
  function clearMovement(){keys.clear();resetPads();target=null;running=false;jumpBuffer=0;}
  function spawn(pos=55){courier=0;x=pos;y=level.floor;vy=0;grounded=true;airGrace=.1;clearMovement();}
  function start(l,h){
    const same=level?.id===l.id&&started&&!ended;
    level=l;hero=h;relay=l.id.startsWith('pair-');route=layout(l);load(l.art);loadRunner(h);team=companionsFor(l);for(const member of team)loadRunner(member);['deck','cell','relay','wraith'].forEach(a=>load(a));
    if(!same){outing++;issuing=null;courier=0;setPilot(false);nextOrder=0;stride=0;face=1;atTerminal=false;sparks=new Set(relay?[]:state.stages[l.id]?.sparks||[]);clearDust();clock=0;elapsed=0;ended=false;blocking=false;falls=0;checkpoint=55;shield=!!props().shield;windowShown=false;status.textContent='';spawn();}started=true;paused=false;last=0;overlay.hidden=true;run();draw();
  }
  function leave(){outing++;issuing=null;courier=0;setPilot(false);blocking=false;clearMovement();paused=true;if(raf)cancelAnimationFrame(raf);raf=0;}
  function suspend(v){suspended=v;clearMovement();last=0;if(!v){if(pilot&&route)target=route.goal;run();}}
  function run(){if(!raf&&started&&!paused&&!ended&&!suspended)raf=requestAnimationFrame(tick);}
  function pause(){if(ended||!started||blocking)return;if(paused){paused=false;overlay.hidden=true;last=0;run();return;}
    paused=true;clearMovement();if(raf)cancelAnimationFrame(raf);raf=0;ui.pauseMenu(resume,warp);}
  function resume(){if(ended)return;paused=false;overlay.hidden=true;last=0;run();canvas.focus({preventScroll:true});}
  function warp(){spawn(Math.max(55,route.gate-45));checkpoint=x;speak('Телепорт к реле выполнен.');resume();}
  function fall(){falls++;if(!relay)ui.fell(falls);if(shield){shield=false;checkpoint=Math.max(55,Math.floor(x-35));for(const gap of [route.jumpGap,opened()?null:route.gap])if(gap&&checkpoint>gap[0]-12&&checkpoint<gap[1])checkpoint=gap[0]-20;speak('Стабилизатор Робота удержал позицию.');}
    else speak(falls>=2?'Контрольная точка. Коснись капсулы — герой сам подберёт момент для прыжка.':'Возврат на контрольную точку · бесплатно');spawn(checkpoint);stamp=clock;}
  function launchJump(){
    vy=-(props().jump||430);grounded=false;airGrace=0;jumpBuffer=0;
  }
  function jump(){
    if(paused||ended||suspended||!started||blocking)return;
    if(grounded||airGrace>0)launchJump();else jumpBuffer=.14;
  }
  // Contact is measured against the runner and the capsule, both anchored at their feet.
  function touchingGoal(manual=false){
    const reach=manual?(props().reach||44):(props().reach?35:26);
    const base=route.goalY,head=y-spriteHeight[hero]*.78;
    return Math.abs(x-route.goal)<=reach&&head<=base+3&&y>=base-(relay?56:37)-5&&
      (y<=base+(manual?36:23)||!grounded&&y<=base+36);
  }
  async function collect(manual=false,delivered=false){
    if(!started||ended||paused||suspended||blocking||!opened()||!(delivered||touchingGoal(manual)))return false;
    if(relay){if(atTerminal)return false;atTerminal=true;clearMovement();ui.relayTerminal();return true;}
    blocking=true;clearMovement();const ticket=outing,l=level;
    try{
      if(await ui.won(l.id)&&ticket===outing){ended=true;setPilot(false);ui.finish(l);}
    }finally{if(ticket===outing)blocking=false;}
    return true;
  }
  async function issue(id,automatic=false){
    if(!started||paused||suspended||ended||blocking||issuing||relay)return;
    if(!readyTasks(level,doneFor(level.id)).includes(id))return;
    const ticket=outing;issuing=id;
    try{
      const result=await ui.order(level.id,id,automatic);
      if(ticket!==outing||!result||result.discarded||ended||paused||suspended)return;
      const next=readyTasks(level,doneFor(level.id))[0];
      speak(next?'Готово. Теперь — '+moves[next].name.toLowerCase()+'.':'Путь открыт. Прыгай к золотой капсуле.');
      if(!next&&level.id==='mine'&&x>=route.ledges.at(-1)[0]-25){requestPickup();return;}
      if(!next&&Math.abs(x-route.goal)<(props().reach||50)+10){
        if(touchingGoal(true))await collect(true);else autoGoal();
      }
    }catch{if(ticket===outing)speak('Приказ не прошёл. Нажми ещё раз.');}
    finally{if(ticket===outing)issuing=null;}
  }
  function use(){
    if(!started||paused||suspended||ended||blocking)return;
    const next=readyTasks(level,doneFor(level.id))[0];
    if(next){issue(next);return;}
    requestPickup();
  }
  function requestPickup(){
    if(ended||paused||suspended||courier||blocking)return;
    if(touchingGoal(true)){atTerminal=false;collect(true);return;}
    // Once rescued, the scout can retrieve the cell from either side of the last shelf.
    if(level.id==='mine'&&opened()&&x>=route.ledges.at(-1)[0]-25){
      clearMovement();courier=.001;loadRunner('plane');speak('Дрон возвращается за капсулой.',1.5);return;
    }
    autoGoal();
    speak(relay?'Иду к терминалу.':'Иду за капсулой.',1.3);
  }
  function startPilot(){
    if(!started||paused||suspended||ended||blocking)return;
    clearMovement();canvas.focus({preventScroll:true});
    if(relay){autoGoal();return;}
    setPilot(true);nextOrder=clock+.25;target=route.goal;
    if(opened()&&level.id==='mine')requestPickup();
  }
  function steerToTarget(active){
    const delta=target-x,direction=Math.abs(delta)<1?0:Math.sign(delta);
    if(grounded){
      const gap=route.jumpGap;
      if(gap&&(direction>0&&x>=gap[0]-48&&x<gap[0]&&target>=gap[1]||
        direction<0&&x<=gap[1]+48&&x>gap[1]&&target<=gap[0]))launchJump();
      else if(route.ledges.some(([a,b,top])=>top<y-6&&(
        target>=a&&target<=b&&x>=a-60&&x<=b+60||
        direction>0&&target>a&&x>=a-60&&x<=b-15||
        direction<0&&target<b&&x<=b+60&&x>=a+15)))launchJump();
    }
    if(!direction&&(!active||target!==route.goal||touchingGoal()))target=null;
    return direction;
  }
  function step(dt){
    clock+=dt;elapsed+=dt;if(status.textContent&&clock>msgTill)status.textContent='';
    const limit=60+(props().time||0),left=Math.max(0,Math.ceil(limit-elapsed));const display=left?'Окно связи · '+left+' с':'Резервный канал';const clockLabel=relay?'Связь между постами':display;if(time.textContent!==clockLabel)time.textContent=clockLabel;
    if(!relay&&!left&&!windowShown){windowShown=true;speak('Окно закрылось. Экипаж перешёл на резервный канал, миссия продолжается.');}
    const active=opened(),px=x,py=y;
    if(courier){
      courier+=dt;if(courier>=1.05){courier=0;collect(true,true);}return;
    }
    if(pilot){
      if(!active&&!issuing&&clock>=nextOrder){
        const next=readyTasks(level,doneFor(level.id))[0];
        nextOrder=clock+.9;
        if(next)issue(next,true);
      }
      target=route.goal;
      if(active&&level.id==='mine'&&x>=route.ledges.at(-1)[0]-25){requestPickup();if(courier||blocking)return;}
    }
    const pad=touchDirections.at(-1),key=[...keys].at(-1);let direction=(pad||key)==='right'?1:(pad||key)==='left'?-1:0;
    const guided=!direction&&target!==null,aim=target;
    if(guided)direction=steerToTarget(active);
    if(direction)face=direction;
    const distance=guided?Math.min(Math.abs(aim-x),220*dt):220*dt;
    x=clamp(x+direction*distance,15,W-15);
    // Only an actual, unbridged drop has a safety stop at its lip. Airborne runners stay free.
    if(!active&&route.gap&&(guided||grounded&&y>=level.floor-2)){
      const [left,right]=route.gap;
      if(px<=left-8&&x>left-8)x=left-8;
      if(px>=right+8&&x<right+8)x=right+8;
      if(x===px&&direction&&clock-stamp>3){
        const next=readyTasks(level,doneFor(level.id))[0];
        if(next)speak('У обрыва нажми «'+moves[next].name+'».',2);
        stamp=clock;
      }
    }
    vy+=G*(props().glide&&vy>0?.74:1)*dt;y+=vy*dt;const oldGround=grounded;grounded=false;
    const platforms=[...route.ground,...route.ledges];if(active&&level.id==='dock')platforms.push([408,458,level.floor-32]);if(active&&route.gap)platforms.push([route.gap[0]-4,route.gap[1]+4,level.floor]);
    if(vy>=0){let top=Infinity;for(const [a,b,t] of platforms)if(x>=a&&x<=b&&py<=t+1&&y>=t)top=Math.min(top,t);
      if(Number.isFinite(top)){y=top;vy=0;grounded=true;airGrace=.1;}}
    running=grounded&&Math.abs(x-px)>.002;
    if(running){const prev=Math.floor(stride/20);stride+=Math.abs(x-px);if(Math.floor(stride/20)!==prev)dust(1);}
    if(grounded&&!oldGround){dust(4);if(jumpBuffer>0)launchJump();}
    jumpBuffer=Math.max(0,jumpBuffer-dt);
    for(const p of motes){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=75*dt;}motes=motes.filter(p=>p.age<.32);
    if(!relay)sparkSites().forEach(([sx,sy],i)=>{
      if(!sparks.has(i)&&Math.abs(x-sx)<23&&Math.abs(y-30-sy)<35){sparks.add(i);ui.spark(level.id,i);speak('Искра найдена · '+sparks.size+' / 3',1.4);}
    });
    if(Math.abs(x-route.goal)>54)atTerminal=false;
    if(!grounded){if(oldGround&&vy>0)airGrace=.09;else airGrace=Math.max(0,airGrace-dt);}
    if(active&&x>route.gate+32&&grounded&&Math.abs(y-level.floor)<2&&!route.gap)checkpoint=clamp(Math.round(x-30),55,route.goal-140);
    if(shadowAwake()&&clock-stamp>1.8&&Math.abs(x-(590+48*Math.sin(clock*.9)))<23&&y>level.floor-23){
      if(guided){vy=-420;grounded=false;stamp=clock;}else {fall();return;}}
    if(y>H+44){fall();return;}
    if(active&&touchingGoal())collect();
  }
  function sprite(key,cx,base,h,w=null){const im=imgs.get(key);if(!im?.complete||!im.naturalWidth)return;const width=w||h*im.naturalWidth/im.naturalHeight;c.drawImage(im,cx-width/2,base-h,width,h);}
  function deck(a,b,y){const n=Math.ceil((b-a)/100);for(let i=0;i<n;i++)sprite('deck',a+(i+.5)*(b-a)/n,y+11,14,(b-a)/n+1);}
  function draw(){
    if(!started||!canvas.clientWidth)return;const ratio=Math.min(2,devicePixelRatio||1),sw=canvas.clientWidth,sh=canvas.clientHeight;
    if(Math.abs(canvas.width-sw*ratio)>1||Math.abs(canvas.height-sh*ratio)>1){canvas.width=Math.round(sw*ratio);canvas.height=Math.round(sh*ratio);}
    c.setTransform(canvas.width/sw,0,0,canvas.height/sh,0,0);c.clearRect(0,0,sw,sh);scale=Math.max(sw/W,sh/H);
    camera=clamp(x-sw/scale*.37,0,Math.max(0,W-sw/scale));camY=Math.max(0,(H-sh/scale)*.57);c.scale(scale,scale);c.translate(-camera,-camY);
    const bg=imgs.get(level.art);drawBackdrop(c,level,bg);
    const active=opened(),b=reduce?0:Math.sin(clock*3)*2,g=level.floor;
    for(const [a,bx] of [route.jumpGap,level.art==='foundry'?route.gap:null].filter(Boolean)){const pit=c.createLinearGradient(0,g-1,0,H);pit.addColorStop(0,'#322039');pit.addColorStop(.55,'#21182e');pit.addColorStop(1,level.theme==='lava'?'#df804c':'#7253ae');c.fillStyle=pit;c.fillRect(a,g-2,bx-a,H-g+2);c.strokeStyle='#d6a6e8';c.lineWidth=2;c.strokeRect(a+1,g-1,bx-a-2,4);}
    for(const [a,z,t] of route.ledges)deck(a,z,t);if(route.gap&&active)deck(route.gap[0]-4,route.gap[1]+4,g);if(active&&level.id==='dock')deck(408,458,g-32);
    if(!active&&route.gap){const gate=route.gate;const beam=c.createLinearGradient(gate-9,0,gate+9,0);beam.addColorStop(0,'#b283fc00');beam.addColorStop(.5,'#edd1ffdc');beam.addColorStop(1,'#b283fc00');c.fillStyle=beam;c.fillRect(gate-9,g-116,18,116);sprite('relay',gate-14,g+1,30);}
    if(shadowAwake())sprite('wraith',590+48*Math.sin(clock*.9),g-2+b,49);
    const glow=c.createRadialGradient(route.goal,route.goalY-18,1,route.goal,route.goalY-18,32);glow.addColorStop(0,'#ffe599a0');glow.addColorStop(1,'#ffe59900');c.fillStyle=glow;c.fillRect(route.goal-35,route.goalY-55,70,70);if(!courier||courier<.53)sprite(relay?'relay':'cell',route.goal,route.goalY+(relay?0:b),relay?56:37);
    const label=relay?'РЕЛЕ':'КАПСУЛА',labelY=route.goalY-(relay?68:54);
    c.save();c.font='bold 11px Rubik, sans-serif';c.textAlign='center';c.textBaseline='middle';
    const labelWidth=c.measureText(label).width+16;
    c.fillStyle='#2d2231';c.fillRect(route.goal-labelWidth/2,labelY-8,labelWidth,16);
    c.fillStyle='#ffe39b';c.fillText(label,route.goal,labelY);
    c.beginPath();c.moveTo(route.goal-4,labelY+8);c.lineTo(route.goal,labelY+12);c.lineTo(route.goal+4,labelY+8);c.fill();c.restore();
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
    const done=doneFor(level.id);
    for(const member of team){
      if(member===hero&&!courier)continue;
      const actor=imgs.get('runner-'+member);if(!actor?.complete||!actor.naturalWidth)continue;
      const air=member==='plane',following=done.includes(air?'rescue':'bridge');
      let cx=air?(following?clamp(x-49,40,925):470+Math.sin(clock*.7)*60):(following?clamp(x-63,40,918):route.gate-35);
      let cy=air?g-95+Math.sin(clock*2)*4:g,carrying=false;
      if(air&&courier){
        const t=clamp(courier/1.05,0,1),leg=t<=.5?t*2:(1-t)*2;
        cx=x+(route.goal-x)*leg;cy=(y-49)*(1-leg)+(route.goalY-22)*leg-35*Math.sin(leg*Math.PI);carrying=t>.5;
      }
      if(air&&done.includes('scan')&&!following){
        c.fillStyle='#85f0d32e';c.beginPath();c.moveTo(cx,cy);c.lineTo(cx-25,g-3);c.lineTo(cx+25,g-3);c.fill();
      }
      const size=air?43:66,frame=!air&&following&&running?1+Math.floor(stride/20)%2:0;
      c.drawImage(actor,frame*128,0,128,128,cx-size/2,cy-size,size,size);
      if(carrying)sprite('cell',cx,cy+11,20);
    }
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
    if(!move||paused||ended||suspended)return;
    // Space must continue to activate a focused radio/menu button for keyboard users.
    if(e.code==='Space'&&e.target.closest?.('button'))return;
    e.preventDefault();
    if(move==='left'||move==='right'){if(down){canvas.focus({preventScroll:true});if(!e.repeat){stopPilot();keys.delete(move);keys.add(move);target=null;}}else keys.delete(move);}else if(down&&!e.repeat){if(move==='jump'){stopPilot();jump();}else use();}
  }
  window.addEventListener('keydown',e=>key(e,true));window.addEventListener('keyup',e=>key(e,false));window.addEventListener('blur',clearMovement);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused&&!ended&&started&&!document.querySelector('#field').hidden)pause();});
  const resetPads=bindFieldPads({movement:dirs=>{touchDirections=dirs;if(dirs.length){stopPilot();target=null;}},jump:()=>{stopPilot();jump();},use});
  function autoGoal(){if(!started||ended||paused||suspended)return;clearMovement();canvas.focus({preventScroll:true});target=route.goal;if(relay&&touchingGoal(true)){atTerminal=false;collect(true);}}
  canvas.onpointerdown=e=>{if(ended||paused||suspended)return;canvas.focus({preventScroll:true});const r=canvas.getBoundingClientRect();const dest=clamp(camera+(e.clientX-r.left)/scale,16,W-16);const yy=camY+(e.clientY-r.top)/scale;if(Math.abs(dest-route.goal)<42&&yy>=route.goalY-77&&yy<=route.goalY+20){if(opened())requestPickup();else autoGoal();const next=readyTasks(level,doneFor(level.id))[0];if(next)issue(next);return;}if(Math.abs(dest-x)<80&&yy<y-20)jump();target=dest;};
  document.querySelector('#pause').onclick=pause;document.querySelector('#field-target').onclick=()=>{stopPilot();if(opened())requestPickup();else autoGoal();};
  pilotButton.onclick=()=>{if(pilot){stopPilot();speak('Управление у тебя.',1);}else startPilot();};
  new ResizeObserver(draw).observe(canvas);return {start,leave,suspend,draw,resume,warp,issue,startPilot,forget(){started=false;leave();},get stageId(){return started?level.id:null;},get active(){return started&&!ended;},setHero(h){hero=h;loadRunner(h);}};
}
