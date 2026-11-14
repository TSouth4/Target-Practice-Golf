// Browser QA using Chromium's built-in DevTools protocol; no npm dependency.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,readdir,mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist'),server=createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep))throw Error('Path');res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port,profile=await mkdtemp('/tmp/dispersion-chromium-');
const browser=spawn('/usr/bin/chromium',['--headless','--no-sandbox','--disable-gpu','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
let ws;try{
 const endpoint=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Chromium startup timed out')),15000);let text='';browser.stderr.on('data',b=>{text+=b;const m=text.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});browser.on('error',reject);});
 ws=new WebSocket(endpoint);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let id=0;const pending=new Map();ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params,...(sessionId?{sessionId}:{})}));});
 const target=await call('Target.createTarget',{url:'about:blank'}),{sessionId}=await call('Target.attachToTarget',{targetId:target.targetId,flatten:true}),send=(m,p)=>call(m,p,sessionId);
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await mkdir('/workspace/browser-review',{recursive:true});

 const waitFor=async expression=>{for(let n=0;n<1200;n++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timed out: '+expression);};
 const click=id=>evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
 const visible=id=>evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});return !!e&&e.checkVisibility({checkVisibilityCSS:true,checkOpacity:true});})()`);
 const downloadRoot=await mkdtemp('/tmp/target-practice-save-warning-downloads-');
 for(const width of [1440,390,320]){
 const downloadDir=path.join(downloadRoot,String(width));await mkdir(downloadDir,{recursive:true});await send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir});
 await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});await send('Page.navigate',{url:`http://127.0.0.1:${port}/`});await waitFor('document.getElementById("course")?.innerHTML.length>100');await evaluate('localStorage.clear()');await send('Page.reload',{});await waitFor('document.getElementById("course")?.innerHTML.length>100');
 const before=await evaluate("localStorage.getItem('target-practice-round-v1')");
 await evaluate("window.originalStorageWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Synthetic test: storage blocked','QuotaExceededError');}");await click('homeLearning');
 assert.equal(await visible('saveWarning'),true);assert.equal(await evaluate("localStorage.getItem('target-practice-round-v1')"),before);
 await click('saveWarningRetry');assert.equal(await visible('saveWarning'),true);
 const oldFiles=new Set(await readdir(downloadDir));await click('saveWarningBackup');let file;
 for(let n=0;n<100&&!file;n++){file=(await readdir(downloadDir)).find(f=>f.endsWith('.json')&&!oldFiles.has(f));if(!file)await new Promise(r=>setTimeout(r,50));}assert.ok(file,'Backup download did not complete');
 const backup=JSON.parse(await readFile(path.join(downloadDir,file),'utf8')),round=backup.data['target-practice-round-v1'];assert.equal(round.kind,'practice');assert.equal(round.index,0);assert.equal(round.profile.layoutVersion,'variety-v1');assert.equal(await visible('saveWarning'),true);
 assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'),false);
 const clip=await evaluate('(()=>{const r=document.getElementById("saveWarning").getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1};})()');const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});await writeFile(`/workspace/browser-review/save-warning-${width}.png`,Buffer.from(shot.data,'base64'));
 await click('fullscreenToggle');assert.equal(await visible('saveWarning'),true);const fits=await evaluate('(()=>{const r=document.getElementById("saveWarning").getBoundingClientRect();return r.x>=0&&r.right<=innerWidth&&r.y>=0&&r.bottom<=innerHeight;})()');assert.equal(fits,true);
 await evaluate("var aim=document.getElementById('aimX');aim.value=12;aim.dispatchEvent(new Event('input',{bubbles:true}));Storage.prototype.setItem=originalStorageWrite;");await click('saveWarningRetry');assert.equal(await visible('saveWarning'),false);
 assert.equal(await evaluate("JSON.parse(localStorage.getItem('target-practice-round-v1')).id"),round.id);assert.equal(await evaluate("JSON.parse(localStorage.getItem('golfaim101-v2')).aim.x"),12);
 console.log('Passed blocked saves, backup download, fullscreen and same-round recovery:',width);
 }

}finally{ws?.close();browser.kill();server.close();await rm(profile,{recursive:true,force:true}).catch(()=>{});}
