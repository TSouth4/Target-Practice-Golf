// Browser QA using Chromium's built-in DevTools protocol; no npm dependency.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
let blockBoot=false;
const root=path.resolve('dist'),server=createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(blockBoot&&file.endsWith('/boot.js'))throw Error('Intentional audit failure');if(!file.startsWith(root+path.sep))throw Error('Path');res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}});
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
 const report={scope:'Local Chromium, reduced motion, no CPU/network throttling; timings include automation polling. Not real-phone or production capacity evidence.',runs:[]};
 await send('Network.enable',{});await send('Network.setCacheDisabled',{cacheDisabled:true});
 for(const width of [1440,390])for(let sample=1;sample<=3;sample++){
 await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await send('Page.navigate',{url:`http://127.0.0.1:${port}/`});await waitFor('document.getElementById("course")?.innerHTML.length>100');
 await evaluate(`localStorage.clear();localStorage.setItem('target-practice-free-session-v1',JSON.stringify({version:1,scenario:'tucked',holeSeed:4,layoutVersion:'variety-v1',seed:7142026,landscape:'woodland',aim:{x:0,y:160},hasAim:false,recent:['tucked'],practiceFilter:'approach'}));`);
 await send('Page.reload',{});await waitFor('document.getElementById("course")?.innerHTML.length>100');
 const ready=await evaluate('performance.now()');await click('homeContinuePractice');
 await evaluate(`window.auditLongTasks=[];new PerformanceObserver(list=>auditLongTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask'});var slider=document.getElementById('aimX');slider.value=0;slider.dispatchEvent(new Event('input',{bubbles:true}));window.auditStart=performance.now();document.getElementById('simulate').click();`);
 await waitFor('!document.getElementById("results").hidden');
 const result=await evaluate(`({commitToReviewMs:performance.now()-auditStart,execution:performance.getEntriesByName('target-practice-calculation-end').at(-1)?.detail?.execution,worstMainThreadTaskMs:Math.max(0,...auditLongTasks),resourceBytes:performance.getEntriesByType('resource').reduce((n,r)=>n+r.encodedBodySize,0),fcpMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime})`);
 report.runs.push({width,sample,courseReadyMs:ready,...result});console.log('Measured',width,sample,result.execution,Math.round(result.commitToReviewMs));
 }
 blockBoot=true;await send('Page.navigate',{url:`http://127.0.0.1:${port}/?blocked-bootstrap=1`});await waitFor('document.readyState==="complete"');
 report.blockedBootstrap=await evaluate(`({errorPanelHidden:document.getElementById('startupError').hidden,courseRendered:document.getElementById('course').innerHTML.includes('surfaceRelief')})`);
 assert.equal(report.blockedBootstrap.courseRendered,false);assert.equal(report.blockedBootstrap.errorPanelHidden,true);
 await writeFile('docs/MAINTENANCE-PERFORMANCE.json',JSON.stringify(report,null,2)+'\n');console.log('Confirmed bootstrap-file failure leaves startup error panel hidden.');

}finally{ws?.close();browser.kill();server.close();await rm(profile,{recursive:true,force:true}).catch(()=>{});}
