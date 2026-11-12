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
 for(const scenario of ['bend','split','water','shore-green'])for(const width of [390,1440]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<500});
 await send('Page.navigate',{url:`http://127.0.0.1:${port}/`});await waitFor('document.getElementById("course")?.innerHTML.length>100');
 await evaluate(`localStorage.clear();localStorage.setItem('target-practice-free-session-v1',JSON.stringify({version:1,scenario:${JSON.stringify(scenario)},holeSeed:${scenario==='split'?5:4},layoutVersion:'variety-v1',seed:1234,landscape:'woodland',aim:{x:0,y:200},hasAim:false,recent:['sharp-dogleg'],practiceFilter:'mixed'}));`);
 await send('Page.reload',{});await waitFor('document.getElementById("course")?.innerHTML.length>100');await click('homeContinuePractice');
 for(const full of [false,true]){
 if(full)await click('fullscreenToggle');
 await new Promise(r=>setTimeout(r,400));
 const audit=await evaluate(`(()=>{const course=document.getElementById('course').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+1,markers:[...document.querySelectorAll('.mobile-hazard-marker')].filter(e=>e.getBoundingClientRect().width>0).map(e=>{const box=e.querySelector('.hazard-label-box').getBBox();return {kind:e.dataset.kind,text:e.textContent,box:{x:box.x,y:box.y,w:box.width,h:box.height},rects:[...e.querySelectorAll('text')].map(t=>({b:JSON.stringify(t.getBBox()),r:JSON.stringify(t.getBoundingClientRect())})),course:JSON.stringify(course),inside:[...e.querySelectorAll('text')].every(t=>{const r=t.getBBox(),p=t.getBoundingClientRect();return r.x>=box.x&&r.x+r.width<=box.x+box.width&&r.y>=box.y&&r.y+r.height<=box.y+box.height&&p.left>=course.left-1&&p.right<=course.right+1;})};})};})()`);
 assert.equal(audit.overflow,false);if(width<500){assert.ok(audit.markers.length>0);assert.ok(audit.markers.every(m=>m.inside),JSON.stringify(audit));assert.ok(audit.markers.filter(m=>m.kind==='ob').every(m=>/OB · (left|right)/.test(m.text)));}
 assert.equal(await evaluate("JSON.parse(localStorage.getItem('golfaim101-v2')).layoutVersion"),'variety-v1');assert.equal(await evaluate("/NaN|undefined|Infinity/.test(document.getElementById('course').innerHTML)"),false);console.log('Passed new-layout render and label containment:',scenario,width,full);

 const clip=await evaluate('(()=>{const r=document.getElementById("course").getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1};})()');
 const p=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});await writeFile(`/workspace/browser-review/hole-variety-${scenario}-${width}-${full}.png`,Buffer.from(p.data,'base64'));
 }
 }

}finally{ws?.close();browser.kill();server.close();await rm(profile,{recursive:true,force:true}).catch(()=>{});}
