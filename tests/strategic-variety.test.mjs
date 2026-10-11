import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {SCENARIOS,lie,basicPattern,patternAtTarget,fitTarget,aimAtDistance,aimAtDepth,samples,evaluate,optimizeTargets,DEFAULT_COSTS} from '../dist/model.js';
import {generateScenario,nextScenario} from '../dist/practice.js';
import {validateTeeScenario} from '../dist/tee-generator.js';
import {reachLimit} from '../dist/bag.js';

test('all approach and par-5 families generate repeatable, playable, independently varied greens and hazards',()=>{
 for(const base of SCENARIOS.filter(s=>s.type==='approach')){
  const widths=new Set(),distances=new Set(),sides=new Set();
  for(let seed=1;seed<=500;seed++){
   const s=generateScenario(base,seed);assert.ok(!s.generation.fallback,`${base.id}: ${seed}`);
   assert.deepEqual(validateTeeScenario(s,{minimumReach:160}),[]);assert.equal(lie(s.pin,s),'green');
   if(seed<=10)assert.deepEqual(s,generateScenario(base,seed));
   widths.add(Math.round(s.green.rx));distances.add(Math.round(s.green.y/10));sides.add(s.generation.hazardSide);
  }
  assert.ok(widths.size>=8);assert.ok(distances.size>=8);assert.equal(sides.size,2);
 }
});

test('a long mixed session visits every architecture without exact layout repetition or immediate family repetition',()=>{
 const seen=new Set(),families=new Set();let id='cedar',recent=[id];
 for(let i=1;i<=240;i++){
  const seed=7142026+i*7919,next=nextScenario(id,'mixed',seed,recent),base=SCENARIOS.find(s=>s.id===next),s=generateScenario(base,seed);
  assert.notEqual(next,id);assert.notEqual(base.type,SCENARIOS.find(b=>b.id===id).type);
  if(i>6)assert.ok(!recent.includes(next));
  const signature=createHash('sha256').update(JSON.stringify({fairway:s.fairway,green:s.green,pin:s.pin,hazards:s.hazards})).digest('hex');
  assert.ok(!seen.has(signature));seen.add(signature);families.add(next);id=next;recent=[...recent,id].slice(-6);
 }
 assert.equal(families.size,14);assert.equal(seen.size,240);
});

test('sharp dogleg aiming, club reach, and comparison search use the same expanded lateral range',async()=>{
 const s=generateScenario(SCENARIOS.find(b=>b.id==='sharp-dogleg'),5),p=basicPattern(20,s),zs=samples(600,411);
 const a={x:85,y:205},fitted=fitTarget(a,p);assert.ok(fitted.x>60);assert.ok(Math.hypot(fitted.x,fitted.y)<=reachLimit(p)+1e-8);
 const depth=aimAtDepth(fitted,200,[125,225],p.aimXRange);assert.ok(Math.abs(depth.x/depth.y-fitted.x/fitted.y)<1e-8);
 const distance=aimAtDistance(fitted,210,p.aimXRange);assert.ok(distance.x>60);assert.ok(Math.abs(Math.hypot(distance.x,distance.y)-210)<1e-8);
 const selected={x:0,y:225},best=await optimizeTargets(selected,p,s,DEFAULT_COSTS,zs),r=evaluate(selected,patternAtTarget(selected,p),s,DEFAULT_COSTS,zs);
 assert.ok(best.aim.x>60);assert.equal(lie(best.aim,s),'fairway');assert.ok(Math.hypot(best.aim.x,best.aim.y)<=reachLimit(p)+1e-8);assert.ok(r.expected-best.result.expected>.3);
});

test('the same crossing creek supports carrying for a longer profile and a short layup for a shorter profile',async()=>{
 const s=generateScenario(SCENARIOS.find(b=>b.id==='creek-tee'),5),creek=s.hazards.find(h=>h.kind==='water'),near=Math.min(...creek.poly.map(p=>p[1])),far=Math.max(...creek.poly.map(p=>p[1])),zs=samples(1000,411);
 const targets=[];
 for(const handicap of [0,20]){const p=basicPattern(handicap,s),a={x:0,y:140},b=await optimizeTargets(a,p,s,DEFAULT_COSTS,zs);targets.push(b);assert.equal(lie(b.aim,s),'fairway');assert.ok(Math.hypot(b.aim.x,b.aim.y)<=reachLimit(p)+1e-8);}
 assert.ok(targets[0].aim.y>far);assert.ok(targets[1].aim.y<near);
});

test('generated par-5 second shots include reachable and unreachable greens while keeping legal layups',()=>{
 let reachable=false,unreachable=false;
 for(const base of SCENARIOS.filter(b=>b.secondShot))for(let seed=1;seed<=100;seed++){
  const s=generateScenario(base,seed),long=basicPattern(0,s),short=basicPattern(20,s);
  reachable||=Math.hypot(s.pin.x,s.pin.y)<reachLimit(long)-10;unreachable||=Math.hypot(s.pin.x,s.pin.y)>reachLimit(short)+20;
  assert.equal(s.par,5);assert.equal(s.secondShot,true);assert.deepEqual(validateTeeScenario(s,{minimumReach:160}),[]);
 }
 assert.ok(reachable&&unreachable);
});
