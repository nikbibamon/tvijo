const icons={
jump:'<path d="m5 11 7-7 7 7m-7-7v13M4 20h16"/>',hand:'<path d="M8 12V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v8c0 4-3 7-7 7-3 0-4-1-6-3l-4-5c-2-3 1-4 3-2l2 2Z"/>',
station:'<path d="m3 11 9-8 9 8v9H3z"/><path d="M9 20v-6h6v6M6 10h12"/>',
map:'<path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2zM9 3v15m6-12v15"/>',rocket:'<path d="M9 15 6 12C9 5 14 3 21 3c0 7-2 12-9 15l-3-3Zm-3-3-3 1 1-5 5-1m3 11-1 3 5-1 1-5m-9 2c-2 0-4 2-4 4 2 0 4-2 4-4Z"/><circle cx="15" cy="9" r="1.8"/>',
book:'<path d="M5 3h13a1 1 0 0 1 1 1v16H6a3 3 0 0 1-3-3V6a3 3 0 0 1 2-3Zm-2 14a3 3 0 0 1 3-3h13M8 7h7m-7 3h5"/>',
gem:'<path d="m12 2 7 5v10l-7 5-7-5V7z"/><path d="m12 6 3 6-3 6-3-6z"/>',plus:'<path d="M5 12h14m-7-7v14"/>',mute:'<path d="m3 9 4 0 5-4v14l-5-4H3zM16 9l5 6m0-6-5 6"/>',sound:'<path d="m3 9 4 0 5-4v14l-5-4H3zM16 8q4 4 0 8m3-11q6 7 0 14"/>',
orbit:'<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="11" ry="3.6" transform="rotate(-30 12 12)"/>',
play:'<path d="m6 3 14 9-14 9z" fill="currentColor" stroke="none"/>',users:'<circle cx="9" cy="8" r="3.3"/><path d="M2 20v-2c0-4 3-6 7-6s7 2 7 6v2Zm14-15c5 0 6 6 1 7m1 2c3 1 4 3 4 6"/>',
route:'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9"/>',
chev:'<path d="m9 5 7 7-7 7"/>',chevdown:'<path d="m5 9 7 7 7-7"/>',
layers:'<path d="m12 2 10 6-10 6L2 8zm-9 11 9 5 9-5M3 17l9 5 9-5"/>',
radio:'<circle cx="12" cy="10" r="2"/><path d="M7.5 5.5a6.4 6.4 0 0 0 0 9m9-9a6.4 6.4 0 0 1 0 9M4.5 2.5a10.6 10.6 0 0 0 0 15m15-15a10.6 10.6 0 0 1 0 15M8.5 22 12 12l3.5 10m-6-3h5"/>',
chip:'<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M8 2v3m4-3v3m4-3v3M8 19v3m4-3v3m4-3v3M2 8h3m-3 4h3m-3 4h3m14-8h3m-3 4h3m-3 4h3"/>',
mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1m-7 8v4m-4 0h8"/>',
send:'<path d="m3 10 18-7-7 18-2.5-8.5L3 10Zm8.5 2.5L21 3"/>',x:'<path d="m6 6 12 12m0-12L6 18"/>',pause:'<path d="M8 5v14m8-14v14" stroke-width="4"/>',
left:'<path d="m14 5-7 7 7 7"/>',right:'<path d="m10 5 7 7-7 7"/>',
award:'<circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-4 6 4-2-8"/>',chart:'<path d="M3 3v18h18M7 16v-3m5 3V9m5 7V6"/>',zap:'<path d="M14 2 4 14h7l-1 8 10-13h-7z"/>',
lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',check:'<path d="m4 12 5 5L20 6"/>',person:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>'};
export function icon(name){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[name]||'')+'</svg>';}
export function populate(root=document){root.querySelectorAll('i[data-i]').forEach(el=>{if(!el.firstChild)el.innerHTML=icon(el.dataset.i);});}
