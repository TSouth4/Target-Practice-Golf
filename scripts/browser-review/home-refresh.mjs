import {createRound} from '../../dist/rounds.js';
import {MODEL_VERSION} from '../../dist/progress.js';
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
 const round=createRound('practice',1234,{handicap:'10',limit:250});round.index=2;round.answers=[0,1].map(index=>({index,kind:'balanced',score:90,regret:.02,dx:0,dy:0}));
 const rows=Array.from({length:20},(_,i)=>({id:'home-'+i,encounter:'home-'+i,profile:'profile-5',profileLabel:'5 handicap',model:MODEL_VERSION,at:new Date(Date.UTC(2026,10,26,0,i)).toISOString(),type:'approach',kind:'balanced',score:i<15?90:70,regret:.02,penalty:.02,retry:false}));
 for(const width of [1440,390,320])for(const state of ['new','empty','returning']){
 await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});await send('Page.navigate',{url:`http://127.0.0.1:${port}/`});await waitFor('document.getElementById("course")?.innerHTML.length>100');
 await evaluate(`localStorage.clear();localStorage.setItem('golfaim101-v2',JSON.stringify({scenario:'cedar',practiceMode:'free',controlsTutorialSeen:${state!=='new'}}));`);
 if(state==='returning')await evaluate(`localStorage.setItem('target-practice-progress-v1',${JSON.stringify(JSON.stringify(rows))});localStorage.setItem('target-practice-round-v1',${JSON.stringify(JSON.stringify(round))});`);
 await send('Page.reload',{});await waitFor('!document.getElementById("homeScreen").hidden');
 assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'),false);assert.equal(await evaluate('document.querySelector(".home-course-art").complete&&document.querySelector(".home-course-art").naturalWidth>0'),true);
 assert.equal(await visible('homeIntroductionRecommended'),state==='new');assert.equal(await visible('homeResumeCard'),state==='returning');
 if(state==='returning'){assert.equal(await evaluate('document.getElementById("homeSummaryScore").textContent'),'85.0');assert.match(await evaluate('document.getElementById("homeContinueDetails").textContent'),/3 of 5.*10-handicap/);assert.equal(await visible('homeSummaryEmpty'),false);}
 if(state==='empty'){assert.equal(await visible('homeSummaryEmpty'),true);assert.equal(await visible('homeSummaryData'),false);assert.equal(await visible('homeJourney'),true);}
 if(state==='new')assert.equal(await visible('homeSummary'),false);
 assert.equal(await evaluate('document.querySelector(".brand-logo image").getAttribute("href")'),'assets/target-practice-logo.png');
 await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:await evaluate('document.documentElement.scrollHeight'),scale:1}}).then(p=>writeFile(`/workspace/browser-review/home-refresh-${state}-${width}.png`,Buffer.from(p.data,'base64')));
 const progress=await evaluate("localStorage.getItem('target-practice-progress-v1')");
 if(state==='returning'){await click('homeNavPlay');assert.equal(await visible('practiceScreen'),true);assert.equal(await evaluate("JSON.parse(localStorage.getItem('target-practice-round-v1')).id"),round.id);assert.equal(await evaluate("JSON.parse(localStorage.getItem('target-practice-round-v1')).index"),2);await click('homeLogo');}
 await click('homeProgress');assert.equal(await visible('progressScreen'),true);await click('homeMenu');await click('homeLessons');assert.equal(await visible('lessonsScreen'),true);await click('closeLessons');await click('homeCourse');assert.equal(await visible('courseSetup'),true);await click('courseSetupCancel');
 assert.equal(await evaluate("localStorage.getItem('target-practice-progress-v1')"),progress);assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'),false);
 console.log('Passed Home state, real data, existing logo, navigation and saved progress:',width,state);
 }

}finally{ws?.close();browser.kill();server.close();await rm(profile,{recursive:true,force:true}).catch(()=>{});}
