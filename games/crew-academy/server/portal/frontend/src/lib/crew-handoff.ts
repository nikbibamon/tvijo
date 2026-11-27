import {createHmac,createPrivateKey,sign} from 'node:crypto';

const issuer='https://tvijo.com';
const audience='https://tvijo-crew-academy.be9ava.chatgpt.site';

type CrewConfig={signingPem?:string,subjectKey?:string};
type Fetcher=(url:string,options:RequestInit)=>Promise<Response>;
const response=(body:object,status:number)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
const encode=(value:object)=>Buffer.from(JSON.stringify(value)).toString('base64url');

/** First-party issuer on tvijo.com. The portal's bearer never goes to the game. */
export async function authorizeCrew(req:Request,config:CrewConfig,fetcher:Fetcher=fetch):Promise<Response>{
  if(req.headers.get('origin')!==issuer||req.headers.get('sec-fetch-site')==='cross-site')return response({error:'origin'},403);
  const rawKey=config.subjectKey?Buffer.from(config.subjectKey,'base64'):null;
  if(!config.signingPem||!rawKey||rawKey.length<32)return response({error:'not_configured'},503);
  const bearer=req.headers.get('authorization')||'';
  if(!/^Bearer [a-zA-Z0-9._~-]{12,8192}$/.test(bearer))return response({error:'login'},401);
  const nonce=req.headers.get('x-crew-state')||'';
  if(!/^[a-f0-9]{64}$/.test(nonce))return response({error:'state'},422);
  try{
    const res=await fetcher(issuer+'/api/v1/auth/me/',{headers:{Authorization:bearer,Accept:'application/json'},redirect:'error',cache:'no-store',signal:AbortSignal.timeout(2500)});
    if(!res.ok)return response({error:res.status===401||res.status===403?'login':'portal'},res.status===401||res.status===403?401:502);
    const body=await res.json(),valid=typeof body.id==='string'||Number.isSafeInteger(body.id);
    if(!valid||!/^[a-zA-Z0-9_-]{1,128}$/.test(String(body.id)))return response({error:'identity'},502);
    const sub=createHmac('sha256',rawKey).update('crew-academy/v1/'+body.id).digest('hex');
    const now=Math.floor(Date.now()/1000);
    const data=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:issuer,aud:audience,sub,nonce,iat:now,exp:now+90});
    const key=createPrivateKey(config.signingPem);
    if(key.asymmetricKeyType!=='rsa'||(key.asymmetricKeyDetails?.modulusLength||0)<2048)return response({error:'signing'},503);
    const ticket=data+'.'+sign('RSA-SHA256',Buffer.from(data),key).toString('base64url');
    return response({returnUrl:audience+'/#tvijo='+ticket},200);
  }catch{return response({error:'unavailable'},503);}
}
