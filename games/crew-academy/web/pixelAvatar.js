import {validPixelAvatar} from './crewLabels.js';

const colors=[
 ['','#242035','#664e78','#ad80bd','#f9af99','#f9dc95','#9fdbd7','#fff1cf'],
 ['','#142739','#274e65','#47838e','#5bc5b1','#abedbf','#f5c574','#fff2d3'],
 ['','#302135','#54314c','#974962','#df8172','#ffbb79','#eee1af','#fff7da'],
 ['','#1c243e','#38406d','#6863a8','#a697df','#d0e8fa','#f2bd77','#fff4e7']
];
const suits=['Туманность','Бирюза','Закат','Орбита'];
const inks=['Стереть','Контур','Тень','Полутон','Основной','Свет','Акцент','Блик'];
const helmet=['0000000110000000','0000011661100000','0000112442210000','0001224444221000','0012444444442100','0124411111114210','0124166666661420','0121633667766120','0121633667666120','0124166666661420','0012441111114210','0001244444442100','0000125555521000','0000012222210000','0000011111110000','0000000000000000'].join('');
const ship=['0000000000000000','0000000110000000','0000001441000000','0000014674100000','0000014674100000','0000144664410000','0000144444410000','0001144114411000','0012244114422100','0122244444422210','0111145555411110','0000012222100000','0000001661000000','0000000550000000','0000000500000000','0000000000000000'].join('');
export function paintAvatar(canvas,code){
 if(!validPixelAvatar(code)||!code)return;
 const [palette,pixels]=code.split(':');const ctx=canvas.getContext('2d');ctx.clearRect(0,0,16,16);
 for(let i=0;i<256;i++){const color=colors[+palette][+pixels[i]];if(color){ctx.fillStyle=color;ctx.fillRect(i%16,i>>4,1,1);}}
}
export function pixelPreview(code,label='Пиксельный аватар'){
 const cn=document.createElement('canvas');cn.width=cn.height=16;cn.className='pixel-avatar';cn.setAttribute('role','img');cn.setAttribute('aria-label',label);paintAvatar(cn,code);return cn;
}
export function pixelStudio({el,group,action,para},initial,save,cancel){
 const [p=0,pattern=helmet]=(initial||'0:'+helmet).split(':');let palette=+p,ink=4,pixels=pattern.split(''),pointer=null,previous=null,cursor=0;
 const code=()=>palette+':'+pixels.join('');
 const note=el('div','club-feedback');note.setAttribute('role','status');const gridWrap=el('div','paint-board'),grid=pixelPreview(code(),'Полотно, 16 на 16. Стрелки перемещают кисть, пробел рисует.');
 grid.classList.add('paint-grid');grid.tabIndex=0;const marker=el('span','paint-cursor');gridWrap.append(grid,marker);
 const swatches=group('ink-swatches'),styles=group('chip-group'),badge=pixelPreview(code(),'Предпросмотр аватара');
 function refresh(){
  paintAvatar(grid,code());paintAvatar(badge,code());marker.style.left=(cursor%16)*6.25+'%';marker.style.top=Math.floor(cursor/16)*6.25+'%';
  for(const [i,b] of [...swatches.children].entries()){b.style.setProperty('--ink',colors[palette][i]||'transparent');b.setAttribute('aria-pressed',String(ink===i));}
  for(const [i,b] of [...styles.children].entries())b.setAttribute('aria-pressed',String(i===palette));
 }
 for(const [i,name] of inks.entries()){const b=action(i===0?'×':'',()=>{ink=i;refresh();},'paint-ink');b.setAttribute('aria-label',name);b.title=name;swatches.append(b);}
 suits.forEach((n,i)=>styles.append(action(n,()=>{palette=i;refresh();},'chip')));
 function cell(e){const r=grid.getBoundingClientRect();return [Math.min(15,Math.max(0,Math.floor((e.clientX-r.left)*16/r.width))),Math.min(15,Math.max(0,Math.floor((e.clientY-r.top)*16/r.height)))];}
 function stroke(e){const [x,y]=cell(e),[a,b]=previous||[x,y],n=Math.max(Math.abs(a-x),Math.abs(b-y),1);for(let k=0;k<=n;k++){const c=Math.round(a+(x-a)*k/n)+16*Math.round(b+(y-b)*k/n);pixels[c]=String(ink);}previous=[x,y];cursor=x+16*y;refresh();}
 grid.onpointerdown=e=>{if(pointer!==null)return;e.preventDefault();grid.focus({preventScroll:true});pointer=e.pointerId;grid.setPointerCapture(pointer);stroke(e);};
 grid.onpointermove=e=>{if(e.pointerId===pointer)stroke(e);};grid.onpointerup=grid.onpointercancel=grid.onlostpointercapture=e=>{if(e.pointerId===pointer){previous=null;pointer=null;}};
 grid.onkeydown=e=>{const dx={ArrowLeft:-1,ArrowRight:1},dy={ArrowUp:-1,ArrowDown:1};
  if(e.code in dx)cursor=(cursor&240)+Math.max(0,Math.min(15,(cursor%16)+dx[e.code]));else if(e.code in dy)cursor=cursor%16+Math.max(0,Math.min(15,(cursor>>4)+dy[e.code]))*16;
  else if(e.code==='Space'||e.code==='Enter')pixels[cursor]=String(ink);else return;e.preventDefault();refresh();
 };
 const upload=el('input','sr');upload.type='file';upload.accept='image/png,image/jpeg,image/webp';
 upload.onchange=async()=>{
  const f=upload.files?.[0];if(!f)return;
  if(f.size>4*1024*1024||!['image/jpeg','image/png','image/webp'].includes(f.type)){note.textContent='Выбери PNG, JPEG или WebP до 4 МБ.';return;}
  let bitmap,url;try{url=URL.createObjectURL(f);bitmap=new Image();bitmap.src=url;await bitmap.decode();
   const size=Math.min(bitmap.naturalWidth,bitmap.naturalHeight),cn=document.createElement('canvas');cn.width=cn.height=16;const ctx=cn.getContext('2d',{willReadFrequently:true});
   ctx.drawImage(bitmap,(bitmap.naturalWidth-size)/2,(bitmap.naturalHeight-size)/2,size,size,0,0,16,16);const a=ctx.getImageData(0,0,16,16).data;
   const rgb=colors[palette].slice(1).map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));pixels=Array.from({length:256},(_,i)=>{
    if(a[i*4+3]<80)return '0';const dist=rgb.map(c=>c.reduce((sum,v,j)=>sum+(v-a[i*4+j])**2,0));return String(1+dist.indexOf(Math.min(...dist)));
   });refresh();note.textContent='Картинка превращена в пиксели. Можешь дорисовать её.';
  }catch{note.textContent='Не удалось открыть изображение.';}finally{if(url)URL.revokeObjectURL(url);upload.value='';}
 };
 const commands=group('chip-group',action('Шлем',()=>{pixels=helmet.split('');refresh();},'chip'),action('Ракета',()=>{pixels=ship.split('');refresh();},'chip'),action('Очистить',()=>{pixels=Array(256).fill('0');refresh();},'chip'),action('Из файла',()=>upload.click(),'chip'));
 const saveButton=action('Применить аватар',()=>{if(!pixels.some(v=>v!=='0')){note.textContent='Добавь хотя бы один цветной пиксель.';return;}save(code());},'btn primary','check');
 refresh();
 return [group('paint-heading',badge,para('Нарисуй знак пилота или преврати своё изображение в 16 × 16 пикселей. Исходный файл остаётся на устройстве.')),group('paint-layout',gridWrap,group('paint-tools',swatches,styles,commands)),upload,note,group('actions',saveButton,action('Вернуть портрет героя',()=>save(''),'btn secondary'),action('Назад',cancel,'text-btn'))];
}
