const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.addInitScript(()=>localStorage.setItem('golfaim101-v2',JSON.stringify({practiceMode:'free',scenario:'water',basicHandicap:'20',holeSeed:578})));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8772');
  for(const [id,value] of [['aimX',20],['aimY',149]])await page.locator('#'+id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},value);
  await page.locator('#simulate').click();await page.locator('#results').waitFor({state:'visible',timeout:60000});
  await page.locator('#decisionVerdict').click();assert.equal(await page.locator('#decisionLesson').isVisible(),true);
  assert.match(await page.locator('#lessonWhy').innerText(),/strokes per decision/);
  assert.match(await page.locator('#coachNote').innerText(),/per 100 similar decisions/);
  for(const label of ['Current shot','Next-shot / putting cost','Bunker recovery cost','Water penalty / recovery cost','OB penalty / repeat cost'])assert.ok((await page.locator('#lessonRows').innerText()).includes(label));
  assert.doesNotMatch(await page.locator('#lessonRows').innerText(),/NaN|undefined/);
  await page.locator('#decisionLesson').screenshot({path:`${process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp'}/tradeoff-${width}.png`});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({width,passed:true}));await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
