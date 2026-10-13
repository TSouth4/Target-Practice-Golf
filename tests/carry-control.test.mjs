import test from 'node:test';
import assert from 'node:assert/strict';
import {setupDOM} from './dom-harness.mjs';
const dom=setupDOM(),$=dom.$;
await import('../dist/app.js');
const state=()=>JSON.parse(dom.storage.get('golfaim101-v2'));
test('left/right aim changes preserve selected intended carry, including large adjustments',async()=>{
 $('aimY').value='210';await $('aimY').fire('input');const before=state().pattern.carry;
 for(const x of [-50,30,0]){$('aimX').value=String(x);await $('aimX').fire('input');assert.ok(Math.abs(state().pattern.carry-before)<1e-9);assert.ok(Math.abs(Math.hypot(state().aim.x,state().aim.y)-before)<1e-9);}
});
