import test from 'node:test';
import assert from 'node:assert/strict';
import {snapshotProfile,savedBasicPattern,validStockSnapshot} from '../dist/profile-snapshot.js';
import {basicPattern,SCENARIOS,patternAtTarget,samples,evaluate,DEFAULT_COSTS} from '../dist/model.js';
import {trainingBag} from '../dist/bag.js';
import {createRound,readRound} from '../dist/rounds.js';
import {createCourse,readCourse} from '../dist/course.js';
import {validPlayerProfile} from '../dist/shot-editor.js';
test('stock snapshots preserve current outputs for every profile and shot type',()=>{
 for(const handicap of ['0','5','10','20'])for(const type of ['tee','approach']){
  const scene=SCENARIOS.find(s=>s.type===type),profile=snapshotProfile({handicap,limit:250}),old={...basicPattern(handicap,scene,250),aimMode:'carry'},p=savedBasicPattern(profile,scene);
  assert.ok(validStockSnapshot(profile.stockSnapshot));assert.deepEqual(trainingBag(p),trainingBag(old));
  for(const carry of [80,140,180]){
   const aim={x:7,y:carry},a=patternAtTarget(aim,old),b=patternAtTarget(aim,p);
   for(const key of ['club','carry','roll','sdSide','sdLong','height','bigShift','bigPct'])assert.equal(a[key],b[key]);
   const draws=samples(100,19);assert.equal(evaluate(aim,a,scene,DEFAULT_COSTS,draws).expected,evaluate(aim,b,scene,DEFAULT_COSTS,draws).expected);
  }
 }
});
test('frozen stock bag and flight override regenerated defaults without sharing references',()=>{
 const s=SCENARIOS[0],profile=snapshotProfile({handicap:'20',limit:225});profile.stockSnapshot.tee.bag[0].sdLong=3;profile.stockSnapshot.tee.flight.height=19;
 const p=savedBasicPattern(profile,s);assert.equal(p.height,19);assert.equal(trainingBag(p)[0].sdLong,3);
 p.stockBag[0].sdLong=9;assert.equal(profile.stockSnapshot.tee.bag[0].sdLong,3);
 assert.deepEqual(snapshotProfile(profile),profile);
});
test('new and legacy saved rounds pin bags; invalid snapshots are rejected',()=>{
 const profile={handicap:'20',limit:225};
 for(const r of [createRound('assessment',17,profile),createCourse(17,profile)]){
  const read=x=>x.kind==='course'?readCourse(x):readRound(JSON.stringify(x));
  assert.ok(r.profile.stockSnapshot);assert.ok(read(structuredClone(r)));
  delete r.profile.stockSnapshot;const legacy=read(r);assert.ok(legacy.profile.stockSnapshot);assert.equal(r.profile.stockSnapshot,undefined);
  legacy.profile.stockSnapshot.approach.bag[0].stock=NaN;assert.equal(read(legacy),null);
 }
 assert.equal(validPlayerProfile({...profile,stockSnapshot:{version:88}}),false);
});
