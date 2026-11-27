import {collectPrize, hasPrize} from '../expedition/rooms.js';

export const stations = {
  lamp: {name:'Сигнальная лампа', prize:'chain', goal:'Поверни желоб к рычагу и подведи рычаг к контакту. Затем пусти шар.'},
  pump: {name:'Контур охлаждения', prize:'chain-pump', goal:'Лампа горит. Переведи стрелку на нижнюю ветку и запусти насос.'}
};
export const arrival = {
  pocket:'Шар скатился в ловушку. Поверни желоб к рычагу.',
  gap:'Шар провалился перед рычагом. Подведи рычаг к контакту.',
  lamp:'Контакт замкнут. Сигнальная лампа горит!',
  pump:'Насос включился. Жидкость пошла по контуру охлаждения!'
};

export const machine = {
  feed:[[158,191],[203,204],[306,242]],
  pocket:[[354,320],[363,382],[351,416],[333,431]],
  track:[[393,276],[459,300]],
  gap:[[427,334],[408,382],[409,429]],
  rocker:[[505,317],[577,332]],
  lamp:[[652,345],[731,359],[777,369]],
  pump:[[644,402],[728,447],[777,449]]
};

export function chainOutcome({ramp,contact}) {
  if (!ramp) return 'trap';
  return contact?'won':'gap';
}

export function trajectory(station, run) {
  const start = machine.feed.slice();
  const gate=chainOutcome({ramp:run.guide,contact:run.lever});
  if (gate==='trap') return {outcome:'pocket', path:start.concat(machine.pocket)};
  if (gate==='gap') return {outcome:'gap', path:start.concat([machine.track[0]],machine.gap)};
  const outcome = station === 'pump' && run.branch === 'pump' ? 'pump' : 'lamp';
  return {outcome, path:start.concat(machine.track,machine.rocker,machine[outcome])};
}

export function ballAt(path, progress) {
  const lengths = path.slice(1).map(([x,y],index)=>Math.hypot(x-path[index][0],y-path[index][1]));
  let remaining = lengths.reduce((total,length)=>total+length,0)*Math.min(1,Math.max(0,progress));
  for (let i=0;i<lengths.length;i++) {
    if (remaining<=lengths[i] && lengths[i]>0) {
      const [x,y]=path[i], [nextX,nextY]=path[i+1], fraction=remaining/lengths[i];
      return [x+(nextX-x)*fraction,y+(nextY-y)*fraction];
    }
    remaining-=lengths[i];
  }
  return path.at(-1);
}

export function chainUnlocked(profile, station) {
  return station==='lamp' || station==='pump' && hasPrize(profile,'chain');
}

const newRun = (station, legacy) => ({
  guide:station==='pump'||legacy?.guide===true,
  lever:station==='pump'||legacy?.lever===true,
  branch:'lamp', attempts:0, last:null, solved:false
});

export function chainRun(profile, station, previous) {
  const saved=profile.chainLab?.runs?.[station];
  if (saved && typeof saved==='object') return saved;
  const legacy=station==='lamp'?previous?.board:null;
  const run=newRun(station,{guide:legacy?.ramp,lever:legacy?.contact});
  if (legacy?.result==='won' && run.guide && run.lever) return {...run,last:'lamp',solved:true};
  return run;
}

function keepRun(profile, station, run) {
  profile.chainLab={active:station,runs:{...profile.chainLab?.runs,[station]:run}};
}

export function applyCircuit(profile, station, action, previous, time) {
  if (!Object.hasOwn(stations,station)||!chainUnlocked(profile,station)) return null;
  const run=chainRun(profile,station,previous);
  if (action==='open') {
    keepRun(profile,station,run);
    if (run.solved) collectPrize(profile,stations[station].prize);
    return {run};
  }
  if (action==='replay') {
    if (!run.solved) return null;
    const fresh=newRun(station);
    keepRun(profile,station,fresh);
    return {run:fresh};
  }
  if (run.solved || profile.chainLab?.active!==station) return null;
  let next, shot, report;
  if (action==='return' && run.last) {
    next={...run,last:null};
  } else if (!run.last && (action==='guide'||action==='lever')) {
    next={...run,[action]:!run[action]};
  } else if (!run.last && action==='branch' && station==='pump') {
    next={...run,branch:run.branch==='lamp'?'pump':'lamp'};
  } else if (!run.last && action==='launch') {
    shot=trajectory(station,run);
    const solved=shot.outcome===station;
    next={...run,attempts:run.attempts+1,last:shot.outcome,solved};
    if (solved) {
      collectPrize(profile,stations[station].prize);
      report={station,at:time,launches:next.attempts};
      profile.chainReports={...profile.chainReports,[station]:report};
    }
  } else {
    return null;
  }
  keepRun(profile,station,next);
  return {run:next,shot,report};
}

export function circuitLine(report) {
  return (report.station==='lamp'?'Лампа загорелась.':'Насос наполнил контур охлаждения.')+' Пусков — '+report.launches+'.';
}

export function circuitRoute(profile) {
  const active=profile.chainLab?.active;
  const pump=chainRun(profile,'pump');
  if (hasPrize(profile,'chain-pump') && (active!=='pump'||pump.solved)) return null;
  const target=active==='lamp'&&!chainRun(profile,'lamp').solved?'lamp':chainUnlocked(profile,'pump')?'pump':'lamp';
  return {kind:'room',title:'Цепная реакция',place:'Энергоблок',action:target==='pump'?'Продолжить пуск насоса':'Продолжить запуск',
    href:'./expedition.html#chain/'+target,art:'./chain/power-chamber.webp',
    text:stations[target].goal,detail:stations[target].name};
}
