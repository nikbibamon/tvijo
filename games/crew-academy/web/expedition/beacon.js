const meanings = ['слушать', 'питать', 'открыть'];
const signs = ['Две дуги', 'Кольцо', 'Створки'];
const blank = () => ({echo:false, power:false, shutters:false, verified:false, taken:false, words:['','',''], history:[]});

export function restoreBeacon(saved) {
  const state = blank();
  if (!saved || typeof saved !== 'object') return state;
  state.echo = saved.echo === true;
  state.power = saved.power === true;
  state.shutters = state.echo && state.power && saved.shutters === true;
  state.words = state.words.map((_, i) => meanings.includes(saved.words?.[i]) ? saved.words[i] : '');
  state.history = Array.isArray(saved.history) ? saved.history.filter(row => Array.isArray(row) && row.length === 3 && row.every(w => !w || meanings.includes(w))).slice(-18) : [];
  state.verified = state.shutters && matches(state.words) && saved.verified === true;
  state.taken = state.verified && saved.taken === true;
  return state;
}
const matches = words => meanings.every((word, i) => words[i] === word);

export function beaconAction(state, action, index, value) {
  switch (action) {
    case 'echo':
      state.echo = true;
      return 'Самолётик ловит ответ. Две дуги на антенне дрожат в такт эху.';
    case 'power':
      state.power = true;
      return 'Ассистентка опускает рычаг. Кольцо и кабель до шлюза загораются.';
    case 'shutters':
      if (!state.echo && !state.power) return 'Дочка ждёт. Дуги на антенне неподвижны, кабель у шлюза тёмный.';
      if (!state.echo) return 'Дочка указывает на антенну. В эфире ещё нет ответного сигнала.';
      if (!state.power) return 'Дочка касается холодного кабеля. До шлюза ещё не дошло питание.';
      state.shutters = true;
      return state.taken ? 'Створки расходятся. Постамент пуст, линза уже у экипажа.' : 'Створки разошлись. Под стеклом видна линза. Какие слова подходят трём знакам?';
    case 'word':
      if (state.verified || !Number.isInteger(index) || index < 0 || index > 2 || value && !meanings.includes(value)) return '';
      if (state.words[index] === value) return '';
      state.history = [...state.history.slice(-17), state.words.slice()];
      state.words[index] = value;
      return 'Запись в Блокноте изменена.';
    case 'undo':
      if (state.verified || !state.history.length) return 'Пока нечего отменять.';
      state.words = state.history.pop();
      return 'Предыдущая запись восстановлена.';
    case 'check':
      if (!state.shutters) return 'Сначала понаблюдай за тремя приборами. Попробуй обратиться к Дочке у шлюза.';
      if (state.words.some(w => !w)) return 'Подбери слово для каждого из трёх знаков.';
      if (!matches(state.words)) {
        const mismatch = state.words.findIndex((word, i) => word !== meanings[i]);
        return ['Сверь знак дуг с тем, что Самолётик делает у антенны.', 'Сверь знак кольца с рычагом и кабелем Ассистентки.', 'Сверь знак створок с движением двери рядом с Дочкой.'][mismatch];
      }
      state.verified = true;
      return 'Блокнот расшифрован. Защёлка на стекле открылась. Линзу можно взять.';
    case 'take':
      if (!state.verified) return 'Стекло закрыто. Сначала проверь запись в Блокноте.';
      state.taken = true;
      return 'Линза связи в рюкзаке. На постаменте осталось пустое гнездо.';
    default:
      return '';
  }
}

export function mountAlphabet(root, api) {
  const state = restoreBeacon(api.load());
  root.innerHTML = `
    <div class="alphabet-stage" aria-label="Антенна слева, блок питания в центре, створки шлюза справа">
      <img class="beacon-base" src="./expedition/art/beacon-idle.webp" alt="Самолётик у антенны, Ассистентка у рычага и Дочка у двустворчатого шлюза.">
      <div class="beacon-lit beacon-echo" aria-hidden="true"></div><div class="beacon-lit beacon-echo-mark" aria-hidden="true"></div>
      <div class="beacon-lit beacon-power" aria-hidden="true"></div><div class="beacon-lit beacon-power-mark" aria-hidden="true"></div>
      <div class="beacon-lit beacon-shutters" aria-hidden="true"></div><div class="beacon-lit beacon-door-mark" aria-hidden="true"></div>
      <div class="beacon-empty" aria-hidden="true"></div>
      <button class="scene-point antenna" data-order="echo" aria-label="Осмотреть антенну"><span>Антенна</span></button>
      <button class="scene-point energy" data-order="power" aria-label="Осмотреть блок питания"><span>Рычаг</span></button>
      <button class="scene-point gate" data-order="shutters" aria-label="Осмотреть створки"><span>Створки</span></button>
      <button class="scene-point lens" data-order="take" aria-label="Поднять линзу с постамента" hidden><span>Линза</span></button>
    </div>
    <div class="orders" aria-label="Приказы экипажу">
      <button data-order="echo"><img src="./art/crew/plane.webp" alt=""><span><small>Самолётик</small>Поймать эхо</span></button>
      <button data-order="power"><img src="./art/crew/assistant.webp" alt=""><span><small>Ассистентка</small>Подать питание</span></button>
      <button data-order="shutters"><img src="./art/crew/daughter.webp" alt=""><span><small>Дочка</small>Раздвинуть створки</span></button>
    </div>
    <section class="beacon-book" aria-label="Блокнот переводов">
      <div class="book-heading"><h2>Блокнот</h2><span>Подбери слова к знакам</span></div>
      <div class="sign-entries"></div>
      <div class="book-actions"><button class="action-main" data-order="check">Проверить перевод</button><button data-order="undo">Отменить запись</button><button data-order="take" class="action-main" hidden>Взять линзу</button><button data-order="replay">Начать заново</button></div>
    </section>`;
  const stage = root.querySelector('.alphabet-stage');
  const selects = signs.map((name, i) => {
    const label = document.createElement('label');
    const glyph = document.createElement('b');
    glyph.className = 'rune rune-' + i;
    glyph.setAttribute('aria-hidden', 'true');
    const desc = document.createElement('span');
    desc.textContent = name;
    const select = document.createElement('select');
    select.setAttribute('aria-label', name);
    for (const word of ['', 'открыть', 'слушать', 'питать']) {
      const option = document.createElement('option');
      option.value = word; option.textContent = word || 'Выбрать слово'; select.append(option);
    }
    select.addEventListener('change', () => act('word', i, select.value));
    label.append(glyph, desc, select); root.querySelector('.sign-entries').append(label);
    return select;
  });
  function render() {
    for (const key of ['echo','power','shutters','taken']) stage.classList.toggle('has-' + key, state[key]);
    for (const button of root.querySelectorAll('.orders button')) button.setAttribute('aria-pressed', String(state[button.dataset.order]));
    selects.forEach((sel, i) => { sel.value = state.words[i]; sel.disabled = state.verified; });
    for (const button of root.querySelectorAll('[data-order="take"]')) button.hidden = !state.verified || state.taken;
    root.querySelector('[data-order="undo"]').disabled = state.verified || !state.history.length;
    root.querySelector('[data-order="check"]').hidden = state.verified;
  }
  function act(action, index, value) {
    let message;
    if (action === 'replay') {
      Object.assign(state, blank());
      message = 'Новый сеанс связи. Самолётик и Ассистентка ждут приказов.';
    } else {
      message = beaconAction(state, action, index, value);
    }
    api.save(state);
    render();
    if (message) api.say(message);
    if (action === 'take' && state.taken) api.win();
  }
  root.addEventListener('click', onClick);
  function onClick(event) {
    const button = event.target.closest('button[data-order]');
    if (button && root.contains(button)) act(button.dataset.order);
  }
  render();
  if (state.taken) { api.win(); api.say('Линза связи в рюкзаке, постамент пуст.'); }
  return () => root.removeEventListener('click', onClick);
}
