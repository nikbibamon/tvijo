export const width=7, height=5, maxStack=4, demoPrice=10;
export const materials=['oak','stone','prism'];
const cell=(x,z)=>z*width+x;
const count=width*height;

function level(id,rows,stock,guide,relay=null) {
  return {id,ground:rows.join('').split('').map(Number),stock,guide,relay,start:cell(0,2),end:cell(6,2)};
}

export const rooms=[
  level('gap',['1100011','1100011','1110111','1100011','0100010'],[1,0,0],cell(3,2)),
  level('stairs',['1100000','1110003','1110033','1110003','1100000'],[2,3,0],cell(3,2)),
  level('relay',['1100000','1110304','1110304','1100000','1000000'],[3,4,1],cell(3,1),cell(3,1)),
  level('studio',['0001000','0011100','0111110','0011100','0001000'],[40,40,40],cell(3,2))
];

export const byRoom=Object.fromEntries(rooms.map(room=>[room.id,room]));
const victoryRooms=rooms.slice(0,3).map(room=>room.id);
const empty=()=>Array.from({length:count},()=>[]);
const validCell=index=>Number.isInteger(index)&&index>=0&&index<count;
const fixed=(room,index)=>room.id!=='studio'&&(index===room.start||index===room.end);
export const elevation=(room,stacks,index)=>room.ground[index]+stacks[index].length;

function restoreStack(room,raw) {
  const remaining=room.stock.slice();
  return empty().map((_,i)=>{
    const column=raw?.[i], result=[];
    if (fixed(room,i)||!Array.isArray(column)) return result;
    for (const material of column.slice(0,maxStack-room.ground[i])) {
      if (!Number.isInteger(material)||!(remaining[material]>0)) break;
      remaining[material]--;
      result.push(material);
    }
    return result;
  });
}

export function canVisit(game,id) {
  return id==='gap'||id==='studio'||id==='stairs'&&Boolean(game.access)||id==='relay'&&game.wins.includes('stairs');
}

export function restore(raw) {
  const prior=raw?.v===1?raw:{};
  const wins=victoryRooms.filter(key=>Array.isArray(prior.wins)&&prior.wins.includes(key));
  const access=wins.includes('gap')?'puzzle':prior.access==='credits'?'credits':null;
  const game={v:1,access,wins,room:'gap',boards:{}};
  if (canVisit(game,prior.room)) game.room=prior.room;
  for (const room of rooms) {
    const board=prior.boards?.[room.id];
    if (board) game.boards[room.id]={stacks:restoreStack(room,board.stacks),
      history:Array.isArray(board.history)?board.history.slice(-24).map(it=>restoreStack(room,it)):[]};
  }
  return game;
}

export const boardFor=(game,id=game.room)=>game.boards[id]??{stacks:empty(),history:[]};

export function stockFor(room,stacks) {
  const remaining=room.stock.slice();
  for (const column of stacks) for (const value of column) remaining[value]--;
  return remaining;
}

function adj(index) {
  const x=index%width, z=Math.floor(index/width);
  return [
    x<width-1?index+1:-1,z>0?index-width:-1,
    x>0?index-1:-1,z<height-1?index+width:-1
  ].filter(validCell);
}

function walk(room,stacks,start,end) {
  const queue=[start], previous=new Map([[start,null]]);
  for (let k=0;k<queue.length;k++) {
    const index=queue[k];
    if (index===end) {
      const path=[end];
      for (let p=previous.get(end);p!==null;p=previous.get(p)) path.push(p);
      return path.reverse();
    }
    const at=elevation(room,stacks,index);
    for (const next of adj(index)) {
      const nextHeight=elevation(room,stacks,next);
      if (previous.has(next)||!nextHeight||Math.abs(at-nextHeight)>1) continue;
      previous.set(next,index);
      queue.push(next);
    }
  }
  return null;
}

export function route(room,stacks) {
  if (room.id==='studio') return null;
  if (room.relay===null) return walk(room,stacks,room.start,room.end);
  if (stacks[room.relay].at(-1)!==2) return null;
  const first=walk(room,stacks,room.start,room.relay);
  const second=walk(room,stacks,room.relay,room.end);
  return first&&second?[...first,...second.slice(1)]:null;
}

export function applyWorkshop(profile,action,allowCredits=false) {
  const game=restore(profile.clockwork);
  const room=byRoom[game.room],board=boardFor(game);
  const reply=status=>({game,status});
  const keep=(next,details={})=>{
    profile.clockwork=next;
    return {game:next,...details};
  };
  if (action.type==='visit') {
    if (!canVisit(game,action.id)) return reply('locked');
    return keep({...game,room:action.id});
  }
  if (action.type==='credits') {
    if (!allowCredits) return reply('locked');
    if (game.access) return keep({...game,room:'stairs'});
    if (!Number.isInteger(profile.balance)||profile.balance<demoPrice) return reply('balance');
    profile.balance-=demoPrice;
    if (profile.tallies) profile.tallies.spend+=demoPrice;
    return keep({...game,access:'credits',room:'stairs'},{charged:demoPrice,status:'unlocked'});
  }
  if (action.room!==room.id) return reply('moved');

  const saveBoard=(stacks,history,details)=>keep({...game,boards:{...game.boards,[room.id]:{stacks,history}}},details);
  const change=stacks=>saveBoard(stacks,[...board.history.slice(-23),board.stacks]);
  if (action.type==='undo') {
    if (!board.history.length) return reply('emptyHistory');
    return saveBoard(board.history.at(-1),board.history.slice(0,-1));
  }
  if (action.type==='reset') return change(empty());
  if (action.type==='walk') {
    const path=route(room,board.stacks);
    if (!path) return reply('tryPath');
    const firstWin=!game.wins.includes(room.id);
    const wins=firstWin?[...game.wins,room.id]:game.wins;
    return keep({...game,wins,access:game.access??'puzzle'},{path,firstWin,status:'passed'});
  }
  const index=action.index;
  if (!validCell(index)||fixed(room,index)) return reply('fixed');
  if (action.type==='remove') {
    if (!board.stacks[index].length) return reply('unset');
    return change(board.stacks.map((column,i)=>i===index?column.slice(0,-1):column));
  }
  if (action.type!=='place'||!Number.isInteger(action.material)) return reply('fixed');
  if (elevation(room,board.stacks,index)>=maxStack) return reply('tooHigh');
  if (!(stockFor(room,board.stacks)[action.material]>0)) return reply('noBlocks');
  return change(board.stacks.map((column,i)=>i===index?[...column,action.material]:column),{status:'placed'});
}
