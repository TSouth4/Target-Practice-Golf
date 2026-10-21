const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs');
const output=process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp/foreground-review';fs.mkdirSync(output,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const [width,height] of [[390,844],[320,740],[844,390]])for(const style of ['woodland','coast','mountain','lake','ocean','desert']){
 const c=await b.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});await c.addInitScript(style=>{localStorage.setItem('golfaim101-v2',JSON.stringify({scenario:'cedar',holeSeed:711,landscape:style,practiceMode:'free'}));Element.prototype.requestFullscreen=()=>Promise.reject(new Error('test fallback'));},style);
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.TARGET_PRACTICE_BASE_URL);await p.locator('#homePractice').click();const saved=await p.evaluate(()=>({...localStorage}));await p.locator('#fullscreenToggle').click();
 const foreground=await p.locator('#courseForeground').evaluate(e=>({y:Number(e.getAttribute('y')),fill:e.getAttribute('fill'),pointer:getComputedStyle(e).pointerEvents}));
 const expected=await p.evaluate(async()=>{const {EYE_CAMERA,projectEye}=await import('/camera.js');const stop=document.querySelector('#fairway stop:last-child');return{y:projectEye({x:0,y:0},0).y,fill:stop.getAttribute('stop-color')};});assert.equal(foreground.y,expected.y);assert.equal(foreground.fill,expected.fill);assert.equal(foreground.pointer,'none');
 // The scenery behind the ball cannot silently become an aimable part of the hole.
 if(width<height){await p.mouse.click(width*.17,height*.83);assert.equal(await p.locator('#simulate').isDisabled(),true);assert.deepEqual(await p.evaluate(()=>({...localStorage})),saved);}
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await p.screenshot({path:`${output}/foreground-${style}-${width}.png`});
 // Both graphics styles and flat/elevated views must keep the same near-ground surface.
 await p.locator('#fullscreenToggle').click();await p.locator('#terrainToggle').click();assert.equal(Number(await p.locator('#courseForeground').getAttribute('y')),expected.y);
 await p.locator('#menuToggle').click();await p.locator('#graphicsStyleToggle').click();assert.equal(await p.locator('#courseForeground').getAttribute('fill'),await p.locator('#fairway stop').last().getAttribute('stop-color'));await p.locator('#menuToggle').click();
 await p.locator('#fullscreenToggle').click();await p.setViewportSize({width:height,height:width});assert.equal(await p.locator('#fullscreenToggle').getAttribute('aria-pressed'),'true');assert.ok(await p.locator('#courseForeground').count());assert.deepEqual(errors,[]);console.log('Near grass, ignored behind-ball taps, both art/view styles and rotation passed',style,width,height);await c.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
