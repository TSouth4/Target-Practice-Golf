import test from 'node:test';
import assert from 'node:assert/strict';
import {tutorialGraphic} from '../dist/tutorial-graphics.js';
import {CURRICULUM,readLessonCompletion} from '../dist/curriculum.js';
import {SCENARIOS} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
test('explanation illustrations match their topics and preserve earlier participation',()=>{
 const s=generateScenario(SCENARIOS.find(s=>s.id==='water'),578);
 for(const lesson of CURRICULUM)for(const card of lesson.intro){const svg=tutorialGraphic(card.topic,s,{x:-6,y:249});assert.ok(!/NaN|undefined|Infinity/.test(svg));assert.match(svg,/Read-only illustration/);assert.ok(svg.includes(`data-lesson-topic="${card.topic}"`));}
 const ob=tutorialGraphic('ob',s);assert.match(ob,/replay from the tee/);assert.match(ob,/data-topic-hazard="ob"[^>]*stroke-width="8"/);
 assert.match(tutorialGraphic('water',s),/Example drop/);assert.match(tutorialGraphic('dispersion',s),/Long iron: wider spread/);
 assert.deepEqual(readLessonCompletion(JSON.stringify({version:'lessons-v1-baseline-v6',completed:['trouble','unknown']})),['trouble']);
 assert.ok(CURRICULUM.every(l=>!l.practice));
});
test('calculated pattern centers match the flag and actual recommended target with reduced water exposure',async()=>{
 const {lessonComparison}=await import('../dist/tutorial-graphics.js');
 const {basicPattern,patternAtTarget,samples,evaluate,optimizeTargets,DEFAULT_COSTS}=await import('../dist/model.js');
 for(const l of CURRICULUM.filter(l=>l.intro.some(c=>c.topic==='pattern'))){const s=generateScenario(SCENARIOS.find(s=>s.id===l.guided.id),l.guided.seed),p={...basicPattern(5,s,265),aimMode:'carry'},zs=samples(4000,7142026),best=await optimizeTargets(s.pin,p,s,DEFAULT_COSTS,zs),[flag,ideal]=lessonComparison(s,best.aim);
  assert.ok(Math.hypot(flag.center.landing.x-s.pin.x,flag.center.landing.y-s.pin.y)<1e-8);assert.ok(Math.hypot(ideal.center.landing.x-best.aim.x,ideal.center.landing.y-best.aim.y)<1e-8);assert.ok(flag.water>ideal.water+.05);
  assert.equal(flag.water,evaluate(s.pin,patternAtTarget(s.pin,p),s,DEFAULT_COSTS,zs).counts.water/4000);
  for(const c of [flag,ideal]){const mid=c.contour.reduce((a,p)=>({x:a.x+p.x/72,y:a.y+p.y/72}),{x:0,y:0});assert.ok(Math.hypot(mid.x-c.center.x,mid.y-c.center.y)<1e-8);}
 }
});
