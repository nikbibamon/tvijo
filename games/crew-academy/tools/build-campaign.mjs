import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assembleCampaign} from './assemble-campaign.mjs';

const root = fileURLToPath(new URL('../',import.meta.url));
const output = process.argv[2] ? resolve(process.argv[2]) : join(root,'dist','campaign');
const web = join(root,'web');
const files = [
  'campaign','chronicles','clockwork','playground','fonts','art/crew','art/runners','art/tvijo.png',
  'expedition/expedition.css','expedition/mirror-path.js','catalog.js','crewLabels.js','domeRecording.js','flightAwards.js',
  'narration.js','pixelAvatar.js','strategy.js','tvijoService.js','worlds.js'
];
const [page,clockwork,playground] = await Promise.all(['chronicles','clockwork','playground']
  .map(name=>readFile(join(web,name+'.html'),'utf8')));
const home = assembleCampaign(page,{clockwork,playground})
  .replace(/^ *<div class="camp-atlas-footer">.*<\/div>\n/m,'');
await Promise.all(files.map(async name=>{
  const destination = join(output,name);
  await mkdir(dirname(destination),{recursive:true});
  await cp(join(web,name),destination,{recursive:true});
}));
await writeFile(join(output,'index.html'),home);
console.log('Campaign built in '+output);
