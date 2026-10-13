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
