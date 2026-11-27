const WIDTH = 600;
const HEIGHT = 215;
const EXIT = 8;
const TICK_MS = 510;
const GREENS = ["#83ecbe", "#d4b5ff", "#ffba84", "#87c4ff", "#fff09f"];
const SLOT_X = [32, 60, 88, 116, 144, 175, 211, 264, 307, 356, 417, 476, 531];

function makePanel(root, instruction) {
  const wrap = document.createElement("section");
  wrap.className = "tv-mech";
  wrap.innerHTML = `
    <p class="mc-instruction"></p>
    <figure class="mc-bench">
      <canvas width="1200" height="430" role="img"></canvas>
      <figcaption class="mc-status"></figcaption>
    </figure>
    <div class="mc-config mc-controls"></div>
    <div class="mc-actions mc-controls"></div>`;
  root.replaceChildren(wrap);
  wrap.querySelector(".mc-instruction").textContent = instruction;
  const canvas = wrap.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  return {
    wrap, canvas, ctx,
    status: wrap.querySelector(".mc-status"),
    config: wrap.querySelector(".mc-config"),
    actions: wrap.querySelector(".mc-actions")
  };
}

function button(parent, label, run, className = "") {
  const item = document.createElement("button");
  item.type = "button";
  item.textContent = label;
  item.className = className;
  item.addEventListener("click", run);
  parent.append(item);
  return item;
}

function setting(parent, title, handler) {
  const control = button(parent, title, handler);
  const detail = document.createElement("small");
  control.append(detail);
  return {control, detail};
}

function status(panel, label, kind = "") {
  panel.status.textContent = label;
  panel.status.dataset.result = kind;
  panel.canvas.setAttribute("aria-label", label);
}

function line(ctx, points, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.stroke();
}

function plate(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.closePath();
  ctx.fill();
}

function dot(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function box(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function light(ctx, x, y, radius, center, edge) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, center);
  glow.addColorStop(1, edge);
  dot(ctx, x, y, radius, glow);
}

function backplate(ctx) {
  const fade = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  fade.addColorStop(0, "#293141");
  fade.addColorStop(.65, "#172538");
  fade.addColorStop(1, "#182133");
  box(ctx, 0, 0, WIDTH, HEIGHT, fade);
  for (let x = 5; x < WIDTH; x += 22) {
    for (let y = 11; y < HEIGHT; y += 22) box(ctx, x, y, 1.5, 1.5, "#465367");
  }
  for (const x of [9, WIDTH - 9]) {
    for (const y of [9, HEIGHT - 9]) {
      dot(ctx, x, y, 3.1, "#657282");
      line(ctx, [[x-1.5,y+1],[x+1.5,y-1]], "#263449", 1.2);
    }
  }
}

function beam(ctx, x1, y1, x2, y2, color = "#b1c5d5", breadth = 9) {
  line(ctx, [[x1,y1+2],[x2,y2+2]], "#111826", breadth + 3);
  line(ctx, [[x1,y1],[x2,y2]], "#526779", breadth);
  line(ctx, [[x1,y1-2],[x2,y2-2]], color, 2.3);
}

function lerp(a, b, n) { return a + (b - a) * n; }
function clip(n) { return Math.max(0, Math.min(1, n)); }
function scaledTime() { return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches; }

export function chainOutcome(layout) {
  if (!layout.ramp) return "trap";
  return layout.contact ? "won" : "gap";
}

function chainFrame(panel, layout, progress) {
  const {ctx} = panel;
  backplate(ctx);
  const result = chainOutcome(layout);
  const ballEnd = layout.contact ? 333 : 320;
  const pivot = layout.contact ? 371 : 355;
  const swing = layout.ramp ? clip((progress - .72) * 7) : 0;
  const live = result === "won" && progress >= .9;
  light(ctx, 55, 100, 115, "#51443f80", "#30303a00");
  // A connected pipe makes the relay's consequence visible at the lamp.
  const wire = [[430,132],[456,132],[456,91],[479,91],[479,65],[509,65]];
  line(ctx, wire, "#0f1523", 10);
  line(ctx, wire, live ? "#f9b758" : "#5b5c66", 6);
  line(ctx, wire, live ? "#ffdaa2" : "#82818a", 1.8);
  box(ctx, 508, 52, 58, 28, "#465875");
  box(ctx, 514, 68, 47, 11, "#282d40");
  if (live) light(ctx, 537, 48, 54, "#ffd375bb", "#ffad4200");
  dot(ctx, 537, 46, 17, live ? "#ffe7a3" : "#687884");
  dot(ctx, 532, 41, 5, live ? "#fff9ce" : "#a5b3b4");
  if (live) {
    for (const angle of [-2.7,-2.1,-1.56,-1,-.45]) {
      line(ctx, [[537+Math.cos(angle)*23,46+Math.sin(angle)*23],
        [537+Math.cos(angle)*31,46+Math.sin(angle)*31]], "#f9d275", 2.5);
    }
  }
  // Hopper and fixed rail.
  plate(ctx, [[34,48],[86,48],[94,59],[82,79],[60,79],[56,94],[45,94],[45,77]], "#6e8195");
  line(ctx, [[33,48],[83,48],[92,58]], "#c5d7df", 5);
  box(ctx, 40, 93, 25, 6, "#454456");
  beam(ctx, 82, 77, 204, 116);
  for (let x = 103; x < 194; x += 23) {
    const y = 77 + (x - 82) * .32;
    dot(ctx, x, y + 1, 3, "#526070");
  }
  // Error pocket, hinged chute, adjustable rocker and fixed contact.
  plate(ctx, [[158,170],[174,197],[222,197],[241,170],[230,170],[215,186],[181,186],[170,170]], "#9a6f69");
  line(ctx, [[158,169],[171,169]], "#f6b77f", 4);
  line(ctx, [[230,169],[242,169]], "#f6b77f", 4);
  const chuteEnd = layout.ramp ? [311,143] : [212,157];
  beam(ctx, 204, 117, ...chuteEnd, "#91e2d9", 11);
  dot(ctx, 204, 118, 10, "#33475a");
  dot(ctx, 204, 118, 5, "#a3e2d6");
  const paddleY = 147 + swing * 15;
  const tipY = 155 - swing * 22;
  plate(ctx, [[pivot-18,182],[pivot,146],[pivot+18,182]], "#977957");
  box(ctx, pivot-24, 181, 48, 7, "#b58c5a");
  beam(ctx, ballEnd-11, paddleY, pivot+45, tipY, "#d6b67e", 9);
  dot(ctx, pivot, 151, 8, "#5a4c4b");
  dot(ctx, pivot, 151, 3, "#ffe1a3");
  plate(ctx, [[417,126],[440,126],[440,147],[425,147],[425,136],[417,136]], live ? "#ffcc73" : "#a2897d");
  box(ctx, 424, 148, 18, 12, "#465369");

  let bx, by;
  if (progress <= .38) {
    const t = clip(progress / .38);
    bx = lerp(82, 204, t); by = lerp(65, 105, t);
  } else if (progress <= .69) {
    const t = clip((progress - .38) / .31);
    bx = lerp(204, chuteEnd[0], t); by = lerp(105, chuteEnd[1]-12, t);
  } else if (!layout.ramp) {
    const t = clip((progress - .69) / .22);
    bx = lerp(chuteEnd[0], 200, t); by = lerp(chuteEnd[1]-12, 182, t*t);
  } else {
    const t = clip((progress - .69) / .19);
    bx = lerp(chuteEnd[0], ballEnd, t);
    by = lerp(chuteEnd[1]-12, paddleY-10, t);
  }
  dot(ctx, bx+1, by+2, 9.2, "#24232f");
  dot(ctx, bx, by, 8.8, "#eb9b56");
  dot(ctx, bx-1.3, by-1.9, 6, "#ffcd8a");
  dot(ctx, bx-3, by-4, 2.2, "#fff1d3");
}

function normalizeChain(value) {
  const ramp = value?.ramp === true, contact = value?.contact === true;
  const result = value?.result === chainOutcome({ramp,contact}) ? value.result : "ready";
  return {ramp, contact, result};
}

export function mountChain(root, api) {
  const panel = makePanel(root, "Направьте шар на рычаг и замкните контакт, чтобы зажечь лампу.");
  const stored = api.load();
  let layout = normalizeChain(stored?.board);
  let rewarded = stored?.rewarded === true;
  let history = Array.isArray(stored?.history) ? stored.history.slice(-20).map(normalizeChain) : [];
  let frame = 0, running = false, disposed = false;
  function save() { api.save({board:{...layout}, history, rewarded}); }
  function remember() { history.push({...layout}); if (history.length > 20) history.shift(); }
  function cancel() { cancelAnimationFrame(frame); running = false; }
  const guide = setting(panel.config, "Повернуть желоб", () => toggle("ramp"));
  const rocker = setting(panel.config, "Переставить рычаг", () => toggle("contact"));
  const run = button(panel.actions, "Пуск", launch, "mc-launch");
  const undo = button(panel.actions, "Шаг назад", () => {
    if (!history.length) return;
    cancel();
    layout = history.pop();
    save(); render();
  });
  const reset = button(panel.actions, "Сначала", () => {
    cancel(); history = []; layout = normalizeChain(null); save(); render();
  });
  const outcomes = {
    ready:"Шар лежит в подающем лотке.",
    trap:"Шар упал в нижний карман. Поверните желоб к рычагу.",
    gap:"Рычаг качнулся, но между его концом и контактом остался зазор.",
    won:"Реле замкнулось. Сигнальная лампа горит!"
  };
  function render(progress = layout.result === "ready" ? 0 : 1) {
    guide.control.disabled = rocker.control.disabled = run.disabled = running;
    guide.detail.textContent = layout.ramp ? "Выход к рычагу" : "Выход к карману";
    rocker.detail.textContent = layout.contact ? "У контакта" : "На дальней опоре";
    guide.control.setAttribute("aria-pressed", String(layout.ramp));
    rocker.control.setAttribute("aria-pressed", String(layout.contact));
    undo.disabled = !history.length;
    reset.disabled = !history.length && !layout.ramp && !layout.contact && !running && layout.result === "ready";
    status(panel, running ? "Шар катится по желобу…" : outcomes[layout.result],
      layout.result === "won" ? "won" : layout.result === "ready" ? "" : "stuck");
    chainFrame(panel, layout, progress);
  }
  function toggle(which) {
    if (running) return;
    remember(); layout = {...layout, [which]:!layout[which], result:"ready"};
    save(); render();
  }
  function launch() {
    if (running) return;
    remember(); layout = {...layout,result:"ready"}; running = true; save(); render(0);
    const start = performance.now();
    const duration = scaledTime() ? 350 : 1850;
    function animate(now) {
      if (disposed || !running) return;
      const p = clip((now-start) / duration);
      chainFrame(panel, layout, p);
      if (p < 1) {
        frame = requestAnimationFrame(animate);
        return;
      }
      running = false;
      layout.result = chainOutcome(layout);
      const justWon = layout.result === "won" && !rewarded;
      if (justWon) rewarded = true;
      save(); render(); api.say(outcomes[layout.result]);
      if (justWon) api.win();
    }
    frame = requestAnimationFrame(animate);
  }
  panel.canvas.addEventListener("click", event => {
    const rect = panel.canvas.getBoundingClientRect();
    const x = (event.clientX-rect.left)*WIDTH/rect.width;
    const y = (event.clientY-rect.top)*HEIGHT/rect.height;
    if (y < 85 || y > 184) return;
    if (x >= 174 && x < 309) toggle("ramp");
    if (x >= 309 && x < 432) toggle("contact");
  });
  render();
  return () => { disposed = true; cancel(); };
}

export function newConvoy() {
  return {positions:[0,-1,-2,-3,-4], builder:-1, signaller:-1, bridge:false, routed:false};
}

function restoredConvoy(board) {
  const fallback = newConvoy();
  if (!Array.isArray(board?.positions) || board.positions.length !== 5) return fallback;
  if (!board.positions.every((p,i) => Number.isInteger(p) && p >= -i && p <= EXIT)) return fallback;
  const member = value => Number.isInteger(value) && value >= 0 && value < 5 ? value : -1;
  const builder = member(board.builder), signaller = member(board.signaller);
  return {
    positions:board.positions.slice(), builder, signaller:signaller === builder ? -1 : signaller,
    bridge:board.bridge === true, routed:board.routed === true
  };
}

export function advanceConvoy(board) {
  const p = board.positions;
  const bridge = board.bridge || (board.builder >= 0 && p[board.builder] >= 2);
  const routed = board.routed || (board.signaller >= 0 && p[board.signaller] >= 5);
  const positions = p.map(slot => {
    if (slot === 2 && !bridge || slot === 5 && !routed) return slot;
    return Math.min(EXIT, slot + 1);
  });
  return {...board, positions, bridge, routed};
}

function track(ctx, path, color) {
  line(ctx, path, "#131928", 13);
  line(ctx, path, "#495b70", 10);
  line(ctx, path, color, 2.6);
}

function vehicle(ctx, x, y, index, role, selected) {
  if (selected) {
    ctx.strokeStyle = "#ffce82";
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(x, y+2, 15, 4.1, 0, 0, Math.PI*2); ctx.stroke();
  }
  box(ctx, x-8.5, y-4, 17, 5, "#253044");
  for (const dx of [-5.4,5.4]) {
    dot(ctx, x+dx, y-1, 3.6, "#172233");
    dot(ctx, x+dx, y-1, 1.6, "#a5adad");
  }
  plate(ctx, [[x-10,y-5],[x-10,y-12],[x-7,y-17],[x+4,y-17],[x+9,y-12],[x+9,y-5]], GREENS[index]);
  box(ctx,x-7,y-13,14,6,"#23374b");
  box(ctx,x-2,y-11,2.3,2.3,"#edffff");
  box(ctx,x+3,y-11,2.3,2.3,"#edffff");
  line(ctx, [[x-3,y-17],[x-5,y-22]], "#acb7c8", 1.8);
  dot(ctx,x-5,y-22,2.4,GREENS[index]);
  if (role === "builder") {
    line(ctx, [[x+8,y-9],[x+13,y-14],[x+16,y-13]], "#fbd17e", 2.6);
    line(ctx, [[x+14,y-13],[x+17,y-16]], "#fbd17e", 1.7);
  }
  if (role === "signaller") {
    line(ctx, [[x+8,y-9],[x+10,y-25]], "#ffe0a3", 1.7);
    plate(ctx, [[x+10,y-25],[x+18,y-22],[x+10,y-19]], "#ffbd72");
  }
}

function visibleVehicles(positions) {
  const groups = new Map();
  return positions.map(slot => {
    const count = groups.get(slot) || 0;
    groups.set(slot, count+1);
    return {
      x:SLOT_X[slot+4] - (count%3)*12,
      y:137 - Math.floor(count/3)*16 - (slot >= 6 ? (slot-5)*5.5 : 0)
    };
  });
}

function convoyFrame(panel, board, previous, fraction, selected) {
  const {ctx} = panel;
  backplate(ctx);
  light(ctx, 536, 105, 76, "#528f6770", "#477b5400");
  plate(ctx, [[0,153],[227,153],[236,172],[231,215],[0,215]], "#353949");
  plate(ctx, [[269,154],[600,130],[600,215],[260,215]], "#383648");
  for (const x of [27,74,121,171,282,330,376]) {
    line(ctx, [[x,154],[x+9,167],[x+3,185]], "#484452", 2);
  }
  // Real gap between two track sections; the amber bridge unfolds over it.
  track(ctx, [[18,139],[225,139]], "#a6b9ca");
  track(ctx, [[270,139],[364,139],[403,135]], "#a6b9ca");
  if (board.bridge) {
    beam(ctx, 223, 139, 271, 139, "#ffcf7e", 10);
    for (let x=227;x<270;x+=7) line(ctx,[[x,142],[x+4,137]],"#9c703b",1.6);
  } else {
    beam(ctx, 223, 141, 227, 177, "#d3a869", 7);
    line(ctx, [[231,154],[238,164],[235,174],[242,186]], "#6dbbbd", 1.5);
  }
  dot(ctx,223,141,4.5,"#ffc97c");
  // The bottom spur leads to a parked cart; the upper spur reaches the open bay.
  track(ctx, [[398,137],[451,158],[509,172],[550,172]], board.routed ? "#6a7486" : "#d39b77");
  track(ctx, [[398,136],[448,128],[509,119],[555,119]], board.routed ? "#9fe6c1" : "#7490a1");
  line(ctx, board.routed ? [[386,136],[413,134],[429,130]] : [[387,137],[409,141],[425,149]],
    board.routed ? "#a4ebbb" : "#ffc885", 4);
  dot(ctx,387,137,4.6,"#859aaa");
  box(ctx, 374, 93, 5, 32, "#8897a7");
  dot(ctx,377,91,7,board.routed?"#7ce4b8":"#f7b65e");
  line(ctx, [[378,112], board.routed?[390,103]:[390,118]],"#d9ba83",2);
  const gate = [[498,116],[498,76],[509,64],[551,64],[563,76],[563,114]];
  line(ctx,gate,"#172033",17);
  line(ctx,gate,"#68808b",11);
  line(ctx,gate,"#a4b9ae",2);
  box(ctx, 510, 71, 39, 30, "#233d44");
  for (let i=0;i<5;i++) dot(ctx,511+i*9.4,57,3.1,board.positions[i]===EXIT?"#a0efbc":"#5f726f");
  box(ctx,520,162,22,8,"#656274");
  for(const x of [524,538]) dot(ctx,x,172,3,"#9d92a3");
  const current = visibleVehicles(board.positions);
  const prev = visibleVehicles(previous || board.positions);
  for (let i=4;i>=0;i--) {
    if (board.positions[i] === EXIT && (!previous || previous[i] === EXIT || fraction >= .98)) continue;
    vehicle(ctx,lerp(prev[i].x,current[i].x,fraction),lerp(prev[i].y,current[i].y,fraction),i,
      i===board.builder?"builder":i===board.signaller?"signaller":"",i===selected);
  }
}

export function mountDrones(root, api) {
  const panel = makePanel(root, "Выберите дрона для трапа и другого для стрелки. Отправьте все пять в шлюз.");
  const roster = document.createElement("div");
  roster.className = "mc-roster";
  roster.setAttribute("role", "group");
  roster.setAttribute("aria-label", "Выбор ремонтного дрона");
  panel.wrap.insertBefore(roster, panel.config);
  const stored = api.load();
  let board = restoredConvoy(stored?.board);
  let selected = Number.isInteger(stored?.selected) && stored.selected >= 0 && stored.selected < 5 ? stored.selected : 0;
  let history = Array.isArray(stored?.history) ? stored.history.slice(-32).map(restoredConvoy) : [];
  let rewarded = stored?.rewarded === true;
  let automatic = false, timer = 0, frame = 0, disposed = false;
  function save() { api.save({board, selected, history, rewarded}); }
  function remember() { history.push(board); if (history.length > 32) history.shift(); }
  function pause() {
    automatic = false;
    clearTimeout(timer); cancelAnimationFrame(frame);
    timer = frame = 0;
  }
  const droids = Array.from({length:5}, (_,i) => {
    const item = button(roster, `Дрон ${i+1}`, () => choose(i));
    const role = document.createElement("small");
    item.append(role);
    return {item, role};
  });
  const builder = setting(panel.config, "Назначить трап", () => assign("builder"));
  const signal = setting(panel.config, "Назначить стрелку", () => assign("signaller"));
  const march = button(panel.actions, "Марш", () => {
    if (automatic) { pause(); render(); return; }
    automatic = true; runTick();
  }, "mc-launch");
  const tick = button(panel.actions, "Один такт", () => { if (!automatic) step(false); });
  const undo = button(panel.actions, "Шаг назад", () => {
    if (!history.length) return;
    pause(); board = history.pop();
    save(); render(); api.say("Последний такт или приказ отменён.");
  });
  const reset = button(panel.actions, "Сначала", () => {
    pause(); board = newConvoy(); selected = 0; history = [];
    save(); render();
  });
  function savedCount() { return board.positions.filter(p => p === EXIT).length; }
  function roleLabel(index) {
    if (index === board.builder) return "Трап";
    if (index === board.signaller) return "Стрелка";
    return board.positions[index] === EXIT ? "Прибыл" : "Свободен";
  }
  function feedback() {
    if (savedCount() === 5) return "Вся смена в сборе!";
    if (board.positions.includes(5) && !board.routed && board.signaller < 0) return "У стрелки нужен связист.";
    if (board.positions.includes(2) && !board.bridge && board.builder < 0) return "У обрыва нужен строитель.";
    if (automatic) return "Колонна в пути.";
    return board.positions[0] === 0 ? "Колонна у старта." : "Колонна ждёт команды «Марш».";
  }
  function renderControls() {
    const count = savedCount(), complete = count === 5;
    for (let i=0;i<5;i++) {
      droids[i].item.setAttribute("aria-pressed", String(i === selected));
      droids[i].role.textContent = roleLabel(i);
    }
    builder.detail.textContent = board.builder < 0 ? "Никто не назначен" : `Дрон ${board.builder+1}`;
    signal.detail.textContent = board.signaller < 0 ? "Никто не назначен" : `Дрон ${board.signaller+1}`;
    builder.control.setAttribute("aria-pressed",String(board.builder === selected));
    signal.control.setAttribute("aria-pressed",String(board.signaller === selected));
    builder.control.disabled = board.bridge || board.positions[selected] === EXIT;
    signal.control.disabled = board.routed || board.positions[selected] === EXIT;
    march.textContent = automatic ? "Пауза" : "Марш";
    march.disabled = complete;
    tick.disabled = automatic || complete;
    undo.disabled = !history.length;
    reset.disabled = history.length === 0 && !board.bridge && !board.routed && board.positions[0] === 0 && board.builder < 0 && board.signaller < 0;
    status(panel,`В шлюзе ${count} из 5. ${feedback()}`,complete?"won":"");
  }
  function render() {
    cancelAnimationFrame(frame); frame=0;
    renderControls();
    convoyFrame(panel, board, null, 1, selected);
  }
  function choose(index) {
    selected = index; save(); render();
  }
  function assign(key) {
    if (board.positions[selected] === EXIT) return;
    if (key === "builder" ? board.bridge : board.routed) return;
    remember();
    const other = key === "builder" ? "signaller" : "builder";
    const target = board[key] === selected ? -1 : selected;
    // A deploying drone keeps its first role until the round restarts.
    if (target === selected && board[other] === selected && (other === "builder" ? board.bridge : board.routed)) {
      history.pop();
      api.say("Этот дрон уже выполнил первое поручение. Выберите другого.");
      return;
    }
    board = {...board,[key]:target,[other]:target >= 0 && board[other] === target ? -1 : board[other]};
    save(); render();
  }
  function step(animate) {
    if (disposed || savedCount() === 5) return false;
    const next = advanceConvoy(board);
    if (next.positions.every((p,i) => p === board.positions[i]) && next.bridge === board.bridge && next.routed === board.routed) {
      pause(); render(); api.say(feedback());
      return false;
    }
    const previous = board;
    remember(); board = next;
    const complete = savedCount() === 5;
    const justWon = complete && !rewarded;
    if (justWon) rewarded = true;
    if (complete) pause();
    save(); renderControls();
    cancelAnimationFrame(frame);
    if (animate && !complete && !scaledTime()) {
      const start = performance.now();
      function move(now) {
        if (disposed) return;
        const p = clip((now-start) / (TICK_MS*.68));
        convoyFrame(panel,board,previous.positions,p,selected);
        if (p < 1) frame=requestAnimationFrame(move);
      }
      frame=requestAnimationFrame(move);
    } else {
      convoyFrame(panel,board,null,1,selected);
    }
    if (complete) api.say("Все пять дронов вошли в шлюз.");
    else if (!previous.bridge && board.bridge) api.say(`Дрон ${board.builder+1} разложил трап через разрыв.`);
    else if (!previous.routed && board.routed) api.say(`Дрон ${board.signaller+1} перевёл стрелку к шлюзу.`);
    if (justWon) api.win();
    return !complete;
  }
  function runTick() {
    if (!automatic || disposed) return;
    if (step(true) && automatic && !disposed) timer=setTimeout(runTick,TICK_MS);
  }
  panel.canvas.addEventListener("click", event => {
    const rect = panel.canvas.getBoundingClientRect();
    const x = (event.clientX-rect.left)*WIDTH/rect.width, y=(event.clientY-rect.top)*HEIGHT/rect.height;
    const nearby = visibleVehicles(board.positions)
      .map((p,i) => ({i, dist:Math.hypot(x-p.x, y-p.y+8)}))
      .filter(p => p.dist < 20 && board.positions[p.i] !== EXIT)
      .sort((a,b) => a.dist-b.dist);
    if (nearby.length) choose(nearby[0].i);
  });
  render();
  return () => { disposed = true; pause(); };
}
