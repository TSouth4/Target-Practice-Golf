const {chromium}=require(process.env.TARGET_PRACTICE_PLAYWRIGHT||'playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs');
const root=process.env.TARGET_PRACTICE_BASE_URL,output=process.env.TARGET_PRACTICE_REVIEW_OUTPUT||'/tmp';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const [width,height] of [[1440,1000],[390,900],[320,800],[844,390]]){
 const c=await b.newContext({viewport:{width,height},reducedMotion:'reduce',hasTouch:width<500});await c.addInitScript(()=>{if(!localStorage.getItem('golfaim101-v2'))localStorage.setItem('golfaim101-v2',JSON.stringify({scenario:'tucked',holeSeed:17,seed:7142026,practiceMode:'free',basicHandicap:'5',controlsTutorialSeen:true,landscape:'woodland'}));});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(root);await p.locator('#homePractice').click();
 const toggle=async()=>{await p.locator('#menuToggle').click();await p.locator('#graphicsStyleToggle').click();await p.locator('#menuToggle').click();};
 const capture=()=>p.evaluate(()=>({flag:document.querySelector('#courseFlag').outerHTML,contour:document.querySelector('#yourContour')?.outerHTML,cloud:document.querySelector('#shotCloud')?.outerHTML,aim:document.querySelector('[data-course-layer=aim]').innerHTML,storage:{...localStorage},grade:document.getElementById('decisionVerdict').textContent}));
 assert.equal(await p.locator('#course').getAttribute('data-graphics'),'illustrated');assert.ok(await p.locator('.illustrated-plant').count()>0);
 const before=await capture();await toggle();assert.deepEqual(await capture(),before);await toggle();assert.deepEqual(await capture(),before);
 // Every environment keeps its original plant placement and exact projected relief meshes.
 for(const style of ['woodland','coast','mountain','lake','ocean','desert']){
 await p.evaluate(style=>{const s=JSON.parse(localStorage.getItem('golfaim101-v2'));s.landscape=style;localStorage.setItem('golfaim101-v2',JSON.stringify(s));},style);await p.reload();await p.locator('#homePractice').click();
 const plants=await p.locator('#vegetation .landscape-plant').evaluateAll(es=>es.map(e=>[e.getAttribute('transform'),e.dataset.lie]));
 const surfaces=await p.locator('#surfaceRelief polygon,#surfaceRelief [data-relief-mesh]').evaluateAll(es=>es.flatMap(e=>e.tagName==='polygon'?[e.getAttribute('points')]:e.getAttribute('d').split('Z').filter(Boolean).map(t=>t.slice(1).replaceAll('L',' '))));
 await toggle();assert.deepEqual(await p.locator('#vegetation .landscape-plant').evaluateAll(es=>es.map(e=>[e.getAttribute('transform'),e.dataset.lie])),plants);assert.deepEqual(await p.locator('#surfaceRelief polygon,#surfaceRelief [data-relief-mesh]').evaluateAll(es=>es.flatMap(e=>e.tagName==='polygon'?[e.getAttribute('points')]:e.getAttribute('d').split('Z').filter(Boolean).map(t=>t.slice(1).replaceAll('L',' ')))),surfaces);await toggle();
 assert.equal(await p.locator('#vegetation').getAttribute('data-landscape'),style);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await p.locator('#course').screenshot({path:`${output}/integrated-${style}-${width}.png`});
 }
 await p.locator('#fullscreenToggle').click();await p.locator('#aimY').fill('135');await p.locator('#aimY').dispatchEvent('input');await p.locator('#course').screenshot({path:`${output}/integrated-fullscreen-${width}.png`});await p.locator('#fullscreenToggle').click();
 await p.locator('#simulate').click();await p.locator('#results').waitFor({state:'visible',timeout:120000});
 assert.ok(await p.locator('#shotCloud circle').count()>0);const reviewed=await capture();await toggle();assert.deepEqual(await capture(),reviewed);await toggle();assert.deepEqual(await capture(),reviewed);
 await p.locator('#povBtn').click();const eye=await capture();await toggle();assert.deepEqual(await capture(),eye);await toggle();await p.locator('#mapBtn').click();
 await p.locator('#course').screenshot({path:`${output}/integrated-review-${width}.png`});await p.locator('#retryThisHole').click();assert.equal(await p.locator('#course').getAttribute('data-graphics'),'illustrated');
 // Intro/lesson rendering shares the same integrated renderer.
 await p.locator('#menuToggle').click();await p.locator('#lessonsMenu').click();await p.locator('#lessonStart1').click();assert.equal(await p.locator('#course').getAttribute('data-graphics'),'illustrated');assert.equal(await p.locator('#tutorialCard').isVisible(),true);assert.ok(await p.locator('#tutorialIllustration svg').count()>0);await p.locator('#tutorialExit').click();
 assert.deepEqual(errors,[]);console.log('Environments, exact geometry, styles, fullscreen, review, retry and lesson passed',width,height);await c.close();
 }
 // Resume a pre-existing course review; switching art must preserve its selected ball and score.
 const c=await b.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'}),r=JSON.parse(fs.readFileSync(__dirname+'/../../tests/fixtures/course-v2-saved-review.json','utf8'));
 await c.addInitScript(r=>{localStorage.setItem('target-practice-round-v1',JSON.stringify(r));localStorage.setItem('target-practice-course-v1',JSON.stringify(r));},r);const p=await c.newPage();await p.goto(root);await p.locator('#homeContinue').click();const before=await p.evaluate(()=>({...localStorage}));await p.locator('#menuToggle').click();await p.locator('#graphicsStyleToggle').click();assert.deepEqual(await p.evaluate(()=>({...localStorage})),before);assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('target-practice-course-v1')).review.selected),r.review.selected);console.log('Legacy course selected ball and storage preserved');await c.close();
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
