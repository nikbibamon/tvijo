import {collectPrize, hasPrize} from '../expedition/rooms.js';
import {changeRun, crew, dayPrize, modes, nightPrize, rescued, restoreRun} from './rules.js';

export function applySluice(profile, legacy, action, at) {
  const before = restoreRun(profile.sluice,legacy);
  const after = changeRun(before,action,hasPrize(profile,dayPrize));
  if (after === before) return null;
  profile.sluice = after;
  const board = after.board;
  if (rescued(before.board) === crew.length || rescued(board) !== crew.length) return {run:after};
  const id = board.mode === 'night' ? nightPrize : dayPrize;
  const report = {mode:board.mode, builder:board.builder, signaller:board.signaller, detours:board.detours, switches:board.switches, turns:board.turns, at};
  profile.sluiceReports = {...profile.sluiceReports, [board.mode]:report};
  return {run:after, report, fresh:collectPrize(profile,id), prize:id};
}

export function sluiceRoute(profile) {
  const b = restoreRun(profile.sluice).board, count = rescued(b);
  const night = b.mode === 'night';
  return {kind:'sluice',title:'Ремонтный шлюз',place:'Оранжерея дронов',
    detail:modes[b.mode]+' · в шлюзе '+count+' / 5',
    text:night ? 'Пять ремонтников делят один источник питания. Переключай его между лифтом и маяком, чтобы собрать колонну.' :
      'У разрыва нужен строитель, у развилки — стрелочник. Доведи пятерых ремонтников до шлюза.',
    action:'Продолжить смену дронов',href:'./expedition.html#drones',art:'./sluice/'+(night?'night':'hangar')+'.webp'};
}
