import {applyWorkshop,restore} from './game.js';

const key='tvijo.clockwork.v1';
let memory;
export function read(){
  try{return restore(JSON.parse(localStorage.getItem(key))??memory);}
  catch{return restore(memory);}
}
export const balance=()=>0;
export function subscribe(listener){
  window.addEventListener('storage',event=>{if(event.key===key)listener();});
}
export function update(action) {
  const apply=()=>{
    const profile={clockwork:read()};
    const result=applyWorkshop(profile,action);
    memory=result.game;
    try{localStorage.setItem(key,JSON.stringify(memory));}catch{}
    return result;
  };
  return navigator.locks?.request ? navigator.locks.request(key,apply) : apply();
}
