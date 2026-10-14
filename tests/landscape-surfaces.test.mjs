import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,lie,remaining,evaluate,basicPattern,fitTarget,patternAtTarget,samples,optimizeTargets,DEFAULT_COSTS} from '../dist/model.js';
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

test('seeded woods vary independently, preserve repeatable layouts, and charge denser recovery zones more',()=>{
 const sides=new Set();for(let seed=1;seed<=100;seed++){
  const s=generateScenario(SCENARIOS[0],seed),dense=s.woods.find(w=>w.recoveryMultiplier>1),open=s.woods.find(w=>w.recoveryMultiplier<1);
  assert.ok(dense&&open);assert.ok(dense.buffer<open.buffer);assert.ok(dense.density>open.density);assert.ok(dense.height>open.height);sides.add(dense.side);
  assert.deepEqual(s,generateScenario(SCENARIOS[0],seed));
  for(const h of s.hazards.filter(h=>h.forest)){
   const p={x:h.poly.reduce((sum,v)=>sum+v[0],0)/h.poly.length,y:h.poly.reduce((sum,v)=>sum+v[1],0)/h.poly.length};
   if(lie(p,s)!=='trees')continue;
   const base=remaining(p,s,DEFAULT_COSTS,'trees');
   assert.ok(Math.abs(remaining(p,s,{...DEFAULT_COSTS,trees:.3},'trees')-base-.3*h.recoveryMultiplier)<1e-9);
  }
 }
 assert.equal(sides.size,2);
});

test('swapping dense and open recovery costs changes the sensible target side on the same corridor',async()=>{
 const s=structuredClone(SCENARIOS[0]);Object.assign(s,{pin:{x:0,y:350},green:{x:0,y:350,rx:15,ry:20},bounds:[-80,80],maxY:400,aimRange:[170,300],aimY:250,fairway:[[-15,0],[15,0],[15,320],[-15,320]],hazards:[{kind:'trees',forest:true,label:'Left woods',recoveryMultiplier:1.6,poly:[[-50,45],[-15,45],[-15,320],[-50,320]]},{kind:'trees',forest:true,label:'Right woods',recoveryMultiplier:.5,poly:[[15,45],[50,45],[50,320],[15,320]]}]});
 const p=basicPattern(20,s),zs=samples(1200,412),leftDense=await optimizeTargets({x:0,y:250},p,s,DEFAULT_COSTS,zs);
 s.hazards[0].recoveryMultiplier=.5;s.hazards[1].recoveryMultiplier=1.6;
 const rightDense=await optimizeTargets({x:0,y:250},p,s,DEFAULT_COSTS,zs);
 assert.ok(leftDense.aim.x>5);assert.ok(rightDense.aim.x< -5);
});
test('shoreline environments are offered only with existing side water and backgrounds do not change scoring',async()=>{
 const {shorelineWater,drawBackdrop}=await import('../dist/landscape.js'),{nextLandscape}=await import('../dist/practice.js');let lake=0,ocean=0,mountain=0,eligible=0;
 for(const base of SCENARIOS)for(let seed=1;seed<=25;seed++){const s=generateScenario(base,seed),before=JSON.stringify(s),shore=shorelineWater(s),style=nextLandscape('woodland',seed,s);if(shore)eligible++;if(style==='lake')lake++;if(style==='ocean')ocean++;if(style==='mountain')mountain++;
  if(['lake','ocean'].includes(style)){assert.ok(shore,base.id);assert.ok(s.hazards.includes(shore));const row=shore.poly[Math.floor((shore.poly.length-2)/2)],center=s.shoreline?{x:(row[0]+shore.poly.at(-1)[0])/2,y:row[1]}:{x:shore.poly.reduce((n,p)=>n+p[0]/shore.poly.length,0),y:shore.poly.reduce((n,p)=>n+p[1]/shore.poly.length,0)};assert.equal(lie(center,s),'water');}
  for(const style of ['mountain','lake','ocean']){assert.match(drawBackdrop(style,s),new RegExp('data-environment="'+style+'"'));assert.ok(!/NaN|undefined/.test(drawBackdrop(style,s)));}assert.equal(JSON.stringify(s),before);
 }
 assert.ok(eligible>0&&lake>0&&ocean>0&&mountain>0);
 const dry=generateScenario(SCENARIOS.find(s=>s.id==='split'),20);assert.equal(shorelineWater(dry),undefined);for(let seed=1;seed<100;seed++)assert.ok(!['lake','ocean'].includes(nextLandscape('woodland',seed,dry)));
});
