import {heroes,moves,tiers} from '../web/catalog.js';
import {planTurn,resolveLevel} from '../web/strategy.js';
import {crewAPI,recordCrewOrder} from './social.js';
const eventNames=['open_map','mic_click','command_sent','task_done','dependency_done','crosscheck','voice_command','field_start','capsule','workshop_open','world_created','out_of_credits','wallet_open','buy_click','demo_refill','shift_hq','shift_enter','shift_bridge','shift_capsule','beacon_share_open','beacon_invite_open','beacon_pair_accept'];
const replyJSON=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
const member=(obj,k)=>typeof k==='string'&&Object.hasOwn(obj,k);
const safeIds=(a,max)=>Array.isArray(a)&&a.length<=max&&a.every(k=>member(moves,k));
export function validateOrder(d){
 if(!d||typeof d!=='object'||Object.keys(d).some(k=>!['level','done','tier','parsed','hero','feedback'].includes(k))||typeof d.level!=='string'||d.level.length>96)return null;
 const level=resolveLevel(d.level),p=d.parsed;if(!level||!member(tiers,d.tier)||!member(heroes,d.hero)||!p||typeof p!=='object'||Object.keys(p).some(k=>!['orders','who','kind','criteria','chain'].includes(k))||!safeIds(d.done,7)||!safeIds(p.orders,7))return null;
 if(![null,...Object.keys(heroes)].includes(p.who)||!['order','hint','stop','social','clarify'].includes(p.kind)||typeof p.chain!=='boolean'||!Array.isArray(p.criteria)||p.criteria.length!==3||p.criteria.some(b=>typeof b!=='boolean'))return null;
 if(d.done.some(id=>!level.tasks.some(([key,deps])=>key===id&&deps.every(k=>d.done.includes(k)))))return null;
 const f=d.feedback;if(f!=null&&(!Number.isInteger(f.blocks)||f.blocks<0||f.blocks>5||(f.focus!==null&&!member(moves,f.focus))||Object.keys(f).some(k=>!['blocks','focus'].includes(k))))return null;
 return {hero:d.hero,level,done:d.done,tier:d.tier,parsed:p,feedback:f||null};
}
const sessionFrom=req=>req.headers.get('Cookie')?.match(/(?:^|;\s*)crew_pilot=([0-9a-f-]{36})(?:;|$)/)?.[1];
export async function handleAPI(req,env){
 const p=new URL(req.url).pathname,method=req.method;
 if(p==='/api/herdr/health'&&method==='GET')return replyJSON({engine:'crew-demo-1',model:'local-scene-rules',billing:'demo',analytics:!!env.DB});
 if(p==='/api/herdr/parent-report/me'&&method==='GET'){const sid=sessionFrom(req);if(!sid)return replyJSON({first_events:[]});if(!env.DB)return replyJSON({error:'analytics_unavailable'},503);
  const q=await env.DB.prepare('SELECT event,seconds FROM crew_pilot_first WHERE session_id=? ORDER BY seconds,event').bind(sid).all();return replyJSON({first_events:q.results});}
 const isCrew=p.startsWith('/api/crew/');
 if(isCrew&&method==='GET')return crewAPI(req,env,p.slice(10),null);
 if(method!=='POST'||!isCrew&&!['/api/herdr/turn','/api/herdr/event'].includes(p))return replyJSON({error:'route'},404);
 const origin=req.headers.get('Origin');if((origin&&origin!==new URL(req.url).origin)||req.headers.get('Sec-Fetch-Site')==='cross-site')return replyJSON({error:'origin'},403);
 if(!req.headers.get('Content-Type')?.includes('application/json'))return replyJSON({error:'json_required'},415);
 if(Number(req.headers.get('Content-Length')||0)>4096)return replyJSON({error:'too_large'},413);
 const reader=req.body?.getReader();if(!reader)return replyJSON({error:'json'},400);
 const chunks=[];let length=0;while(true){const part=await reader.read();if(part.done)break;length+=part.value.byteLength;if(length>4096){await reader.cancel();return replyJSON({error:'too_large'},413);}chunks.push(part.value);}
 const data=new Uint8Array(length);let offset=0;for(const part of chunks){data.set(part,offset);offset+=part.byteLength;}const source=new TextDecoder().decode(data);let d;try{d=JSON.parse(source);}catch{return replyJSON({error:'json'},400);}
 if(isCrew)return crewAPI(req,env,p.slice(10),d);
 if(p.endsWith('/turn')){
  const data=validateOrder(d);if(!data)return replyJSON({error:'scene'},422);
  const reply=planTurn(data);
  try{await recordCrewOrder(req,env.DB,data,reply);}catch{/* Classroom play also works during a leaderboard outage. */}
  return replyJSON({engine:'crew-demo-1',source:'rules',tokens_spent:0,real_charge:0,reply});
 }
 if(!d||!eventNames.includes(d.event)||!Number.isInteger(d.seconds)||d.seconds<0||d.seconds>86400||Object.keys(d).some(k=>!['event','seconds'].includes(k)))return replyJSON({error:'event'},422);
 if(!env.DB)return replyJSON({error:'analytics_unavailable'},503);const sid=sessionFrom(req)||crypto.randomUUID();const day=new Date().toISOString().slice(0,10);
 await env.DB.prepare('INSERT OR IGNORE INTO crew_pilot_first(session_id,event,seconds,day) VALUES (?,?,?,?)').bind(sid,d.event,d.seconds,day).run();
 return replyJSON({recorded:true},200,{'Set-Cookie':'crew_pilot='+sid+'; Path=/api/herdr; HttpOnly; Secure; SameSite=Lax'});
}
