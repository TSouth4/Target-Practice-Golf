import {readFile,writeFile,readdir,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),dist=path.join(root,'dist');
const names=(await readdir(dist)).filter(n=>n.endsWith('.js')||n==='styles.css').sort();
const hash=createHash('sha256');
for(const name of names){hash.update(name+'\0');hash.update(await readFile(path.join(dist,name)));}
const release=hash.digest('hex').slice(0,16),folder=path.join(dist,'releases',release);
await mkdir(folder,{recursive:true});
for(const name of names)await copyFile(path.join(dist,name),path.join(folder,name));
let html=await readFile(path.join(dist,'index.html'),'utf8');
html=html.replace(/href="(?:releases\/[a-f0-9]+\/)?styles\.css"/,`href="releases/${release}/styles.css"`).replace(/src="(?:releases\/[a-f0-9]+\/)?(?:app|boot)\.js"/,`src="releases/${release}/boot.js"`);
await writeFile(path.join(dist,'index.html'),html);
console.log('Prepared complete asset release '+release+' ('+names.length+' files)');
