// The workshop preview and the playable field paint the same seeded landscape.
import {layout,worldLevel} from './worlds.js';
const palettes={
  sun:['#ffd27d','#6bdbbb'],rift:['#8edffc','#c48aff'],lava:['#ffad61','#dd69cf'],
  beacon:['#b2c9ff','#ffd58d'],greenhouse:['#89f2bd','#f6a37e'],foundry:['#ffba79','#60def0']
};
export function drawBackdrop(ctx,level,bg){
  if(bg?.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,960,448);
  if(!level.spec)return;
  let word=level.spec.seed>>>0;
  const next=()=>{word=(Math.imul(word,1664525)+1013904223)>>>0;return word/4294967296;};
  const [warm,cool]=palettes[level.theme],floor=level.floor;
  ctx.save();
  const sky=ctx.createLinearGradient(0,0,0,floor);
  sky.addColorStop(0,next()>.5?warm+'4a':cool+'63');sky.addColorStop(.8,'#18182700');
  ctx.fillStyle=sky;ctx.fillRect(0,0,960,floor);
  for(let i=0;i<4;i++){
    const x=30+next()*885,y=40+next()*110,size=3+next()*8;
    ctx.fillStyle=cool+'be';ctx.fillRect(x-1,y-size,2,size*2);ctx.fillRect(x-size,y-1,size*2,2);
  }
  // Each seed plants different distant structures behind the playable deck.
  for(let i=0;i<9;i++){
    const x=Math.round(i*112+next()*74),y=floor-10-Math.floor(next()*28),h=23+Math.floor(next()*62);
    ctx.fillStyle='#252a4599';ctx.fillRect(x-3,y-h,6,h);
    if(level.theme==='greenhouse'||level.theme==='sun'){
      for(let j=0;j<3;j++){ctx.fillStyle=j%2?warm+'c0':cool+'c0';ctx.beginPath();ctx.ellipse(x+(j%2?8:-7),y-h+j*9,11,5,j%2?-.45:.45,0,Math.PI*2);ctx.fill();}
    }else if(level.theme==='rift'||level.theme==='lava'){
      ctx.fillStyle=cool+'a3';ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x-7,y-h+9);ctx.lineTo(x+2,y-h-7);ctx.lineTo(x+9,y-h+12);ctx.lineTo(x+7,y);ctx.fill();
      ctx.fillStyle=warm+'99';ctx.fillRect(x-3,y-h+6,3,h-6);
    }else{
      ctx.fillStyle=cool+'b8';ctx.fillRect(x-12,y-h,24,3);ctx.fillStyle=warm+'c0';ctx.fillRect(x-2,y-h-7,4,7);
      ctx.fillStyle='#27304bc7';ctx.fillRect(x-11,y-11,22,11);
    }
  }
  ctx.restore();
}
export function companionsFor(level){
  if(level.id==='dock')return ['robot'];
  if(level.id==='mine')return ['plane'];
  if(level.spec)return ({build:['robot'],rescue:['plane'],survey:['plane'],signal:['robot'],duet:['plane','robot']})[level.spec.path];
  if(level.id==='greenhouse')return ['plane'];if(level.id==='foundry')return ['plane','robot'];return [];
}

export function runnerImage(id) {
  return './art/'+(id==='plane'?'crew/':'runners/')+id+'.webp';
}

export function drawRunner(ctx,img,id,frame,x,y,size) {
  if (id==='plane') ctx.drawImage(img,x,y,size,size);
  else ctx.drawImage(img,frame*128,0,128,128,x,y,size,size);
}

const previewImages=new Map();
function previewImage(src){
  if(!previewImages.has(src)){const img=new Image();img.src=src;previewImages.set(src,img);}
  return previewImages.get(src);
}
export function drawBlueprint(canvas,spec){
  const level=worldLevel(spec),route=layout(level),ctx=canvas.getContext('2d');
  const stamp=canvas.dataset.blueprint=String(spec.seed)+level.id;
  const bg=previewImage('./art/'+level.art+'.webp'),cell=previewImage('./art/cell.webp');
  const crew=companionsFor(level).map(h=>[h,previewImage(runnerImage(h))]);
  function draw(){
    if(canvas.dataset.blueprint!==stamp)return;
    ctx.clearRect(0,0,960,448);drawBackdrop(ctx,level,bg);
    for(const gap of [route.jumpGap,route.gap].filter(Boolean)){
      ctx.fillStyle='#1c233ae8';ctx.fillRect(gap[0],level.floor,gap[1]-gap[0],448-level.floor);
    }
    for(const [a,b,y] of route.ledges){
      ctx.fillStyle='#282437';ctx.fillRect(a,y,b-a,9);ctx.fillStyle='#8ef0df';ctx.fillRect(a,y,b-a,3);
    }
    if(cell.complete&&cell.naturalWidth)ctx.drawImage(cell,route.goal-15,route.goalY-42,30,42);
    crew.forEach(([id,img],i)=>{if(img.complete&&img.naturalWidth){const size=id==='plane'?62:81;drawRunner(ctx,img,id,0,355+i*130,level.floor-size-(id==='plane'?50:0),size);}});
  }
  draw();for(const im of [bg,cell,...crew.map(x=>x[1])])if(!im.complete)im.addEventListener('load',draw,{once:true});
}
