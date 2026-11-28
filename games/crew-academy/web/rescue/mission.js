export const rescueSteps = [
  {phase:'survey', role:'drone', action:'scan', then:'mark', label:'Разведка'},
  {phase:'mark', role:'drone', action:'mark', then:'anchor', label:'Метка'},
  {phase:'anchor', role:'robot', action:'anchor', then:'cross', label:'Трос'},
  {phase:'cross', role:'drone', action:'cross', then:'pull', label:'Захват'},
  {phase:'pull', role:'robot', action:'pull', then:'done', label:'Подъём'}
];

export const isRescueLane = value => value==='upper'||value==='lower';

export function rescueView(row, viewer) {
  const role = row.drone===viewer?'drone':'robot';
  return {
    mission:row.mission, role, phase:row.phase, partner:row.partner,
    lane:role==='drone' && row.phase==='mark' || !['survey','mark'].includes(row.phase) ? row.lane : null,
    finished:row.finished
  };
}

export function intendedStep(row, viewer, action, lane) {
  const order = rescueSteps.find(step=>step.action===action);
  if (!order) return {error:'action',status:422};
  if (order.role!==(row.drone===viewer?'drone':'robot')) return {error:'rescue_role',status:403};
  const needsLane = action==='mark'||action==='anchor';
  if (needsLane && !isRescueLane(lane) || !needsLane && lane!==undefined) return {error:'action',status:422};
  const phaseIndex = row.phase==='done'?rescueSteps.length:rescueSteps.findIndex(step=>step.phase===row.phase);
  const orderIndex = rescueSteps.indexOf(order);
  if (orderIndex>phaseIndex) return {error:'rescue_phase',status:409};
  if (needsLane && lane!==row.lane) return {error:'rescue_lane',status:422};
  return orderIndex<phaseIndex?{duplicate:true}:{next:order.then};
}

export const rescueHref = other => './rescue-together.html'+(other?'#'+other:'');

export function rescueLine({role,lane,partner}) {
  const operator = role==='drone'?'Самолётик':'Робот';
  const track = lane==='upper'?'верхней линии':'нижней линии';
  return operator+' и пилот «'+partner+'» подняли капсулу по '+track+'.';
}
