import test from 'node:test';
import assert from 'node:assert/strict';
import {baselineStrokes,baselineLookup,BASELINE_ID} from '../dist/strokes-baseline.js';
import {remaining,DEFAULT_COSTS,SCENARIOS} from '../dist/model.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} vs ${b}`);
test('documented historical reference values use correct lie and distance units',()=>{
 assert.equal(BASELINE_ID,'broadie-pga-tour-2003-2010-v1');
 for(const [kind,yards,value] of [['tee',400,3.99],['fairway',120,2.85],['fairway',150,2.945],['rough',120,3.08],['bunker',20,2.53],['trees',20,3.51],['green',10/3,1.61],['green',30,2.36]])close(baselineStrokes(kind,yards),value);
});
test('range limits are explicit, interpolation continuous, and invalid values fail',()=>{
 assert.equal(baselineLookup('fairway',5).clamped,true);close(baselineStrokes('fairway',5),2.18);
 assert.equal(baselineLookup('green',40).clamped,true);close(baselineStrokes('green',40),2.36);
 assert.equal(baselineLookup('fairway',120).clamped,false);
 close(baselineStrokes('bunker',25),2.595);
 for(const bad of [-1,NaN,Infinity])assert.throws(()=>baselineLookup('fairway',bad),RangeError);
 assert.throws(()=>baselineLookup('water',20),RangeError);
});
test('remaining costs use lie curves rather than fixed hazard surcharges',()=>{
 const s={...SCENARIOS[2],pin:{x:0,y:0},hazards:[]};
 close(remaining({x:0,y:20},s,DEFAULT_COSTS,'bunker'),2.53);
 close(remaining({x:0,y:40},s,DEFAULT_COSTS,'bunker'),2.82);
 close(remaining({x:0,y:10/3},s,DEFAULT_COSTS,'green'),1.61);
 const shortGap=remaining({x:0,y:20},s,DEFAULT_COSTS,'bunker')-remaining({x:0,y:20},s,DEFAULT_COSTS,'fairway');
 const longGap=remaining({x:0,y:60},s,DEFAULT_COSTS,'bunker')-remaining({x:0,y:60},s,DEFAULT_COSTS,'fairway');
 assert.ok(longGap>shortGap);
 close(remaining({x:0,y:20},s,{...DEFAULT_COSTS,bunker:.2},'bunker'),2.73);
});
test('wedge laybacks and longer-iron laybacks have different source-based costs',()=>{
 const wedge=baselineStrokes('fairway',100)-baselineStrokes('fairway',75);
 const longerIron=baselineStrokes('fairway',175)-baselineStrokes('fairway',150);
 close(wedge,.065);close(longerIron,.11);assert.ok(longerIron>wedge);
});
