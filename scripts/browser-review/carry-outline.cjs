const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs');
const previous="let contour=[];for(let i=0;i<64;i++){const t=i/64*Math.PI*2,pt=shotAt(aim,{...patternAtTarget(aim,p),bigPct:0},{z1:1.794*Math.cos(t),z2:1.794*Math.sin(t),u:1,sign:1});contour.push([pt.landing.x,pt.landing.y]);}";
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const report={version:JSON.parse(fs.readFileSync(__dirname+'/../../package.json','utf8')).version,browser:browser.version(),runs:[],notes:'Same build with outline cache enabled versus original inline calculation injected only by the development test. Local shared cloud Chromium; no phone hardware or production traffic claims. Drawing timings include string construction and SVG insertion, not full paint.'};try{
 for(const width of [1440,390])for(const scenario of ['cedar','tucked']){
  const snapshots=[];
  for(const cached of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   await context.addInitScript(({scenario})=>{localStorage.setItem('golfaim101-v2',JSON.stringify({scenario,holeSeed:47,seed:7142026,practiceMode:'free',basicHandicap:'20',difficulty:scenario==='tucked'?'hard':'easy'}));window.outlineDrawTimes=[];},{scenario});
   await context.route('**/app.js',async route=>{let source=fs.readFileSync(__dirname+'/../../dist/app.js','utf8');if(!cached){assert.ok(source.includes('const contour=cachedCarryOutline(aim,p);'));source=source.replace('const contour=cachedCarryOutline(aim,p);',previous);}source=source.replace('function drawCourse(){','function drawCourse(){const outlineDrawStart=performance.now();').replace("renderCourseLayers($('course'),{terrain:terrainMarkup,aim:aimMarkup,flights:flightMarkup,feedback:html});","renderCourseLayers($('course'),{terrain:terrainMarkup,aim:aimMarkup,flights:flightMarkup,feedback:html});window.outlineDrawTimes.push(performance.now()-outlineDrawStart);");await route.fulfill({contentType:'text/javascript',body:source});});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.TARGET_PRACTICE_BASE_URL);await page.locator('#homePractice').click();await page.evaluate(()=>{const el=document.getElementById('aimX');el.value='5';el.dispatchEvent(new Event('input'));});await page.locator('#simulate').click();await page.locator('#results').waitFor({state:'visible',timeout:120000});
   const capture=()=>page.evaluate(()=>Object.fromEntries(['yourContour','idealContour','shotCloud','idealCloud'].map(id=>[id,document.getElementById(id).outerHTML])));
   const map=await capture();await page.locator('#povBtn').click();const eye=await capture();
   await page.evaluate(()=>{window.outlineDrawTimes=[];for(let i=0;i<20;i++){document.getElementById(i%2?'mapBtn':'povBtn').click();}});
   const timing=await page.evaluate(()=>{const a=window.outlineDrawTimes.slice().sort((a,b)=>a-b);return{redraws:a.length,medianDrawMs:a[Math.floor(a.length/2)],totalDrawMs:a.reduce((x,y)=>x+y,0)};});
   snapshots.push({map,eye,history:await page.evaluate(()=>localStorage.getItem('target-practice-progress-v1'))});
   // Ignore persisted IDs/timestamps; the model outputs and every displayed dot/outline must match.
   snapshots.at(-1).history=JSON.parse(snapshots.at(-1).history).map(({score,regret,kind})=>({score,regret,kind}));
   assert.deepEqual(errors,[]);report.runs.push({width,scenario,cached,...timing});console.log(report.runs.at(-1));await context.close();
  }
  assert.deepEqual(snapshots[0],snapshots[1]);
 }
 // Isolate only the repeated geometry work; this does not estimate full-page speedup.
 const page=await browser.newPage();await page.goto(process.env.TARGET_PRACTICE_BASE_URL);report.geometry=await page.evaluate(async()=>{const {carryOutline,createCarryOutlineCache}=await import('/carry-outline.js'),{basicPattern,SCENARIOS}=await import('/model.js');const p=basicPattern('5',SCENARIOS[0]),aims=[{x:5,y:240},{x:-8,y:235}],rows=[];for(let trial=0;trial<3;trial++)for(const cached of [false,true]){const fn=cached?createCarryOutlineCache():carryOutline;let sum=0;const start=performance.now();for(let frame=0;frame<300;frame++)for(const aim of aims)sum+=fn(aim,p)[0][0];rows.push({trial,cached,redraws:300,contours:600,elapsedMs:performance.now()-start,checksum:sum});}return rows;});assert.equal(new Set(report.geometry.map(r=>r.checksum)).size,1);
 }finally{await browser.close();}const output=process.env.TARGET_PRACTICE_PERF_OUTPUT||'/tmp/carry-outline-performance.json';fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log('Matching SVG points, colors, dots and decision outputs; report '+output);
})().catch(e=>{console.error(e);process.exitCode=1;});
