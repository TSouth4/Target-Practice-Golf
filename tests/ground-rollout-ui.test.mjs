import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {setupDOM} from './dom-harness.mjs';import {createRound,ROUND_KEY} from '../dist/rounds.js';import {COURSE_KEY} from '../dist/course.js';import {MODEL_VERSION,PROGRESS_KEY} from '../dist/progress.js';import {LEGACY_ROLLOUT,SURFACE_ROLLOUT} from '../dist/conditions.js';
const stored=d=>JSON.parse(d.storage.get('golfaim101-v2'));
test('paused earlier learning and assessment rounds keep original rules without creating current-model history',async()=>{
 for(const kind of ['practice','assessment']){
 const d=setupDOM(),r=createRound(kind,411,{handicap:'5',limit:265});r.decisionModel='decision-model-v7';d.storage.set(ROUND_KEY,JSON.stringify(r));await import('../dist/app.js?old-ground-'+kind);await d.$('homeContinue').fire('click');assert.equal(stored(d).pattern.rolloutRules,LEGACY_ROLLOUT);assert.match(d.$('roundStatus').textContent,/Earlier model/);
 d.$('aimX').value='5';await d.$('aimX').fire('input');await d.$('simulate').fire('click');const after=JSON.parse(d.storage.get(ROUND_KEY));assert.equal(after.decisionModel,'decision-model-v7');assert.deepEqual(after.schedule,r.schedule.map((slot,i)=>i===0?{...slot,landscape:after.schedule[0].landscape}:slot));assert.equal(after.answers.length,1);assert.equal(d.storage.has(PROGRESS_KEY),false);
 await d.$('freePracticeMenu').fire('click');assert.equal(stored(d).pattern.rolloutRules,SURFACE_ROLLOUT);assert.equal(JSON.parse(d.storage.get(ROUND_KEY)),null);
 }
});
test('saved course review preserves the exact selected ball, attempts and finish, and continues under its earlier rules',async()=>{
 const d=setupDOM(),r=JSON.parse(readFileSync(new URL('fixtures/course-v2-saved-review.json',import.meta.url)));d.storage.set(ROUND_KEY,JSON.stringify(r));d.storage.set(COURSE_KEY,JSON.stringify(r));await import('../dist/app.js?old-ground-course');await d.$('homeContinue').fire('click');assert.deepEqual(JSON.parse(d.storage.get(COURSE_KEY)).review,r.review);assert.equal(stored(d).pattern.rolloutRules,LEGACY_ROLLOUT);assert.match(d.$('courseStatus').textContent,/Earlier model/);await d.$('courseNext').fire('click');assert.equal(stored(d).pattern.rolloutRules,LEGACY_ROLLOUT);assert.equal(JSON.parse(d.storage.get(ROUND_KEY)).index,1);
});
test('new learning rounds use current rules and model and keep those settings after reload',async()=>{
 const d=setupDOM({practiceMode:'round'});await import('../dist/app.js?new-ground-round');const r=JSON.parse(d.storage.get(ROUND_KEY));assert.equal(r.decisionModel,MODEL_VERSION);assert.equal(stored(d).pattern.rolloutRules,SURFACE_ROLLOUT);
 const reload=setupDOM();for(const [key,value]of d.storage)reload.storage.set(key,value);await import('../dist/app.js?new-ground-resume');assert.equal(stored(reload).pattern.rolloutRules,SURFACE_ROLLOUT);assert.deepEqual(JSON.parse(reload.storage.get(ROUND_KEY)).schedule,r.schedule);
});
