import {heroes,levelById} from '../web/catalog.js';
import {planTurn} from '../web/strategy.js';
import {decodeWorld,encodeWorld} from '../web/worlds.js';
import {interests,radioPhrases,validPixelAvatar,randomTransmission,projectRelay} from '../web/crewLabels.js';

const crewDay=86400;
const crewClock=()=>Math.floor(Date.now()/1000);
const crewRandom=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const crewCookie=req=>req.headers.get('Cookie')?.match(/(?:^|;\s*)tvijo_crew=([0-9a-f]{64})(?:;|$)/)?.[1];
const crewSetCookie=(t,age=30*crewDay)=>({'Set-Cookie':'tvijo_crew='+t+'; Path=/api; Secure; HttpOnly; SameSite=Lax; Max-Age='+age});
const crewHash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),b=>b.toString(16).padStart(2,'0')).join('');
const crewQuery=(db,sql,...args)=>db.prepare(sql).bind(...args);
const crewAll=async(db,sql,...args)=>(await crewQuery(db,sql,...args).all()).results;
const crewOne=async(db,sql,...args)=>(await crewAll(db,sql,...args))[0];
const crewRun=(db,sql,...args)=>crewQuery(db,sql,...args).run();
const crewValid=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k));
const crewID=s=>typeof s==='string'&&/^[0-9a-f]{32}$/.test(s);
const crewFameSQL=`10*(SELECT COUNT(*) FROM crew_marks WHERE player=p.id)
  +30*(SELECT COUNT(*) FROM crew_beacons WHERE low=p.id OR high=p.id)
  +25*(SELECT COUNT(*) FROM crew_referrals WHERE (host=p.id OR guest=p.id) AND qualified IS NOT NULL)`;
const crewProjection=`p.id,p.callsign,p.hero,p.focus,p.avatar,${crewFameSQL} AS fame,
  (SELECT COUNT(*) FROM crew_beacons b WHERE b.low=p.id OR b.high=p.id) AS beacons,(SELECT COUNT(*) FROM crew_marks m WHERE m.player=p.id) AS points,
  CASE WHEN EXISTS(SELECT 1 FROM crew_marks WHERE player=p.id AND action='signal') THEN 'beacon'
       WHEN EXISTS(SELECT 1 FROM crew_marks WHERE player=p.id AND action='compare') THEN 'check'
       WHEN EXISTS(SELECT 1 FROM crew_marks WHERE player=p.id AND action='gate') THEN 'chain'
       WHEN EXISTS(SELECT 1 FROM crew_marks WHERE player=p.id AND action='bridge') THEN 'bridge'
       ELSE 'start' END AS badge`;
const crewNoMute='NOT EXISTS (SELECT 1 FROM crew_muted m WHERE (m.owner=? AND m.other=p.id) OR (m.owner=p.id AND m.other=?))';
const crewReply=(d,status=200,headers={})=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function crewAuth(req,db){
  const raw=crewCookie(req);if(!raw)return null;
  const digest=await crewHash(raw);
  const me=await crewOne(db,'SELECT '+crewProjection+',p.visible,EXISTS(SELECT 1 FROM crew_identities i WHERE i.player=p.id) AS linked FROM crew_sessions s JOIN crew_players p ON p.id=s.player WHERE s.digest=? AND s.until>?',digest,crewClock());
  return me?{me,digest}:null;
}
function callsign(id){
 const first=['Лунный','Янтарный','Звёздный','Полярный','Солнечный','Серебряный','Ледяной','Медный'];
 const last=['Лис','Штурман','Стриж','Сокол','Кит','Орион','Компас','Альбатрос'];
 return first[parseInt(id[0],16)%first.length]+' '+last[parseInt(id[1],16)%last.length]+' · '+id.slice(-6).toUpperCase();
}
export async function recordCrewOrder(req,db,packet,reply){
 if(!db||!crewCookie(req)||!Object.hasOwn(levelById,packet.level.id)||!reply.changes.length)return;
 const auth=await crewAuth(req,db);if(!auth)return;
 const stage=packet.level.id,prior=await crewAll(db,'SELECT action FROM crew_marks WHERE player=? AND stage=?',auth.me.id,stage);
 const moves=planTurn({...packet,done:prior.map(x=>x.action),tier:'standard'}).changes.filter(a=>reply.changes.includes(a));
 if(moves.length){
   const id=auth.me.id,updates=moves.map(m=>crewQuery(db,'INSERT OR IGNORE INTO crew_marks(player,stage,action) VALUES(?,?,?)',id,stage,m));
   updates.push(crewQuery(db,'UPDATE crew_referrals SET qualified=? WHERE guest=? AND qualified IS NULL AND (SELECT COUNT(*) FROM crew_marks WHERE player=?)>=2',crewClock(),id,id));
   await db.batch(updates);
 }
}
async function crewRoster(db,auth,requested,order){
 const id=auth?.me.id||'';
 const sort=order==='fame'?'fame DESC,points DESC,beacons DESC':order==='beacons'?'beacons DESC,points DESC':'points DESC,beacons DESC';
 const board=await crewAll(db,'SELECT '+crewProjection+' FROM crew_players p WHERE p.visible=1 AND '+crewNoMute+' ORDER BY '+sort+',p.callsign,p.id LIMIT 50',id,id);
 const card=crewID(requested)?await crewOne(db,'SELECT '+crewProjection+' FROM crew_players p WHERE p.id=? AND p.visible=1 AND '+crewNoMute,requested,id,id):null;
 if(!id)return {board,card:card||null,peers:[],notes:[],me:null,blocked:[],relays:[]};
 const peers=await crewAll(db,'SELECT '+crewProjection+',a.sender,a.status FROM crew_pairs a JOIN crew_players p ON p.id=CASE WHEN a.low=? THEN a.high ELSE a.low END WHERE (a.low=? OR a.high=?) AND p.visible=1 AND a.status IN (\'waiting\',\'accepted\') AND '+crewNoMute+' ORDER BY a.touched DESC LIMIT 80',id,id,id,id,id);
 const notes=await crewAll(db,'SELECT n.id,n.sender,n.recipient,n.phrase,n.world,n.body FROM crew_notes n JOIN crew_pairs a ON a.low=MIN(n.sender,n.recipient) AND a.high=MAX(n.sender,n.recipient) JOIN crew_players p ON p.id=CASE WHEN n.sender=? THEN n.recipient ELSE n.sender END WHERE (n.sender=? OR n.recipient=?) AND a.status=\'accepted\' AND p.visible=1 AND '+crewNoMute+' AND NOT EXISTS(SELECT 1 FROM crew_reports flags WHERE flags.note=n.id AND flags.reporter=?) AND (? IS NULL OR p.id=?) ORDER BY n.id DESC LIMIT 40',id,id,id,id,id,id,crewID(requested)?requested:null,crewID(requested)?requested:null);
 const blocked=await crewAll(db,'SELECT p.id,p.callsign FROM crew_muted m JOIN crew_players p ON p.id=m.other WHERE m.owner=? AND p.visible=1 ORDER BY p.callsign LIMIT 80',id);
 const relays=await crewAll(db,"SELECT r.* FROM crew_relays r JOIN crew_pairs a ON a.low=r.low AND a.high=r.high AND a.status='accepted' WHERE r.low=? OR r.high=?",id,id);
 return {board,card:card||null,peers,notes,me:auth.me,blocked,relays:relays.map(r=>({...projectRelay(r,id),other:r.low===id?r.high:r.low}))};
}
async function invitationInfo(db,me,offer){
 const valid=crewID(offer)?!!await crewOne(db,'SELECT 1 FROM crew_invite_codes WHERE code=?',offer):false;
 if(!me)return {valid};
 const owned=await crewOne(db,'SELECT code FROM crew_invite_codes WHERE owner=?',me.id);
 const tally=await crewOne(db,`SELECT
   (SELECT COUNT(*) FROM crew_referrals WHERE host=? AND qualified IS NULL) AS waiting,
   (SELECT COUNT(*) FROM crew_referrals WHERE (host=? OR guest=?) AND qualified IS NOT NULL) AS qualified,
   (SELECT COUNT(*) FROM crew_referrals WHERE guest=? AND qualified IS NULL) AS incoming`,me.id,me.id,me.id,me.id);
 return {valid,code:owned?.code||null,...tally};
}
const crewLogin='https://tvijo.com/ru/login';
const crewIssuer='https://tvijo.com';
const crewAudience='https://tvijo-crew-academy.be9ava.chatgpt.site';
const from64=s=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
async function verifyCrewTicket(token,jwk){
 if(typeof token!=='string'||token.length>2200||!/^[-\w]+\.[-\w]+\.[-\w]+$/.test(token))return null;
 try{
  const [header,body,sig]=token.split('.'),decode=s=>JSON.parse(new TextDecoder().decode(from64(s))),h=decode(header);
  if(h.alg!=='RS256'||h.typ!=='JWT')return null;
  const key=await crypto.subtle.importKey('jwk',JSON.parse(jwk),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  if(key.algorithm.modulusLength<2048||!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,from64(sig),new TextEncoder().encode(header+'.'+body)))return null;
  const p=decode(body),now=crewClock();
  return p.iss===crewIssuer&&p.aud===crewAudience&&typeof p.sub==='string'&&/^[a-f0-9]{64}$/.test(p.sub)&&typeof p.nonce==='string'&&/^[a-f0-9]{64}$/.test(p.nonce)&&Number.isInteger(p.exp)&&Number.isInteger(p.iat)&&p.exp>now&&p.iat<=now+5&&p.exp>p.iat&&p.exp-p.iat<=90?p:null;
 }catch{return null;}
}
export async function crewAPI(req,env,path,d){
 const db=env.DB;if(!db)return crewReply({error:'unavailable'},503);
 const auth=await crewAuth(req,db),me=auth?.me,now=crewClock();
 if(req.method==='GET'&&path==='room'){
   const q=new URL(req.url).searchParams;
   return crewReply({...await crewRoster(db,auth,q.get('player'),q.get('sort')),invite:await invitationInfo(db,me,q.get('invite')),sso:!!env.CREW_TVIJO_VERIFY_KEY});
 }
 if(req.method!=='POST')return crewReply({error:'route'},404);
 if(path==='join'){
  if(!crewValid(d,['hero','referral'])||!Object.hasOwn(heroes,d.hero)||d.referral!==undefined&&!crewID(d.referral))return crewReply({error:'profile'},422);
  if(me)return crewReply({joined:true,referralAccepted:false});
  const host=d.referral?await crewOne(db,'SELECT owner FROM crew_invite_codes WHERE code=?',d.referral):null;
  if(d.referral&&!host)return crewReply({error:'invite_missing'},422);
  const id=crypto.randomUUID().replaceAll('-',''),raw=crewRandom();
  const entries=[crewQuery(db,'INSERT INTO crew_players(id,callsign,hero) VALUES(?,?,?)',id,callsign(id),d.hero),
    crewQuery(db,'INSERT INTO crew_sessions(digest,player,until) VALUES(?,?,?)',await crewHash(raw),id,now+30*crewDay),
    crewQuery(db,'INSERT INTO crew_invite_codes(owner,code) VALUES(?,?)',id,crypto.randomUUID().replaceAll('-',''))];
  if(host)entries.push(crewQuery(db,'INSERT INTO crew_referrals(guest,host,joined) VALUES(?,?,?)',id,host.owner,now));
  await db.batch(entries);
  return crewReply({joined:true,referralAccepted:!!host},201,crewSetCookie(raw));
 }
 if(!me)return crewReply({error:'session'},401);
 if(path==='invite-link'){
   if(!crewValid(d,[]))return crewReply({error:'action'},422);
   await crewRun(db,'INSERT OR IGNORE INTO crew_invite_codes(owner,code) VALUES(?,?)',me.id,crypto.randomUUID().replaceAll('-',''));
   return crewReply({ok:true});
 }
 if(path==='logout'){
  await db.batch([crewQuery(db,'DELETE FROM crew_challenges WHERE session=?',auth.digest),crewQuery(db,'DELETE FROM crew_sessions WHERE digest=?',auth.digest)]);
  return crewReply({ok:true},200,crewSetCookie('',0));
 }
 if(path==='auth/start'){
  if(!env.CREW_TVIJO_VERIFY_KEY)return crewReply({available:false,url:crewLogin});
  const nonce=crewRandom();await crewRun(db,'INSERT INTO crew_challenges(session,nonce,until) VALUES(?,?,?) ON CONFLICT(session) DO UPDATE SET nonce=excluded.nonce,until=excluded.until',auth.digest,nonce,now+600);
  return crewReply({available:true,url:crewLogin+'?redirect='+encodeURIComponent('/ru/game/academy-connect?state='+nonce)});
 }
 if(path==='auth/finish'){
  if(!env.CREW_TVIJO_VERIFY_KEY)return crewReply({error:'sso_unavailable'},503);
  const proof=await verifyCrewTicket(d?.ticket,env.CREW_TVIJO_VERIFY_KEY);if(!proof)return crewReply({error:'proof'},403);
  const claimed=await crewOne(db,'DELETE FROM crew_challenges WHERE session=? AND nonce=? AND until>? RETURNING nonce',auth.digest,proof.nonce,now);
  if(!claimed)return crewReply({error:'challenge'},403);
  await crewRun(db,'INSERT OR IGNORE INTO crew_identities(subject,player) VALUES(?,?)',proof.sub,me.id);
  const account=await crewOne(db,'SELECT player FROM crew_identities WHERE subject=?',proof.sub);
  if(!account||me.linked&&account.player!==me.id)return crewReply({error:'account_mismatch'},409);
  const token=crewRandom();await db.batch([crewQuery(db,'INSERT INTO crew_sessions(digest,player,until) VALUES(?,?,?)',await crewHash(token),account.player,now+30*crewDay),crewQuery(db,'DELETE FROM crew_sessions WHERE digest=?',auth.digest)]);
  return crewReply({linked:true},200,crewSetCookie(token));
 }
 if(path==='profile'){
  if(!crewValid(d,['visible','hero','focus','avatar'])||(d.avatar!==undefined&&!validPixelAvatar(d.avatar))||typeof d.visible!=='boolean'||!Object.hasOwn(heroes,d.hero)||!Object.hasOwn(interests,d.focus))return crewReply({error:'profile'},422);
  const actions=[crewQuery(db,'UPDATE crew_players SET visible=?,hero=?,focus=?,avatar=COALESCE(?,avatar) WHERE id=?',Number(d.visible),d.hero,d.focus,d.avatar??null,me.id)];
  if(!d.visible){actions.push(crewQuery(db,'DELETE FROM crew_relays WHERE low=? OR high=?',me.id,me.id),crewQuery(db,'DELETE FROM crew_pairs WHERE low=? OR high=?',me.id,me.id),crewQuery(db,'DELETE FROM crew_notes WHERE sender=? OR recipient=?',me.id,me.id));}
  await db.batch(actions);return crewReply({ok:true});
 }
 if(!['pair','note','relay','report','retract'].includes(path))return crewReply({error:'route'},404);
 if(!d||!crewID(d.other)||d.other===me.id||!me.visible)return crewReply({error:'visibility'},403);
 const id=me.id,other=d.other,[lo,hi]=[id,other].sort();
 if(path==='pair'&&d.action==='unmute'){await crewRun(db,'DELETE FROM crew_muted WHERE owner=? AND other=?',id,other);return crewReply({ok:true});}
 if(!await crewOne(db,'SELECT id FROM crew_players p WHERE p.id=? AND p.visible=1 AND '+crewNoMute,other,id,id))return crewReply({error:'unavailable_player'},404);
 if(path==='pair'){
  if(!crewValid(d,['other','action']))return crewReply({error:'action'},422);
  if(d.action==='mute'){
   await db.batch([crewQuery(db,'DELETE FROM crew_relays WHERE low=? AND high=?',lo,hi),crewQuery(db,'INSERT OR IGNORE INTO crew_muted(owner,other) VALUES(?,?)',id,other),crewQuery(db,'DELETE FROM crew_pairs WHERE low=? AND high=?',lo,hi),crewQuery(db,'DELETE FROM crew_notes WHERE (sender=? AND recipient=?) OR (sender=? AND recipient=?)',id,other,other,id)]);return crewReply({ok:true});
  }
  if(d.action==='invite'){
   const accepted=await crewOne(db,`INSERT INTO crew_pairs(low,high,sender,status,touched) SELECT ?,?,?,'waiting',? WHERE (SELECT COUNT(*) FROM crew_pairs WHERE sender=? AND touched>?)<12 AND EXISTS (SELECT 1 FROM crew_players p JOIN crew_players s ON s.id=? AND s.visible=1 WHERE p.id=? AND p.visible=1 AND ${crewNoMute}) ON CONFLICT(low,high) DO NOTHING RETURNING status`,lo,hi,id,now,id,now-crewDay,id,other,id,id);
   return accepted?crewReply({ok:true}):crewReply({error:'already_or_limit'},409);
  }
  if(!['accept','decline'].includes(d.action))return crewReply({error:'action'},422);
  const changed=await crewOne(db,"UPDATE crew_pairs SET status=?,touched=? WHERE low=? AND high=? AND sender<>? AND status='waiting' RETURNING status",d.action==='accept'?'accepted':'declined',now,lo,hi,id);
  return changed?crewReply({ok:true}):crewReply({error:'invitation'},409);
 }
 const linked=await crewOne(db,"SELECT status FROM crew_pairs WHERE low=? AND high=? AND status='accepted'",lo,hi);
 if(!linked)return crewReply({error:'channel_or_cooldown'},409);
 if(path==='relay')return relayAction(db,id,lo,hi,d,now);
 if(path==='report'||path==='retract'){
  if(!Number.isSafeInteger(d.note)||d.note<1)return crewReply({error:'note'},422);
  if(path==='retract'){const result=await crewOne(db,'DELETE FROM crew_notes WHERE id=? AND sender=? AND recipient=? RETURNING id',d.note,id,other);return crewReply({ok:!!result},result?200:404);}
  if(!['contacts','hurt','other'].includes(d.reason))return crewReply({error:'report'},422);
  const flagged=await crewOne(db,"INSERT OR IGNORE INTO crew_reports(note,reporter,sender,reason,excerpt,created) SELECT id,recipient,sender,?,COALESCE(body,phrase),? FROM crew_notes WHERE id=? AND recipient=? AND sender=? RETURNING note",d.reason,now,d.note,id,other);
  return crewReply({ok:!!flagged},flagged?200:409);
 }
 const isText=d.phrase==='text';
 if(!crewValid(d,['other','phrase','world','text'])||!isText&&!Object.hasOwn(radioPhrases,d.phrase))return crewReply({error:'phrase'},422);
 const spec=d.phrase==='world'?decodeWorld(d.world):null;
 if(d.phrase==='world'?!spec:d.world!=null)return crewReply({error:'world'},422);
 const clean=isText&&typeof d.text==='string'?d.text.normalize('NFKC').replace(/\s+/gu,' ').trim():null;
 if(isText&&(!clean||Array.from(clean).length>180||/[\p{Cc}\p{Cf}]/u.test(clean))||!isText&&d.text!=null)return crewReply({error:'text_length'},422);
 if(isText&&/(?:https?:|www\.|t\.me\/|[\w.+%-]+@[\w.-]+\.[a-z]{2,}|(?:\d[ ().+-]*){8,})/iu.test(clean))return crewReply({error:'contacts'},422);
 const sent=await crewOne(db,`INSERT INTO crew_notes(sender,recipient,phrase,world,body,sent) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM crew_pairs a JOIN crew_players p ON p.id=? AND p.visible=1 JOIN crew_players s ON s.id=? AND s.visible=1 WHERE a.low=? AND a.high=? AND a.status='accepted') AND NOT EXISTS(SELECT 1 FROM crew_notes WHERE sender=? AND sent>?) RETURNING id`,id,other,d.phrase,spec?encodeWorld(spec):null,clean,now,id,other,lo,hi,id,now-3);
 if(sent)await crewRun(db,'DELETE FROM crew_notes WHERE sender=? AND recipient=? AND id NOT IN (SELECT id FROM crew_notes WHERE sender=? AND recipient=? ORDER BY id DESC LIMIT 30)',id,other,id,other);
 return sent?crewReply({ok:true}):crewReply({error:'channel_or_cooldown'},409);
}

async function relayAction(db,id,lo,hi,d,now){
 if(!crewValid(d,['other','action','mission','sequence']))return crewReply({error:'relay'},422);
 const accepted="EXISTS(SELECT 1 FROM crew_pairs a WHERE a.low=? AND a.high=? AND a.status='accepted')";
 const read=()=>crewOne(db,'SELECT * FROM crew_relays WHERE low=? AND high=?',lo,hi);
 if(d.action==='start'){
  const mission=crypto.randomUUID();
  await crewRun(db,`INSERT INTO crew_relays(low,high,mission,scout,sequence,phase) SELECT ?,?,?,?,?,'scout' WHERE ${accepted}
    ON CONFLICT(low,high) DO UPDATE SET mission=excluded.mission,scout=excluded.scout,sequence=excluded.sequence,phase='scout'
    WHERE crew_relays.phase='done' AND crew_relays.mission=?`,lo,hi,mission,id,randomTransmission(),lo,hi,d.mission||'');
  const current=await read();return current?crewReply({relay:projectRelay(current,id)}):crewReply({error:'relay_missing'},409);
 }
 const row=await read();if(!row||row.mission!==d.mission)return crewReply({error:'relay_missing'},409);
 const scout=row.scout===id;
 if(d.action==='scan'||d.action==='send'){
  if(!scout)return crewReply({error:'relay_role'},403);
  const before=d.action==='scan'?'scout':'found',after=d.action==='scan'?'found':'sent';
  if(row.phase!==before&&row.phase!==after)return crewReply({error:'relay_phase'},409);
  await crewRun(db,"UPDATE crew_relays SET phase=? WHERE low=? AND high=? AND mission=? AND scout=? AND phase=? AND "+accepted,after,lo,hi,d.mission,id,before,lo,hi);
 }else if(d.action==='tune'){
  if(scout)return crewReply({error:'relay_role'},403);
  if(row.phase!=='sent'&&row.phase!=='done')return crewReply({error:'relay_phase'},409);
  if(typeof d.sequence!=='string'||!/^[0-3]{3}$/.test(d.sequence)||row.sequence!==d.sequence)return crewReply({error:'wrong_tone'},422);
  await db.batch([
   crewQuery(db,"INSERT OR IGNORE INTO crew_beacons(low,high,finished) SELECT low,high,? FROM crew_relays WHERE mission=? AND phase='sent' AND sequence=? AND scout<>? AND "+accepted,now,d.mission,d.sequence,id,lo,hi),
   crewQuery(db,"UPDATE crew_relays SET phase='done' WHERE mission=? AND phase='sent' AND sequence=? AND scout<>? AND "+accepted,d.mission,d.sequence,id,lo,hi)
  ]);
 }else return crewReply({error:'relay'},422);
 const current=await read();return current&&current.mission===d.mission?crewReply({relay:projectRelay(current,id)}):crewReply({error:'relay_missing'},409);
}
