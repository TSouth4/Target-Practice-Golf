import test from 'node:test';
import assert from 'node:assert/strict';
import {setupDOM} from './dom-harness.mjs';
const dom=setupDOM(),$=dom.$;
await import('../dist/app.js');
test('an all-OB selected custom target is penalized and a better sampled strategy is shown',async()=>{
 await $('advancedMode').fire('click');$('club').value='Driver';await $('club').fire('change');
 for(const [id,value] of Object.entries({sdSide:0,sdLong:0,bigPct:0,start:10,curve:50,bias:35})){ $(id).value=String(value);await $(id).fire('input'); }
 await $('saveEditor').fire('click');$('aimX').value='60';await $('aimX').fire('input');await $('simulate').fire('click');
 assert.equal($('expectedValue').textContent,'∞');assert.equal($('scoreValue').textContent,0);assert.ok($('useBest').hidden);
 assert.match($('resultSummary').textContent,/Best sampled target/);assert.match($('coachNote').textContent,/comparison/);assert.equal($('decisionVerdict').textContent,'Too aggressive');assert.ok(Number($('penaltyValue').textContent.replace('%',''))===100);
});
