import test from 'node:test';
import assert from 'node:assert/strict';
import {setupDOM} from './dom-harness.mjs';
import {SCENARIOS,basicPattern} from '../dist/model.js';
import {defaultMemberBag} from '../dist/shot-editor.js';
import {PROGRESS_KEY} from '../dist/progress.js';
// Synthetic geometry deliberately leaves no reachable target inside the stakes.
const dom=setupDOM(),$=dom.$,original=SCENARIOS[0].bounds,originalHazards=SCENARIOS[0].hazards;
const bag=defaultMemberBag(basicPattern(5,SCENARIOS[0])).map(c=>({...c,sdSide:0,sdLong:0,bigPct:0}));
SCENARIOS[0].bounds=[75,85];
SCENARIOS[0].hazards=[];
dom.storage.set('golfaim101-v2',JSON.stringify({practiceMode:'free',scenario:'cedar',memberBag:bag}));
await import('../dist/app.js');
test('a run with no usable comparison is ungraded and does not pollute progress history',async()=>{
 try{await $('advancedMode').fire('click');await $('saveEditor').fire('click');$('aimX').value='0';await $('aimX').fire('input');await $('simulate').fire('click');assert.ok(!$('results').hidden);assert.equal($('scoreValue').textContent,'—');assert.equal($('decisionVerdict').textContent,'Pattern needs adjustment');assert.equal(dom.storage.get(PROGRESS_KEY),undefined);assert.match($('progressSaved').textContent,/no usable target comparison/);await $('decisionVerdict').fire('click');assert.match($('lessonWhy').textContent,/no usable comparison/);}finally{SCENARIOS[0].bounds=original;SCENARIOS[0].hazards=originalHazards;}
});
