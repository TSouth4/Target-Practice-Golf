// Browser QA using Chromium's built-in DevTools protocol; no npm dependency.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist'),server=createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error('Path');res.setHeader('Content-Type',file.endsWith('.html')?'text/html':'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port,profile=await mkdtemp('/tmp/dispersion-chromium-');
const browser=spawn('/usr/bin/chromium',['--headless','--no-sandbox','--disable-gpu','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
let ws;try{
 const endpoint=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Chromium startup timed out')),15000);let text='';browser.stderr.on('data',b=>{text+=b;const m=text.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});browser.on('error',reject);});
 ws=new WebSocket(endpoint);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let id=0;const pending=new Map();ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}};
 const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params,...(sessionId?{sessionId}:{})}));});
 const target=await call('Target.createTarget',{url:'about:blank'}),{sessionId}=await call('Target.attachToTarget',{targetId:target.targetId,flatten:true}),send=(m,p)=>call(m,p,sessionId);
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await mkdir('/workspace/browser-review',{recursive:true});
 for(const width of [1440,390,320]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});await send('Page.navigate',{url:`http://127.0.0.1:${port}/dispersion-prototype.html`});
  for(let n=0;n<100;n++){if(await evaluate('document.querySelectorAll(".card").length===3'))break;await new Promise(r=>setTimeout(r,50));}
  assert.equal(await evaluate('document.querySelectorAll(".card").length'),3);const storage=await evaluate('JSON.stringify({...localStorage})');
  for(let i=0;i<6;i++)for(const view of ['shared','best']){
   await evaluate(`document.getElementById('case').value='${i}';document.getElementById('case').dispatchEvent(new Event('change'));document.getElementById('view').value='${view}';document.getElementById('view').dispatchEvent(new Event('change'));`);
   assert.equal(await evaluate('document.querySelectorAll(".card svg circle").length'),1500);assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'),false);assert.equal(await evaluate('document.getElementById("target").disabled'),view==='best');
   assert.ok(!await evaluate('document.getElementById("cards").textContent.includes("NaN")'));
  }
  await evaluate("document.getElementById('case').value='1';document.getElementById('case').dispatchEvent(new Event('change'));document.getElementById('view').value='shared';document.getElementById('view').dispatchEvent(new Event('change'));");assert.equal(await evaluate('JSON.stringify({...localStorage})'),storage);
  const png=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(`/workspace/browser-review/dispersion-prototype-${width}.png`,Buffer.from(png.data,'base64'));console.log('Passed all six cases, shared/best views, 1,500 dots, no overflow or storage changes:',width);
 }
}finally{ws?.close();browser.kill();server.close();await rm(profile,{recursive:true,force:true}).catch(()=>{});}
