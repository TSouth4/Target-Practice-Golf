// Browser QA using Chromium's built-in DevTools protocol; no npm dependency.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
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
 for(const width of [1440,390,320]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});await send('Page.navigate',{url:`http://127.0.0.1:${port}/green-shape-preview.html`});await waitFor('document.getElementById("studyGreenEdge")');
 await evaluate("localStorage.setItem('audit-sentinel','keep');localStorage.setItem('target-practice-progress-v1','synthetic-preserved-history');");const before=await evaluate('JSON.stringify({...localStorage})');
 for(const example of ['left','right','wide']){
 await evaluate(`document.getElementById('studyExample').value=${JSON.stringify(example)};document.getElementById('studyExample').dispatchEvent(new Event('change'));`);
 const originalEdge=await evaluate('document.getElementById("studyGreenEdge").getAttribute("points")'),originalYardages=await evaluate('document.getElementById("studyYardages").textContent');
 await evaluate("document.getElementById('studyMowing').checked=false;document.getElementById('studyMowing').dispatchEvent(new Event('change'));");assert.equal(await evaluate('!!document.getElementById("studyMowingBands")'),false);assert.equal(await evaluate('document.getElementById("studyGreenEdge").getAttribute("points")'),originalEdge);assert.equal(await evaluate('document.getElementById("studyYardages").textContent'),originalYardages);
 await evaluate("document.getElementById('studyMowing').checked=true;document.getElementById('studyMowing').dispatchEvent(new Event('change'));");assert.equal(await evaluate('!!document.querySelector("#studyMowingBands path[d]")'),true);
 for(const view of ['pov','map']){
 await evaluate(`document.getElementById('studyView').value=${JSON.stringify(view)};document.getElementById('studyView').dispatchEvent(new Event('change'));`);
 assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'),false);assert.equal(await evaluate('/NaN|undefined|Infinity/.test(document.getElementById("studyCourse").innerHTML)'),false);assert.equal(await evaluate('document.getElementById("studyResult").hidden'),true);
 if(width===390){const clip=await evaluate('(()=>{const r=document.getElementById("studyCourse").getBoundingClientRect();return{x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1};})()');const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});await writeFile(`/workspace/browser-review/angled-green-${example}-${view}.png`,Buffer.from(shot.data,'base64'));
 await evaluate("document.getElementById('studyMowing').checked=false;document.getElementById('studyMowing').dispatchEvent(new Event('change'));");const off=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});await writeFile(`/workspace/browser-review/angled-green-${example}-${view}-no-mowing.png`,Buffer.from(off.data,'base64'));await evaluate("document.getElementById('studyMowing').checked=true;document.getElementById('studyMowing').dispatchEvent(new Event('change'));");}
 }
 if(width===390){await click('studyFlag');await click('studyCommit');await waitFor('!document.getElementById("studyResult").hidden');assert.equal(await evaluate('/NaN|undefined|Infinity/.test(document.getElementById("studyResult").textContent)'),false);assert.ok(await evaluate('document.querySelectorAll("#studyCourse circle").length>400'));const resultText=await evaluate('document.getElementById("studyResult").textContent');await evaluate("document.getElementById('studyMowing').checked=false;document.getElementById('studyMowing').dispatchEvent(new Event('change'));");assert.equal(await evaluate('document.getElementById("studyResult").textContent'),resultText);await click('studyReset');}
 assert.equal(await evaluate('JSON.stringify({...localStorage})'),before);console.log('Passed fixed angled example, views, clean SVG and preserved storage:',width,example);
 }
 }

}finally{ws?.close();browser.kill();server.close();await rm(profile,{recursive:true,force:true}).catch(()=>{});}
