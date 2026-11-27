import {crew, GATE, SIDING} from './rules.js';

const slots = [
  [5,77],[11.5,77],[18,77],[24.5,77],[31,77],[35.5,77],[40.5,77],
  [51.5,71],[58.5,71],[65,71],[72,69.7],[79,68.5],[86.7,67.7],[83,87]
];
export function dronePlace(positions, index) {
  const slot = positions[index], [x,y] = slots[slot+4];
  const n = positions.slice(0,index).filter(p => p === slot).length;
  if (slot === GATE) return [x-4+(index%3)*4.3, y-2-Math.floor(index/3)*9];
  return [x-(n%3)*4.1,y-Math.floor(n/3)*9];
}

export function paintTrack(canvas, board) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w=1000, h=500;
  ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
  ctx.clearRect(0,0,w,h);
  ctx.lineJoin='round'; ctx.lineCap='round';
  function line(points, color, width) {
    ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function light(x,y,r,fill,glow=0) {
    ctx.save();ctx.shadowColor=fill;ctx.shadowBlur=glow;ctx.fillStyle=fill;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function rail(x,y,ex,ey, tint) {
    const len=Math.hypot(ex-x,ey-y), n=Math.max(1,Math.round(len/16));
    line([[x,y+6],[ex,ey+6]],'#101e2e',13);
    line([[x,y],[ex,ey]],'#506e74',12);
    for (let i=0;i<=n;i++) {
      const t=i/n, sx=x+(ex-x)*t, sy=y+(ey-y)*t;
      line([[sx-2,sy-4],[sx+3,sy+9]],'#223c45',3.5);
    }
    line([[x,y-2],[ex,ey-2]],tint,3.8);
  }
  const night=board.mode==='night', lift=board.power==='lift';
  const straight=board.routed && board.direction==='gate' && (!night||!lift);
  const diversion=board.routed && board.direction==='siding' && (!night||!lift);
  rail(25,385,405,385,'#adc9c7'); rail(510,355,649,355,'#b2d1d0');
  rail(649,355,900,337,straight?'#93ffe0':'#a7c3c1');
  rail(649,355,766,435,diversion?'#ffd083':'#8d8079');
  rail(766,435,859,435,diversion?'#ffd083':'#8d8079');
  line([[858,435],[863,417]],'#221d23',11);
  line([[853,420],[868,422]],'#e1a36c',5);
  if (night) {
    const y=board.bridge && lift ? 353 : 405;
    line([[415,426],[506,426]],'#1c3440',12);
    line([[425,426],[492,y],[433,y],[492,426]],lift?'#8bdccd':'#5c818e',5);
    rail(410,y,508,y, lift?'#acf9df':'#80999f');
    line([[400,385],[412,385]],'#edb76d',6);
  } else if (board.bridge) {
    line([[404,387],[439,402],[472,367],[508,358]],'#b77d42',6);
    rail(405,385,512,355,'#ffe0a0');
  } else {
    line([[405,385],[411,427]],'#79532f',12);
    line([[405,385],[411,427]],'#f5c277',5);
    light(405,385,5,'#ffe2a0');
  }
  line(board.direction==='gate' ? [[632,355],[655,354],[677,351]] : [[632,355],[651,359],[674,372]],board.routed?'#ffcd77':'#c18b5d',6);
  line([[648,351],[648,321]],'#2a353e',7);
  line([[648,328],board.direction==='gate'?[658,316]:[657,335]],'#efb261',4);
  light(648,317,5,straight?'#8ff4ce':'#ffbb6f',8);
  if(night){
    const circuit=lift?[[146,445],[338,445],[377,415],[417,415]]:[[146,445],[573,445],[615,412],[615,340],[645,322]];
    line(circuit,'#10242e',8);line(circuit,lift?'#66fcdb':'#ffe699',3);
    light(145,445,7,lift?'#76f9d8':'#ffdf89',12);
  }
  for(let i=0;i<crew.length;i++){
    const onboard=board.positions[i]===GATE;
    light(826+i*19,299,6,'#172a33');
    light(826+i*19,299,3.8,onboard?crew[i].color:'#61716f',onboard?13:0);
  }
  if(board.positions.includes(SIDING)) light(862,411,5,'#ffc271',14);
}
