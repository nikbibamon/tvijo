import {power, wire} from '../playground/wire.js';
import {scenes} from './river-story.js';

const version = 1;
const trackAnswer = ['star','water'];
export const seaplaneRadio = {
  ...wire.first,
  turns:wire.first.turns.map((_, i)=>i===6 || i===8 ? 1 : 0)
};

export function riverState(raw) {
  const data = raw?.v===version ? raw : {};
  const step = Number.isInteger(data.step) && data.step>=0 && data.step<scenes.length ? data.step : 0;
  const scene = scenes[step];
  const rotations = wire.start(seaplaneRadio).rotations.map((initial, i)=>{
    const turn = data.rotations?.[i];
    return scene.kind==='wire' && seaplaneRadio.modules[i] && Number.isInteger(turn) && turn>=0 && turn<4 ? turn : initial;
  });
  const tracks = ['sun','stone'].map((initial, i)=>scene.kind==='tracks' && data.tracks?.[i]===trackAnswer[i] ? trackAnswer[i] : initial);
  const choiceCount = Number.isInteger(data.choiceCount) && data.choiceCount>=0 && data.choiceCount<= (scene.answers?.length ?? 0)
    ? data.choiceCount : 0;
  const cleared = data.cleared===true && (
    scene.kind==='inspect' ||
    scene.kind==='choice' && choiceCount===scene.answers.length ||
    scene.kind==='wire' && power(seaplaneRadio,rotations).won ||
    scene.kind==='tracks' && tracks.every((mark,i)=>mark===trackAnswer[i])
  );
  return {v:version,step,cleared,choiceCount,rotations,tracks};
}

export const clearedStops = run => run.step+Number(run.cleared);
export const finished = run => clearedStops(run)===scenes.length;

export function chapterAction(profile, action) {
  const run = riverState(profile.riverChronicle);
  const scene = scenes[run.step];
  const reply = message=>({run,message});
  function save(next, message='', found=null) {
    profile.riverChronicle = next;
    return {run:next,message,found};
  }
  const solve = (changes={})=>save({...run,...changes,cleared:true},scene.found,scene);
  if (!action || action.step!==run.step) return reply('');
  if (action.type==='next') {
    return run.cleared && !finished(run) ? save(riverState({v:version,step:run.step+1})) : reply('');
  }
  if (run.cleared) return reply(scene.found);
  if (action.type==='inspect' && scene.kind==='inspect') return solve();
  if (action.type==='choose' && scene.kind==='choice') {
    if (action.answer!==scene.answers[run.choiceCount]) return reply(scene.retry);
    const choiceCount = run.choiceCount+1;
    return choiceCount===scene.answers.length ? solve({choiceCount}) : save({...run,choiceCount},scene.between);
  }
  if (action.type==='rotate' && scene.kind==='wire') {
    const result = wire.move(seaplaneRadio,{rotations:run.rotations},action.cell);
    if (!result) return reply('');
    return result.won ? solve(result.state) : save({...run,...result.state},result.message);
  }
  if (action.type==='switch' && scene.kind==='tracks' && [0,1].includes(action.index)) {
    const tracks = run.tracks.slice();
    const fallback = action.index===0 ? 'sun' : 'stone';
    tracks[action.index] = tracks[action.index]===fallback ? trackAnswer[action.index] : fallback;
    return save({...run,tracks});
  }
  if (action.type==='ride' && scene.kind==='tracks') {
    return run.tracks.every((mark,i)=>mark===trackAnswer[i]) ? solve() : reply(scene.retry);
  }
  return reply('');
}
