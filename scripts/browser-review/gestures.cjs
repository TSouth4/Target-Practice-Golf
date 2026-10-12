const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');const assert=require('node:assert/strict');const fs=require('fs');
const out=process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp/target-practice-browser-results';fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({executablePath:process.env.TARGET_PRACTICE_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const results=[];
for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:{width:mobile?390:1440,height:mobile?844:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:'no-preference'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const report={profile:mobile?'phone':'desktop',checks:[],errors};
 try{
 await page.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8765');await page.locator('#vegetation').waitFor();
 await page.locator('#aimX').focus();await page.keyboard.press('ArrowRight');
 const aim=await page.locator('#aimMarker').getAttribute('transform');
 const course=page.locator('#course');await course.scrollIntoViewIfNeeded();const b=await course.boundingBox();const x=b.x+b.width*.6,y=b.y+b.height*.7;
 if(mobile){await page.touchscreen.tap(x,y);await page.touchscreen.tap(x,y);}else await page.mouse.dblclick(x,y);
 assert.equal(await page.locator('#aimMarker').getAttribute('transform'),aim);
 assert.equal(await page.locator('#aimZoomToggle').innerText(),'Zoom out ⊖');
 assert.equal(await page.locator('#shotCloud,#idealCloud,#meanFinish').count(),0);
 report.checks.push('double gesture preserves target and zooms without answers');
 await page.locator('#aimZoomToggle').click();
 const old=await page.locator('#targetDistance').innerText();const map=page.locator('#aimY');await map.scrollIntoViewIfNeeded();const m=await map.boundingBox();
 if(mobile)await page.touchscreen.tap(m.x+m.width*.5,m.y+m.height*.8);else await page.mouse.click(m.x+m.width*.5,m.y+m.height*.8);
 assert.notEqual(await page.locator('#targetDistance').innerText(),old);report.checks.push('vertical slider changes target depth');
 const started=Date.now();await page.locator('#simulate').click();await page.locator('#shotTracers').waitFor({timeout:60000});
 assert.equal(await page.locator('#shotCloud,#idealCloud,#meanFinish').count(),0);assert.equal(await page.locator('#aimX').isDisabled(),true);
 await page.locator('#results').waitFor({state:'visible',timeout:60000});report.commitDurationMs=Date.now()-started;report.checks.push('normal-motion tracers precede answer reveal and lock controls');
 await page.locator('#tryAgain').click();await page.locator('#approachTab').click();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')));
 const info=await page.evaluate(async()=>{const m=await import('./model.js');const state=JSON.parse(localStorage.getItem('golfaim101-v2'));return m.SCENARIOS.find(s=>s.id===state.scenario).type;});
 assert.equal(state.practiceFilter,'approach');assert.equal(info,'approach');assert.equal(await page.locator('#shotCloud,#idealCloud,#meanFinish').count(),0);report.checks.push('approach filtering keeps answers hidden');
 report.layout=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
 }catch(e){report.failure=e.message;}
 results.push(report);console.log(JSON.stringify(report));await context.close();
}
fs.writeFileSync(`${out}/gestures.json`,JSON.stringify(results,null,2));await browser.close();if(results.some(r=>r.failure||r.errors.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
