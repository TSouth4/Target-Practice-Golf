import test from 'node:test';
import assert from 'node:assert/strict';
import {plannedRollout,centerFlight} from '../dist/rollout.js';
import {SCENARIOS,preset} from '../dist/model.js';
const p={...preset(5,'tee'),carry:100,roll:15,sdSide:0,sdLong:0,bigPct:0};
test('planned carry and rollout preserve the aim line without leaking curve, bias or dispersion',()=>{
 const aim={x:60,y:80},r=plannedRollout(aim,{...p,start:4,curve:25,bias:-10,bigPct:20});
 assert.deepEqual(r.landing,aim);assert.deepEqual(r.finish,{x:69,y:92});
 assert.ok(Math.abs(Math.hypot(r.finish.x-r.landing.x,r.finish.y-r.landing.y)-15)<1e-9);
 assert.deepEqual(r,plannedRollout(aim,p));
});
test('zero-roll carry and finish coincide',()=>{
 const r=plannedRollout({x:0,y:100},{...p,roll:0});assert.deepEqual(r.landing,r.finish);
});
const scene={...SCENARIOS[2],bounds:[-100,100],hazards:[{kind:'water',poly:[[-10,105],[10,105],[10,110],[-10,110]],drop:{x:0,y:90}}]};
test('review center flight stops at water entry during roll, exactly as scored shots do',()=>{
 const r=centerFlight({x:0,y:100},p,scene);assert.deepEqual(r.landing,{x:0,y:100});assert.deepEqual(r.finish,{x:0,y:105});assert.equal(r.roll,5);assert.equal(r.kind,'water');
});
test('landing in water has no rollout and the planning preview remains a neutral target aid',()=>{
 const pattern={...p,carry:107},r=centerFlight({x:0,y:107},pattern,scene);assert.equal(r.kind,'water');assert.deepEqual(r.finish,r.landing);assert.equal(r.roll,0);
 assert.equal(plannedRollout({x:0,y:107},pattern).finish.y,122);
});
test('review center includes the saved flight shape while excluding random and mixture misses',()=>{
 const s={...scene,hazards:[]},pattern={...p,curve:12,bias:3,bigPct:100,bigShift:100,bigShort:50,sdSide:30,sdLong:40};
 const r=centerFlight({x:0,y:100},pattern,s);assert.deepEqual(r.landing,{x:15,y:100});assert.deepEqual(r.finish,{x:15,y:115});assert.equal(r.roll,15);
});
