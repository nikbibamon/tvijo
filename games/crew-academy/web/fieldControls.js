// Each thumb owns its own control. Losing one pointer must not release the other.
export function bindFieldPads({movement,jump,use}){
 const held=new Map();
 const onMove=()=>movement([...held.values()].filter(x=>x==='left'||x==='right'));
 const buttons=document.querySelectorAll('[data-pad]');
 for(const button of buttons){
  const key=button.dataset.pad;
  const press=e=>{
   if(e.button!==undefined&&e.button!==0)return;
   e.preventDefault();
   try{button.setPointerCapture?.(e.pointerId);}catch{/* A cancelled touch may have already lost capture. */}
   held.set(e.pointerId,key);button.classList.add('held');
   if(key==='jump')jump();else if(key==='use')use();else onMove();
  };
  function release(e){if(held.get(e.pointerId)!==key)return;held.delete(e.pointerId);if(![...held.values()].includes(key))button.classList.remove('held');onMove();}
  button.addEventListener('pointerdown',press);
  for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,release);
  for(const name of ['pointerup','pointercancel'])globalThis.window?.addEventListener(name,release);
  button.addEventListener('click',e=>{if(e.detail===0){if(key==='jump')jump();else if(key==='use')use();}});
 }
 return ()=>{held.clear();for(const b of buttons)b.classList.remove('held');onMove();};
}
