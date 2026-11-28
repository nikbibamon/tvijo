import {button,element} from './boards.js';
import {elevations,field,powerLabels,trace} from './duel.js';

const names=['Робот','Гуманоид'];
const colors=['#b3f7df','#ffb98e'];
const {width,height,water}=field;
const shotTime=1050;
export const duelDuration=motion=>motion?.length&&!matchMedia('(prefers-reduced-motion: reduce)').matches?shotTime*motion.length:0;

function land(ctx,terrain) {
  const rock=ctx.createLinearGradient(0,37,0,water+4);
  rock.addColorStop(0,'#b26a6b');
  rock.addColorStop(.46,'#744563');
  rock.addColorStop(1,'#392b50');
  for (const [x,y] of terrain.entries()) {
    if (y===null) continue;
    ctx.fillStyle=rock;
    ctx.fillRect(x,y,1.04,water+1-y);
    ctx.fillStyle=x%6===0?'#ffda9a':'#cc8b70';
    ctx.fillRect(x,y,1.04,1.4);
    const seam=y+3+((x*29)%9);
    ctx.fillStyle=x%4===0?'#94709b':'#533855';
    if (seam<water) ctx.fillRect(x,seam,1.02,Math.min(2,water-seam));
  }
}

function pool(ctx,time) {
  const waterTint=ctx.createLinearGradient(0,water,0,height);
  waterTint.addColorStop(0,'#38859c');
  waterTint.addColorStop(1,'#172e55');
  ctx.fillStyle=waterTint;
  ctx.fillRect(0,water,width,height-water);
  for (let line=0;line<3;line++) {
    ctx.fillStyle=['#91d5da','#509fb7','#2d6287'][line];
    for (let x=0;x<width;x+=3) {
      const y=water+line*2.6+Math.sin(x/7+time/330+line)*.46;
      ctx.fillRect(x,y,2.8,.34);
    }
  }
}

function arcGuide(ctx,target) {
  ctx.fillStyle='#fff5ce';
  for (let i=0;i<target.points.length;i+=3) {
    const {x,y}=target.points[i];
    ctx.globalAlpha=.84-i/target.points.length*.45;
    ctx.fillRect(x-.31,y-.31,.63,.63);
  }
  ctx.globalAlpha=1;
  if (target.kind==='water') return;
  ctx.strokeStyle=target.kind==='hit'?'#c5ffd2':'#ffde9a';
  ctx.lineWidth=.24;
  ctx.beginPath();
  ctx.arc(target.x,target.y,2.1,0,Math.PI*2);
  ctx.stroke();
}

function capsule(ctx,point,color) {
  ctx.fillStyle='#fff6db';
  ctx.shadowColor=color;
  ctx.shadowBlur=19;
  ctx.beginPath();
  ctx.arc(point.x,point.y,.95,0,Math.PI*2);
  ctx.fill();
  ctx.shadowBlur=0;
}

function burst(ctx,target,progress,color) {
  const {x,y}=target;
  ctx.globalAlpha=1-progress;
  ctx.strokeStyle=color;
  ctx.lineWidth=.44;
  ctx.beginPath();
  ctx.arc(x,y,.8+progress*(target.kind==='water'?5:9),0,Math.PI*2);
  ctx.stroke();
  ctx.fillStyle=color;
  for (let i=0;i<10;i++) {
    const phase=i*Math.PI/5;
    const dx=Math.cos(phase)*progress*(5+i%3), dy=Math.sin(phase)*progress*(4+i%3);
    ctx.fillRect(x+dx,y+dy,.7,.7);
  }
  ctx.globalAlpha=1;
}

function place(actor,pilot) {
  actor.hidden=pilot.y>=water+2;
  actor.style.setProperty('--x',pilot.x/width*100+'%');
  actor.style.setProperty('--y',pilot.y/height*100+'%');
  actor.classList.toggle('spent',!pilot.shield);
}

export function showDuelBoard(layout,state,motion,duration) {
  const root=element('div','duel-board');
  const scores=element('div','duel-scores'), arena=element('div','duel-arena');
  const panels=names.map((name,i)=>{
    const panel=element('div','duel-score');
    panel.style.setProperty('--team',colors[i]);
    const caption=element('div','duel-score-caption'), value=element('strong');
    caption.append(element('span','',name),value);
    const meter=element('div','duel-meter'), fill=element('i');
    meter.setAttribute('aria-hidden','true');
    meter.append(fill);
    panel.append(caption,meter);
    scores.append(panel);
    return {value,fill};
  });
  const canvas=element('canvas');
  canvas.width=960;
  canvas.height=560;
  const ctx=canvas.getContext('2d');
  ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
  const actors=[element('span','duel-actor duel-robot'),element('span','duel-actor duel-blue')];
  for (const [i,actor] of actors.entries()) {
    actor.style.setProperty('--team',colors[i]);
    actor.setAttribute('aria-hidden','true');
  }
  const turn=element('span','duel-turn');
  turn.setAttribute('role','status');
  const forecast=element('p','duel-forecast');
  arena.append(canvas,...actors,turn);
  root.append(scores,arena,forecast);

  function draw(board,time=0) {
    ctx.clearRect(0,0,width,height);
    land(ctx,board.terrain);
    pool(ctx,time);
    for (const [i,pilot] of board.pilots.entries()) {
      place(actors[i],pilot.y===water?{...pilot,y:water+2}:pilot);
      panels[i].value.textContent='Щит '+pilot.shield;
      panels[i].fill.style.width=pilot.shield+'%';
    }
  }

  function caption(text) {
    if (turn.textContent!==text) turn.textContent=text;
  }

  function ready() {
    draw(state);
    if (state.outcome) {
      caption(state.outcome==='won'?'Победа Робота':state.outcome==='lost'?'Победа Гуманоида':'Ничья');
      forecast.textContent='Раунд завершён';
      return;
    }
    const target=trace(layout,state,0,state.angle,state.force,true);
    arcGuide(ctx,target);
    caption('Ход Робота');
    forecast.textContent={hit:'По этой дуге капсула попадёт в щит.',ground:'По этой дуге капсула попадёт в грунт.',
      water:'По этой дуге капсула уйдёт в воду.'}[target.kind];
  }

  if (!duration) ready();
  else {
    const start=performance.now();
    draw(motion[0].before);
    function animate(time) {
      if (!root.isConnected) return;
      const elapsed=Math.max(0,time-start);
      if (elapsed>=duration) {ready();return;}
      const shot=motion[Math.floor(elapsed/shotTime)], phase=elapsed%shotTime/shotTime;
      const impact=.69;
      caption(shot.side===0?'Бросок Робота':'Ответ Гуманоида');
      if (phase<impact) {
        draw(shot.before,time);
        const points=shot.target.points;
        const point=points[Math.min(points.length-1,Math.floor(phase/impact*points.length))];
        capsule(ctx,point,colors[shot.side]);
      } else {
        draw(shot.after,time);
        const progress=(phase-impact)/(1-impact);
        for (const [i,pilot] of shot.after.pilots.entries()) {
          const previous=shot.before.pilots[i];
          if (pilot.x===previous.x && pilot.y===previous.y) continue;
          const x=previous.x+(pilot.x-previous.x)*progress;
          const y=previous.y+((pilot.y===water?water+3:pilot.y)-previous.y)*progress-Math.sin(progress*Math.PI)*3;
          place(actors[i],{x,y,shield:pilot.shield});
        }
        burst(ctx,shot.target,progress,colors[shot.side]);
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
  canvas.setAttribute('aria-label','Тренировочная арена. Два островка над водой.');
  canvas.setAttribute('role','img');
  return root;
}

export function showDuelControls(layout,state,respond) {
  const root=element('div','pg-device duel-device');
  const wind=layout.wind;
  const windText=wind===0?'Ветер · штиль':'Ветер · '+(wind<0?'влево':'вправо')+' · '+(Math.abs(wind)>=1.4?'сильный':'слабый');
  root.append(element('p','duel-wind',windText));
  root.append(button('Запустить капсулу','launch',()=>respond('launch'),'pg-button primary'));
  for (const [setting,label,choices,unit] of [['angle','Угол',elevations,'°'],['force','Сила',powerLabels,'%']]) {
    const group=element('fieldset','pg-choice');
    group.append(element('legend','',label));
    for (const [value,choice] of choices.entries()) {
      const control=button(choice+unit,setting+'-'+value,()=>respond({setting,value}));
      control.setAttribute('aria-pressed',String(value===state[setting]));
      control.setAttribute('aria-label',label+' '+choice+unit);
      group.append(control);
    }
    root.append(group);
  }
  return root;
}
