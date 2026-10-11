const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs');
const out=process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp/target-practice-browser-results';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.TARGET_PRACTICE_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 try{for(const [width,height,fallback] of [[1440,1000,false],[390,844,true],[320,740,true],[844,390,true]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:fallback,reducedMotion:'reduce'});
  if(fallback)await context.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('Unavailable'));});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TARGET_PRACTICE_BASE_URL||'http://127.0.0.1:8765');
  await page.locator('#aimX').focus();await page.keyboard.press('ArrowRight');
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')));
  await page.locator('#fullscreenToggle').click();assert.equal(await page.locator('#fullscreenToggle').getAttribute('aria-pressed'),'true');
  if(!fallback)assert.equal(await page.evaluate(()=>!!document.fullscreenElement),true);
  const course=await page.locator('.course-viewport').boundingBox();assert.deepEqual(course,{x:0,y:0,width,height});
  assert.equal(await page.locator('#shotCloud circle').count(),0);
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('golfaim101-v2')));assert.deepEqual(after,before);
  await page.locator('#radarToggle').click();assert.equal(await page.locator('#scoutMap').isVisible(),false);await page.locator('#radarToggle').click();
  const depth=await page.locator('#aimY').inputValue();await page.locator('#aimY').focus();await page.keyboard.press('ArrowDown');assert.notEqual(await page.locator('#aimY').inputValue(),depth);
  const map=await page.locator('#scoutMap').boundingBox();await page.mouse.click(map.x+map.width*.5,map.y+map.height*.6);assert.equal(await page.locator('#shotCloud circle').count(),0);
  await page.screenshot({path:`${out}/fullscreen-choose-${width}.png`});
  await page.locator('#simulate').click();await page.locator('#results').waitFor({state:'visible',timeout:60000});
  assert.equal(await page.locator('#shotCloud circle').count(),500);assert.equal(await page.locator('#aimY').isDisabled(),true);
  const feedback=await page.locator('#results').boundingBox();assert.ok(feedback.y>=0&&feedback.y+feedback.height<=height);
  await page.locator('#feedbackToggle').click();assert.equal(await page.locator('#results').isVisible(),false);assert.equal(await page.locator('#shotCloud circle').count(),500);
  await page.locator('#feedbackToggle').click();assert.equal(await page.locator('#results').isVisible(),true);
  await page.screenshot({path:`${out}/fullscreen-review-${width}.png`});
  await page.locator('#retryThisHole').click();assert.equal(await page.locator('#results').isVisible(),false);assert.equal(await page.locator('#shotCloud circle').count(),0);assert.equal(await page.locator('#scoutMap').isVisible(),true);
  if(width===1440){await page.locator('#aimX').focus();await page.keyboard.press('ArrowRight');await page.locator('#simulate').click();await page.locator('#results').waitFor({state:'visible',timeout:60000});await page.locator('#tryAgain').click();assert.equal(await page.locator('#shotCloud circle').count(),0);assert.equal(await page.locator('#fullscreenToggle').getAttribute('aria-pressed'),'true');}
  await page.setViewportSize({width:height,height:width});assert.equal(await page.locator('#fullscreenToggle').getAttribute('aria-pressed'),'true');
  if(width===844)await page.locator('#fullscreenToggle').click();else await page.keyboard.press('Escape');assert.equal(await page.locator('#fullscreenToggle').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#basicBar').isVisible(),true);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({width,height,fallback,passed:true}));await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
