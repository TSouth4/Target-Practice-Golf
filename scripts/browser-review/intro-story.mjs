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
 const course=JSON.parse(await readFile('tests/fixtures/course-v2-saved-review.json','utf8'));

 for(const width of [1440,390,320]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await send('Page.navigate',{url:`http://127.0.0.1:${port}/`});await waitFor('document.getElementById("course")?.innerHTML.length>100');await evaluate('localStorage.clear()');await send('Page.reload',{});await waitFor('document.getElementById("course")?.innerHTML.length>100');
  const before=await evaluate('JSON.stringify({round:localStorage.getItem("target-practice-round-v1"),progress:localStorage.getItem("target-practice-progress-v1")})');
  await click('homeIntroductionRecommended');assert.match(await evaluate('document.getElementById("controlsTitle").textContent'),/shot we picture/);assert.equal(await evaluate('document.getElementById("controlsStory").animationsPaused()'),true);
  for(let step=0;step<5;step++){
   assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'),false);
   if(step===2||step===3)assert.equal(await evaluate('document.querySelectorAll("#controlsStory .intro-finish").length'),100);
   if(step===3){assert.equal(await evaluate('document.getElementById("controlsNext").disabled'),true);await click('controlsMoveTarget');assert.equal(await evaluate('document.getElementById("controlsNext").disabled'),false);}
   if(step===0||step===2||step===3){const clip=await evaluate('(()=>{const r=document.querySelector("#controlsDialog .course-setup-card").getBoundingClientRect();return {x:Math.max(0,r.x+scrollX),y:Math.max(0,r.y+scrollY),width:r.width,height:r.height,scale:1}})()');await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip}).then(p=>writeFile(`/workspace/browser-review/intro-story-${width}-${step}.png`,Buffer.from(p.data,'base64')));}
   await click('controlsNext');
  }
  assert.equal(await visible('controlsStory'),false);assert.equal(await visible('controlsRange'),true);assert.equal(await evaluate('document.getElementById("controlsNext").disabled'),true);await evaluate('document.getElementById("controlsRange").dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}))');await click('controlsNext');assert.equal(await evaluate('document.getElementById("controlsNext").disabled'),true);
  await evaluate('document.getElementById("controlsCarry").value=160;document.getElementById("controlsCarry").dispatchEvent(new Event("input"))');await click('controlsNext');await click('controlsCommit');await click('controlsNext');assert.match(await evaluate('document.getElementById("controlsTitle").textContent'),/starting point/);assert.match(await evaluate('document.getElementById("controlsText").textContent'),/save the feedback until the end/);
  assert.equal(await evaluate('JSON.stringify({round:localStorage.getItem("target-practice-round-v1"),progress:localStorage.getItem("target-practice-progress-v1")})'),before);await click('controlsClose');assert.equal(await visible('homeIntroductionRecommended'),false);await send('Page.reload',{});await waitFor('document.getElementById("course")?.innerHTML.length>100');assert.equal(await visible('homeIntroductionRecommended'),false);
  await click('homeIntroduction');assert.match(await evaluate('document.getElementById("controlsTitle").textContent'),/shot we picture/);await click('controlsAssessment');assert.equal(await visible('assessmentSetup'),true);assert.equal(await evaluate('document.querySelector("#mainContent").inert'),false);assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'),false);
  console.log('Passed100-dot story, guided move, controls, reduced motion, completion/replay, assessment and no scoring:',width);
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await click('assessmentControls');assert.equal(await evaluate('document.getElementById("controlsStory").animationsPaused()'),false);await new Promise(r=>setTimeout(r,200));assert.ok(await evaluate('document.getElementById("controlsStory").getCurrentTime()>0'));await click('controlsNext');await click('controlsNext');assert.equal(await evaluate('document.querySelectorAll("#controlsStory [data-intro-flight]").length'),24);await new Promise(r=>setTimeout(r,2400));assert.equal(await evaluate('getComputedStyle(document.querySelector("#controlsStory .intro-group-flights")).opacity'),'0');assert.equal(await evaluate('[...document.querySelectorAll("#controlsStory .intro-game-finish")].filter(e=>+getComputedStyle(e).opacity>.8).length'),100);await click('controlsClose');console.log('Animated single flight and24-flight fade to100 final dots verified with motion enabled');
}finally{ws?.close();browser.kill();server.close();await rm(profile,{recursive:true,force:true}).catch(()=>{});}
