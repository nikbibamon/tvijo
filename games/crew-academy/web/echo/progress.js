import {mineAction, mineReport, minePrize, restoreMine} from './rules.js';
import {collectPrize} from '../expedition/rooms.js';

export function applyMineAction(profile, action, at) {
  const before = restoreMine(profile.echoMine);
  const after = mineAction(before,action);
  if (after === before) return null;
  profile.echoMine = after;
  if (before.phase === 0 && after.phase === 1) profile.tallies.verified++;
  if (after.phase !== 3) return {run:after};
  const report = {...mineReport(after), at};
  profile.echoMineReport = report;
  const firstPrize = collectPrize(profile,minePrize);
  // The illustrated rescue clears the campaign stop once its preceding rift is open and completed.
  if (profile.completed.includes('rift') && !profile.completed.includes('mine')) {
    const stage = profile.stages.mine ||= {done:[],observed:[],turns:0,digest:null};
    stage.done = [...new Set([...(stage.done||[]),'scan','compare','rescue'])];
    profile.completed.push('mine');
  }
  return {run:after,report,firstPrize};
}
