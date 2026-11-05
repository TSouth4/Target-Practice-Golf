import test from 'node:test';
import assert from 'node:assert/strict';
import {experimentDraws,fixedClubPattern} from '../scripts/dispersion-experiment.mjs';
import {samples,SCENARIOS,basicPattern,patternAtTarget,evaluate,DEFAULT_COSTS} from '../dist/model.js';
import {trainingBag} from '../dist/bag.js';
test('experimental transforms are deterministic, preserve lateral draws and never mutate source',()=>{
 const zs=samples(20000,7142026),copy=structuredClone(zs),shifted=experimentDraws(zs,'shifted'),mixture=experimentDraws(zs,'mixture');
 assert.deepEqual(zs,copy);assert.deepEqual(experimentDraws(zs,'current'),zs);assert.deepEqual(experimentDraws(zs,'mixture'),mixture);
 const mean=a=>a.reduce((n,z)=>n+z.z2,0)/a.length;
 assert.ok(Math.abs(mean(shifted)-mean(zs)+.5244005127080409)<1e-12);assert.ok(Math.abs(mean(mixture)+.3)<.03);
 assert.ok(Math.abs(shifted.filter(z=>z.z2<0).length/zs.length-.7)<.015);
 for(let i=0;i<zs.length;i++){assert.equal(mixture[i].z1,zs[i].z1);assert.equal(mixture[i].u,zs[i].u);assert.equal(mixture[i].z2,.65*zs[i].z2-(zs[i].u<.2?1.5:0));}
 assert.throws(()=>experimentDraws(zs,'unknown'));
});
test('held-club baseline equals current evaluator at the same club and target',()=>{
 const s=SCENARIOS.find(s=>s.id==='split'),base={...basicPattern('20',s),aimMode:'carry'},aim={x:0,y:179},auto=patternAtTarget(aim,base),club=trainingBag(base).find(c=>c.club===auto.club),fixed=fixedClubPattern(base,club,aim),zs=samples(400,17);
 assert.equal(fixed.club,auto.club);assert.equal(fixed.sdLong,auto.sdLong);assert.equal(fixed.sdSide,auto.sdSide);assert.equal(evaluate(aim,fixed,s,DEFAULT_COSTS,experimentDraws(zs,'current')).expected,evaluate(aim,auto,s,DEFAULT_COSTS,zs).expected);
 assert.equal(fixedClubPattern(base,club,{x:0,y:500}),null);assert.equal(fixedClubPattern(base,club,{x:0,y:50}),null);
 assert.throws(()=>fixedClubPattern({...base,rho:.3},club,aim));
});
test('generated comparison results preserve held clubs, feasible targets and evaluator costs',async()=>{
 const {readFile}=await import('node:fs/promises'),d=JSON.parse(await readFile(new URL('../docs/DISPERSION-PROTOTYPE-RESULTS.json',import.meta.url)));
 assert.equal(d.cases.length,6);
 for(const c of d.cases){const base={...basicPattern(c.handicap,c.scene),aimMode:'carry'},club=trainingBag(base).find(x=>x.club===c.club);
  for(const v of c.variants){assert.equal(v.values[v.best],Math.min(...v.values));const shared=[...c.presets.map(p=>p.index),...c.variants.map(x=>x.best)];assert.ok(shared.every(i=>v.results[i]));
   for(const [index,r] of Object.entries(v.results)){assert.equal(r.points.length,500);assert.equal(Object.values(r.counts).reduce((a,b)=>a+b,0),4000);assert.equal(r.expected,r.independentCosts[0]);assert.ok(r.long40<=r.long20);assert.ok(r.short>=0&&r.short<=4000);assert.equal(fixedClubPattern(base,club,c.targets[index].aim).club,c.club);}
  }
 }
});
