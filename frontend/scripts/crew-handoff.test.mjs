import assert from 'node:assert/strict';
import {generateKeyPairSync,randomBytes,verify} from 'node:crypto';
import {test} from 'node:test';
import {authorizeCrew} from '../src/lib/crew-handoff.ts';

const origin='https://tvijo.com';
const audience='https://tvijo-crew-academy.be9ava.chatgpt.site';
const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const cfg={signingPem:privateKey.export({format:'pem',type:'pkcs8'}).toString(),subjectKey:randomBytes(32).toString('base64')};
const nonce='f'.repeat(64);
const request=(headers={})=>new Request(origin+'/api/game/academy-proof',{method:'POST',headers:{Origin:origin,Authorization:'Bearer test_value_for_portal','X-Crew-State':nonce,...headers}});

test('a first-party Tvijo session yields a ninety-second pseudonymous Academy claim',async()=>{
  const result=await authorizeCrew(request(),cfg,async(url,options)=>{
    assert.equal(url,origin+'/api/v1/auth/me/');assert.equal(options.redirect,'error');
    assert.equal(options.headers.Authorization,'Bearer test_value_for_portal');
    return Response.json({id:42,full_name:'Private',email:'private@example.test'});
  });
  assert.equal(result.status,200);assert.equal(result.headers.get('Cache-Control'),'no-store');
  const url=new URL((await result.json()).returnUrl);assert.equal(url.origin,audience);assert.equal(url.search,'');
  const [head,payload,sig]=url.hash.slice(7).split('.');
  assert.ok(verify('RSA-SHA256',Buffer.from(head+'.'+payload),publicKey,Buffer.from(sig,'base64url')));
  const p=JSON.parse(Buffer.from(payload,'base64url'));assert.deepEqual(Object.keys(p).sort(),['aud','exp','iat','iss','nonce','sub']);
  assert.equal(p.aud,audience);assert.equal(p.iss,origin);assert.equal(p.nonce,nonce);assert.equal(p.exp-p.iat,90);assert.match(p.sub,/^[a-f0-9]{64}$/);
});
test('absent keys, foreign origin, invalid nonce and expired portal sessions stay unlinked',async()=>{
  const unreachable=()=>{throw Error('Unexpected connection');};
  assert.equal((await authorizeCrew(request(),{},unreachable)).status,503);
  assert.equal((await authorizeCrew(request({Origin:audience}),cfg,unreachable)).status,403);
  assert.equal((await authorizeCrew(request({'X-Crew-State':'bad'}),cfg,unreachable)).status,422);
  assert.equal((await authorizeCrew(request(),cfg,async()=>new Response('',{status:401}))).status,401);
  assert.equal((await authorizeCrew(request(),cfg,async()=>Response.json({id:'private@example.test'}))).status,502);
});
