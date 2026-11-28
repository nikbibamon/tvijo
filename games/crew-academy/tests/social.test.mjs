import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync} from 'node:crypto';
import {openCrewDB} from '../tools/preview-db.mjs';
import {handleAPI} from '../server/pilot.js';
import {intent} from '../web/strategy.js';
import {authorizeCrew} from '../server/portal/frontend/src/lib/crew-handoff.ts';
const base='https://tvijo-crew-academy.be9ava.chatgpt.site';
function player(env){
 let cookie='';
 return {get cookie(){return cookie;},async fetch(path,body,headers={}){
  const res=await handleAPI(new Request(base+path,{method:body===undefined?'GET':'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)}),env);
  if(res.headers.has('Set-Cookie'))cookie=res.headers.get('Set-Cookie').split(';')[0];
  return {code:res.status,data:await res.json()};
 },join(){return this.fetch('/api/crew/join',{hero:'robot'});},room(){return this.fetch('/api/crew/room');},share(visible=true){return this.fetch('/api/crew/profile',{hero:'robot',focus:'build',visible});},
 pair(other,action){return this.fetch('/api/crew/pair',{other,action});},note(other,phrase,world){return this.fetch('/api/crew/note',{other,phrase,world});},
 turn(stage,text,done=[],tier='standard'){return this.fetch('/api/herdr/turn',{level:stage,parsed:intent(text),done,tier,hero:'robot'});}};
}
test('two crews privately join, publish, invite, consent, exchange a playable world, mute and withdraw',async()=>{
 const {db,DB}=await openCrewDB();try{
 const a=player({DB}),b=player({DB}),outsider=player({DB});
 await a.join();await b.join();const A=(await a.room()).data.me.id,B=(await b.room()).data.me.id;
 assert.equal((await outsider.room()).data.board.length,0);assert.equal((await a.note(B,'hello')).code,403);
 await a.share();await b.share();assert.equal((await outsider.fetch('/api/crew/room?player='+A)).data.card.id,A);const fields=Object.keys((await outsider.room()).data.board[0]).sort();
 assert.deepEqual(fields,['avatar','badge','beacons','callsign','fame','focus','hero','id','points']);assert.equal((await a.note(B,'hello')).code,409);
 assert.equal((await a.pair(B,'invite')).code,200);assert.equal((await a.pair(B,'accept')).code,409);
 assert.equal((await b.room()).data.peers[0].sender,A);assert.equal((await b.pair(A,'accept')).code,200);
 assert.equal((await a.note(B,'world','lava.build.7.3.0')).code,200);assert.equal((await b.room()).data.notes[0].world,'lava.build.7.3.0');
 assert.equal((await b.note(A,'world','https://invalid.test')).code,422);assert.equal((await b.note(A,'free text')).code,422);
 assert.equal((await outsider.room()).data.notes.length,0);
 assert.equal((await b.pair(A,'mute')).code,200);assert.deepEqual((await b.room()).data.blocked.map(p=>p.id),[A]);
 assert.equal((await a.room()).data.board.some(p=>p.id===B),false);assert.equal((await a.note(B,'hello')).code,404);
 await b.pair(A,'unmute');assert.equal((await a.room()).data.board.some(p=>p.id===B),true);
 await a.pair(B,'invite');await b.pair(A,'accept');await a.note(B,'thanks');await b.share(false);
 assert.equal((await outsider.room()).data.board.length,1);assert.equal((await outsider.fetch('/api/crew/room?player='+B)).data.card,null);assert.equal((await a.room()).data.notes.length,0);assert.equal((await a.room()).data.peers.length,0);
 const forged=await outsider.fetch('/api/crew/room',undefined,{Cookie:'tvijo_crew='+A+A});assert.equal(forged.data.me,null);
 assert.equal((await a.fetch('/api/crew/profile',{hero:'son',focus:'explore',visible:true},{Origin:'https://different.test'})).code,403);
 }finally{db.close();}
});
test('rank only credits new canonical actions, enforces its own prerequisites and ignores cost and generated worlds',async()=>{
 const {db,DB}=await openCrewDB();try{
 const a=player({DB});await a.join();await a.share();
 await a.turn('dock','Робот, держи мост',[],'genius');
 await a.turn('dock','Робот, держи мост');assert.equal((await a.room()).data.me.points,1);
 await a.turn('rift','Дочка, введи код в шлюз',['scan','power']);assert.equal((await a.room()).data.me.points,1);
 await a.turn('rift','Самолётик, найди частоту! Ассистентка, подай энергию! Дочка, введи код в шлюз, чтобы открыть путь.');assert.equal((await a.room()).data.me.points,4);assert.equal((await a.room()).data.me.badge,'chain');
 await a.turn('world.lava.build.7.3.0','Робот, держи мост');assert.equal((await a.room()).data.me.points,4);
 assert.equal((await a.fetch('/api/crew/profile',{hero:'robot',focus:'build',visible:true,points:1000000})).code,422);
 }finally{db.close();}
});
test('first-party signing verifies the portal bearer only on tvijo.com and game redeems once in initiating browser across devices',async()=>{
 const {db,DB}=await openCrewDB();try{
 const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 const env={DB,CREW_TVIJO_VERIFY_KEY:JSON.stringify(publicKey.export({format:'jwk'}))};
 const config={signingPem:privateKey.export({format:'pem',type:'pkcs8'}).toString(),subjectKey:Buffer.alloc(32,17).toString('base64')};
 const a=player(env),b=player(env),disabled=player({DB});await a.join();await b.join();await disabled.join();
 assert.equal((await disabled.fetch('/api/crew/auth/start',{})).data.available,false);
 async function begin(client){const started=await client.fetch('/api/crew/auth/start',{});const u=new URL(started.data.url);return new URL(u.searchParams.get('redirect'),u).searchParams.get('state');}
 async function issue(nonce,uid=24,origin='https://tvijo.com',responseCode=200){
  const req=new Request('https://tvijo.com/api/game/academy-proof',{method:'POST',headers:{Origin:origin,Authorization:'Bearer simulated_portal_access','X-Crew-State':nonce}});
  return authorizeCrew(req,config,async(u,opts)=>{assert.equal(u,'https://tvijo.com/api/v1/auth/me/');assert.equal(opts.headers.Authorization,'Bearer simulated_portal_access');return Response.json({id:uid,email:'private@example.test',full_name:'PRIVATE'},{status:responseCode});});
 }
 const nonce=await begin(a);assert.equal((await issue(nonce,1,'https://other.example')).status,403);assert.equal((await issue(nonce,1,'https://tvijo.com',401)).status,401);
 const proof=(await (await issue(nonce)).json()).returnUrl.split('#tvijo=')[1];
 const info=JSON.parse(Buffer.from(proof.split('.')[1],'base64url').toString());assert.deepEqual(Object.keys(info).sort(),['aud','exp','iat','iss','nonce','sub']);assert.notEqual(info.sub,'24');
 const firstCookie=a.cookie;
 assert.equal((await b.fetch('/api/crew/auth/finish',{ticket:proof})).code,403);
 assert.equal((await a.fetch('/api/crew/auth/finish',{ticket:proof.slice(0,-8)+'ABCDEFGH'})).code,403);
 assert.equal((await a.fetch('/api/crew/auth/finish',{ticket:proof})).code,200);assert.notEqual(a.cookie,firstCookie);
 assert.equal((await a.fetch('/api/crew/auth/finish',{ticket:proof})).code,403);
 const me=(await a.room()).data.me;assert.equal(me.linked,1);
 const old=await disabled.fetch('/api/crew/room',undefined,{Cookie:firstCookie});assert.equal(old.data.me,null);
 const ticket2=(await (await issue(await begin(b))).json()).returnUrl.split('#tvijo=')[1];
 assert.equal((await b.fetch('/api/crew/auth/finish',{ticket:ticket2})).code,200);assert.equal((await b.room()).data.me.id,me.id);
 await b.fetch('/api/crew/logout',{});assert.equal((await b.room()).data.me,null);assert.equal((await a.room()).data.me.id,me.id);
 }finally{db.close();}
});
test('goals with negation and natural sentence boundaries preserve command meaning',()=>{
 assert.deepEqual(intent('Робот, держи мост, чтобы мы не упали.').orders,['bridge']);assert.deepEqual(intent('Робот, не держи мост, чтобы мы успели.').orders,[]);
});
test('two accepted pilots exchange a private frequency in order, share a beacon and have independent pixel profiles',async()=>{
 const {db,DB}=await openCrewDB();
 try{
  const [a,b,c]=[player({DB}),player({DB}),player({DB})];
  for(const user of [a,b,c]){await user.join();await user.share();}
  const A=(await a.room()).data.me.id,B=(await b.room()).data.me.id;
  const act=(u,other,action,mission,sequence)=>u.fetch('/api/crew/relay',{other,action,mission,sequence});
  assert.equal((await act(a,B,'start')).code,409);
  await a.pair(B,'invite');await b.pair(A,'accept');
  const run=(await act(a,B,'start')).data.relay;
  assert.equal(run.role,'scout');assert.equal(run.sequence,null);
  const other=(await act(b,A,'start')).data.relay;assert.equal(other.mission,run.mission);assert.equal(other.role,'engineer');
  assert.equal((await act(b,A,'scan',run.mission)).code,403);
  assert.equal((await act(a,B,'send',run.mission)).code,409);
  const code=(await act(a,B,'scan',run.mission)).data.relay.sequence;assert.match(code,/^[0-3]{3}$/);
  assert.equal((await b.room()).data.relays[0].sequence,null);assert.deepEqual((await c.room()).data.relays,[]);
  await act(a,B,'send',run.mission);assert.equal((await b.room()).data.relays[0].sequence,code);
  assert.equal((await act(a,B,'tune',run.mission,code)).code,403);assert.equal((await act(b,A,'tune',run.mission,'444')).code,422);
  for(let k=0;k<2;k++)assert.equal((await act(b,A,'tune',run.mission,code)).data.relay.phase,'done');
  const ranked=(await c.fetch('/api/crew/room?sort=beacons')).data.board;
  assert.equal(ranked[0].beacons,1);assert.equal(ranked[1].beacons,1);assert.equal(ranked[2].beacons,0);assert.equal(ranked[0].points,0);
  const avatar='3:'+'0145'.repeat(64);assert.equal((await a.fetch('/api/crew/profile',{hero:'captain',focus:'help',visible:true,avatar})).code,200);
  assert.equal((await a.fetch('/api/crew/profile',{hero:'captain',focus:'help',visible:true,avatar:'invalid'})).code,422);
  await a.share();assert.equal((await b.fetch('/api/crew/room?player='+A)).data.card.avatar,avatar);
  const text=(u,other,msg)=>u.fetch('/api/crew/note',{other,phrase:'text',text:msg});
  assert.equal((await text(a,B,'https://example.org')).code,422);
  assert.equal((await text(a,B,'Я на разведке. Ты на приёмнике?')).code,200);
  assert.equal((await text(a,B,'Дублирую.')).code,409);
  const msg=(await b.fetch('/api/crew/room?player='+A)).data.notes[0];assert.equal(msg.body,'Я на разведке. Ты на приёмнике?');
  assert.deepEqual((await c.room()).data.notes,[]);
  assert.equal((await b.fetch('/api/crew/report',{other:A,note:msg.id,reason:'other'})).code,200);assert.deepEqual((await b.room()).data.notes,[]);
  assert.equal((await a.fetch('/api/crew/retract',{other:B,note:msg.id})).code,200);
  const next=(await act(b,A,'start',run.mission)).data.relay;assert.notEqual(next.mission,run.mission);assert.equal(next.role,'scout');
  assert.equal((await act(a,B,'send',run.mission)).code,409);
  await b.pair(A,'mute');assert.equal((await act(a,B,'scan',next.mission)).code,404);
 }finally{db.close();}
});

test('Telegram referral pays both pilots once after two real different campaign orders, with opt-in ranking',async()=>{
  const {db,DB}=await openCrewDB();try{
    const a=player({DB}),b=player({DB}),visitor=player({DB}),already=player({DB});
    await a.join();await already.join();const invite=(await a.room()).data.invite.code;
    assert.match(invite,/^[0-9a-f]{32}$/);
    assert.deepEqual((await visitor.fetch('/api/crew/room?invite='+invite)).data.invite,{valid:true});
    assert.equal((await visitor.fetch('/api/crew/room?invite='+'0'.repeat(32))).data.invite.valid,false);
    assert.equal((await already.fetch('/api/crew/join',{hero:'plane',referral:invite})).data.referralAccepted,false);
    assert.equal((await b.fetch('/api/crew/join',{hero:'plane',referral:invite})).data.referralAccepted,true);
    assert.equal((await a.room()).data.invite.waiting,1);
    await b.turn('dock','Робот, держи мост');await b.turn('dock','Робот, держи мост');
    await b.turn('rift','Дочка, введи код в шлюз',['scan','power']);
    assert.equal((await a.room()).data.me.fame,0);assert.equal((await b.room()).data.me.fame,10);
    await b.turn('rift','Самолётик, найди частоту');await b.turn('rift','Самолётик, найди частоту');
    for(const user of [a,b]){const info=(await user.room()).data;assert.equal(info.invite.qualified,1);assert.equal(info.invite.waiting,0);}
    assert.equal((await a.room()).data.me.fame,25);assert.equal((await b.room()).data.me.fame,45);
    assert.deepEqual((await visitor.room()).data.board,[]);
    await a.share();await b.share();const ranked=(await visitor.fetch('/api/crew/room?sort=fame')).data.board;
    assert.deepEqual(ranked.map(p=>p.fame),[45,25]);assert.equal((await a.fetch('/api/crew/invite-link',{})).code,200);
    assert.equal((await a.room()).data.invite.code,invite);
  }finally{db.close();}
});

test('one beacon invitation binds two consenting devices, survives reload at each phase and settles once',async()=>{
 const {db,DB}=await openCrewDB();
 try{
  const [host,guest,outsider]=[player({DB}),player({DB}),player({DB})];
  const beacon=(user,action,code)=>user.fetch('/api/crew/beacon-link',{action,code});
  const read=async(user,code)=>(await user.fetch('/api/crew/room?beacon='+code)).data.beacon;
  await host.join();assert.equal((await beacon(host,'create')).code,403);
  await host.share();const code=(await beacon(host,'create')).data.code;
  assert.equal((await beacon(host,'create')).data.code,code);
  assert.equal((await read(host,code)).status,'waiting');assert.equal((await read(guest,code)).status,'offer');
  assert.equal((await beacon(host,'accept',code)).code,409);
  assert.equal((await beacon(guest,'accept',code)).code,401);
  assert.equal((await guest.fetch('/api/crew/join',{hero:'son',beacon:code})).data.referralAccepted,true);
  assert.equal((await beacon(guest,'accept',code)).code,403);assert.equal((await guest.room()).data.peers.length,0);
  await guest.share();await beacon(guest,'accept',code);
  const a=(await read(host,code)).relay,b=(await read(guest,code)).relay;
  assert.equal(a.role,'scout');assert.equal(b.role,'engineer');assert.equal(a.mission,b.mission);assert.equal(b.sequence,null);
  assert.equal((await beacon(guest,'accept',code)).data.beacon.relay.mission,b.mission);
  await outsider.join();await outsider.share();assert.equal((await beacon(outsider,'accept',code)).code,409);
  assert.equal((await read(outsider,code)).status,'unavailable');
  const doRelay=(u,r,action,sequence)=>u.fetch('/api/crew/relay',{other:r.other,mission:r.mission,action,sequence});
  const symbols=(await doRelay(host,a,'scan')).data.relay.sequence;assert.equal((await read(guest,code)).relay.sequence,null);
  await doRelay(host,a,'send');assert.equal((await read(guest,code)).relay.sequence,symbols);
  await doRelay(guest,b,'tune',symbols);await doRelay(guest,b,'tune',symbols);
  assert.equal((await read(guest,code)).status,'done');assert.equal((await read(host,code)).status,'done');
  assert.equal((await beacon(guest,'accept',code)).data.beacon.status,'done');
  assert.equal((await host.room()).data.me.beacons,1);
  assert.equal((await host.room()).data.invite.qualified,0);
  await guest.turn('dock','Робот, закрепи мост');await guest.turn('dock','Робот, закрепи мост');
  assert.equal((await host.room()).data.invite.qualified,0);await guest.turn('rift','Самолётик, найди частоту');
  assert.equal((await host.room()).data.invite.qualified,1);
  const next=(await beacon(host,'create')).data.code;assert.notEqual(next,code);
  assert.equal((await beacon(guest,'accept',next)).data.beacon.relay.phase,'scout');
  assert.equal((await read(host,code)).status,'done');
 }finally{db.close();}
});

test('existing pilots can decline; withdrawn, blocked and private beacon links cannot open a channel',async()=>{
 const {db,DB}=await openCrewDB();
 try{
  const host=player({DB}),guest=player({DB});await host.join();await host.share();await guest.join();await guest.share();
  const send=(p,action,code)=>p.fetch('/api/crew/beacon-link',{action,code});
  const link=async()=>(await send(host,'create')).data.code;
  const view=async(code)=>(await guest.fetch('/api/crew/room?beacon='+code)).data.beacon;
  const declined=await link();assert.equal((await send(guest,'decline',declined)).data.beacon.status,'declined');
  assert.equal((await send(guest,'accept',declined)).code,409);
  const cancelled=await link();await send(host,'cancel',cancelled);assert.equal((await send(guest,'accept',cancelled)).code,409);
  assert.equal((await view('bad')).status,'unavailable');
  const muted=await link(),id=(await host.room()).data.me.id;await guest.pair(id,'mute');
  assert.equal((await view(muted)).status,'unavailable');assert.equal((await send(guest,'accept',muted)).code,409);
  await guest.pair(id,'unmute');await host.share(false);await host.share();
  assert.equal((await send(guest,'accept',muted)).code,409);assert.equal((await guest.room()).data.peers.length,0);
 }finally{db.close();}
});

test('rescue uses the same beacon pair, protects the scan result and saves both roles through duplicate actions',async()=>{
 const {db,DB}=await openCrewDB();
 try{
  const host=player({DB}),guest=player({DB}),outsider=player({DB});
  for (const pilot of [host,guest,outsider]) {await pilot.join();await pilot.share();}
  const A=(await host.room()).data.me.id,B=(await guest.room()).data.me.id;
  const book=async(player,action,code)=>player.fetch('/api/crew/beacon-link',{action,code});
  const c=(await book(host,'create')).data.code;
  const read=async(player,other)=>player.fetch('/api/crew/rescue?other='+other);
  const act=(player,other,action,mission,lane)=>player.fetch('/api/crew/rescue',{other,action,mission,lane});
  assert.equal((await act(host,B,'start')).code,409);
  await book(guest,'accept',c);
  const beacon=async(player)=>(await player.fetch('/api/crew/room?beacon='+c)).data.beacon;
  const a=(await beacon(host)).relay,b=(await beacon(guest)).relay;
  const relay=(player,op,run,sequence)=>player.fetch('/api/crew/relay',{other:run.other,action:op,mission:run.mission,sequence});
  const symbols=(await relay(host,'scan',a)).data.relay.sequence;
  await relay(host,'send',a);await relay(guest,'tune',b,symbols);
  assert.equal((await beacon(guest)).rescuePeer,A);
  assert.deepEqual((await host.fetch('/api/crew/rescue')).data.eligible.map(p=>p.id),[B]);
  const started=await Promise.all([act(host,B,'start'),act(guest,A,'start')]);
  const first=started[0].data.rescue;
  assert.equal(started[1].data.rescue.mission,first.mission);
  const [scout,base,scoutPeer,basePeer]=first.role==='drone'?[host,guest,B,A]:[guest,host,A,B];
  const id=first.mission;
  assert.equal((await read(outsider,A)).code,409);
  assert.equal((await act(base,basePeer,'scan',id)).code,403);
  assert.equal((await act(scout,scoutPeer,'cross',id)).code,409);
  const scanned=(await act(scout,scoutPeer,'scan',id)).data.rescue;
  const lane=scanned.lane,bad=lane==='upper'?'lower':'upper';
  assert.equal((await read(base,basePeer)).data.rescue.lane,null);
  assert.equal((await act(scout,scoutPeer,'mark',id,bad)).code,422);
  await act(scout,scoutPeer,'mark',id,lane);
  assert.equal((await read(base,basePeer)).data.rescue.lane,lane);
  assert.equal((await act(base,basePeer,'anchor',id,bad)).code,422);
  assert.equal((await act(base,basePeer,'anchor',id,lane)).data.rescue.phase,'cross');
  assert.equal((await read(scout,scoutPeer)).data.rescue.phase,'cross');
  assert.equal((await act(scout,scoutPeer,'cross',id)).data.rescue.phase,'pull');
  const pulls=await Promise.all([act(base,basePeer,'pull',id),act(base,basePeer,'pull',id)]);
  for (const r of pulls) assert.equal(r.data.rescue.phase,'done');
  const final=(await read(scout,scoutPeer)).data.rescue;
  assert.equal(final.finished,pulls[0].data.rescue.finished);
  assert.equal((await act(scout,scoutPeer,'start')).data.rescue.mission,id);
  assert.equal(db.prepare("SELECT count(*) AS n FROM crew_rescues WHERE phase='done'").get().n,1);
  assert.equal((await host.room()).data.me.beacons,1);
  await guest.share(false);
  assert.deepEqual((await host.fetch('/api/crew/rescue')).data.eligible,[]);
  assert.equal((await read(host,B)).code,409);
 }finally{db.close();}
});
