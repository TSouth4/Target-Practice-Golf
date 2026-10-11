import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,basicPattern,shotAt,patternAtTarget,fitTarget,samples,evaluate,optimizeTargets,DEFAULT_COSTS} from '../dist/model.js';
import {defaultMemberBag,cleanMemberBag,editingPattern,flightHandles,moveFlightHandle,flightSVG,heightSVG} from '../dist/shot-editor.js';
import {trainingBag,reachLimit} from '../dist/bag.js';
import {nextScenario} from '../dist/practice.js';
const base=basicPattern(5,SCENARIOS[0]);
test('flight editor anchors define the simulated start and finish, including push draws and center-start fades',()=>{
 const p=editingPattern(defaultMemberBag(base)[0]),pushDraw=moveFlightHandle(p,'mid',5),h=flightHandles(pushDraw);
 assert.ok(pushDraw.start>0);assert.equal(pushDraw.curve,-20);assert.ok(Math.abs(h.mid-5)<1e-9);assert.ok(Math.abs(h.end)<1e-9);
 const shot=shotAt({x:0,y:p.stock},{...pushDraw,sdSide:0,sdLong:0,bias:0,bigPct:0},{z1:0,z2:0,u:1,sign:1});assert.ok(Math.abs(shot.x-h.end)<1e-9);
 const fade={...p,start:0,curve:24};assert.equal(flightHandles(fade).mid,6);assert.equal(flightHandles(fade).end,24);
 const moved=moveFlightHandle(fade,'end',20);assert.ok(Math.abs(flightHandles(moved).mid-6)<1e-9);assert.ok(Math.abs(flightHandles(moved).end-20)<1e-9);
 for(const key of ['mid','end'])for(const lateral of [-1000,1000]){const clamped=moveFlightHandle(p,key,lateral);assert.ok(Math.abs(clamped.start)<=10);assert.ok(Math.abs(clamped.curve)<=50);assert.ok(Object.values(flightHandles(clamped)).every(Number.isFinite));}
 assert.ok(flightSVG(pushDraw).includes('data-handle="mid"'));assert.ok(heightSVG({...p,height:40}).includes('cy="70"'));
});
test('personal bag uses entered distances, selects clubs at every depth, scales shape and misses, and caps diagonal reach',()=>{
 const bag=defaultMemberBag(base);Object.assign(bag[0],{stock:305,roll:15,sdSide:18,sdLong:12,start:3,curve:-22,bias:4,bigPct:8,bigDirection:'left',bigShift:50,bigShort:15,height:42});
 const p={...base,customBag:bag};assert.equal(reachLimit(p),305);assert.equal(trainingBag(p)[0].stock,305);
 for(const d of [100,160,205,245,300]){const q=patternAtTarget({x:0,y:d},p),c=bag.find(c=>c.club===q.club),factor=Math.max(.25,d/c.stock);assert.equal(q.start,c.start);assert.equal(q.bigPct,c.bigPct);assert.equal(q.height,c.height);assert.ok(Math.abs(q.sdSide-c.sdSide*factor)<1e-9);assert.ok(Math.abs(q.curve-c.curve*factor)<1e-9);assert.ok(Math.abs(q.bigShift-c.bigShift*factor)<1e-9);assert.ok(Math.abs(q.carry+q.roll-d)<1e-9);}
 const diagonal=fitTarget({x:60,y:340},p);assert.ok(Math.hypot(diagonal.x,diagonal.y)<=305+1e-8);
 const approach={...p,shotType:'approach'},apBag=trainingBag(approach);assert.ok(!apBag.some(c=>c.club==='Driver'));assert.ok(apBag.every(c=>c.roll===0));assert.equal(apBag[0].stock,bag[1].stock-bag[1].roll);
});
test('personal settings and legacy inputs are validated on restoration; missing clubs keep sane defaults',()=>{
 const clean=cleanMemberBag([{club:'Driver',stock:1000,roll:80,start:-100,curve:NaN,bigPct:99,bigDirection:'invalid',sdSide:-7}],base),d=clean[0];assert.equal(d.stock,370);assert.equal(d.roll,40);assert.equal(d.start,-10);assert.equal(d.curve,0);assert.equal(d.sdSide,0);assert.equal(d.bigPct,25);assert.equal(d.bigDirection,'both');assert.equal(clean.length,10);assert.equal(clean[1].stock,defaultMemberBag(base)[1].stock);
});
test('the sampled comparison obeys the same personal bag, reach, shapes and misses as the committed shot',async()=>{
 const bag=defaultMemberBag(base);Object.assign(bag[0],{stock:285,start:4,curve:-18,bigPct:10,bigDirection:'right'});const p={...base,customBag:bag},aim={x:12,y:260},current=patternAtTarget(aim,p),zs=samples(4000,137);
 const r=evaluate(aim,current,SCENARIOS[0],DEFAULT_COSTS,zs),best=await optimizeTargets(aim,p,SCENARIOS[0],DEFAULT_COSTS,zs);
 assert.ok(best.result.expected<=r.expected+1e-8);assert.ok(Math.hypot(best.aim.x,best.aim.y)<=reachLimit(p)+1e-8);assert.deepEqual(best.pattern,patternAtTarget(best.aim,p));
});
test('filtered scenario selection avoids repeat families until the eligible bank is exhausted, with deterministic variety',()=>{
 for(const filter of ['tee','approach','mixed']){let id=filter==='approach'?'water':'cedar',recent=[id];const seen=new Set([id]);for(let i=0;i<40;i++){const seed=137+i*7919,next=nextScenario(id,filter,seed,recent);assert.equal(next,nextScenario(id,filter,seed,recent));assert.notEqual(next,id);const type=SCENARIOS.find(s=>s.id===next).type;if(filter!=='mixed')assert.equal(type,filter);else assert.notEqual(type,SCENARIOS.find(s=>s.id===id).type);seen.add(next);recent=[...recent,next].slice(-6);id=next;}assert.equal(seen.size,filter==='mixed'?10:filter==='approach'?6:4);}
 const variety=new Set(Array.from({length:30},(_,seed)=>nextScenario('cedar','tee',seed,[])));assert.equal(variety.size,3);
});
