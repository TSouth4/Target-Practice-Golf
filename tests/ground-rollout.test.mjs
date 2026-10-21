import test from 'node:test';
import assert from 'node:assert/strict';
import {CALM,LEGACY_ROLLOUT,rolloutDistance} from '../dist/conditions.js';
import {SCENARIOS,preset,shotAt,outcome,samples,evaluate,DEFAULT_COSTS} from '../dist/model.js';
import {centerFlight} from '../dist/rollout.js';
const aim={x:0,y:150},z={z1:0,z2:0,u:1,sign:1},p={...preset('5','tee'),carry:150,roll:15,sdSide:0,sdLong:0,bigPct:0};
const scene=hazards=>({...SCENARIOS[0],pin:{x:0,y:300},green:{x:0,y:300,rx:10,ry:10},bounds:[-100,100],maxY:400,fairway:[[-30,0],[30,0],[30,400],[-30,400]],hazards});
const normal=difficulty=>({...CALM,difficulty});
test('zero-wind normal ground has identical landing, finishing, lie and costs at every difficulty',()=>{
 for(const landing of ['fairway','rough','bunker','trees','water','ob']){
 const s=scene(landing==='fairway'||landing==='rough'||landing==='ob'?[]:[{kind:landing,poly:[[-20,140],[20,140],[20,170],[-20,170]],drop:{x:0,y:130}}]);if(landing==='rough')s.fairway=[[-5,0],[5,0],[5,120],[-5,120]];if(landing==='ob')s.bounds=[40,100];
 for(const shape of [{},{start:2,curve:4,bias:-2},{sdSide:5,sdLong:8,rho:.4,bigPct:10,bigDirection:'right',bigShift:20,bigShort:12}]){
 const results=['easy','medium','hard'].map(difficulty=>evaluate(aim,{...p,...shape,conditions:normal(difficulty)},s,DEFAULT_COSTS,samples(100,411),true));assert.deepEqual(results[0],results[1]);assert.deepEqual(results[1],results[2]);
 }
 const a=shotAt(aim,{...p,conditions:CALM},z,s);assert.equal(outcome(a,s).kind,landing);assert.equal(a.landing.y,150);
 if(['bunker','trees','water','ob'].includes(landing))assert.equal(a.y,150);if(landing==='rough')assert.equal(a.y,155.25);if(landing==='fairway')assert.equal(a.y,165);
 }
});
test('all modes stop roll at sand, trees and water entry and center-flight feedback uses the same finish',()=>{
 for(const kind of ['bunker','trees','water']){
 const s=scene([{kind,poly:[[-20,155],[20,155],[20,165],[-20,165]],drop:{x:0,y:130}}]);
 for(const difficulty of ['easy','medium','hard']){const pattern={...p,conditions:normal(difficulty)},r=evaluate(aim,pattern,s,DEFAULT_COSTS,[z],true),c=centerFlight(aim,pattern,s);assert.equal(r.points[0].kind,kind);assert.ok(r.points[0].y>=155&&r.points[0].y<155.001);assert.equal(c.finish.y,r.points[0].y);assert.equal(c.kind,kind);}
 }
});
test('legacy opt-in reproduces the reported pass-through without changing current defaults',()=>{
 const s=scene([{kind:'bunker',poly:[[-20,155],[20,155],[20,165],[-20,165]]}]);const old=shotAt(aim,{...p,conditions:CALM,rolloutRules:LEGACY_ROLLOUT},z,s),current=shotAt(aim,{...p,conditions:CALM},z,s);assert.equal(old.y,165);assert.equal(outcome(old,s).kind,'fairway');assert.equal(outcome(current,s).kind,'bunker');
 assert.equal(rolloutDistance({...p,conditions:CALM},'rough'),5.25);assert.equal(rolloutDistance({...p,conditions:CALM,rolloutRules:LEGACY_ROLLOUT},'rough'),15);
});
