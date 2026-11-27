import {createInterface} from 'node:readline';
import {validateOrder} from './pilot.js';
import {planTurn,readyTasks} from '../web/strategy.js';
const lines=createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of lines){
  try{const candidate=JSON.parse(line),input=validateOrder(candidate);
    if(!input){console.log(JSON.stringify({error:'invalid_order'}));continue;}
    const reply=planTurn(input);
    const digest={stage:input.level.id,open:readyTasks(input.level,input.done),recent_clarifications:input.feedback?.blocks??null,focus:input.feedback?.focus??null};
    console.log(JSON.stringify({reply,digest}));
  }catch{console.log(JSON.stringify({error:'invalid_order'}));}
}
