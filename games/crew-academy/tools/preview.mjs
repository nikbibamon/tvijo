import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {openCrewDB} from './preview-db.mjs';
import {fileURLToPath} from 'node:url';
import {handleAPI} from '../server/pilot.js';
const dir=new URL('../web/',import.meta.url),{DB}=await openCrewDB();
const opt=name=>{const idx=process.argv.indexOf(name);return idx<0?null:process.argv[idx+1];};
const port=Number(opt('--port')||process.env.PORT||5173),host=opt('--host')||process.env.HOST||'0.0.0.0';
const mime={html:'text/html',css:'text/css',js:'text/javascript',webp:'image/webp',png:'image/png',woff:'font/woff'};
http.createServer(async(req,res)=>{try{
 const forwarded=req.headers['x-forwarded-proto']||'http';
 const u=new URL(req.url,process.env.TVIJO_PUBLIC_ORIGIN||forwarded+'://'+(req.headers['x-forwarded-host']||req.headers.host));
 if(u.pathname.startsWith('/api/')){const chunks=[];for await(const b of req){chunks.push(b);if(chunks.reduce((t,c)=>t+c.length,0)>4096){res.writeHead(413);res.end();return;}}
  const request=new Request(u,{method:req.method,headers:req.headers,body:req.method==='POST'?Buffer.concat(chunks):undefined});
  const r=await handleAPI(request,{DB});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));return;}
 const p=['/','/first-shift.html'].includes(u.pathname)?'index.html':u.pathname.slice(1);const f=new URL(p,dir);if(!f.href.startsWith(dir.href))throw Error('path');const data=await readFile(fileURLToPath(f));res.setHeader('Content-Type',mime[p.split('.').pop()]||'application/octet-stream');res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}}).listen(port,host,()=>console.log('Ready at http://'+host+':'+port));
