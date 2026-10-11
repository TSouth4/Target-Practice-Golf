import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,lie,fitTarget,basicPattern,patternAtTarget,evaluate,optimizeTargets,samples,DEFAULT_COSTS} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
import {TEE_GENERATOR_VERSION,validPolygon,validateTeeScenario} from '../dist/tee-generator.js';
import {reachLimit} from '../dist/bag.js';

test('generated tee families reproduce valid geometry without mutating the authored baseline',()=>{
 for(const base of SCENARIOS.filter(s=>s.type==='tee')){
  const original=JSON.stringify(base);
  for(let seed=1;seed<=500;seed++){
   const s=generateScenario(base,seed);
   assert.equal(s.generatorVersion,TEE_GENERATOR_VERSION);assert.ok(!s.generation.fallback);
   assert.deepEqual(validateTeeScenario(s),[],`${base.id}, seed ${seed}`);
   assert.ok(s.hazards.every(h=>validPolygon(h.poly)));
   assert.equal(lie(s.pin,s),'green');
   if(seed<=10)assert.deepEqual(s,generateScenario(base,seed));
  }
  assert.equal(JSON.stringify(base),original);
 }
});

test('layout validation rejects crossing polygons, covered pins, unsafe drops, and unreachable landing areas',()=>{
 assert.equal(validPolygon([[0,0],[10,10],[0,10],[10,0]]),false);
 const base=SCENARIOS.find(s=>s.id==='cedar'),s=generateScenario(base,17);
 const covered=structuredClone(s);covered.hazards.unshift({kind:'bunker',label:'Invalid green bunker',poly:[[s.pin.x-4,s.pin.y-4],[s.pin.x+4,s.pin.y-4],[s.pin.x+4,s.pin.y+4],[s.pin.x-4,s.pin.y+4]]});
 assert.ok(validateTeeScenario(covered).includes('pin'));
 assert.ok(validateTeeScenario(covered).includes('Invalid green bunker touches green'));
 const drop=structuredClone(s);drop.hazards.find(h=>h.kind==='water').drop={x:s.bounds[1]+20,y:200};assert.ok(validateTeeScenario(drop).includes('water drop'));
 const unreachable=structuredClone(s);unreachable.aimRange[0]=190;assert.ok(validateTeeScenario(unreachable).includes('reachable landing area'));
});

test('tee variation changes bend onset, width profile, hazard distances, and reachable green choices',()=>{
 for(const id of ['cedar','bend','drivable','narrow']){
  const base=SCENARIOS.find(s=>s.id===id),widths=new Set(),necks=new Set(),greens=new Set(),hazards=new Set(),directions=new Set();
  for(let seed=1;seed<=60;seed++){
   const s=generateScenario(base,seed);widths.add(Math.round(s.generation.earlyWidth-s.generation.lateWidth));necks.add(Math.round(s.generation.neckY/10));greens.add(Math.round(s.green.y/10));
   hazards.add(Math.round(Math.min(...s.hazards.find(h=>!h.forest).poly.map(p=>p[1]))/10));directions.add(Math.sign(s.generation.bend));
  }
  assert.ok(widths.size>=5);assert.ok(necks.size>=5);assert.ok(greens.size>=5);assert.ok(hazards.size>=3);assert.equal(directions.size,2);
 }
});

test('representative generated layouts keep scoring, club reach, and sampled comparison consistent',async()=>{
 const zs=samples(300,811);
 for(const base of SCENARIOS.filter(s=>s.type==='tee'))for(const [seed,h,limit] of [[3,20,180],[17,10,250],[43,0,330]]){
  const s=generateScenario(base,seed),p=basicPattern(h,s,limit);let safe;
  for(let y=130;y<=170&&!safe;y+=5)for(let x=-30;x<=30;x+=5)if(Math.hypot(x,y)<=reachLimit(p)&&lie({x,y},s)==='fairway'){safe={x,y};break;}
  assert.ok(safe,`${base.id}, seed ${seed}, reach ${limit}`);
  const selected=evaluate(safe,patternAtTarget(safe,p),s,DEFAULT_COSTS,zs),best=await optimizeTargets(safe,p,s,DEFAULT_COSTS,zs);
  assert.ok(Number.isFinite(selected.expected));assert.ok(best.result.expected<=selected.expected);
  assert.ok(Math.hypot(best.aim.x,best.aim.y)<=reachLimit(p)+1e-7);assert.deepEqual(best.pattern,patternAtTarget(best.aim,p));
 }
});

test('the same generated short par 4 rewards reaching the green or laying up according to the player profile',async()=>{
 const s=generateScenario(SCENARIOS.find(s=>s.id==='drivable'),1),zs=samples(1200,912);
 const scratch=basicPattern(0,s),higher=basicPattern(20,s);
 const go=await optimizeTargets({x:0,y:150},scratch,s,DEFAULT_COSTS,zs),layup=await optimizeTargets({x:0,y:150},higher,s,DEFAULT_COSTS,zs);
 assert.equal(lie(go.aim,s),'green');assert.ok(go.result.counts.green/zs.length>.5);
 assert.equal(lie(layup.aim,s),'fairway');assert.ok(layup.aim.y<s.green.y-s.green.ry-15);
 const longAim=fitTarget(s.pin,higher),long=evaluate(longAim,patternAtTarget(longAim,higher),s,DEFAULT_COSTS,zs);
 assert.ok(long.expected>layup.result.expected+.1);
});
