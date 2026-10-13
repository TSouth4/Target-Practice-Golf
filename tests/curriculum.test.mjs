import test from 'node:test';
import assert from 'node:assert/strict';
import {CURRICULUM,CURRICULUM_VERSION,nearLessonTarget,readLessonCompletion,lessonFixture} from '../dist/curriculum.js';
import {SCENARIOS,basicPattern,fitTarget,patternAtTarget,samples,evaluate,optimizeTargets,DEFAULT_COSTS} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
test('penalty introduction uses distance-specific sand references and distinguishes rules from costs',()=>{
 const copy=CURRICULUM[0].intro.map(c=>c.text).join(' ');
 assert.match(copy,/third shot/);assert.match(copy,/designated drop/);assert.match(copy,/0.13/);assert.match(copy,/0.45/);assert.match(copy,/not.*personal/);
 assert.equal(readLessonCompletion('{broken').length,0);assert.deepEqual(readLessonCompletion(JSON.stringify({version:CURRICULUM_VERSION,completed:['trouble','trouble','unknown']})),['trouble']);
 assert.deepEqual(readLessonCompletion(JSON.stringify({version:'old',completed:['trouble']})),[]);
 assert.ok(nearLessonTarget({x:3,y:4},{x:3,y:8}));assert.ok(!nearLessonTarget({x:3,y:4},{x:3,y:8.1}));
});
test('selected demonstrations support their specific advice with the full fixed 4000 draws',async()=>{
 for(const lesson of CURRICULUM){const fixture=lessonFixture(lesson),s=generateScenario(SCENARIOS.find(s=>s.id===fixture.id),fixture.seed),p={...basicPattern(5,s,265),aimMode:'carry'},aim=fitTarget(lesson.reference||(s.type==='tee'?{x:0,y:250}:s.pin),p),zs=samples(4000,fixture.drawSeed),r=evaluate(aim,patternAtTarget(aim,p),s,DEFAULT_COSTS,zs),b=await optimizeTargets(aim,p,s,DEFAULT_COSTS,zs);
  assert.ok(Number.isFinite(b.result.expected));assert.ok(r.expected-b.result.expected>.05,lesson.id);
  assert.ok(!nearLessonTarget(aim,b.aim),'reference target must not accidentally satisfy the guided instruction');
  if(lesson.id==='distance'){assert.ok(b.pattern.carry>235);assert.ok(r.counts.water<b.result.counts.water);continue;}
  const kind=lesson.id==='green'?'bunker':'water';assert.ok((r.counts[kind]-b.result.counts[kind])/zs.length>.05,lesson.id+' exposure reduction');
  if(lesson.id==='distance')assert.ok(b.pattern.carry<220);
 }
});
