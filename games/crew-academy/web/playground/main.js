import {bus, state, write, note} from '../tvijoService.js';
import {applyPlayground, games, makeLevel, savedRun} from './levels.js';
import {element, showBoard, showControls} from './boards.js';
import {report as duelReport} from './duel.js';
import {duelDuration, showDuelBoard, showDuelControls} from './duelView.js';

const byId = id=>document.getElementById(id);
const lobby=byId('pg-lobby'), room=byId('pg-run'), board=byId('pg-board');
const controls=byId('pg-controls'), detail=byId('pg-description'), feedback=byId('pg-feedback'), next=byId('pg-next');
const undo=byId('pg-undo'), hint=byId('pg-hint'), restart=byId('pg-restart');
const embedded=document.getElementById('camp-training');
const host=embedded??document.body;
const arrows={ArrowUp:'up', ArrowRight:'right', ArrowDown:'down', ArrowLeft:'left'};
let gameId, run, layout, busy=false;

function presentLobby() {
  const cards = Object.entries(games).map(([id,game])=>{
    const progress=savedRun(state,id);
    const card=element('a','pg-card');
    card.href=(embedded?'#training/':'#')+id;
    card.dataset.game=id;
    const art=element('div','pg-card-art');
    art.setAttribute('aria-hidden','true');
    art.append(element('span','pg-sprite '+game.sprite),element('i','pg-card-object'));
    const copy=element('div','pg-card-copy');
    copy.append(element('small','',game.hero),element('h2','',game.title),element('p','',game.hook),
      element('strong','pg-card-action',progress.best||progress.moves?'Продолжить · уровень '+progress.level:'Играть'));
    card.append(art,copy);
    return card;
  });
  byId('pg-cards').replaceChildren(...cards);
}

function showHint(hint) {
  if (!hint) return;
  feedback.textContent=hint.text;
  for (const control of room.querySelectorAll('[data-clue]')) control.removeAttribute('data-clue');
  const target = hint.control==='undo' ? undo :
    [...room.querySelectorAll('[data-control]')].find(el=>el.dataset.control===String(hint.control));
  target?.setAttribute('data-clue','');
}

function presentRun(result={}) {
  const game = games[gameId];
  const focused = result.focusControl??document.activeElement?.dataset.control;
  layout = makeLevel(gameId,run.level,run.seed);
  const move = input => take('move',input);
  const duel = gameId==='duel';
  const playing=Boolean(result.duration), ended=duel&&Boolean(run.board.outcome);
  byId('pg-title').textContent=game.title;
  byId('pg-hero').textContent=game.hero;
  byId('pg-portrait').className='pg-sprite '+game.sprite;
  byId('pg-level').textContent='Уровень '+run.level;
  byId('pg-board-note').textContent=duel?'Раунд · '+(run.won||ended||playing?run.board.turn:run.board.turn+1):
    run.won?'Готово':gameId==='post'?'Броски · '+run.moves:'Ходы · '+run.moves;
  detail.textContent=typeof game.instructions==='function' ? game.instructions(layout,run.level) :
    gameId==='post'&&run.level>1 ? 'Подбери дугу и силу. Пунктир покажет, где остановится капсула.' : game.instructions;
  board.replaceChildren(duel ? showDuelBoard(layout,run.board,result.motion,result.duration):showBoard(gameId,layout,run.board,move,result.motion));
  controls.replaceChildren(duel ? showDuelControls(layout,run.board,move):showControls(gameId,layout,run.board,move));
  controls.hidden = (run.won||ended) && !playing;
  if (playing) for (const item of controls.querySelectorAll('button')) item.disabled=true;
  for (const item of board.querySelectorAll('button')) item.disabled=run.won||playing;
  feedback.textContent = playing ? 'Капсула в полёте.' : run.won
    ? {duel:'Робот выиграл дуэль.',flight:'Самолётик открыл шлюз.',ice:'Самолётик причалил к маяку.',wire:'Лампа горит.',post:'Капсула на площадке.'}[gameId]
    : result.message ?? (duel?duelReport(run.board):'');
  byId('pg-finish').hidden=!run.won||playing;
  next.textContent='Собрать уровень '+(run.level+1)+' · 0 кредитов';
  undo.hidden = run.won && !playing;
  undo.disabled = !run.undo.length||playing;
  hint.hidden = (run.won||ended) && !playing;
  hint.disabled=restart.disabled=playing;
  restart.textContent=run.won?'Повторить уровень':ended?'Сыграть снова':'Начать заново';
  if (!duel && !run.won && !feedback.textContent && run.level===1) showHint(game.hint(layout,run.board));
  if (result.firstWin && !playing) next.focus({preventScroll:true});
  else if (ended && !playing && focused==='launch') restart.focus({preventScroll:true});
  else if (focused && !playing) [...room.querySelectorAll('[data-control]')].find(el=>el.dataset.control===focused)?.focus({preventScroll:true});
}

function route() {
  const id = location.hash.slice(embedded ? '#training/'.length : 1);
  gameId=Object.hasOwn(games,id)?id:null;
  lobby.hidden=Boolean(gameId);
  room.hidden=!gameId;
  host.dataset.game=gameId??'lobby';
  if (gameId) {
    run=savedRun(state,gameId);
    presentRun();
    if (!embedded) document.title=games[gameId].title+' · Игровой полигон';
  } else {
    presentLobby();
    if (!embedded) document.title='Игровой полигон · Академия экипажа';
  }
}

async function take(type,input) {
  if (!gameId || busy || run.won && !['next','restart'].includes(type)) return;
  const id=gameId, {level,seed}=run;
  const turn=id==='duel'&&type==='move'&&input==='launch'?run.board.turn:undefined;
  const focusControl=document.activeElement?.dataset.control;
  busy=true;
  next.disabled=true;
  try {
    const entropy = type==='next'?crypto.getRandomValues(new Uint32Array(1))[0]:0;
    const result=await write(profile=>{
      const change=applyPlayground(profile,id,{type,input,level,seed,turn},entropy);
      if (change.firstWin) note(profile,'field','Игровой полигон · '+games[id].title+' · уровень '+level+' пройден.');
      return change;
    });
    if (id!==gameId) return;
    const newlyWon = result.run.won && !run.won;
    run=result.run;
    const duration=id==='duel'?duelDuration(result.motion):0;
    if (duration) {
      presentRun({...result,duration});
      await new Promise(resolve=>setTimeout(resolve,duration+40));
      if (id!==gameId) return;
    }
    next.disabled=false;
    presentRun({...result,firstWin:newlyWon,focusControl});
    if (type==='next') byId('pg-title').focus({preventScroll:true});
  } catch {
    if (id===gameId) feedback.textContent='Не удалось сохранить ход. Попробуй ещё раз.';
  } finally {
    busy=false;
    next.disabled=false;
  }
}

function propose() {
  if (!run.won && !busy) showHint(games[gameId].hint(layout,run.board));
}

next.onclick=()=>take('next');
undo.onclick=()=>take('undo');
restart.onclick=()=>take('restart');
hint.onclick=propose;
window.addEventListener('hashchange',route);
window.addEventListener('keydown', event=>{
  if (embedded && (embedded.hidden || document.querySelector('dialog[open]'))) return;
  if (!['flight','ice'].includes(gameId)||event.altKey||event.ctrlKey||event.metaKey||!Object.hasOwn(arrows,event.key)) return;
  event.preventDefault();
  take('move',arrows[event.key]);
});
bus.addEventListener('change',()=>{
  if (!busy && (!gameId || state.playground?.[gameId]!==run)) route();
});
route();
