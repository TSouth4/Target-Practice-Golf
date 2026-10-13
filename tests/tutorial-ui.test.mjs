import test from 'node:test';
import assert from 'node:assert/strict';
import {setupDOM} from './dom-harness.mjs';
import {createRound,ROUND_KEY} from '../dist/rounds.js';
import {CURRICULUM,LESSON_KEY} from '../dist/curriculum.js';
import {PROGRESS_KEY} from '../dist/progress.js';
const dom=setupDOM({practiceMode:'round'}),$=dom.$;
dom.storage.set(ROUND_KEY,JSON.stringify(createRound('practice',170,{handicap:'20',limit:225})));
await import('../dist/app.js');
const originalRound=JSON.parse(dom.storage.get(ROUND_KEY)),originalState=JSON.parse(dom.storage.get('golfaim101-v2'));
async function choose(x,carry){$('aimY').value=String(carry);await $('aimY').fire('input');$('aimX').value=String(x);await $('aimX').fire('input');}
test('guided lesson teaches costs, requires its target, hides independent hints and preserves paused practice',async()=>{
 await $('lessonsMenu').fire('click');assert.ok(!$('lessonsScreen').hidden);await $('lessonStart1').fire('click');
 assert.match($('tutorialText').textContent,/third shot/);assert.ok($('simulate').disabled);assert.ok(!$('course').innerHTML.includes('lessonTargetHint'));
 await $('tutorialCollapse').fire('click');assert.ok($('tutorialBody').hidden);await $('tutorialCollapse').fire('click');assert.ok(!$('tutorialBody').hidden);
 for(let i=0;i<CURRICULUM[0].intro.length;i++)await $('tutorialNext').fire('click');
 assert.match($('tutorialTitle').textContent,/highlighted/);
 const html=$('course').innerHTML,hint={x:Number(html.match(/data-target-x="([^"]+)/)[1]),carry:Number(html.match(/data-target-carry="([^"]+)/)[1])};
 await choose(-55,70);await $('simulate').fire('click');assert.ok($('results').hidden);assert.ok(!$('course').innerHTML.includes('id="shotCloud"'));
 await choose(hint.x,Math.round(hint.carry));await $('simulate').fire('click');assert.match($('tutorialTitle').textContent,/Success/);assert.ok($('results').hidden);
 assert.equal(dom.storage.get(PROGRESS_KEY),undefined);assert.deepEqual(JSON.parse(dom.storage.get(ROUND_KEY)),originalRound);
 await $('tutorialNext').fire('click');assert.match($('tutorialTitle').textContent,/without a hint/);assert.ok(!$('course').innerHTML.includes('lessonTargetHint'));assert.ok($('results').hidden);
 await choose(16,122);await $('simulate').fire('click');assert.ok(!$('results').hidden);assert.equal(dom.storage.get(PROGRESS_KEY),undefined);
 await $('tutorialNext').fire('click');assert.ok(!$('tutorialRecap').hidden);assert.deepEqual(JSON.parse(dom.storage.get(LESSON_KEY)).completed,['trouble']);await $('tutorialReview').fire('click');assert.ok(!$('results').hidden);assert.ok(!$('decisionLesson').hidden);assert.ok(!$('course').innerHTML.includes('lessonTargetHint'));await $('tutorialNext').fire('click');assert.ok(!$('tutorialRecap').hidden);
 await $('closeLessons').fire('click');assert.deepEqual(JSON.parse(dom.storage.get(ROUND_KEY)),originalRound);const restored=JSON.parse(dom.storage.get('golfaim101-v2'));assert.equal(restored.basicHandicap,originalState.basicHandicap);assert.deepEqual(restored.memberBag,originalState.memberBag);assert.ok($('results').hidden);assert.ok($('tutorialCard').hidden);assert.equal($('practiceRoundMenu').disabled,false);assert.equal($('assessmentMenu').disabled,false);assert.equal($('freePracticeMenu').disabled,false);
 await $('lessonsMenu').fire('click');assert.match($('lessonStatus1').textContent,/Completed/);await $('closeLessons').fire('click');
});
