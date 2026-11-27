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

async function play(level=levels[0],hero='captain'){
  window=new EventTarget();const doc=new EventTarget();globalThis.document=doc;
  const ids=new Map(),pads=Object.fromEntries(['left','right','jump','use'].map(k=>[k,new Element(k)]));
  doc.querySelector=id=>{if(id==='dialog[open]')return null;if(!ids.has(id))ids.set(id,new Element());return ids.get(id);};
  doc.querySelectorAll=()=>Object.values(pads);
  const canvas=doc.querySelector('#stage');canvas.clientWidth=390;canvas.clientHeight=350;
  let latest,translation,elapsed=100,frame=0;const scheduled=new Map();
  // Read the normal renderer's full-body sprite position. The controller exposes no teleport or test hooks.
  const labels=[];canvas.getBoundingClientRect=()=>({left:0,top:0});
  const ctx=new Proxy({
    clearRect(){labels.length=0;},fillText(value){labels.push(value);},
    translate(x,y){translation={x,y};},
    drawImage(img,...args){if(img.src.includes('/runners/')&&args.length===8)latest={...translation,pose:args[0]/128};},
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
    get message(){return doc.querySelector('#field-feedback').textContent;},
    tapScene:(clientX,clientY)=>canvas.onpointerdown({clientX,clientY}),
    get actor(){return latest;},get finished(){return finish;},get orders(){return orders;},get falls(){return falls;},get relay(){return relay;}};
}

test('dock, two thumbs: pass the old wall in midair, give one order and touch the capsule',async()=>{
  const p=await play(),floor=levels[0].floor;
  p.pads.right.pointer('pointerdown',1);await p.advance(1590); // approach the crane from the ship
  p.tap('jump');await p.advance(350);
  assert.ok(p.actor.x>450,'the runner must clear x=418 before the bridge order, actual x='+p.actor.x);
  assert.ok(p.actor.y<floor-63&&p.actor.pose===3,'the same held direction must persist during the jump');
  p.pads.right.pointer('pointerup',1);await p.advance(550);
  assert.equal(p.finished,0);assert.deepEqual(service.doneFor(),[]);
  await service.setTier('genius');const {balance,tallies}=service.state;
  p.tap('use');p.tap('use',3);await flush();
  assert.deepEqual(service.doneFor(),['bridge']);assert.equal(p.orders,1);
  assert.equal(service.state.balance,balance);assert.equal(service.state.tallies.clear,tallies.clear);
  p.pads.right.pointer('pointerdown',1);await p.advance(550);p.pads.right.pointer('pointerup',1);
  assert.equal(p.finished,1);assert.equal(p.falls,0);
});

test('dock, keyboard: D + E at the blocked spot, Space and a clean pickup on the first run',async()=>{
  const p=await play();p.key('KeyD');await p.advance(1630);assert.ok(Math.abs(p.actor.x-414)<4);
  p.key('KeyE');p.key('KeyE',false);await flush();
  assert.deepEqual(service.doneFor(),['bridge']);p.key('Space');await p.advance(160);
  assert.ok(p.actor.y<310&&p.actor.pose===3);p.key('Space',false);
  await p.advance(900);p.key('KeyD',false);
  assert.equal(p.finished,1);assert.equal(p.falls,0);
});

test('the action under the pickup jumps and gathers it for all seven heights, with no runway',async()=>{
  for(const hero of heroOrder){
    const p=await play(levels[0],hero);p.key('ArrowRight');await p.advance(2430);p.key('ArrowRight',false);
    assert.ok(Math.abs(p.actor.x-layout(levels[0]).goal)<3);assert.equal(p.actor.y,levels[0].floor);
    assert.equal(p.finished,0);p.tap('use');await p.advance(1400);
    assert.equal(p.finished,1,hero);assert.equal(p.falls,0,hero);p.field.leave();
  }
});

test('the goal can also be approached from the right in assisted mode',async()=>{
  const p=await play(levels[0],'plane');p.key('KeyD');await p.advance(3000);p.key('KeyD',false);
  assert.ok(p.actor.x>690);p.tap('use');await flush();p.go();await p.advance(2100);
  assert.equal(p.finished,1);assert.equal(p.falls,0);
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
  // At the starting camera position the first spark is at (176,324) in the 960×448 scene.
  p.tapScene(176*350/448,324*350/448);await p.advance(950);
  assert.deepEqual(service.state.stages.dock.sparks,[0]);assert.equal(p.orders,0);
  assert.match(p.message,/Искра найдена/);assert.ok(p.actor.x<160,'the requested pickup stops the assisted walk');
  p.field.leave();await service.setShowHints(false);
});
