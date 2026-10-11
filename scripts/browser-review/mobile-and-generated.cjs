const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');const assert=require('node:assert/strict');const fs=require('fs');
const out=process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp/target-practice-browser-results';fs.mkdirSync(out,{recursive:true});
(async()=>{
const b=await chromium.launch({executablePath:process.env.TARGET_PRACTICE_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const reports=[];
for(const width of [320,390]){
 const c=await b.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));const r={width,errors,checks:[]};
 try{
 await p.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8765');await p.locator('#vegetation').waitFor();
 const labels=await p.locator('#mobileHazardList li').allTextContents();assert.ok(labels.some(t=>t.includes('155–310 yd forward')));assert.ok(labels.some(t=>t.includes('76 yd left of center')));
 assert.equal(await p.locator('#mobileHazardList').evaluate(e=>getComputedStyle(e).fontSize),'16px');
 assert.ok(await p.locator('#mobileHazardList li').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=12));
 assert.equal(await p.locator('#course .hazard-callout').first().isVisible(),false);r.checks.push('readable terrain-only labels replace scaled callouts');
 await p.locator('#course').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
 const action=p.locator('#simulate');const courseBounds=await p.locator('.course-viewport').boundingBox();const bar=await p.locator('.simulate-row').boundingBox();assert.ok(bar.y-courseBounds.y-courseBounds.height>=0&&bar.y-courseBounds.y-courseBounds.height<=16);const a=await action.boundingBox();assert.ok(a.y+a.height<=844);assert.ok(a.height>=44);
 await p.locator('#aimX').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));const a2=await action.boundingBox();assert.ok(a2.y>=0&&a2.y+a2.height<=844);r.checks.push('main action is beside the course and stays visible while adjusting controls');
 const slider=p.locator('#aimX');await slider.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));const sb=await slider.boundingBox();assert.ok(sb.height>=44);
 const before=await slider.inputValue();const cdp=await c.newCDPSession(p);const sy=sb.y+sb.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sb.x+sb.width*.5,y:sy}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sb.x+sb.width*.7,y:sy}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.notEqual(await slider.inputValue(),before);assert.equal(await p.locator('#shotCloud,#idealCloud,#meanFinish').count(),0);r.checks.push('finger-like slider drag changes target without answers');
 const aim=await p.locator('#aimMarker').getAttribute('transform');await p.setViewportSize({width:844,height:width});assert.equal(await p.locator('#aimMarker').getAttribute('transform'),aim);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),844);await p.setViewportSize({width,height:844});r.checks.push('orientation resize preserves target without page overflow');
 await p.locator('#course').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.screenshot({path:`${out}/mobile-improved-${width}.png`});
 }catch(e){r.failure=e.message;}reports.push(r);console.log(JSON.stringify(r));await c.close();
}
for(const id of ['cedar','bend','drivable','narrow','sharp-dogleg','creek-tee','squeeze-par4','water','tucked','bowl','split','creek-par3','par5-open','par5-carry']){
 const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await c.addInitScript(({id})=>localStorage.setItem('golfaim101-v2',JSON.stringify({scenario:id,holeSeed:43,seed:812,basicHandicap:'10'})),{id});
 const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));const r={family:id,errors};
 try{await p.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8765');await p.locator('#vegetation').waitFor();assert.match(await p.locator('#holeMeta').innerText(),/tee-v2|approach-v2/);assert.equal(await p.locator('#shotCloud,#idealCloud,#meanFinish').count(),0);
 const geometry=await p.evaluate(async()=>{const {SCENARIOS}=await import('./model.js');const {generateScenario}=await import('./practice.js');const s=JSON.parse(localStorage.getItem('golfaim101-v2'));return JSON.stringify(generateScenario(SCENARIOS.find(b=>b.id===s.scenario),s.holeSeed));});
 await p.locator('#aimX').focus();await p.keyboard.press('ArrowRight');await p.locator('#simulate').tap();await p.locator('#results').waitFor({state:'visible',timeout:60000});assert.equal(await p.locator('#shotCloud circle').count(),500);
 await p.locator('#retryThisHole').tap();assert.equal(await p.locator('#shotCloud,#idealCloud,#meanFinish').count(),0);
 const after=await p.evaluate(async()=>{const {SCENARIOS}=await import('./model.js');const {generateScenario}=await import('./practice.js');const s=JSON.parse(localStorage.getItem('golfaim101-v2'));return JSON.stringify(generateScenario(SCENARIOS.find(b=>b.id===s.scenario),s.holeSeed));});assert.equal(after,geometry);
 await p.locator('#course').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.screenshot({path:`${out}/generated-${id}-phone.png`});r.passed=true;
 }catch(e){r.failure=e.message;}reports.push(r);console.log(JSON.stringify(r));await c.close();
}
fs.writeFileSync(`${out}/mobile-and-generated.json`,JSON.stringify(reports,null,2));await b.close();if(reports.some(r=>r.failure||r.errors.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
