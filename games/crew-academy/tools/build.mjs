import {readdir,readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const web=path.join(root,'web'), out=path.join(root,'dist/server');
const mime={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',webp:'image/webp',png:'image/png',woff:'font/woff',mp3:'audio/mpeg',txt:'text/plain; charset=utf-8'};
const assets={};
async function walk(dir){for(const child of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,child.name);if(child.isDirectory())await walk(file);else{const rel='/'+path.relative(web,file).split(path.sep).join('/'),ext=child.name.split('.').pop();if(!mime[ext])continue;assets[rel]=[mime[ext],(await readFile(file)).toString('base64')];}}}
await walk(web);
// Both public addresses boot the same game and share the player's progress.
assets['/first-shift.html']=assets['/index.html'];
const parts=[];for(const f of ['web/catalog.js','web/worlds.js','web/strategy.js','web/crewLabels.js','web/rescue/mission.js','server/social.js','server/pilot.js']){
 const src=await readFile(path.join(root,f),'utf8');parts.push(src.replace(/^import .*?;\s*$/gm,'').replace(/^export (?=(const|let|function|async function)\b)/gm,''));
}
const runtime=await readFile(path.join(root,'server/worker-entry.txt'),'utf8');
await mkdir(out,{recursive:true});await mkdir(path.join(root,'dist/.openai'),{recursive:true});
await writeFile(path.join(out,'index.js'),'const bundledAssets='+JSON.stringify(assets)+';\n'+parts.join('\n')+'\n'+runtime);
await copyFile(path.join(root,'.openai/hosting.json'),path.join(root,'dist/.openai/hosting.json'));
console.log('Built game with '+Object.keys(assets).length+' assets.');
