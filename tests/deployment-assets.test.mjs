import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {setupDOM} from './dom-harness.mjs';
const dist=new URL('../dist/',import.meta.url),html=readFileSync(new URL('index.html',dist),'utf8');
const release=html.match(/src="releases\/([a-f0-9]+)\/boot.js"/)[1];
test('deployed HTML references one complete content-hashed module and stylesheet release',()=>{
 assert.ok(html.includes(`href="releases/${release}/styles.css"`));
 const names=readdirSync(dist).filter(n=>n.endsWith('.js')||n==='styles.css').sort(),hash=createHash('sha256');
 for(const name of names){const source=readFileSync(new URL(name,dist));hash.update(name+'\0');hash.update(source);const copy=readFileSync(new URL(`releases/${release}/${name}`,dist));assert.deepEqual(copy,source);for(const ref of [...copy.toString().matchAll(/(?:from\s*|import\()['"]\.\/([^'"]+)['"]/g)])assert.ok(names.includes(ref[1]),name+' missing '+ref[1]);}
 assert.equal(release,hash.digest('hex').slice(0,16));assert.ok(names.includes('tee-generator.js'));
});
test('startup loader surfaces import/render failures and offers a cache-busting reload without clearing storage',async()=>{
 const panel={hidden:true},detail={},button={},course={innerHTML:''},nodes={startupError:panel,startupErrorDetail:detail,reloadGame:button,course},location={href:'https://example.test/?x=1',replace(v){this.replaced=v;}};
 const source=readFileSync(new URL('boot.js',dist),'utf8').replace('export async function','async function').replace('\nawait startGame();','');
 const ctx=vm.createContext({document:{getElementById:id=>nodes[id]},console:{error(){}},location,URL,Date});vm.runInContext(source+'\nglobalThis.testStart=startGame;',ctx);
 await ctx.testStart(async()=>{throw Error('Missing tee-generator.js');});assert.equal(panel.hidden,false);assert.equal(detail.textContent,'Missing tee-generator.js');button.onclick();assert.ok(location.replaced.includes('reload='));assert.ok(location.replaced.includes('x=1'));
 await ctx.testStart(async()=>{});assert.equal(detail.textContent,'The course did not finish rendering.');
 course.innerHTML='<g id="surfaceRelief"></g>';await ctx.testStart(async()=>{});assert.equal(panel.hidden,true);
});
const dom=setupDOM(),$=dom.$;dom.storage.set('golfaim101-v2',JSON.stringify({practiceMode:'free',scenario:'bend',holeSeed:17,basicHandicap:'5',seed:411}));
await import(new URL(`releases/${release}/boot.js`,dist));
test('the packaged module graph visibly builds a generated course and completes Commit and Retry',async()=>{
 assert.ok($('startupError').hidden);assert.ok($('course').innerHTML.includes('id="surfaceRelief"'));assert.ok($('course').innerHTML.includes('id="vegetation"'));assert.ok($('results').hidden);
 $('aimX').value='0';await $('aimX').fire('input');await $('simulate').fire('click');assert.ok(!$('results').hidden);assert.ok($('course').innerHTML.includes('id="shotCloud"'));const before=JSON.parse(dom.storage.get('golfaim101-v2'));
 await $('retryThisHole').fire('click');assert.ok($('results').hidden);assert.ok(!$('course').innerHTML.includes('id="shotCloud"'));assert.ok($('course').innerHTML.includes('id="surfaceRelief"'));const after=JSON.parse(dom.storage.get('golfaim101-v2'));assert.equal(after.holeSeed,before.holeSeed);assert.equal(after.seed,before.seed);$('aimX').value='5';await $('aimX').fire('input');await $('simulate').fire('click');assert.ok(!$('retryComparison').hidden);
});
test('packaged tee and approach flows render, reveal, retry and advance without missing modules',async()=>{
 if(!$('results').hidden)await $('tryAgain').fire('click');
 for(const filter of ['teeTab','approachTab']){
  await $(filter).fire('click');
  assert.ok($('course').innerHTML.includes('id="surfaceRelief"'));
  assert.ok($('results').hidden);
  const original=JSON.parse(dom.storage.get('golfaim101-v2'));
  $('aimX').value='0';await $('aimX').fire('input');await $('simulate').fire('click');
  assert.ok(!$('results').hidden);assert.ok($('course').innerHTML.includes('id="shotCloud"'));
  await $('retryThisHole').fire('click');
  assert.ok($('results').hidden);assert.ok(!$('course').innerHTML.includes('id="shotCloud"'));
  assert.equal(JSON.parse(dom.storage.get('golfaim101-v2')).holeSeed,original.holeSeed);
  $('aimX').value='5';await $('aimX').fire('input');await $('simulate').fire('click');
  assert.ok(!$('results').hidden);
  await $('tryAgain').fire('click');
  const next=JSON.parse(dom.storage.get('golfaim101-v2'));
  assert.notEqual(next.holeSeed,original.holeSeed);assert.ok($('results').hidden);
  assert.ok($('course').innerHTML.includes('id="surfaceRelief"'));
 }
});
test('packaged fullscreen fallback retains target, hides answers, toggles feedback and exits',async()=>{
 $('course').getBoundingClientRect=()=>({width:390,height:700});
 assert.ok(!dom.elements.has('scoutMap'));assert.ok(!dom.elements.has('radarToggle'));
 const before=JSON.parse(dom.storage.get('golfaim101-v2'));
 await $('fullscreenToggle').fire('click');
 assert.equal($('fullscreenToggle').attrs['aria-pressed'],true);
 assert.ok($('results').hidden);assert.ok(!$('course').innerHTML.includes('id="shotCloud"'));
 assert.deepEqual(JSON.parse(dom.storage.get('golfaim101-v2')).aim,before.aim);
 $('aimX').value='0';await $('aimX').fire('input');await $('simulate').fire('click');
 assert.ok(!$('results').hidden);assert.ok(!$('feedbackToggle').hidden);
 const committed=JSON.parse(dom.storage.get('golfaim101-v2'));
 await $('feedbackToggle').fire('click');assert.equal($('feedbackToggle').attrs['aria-expanded'],false);
 await $('feedbackToggle').fire('click');assert.equal($('feedbackToggle').attrs['aria-expanded'],true);
 assert.deepEqual(JSON.parse(dom.storage.get('golfaim101-v2')).aim,committed.aim);
 await $('retryThisHole').fire('click');assert.ok($('results').hidden);
 assert.equal($('fullscreenToggle').attrs['aria-pressed'],true);
 await $('fullscreenToggle').fire('click');assert.equal($('fullscreenToggle').attrs['aria-pressed'],false);
 assert.ok($('course').innerHTML.includes('id="surfaceRelief"'));
});
