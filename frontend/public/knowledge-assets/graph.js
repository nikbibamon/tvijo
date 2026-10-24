/* Tvijo article graph v1. Self-hosted, no telemetry, no dependencies. */
'use strict';
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const mounted = new WeakMap();
  const allowedHosts = new Set(['tvijo.com', 'dsh.tvijo.com', 'platform.tvijo.com']);
  function safeHref(value) {
    if (typeof value !== 'string' || /[\s\\%]/.test(value)) return false;
    try {
      const url = new URL(value, location.origin);
      return (!url.username && !url.password &&
        (url.origin === location.origin || (url.protocol === 'https:' && (!url.port || url.port === '443') && allowedHosts.has(url.hostname))) &&
        /^\/(?:knowledge\/|[a-z]{2}\/(?:kb\/|knowledge\/))/.test(url.pathname) &&
        !/\/\.{1,2}(\/|$)/.test(value));
    } catch { return false; }
  }
  function mount(root, input) {
    if (mounted.has(root)) return mounted.get(root);
    if (!input || input.schema !== 'tvijo.article-graph/v1' || !Array.isArray(input.nodes) || !Array.isArray(input.edges)) return () => {};
    const nodes = input.nodes.slice(0, 48).filter(n => n && typeof n.id === 'string' &&
      typeof n.title === 'string' && n.title.length <= 300 && safeHref(n.href));
    const byId = new Map(nodes.map(n => [n.id, n]));
    if (byId.size !== nodes.length || !nodes.length) return () => {};
    const edges = input.edges.slice(0, 192).filter(e => e && byId.has(e.source) && byId.has(e.target));
    const ru = root.lang === 'ru';
    const tr = (en, russian) => ru ? russian : en;
    const host = root.querySelector('.tg-mount') || root;
    const abort = new AbortController();
    const on = (el, type, fn, options = {}) => el.addEventListener(type, fn, {...options, signal: abort.signal});
    function el(tag, cls, text) {
      const n = document.createElement(tag); if (cls) n.className = cls;
      if (text !== undefined) n.textContent = text; return n;
    }
    function svgEl(tag, attrs = {}) {
      const n = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n;
    }
    const wrap = el('div', 'tg-interactive');
    const controls = el('div', 'tg-controls');
    const label = el('label', 'tg-search', tr('Find an article', 'Найти статью'));
    const search = el('input'); search.type = 'search'; search.maxLength = 100;
    search.placeholder = tr('Search connections…', 'Поиск связей…'); label.append(search); controls.append(label);
    const buttons = el('div', 'tg-buttons');
    function button(text, aria, action) {
      const n = el('button', '', text); n.type = 'button'; n.setAttribute('aria-label', aria);
      on(n, 'click', action); buttons.append(n); return n;
    }
    let yaw = 0.28, pitch = -0.18, expanded = false, visible = true, frame = 0;
    let selected = byId.get(input.selected) || nodes[0];
    const left = button('↶', tr('Rotate 3D left', 'Повернуть 3D влево'), () => rotate(-0.3, 0));
    button('↷', tr('Rotate 3D right', 'Повернуть 3D вправо'), () => rotate(0.3, 0));
    button('↥', tr('Rotate 3D up', 'Повернуть 3D вверх'), () => rotate(0, 0.25));
    button(tr('Reset', 'Сброс'), tr('Reset 3D view', 'Сбросить 3D вид'), () => { yaw = 0.28; pitch = -0.18; schedule(); });
    const expand = button(tr('Expand', 'Развернуть'), tr('Expand graph', 'Развернуть граф'), () => {
      expanded = !expanded; wrap.classList.toggle('tg-expanded', expanded);
      expand.setAttribute('aria-expanded', String(expanded));
      expand.textContent = expanded ? tr('Collapse', 'Свернуть') : tr('Expand', 'Развернуть'); schedule();
    });
    expand.setAttribute('aria-expanded', 'false'); controls.append(buttons); wrap.append(controls);
    const hint = el('p', 'tg-hint', tr('Drag horizontally or use rotation buttons. Tab to a node; Enter opens its article. Touch a node to read.', 'Тяните по горизонтали или используйте кнопки поворота. Tab — узел, Enter — статья. Коснитесь узла для чтения.'));
    const svg = svgEl('svg', {class: 'tg-space', role: 'group', tabindex: '0', 'aria-label': tr('3D article connections. Arrow keys rotate. Each node is an article link.', 'Связи статей в 3D. Стрелки поворачивают граф. Каждый узел — ссылка на статью.')});
    const edgeLayer = svgEl('g', {'aria-hidden': 'true'}), nodeLayer = svgEl('g');
    svg.append(edgeLayer, nodeLayer); wrap.append(hint, svg);
    const legend = el('p', 'tg-legend');
    for (const [cls, text] of [['tg-dot-current',tr('Current article', 'Текущая статья')], ['tg-dot-link',tr('Linked article', 'Связанная статья')], ['tg-dot-edge',tr('Editorial link', 'Редакционная ссылка')]]) {
      const s = el('span', cls, text); legend.append(s);
    }
    const count = el('span'); legend.append(count); wrap.append(legend);
    const preview = el('aside', 'tg-preview'); preview.setAttribute('aria-live', 'polite');
    const heading = el('strong'), summary = el('p'), backlink = el('span', 'tg-meta');
    const open = el('a', 'tg-open', tr('Read article ↑', 'Читать статью ↑')); preview.append(heading, summary, backlink, open); wrap.append(preview); host.append(wrap);
    const points = new Map(), views = new Map();
    const others = nodes.filter(n => n.id !== input.selected);
    nodes.forEach(n => {
      const i = others.indexOf(n), length = others.length;
      const y = n.id === input.selected ? 0 : (length === 1 ? 0 : 1 - 2 * (i + 0.5) / length);
      const azimuth = i * Math.PI * (3 - Math.sqrt(5));
      const radial = n.id === input.selected ? 0 : Math.sqrt(1 - y * y);
      points.set(n.id, [Math.cos(azimuth) * radial, y, Math.sin(azimuth) * radial]);
      const a = svgEl('a', {href: n.href, class: 'tg-node' + (n.id === input.selected ? ' tg-current' : ''), 'aria-label': n.title});
      if (n.id === input.selected) a.setAttribute('aria-current', 'page');
      const title = svgEl('title'); title.textContent = n.title;
      const hit = svgEl('circle', {r: '24', class: 'tg-hit'}), circle = svgEl('circle', {r: '7', class: 'tg-point'});
      const text = svgEl('text', {'text-anchor': 'middle', y: '31'});
      a.append(title, hit, circle, text); nodeLayer.append(a); views.set(n.id, {a, circle, text});
      on(a, 'pointerenter', () => choose(n)); on(a, 'focus', () => choose(n));
    });
    const lines = edges.map(e => { const l = svgEl('line', {class: 'tg-edge'}); edgeLayer.append(l); return {e, l}; });
    function choose(n) {
      selected = n; heading.textContent = n.title; summary.textContent = n.summary || '';
      backlink.textContent = tr('Incoming links: ', 'Входящих ссылок: ') + edges.filter(e => e.target === n.id).length;
      open.href = n.href;
      for (const [id, view] of views) view.a.classList.toggle('tg-selected', id === n.id);
    }
    function draw() {
      frame = 0; if (!visible || !root.isConnected) return;
      const width = Math.max(280, Math.min(1100, svg.clientWidth || 800));
      const height = expanded ? 560 : (width < 500 ? 390 : 430);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      const radius = Math.min(width * 0.31, height * 0.37);
      const positions = new Map(), query = search.value.trim().toLocaleLowerCase(); let matches = 0;
      for (const n of nodes) {
        const [x, y, z] = points.get(n.id);
        const rx = x * Math.cos(yaw) + z * Math.sin(yaw), rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
        const ry = y * Math.cos(pitch) - rz * Math.sin(pitch), depth = y * Math.sin(pitch) + rz * Math.cos(pitch);
        const perspective = 3.8 / (3.8 - depth);
        const px = width / 2 + rx * radius * perspective, py = height / 2 + ry * radius * perspective;
        const view = views.get(n.id), match = !query || n.title.toLocaleLowerCase().includes(query);
        if (match) matches++;
        view.a.setAttribute('transform', `translate(${px.toFixed(2)},${py.toFixed(2)})`);
        view.a.setAttribute('data-depth', depth.toFixed(4));
        view.a.setAttribute('opacity', match ? (0.72 + (depth + 1) * 0.14).toFixed(2) : '0.18');
        view.a.setAttribute('tabindex', match ? '0' : '-1');
        view.circle.setAttribute('r', ((n.id === input.selected ? 9 : 6) * perspective).toFixed(2));
        view.text.replaceChildren();
        const max = width < 500 ? 19 : 29;
        const graphLabel = typeof n.label === 'string' && n.label.length <= 100 ? n.label : n.title;
        const words = graphLabel.split(' '); let row = '', rows = [];
        for (const word of words) {
          if ((row + ' ' + word).trim().length > max && row) { rows.push(row); row = word; } else row = (row + ' ' + word).trim();
        }
        if (row) rows.push(row);
        const visibleRows = rows.slice(0, 3);
        if (rows.length > 3) visibleRows[2] += '…';
        const textWidth = Math.min(width - 24, Math.max(...visibleRows.map(s => s.length)) * 6.4);
        const labelCenter = Math.max(12 + textWidth / 2, Math.min(width - 12 - textWidth / 2, px));
        const above = n.id === input.selected || (nodes.length > 2 && py < height / 2 - 65);
        view.text.setAttribute('y', String(above ? -24 - 16 * (visibleRows.length - 1) : 31));
        visibleRows.forEach((line, i) => { const span = svgEl('tspan', {x: (labelCenter-px).toFixed(2), dy: i ? '16' : '0'}); span.textContent = line; view.text.append(span); });
        positions.set(n.id, {x: px, y: py, match});
      }
      for (const {e, l} of lines) {
        const a = positions.get(e.source), b = positions.get(e.target);
        for (const [key, value] of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y,opacity:a.match && b.match ? 0.45 : 0.08})) l.setAttribute(key, String(value));
        l.classList.toggle('tg-edge-active', e.source === input.selected || e.target === input.selected);
      }
      count.textContent = `${matches}/${nodes.length} ` + tr('articles', 'статей');
    }
    function schedule() { if (visible && !frame) frame = requestAnimationFrame(draw); }
    function rotate(y, p) { yaw += y; pitch = Math.max(-1.2, Math.min(1.2, pitch + p)); schedule(); }
    on(search, 'input', schedule);
    on(svg, 'keydown', e => {
      if (e.target !== svg) return;
      const delta = {ArrowLeft:[-0.2,0],ArrowRight:[0.2,0],ArrowUp:[0,0.2],ArrowDown:[0,-0.2]}[e.key];
      if (delta) { e.preventDefault(); rotate(...delta); }
    });
    let pointer = null, dragged = false;
    on(svg, 'pointerdown', e => {
      if (e.button !== 0) return;
      pointer = {id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY}; dragged = false;
    });
    on(svg, 'pointermove', e => {
      if (!pointer || pointer.id !== e.pointerId) return;
      if (Math.abs(e.clientX-pointer.x) > 7) { dragged = true; svg.setPointerCapture(e.pointerId); }
      if (dragged) { rotate((e.clientX-pointer.lastX)*0.009,(e.clientY-pointer.lastY)*0.006); pointer.lastX=e.clientX;pointer.lastY=e.clientY; }
    });
    on(svg, 'pointerup', () => { pointer = null; }); on(svg, 'pointercancel', () => { pointer=null; dragged=false; });
    on(svg, 'click', e => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged=false; } }, {capture:true});
    // No animation loop, including reduced motion. Offscreen views do no work.
    const observer = new IntersectionObserver(entries => { visible=entries[0].isIntersecting; if (visible) schedule(); else if(frame){cancelAnimationFrame(frame);frame=0;} }, {rootMargin:'120px'});
    observer.observe(root);
    const resize = new ResizeObserver(schedule); resize.observe(svg);
    choose(selected); schedule();
    const dispose = () => { abort.abort(); observer.disconnect(); resize.disconnect(); if(frame) cancelAnimationFrame(frame); wrap.remove(); mounted.delete(root); };
    mounted.set(root, dispose); return dispose;
  }
  function init() {
    document.querySelectorAll('[data-tvijo-graph]').forEach(root => {
      try { mount(root, JSON.parse(root.dataset.tvijoGraph)); } catch { /* text links remain available */ }
    });
    document.querySelectorAll('[data-tk-theme]').forEach(button => button.addEventListener('click', () => {
      const dark = document.documentElement.dataset.tkTheme === 'dark' || (!document.documentElement.dataset.tkTheme && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.dataset.tkTheme = dark ? 'light' : 'dark';
    }));
  }
  window.TvijoKnowledgeGraph = {mount, safeHref};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
