import test from 'node:test';import assert from 'node:assert/strict';
import {SCENARIOS,basicPattern,patternAtTarget,shotAt,fitTarget} from '../dist/model.js';import {reachLimit,trainingBag} from '../dist/bag.js';import {roundNarrative} from '../dist/rounds.js';
const z={z1:0,z2:0,u:1,sign:1};
test('carry targets select a club by carry capacity and add rollout after landing',()=>{
 const p={...basicPattern(5,SCENARIOS[0]),aimMode:'carry'},aim={x:0,y:250},q=patternAtTarget(aim,p),shot=shotAt(aim,q,z);
 assert.equal(q.carry,250);assert.equal(q.club,'Driver');assert.equal(q.roll,15);assert.equal(shot.landing.y,250);assert.equal(shot.y,265);assert.equal(reachLimit(p),250);assert.equal(fitTarget({x:0,y:300},p).y,250);const manual=patternAtTarget({x:0,y:180},{...p,autoBag:false,roll:6});assert.equal(manual.carry,180);assert.equal(manual.roll,6);
 const diagonal={x:60,y:180},d=patternAtTarget(diagonal,p),s=shotAt(diagonal,d,z);assert.ok(Math.abs(Math.hypot(s.landing.x,s.landing.y)-Math.hypot(60,180))<1e-9);assert.ok(Math.abs(Math.hypot(s.x-s.landing.x,s.y-s.landing.y)-d.roll)<1e-9);
});
test('custom club selection handles non-monotone rollout without silently increasing requested carry',()=>{
 const p={autoBag:true,aimMode:'carry',shotType:'tee',customBag:[{club:'A',stock:100,roll:0,sdSide:0,sdLong:0,start:0,curve:0,bias:0,height:25,bigPct:0,bigShift:0,bigShort:0,rho:0},{club:'B',stock:110,roll:20,sdSide:0,sdLong:0,start:0,curve:0,bias:0,height:25,bigPct:0,bigShift:0,bigShort:0,rho:0}]};
 const q=patternAtTarget({x:0,y:80},p);assert.equal(q.club,'B');assert.equal(q.carry,80);assert.equal(q.roll,20);
 const r=patternAtTarget({x:0,y:95},p);assert.equal(r.club,'A');assert.equal(r.carry,95);assert.equal(r.roll,0);
});
test('approaches still have no baseline rollout and recaps describe decisions without diagnosing physical misses',()=>{
 const p={...basicPattern(10,SCENARIOS.find(s=>s.type==='approach')),aimMode:'carry'},q=patternAtTarget({x:0,y:130},p);assert.equal(q.carry,130);assert.equal(q.roll,0);
 const tee={...basicPattern(10,SCENARIOS[0]),aimMode:'carry'},wood=trainingBag(tee).find(c=>c.club==='3 wood');assert.equal(reachLimit(p),wood.stock-wood.roll);
 const text=roundNarrative({count:10,kinds:{balanced:5,aggressive:5,conservative:0,refine:0},direction:{short:0,long:8,left:0,right:1}});
 assert.match(text.tendencies,/too aggressive on 5 of your 10/);assert.match(text.directions,/more intended carry.*8 of your 10/);assert.match(text.directions,/not evidence of a physical/);
});
