import {CURRICULUM} from '../../dist/curriculum.js';
import {createRound} from '../../dist/rounds.js';
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

 const savedRound=createRound('practice',170,{handicap:'20',limit:225});
 for(const width of [1440,390,320]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await send('Page.navigate',{url:`http://127.0.0.1:${port}/`});await waitFor('document.getElementById("course")?.innerHTML.length>100');
  await evaluate(`localStorage.clear();localStorage.setItem('target-practice-round-v1',${JSON.stringify(JSON.stringify(savedRound))});`);await send('Page.reload',{});await waitFor('document.getElementById("course")?.innerHTML.length>100');
  const before=await evaluate('JSON.stringify({round:JSON.parse(localStorage.getItem("target-practice-round-v1")),progress:localStorage.getItem("target-practice-progress-v1"),lessons:localStorage.getItem("target-practice-lessons-v1")})');await click('homeLessons');
  for(let index=0;index<CURRICULUM.length;index++){
   await click('lessonStart'+(index+1));await waitFor('!document.getElementById("tutorialNext").disabled');
   for(let card=0;card<CURRICULUM[index].intro.length;card++){
    const text=await evaluate('document.getElementById("tutorialText").textContent');assert.ok(text.length>30);assert.doesNotMatch(text,/proximity|modeled|nominal|tradeoff/);assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'),false);assert.equal(await evaluate('/NaN|undefined|Infinity/.test(document.getElementById("tutorialIllustration").innerHTML)'),false);
    if(card===0&&(index===0||index===2)){const clip=await evaluate('(()=>{const r=document.getElementById("tutorialCard").getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1};})()');await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip}).then(p=>writeFile(`/workspace/browser-review/lesson-language-${width}-${index}.png`,Buffer.from(p.data,'base64')));}
    if(card<CURRICULUM[index].intro.length-1)await click('tutorialNext');
   }
   await click('tutorialExit');
  }
  await click('closeLessons');assert.equal(await evaluate('JSON.stringify({round:JSON.parse(localStorage.getItem("target-practice-round-v1")),progress:localStorage.getItem("target-practice-progress-v1"),lessons:localStorage.getItem("target-practice-lessons-v1")})'),before);console.log('Passed all12 lesson explanation cards, graphics, no overflow and preserved active round/progress/completion:',width);
 }
}finally{ws?.close();browser.kill();server.close();await rm(profile,{recursive:true,force:true}).catch(()=>{});}
