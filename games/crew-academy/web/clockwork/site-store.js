import {bus,note,state,write} from '../tvijoService.js';
import {applyWorkshop,restore} from './game.js';

export const read=()=>restore(state.clockwork);
export const balance=()=>state.balance;
export function subscribe(listener){bus.addEventListener('change',listener);}
export function update(action) {
  return write(profile=>{
    const result=applyWorkshop(profile,action,true);
    if (result.charged) note(profile,'wallet','Мастерская Семейных часов · '+result.charged+' демо-кр.');
    if (result.firstWin) note(profile,'field','Лестница к Семейным часам · пройден чертёж '+result.game.room+'.');
    return result;
  });
}
