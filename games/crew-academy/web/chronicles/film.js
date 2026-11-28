import {chapters} from './episodes.js';

const byId = id=>document.getElementById(id);

export function createFilm() {
  const modal=byId('ch-film'), stage=byId('ch-film-stage'), subtitles=byId('ch-subtitles');
  const play=byId('ch-film-play'), next=byId('ch-film-next'), position=byId('ch-film-position');
  let frames=[], index=0, timer=0, remaining=0, deadline=0, playing=false;

  function schedule() {
    clearTimeout(timer);
    stage.classList.toggle('paused',!playing);
    play.textContent=playing?'Пауза':index<frames.length?'Продолжить':'Смотреть сначала';
    if (playing) {
      deadline=performance.now()+remaining;
      timer=setTimeout(advance,remaining);
    }
  }

  function frame() {
    const shot=frames[index];
    remaining=5600;
    const view=document.createElement('div');
    view.className='ch-film-view';
    view.dataset.shot=shot.shot;
    const image=document.createElement('img');
    image.src='./chronicles/art/'+shot.era+'.webp';
    image.alt='';
    const light=document.createElement('i');
    view.append(image,light);
    stage.replaceChildren(view);
    subtitles.textContent=shot.line;
    position.textContent=(index+1)+' / '+frames.length;
    next.textContent=index===frames.length-1?'Вернуться к игре':'Следующий кадр';
    schedule();
  }

  function advance() {
    index++;
    if (index<frames.length) frame();
    else { playing=false;schedule(); }
  }

  byId('ch-film-close').onclick=()=>modal.close();
  modal.addEventListener('close',()=>{playing=false;clearTimeout(timer);});
  play.onclick=()=>{
    if (index>=frames.length) {index=0;playing=true;frame();return;}
    if (playing) remaining=Math.max(0,deadline-performance.now());
    playing=!playing;
    schedule();
  };
  next.onclick=()=>{if(index>=frames.length-1) modal.close();else advance();};

  return function watch(id) {
    const chapter=chapters[id];
    if (!chapter?.film || modal.open) return;
    byId('ch-film-title').textContent=chapter.name;
    frames=chapter.film;
    index=0;
    playing=true;
    modal.showModal();
    frame();
  };
}
