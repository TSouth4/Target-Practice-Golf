const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const ids=['practiceRoundMenu','assessmentMenu','freePracticeMenu','advancedMode','basicMode','progressMenu'];
 for(const width of [1440,390])for(const stage of ['catalog','explanation']){
  for(const id of ids){const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await context.addInitScript(()=>localStorage.setItem('golfaim101-v2',JSON.stringify({practiceMode:'free',scenario:'cedar',basicHandicap:'20'})));const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8776');
   if(stage==='catalog'){await page.locator('#menuToggle').click();await page.locator('#assessmentMenu').click();await page.locator('#startAssessment').click();}
   await page.locator('#menuToggle').click();await page.locator('#lessonsMenu').click();
   if(stage==='explanation'){await page.locator('#lessonStart1').click();await page.waitForFunction(()=>!document.getElementById('tutorialNext').disabled);}
   await page.locator('#menuToggle').click();for(const item of ids)assert.equal(await page.locator('#'+item).isEnabled(),true,item+' '+stage);await page.locator('#'+id).click();
   assert.equal(await page.locator('#lessonsScreen').isVisible(),false);assert.equal(await page.locator('#tutorialCard').isVisible(),false);assert.equal(await page.locator('#appRoot').evaluate(e=>e.classList.contains('tutorial-mode')),false);
   if(id==='practiceRoundMenu')assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-round-v1')).kind),'practice');
   if(id==='assessmentMenu'){assert.equal(await page.locator('#startAssessment').isVisible(),true);await page.locator('#startAssessment').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-round-v1')).kind),'assessment');}
   if(id==='advancedMode'){assert.equal(await page.locator('#shotEditor').isVisible(),true);await page.locator('#saveEditor').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')).mode),'advanced');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-round-v1'))),null);}
   if(id==='basicMode'||id==='freePracticeMenu'){assert.equal(await page.locator('#practiceScreen').isVisible(),true);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-round-v1'))),null);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')).practiceMode),'free');}
   if(id==='progressMenu')assert.equal(await page.locator('#progressScreen').isVisible(),true);
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')).basicHandicap),'20');assert.deepEqual(errors,[]);await context.close();
  }
  console.log(JSON.stringify({width,stage,menuRoutes:ids.length,passed:true}));
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
