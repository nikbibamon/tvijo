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
