const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');
const fs=require('fs');
const assert=require('node:assert/strict');
const out=process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp/target-practice-browser-results';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.TARGET_PRACTICE_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const reports=[];
 for(const profile of [{name:'desktop',width:1440,height:1000,mobile:false},{name:'phone',width:390,height:844,mobile:true},{name:'small-phone',width:320,height:740,mobile:true}]){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},isMobile:profile.mobile,hasTouch:profile.mobile,reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const report={profile,checks:[],errors};
  const check=async(name,fn)=>{try{await fn();report.checks.push({name,passed:true});}catch(e){report.checks.push({name,passed:false,error:e.message});throw e;}};
  const hiddenAnswers=async()=>{assert.equal(await page.locator('#shotCloud,#idealCloud,#meanFinish,#yourContour,#idealContour').count(),0);assert.equal(await page.locator('#results').isVisible(),false);};
  const activate=async(id)=>{const el=page.locator(id);await el.scrollIntoViewIfNeeded();if(profile.mobile)await el.tap();else await el.click();};
  const selectAim=async()=>{const el=page.locator('#course');await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));const b=await el.boundingBox();if(profile.mobile)await page.touchscreen.tap(b.x+b.width*.52,b.y+b.height*.65);else await page.mouse.click(b.x+b.width*.52,b.y+b.height*.65);};
  const review=async()=>{await activate('#simulate');await page.locator('#results').waitFor({state:'visible',timeout:60000});assert.equal(await page.locator('#shotCloud circle').count(),500);assert.equal(await page.locator('#idealCloud circle').count(),250);};
  try{
   await page.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8765');await page.locator('#vegetation').waitFor();
   await check('answers hidden on opening; commit requires a target',async()=>{await hiddenAnswers();assert.equal(await page.locator('#simulate').isDisabled(),true);});
   await page.screenshot({path:`${out}/${profile.name}-choose.png`,fullPage:true});
   report.initialLayout=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,smallControls:[...document.querySelectorAll('button,select,input')].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').map(e=>({id:e.id,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(e=>e.w<24||e.h<24)}));
   await check('real pointer selection and zoom keep answers hidden',async()=>{await selectAim();assert.equal(await page.locator('#aimMarker').count(),1);await activate('#aimZoomToggle');await hiddenAnswers();await activate('#aimZoomToggle');});
   await check('commit reveals scored shot patterns',review);
   await page.screenshot({path:`${out}/${profile.name}-results.png`,fullPage:true});
   await check('committed target cannot change through course clicks',async()=>{const before=await page.locator('#aimMarker').getAttribute('transform');await selectAim();assert.equal(await page.locator('#aimMarker').getAttribute('transform'),before);});
   await check('lesson opens; progress contains completed first attempt',async()=>{await activate('#decisionVerdict');assert.equal(await page.locator('#decisionLesson').isVisible(),true);await activate('#progressResult');assert.equal(await page.locator('#progressCount').innerText(),'1');await activate('#closeProgress');assert.equal(await page.locator('#results').isVisible(),true);});
   await check('retry hides answers and compares same hole and sample',async()=>{const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')));await activate('#retryThisHole');await hiddenAnswers();assert.equal(await page.locator('#simulate').isDisabled(),true);await selectAim();await review();assert.equal(await page.locator('#retryComparison').isVisible(),true);const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')));assert.equal(after.seed,state.seed);assert.equal(after.holeSeed,state.holeSeed);assert.equal(after.encounter,state.encounter);});
   await check('Next shot clears answers and starts a new encounter',async()=>{const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')));await activate('#tryAgain');await hiddenAnswers();const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')));assert.notEqual(after.encounter,before.encounter);assert.notEqual(after.scenario,before.scenario);});
   await check('custom club cancel preserves settings; save persists them',async()=>{await activate('#menuToggle');await activate('#advancedMode');await page.locator('#carry').fill('240');await activate('#cancelEditor');await activate('#menuToggle');await activate('#advancedMode');assert.notEqual(await page.locator('#carry').inputValue(),'240');await page.locator('#carry').fill('240');await activate('#saveEditor');await hiddenAnswers();await page.reload();await page.locator('#vegetation').waitFor();await hiddenAnswers();await activate('#menuToggle');await activate('#advancedMode');assert.equal(await page.locator('#carry').inputValue(),'240');await page.screenshot({path:`${out}/${profile.name}-editor.png`,fullPage:true});await activate('#cancelEditor');});
   await check('keyboard slider chooses target without revealing answers',async()=>{await page.locator('#aimX').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#simulate').isEnabled(),true);await hiddenAnswers();});
   report.finalLayout=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
  }catch(e){report.failure=e.message;}
  reports.push(report);fs.writeFileSync(`${out}/results.json`,JSON.stringify(reports,null,2));console.log(JSON.stringify(report));await context.close();
 }
 await browser.close();
 if(reports.some(r=>r.failure||r.errors.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
