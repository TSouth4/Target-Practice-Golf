import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,DEFAULT_COSTS} from '../dist/model.js';
import {tradeoffExplanation} from '../dist/lessons.js';
const box=x=>[[x-2,98],[x+2,98],[x+2,102],[x-2,102]];
const s={pin:{x:0,y:100},green:{x:0,y:100,rx:3,ry:3},bounds:[-60,60],maxY:180,fairway:[[-10,0],[10,0],[10,180],[-10,180]],hazards:[{kind:'water',poly:box(20),drop:{x:0,y:80}},{kind:'bunker',poly:box(30)},{kind:'trees',poly:box(40),forest:true,recoveryMultiplier:1.5}]};
const p={carry:100,roll:0,sdSide:1,sdLong:1,rho:0,start:0,curve:0,bias:0,bigPct:0};
const zs=[[0,0],[0,-20],[20,0],[30,0],[40,0],[50,0],[70,0]].map(([z1,z2])=>({z1,z2,u:1,sign:1}));
test('cost accounting matches expected strokes with every lie, water relief, dense trees and OB repeats',()=>{
 const r=evaluate({x:0,y:100},p,s,DEFAULT_COSTS,zs,true);
 for(const kind of ['green','fairway','rough','water','bunker','trees','ob'])assert.equal(r.counts[kind],1);
 assert.ok(Math.abs(Object.values(r.breakdown).reduce((a,b)=>a+b,0)-r.expected)<1e-10);
 assert.ok(Math.abs(r.breakdown.bunker-DEFAULT_COSTS.bunker/6)<1e-10);
 assert.ok(Math.abs(r.breakdown.trees-DEFAULT_COSTS.trees*1.5/6)<1e-10);
 assert.ok(Math.abs(r.breakdown.water-(1+DEFAULT_COSTS.rough)/6)<1e-10);
 assert.ok(Math.abs(r.breakdown.ob-1/3)<1e-10);
 assert.equal(evaluate({x:0,y:100},p,s,DEFAULT_COSTS,zs).expected,r.expected);
});
test('all-OB and missing breakdowns produce no invented finite cost explanation',()=>{
 const r=evaluate({x:0,y:100},p,s,DEFAULT_COSTS,[zs.at(-1)],true);
 assert.equal(r.breakdown,null);assert.equal(tradeoffExplanation(r,r),null);
 assert.equal(tradeoffExplanation({expected:3},{expected:2}),null);
});
test('feedback explains proximity gain versus increased bunker cost with correct net and per-100 scaling',()=>{
 const base={shot:1,nextShot:2.8,rough:0,bunker:.02,trees:0,water:0,ob:0};
 const r={expected:3.82,breakdown:base},q={expected:3.65,breakdown:{...base,nextShot:2.5,bunker:.15}};
 const t=tradeoffExplanation(r,q);
 assert.match(t.text,/next-shot \/ putting cost falls by 0.30/);
 assert.match(t.text,/bunker recovery cost rises by 0.13/);
 assert.match(t.text,/saves 0.17 modeled strokes \(17.0 per 100/);
 assert.equal(t.rows.find(v=>v.label==='Bunker recovery cost').best,'0.15');
});
