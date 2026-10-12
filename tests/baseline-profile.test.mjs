import test from 'node:test';
import assert from 'node:assert/strict';
import {setupDOM} from './dom-harness.mjs';
import {DEFAULT_COSTS} from '../dist/model.js';
const dom=setupDOM();
dom.storage.set('golfaim101-v2',JSON.stringify({practiceMode:'free',scenario:'cedar',basicHandicap:'20',memberCosts:{...DEFAULT_COSTS,bunker:1.5,puttBase:.2}}));
await import('../dist/app.js');
const state=()=>JSON.parse(dom.storage.get('golfaim101-v2'));
test('current-reference custom recovery settings survive reload without altering free practice',async()=>{
 assert.equal(state().costs.bunker,0);assert.equal(state().costs.puttBase,0);
 await dom.$('advancedMode').fire('click');await dom.$('saveEditor').fire('click');
 assert.equal(state().costs.bunker,1.5);assert.equal(state().costs.puttBase,.2);
 assert.equal(state().costs.baseline,DEFAULT_COSTS.baseline);
});
