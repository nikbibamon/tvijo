const WIDTH = 600;
const HEIGHT = 215;
export {newConvoy, advanceConvoy} from '../sluice/rules.js';

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
