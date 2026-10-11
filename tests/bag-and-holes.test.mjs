import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,basicPattern,patternAtTarget,fitTarget,shotAt,samples,evaluate,optimizeTargets,DEFAULT_COSTS,lie} from '../dist/model.js';
import {DRIVER_LIMITS,reachLimit} from '../dist/bag.js';
import {generateScenario} from '../dist/practice.js';
test('all basic profiles constrain radial distance, including diagonal targets, and shorter clubs narrow the pattern',()=>{
 for(const h of [0,5,10,20])for(const type of ['tee','approach']){
  const s=SCENARIOS.find(s=>s.type===type),p=basicPattern(h,s),max=reachLimit(p);
  assert.equal(max,DRIVER_LIMITS[h]*(type==='tee'?1:.89));
  const aim=fitTarget({x:60,y:310},p),at=patternAtTarget(aim,p),shot=shotAt(aim,at,{z1:0,z2:0,u:1,sign:1});
  assert.ok(Math.abs(Math.hypot(aim.x,aim.y)-max)<1e-7);assert.ok(Math.abs(shot.x-aim.x)<1e-7);assert.ok(Math.abs(shot.y-aim.y)<1e-7);
  const short=patternAtTarget({x:0,y:140},p),long=patternAtTarget({x:0,y:max},p);assert.ok(short.sdSide<long.sdSide);assert.ok(short.sdLong<long.sdLong);assert.notEqual(short.club,long.club);
 }
});
test('calibrating personal reach preserves handicap spread and custom lab stays separate',()=>{const s=SCENARIOS[0],p=basicPattern(5,s,300);assert.equal(reachLimit(p),300);assert.equal(patternAtTarget({x:0,y:300},p).sdSide,15);const custom={...p,autoBag:false,roll:15,sdSide:18,sdLong:13};const q=patternAtTarget({x:0,y:170},custom);assert.equal(q.sdSide,18);assert.equal(q.sdLong,13);assert.equal(q.carry,155);assert.equal(reachLimit(custom),345);});
test('seeded hole variations reproduce exact geometry, keep pins safe and include both dogleg directions',()=>{
 let left=false,right=false;
 for(const base of SCENARIOS)for(let seed=1;seed<=50;seed++){
  const original=JSON.stringify(base),s=generateScenario(base,seed);assert.deepEqual(s,generateScenario(base,seed));assert.notDeepEqual(s.fairway,base.fairway);assert.ok(s.bounds[0]<s.bounds[1]);assert.equal(lie(s.pin,s),'green');assert.ok(s.aimRange[0]<s.aimY&&s.aimY<s.aimRange[1]);assert.ok(s.length>60);assert.equal(JSON.stringify(base),original);
  if(base.id==='bend'){left||=s.tag.includes('left');right||=s.tag.includes('right');}
 }
 assert.ok(left&&right);assert.equal(SCENARIOS.length,10);
});
test('scored distributions and comparison obey the same reach and club rules on generated holes',async()=>{
 const zs=samples(600,17);
 for(const base of SCENARIOS){const s=generateScenario(base,91827),p=basicPattern(20,s),aim=fitTarget({x:0,y:s.aimY},p),selected=patternAtTarget(aim,p),r=evaluate(aim,selected,s,DEFAULT_COSTS,zs,true),best=await optimizeTargets(aim,p,s,DEFAULT_COSTS,zs);
  assert.equal(Object.values(r.counts).reduce((a,v)=>a+v,0),600);assert.ok(Number.isFinite(r.expected));assert.ok(best.result.expected<=r.expected);assert.ok(Math.hypot(best.aim.x,best.aim.y)<=reachLimit(p)+1e-7);assert.deepEqual(best.pattern,patternAtTarget(best.aim,p));
 }
});
