// The outer edge of each five-by-five plan is a wall.
const CARGO = [".##..", "....#", ".....", ".#...", "...#."].join("");
const MINE = ["##.##", "##.##", "#...#", "#...#", "##.##"].join("");
const WIDTH = 5;
const PLATE = 8;
const VEIN = 7;
const EXIT = 2;
const START = 22;
const DIRECTIONS = { up: [0, -1], left: [-1, 0], down: [0, 1], right: [1, 0] };
const ARROWS = [
  ["up", "↑", "Вверх"], ["left", "←", "Влево"],
  ["down", "↓", "Вниз"], ["right", "→", "Вправо"]
];
const KEYS = { ArrowUp: "up", ArrowLeft: "left", ArrowDown: "down", ArrowRight: "right",
  w: "up", a: "left", s: "down", d: "right", ц: "up", ф: "left", ы: "down", в: "right" };

function neighbor(position, direction) {
  const [dx, dy] = DIRECTIONS[direction];
  const x = position % WIDTH + dx;
  const y = Math.floor(position / WIDTH) + dy;
  return x < 0 || x >= WIDTH || y < 0 || y >= WIDTH ? -1 : y * WIDTH + x;
}

function isFloor(map, index) {
  return Number.isInteger(index) && index >= 0 && index < map.length && map[index] === ".";
}

export function initialCargo() {
  return { player: START, box: 12, moves: 0, done: false };
}

export function initialPulse() {
  return { player: START, marker: null, fuse: 0, opened: false, moves: 0, done: false };
}

export function advanceCargo(state, direction) {
  if (state.done || !Object.hasOwn(DIRECTIONS, direction)) return { state };
  const target = neighbor(state.player, direction);
  if (!isFloor(CARGO, target)) return { state, note: "Тут стеллаж или край настила. Обойди его." };
  let box = state.box;
  if (target === box) {
    const beyond = neighbor(box, direction);
    if (!isFloor(CARGO, beyond)) return { state, note: "За ячейкой нет места. Попробуй толкнуть её с другой стороны." };
    box = beyond;
  }
  const done = box === PLATE;
  const pushed = box !== state.box;
  return {
    state: { player: target, box, moves: state.moves + 1, done },
    note: done ? "Ячейка в гнезде! Конвейер заработал." : pushed ? "Ячейка сдвинулась на один квадрат." : ""
  };
}

export function pulseZone(origin) {
  return [origin, ...Object.keys(DIRECTIONS).map(dir => neighbor(origin, dir))]
    .filter(cell => isFloor(MINE, cell));
}

export function advancePulse(state, action) {
  if (state.done) return { state };
  if (action === "place") {
    if (state.marker !== null || state.opened) return { state };
    return {
      state: { ...state, marker: state.player, fuse: 2 },
      note: "Маячок на месте. До волны два хода. Выйди из полосатой зоны."
    };
  }
  let player = state.player;
  if (Object.hasOwn(DIRECTIONS, action)) {
    const next = neighbor(player, action);
    if (!isFloor(MINE, next)) return { state, note: "Здесь скала. Выбери свободную клетку." };
    if (next === VEIN && !state.opened) return { state, note: "Трещина перекрывает ход. Соседняя клетка подходит для маячка." };
    player = next;
  } else if (action !== "wait" || state.marker === null) {
    return { state };
  }
  const next = { ...state, player, moves: state.moves + 1 };
  let note = "";
  if (state.marker !== null) {
    next.fuse -= 1;
    if (next.fuse === 0) {
      const wave = pulseZone(state.marker);
      next.marker = null;
      if (wave.includes(player)) {
        next.player = START;
        note = "Волна отбросила Сына ко входу. Отойди за границу полосатой зоны.";
      } else if (wave.includes(VEIN)) {
        next.opened = true;
        note = "Порода расступилась! Пройди через трещину к верхнему шлюзу.";
      } else {
        note = "Волна угасла, не достигнув трещины. Переставь маячок ближе.";
      }
    } else {
      note = "До волны один ход.";
    }
  }
  if (next.opened && next.player === EXIT) {
    next.done = true;
    note = "Сын добрался до шлюза. Эхо шахты поймано!";
  }
  return { state: next, note };
}

const LEVELS = {
  cargo: {
    map: CARGO, create: initialCargo, advance: advanceCargo, actor: "Робот",
    objective: "Толкни голубую энергоячейку на золотую плиту.",
    guidance: "Подойди к ячейке и шагни в её сторону. Её можно только толкать.",
    complete: "Конвейер работает. Ячейка стоит на плите."
  },
  pulse: {
    map: MINE, create: initialPulse, advance: advancePulse, actor: "Сын",
    objective: "Раскрой трещину импульсом и доберись до верхнего шлюза.",
    guidance: "Полосы показывают охват маячка. После установки у тебя два хода, чтобы укрыться.",
    complete: "Шлюз пройден. Линия связи восстановлена."
  }
};

function validState(kind, value) {
  if (!value || !Number.isSafeInteger(value.moves) || value.moves < 0 || typeof value.done !== "boolean") return false;
  const floor = index => isFloor(LEVELS[kind].map, index);
  if (!floor(value.player)) return false;
  if (kind === "cargo") {
    return floor(value.box) && value.box !== value.player && value.done === (value.box === PLATE);
  }
  return typeof value.opened === "boolean" && (value.opened || ![VEIN, EXIT].includes(value.player))
    && value.done === (value.opened && value.player === EXIT)
    && (value.marker === null ? value.fuse === 0
      : !value.opened && floor(value.marker) && (value.fuse === 1 || value.fuse === 2));
}

function cellAt(index) {
  return `ряд ${1 + Math.floor(index / WIDTH)}, столбец ${1 + index % WIDTH}`;
}

function mount(kind, root, api) {
  const level = LEVELS[kind];
  const cargo = kind === "cargo";
  const doc = root.ownerDocument;
  const saved = api.load();
  const restored = saved && saved.version === 1 && saved.kind === kind && validState(kind, saved.state);
  let state = restored ? saved.state : level.create();
  let history = restored && Array.isArray(saved.history) ? saved.history.filter(x => validState(kind, x)).slice(-64) : [];
  let awarded = Boolean(restored && (saved.awarded || state.done));
  let message = "";
  const wrap = doc.createElement("section");
  wrap.className = "tvg-game tvg-" + kind;
  wrap.setAttribute("aria-label", cargo ? "Склад Робота" : "Шахта эха");
  wrap.innerHTML = `<p class="tvg-goal"></p><div class="tvg-body">
    <div class="tvg-map" role="group" tabindex="0" aria-label="Поле 5 на 5"></div>
    <div class="tvg-controls">
      <div class="tvg-legend"></div><p class="tvg-status" role="status" aria-live="polite"></p>
      <div class="tvg-pad" role="group" aria-label="Ход на одну клетку"></div>
      ${cargo ? "" : '<button type="button" class="tvg-action" data-command="pulse"></button>'}
      <div class="tvg-tools"><button type="button" data-command="undo">Ход назад</button>
      <button type="button" data-command="reset">Сначала</button></div>
    </div></div>`;
  root.replaceChildren(wrap);
  wrap.querySelector(".tvg-goal").textContent = level.objective;
  const board = wrap.querySelector(".tvg-map");
  const controls = wrap.querySelector(".tvg-pad");
  for (const [key, symbol, name] of ARROWS) {
    const button = doc.createElement("button");
    button.type = "button";
    button.dataset.command = key;
    button.setAttribute("aria-label", name);
    button.title = name;
    button.textContent = symbol;
    controls.append(button);
  }
  const cells = Array.from({ length: WIDTH * WIDTH }, (_, n) => {
    const button = doc.createElement("button");
    button.type = "button";
    button.tabIndex = -1;
    button.dataset.cell = n;
    button.innerHTML = '<span class="tvg-tile" aria-hidden="true"></span><span class="tvg-occupant" aria-hidden="true"></span>';
    board.append(button);
    return button;
  });
  function store() {
    api.save({ version: 1, kind, state, history, awarded });
  }
  function hint() {
    if (state.done) return level.complete;
    if (!cargo && state.opened) return "Путь открыт. Иди в верхний шлюз.";
    if (!cargo && state.marker !== null) return `Импульс через ${state.fuse} ход${state.fuse === 1 ? "" : "а"}.`;
    return level.guidance;
  }
  function render() {
    const currentZone = !cargo && !state.opened ? pulseZone(state.marker ?? state.player) : [];
    wrap.classList.toggle("tvg-won", state.done);
    for (const [i, cell] of cells.entries()) {
      const wall = !isFloor(level.map, i);
      const active = state.player === i;
      let terrain = wall ? "wall" : "floor";
      let label = wall ? (cargo ? "стеллаж" : "скала") : "проход";
      if (cargo && i === PLATE) { terrain = "plate"; label = "золотая плита"; }
      if (!cargo && i === EXIT) { terrain = "exit"; label = "выход"; }
      if (!cargo && i === VEIN && !state.opened) { terrain = "crack"; label = "трещина"; }
      const occupant = active ? (cargo ? "robot" : "pilot") : cargo && state.box === i ? "box" : "";
      const marker = !cargo && state.marker === i;
      const zoned = currentZone.includes(i);
      cell.className = ["tvg-cell", "tvg-" + terrain, zoned ? "tvg-zone" : "", marker ? "tvg-marked" : ""].filter(Boolean).join(" ");
      cell.lastElementChild.className = "tvg-occupant" + (occupant ? " tvg-" + occupant : "");
      const things = [label, active ? level.actor : "", occupant === "box" ? "энергоячейка" : "",
        marker ? "маячок" : "", zoned ? "зона импульса" : ""].filter(Boolean);
      cell.setAttribute("aria-label", [cellAt(i), ...things].join(", "));
    }
    wrap.querySelector(".tvg-legend").textContent = cargo ? `Ходы · ${state.moves}`
      : state.opened ? "Шлюз доступен" : state.marker === null ? "Маячок готов" : `До импульса · ${state.fuse}`;
    const status = wrap.querySelector(".tvg-status");
    status.textContent = message || hint();
    wrap.querySelector('[data-command="undo"]').disabled = history.length === 0;
    controls.querySelectorAll("button").forEach(b => { b.disabled = state.done; });
    if (!cargo) {
      const button = wrap.querySelector('[data-command="pulse"]');
      button.textContent = state.marker === null ? "Поставить маячок" : "Ждать ход";
      button.disabled = state.opened || state.done;
    }
  }
  function act(command) {
    if (command === "reset") {
      state = level.create(); history = []; message = "Начали сначала. " + level.guidance;
    } else if (command === "undo") {
      if (!history.length) return;
      state = history.pop(); message = "Ход отменён. " + hint();
    } else {
      const action = command === "pulse" ? (state.marker === null ? "place" : "wait") : command;
      const result = level.advance(state, action);
      message = result.note || "";
      if (result.state === state) {
        if (message) { render(); api.say(message); }
        return;
      }
      history.push(state);
      if (history.length > 64) history.shift();
      state = result.state;
    }
    const firstWin = state.done && !awarded;
    if (firstWin) awarded = true;
    store(); render();
    if (message) api.say(message);
    if (firstWin) api.win();
  }
  function click(event) {
    const button = event.target.closest("button");
    if (!button || !wrap.contains(button)) return;
    if (button.dataset.command) { act(button.dataset.command); return; }
    if (button.dataset.cell === undefined || state.done) return;
    const where = Number(button.dataset.cell);
    const direction = Object.keys(DIRECTIONS).find(dir => neighbor(state.player, dir) === where);
    if (direction) act(direction);
    else if (!cargo && where === state.player && !state.opened) act("pulse");
    else { message = "Коснись соседней клетки или используй стрелки."; render(); }
  }
  function keydown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if (event.target !== doc.body && !wrap.contains(event.target)) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const command = KEYS[key] || (["z", "я", "Backspace"].includes(key) ? "undo" : "");
    if (command) { event.preventDefault(); act(command); }
  }
  wrap.addEventListener("click", click);
  doc.addEventListener("keydown", keydown);
  render();
  return () => {
    wrap.removeEventListener("click", click);
    doc.removeEventListener("keydown", keydown);
  };
}

export function mountCargo(root, api) { return mount("cargo", root, api); }
export function mountPulse(root, api) { return mount("pulse", root, api); }
