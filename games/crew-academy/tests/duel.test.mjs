import test from 'node:test';
import assert from 'node:assert/strict';
import {applyPlayground,makeLevel,savedRun} from '../web/playground/levels.js';
import {duel,field,trace} from '../web/playground/duel.js';

function apply(profile,type,input,entropy=0){
  const {level,seed,board}=savedRun(profile,'duel');
  return applyPlayground(profile,'duel',{type,level,seed,turn:board.turn,input},entropy);
}

test('the first shot dents the ground, pushes the rival and wins immediately',()=>{
  const layout=duel.first, board=duel.start(layout);
  assert.equal(trace(layout,board,0).kind,'hit');
  const change=duel.move(layout,board,'launch');
  assert.equal(change.won,true);
  assert.equal(change.motion.length,1);
  assert.notDeepEqual(change.state.terrain,board.terrain);
  assert.notEqual(change.state.pilots[1].x,board.pilots[1].x);
  assert.equal(change.state.pilots[1].shield,0);
  assert.equal(board.pilots[1].shield,40);
  assert.equal(duel.move(layout,change.state,'launch'),null);
});

test('a miss gives the rival a reply, both changes survive reload and undo restores the old arena',()=>{
  const profile={balance:7};
  apply(profile,'move',{setting:'force',value:0});
  const before=savedRun(profile,'duel');
  const miss=apply(profile,'move','launch');
  assert.equal(miss.run.won,false);
  assert.equal(miss.run.board.turn,1);
  assert.equal(miss.motion.length,2);
  assert.deepEqual(miss.motion.map(shot=>shot.side),[0,1]);
  assert.equal(miss.run.board.last[0].kind,'water');
  assert.deepEqual(miss.motion[0].before.terrain,miss.motion[0].after.terrain);

  const reloaded=JSON.parse(JSON.stringify(profile));
  assert.deepEqual(savedRun(reloaded,'duel'),miss.run);
  const stale=applyPlayground(reloaded,'duel',{type:'move',input:'launch',turn:0,level:1,seed:0},0);
  assert.deepEqual(stale.run,miss.run);
  const undone=apply(reloaded,'undo').run;
  assert.deepEqual(undone.board,before.board);
  assert.equal(reloaded.balance,7);
});

test('seeded windy islands are varied and can be won by following the in-game controls',()=>{
  for (let level=2;level<=9;level++){
    const layouts=new Set();
    for (let i=0;i<48;i++){
      const seed=(i*3910115819)>>>0, layout=makeLevel('duel',level,seed);
      assert.deepEqual(makeLevel('duel',level,seed),layout);
      assert.notEqual(layout.wind,0);
      assert.equal(layout.terrain[57]!==null,level>=3);
      layouts.add(JSON.stringify(layout));
      let board=duel.start(layout);
      for (let n=0;n<16&&!board.outcome;n++){
        const {control}=duel.hint(layout,board);
        const [setting,value]=control.split('-');
        const result=duel.move(layout,board,control==='launch'?control:{setting,value:Number(value)});
        assert.ok(result?.state);
        board=result.state;
        for (const pilot of board.pilots) {
          if(pilot.shield) assert.equal(pilot.y,board.terrain[pilot.x]);
          assert.ok(pilot.y<=field.water);
        }
      }
      assert.equal(board.outcome,'won','level '+level+' seed '+seed);
      assert.ok(board.turn>=2&&board.turn<=4);
    }
    assert.ok(layouts.size>=30);
  }
});

test('the next round is free, and an exhausted duel can be undone and retried',()=>{
  const profile={balance:11};
  apply(profile,'move','launch');
  const second=apply(profile,'next',null,1523).run;
  assert.equal(second.level,2);
  assert.equal(second.seed,1523);
  for (let n=0;n<10&&!savedRun(profile,'duel').board.outcome;n++) apply(profile,'move','launch');
  const final=savedRun(profile,'duel');
  assert.ok(['lost','draw'].includes(final.board.outcome));
  assert.equal(apply(profile,'next',null,82).run.level,2);
  assert.equal(apply(profile,'undo').run.board.outcome,null);
  assert.deepEqual(apply(profile,'restart').run.board,second.board);
  assert.equal(profile.balance,11);
});
