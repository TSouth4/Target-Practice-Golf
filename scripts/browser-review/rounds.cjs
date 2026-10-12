const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs');const out=process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp/target-practice-browser-results';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.TARGET_PRACTICE_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const session=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-round-v1')));
 const pick=async()=>{await page.locator('#aimX').focus();await page.keyboard.press('ArrowRight');await page.locator('#simulate').click();};
 await page.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8765');let r=await session();assert.equal(r.kind,'practice');assert.equal(r.schedule.length,5);
 const firstHole=await page.locator('#holeMeta').innerText();await pick();await page.locator('#results').waitFor({state:'visible',timeout:60000});const first=(await session()).answers[0];
 await page.locator('#retryThisHole').click();await pick();await page.locator('#results').waitFor({state:'visible',timeout:60000});assert.deepEqual((await session()).answers,[first]);
 await page.reload();assert.equal(await page.locator('#holeMeta').innerText(),firstHole);assert.equal((await session()).answers.length,1);await page.locator('#roundContinue').click();
 for(let i=1;i<5;i++){await pick();await page.locator('#results').waitFor({state:'visible',timeout:60000});await page.locator('#tryAgain').click();}
 await page.locator('#roundReport').waitFor({state:'visible'});r=await session();assert.equal(r.status,'complete');assert.equal(r.answers.length,5);await page.screenshot({path:`${out}/learning-round-${width}.png`,fullPage:true});
 const historyBefore=await page.evaluate(()=>localStorage.getItem('target-practice-progress-v1'));
 await page.locator('#menuToggle').click();await page.locator('#assessmentMenu').click();assert.equal(await page.locator('#startAssessment').isVisible(),true);await page.locator('#startAssessment').click();await page.locator('#basicHandicap').selectOption('10');assert.equal((await session()).profile.handicap,'10');if(width===390)await page.locator('#fullscreenToggle').click();
 for(let i=0;i<10;i++){
  await pick();await page.waitForFunction(i=>JSON.parse(localStorage.getItem('target-practice-round-v1')).answers.length===i+1,i,{timeout:60000});
  assert.equal(await page.locator('#results').isVisible(),false);assert.equal(await page.locator('#shotCloud,#idealCloud,#meanFinish,#shotTracers').count(),0);assert.equal(await page.locator('#retryThisHole').isVisible(),false);
  if(i<9){assert.equal(await page.locator('#roundReport').isVisible(),false);if(i===2)await page.reload();await page.locator('#roundContinue').click();}
 }
 await page.locator('#roundReport').waitFor({state:'visible'});if(width===390)await page.waitForFunction(()=>!document.fullscreenElement);r=await session();assert.equal(r.answers.length,10);assert.equal(r.status,'complete');assert.equal(await page.evaluate(()=>localStorage.getItem('target-practice-progress-v1')),historyBefore);
 const average=r.answers.reduce((sum,a)=>sum+a.regret,0)/10;assert.equal(await page.locator('#roundPer100').innerText(),'+'+(average*100).toFixed(1));
 await page.reload();assert.equal(await page.locator('#roundReport').isVisible(),true);assert.equal((await session()).answers.length,10);await page.screenshot({path:`${out}/assessment-report-${width}.png`,fullPage:true});
 await page.locator('#startLearningRound').click();assert.equal((await session()).answers.length,0);assert.equal(await page.locator('#results').isVisible(),false);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({width,passed:true}));await context.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
