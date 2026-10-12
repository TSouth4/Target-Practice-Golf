import test from 'node:test';
import assert from 'node:assert/strict';
import {setupDOM} from './dom-harness.mjs';
import {preset} from '../dist/model.js';
const dom=setupDOM(),$=dom.$,oldPattern={...preset(5,'tee'),carry:270,roll:15,start:3,curve:-18,bias:4,bigPct:12,bigDirection:'left',height:38};
dom.storage.set('golfaim101-v2',JSON.stringify({practiceMode:'free',scenario:'cedar',basicHandicap:'5',advanced:{pattern:oldPattern,club:'Driver',type:'tee',costs:{bunker:1.2}}}));
await import('../dist/app.js');
const saved=()=>JSON.parse(dom.storage.get('golfaim101-v2'));
test('older Advanced settings migrate into the matching personal club while the free lesson remains straight',async()=>{
 assert.equal(saved().mode,'basic');assert.equal(saved().pattern.curve,0);assert.equal(saved().pattern.bigPct,0);assert.ok($('shotEditor').hidden);assert.ok($('results').hidden);
 const driver=saved().memberBag.find(c=>c.club==='Driver');assert.equal(driver.stock,285);assert.equal(driver.start,3);assert.equal(driver.curve,-18);assert.equal(driver.bigPct,12);assert.equal(driver.height,38);
 assert.equal(saved().memberBag.find(c=>c.club==='Hybrid').curve,0);
 await $('advancedMode').fire('click');assert.equal($('club').value,'Driver');assert.equal(Number($('carry').value),270);assert.equal(Number($('curve').value),-18);
 await $('saveEditor').fire('click');assert.equal(saved().pattern.club,'Driver');assert.equal(saved().pattern.start,3);assert.equal(saved().pattern.bigPct,12);assert.equal(saved().costs.bunker,0);assert.equal(saved().previousMemberCosts.bunker,1.2);assert.ok($('results').hidden);assert.ok($('simulate').disabled);
});
