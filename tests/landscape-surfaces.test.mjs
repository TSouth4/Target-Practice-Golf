import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,lie,evaluate,basicPattern,fitTarget,patternAtTarget,samples,DEFAULT_COSTS} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
import {LANDSCAPES,vegetation} from '../dist/landscape.js';
import {RELIEF,surfaceHeight,projectSurface,unprojectSurface} from '../dist/surfaces.js';
test('dense vegetation occupies scored recovery zones or OB, preserving clear fairways and greens',()=>{for(const base of SCENARIOS){const s=generateScenario(base,711);for(const style of Object.keys(LANDSCAPES)){const plants=vegetation(s,style);assert.ok(plants.length>30);assert.deepEqual(plants,vegetation(s,style));for(const p of plants){assert.ok(['trees','ob'].includes(lie(p,s)));assert.equal(lie(p,s),p.kind);assert.ok(Number.isFinite(p.height)&&p.height>0);}}}const bend=generateScenario(SCENARIOS[1]);assert.ok(vegetation(bend).length>500);assert.ok(bend.hazards.filter(h=>h.forest).length===2);});
test('landscape choices leave shot outcomes identical on the same geometry and seed',()=>{const s=generateScenario(SCENARIOS[1],331),p=basicPattern(5,s),a=fitTarget({x:0,y:250},p),zs=samples(800,811),before=JSON.stringify(s),r=evaluate(a,patternAtTarget(a,p),s,DEFAULT_COSTS,zs);for(const style of Object.keys(LANDSCAPES)){vegetation(s,style);assert.equal(JSON.stringify(s),before);assert.deepEqual(evaluate(a,patternAtTarget(a,p),s,DEFAULT_COSTS,zs),r);}});
test('relief gives raised greens, lower sand and water, while keeping lie footprints unchanged',()=>{const s=generateScenario(SCENARIOS[2]);for(const [p,kind,sign] of [[{x:0,y:150},'green',1],[{x:-31,y:148},'bunker',-1],[{x:34,y:117},'water',-1]]){assert.equal(lie(p,s),kind);assert.ok(surfaceHeight(s,p)*sign>0);}assert.equal(surfaceHeight(s,{x:0,y:70}),0);assert.equal(surfaceHeight(s,{x:0,y:150}),RELIEF.green);});
test('clicking the rendered center of green, sand or water resolves to its actual surface location',()=>{const s=generateScenario(SCENARIOS[2]);for(const p of [{x:0,y:150},{x:-31,y:148},{x:34,y:117}])for(const elevation of [0,8]){const screen=projectSurface(s,p,elevation),back=unprojectSurface(s,screen.x,screen.y,elevation);assert.equal(lie(back,s),lie(p,s));assert.ok(Math.hypot(p.x-back.x,p.y-back.y)<1e-6);}});

test('automatic environments are deterministic, cover every style, and avoid immediate repeats',async()=>{
 const {nextLandscape}=await import('../dist/practice.js');let current='woodland';const seen=new Set([current]);
 for(let seed=1;seed<=100;seed++){const next=nextLandscape(current,seed);assert.equal(next,nextLandscape(current,seed));assert.notEqual(next,current);assert.ok(LANDSCAPES[next]);seen.add(next);current=next;}
 assert.equal(seen.size,Object.keys(LANDSCAPES).length);
});
