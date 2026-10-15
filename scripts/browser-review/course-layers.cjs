const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs');
const call="renderCourseLayers($('course'),{terrain:terrainMarkup,aim:aimMarkup,flights:flightMarkup,feedback:html});";
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const report={version:JSON.parse(fs.readFileSync(__dirname+'/../../package.json')).version,browser:browser.version(),notes:'Paired local shared-cloud browser runs. Flat replacement versus retained layers in the same build. Redraw durations include string construction and DOM insertion, not paint. Phone width is not physical phone hardware. Native regression tests were not running during measurement.',runs:[]};try{
 for(const width of [1440,390])for(const scenario of ['cedar','tucked']){
  const snapshots=[];
  for(const layered of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   await context.addInitScript(({scenario})=>{localStorage.setItem('golfaim101-v2',JSON.stringify({scenario,holeSeed:47,seed:7142026,practiceMode:'free',basicHandicap:'20',difficulty:scenario==='tucked'?'hard':'easy'}));window.drawTimes=[];},{scenario});
   await context.route('**/app.js',async route=>{let body=fs.readFileSync(__dirname+'/../../dist/app.js','utf8');assert.ok(body.includes(call));body=body.replace('function drawCourse(){','function drawCourse(){const drawStarted=performance.now();').replace(call,(layered?call:"$('course').innerHTML=terrainMarkup+aimMarkup+flightMarkup+html;")+'window.drawTimes.push(performance.now()-drawStarted);');await route.fulfill({contentType:'text/javascript',body});});
   const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.TARGET_PRACTICE_BASE_URL);await p.locator('#homePractice').click();
   await p.evaluate(()=>{window.originalTerrain=document.querySelector('#course [data-course-layer="terrain"]')?.firstElementChild;window.drawTimes=[];for(let i=0;i<40;i++){const el=document.getElementById('aimX');el.value=String(i%20-10);el.dispatchEvent(new Event('input'));}});
   const aim=await p.evaluate(()=>({ms:window.drawTimes,terrainPreserved:window.originalTerrain===document.querySelector('#course [data-course-layer="terrain"]')?.firstElementChild}));if(layered)assert.equal(aim.terrainPreserved,true);
   await p.locator('#simulate').click();await p.locator('#results').waitFor({state:'visible',timeout:120000});
   const capture=()=>p.evaluate(()=>Object.fromEntries(['yourContour','idealContour','shotCloud','idealCloud','courseFlag'].map(id=>[id,document.getElementById(id).outerHTML])));
   const map=await capture(),mapPng=await p.locator('#course').screenshot();await p.locator('#povBtn').click();const eye=await capture(),eyePng=await p.locator('#course').screenshot();
   await p.evaluate(()=>{window.originalCloud=document.getElementById('shotCloud');window.drawTimes=[];for(let i=0;i<30;i++)document.getElementById('povBtn').click();});
   const review=await p.evaluate(()=>({ms:window.drawTimes,cloudPreserved:window.originalCloud===document.getElementById('shotCloud')}));if(layered)assert.equal(review.cloudPreserved,true);
   const history=await p.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-progress-v1')).map(({score,regret,kind})=>({score,regret,kind})));
   snapshots.push({map,eye,history,mapPng,eyePng});
   const summarize=values=>({redraws:values.length,medianMs:values.slice().sort((a,b)=>a-b)[Math.floor(values.length/2)],totalMs:values.reduce((x,y)=>x+y,0)});
   report.runs.push({width,scenario,layered,aim:summarize(aim.ms),review:summarize(review.ms)});console.log(report.runs.at(-1));assert.deepEqual(errors,[]);await context.close();
  }
  assert.deepEqual(snapshots[0],snapshots[1]);
 }
 }finally{await browser.close();}const output=process.env.TARGET_PRACTICE_PERF_OUTPUT||'/tmp/course-layer-performance.json';fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log('Identical rendered screenshots, outline/dot markup and decision results. Report: '+output);
})().catch(e=>{console.error(e);process.exitCode=1});
