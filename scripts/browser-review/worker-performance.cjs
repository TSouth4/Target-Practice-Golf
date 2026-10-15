const{chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const base=process.env.TARGET_PRACTICE_BASE_URL;if(!base)throw Error('Set TARGET_PRACTICE_BASE_URL to the static test server.');
 const b=await chromium.launch({executablePath:process.env.TARGET_PRACTICE_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const report={appVersion:JSON.parse(fs.readFileSync(__dirname+'/../../package.json','utf8')).version,measuredAt:new Date().toISOString(),browser:b.version(),notes:'Same-build comparison with Worker available versus unavailable. CPU slowdown is applied to the page; it may not apply to workers. Slowed-page results measure page responsiveness, not equivalent whole-phone calculation speed. Local uncompressed server, cold contexts; deliberate reveal animations disabled.',runs:[]};
 try{
  for(const config of[{name:'desktop-local',width:1440,cpu:1,network:false},{name:'phone-page-slowed',width:390,cpu:6,network:true}])
  for(const fixture of[{name:'tee-easy',scenario:'cedar',difficulty:'easy'},{name:'approach-hard',scenario:'tucked',difficulty:'hard'}])
  for(let trial=1;trial<=3;trial++)for(const backend of['main-thread','worker']){
   const context=await b.newContext({viewport:{width:config.width,height:900},reducedMotion:'reduce'});
   await context.addInitScript(({fixture,backend})=>{
    if(backend==='main-thread')Object.defineProperty(window,'Worker',{value:undefined,configurable:true});
    localStorage.setItem('golfaim101-v2',JSON.stringify({scenario:fixture.scenario,holeSeed:47,seed:7142026,practiceMode:'free',difficulty:fixture.difficulty,landscape:'woodland',basicHandicap:'20'}));
    window.measurementLongTasks=[];new PerformanceObserver(list=>window.measurementLongTasks.push(...list.getEntries().map(t=>({start:t.startTime,duration:t.duration})))).observe({type:'longtask',buffered:true});
   },{fixture,backend});
   const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   const cdp=await context.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:config.cpu});await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});if(config.network)await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});
   await p.goto(base);await p.locator('#homeScreen').waitFor({state:'visible'});const homeReadyMs=await p.evaluate(()=>performance.now());await p.locator('#homePractice').click();
   await p.evaluate(()=>{const el=document.getElementById('aimX');el.value='5';el.dispatchEvent(new Event('input'));window.measurementHeartbeat={last:performance.now(),gaps:[]};window.measurementHeartbeatTimer=setInterval(()=>{const h=window.measurementHeartbeat,now=performance.now();h.gaps.push({start:h.last,duration:now-h.last});h.last=now;},25);});
   const start=await p.evaluate(()=>performance.now());await p.locator('#simulate').click();await p.locator('#results').waitFor({state:'visible',timeout:120000});await p.waitForTimeout(80);
   const timing=await p.evaluate(start=>{
    clearInterval(window.measurementHeartbeatTimer);const a=performance.getEntriesByName('target-practice-calculation-start').at(-1),z=performance.getEntriesByName('target-practice-calculation-end').at(-1),overlap=t=>t.start>=a.startTime&&t.start<z.startTime,history=JSON.parse(localStorage.getItem('target-practice-progress-v1'));
    return{execution:z.detail.execution,calculationMs:z.startTime-a.startTime,commitToReviewMs:performance.now()-start-80,maxCalculationBlockMs:Math.max(0,...window.measurementLongTasks.filter(overlap).map(t=>t.duration)),totalCalculationBlockingMs:window.measurementLongTasks.filter(overlap).reduce((sum,t)=>sum+Math.max(0,t.duration-50),0),maxHeartbeatGapMs:Math.max(0,...window.measurementHeartbeat.gaps.filter(t=>t.start>=a.startTime&&t.start+t.duration<=z.startTime).map(t=>t.duration)),grade:history[0].score,regret:history[0].regret,kind:history[0].kind};
   },start);
   assert.equal(timing.execution,backend);assert.ok(timing.calculationMs>0);assert.deepEqual(errors,[]);report.runs.push({configuration:config.name,cpuSlowdownOnPage:config.cpu,network:config.network?'1.6 Mbps down / 750 Kbps up / 150 ms page latency':'local unthrottled',fixture:fixture.name,trial,backend,homeReadyMs,...timing});console.log(config.name,fixture.name,trial,backend,Math.round(timing.calculationMs)+' ms calculation',Math.round(timing.totalCalculationBlockingMs)+' ms blocking');await context.close();
  }
 }finally{await b.close();}
 report.summary=[];for(const configuration of['desktop-local','phone-page-slowed'])for(const fixture of['tee-easy','approach-hard'])for(const backend of['main-thread','worker']){const rows=report.runs.filter(r=>r.configuration===configuration&&r.fixture===fixture&&r.backend===backend),median=k=>rows.map(r=>r[k]).sort((a,b)=>a-b)[1];report.summary.push({configuration,fixture,backend,trials:rows.length,medianHomeReadyMs:Math.round(median('homeReadyMs')),medianCalculationMs:Math.round(median('calculationMs')),medianCommitToReviewMs:Math.round(median('commitToReviewMs')),medianCalculationBlockingMs:Math.round(median('totalCalculationBlockingMs')),worstCalculationBlockMs:Math.round(Math.max(...rows.map(r=>r.maxCalculationBlockMs))),worstHeartbeatGapMs:Math.round(Math.max(...rows.map(r=>r.maxHeartbeatGapMs)))});}
 for(const config of['desktop-local','phone-page-slowed'])for(const fixture of['tee-easy','approach-hard']){const rows=report.runs.filter(r=>r.configuration===config&&r.fixture===fixture);assert.equal(new Set(rows.map(r=>r.grade)).size,1);assert.equal(new Set(rows.map(r=>r.regret)).size,1);assert.equal(new Set(rows.map(r=>r.kind)).size,1);}
 const output=process.env.TARGET_PRACTICE_PERF_OUTPUT||'/tmp/target-practice-worker-performance.json';fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log('Report saved to '+output);
})().catch(e=>{console.error(e);process.exitCode=1});
