import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,DEFAULT_COSTS,fairwayRemaining,basicPattern,patternAtTarget,evaluate,samples,optimizeTargets} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
test('short pitches include meaningful recovery cost and distance costs remain continuous and increasing',()=>{
 const c=DEFAULT_COSTS;
 for(const [d,v] of [[0,2.05],[20,2.4],[50,2.65],[100,2.85],[150,3.1]])assert.ok(Math.abs(fairwayRemaining(d,c)-v)<1e-9);
 for(let d=1;d<=400;d++)assert.ok(fairwayRemaining(d,c)>fairwayRemaining(d-1,c));
 for(const d of [20,50,100,150])assert.ok(Math.abs(fairwayRemaining(d-.0001,c)-fairwayRemaining(d+.0001,c))<.0001);
 assert.equal(fairwayRemaining(150,{...c,base150:3.7}),3.7);
});
test('122-yard front-water approach can favor clearing the water for a 20-handicap profile',async()=>{
 const s=generateScenario(SCENARIOS.find(s=>s.id==='water'),578);
 assert.equal(s.length,122);assert.equal(s.length,Math.round(Math.hypot(s.pin.x,s.pin.y)));
 const p={...basicPattern(20,s),aimMode:'carry'},zs=samples(4000);
 const layup={x:18,y:81},center={x:s.green.x,y:s.green.y};
 const cost=aim=>evaluate(aim,patternAtTarget(aim,p),s,DEFAULT_COSTS,zs).expected;
 assert.ok(cost(center)<cost(layup));
 const best=await optimizeTargets(center,p,s,DEFAULT_COSTS,zs);
 assert.ok(best.aim.y>115);assert.ok(best.result.expected<=cost(center));
});
