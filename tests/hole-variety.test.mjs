import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,lie} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
import {HOLE_VARIETY_VERSION} from '../dist/hole-variety.js';
import {validateTeeScenario} from '../dist/tee-generator.js';
import {createRound,readRound} from '../dist/rounds.js';
import {createCourse,readCourse,courseDistanceRange} from '../dist/course.js';
import {practiceSnapshot,readPractice} from '../dist/practice-session.js';

test('new layouts are deterministic, playable, and offer multiple green shapes plus occasional back trouble',()=>{
 const shapes=new Set(),back=new Set();let backCount=0,count=0;
 for(const base of SCENARIOS.filter(s=>!s.shoreline))for(let seed=1;seed<=80;seed++){
  const s=generateScenario(base,seed,HOLE_VARIETY_VERSION);count++;
  assert.deepEqual(validateTeeScenario(s,{minimumReach:s.type==='tee'?180:160}),[],`${base.id}/${seed}`);
  assert.equal(lie(s.pin,s),'green');
  if(s.green.shape)shapes.add(s.green.shape);
  if(s.backTrouble){back.add(s.backTrouble);backCount++;const h=s.hazards.find(h=>h.label==='Back bunker'||h.label==='Back recovery area');assert.ok(Math.min(...h.poly.map(p=>p[1]))>s.green.y+s.green.ry);}
  if(seed<=3)assert.deepEqual(s,generateScenario(base,seed,HOLE_VARIETY_VERSION));
 }
 assert.deepEqual([...shapes].sort(),['balanced','deep','wide']);assert.deepEqual([...back].sort(),['bunker','recovery']);assert.ok(backCount/count>.08&&backCount/count<.3);
});
test('gentle bends keep both directions and are less severe than the same legacy seed',()=>{
 const base=SCENARIOS.find(s=>s.id==='bend'),directions=new Set();
 for(let seed=1;seed<=40;seed++){const old=generateScenario(base,seed),s=generateScenario(base,seed,HOLE_VARIETY_VERSION);if(seed%2===0)assert.ok(Math.abs(s.generation.bend)<Math.abs(old.generation.bend));else assert.equal(s.generation.bend,old.generation.bend);directions.add(Math.sign(s.generation.bend));}
 assert.equal(directions.size,2);
});
test('layout version survives learning/course/free-practice saves; missing versions retain legacy generation',()=>{
 for(const factory of [p=>createRound('assessment',1234,p),p=>createCourse(1234,p)]){
  for(const version of [undefined,HOLE_VARIETY_VERSION]){const r=factory({handicap:'20',limit:225,...(version?{layoutVersion:version}:{})}),saved=r.kind==='course'?readCourse(JSON.stringify(r)):readRound(JSON.stringify(r));assert.ok(saved);assert.equal(saved.profile.layoutVersion,version);const slot=saved.schedule[0],base=SCENARIOS.find(s=>s.id===slot.id);assert.deepEqual(generateScenario(base,slot.holeSeed,saved.profile.layoutVersion),generateScenario(base,slot.holeSeed,version));}
 }
 const free=practiceSnapshot({scenario:'bend',holeSeed:17,seed:1234,landscape:'woodland',aim:{x:0,y:200},practiceFilter:'tee',recent:['bend'],layoutVersion:HOLE_VARIETY_VERSION},true);assert.equal(readPractice(JSON.stringify(free)).layoutVersion,HOLE_VARIETY_VERSION);
});

test('new Par-3 schedules retain the long-hole mix and use the selected profile reach',()=>{for(const handicap of ['0','5','10','20']){const profile={handicap,limit:handicap==='20'?225:265,layoutVersion:HOLE_VARIETY_VERSION},round=createCourse(7142026,profile);assert.ok(round.schedule.filter(s=>s.distanceBand==='long').length>=4);for(const slot of round.schedule){const s=generateScenario(SCENARIOS.find(s=>s.id===slot.id),slot.holeSeed,profile.layoutVersion),range=courseDistanceRange(profile,slot.id,null,slot.distanceBand==='long');assert.ok(Math.hypot(s.pin.x,s.pin.y)<=range.max+.01,`${handicap}/${slot.id}`);}}});
