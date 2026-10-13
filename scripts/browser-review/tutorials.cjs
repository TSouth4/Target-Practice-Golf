const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict');
(async()=>{const {CURRICULUM}=await import('../../dist/curriculum.js');const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.addInitScript(()=>{if(!localStorage.getItem('golfaim101-v2'))localStorage.setItem('golfaim101-v2',JSON.stringify({practiceMode:'round',scenario:'cedar',basicHandicap:'20'}));});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8775');
  const original=await page.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-round-v1')));
  await page.locator('#menuToggle').click();await page.locator('#lessonsMenu').click();
  for(let i=0;i<CURRICULUM.length;i++){
   await page.locator('#lessonStart'+(i+1)).click();await page.waitForFunction(()=>!document.getElementById('tutorialNext').disabled);
   if(i===0){assert.match(await page.locator('#tutorialText').innerText(),/third shot/);assert.equal(await page.locator('#lessonTargetHint').count(),0);await page.locator('#tutorialCollapse').click();assert.equal(await page.locator('#tutorialBody').isVisible(),false);await page.locator('#tutorialCollapse').click();}
   for(let j=0;j<CURRICULUM[i].intro.length;j++)await page.locator('#tutorialNext').click();
   const hint=await page.locator('#lessonTargetHint').evaluate(e=>({x:Number(e.dataset.targetX),carry:Number(e.dataset.targetCarry)}));
   assert.equal(await page.locator('#yourContour').count(),0);
   await page.screenshot({path:`${process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp'}/lesson-guided-${i+1}-${width}.png`});
   if(i===0){await page.locator('#aimX').evaluate(e=>{e.value=-55;e.dispatchEvent(new Event('input',{bubbles:true}));});await page.locator('#simulate').click();assert.equal(await page.locator('#shotCloud').count(),0);}
   for(const [id,value] of [['aimY',Math.round(hint.carry)],['aimX',hint.x]])await page.locator('#'+id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},value);
   await page.locator('#simulate').click();await page.waitForFunction(()=>document.getElementById('tutorialTitle').textContent.startsWith('Success'));
   assert.equal(await page.locator('#results').isVisible(),false);if(i===3)assert.match(await page.locator('#tutorialMessage').innerText(),/Bunker exposure/);
   await page.locator('#tryAgain').click();await page.waitForFunction(()=>!document.getElementById('aimX').disabled);
   assert.equal(await page.locator('#lessonTargetHint').count(),0);assert.equal(await page.locator('#idealCloud').count(),0);
   await page.locator('#aimX').evaluate(e=>{e.value=2;e.dispatchEvent(new Event('input',{bubbles:true}));});
   await page.locator('#simulate').click();await page.locator('#results').waitFor({state:'visible',timeout:60000});
   await page.locator('#tryAgain').click();await page.locator('#tutorialRecap').waitFor({state:'visible'});assert.match(await page.locator('#tutorialRecapTitle').innerText(),/Lesson complete/);
   await page.locator('#tutorialReview').click();assert.equal(await page.locator('#decisionLesson').isVisible(),true);await page.locator('#tryAgain').click();
   const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-lessons-v1')));assert.ok(progress.completed.includes(CURRICULUM[i].id));
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-round-v1'))),original);
   assert.equal(await page.evaluate(()=>localStorage.getItem('target-practice-progress-v1')),null);
   await page.locator('#tutorialCatalog').click();
  }
  await page.locator('#closeLessons').click();assert.equal(await page.locator('#basicHandicap').inputValue(),'20');assert.equal(await page.locator('#results').isVisible(),false);
  await page.locator('#aimX').evaluate(e=>{e.value=2;e.dispatchEvent(new Event('input',{bubbles:true}));});await page.locator('#simulate').click();await page.locator('#results').waitFor({state:'visible',timeout:60000});
  const previousCost=await page.locator('#expectedValue').innerText(),previousSaved=await page.locator('#progressSaved').innerText(),previousHistory=await page.evaluate(()=>localStorage.getItem('target-practice-progress-v1'));
  await page.locator('#menuToggle').click();await page.locator('#lessonsMenu').click();await page.locator('#lessonStart2').click();await page.waitForFunction(()=>!document.getElementById('tutorialNext').disabled);await page.locator('#tutorialExit').click();await page.locator('#closeLessons').click();
  assert.equal(await page.locator('#results').isVisible(),true);assert.equal(await page.locator('#expectedValue').innerText(),previousCost);assert.equal(await page.locator('#progressSaved').innerText(),previousSaved);assert.equal(await page.evaluate(()=>localStorage.getItem('target-practice-progress-v1')),previousHistory);
  await page.reload();await page.locator('#menuToggle').click();await page.locator('#lessonsMenu').click();for(let i=1;i<=4;i++)assert.match(await page.locator('#lessonStatus'+i).innerText(),/Completed/);
  await page.screenshot({path:`${process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp'}/lesson-catalog-${width}.png`});assert.deepEqual(errors,[]);console.log(JSON.stringify({width,passed:true}));await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
