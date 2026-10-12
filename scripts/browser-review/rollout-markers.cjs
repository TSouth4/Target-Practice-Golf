const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.addInitScript(()=>{if(!localStorage.getItem('golfaim101-v2'))localStorage.setItem('golfaim101-v2',JSON.stringify({practiceMode:'free',scenario:'cedar',basicHandicap:'5',holeSeed:43}));});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8774');assert.equal(await page.locator('#plannedRollout').count(),0);
  await page.locator('#aimY').evaluate(e=>{e.value=250;e.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.locator('#plannedRollout').count(),1);assert.equal(Number(await page.locator('#plannedRollout').getAttribute('data-carry-y')),250);assert.equal(Number(await page.locator('#plannedRollout').getAttribute('data-finish-y')),265);
  assert.equal(await page.locator('#meanFinish').count(),0);assert.equal(await page.locator('#yourContour').count(),0);
  await page.locator('#aimZoomToggle').click();await page.screenshot({path:`${process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp'}/rollout-planning-${width}.png`});
  await page.locator('#fullscreenToggle').click();await page.screenshot({path:`${process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp'}/rollout-fullscreen-${width}.png`});await page.locator('#fullscreenToggle').click();
  await page.locator('#simulate').click();await page.locator('#results').waitFor({state:'visible',timeout:60000});
  assert.equal(await page.locator('#plannedRollout').count(),0);assert.equal(await page.locator('#meanFinish').count(),1);assert.equal(await page.locator('#centerLanding').count(),1);assert.match(await page.locator('#rolloutKey').innerText(),/Landing.*Finish/);
  await page.locator('#course').screenshot({path:`${process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp'}/rollout-review-${width}.png`});
  await page.locator('#retryThisHole').click();assert.equal(await page.locator('#meanFinish').count(),0);assert.equal(await page.locator('#plannedRollout').count(),0);
  await page.locator('#approachTab').click();await page.locator('#aimY').evaluate(e=>{e.value=130;e.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await page.locator('#plannedRollout').count(),0);assert.equal(await page.locator('#rolloutKey').innerText(),'Carry = total');
  await page.evaluate(()=>{localStorage.removeItem('target-practice-round-v1');localStorage.setItem('golfaim101-v2',JSON.stringify({practiceMode:'free',scenario:'cedar',basicHandicap:'5',holeSeed:0}));});await page.reload();
  await page.locator('#aimX').evaluate(e=>{e.value=-50;e.dispatchEvent(new Event('input',{bubbles:true}));});
  const chosen=await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')));
  await page.locator('#simulate').click();await page.locator('#results').waitFor({state:'visible',timeout:60000});
  const finish=await page.locator('#meanFinish').evaluate(e=>({x:Number(e.dataset.worldX),y:Number(e.dataset.worldY)}));
  assert.ok(Math.hypot(finish.x-chosen.aim.x,finish.y-chosen.aim.y)<1e-6,'water landing stops the center flight at its actual landing');
  assert.equal(await page.locator('#rolloutKey').innerText(),'Land = finish');assert.equal(await page.locator('#centerLanding').count(),0);
  assert.match(await page.locator('#coachNote').innerText(),/water contact stops the roll/);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({width,passed:true}));await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
