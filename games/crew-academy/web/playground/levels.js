import {seededRandom} from './grid.js';
import {flight} from './flight.js';
import {ice} from './ice.js';
import {wire} from './wire.js';
import {post} from './post.js';
import {duel} from './duel.js';

export const games = {duel,flight,ice,wire,post};
const version = 1;

export function makeLevel(id, level, seed) {
  const game = games[id];
  return level===1 ? game.first : game.generate(level,seededRandom(seed));
}

function initialRun(id, level=1, seed=0, best=0) {
  const layout = makeLevel(id,level,seed);
  return {version, level, seed, best, moves:0, won:false, board:games[id].start(layout), undo:[]};
}

export function savedRun(profile, id) {
  const run = profile.playground?.[id];
  if (run?.version===version && Number.isSafeInteger(run.level) && run.level>=1 &&
    Number.isInteger(run.seed) && run.seed>=0 && run.seed<=0xffffffff && run.board && Array.isArray(run.undo)) return run;
  return initialRun(id);
}

// Generation runs only on Next. It uses rules and a seed, without a wallet or network call.
export function applyPlayground(profile, id, action, entropy) {
  if (!Object.hasOwn(games,id)) return null;
  const game = games[id];
  const run = savedRun(profile,id);
  const {level,seed,best} = run;
  if (level!==action.level || seed!==action.seed) return {run};
  if (id==='duel' && action.turn!==undefined && action.turn!==run.board.turn) return {run};
  const keep = (next, meta={}) => {
    profile.playground = {...profile.playground,[id]:next};
    return {run:next,...meta};
  };

  if (action.type==='next' && run.won) return keep(initialRun(id, level+1, entropy>>>0, best));
  if (action.type==='restart') return keep(initialRun(id,level,seed,best));
  if (run.won) return {run};
  if (action.type==='undo' && run.undo.length) {
    const last = run.undo.at(-1);
    return keep({...run,...last,undo:run.undo.slice(0,-1)});
  }
  if (action.type!=='move') return {run};

  const change = game.move(makeLevel(id,level,seed),run.board,action.input);
  if (!change?.state) return {run,message:change?.message};
  const undo = [...run.undo.slice(-19),{board:run.board,moves:run.moves}];
  const won = Boolean(change.won);
  return keep({...run,board:change.state,won,best:won?Math.max(level,best):best,
    moves:run.moves+Number(!change.setting),undo},{motion:change.motion,message:change.message,firstWin:won&&best<level});
}
