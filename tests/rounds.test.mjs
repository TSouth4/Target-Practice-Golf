import test from 'node:test';import assert from 'node:assert/strict';
import {createRound,readRound,addRoundAnswer,roundSummary} from '../dist/rounds.js';
import {SCENARIOS,decisionScore} from '../dist/model.js';
const profile={handicap:'10',limit:250};
test('learning and assessment schedules are repeatable and balance distinct tee decisions with approaches',()=>{
 for(const kind of ['practice','assessment'])for(let seed=1;seed<=50;seed++){
  const r=createRound(kind,seed,profile);assert.deepEqual(r,createRound(kind,seed,profile));assert.deepEqual(readRound(JSON.stringify(r)),r);
  assert.equal(r.schedule.length,kind==='practice'?5:10);assert.equal(r.schedule.filter(s=>SCENARIOS.find(b=>b.id===s.id).type==='tee').length,kind==='practice'?3:5);
  assert.ok(r.schedule.some(s=>s.id==='drivable'));assert.ok(r.schedule.some(s=>s.id==='cedar'&&s.holeSeed%3===0));
  assert.ok(r.schedule.some(s=>['narrow','squeeze-par4','creek-tee'].includes(s.id)));
 }
 assert.ok(new Set(Array.from({length:50},(_,i)=>createRound('practice',i+1,profile).schedule[0].id)).size>4);
 assert.notDeepEqual(createRound('practice',1,profile).schedule,createRound('practice',2,profile).schedule);
});
test('retries cannot replace first attempts or consume another round scenario; totals use unrounded differences',()=>{
 const r=createRound('practice',37,profile),a={kind:'aggressive',score:90,regret:.204,dx:8,dy:10};
 assert.equal(addRoundAnswer(r,a),true);assert.equal(addRoundAnswer(r,{...a,score:100,regret:0}),false);assert.equal(r.answers[0].score,90);
 for(let i=1;i<5;i++){r.index=i;addRoundAnswer(r,{...a,kind:'balanced',regret:.104,dx:-8,dy:-10});}
 const summary=roundSummary(r);assert.ok(Math.abs(summary.average-.124)<1e-9);assert.ok(Math.abs(summary.per100-12.4)<1e-9);assert.equal(summary.direction.short,1);assert.equal(summary.direction.long,4);assert.equal(summary.kinds.aggressive,1);
 r.status='complete';assert.deepEqual(readRound(JSON.stringify(r)),r);assert.equal(addRoundAnswer(r,a),false);
});
test('unbounded comparisons have no invented finite total and damaged session saves are rejected',()=>{
 const r=createRound('assessment',1,profile);addRoundAnswer(r,{kind:'refine',score:0,regret:null,dx:0,dy:0});assert.equal(roundSummary(r).per100,null);
 assert.equal(readRound('{broken'),null);assert.equal(readRound(JSON.stringify({...r,index:20})),null);assert.equal(readRound(JSON.stringify({...r,version:'old-model'})),null);
});
test('100 requires near equality in cost and location, while excellent alternatives earn 99',()=>{
 assert.equal(decisionScore(3,3,{x:0,y:150},{x:0,y:150}),100);
 assert.equal(decisionScore(3.003,3,{x:1,y:150},{x:0,y:150}),100);
 assert.equal(decisionScore(3.001,3,{x:10,y:150},{x:0,y:150}),99);
 assert.equal(decisionScore(3.006,3,{x:0,y:150},{x:0,y:150}),99);
 assert.equal(decisionScore(Infinity,3,{x:0,y:150},{x:0,y:150}),0);
});

test('wide driving and crossing-water layouts produce different sensible clubs for the same profile',async()=>{
 const {generateScenario}=await import('../dist/practice.js');const {basicPattern,samples,optimizeTargets,DEFAULT_COSTS}=await import('../dist/model.js');const zs=samples(800,411),choices=[];
 for(const id of ['cedar','creek-tee']){const s=generateScenario(SCENARIOS.find(b=>b.id===id),3),p=basicPattern(5,s),b=await optimizeTargets({x:0,y:200},p,s,DEFAULT_COSTS,zs);choices.push(b.pattern.club);}
 assert.equal(choices[0],'Driver');assert.notEqual(choices[1],'Driver');
});

test('completed previous-model reports remain readable while unfinished incompatible rounds restart',()=>{
 const r=createRound('practice',37,{handicap:'5',limit:265});for(let i=0;i<5;i++){r.index=i;addRoundAnswer(r,{kind:'balanced',score:99,regret:.01,dx:0,dy:0});}r.status='complete';r.version='rounds-v1-model-v3';
 assert.equal(readRound(JSON.stringify(r)).answers.length,5);r.status='active';assert.equal(readRound(JSON.stringify(r)),null);
});
