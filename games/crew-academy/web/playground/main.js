import {bus, state, write, note} from '../tvijoService.js';
import {applyPlayground, games, makeLevel, savedRun} from './levels.js';
import {element, showBoard, showControls} from './boards.js';

const byId = id=>document.getElementById(id);
const lobby=byId('pg-lobby'), room=byId('pg-run'), board=byId('pg-board');
const controls=byId('pg-controls'), detail=byId('pg-description'), feedback=byId('pg-feedback'), next=byId('pg-next');
const undo=byId('pg-undo'), hint=byId('pg-hint'), restart=byId('pg-restart');
const arrows={ArrowUp:'up', ArrowRight:'right', ArrowDown:'down', ArrowLeft:'left'};
let gameId, run, layout, busy=false;

function presentLobby() {
  const cards = Object.entries(games).map(([id,game])=>{
    const progress=savedRun(state,id);
    const card=element('a','pg-card');
    card.href='#'+id;
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
  const focused = document.activeElement?.dataset.control;
  layout = makeLevel(gameId,run.level,run.seed);
  const move = input => take('move',input);
  byId('pg-title').textContent=game.title;
  byId('pg-hero').textContent=game.hero;
  byId('pg-portrait').className='pg-sprite '+game.sprite;
  byId('pg-level').textContent='Уровень '+run.level;
  byId('pg-board-note').textContent=run.won?'Готово':gameId==='post'?'Броски · '+run.moves:'Ходы · '+run.moves;
  detail.textContent=gameId==='post'&&run.level>1 ? 'Подбери дугу и силу. Пунктир покажет, где остановится капсула.' : game.instructions;
  board.replaceChildren(showBoard(gameId,layout,run.board,move,result.motion));
  controls.replaceChildren(showControls(gameId,layout,run.board,move));
  controls.hidden = run.won;
  for (const item of board.querySelectorAll('button')) item.disabled=run.won;
  feedback.textContent = run.won ? ({ice:'Самолётик причалил к маяку.',wire:'Лампа горит.',post:'Капсула на площадке.'}[gameId])
    : result.message ?? '';
  byId('pg-finish').hidden=!run.won;
  next.textContent='Собрать уровень '+(run.level+1)+' · 0 кредитов';
  undo.hidden = run.won;
  undo.disabled = !run.undo.length;
  hint.hidden = run.won;
  restart.textContent=run.won?'Повторить уровень':'Начать заново';
  if (!run.won && !result.message && run.level===1) showHint(game.hint(layout,run.board));
  if (result.firstWin) next.focus({preventScroll:true});
  else if (focused) [...room.querySelectorAll('[data-control]')].find(el=>el.dataset.control===focused)?.focus({preventScroll:true});
}

function route() {
  const id = location.hash.slice(1);
  gameId=Object.hasOwn(games,id)?id:null;
  lobby.hidden=Boolean(gameId);
  room.hidden=!gameId;
  document.body.dataset.game=gameId??'lobby';
  if (gameId) {
    run=savedRun(state,gameId);
    presentRun();
    document.title=games[gameId].title+' · Игровой полигон';
  } else {
    presentLobby();
    document.title='Игровой полигон · Академия экипажа';
  }
}

async function take(type,input) {
  if (!gameId || busy || run.won && !['next','restart'].includes(type)) return;
  const id=gameId, {level,seed}=run;
  busy=true;
  next.disabled=true;
  try {
    const entropy = type==='next'?crypto.getRandomValues(new Uint32Array(1))[0]:0;
    const result=await write(profile=>{
      const change=applyPlayground(profile,id,{type,input,level,seed},entropy);
      if (change.firstWin) note(profile,'field','Игровой полигон · '+games[id].title+' · уровень '+level+' пройден.');
      return change;
    });
    if (id!==gameId) return;
    const newlyWon = result.run.won && !run.won;
    run=result.run;
    presentRun({...result,firstWin:newlyWon});
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
  if (gameId!=='ice'||event.altKey||event.ctrlKey||event.metaKey||!Object.hasOwn(arrows,event.key)) return;
  event.preventDefault();
  take('move',arrows[event.key]);
});
bus.addEventListener('change',()=>{
  if (!busy && (!gameId || state.playground?.[gameId]!==run)) route();
});
route();
