import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const [target,folder]=process.argv.slice(2);
if (!['crazygames','itch','android'].includes(target)) {
  throw Error('Use: node tools/build-store.mjs <crazygames|itch|android> [output-directory]');
}
const output=folder?resolve(folder):join(root,'dist','store',target);
const source=join(root,'web');
let html=await readFile(join(source,'clockwork.html'),'utf8');
const identity='<html lang="ru" data-edition="site">';
if (!html.includes(identity)) throw Error('Clocktower Workshop template has changed.');
html=html.replace(identity,'<html lang="en" data-edition="'+target+'">')
  .replace('<title>Лестница к Семейным часам · Tvijo</title>','<title>Clocktower Workshop · Centaur Chronicles</title>')
  .replace(/^ *<div class="cw-nav" id="cw-site-nav"><\/div>\n/m,'')
  .replace(/^ *<button [^\n]*id="cw-credit"[^\n]*\n/m,'')
  .replace(/^ *<dialog id="cw-purchase"[\s\S]*?<\/dialog>\n/m,'');
await mkdir(join(output,'clockwork'),{recursive:true});
await writeFile(join(output,'index.html'),html);
for (const name of ['game.js','text.js','scene.js','style.css','local-store.js']) {
  await copyFile(join(source,'clockwork',name),join(output,'clockwork',name));
}
const main=await readFile(join(source,'clockwork','main.js'),'utf8');
const selector="const isSite=document.documentElement.dataset.edition==='site';\nconst store=isSite?await import('./site-store.js'):localStore;";
if (!main.includes(selector)) throw Error('Clocktower Workshop entry point has changed.');
await writeFile(join(output,'clockwork','main.js'),main.replace(selector,'const isSite=false;\nconst store=localStore;'));
console.log('Built '+target+' in '+output);
