import {elevation,height,width} from './game.js';

export const canvasSize={width:730,height:424};
const halfX=45, halfY=22, stride=25;
const colors=[
  ['#467f74','#37566a','#5b9b80','#b6dfa0'],
  ['#784d45','#5a3b48','#a97758','#f2bc78'],
  ['#4d596f','#293d58','#828ca7','#b7bfde'],
  ['#326d85','#224761','#53aaa6','#c5ffee']
];
const order=Array.from({length:width*height},(_,i)=>i).sort((a,b)=>a%width+Math.floor(a/width)-b%width-Math.floor(b/width));

export function point(index,level=0) {
  const x=index%width,z=Math.floor(index/width);
  return {x:320+(x-z)*halfX,y:132+(x+z)*halfY-level*stride};
}

function poly(c,points,fill,stroke=null) {
  c.beginPath();
  for (const [i,p] of points.entries()) {
    if (i===0) c.moveTo(...p);
    else c.lineTo(...p);
  }
  c.closePath();
  if (fill) {c.fillStyle=fill;c.fill();}
  if (stroke) {c.strokeStyle=stroke;c.stroke();}
}

function diamond(c,x,y,fill,stroke=null,scale=1) {
  const a=halfX*scale,b=halfY*scale;
  poly(c,[[x-a,y],[x,y-b],[x+a,y],[x,y+b]],fill,stroke);
}

function cube(c,{x,y},material,variant) {
  const [left,right,top,rim]=colors[material];
  poly(c,[[x-halfX,y],[x,y+halfY],[x,y+halfY+stride],[x-halfX,y+stride]],left,'#171b2dbb');
  poly(c,[[x,y+halfY],[x+halfX,y],[x+halfX,y+stride],[x,y+halfY+stride]],right,'#171b2dbb');
  diamond(c,x,y,top,'#2e465b');
  c.fillStyle=rim;
  c.globalAlpha=.53;
  poly(c,[[x-halfX+3,y],[x,y-halfY+2],[x+halfX-3,y],[x,y-halfY+5]],rim);
  for(let i=0;i<4;i++) {
    const dx=(variant*31+i*17)%26+6, dy=(variant*13+i*7)%12;
    c.fillRect(x-dx,y+halfY+7-dx*.45+dy,3+(i%2)*3,2);
  }
  c.globalAlpha=1;
}

function sky(c) {
  const w=canvasSize.width,h=canvasSize.height;
  const horizon=c.createLinearGradient(0,0,0,h);
  horizon.addColorStop(0,'#20203f');
  horizon.addColorStop(.66,'#252b4a');
  horizon.addColorStop(1,'#172139');
  c.fillStyle=horizon;c.fillRect(0,0,w,h);
  const glow=c.createRadialGradient(555,80,5,555,80,200);
  glow.addColorStop(0,'#8170a47e');glow.addColorStop(1,'#54436100');
  c.fillStyle=glow;c.fillRect(0,0,w,h);
  c.beginPath();c.arc(573,67,31,0,Math.PI*2);c.fillStyle='#eee1b0';c.fill();
  c.beginPath();c.arc(584,58,28,0,Math.PI*2);c.fillStyle='#64547d';c.fill();
  for (let i=0;i<53;i++) {
    c.fillStyle=i%7===0?'#fff0cfb8':'#babbd36c';
    const x=(i*127+13)%w,y=(i*61+19)%300,size=i%7===0?2:1;
    c.fillRect(x,y,size,size);
  }
  for (let i=0;i<5;i++) {
    const x=19+i*175,y=112+(i%3)*55,w=27+(i%2)*13;
    poly(c,[[x-w,y],[x,y-13],[x+w,y],[x,y+22]],'#80749c52');
    poly(c,[[x-w,y],[x,y+8],[x+w,y],[x+2,y+11]],'#9a91b367');
  }
}

function pilot(c,{x,y}) {
  c.save();c.translate(Math.round(x),Math.round(y));
  const parts=[
    ['#111629',-12,-4,24,4],['#1c1c2f',-10,-27,20,24],['#1c1c2f',-10,-43,20,19],
    ['#655049',-7,-42,14,5],['#58403a',-10,-39,18,5],['#f2bf9b',-7,-34,15,10],
    ['#ffe0b4',0,-33,6,7],['#292236',4,-33,2,3],['#456c81',-8,-24,15,15],
    ['#efbd6d',-8,-24,15,4],['#c18462',7,-22,4,9],['#334557',-7,-10,6,8],
    ['#42536b',2,-10,6,8],['#d4b493',-8,-4,7,3],['#e8ccad',2,-4,7,3]
  ];
  for(const [t,a,b,w,h] of parts){c.fillStyle=t;c.fillRect(a,b,w,h);}
  c.restore();
}

function clock(c,{x,y},on) {
  c.save();c.translate(x,y);
  c.fillStyle='#231a2b';c.fillRect(-20,-10,40,10);
  c.fillStyle='#93604b';c.fillRect(-17,-13,34,8);
  c.strokeStyle=on?'#ffdb8e':'#e3ae72';c.lineWidth=4;
  if (on) {c.shadowColor='#ffcf75';c.shadowBlur=18;}
  c.fillStyle='#28233d';c.beginPath();c.arc(0,-30,21,0,Math.PI*2);c.fill();c.stroke();
  c.shadowBlur=0;c.strokeStyle='#fff0d4';c.lineWidth=2;
  c.beginPath();c.moveTo(0,-43);c.lineTo(0,-30);c.lineTo(9,-25);c.stroke();
  c.restore();
}

export function paint(c,room,board,selected,path,actorAt,arrived=false) {
  sky(c);
  const {stacks}=board;
  c.lineWidth=1;
  for (const index of order) {
    if (!elevation(room,stacks,index)) {
      const {x,y}=point(index);
      c.setLineDash([3,5]);
      diamond(c,x,y,'#a0bfda0b','#abc4e638');
      c.setLineDash([]);
    }
    const floor=room.ground[index];
    for(let level=1;level<=floor;level++) cube(c,point(index,level),0,index+level);
    for(const [offset,value] of stacks[index].entries()) cube(c,point(index,floor+offset+1),value+1,index+offset);
  }
  if(path?.length){
    c.beginPath();
    for(const [i,index] of path.entries()){
      const {x,y}=point(index,elevation(room,stacks,index));
      if(i===0)c.moveTo(x,y-1);
      else c.lineTo(x,y-1);
    }
    c.setLineDash([4,7]);c.lineWidth=2.4;c.strokeStyle='#d7f8e1';c.stroke();c.setLineDash([]);
  }
  if(room.relay!==null){
    const {x,y}=point(room.relay,elevation(room,stacks,room.relay));
    diamond(c,x,y,'#82f8e655','#d0fff2',.45);
  }
  const aim=point(selected,elevation(room,stacks,selected));
  c.lineWidth=2.4;diamond(c,aim.x,aim.y,'#ffc76731','#ffd87e',.96);
  c.lineWidth=1;
  if (room.id==='studio') return;
  const finish=point(room.end,elevation(room,stacks,room.end));
  const stage=actorAt??point(room.start,elevation(room,stacks,room.start));
  clock(c,finish,arrived);
  pilot(c,stage);
}

export function tileAt(x,y,room,stacks) {
  for(let i=order.length-1;i>=0;i--){
    const index=order[i], p=point(index,elevation(room,stacks,index));
    if(Math.abs(p.x-x)/halfX+Math.abs(p.y-y)/halfY<=1) return index;
  }
  return null;
}
