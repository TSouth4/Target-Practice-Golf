import test from 'node:test';import assert from 'node:assert/strict';import {setupDOM} from './dom-harness.mjs';
import {ROUND_KEY} from '../dist/rounds.js';import {PROGRESS_KEY} from '../dist/progress.js';
let dom=setupDOM({practiceMode:'round'}),$=dom.$;await import('../dist/app.js?rounds-flow');
const session=()=>JSON.parse(dom.storage.get(ROUND_KEY));
async function commit(x=0){$('aimX').value=String(x);await $('aimX').fire('input');await $('simulate').fire('click');}
test('five-shot learning round supports retry without replacing the original recap and resumes after reload',async()=>{
 assert.equal(session().schedule.length,5);
 await commit();const first=session().answers[0];await $('retryThisHole').fire('click');await commit(10);
 assert.equal(session().answers.length,1);assert.deepEqual(session().answers[0],first);
 await $('tryAgain').fire('click');assert.equal(session().index,1);
 const old=dom;dom=setupDOM();$=dom.$;for(const [key,value]of old.storage)dom.storage.set(key,value);await import('../dist/app.js?rounds-resume');assert.equal(session().index,1);assert.equal(session().answers.length,1);
 for(let i=1;i<5;i++){await commit();await $('tryAgain').fire('click');}
 assert.equal(session().status,'complete');assert.equal(session().answers.length,5);assert.ok(!$('roundReport').hidden);assert.ok($('practiceScreen').hidden);
});
test('assessment withholds every individual result and retry until the ten-shot aggregate report',async()=>{
 const historyBefore=dom.storage.get(PROGRESS_KEY);await $('assessmentMenu').fire('click');assert.ok(!$('startAssessment').hidden);await $('startAssessment').fire('click');
 for(let i=0;i<10;i++){
  await commit();assert.ok($('results').hidden);assert.ok($('retryThisHole').hidden);assert.ok(!$('course').innerHTML.includes('id="shotCloud"'));assert.ok(!$('course').innerHTML.includes('id="idealCloud"'));assert.equal(session().answers.length,i+1);
  if(i<9){assert.ok($('roundReport').hidden);await $('roundContinue').fire('click');}
 }
 assert.equal(session().status,'complete');assert.ok(!$('roundReport').hidden);assert.ok($('practiceScreen').hidden);assert.equal(dom.storage.get(PROGRESS_KEY),historyBefore);assert.match($('roundLimits').textContent,/not measured real-world/);
});
