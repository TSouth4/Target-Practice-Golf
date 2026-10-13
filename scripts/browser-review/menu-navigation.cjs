const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const routes=['lessonsMenu','courseMenu','practiceRoundMenu','assessmentMenu','freePracticeMenu','advancedMode','progressMenu','basicMode'];
 for(const width of [1440,390]){const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const origin of ['editor','progress','lessons','lessonExplanation','learning','assessmentIntro','assessment','course','scorecard'])for(const route of routes){
  await page.goto(process.env.TARGET_PRACTICE_BASE_URL);await page.evaluate(()=>localStorage.clear());await page.reload();
  const nav=async id=>{await page.locator('#menuToggle').click();await page.locator('#'+id).click();};
  await nav('freePracticeMenu');
  if(origin==='editor'){await nav('advancedMode');await page.locator('#flightEditor [data-handle="end"]').focus();await page.keyboard.press('ArrowRight');}
  if(origin==='progress')await nav('progressMenu');
  if(origin==='lessons'||origin==='lessonExplanation'){await nav('lessonsMenu');if(origin==='lessonExplanation'){await page.locator('#lessonStart1').click();await page.waitForFunction(()=>!document.getElementById('tutorialNext').disabled);}}
  if(origin==='learning')await nav('practiceRoundMenu');
  if(origin==='assessmentIntro'||origin==='assessment'){await nav('assessmentMenu');if(origin==='assessment')await page.locator('#startAssessment').click();}
  if(origin==='course'||origin==='scorecard'){await nav('courseMenu');if(origin==='scorecard')await page.locator('#courseScorecard').click();}
  await page.locator('#menuToggle').click();for(const id of routes)assert.ok(await page.locator('#'+id).isEnabled(),`${origin}: ${id}`);assert.equal(await page.locator('#useMyShotMenu').count(),0);
  await page.locator('#'+route).click();const destination=route==='advancedMode'?'shotEditor':route==='progressMenu'?'progressScreen':route==='lessonsMenu'?'lessonsScreen':route==='assessmentMenu'?'roundScreen':'practiceScreen';assert.ok(await page.locator('#'+destination).isVisible(),`${origin} → ${route}`);
  for(const id of ['shotEditor','progressScreen','lessonsScreen','roundScreen','practiceScreen'])if(id!==destination)assert.equal(await page.locator('#'+id).isVisible(),false,`${origin} → ${route}: stale ${id}`);
  if(origin==='editor')assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')).memberBag.every(c=>c.curve===0)));
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({width,origins:9,routes:8,passed:true}));await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
