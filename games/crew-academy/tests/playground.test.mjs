import test from 'node:test';
import assert from 'node:assert/strict';
import {applyPlayground,games,makeLevel,savedRun} from '../web/playground/levels.js';
import {ice,icePlan} from '../web/playground/ice.js';
import {wirePlan} from '../web/playground/wire.js';
import {forecast,postPlan} from '../web/playground/post.js';

function act(profile,id,type,input,entropy=0){
  const {level,seed}=savedRun(profile,id);
  return applyPlayground(profile,id,{type,level,seed,input},entropy);
}

function script(id,layout){
  if (id==='ice') return icePlan(layout);
  if (id==='wire') return wirePlan(layout,layout.turns);
  const {angle,force}=postPlan(layout)[0];
  return [{setting:'angle',value:angle},{setting:'force',value:force},'throw'];
}

test('the three authored levels teach one short task and advance only after a win',()=>{
  for (const id of Object.keys(games)){
    const profile={balance:0};
    const first=makeLevel(id,1,0);
    assert.equal(act(profile,id,'next',undefined,25).run.level,1);
    const commands=script(id,first);
    assert.equal(commands.length,id==='post'?3:1);
    let win;
    for (const command of commands) win=act(profile,id,'move',command);
    assert.equal(win.run.won,true,id);
    assert.equal(win.firstWin,true);
    assert.equal(win.run.moves,1);
    const old={type:'next',level:1,seed:0};
    const second=applyPlayground(profile,id,old,1523).run;
    assert.deepEqual([second.level,second.seed,second.best,second.won],[2,1523,1,false]);
    assert.deepEqual(applyPlayground(profile,id,old,8291).run,second);
    const replay=act(profile,id,'restart').run;
    assert.equal(replay.seed,1523);
    assert.deepEqual(makeLevel(id,2,replay.seed),makeLevel(id,2,1523));
    assert.equal(profile.balance,0);
  }
});

test('generated levels solve through real inputs with bounded and progressive difficulty',()=>{
  let validated=0;
  for (const id of Object.keys(games)) {
    for (let level=2;level<=9;level++){
      for (let i=0;i<48;i++){
        const seed=(i*3910115819)>>>0;
        const layout=makeLevel(id,level,seed);
        assert.deepEqual(makeLevel(id,level,seed),layout);
        const game=games[id];
        let state=game.start(layout);
        const actions=script(id,layout);
        if(id==='ice')assert.equal(actions.length,Math.min(level,7));
        if(id==='wire')assert.ok(actions.length>=Math.min(level,8));
        if(id==='post'){
          assert.notEqual(forecast(layout,state.angle,state.force).result,'dock');
          assert.equal(Boolean(layout.beam),level>=4);
        }
        let solved=false;
        for(const action of actions){
          const result=game.move(layout,state,action);
          if(!result?.state)continue;
          state=result.state;
          solved=result.won;
        }
        assert.equal(solved,true,id+' '+level+' '+seed);
        validated++;
      }
    }
  }
  assert.equal(validated,1152);
});

test('the fallback always has a shortest route of the requested size',()=>{
  for(let level=2;level<=10;level++)assert.equal(icePlan(ice.generate(level,()=>0)).length,Math.min(level,7));
});

test('a miss can be retried, persisted moves can be undone, and replays do not earn again',()=>{
  const profile={balance:12};
  const blocked=act(profile,'ice','move','left');
  assert.equal(blocked.run.won,false);
  assert.equal(blocked.run.moves,1);
  const saved=JSON.parse(JSON.stringify(profile));
  assert.equal(act(saved,'ice','undo').run.board.position,makeLevel('ice',1,0).start);
  assert.equal(act(saved,'ice','move','right').firstWin,true);
  act(saved,'ice','restart');
  assert.equal(act(saved,'ice','move','right').firstWin,false);
  const miss=act(saved,'post','move','throw');
  assert.equal(miss.run.won,false);
  assert.equal(miss.run.board.last.result,'short');
  assert.equal(act(saved,'post','undo').run.board.last,null);
  assert.equal(savedRun(saved,'ice').won,true);
  assert.equal(saved.balance,12);
});
