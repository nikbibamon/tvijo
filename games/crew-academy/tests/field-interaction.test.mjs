import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,moves,heroOrder} from '../web/catalog.js';
import {layout,worldLevel} from '../web/worlds.js';
import {relayStage} from '../web/relayMission.js';

class Element extends EventTarget {
  constructor(pad){
    super();this.dataset={pad};this.classList={add(){},remove(){}};this.textContent='';
  }
  focus(){document.activeElement=this;}
  pointer(type,id){const event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:id,button:0,detail:1});this.dispatchEvent(event);}
}
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
globalThis.localStorage=storage();globalThis.sessionStorage=storage();globalThis.window=new EventTarget();
globalThis.Image=class {complete=true;naturalWidth=512;naturalHeight=128;};
globalThis.devicePixelRatio=1;globalThis.matchMedia=()=>({matches:false});globalThis.ResizeObserver=class{observe(){}};
const service=await import('../web/tvijoService.js');
const {createField}=await import('../web/field.js');
const flush=()=>new Promise(resolve=>setImmediate(resolve));

async function play(level=levels[0],hero='captain',viewport=[390,844]){
  window=new EventTarget();const doc=new EventTarget();globalThis.document=doc;
  const ids=new Map(),pads=Object.fromEntries(['left','right','jump','use'].map(k=>[k,new Element(k)]));
  doc.querySelector=id=>{if(id==='dialog[open]')return null;if(!ids.has(id))ids.set(id,new Element());return ids.get(id);};
  doc.querySelectorAll=()=>Object.values(pads);
  const canvas=doc.querySelector('#stage');canvas.clientWidth=viewport[0]-20;canvas.clientHeight=Math.min(390,viewport[0]*.56);
  let latest,translation,camera,sceneScale,firstScale,firstTranslate,elapsed=100,frame=0;const scheduled=new Map();
  // Read the normal renderer's full-body sprite position. The controller exposes no teleport or test hooks.
  const labels=[];canvas.getBoundingClientRect=()=>({left:0,top:0});
  const ctx=new Proxy({
    clearRect(){labels.length=0;firstScale=true;firstTranslate=true;},fillText(value){labels.push(value);},
    scale(value){if(firstScale){sceneScale=value;firstScale=false;}},
    translate(x,y){translation={x,y};if(firstTranslate){camera={x,y};firstTranslate=false;}},
    drawImage(img,...args){
      if(img.src.includes('/runners/')&&args.length===8)latest={...translation,pose:args[0]/128};
      if(img.src.endsWith('/crew/plane.webp')&&args.length===4)latest={...translation,hover:-(args[1]+args[3])};
    },
    createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
    measureText:()=>({width:45})
  },{get:(o,k)=>o[k]??(()=>{})});canvas.getContext=()=>ctx;
  globalThis.requestAnimationFrame=fn=>{scheduled.set(++frame,fn);return frame;};
  globalThis.cancelAnimationFrame=id=>scheduled.delete(id);
  let finish=0,orders=0,falls=0,relay=0;
  if(!level.id.startsWith('pair-'))await service.resetStage(level);
  const field=createField({
    order:(levelId,id,auto)=>{orders++;return service.fieldOrder(levelId,id,auto);},
    won:service.complete,finish:()=>finish++,spark:service.collectSpark,fell:()=>falls++,
    relayTerminal:()=>relay++,pauseMenu(){}
  });field.start(level,hero);
  async function advance(ms){
    const end=elapsed+ms;
    while(elapsed<end-.00001){
      elapsed=Math.min(end,elapsed+1000/60);
      const pending=[...scheduled.values()];scheduled.clear();for(const fn of pending)fn(elapsed);
      await flush();
    }
  }
  function key(code,down=true,keyValue){const e=new Event(down?'keydown':'keyup',{cancelable:true});Object.assign(e,{code,key:keyValue});window.dispatchEvent(e);}
  function tap(id,n=2){pads[id].pointer('pointerdown',n);pads[id].pointer('pointerup',n);}
  await advance(20);
  return {pads,key,tap,advance,field,go:()=>doc.querySelector('#field-target').onclick(),
    get labels(){return [...labels];},get label(){return doc.querySelector('#grab span').textContent;},
    get lift(){return doc.querySelector('#jump span').textContent;},
    get message(){return doc.querySelector('#field-feedback').textContent;},
    worldPoint:(x,y)=>[(x+camera.x)*sceneScale,(y+camera.y)*sceneScale],
    touchWorld:(x,y)=>canvas.onpointerdown({clientX:(x+camera.x)*sceneScale,clientY:(y+camera.y)*sceneScale}),
    get actor(){return latest;},get finished(){return finish;},get orders(){return orders;},get falls(){return falls;},get relay(){return relay;}};
}

for(const viewport of [[375,667],[390,844]]){
 test('First Shift, '+viewport.join('×')+': see the capsule, hold Right and jump, radio the Robot, touch the cargo',async()=>{
  await service.setShowHints(false);const level=levels[0],route=layout(level),p=await play(level,'daughter',viewport);
  const [cx,cy]=p.worldPoint(route.goal,route.goalY-20);
  assert.ok(cx>0&&cx<viewport[0]-20&&cy>0&&cy<viewport[0]*.56,'cargo must be in the initial frame');
  p.touchWorld(route.goal,route.goalY-15);await p.advance(80);assert.deepEqual(service.doneFor(),[]);
  p.pads.right.pointer('pointerdown',1);await p.advance(1300);
  assert.equal(p.actor.x,route.gap[0]-8);assert.equal(p.finished,0);
  const before=p.actor.x;p.tap('jump');await p.advance(160);
  assert.ok(p.actor.x>before&&p.actor.y<level.floor-20&&p.actor.pose===3);
  const balance=service.state.balance;p.tap('use');p.tap('use',3);await flush();
  assert.deepEqual(service.doneFor(),['bridge']);assert.equal(p.orders,1);
  assert.equal(service.state.balance,balance);await p.advance(1350);p.pads.right.pointer('pointerup',1);
  assert.equal(p.finished,0);p.touchWorld(route.goal,route.goalY-16);await p.advance(2200);
  assert.equal(p.finished,1);assert.equal(p.falls,0);assert.equal(p.message,'');p.field.leave();
 });
}
test('First Shift, keyboard: radio from the bank, cross on foot, overshoot and return with E',async()=>{
  const l=levels[0],route=layout(l),p=await play(l,'captain',[1280,800]);
  p.key('KeyD');await p.advance(1700);assert.equal(p.actor.x,route.gap[0]-8);
  p.key('Digit1');p.key('Digit1',false);await flush();assert.deepEqual(service.doneFor(),['bridge']);
  p.key('Space');await p.advance(180);assert.ok(p.actor.y<l.floor-30);p.key('Space',false);
  await p.advance(2280);p.key('KeyD',false);assert.ok(p.actor.x>route.goal+60);assert.equal(p.finished,0);
  p.key('KeyE');p.key('KeyE',false);await p.advance(2600);
  assert.equal(p.finished,1);assert.equal(p.falls,0);
});
test('all seven pilots can call for the capsule from either bank after locking the bridge',async()=>{
  for(const [i,hero] of heroOrder.entries()){
    const p=await play(levels[0],hero);
    await p.field.issue('bridge');if(i%2){p.key('ArrowRight');await p.advance(3300);p.key('ArrowRight',false);}
    assert.equal(p.finished,0);p.tap('use');await p.advance(4300);
    assert.equal(p.finished,1,hero);assert.equal(p.falls,0,hero);p.field.leave();
  }
});

test('the aircraft hovers above the deck in the sortie and lifts off with its flight control',async()=>{
  const level=levels[0],p=await play(level,'plane');
  assert.equal(p.lift,'Взлёт');
  assert.equal(p.actor.y,level.floor);
  assert.ok(p.actor.hover>4);
  p.tap('jump');await p.advance(160);
  assert.ok(p.actor.y<level.floor-20);
  p.field.setHero('captain');
  assert.equal(p.lift,'Прыжок');
  p.field.leave();
});

test('the rift waits on its real bank and resumes the route after the three field controls',async()=>{
  const l=levels[1],p=await play(l);p.go();await p.advance(2900);
  assert.equal(p.falls,0);assert.equal(p.actor.x,layout(l).gap[0]-8);
  await p.field.issue('gate');assert.deepEqual(service.doneFor(),[]);
  for(const [id] of l.tasks){p.tap('use');await flush();assert.ok(service.doneFor().includes(id),moves[id].name);}
  await p.advance(3000);assert.equal(p.finished,1);assert.equal(p.falls,0);
});

test('remaining campaign and generated stages support field orders, real jumps and assisted pickup',async()=>{
  const world=worldLevel({theme:'rift',path:'build',steps:4,seed:98765,shadow:false});
  for(const l of [...levels.slice(2),world]){
    const p=await play(l);for(const [id] of l.tasks){await p.field.issue(id);assert.ok(service.doneFor().includes(id));}
    p.go();await p.advance(6500);assert.equal(p.finished,1,l.id);assert.equal(p.falls,0,l.id);
  }
});

test('a press just before landing buffers one new jump',async()=>{
  const p=await play();p.tap('jump');await p.advance(735);
  assert.equal(p.actor.pose,3);p.tap('jump');await p.advance(190);
  assert.equal(p.actor.pose,3);assert.ok(p.actor.y<levels[0].floor-29);
  await p.advance(1200);assert.equal(p.actor.y,levels[0].floor);
});

test('the two paired terminals still open once on arrival and can be reopened with the action button',async()=>{
  for(const role of ['scout','engineer']){
    const p=await play(relayStage(role));p.go();await p.advance(5500);
    assert.equal(p.relay,1);assert.equal(p.finished,0);p.tap('use');await flush();assert.equal(p.relay,2);
  }
});

test('Echo Mine: release the scout after overshooting the capsule with one thumb still on Right',async()=>{
  const l=levels.find(l=>l.id==='mine'),p=await play(l);
  await p.field.issue('scan');await p.field.issue('compare');
  p.pads.right.pointer('pointerdown',1);await p.advance(4700);
  assert.equal(p.actor.x,945);assert.equal(p.finished,0);
  await p.field.issue('rescue');
  p.tap('use',2);p.go();await p.advance(1700);p.tap('use');await p.advance(100);
  assert.equal(p.finished,1,'the scout must carry the capsule back exactly once');
  assert.equal(p.falls,0);assert.deepEqual(service.doneFor(l.id),['scan','compare','rescue']);
});
test('Echo Mine: the opposite thumb can take over a held arrow before the scout order',async()=>{
  const p=await play(levels.find(l=>l.id==='mine'));
  await p.field.issue('scan');await p.field.issue('compare');
  p.pads.right.pointer('pointerdown',1);await p.advance(4700);
  p.pads.left.pointer('pointerdown',2);await p.advance(480);
  assert.ok(p.actor.x<860);assert.equal(p.falls,0);
  p.pads.left.pointer('pointerup',2);p.pads.right.pointer('pointerup',1);
  await p.field.issue('rescue');await p.advance(1700);assert.equal(p.finished,1);
});
test('autopilot completes both illustrated missions and all six generated biomes using ordinary orders and jumps',async()=>{
  const themes=['sun','rift','lava','beacon','greenhouse','foundry'];
  const corpus=[...levels.slice(4),...themes.map((theme,i)=>worldLevel({theme,path:'duet',steps:4,seed:131+i*7321,shadow:true}))];
  const base=service.state.tallies.orders;
  for(const [i,l] of corpus.entries()){
    const p=await play(l,i%2?'daughter':'plane');p.field.startPilot();await p.advance(12500);
    assert.equal(p.finished,1,l.id);assert.equal(p.falls,0,l.id);assert.equal(p.orders,l.tasks.length,l.id);
    assert.equal(service.state.tallies.orders,base,'demonstrations cannot earn personal skill credit');p.field.leave();
  }
});
test('player can take over the demonstration, then resume without repeating a completed task',async()=>{
  const l=levels.at(-1),p=await play(l);p.field.startPilot();await p.advance(620);
  p.key('ArrowLeft');p.key('ArrowLeft',false);const before=p.orders;await p.advance(2000);
  assert.equal(p.orders,before);assert.equal(p.finished,0);
  p.field.startPilot();await p.advance(12000);assert.equal(p.finished,1);assert.equal(p.orders,l.tasks.length);
});

test('E takes the marked spark within reach, once and without issuing an order',async()=>{
  await service.setShowHints(false);const p=await play();
  p.key('KeyD');await p.advance(365);p.key('KeyD',false);
  assert.equal(p.label,'Взять искру');assert.ok(p.labels.includes('E'));
  p.key('KeyE');p.key('KeyE',false);await p.advance(150);
  assert.deepEqual(service.state.stages.dock.sparks,[0]);assert.equal(p.orders,0);
  assert.equal(p.message,'');assert.equal(p.label,'Закрепить мост');assert.ok(!p.labels.includes('E'));
  await p.field.issue('bridge');await p.advance(20);assert.ok(p.labels.includes('E'));
  p.key('Unidentified',true,'е');p.key('Unidentified',false,'е');await p.advance(4000);
  assert.equal(p.finished,1);assert.ok(!p.labels.includes('E'),'a collected artifact cannot keep its action marker');
});

test('touching a visible spark steers to it and an enabled hint confirms pickup',async()=>{
  await service.setShowHints(true);const p=await play();
  p.touchWorld(176,324);await p.advance(950);
  assert.deepEqual(service.state.stages.dock.sparks,[0]);assert.equal(p.orders,0);
  assert.match(p.message,/Искра найдена/);assert.ok(p.actor.x<160,'the requested pickup stops the assisted walk');
  p.field.leave();await service.setShowHints(false);
});
