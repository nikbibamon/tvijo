import {ballAt, machine} from './rules.js';

const deep = '#182538';
const amber = '#ffc879';
const mint = '#6ce4d4';

function stroke(ctx, points, color, width) {
  ctx.strokeStyle=color;
  ctx.lineWidth=width;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.stroke();
}

function disk(ctx,x,y,r,color) {
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fill();
}

function metal(ctx, points, edge='#9dadd0', weight=12) {
  stroke(ctx,points,'#10111e',weight+8);
  stroke(ctx,points,'#4e5775',weight);
  stroke(ctx,points.map(([x,y])=>[x,y-3]),edge,3);
  for (const [x,y] of points.slice(0,-1)) disk(ctx,x,y+3,2.6,'#172938');
}

function joint(ctx,x,y,color) {
  disk(ctx,x,y,15,deep);
  disk(ctx,x,y,10,'#627694');
  disk(ctx,x,y,5,color);
}

function receiver(ctx,x,y,on,color,type) {
  ctx.fillStyle='#252538';
  ctx.fillRect(x-7,y-6,95,39);
  ctx.fillStyle='#536581';
  ctx.fillRect(x,y+23,84,6);
  if (on) {
    ctx.save();
    ctx.shadowColor=color;
    ctx.shadowBlur=34;
    disk(ctx,x+40,y-7,23,color);
    ctx.restore();
  }
  disk(ctx,x+40,y-7,26,'#1a2433');
  disk(ctx,x+40,y-7,20,on?color:'#45556d');
  if (type==='lamp') {
    stroke(ctx,[[x+33,y-3],[x+47,y-3]],on?'#fff3cf':'#647693',7);
    stroke(ctx,[[x+38,y-16],[x+43,y-16]],on?'#fff3cf':'#647693',4);
  } else {
    stroke(ctx,[[x+31,y-7],[x+39,y-15],[x+50,y-6],[x+41,y+4],[x+31,y-7]],on?'#246b74':'#657794',4);
  }
}

function fillTube(ctx,y,color,fill) {
  const tube=[[820,y],[875,y],[896,y-17],[898,y-45]];
  stroke(ctx,tube,'#202636',12);
  stroke(ctx,tube,'#686079',7);
  if (fill) stroke(ctx,tube,color,5);
}

export function drawCircuit(canvas, station, run, options) {
  const {shot, progress, lampLit, pumpLit}=options;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,960,540);
  const shade=ctx.createLinearGradient(0,100,0,510);
  shade.addColorStop(0,'#16142500');
  shade.addColorStop(.55,'#16142542');
  shade.addColorStop(1,'#10142010');
  ctx.fillStyle=shade;
  ctx.fillRect(0,0,960,540);

  stroke(ctx,[[172,165],[156,172],[149,192],[174,211],[202,208],[214,189]],'#121728',31);
  stroke(ctx,[[172,165],[156,172],[149,192],[174,211],[202,208],[214,189]],'#7487a0',20);
  stroke(ctx,[[170,162],[152,170],[144,189]],amber,5);
  metal(ctx,machine.feed.map(([x,y])=>[x,y+9]),'#c6bfad');
  metal(ctx,[[319,416],[332,446],[421,446],[437,419]],'#c28688',15);

  const guideEnd=run.guide?machine.track[0]:machine.pocket[0];
  metal(ctx,[[306,250],[guideEnd[0],guideEnd[1]+9]],mint,14);
  joint(ctx,306,250,mint);
  if (run.lever) metal(ctx,[[459,310],[505,327],[532,334]],amber,15);
  else metal(ctx,[[485,322],[515,329],[545,319]],'#9a89ae',15);
  metal(ctx,[[480,386],[507,328],[533,386]],'#7086a5',12);
  joint(ctx,507,328,amber);
  metal(ctx,[[531,333],[577,341]],'#aa9ab3');
  for (const type of ['lamp','pump']) {
    const points=[[577,341],...machine[type].map(([x,y])=>[x,y+9])];
    metal(ctx,points,run.branch===type?(type==='lamp'?amber:mint):'#7887ad',10);
  }
  joint(ctx,577,341,run.branch==='lamp'?amber:mint);
  receiver(ctx,777,369,lampLit,amber,'lamp');
  receiver(ctx,777,451,pumpLit,mint,'pump');
  fillTube(ctx,349,amber,lampLit);
  fillTube(ctx,438,mint,pumpLit);
  if (shot && progress===1) {
    ctx.setLineDash([4,10]);
    stroke(ctx,shot.path,shot.outcome===station?mint:amber,3.5);
    ctx.setLineDash([]);
  }
  const [x,y]=shot?ballAt(shot.path,progress):machine.feed[0];
  ctx.save();
  ctx.shadowColor='#ffd692e0';ctx.shadowBlur=15;
  disk(ctx,x,y,13,'#f5b452');
  ctx.restore();
  disk(ctx,x-3,y-4,8,'#ffda99');
  disk(ctx,x-4,y-6,3,'#fff5cf');
}
