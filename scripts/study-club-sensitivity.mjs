// Internal model stress study only. Does not alter runtime modules or saved data.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {SCENARIOS,DEFAULT_COSTS,basicPattern,patternAtTarget,fitTarget,samples,evaluate,optimizeTargets} from '../dist/model.js';
import {trainingBag,reachLimit} from '../dist/bag.js';import {generateScenario} from '../dist/practice.js';import {fairwaySection} from '../dist/landscape.js';import {CALM,SURFACE_ROLLOUT} from '../dist/conditions.js';import {MODEL_VERSION} from '../dist/progress.js';
const n=4000,seeds=[7142026,112358,271828],draws=seeds.map(seed=>samples(n,seed));
const setup=(h,s)=>({...basicPattern(h,s),aimMode:'carry',conditions:{...CALM},rolloutRules:SURFACE_ROLLOUT});
const capacities=p=>trainingBag(p).map(c=>({club:c.club,capacity:c.stock-c.roll})).sort((a,b)=>a.capacity-b.capacity);
const cost=(r,m={})=>{if(!r.breakdown)return r.expected;const b=r.breakdown;return b.shot+b.nextShot+b.water+b.ob+b.rough*(m.rough??1)+b.bunker*(m.bunker??1)+b.trees*(m.trees??1);};
const variants=[{id:'default'},...['side','depth','both'].flatMap(axis=>[.8,1.2].map(scale=>({id:`${axis}-${scale}`,side:axis==='depth'?1:scale,depth:axis==='side'?1:scale}))),...[.98,1.02].map(scale=>({id:`stock-${scale}`,stock:scale})),...['all','woods','sand'].flatMap(kind=>[.75,1.25].map(scale=>({id:`recovery-${kind}-${scale}`,premium:kind==='all'?{rough:scale,bunker:scale,trees:scale}:kind==='woods'?{trees:scale}:{bunker:scale}})))];
function altered(p,v){return{...p,driverSide:p.driverSide*(v.side??1),ironSide:p.ironSide*(v.side??1),driverLong:p.driverLong*(v.depth??1),ironLong:p.ironLong*(v.depth??1),driverLimit:p.driverLimit*(v.stock??1)};}
const result={schema:1,app:JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url))).version,model:MODEL_VERSION,n,seeds,scope:'Internal stress tests, not empirical golfer calibration. Bands are exploratory, not confidence intervals.',variants,boundaries:[],cases:[],lockedClub:[],reoptimized:[]};
for(const h of ['0','5','10','20'])for(const type of ['tee','approach']){
 const s=SCENARIOS.find(s=>s.type===type),p=setup(h,s),bag=capacities(p);
 for(const b of bag.slice(0,-1)){const a=patternAtTarget({x:0,y:b.capacity-.01},p),z=patternAtTarget({x:0,y:b.capacity+.01},p);assert.notEqual(a.club,z.club);result.boundaries.push({handicap:h,type,capacity:b.capacity,from:a.club,to:z.club,sideBefore:a.sdSide,sideAfter:z.sdSide,sideChangePct:100*(z.sdSide/a.sdSide-1),depthBefore:a.sdLong,depthAfter:z.sdLong,depthChangePct:100*(z.sdLong/a.sdLong-1),rollBefore:a.roll,rollAfter:z.roll});}
}
const fixtures=[['front-water','water',578],['tucked','tucked',17],['long-approach','split',347430499],['dogleg','sharp-dogleg',5],['creek','creek-tee',1],['shoreline','shore-green',29]];
for(const [key,id,seed]of fixtures)for(const h of ['0','5','10','20']){
 const s=generateScenario(SCENARIOS.find(s=>s.id===id),seed),p=setup(h,s),best=await optimizeTargets(fitTarget({x:0,y:s.aimY},p),p,s,DEFAULT_COSTS,draws[0]);
 const targets=[],add=(label,aim)=>{if(!targets.some(t=>Math.hypot(t.aim.x-aim.x,t.aim.y-aim.y)<1e-8))targets.push({label,aim});};
 add('sampled-best',best.aim);add('green-center-capped',fitTarget(s.green,p));add('flag-capped',fitTarget(s.pin,p));
 if(key==='front-water')add('short-layup',{x:18,y:81});
 if(key==='tucked')add('far-safe-green',{x:s.green.x-Math.sign(s.pin.x-s.green.x)*s.green.rx*.8,y:s.green.y});
 if(key==='long-approach')add('owner-front-green',{x:18,y:167});
 if(key==='dogleg'){const [l,r]=fairwaySection(s,140);add('earlier-fairway',{x:(l+r)/2,y:140});add('straight-210',fitTarget({x:0,y:210},p));}
 if(key==='creek'){const creek=s.hazards.find(h=>h.kind==='water'),y=Math.min(...creek.poly.map(p=>p[1]))-12,[l,r]=fairwaySection(s,y);add('before-creek',{x:(l+r)/2,y});}
 if(key==='shoreline'){const side=s.hazards.find(h=>h.kind==='water').reliefSide;add('safer-green',{x:s.green.x-side*s.green.rx*.5,y:s.green.y});}
 const d=Math.hypot(best.aim.x,best.aim.y),near=capacities(p).slice(0,-1).sort((a,b)=>Math.abs(a.capacity-d)-Math.abs(b.capacity-d))[0];
 if(Math.abs(near.capacity-d)<=3){for(const delta of [-.01,.01]){const scale=(near.capacity+delta)/d;add(delta<0?'just-below-switch':'just-above-switch',{x:best.aim.x*scale,y:best.aim.y*scale});}}
 const baseRuns=draws.map(zs=>targets.map(t=>evaluate(t.aim,patternAtTarget(t.aim,p),s,DEFAULT_COSTS,zs,true)));
 for(const run of baseRuns)for(const r of run)assert.ok(Math.abs(cost(r)-r.expected)<1e-9||!Number.isFinite(r.expected));
 const rows=variants.map(v=>{const pv=altered(p,v);const runs=draws.map((zs,si)=>{const values=targets.map((t,ti)=>{if(Math.hypot(t.aim.x,t.aim.y)>reachLimit(pv)+1e-7)return null;const r=v.premium||v.id==='default'?baseRuns[si][ti]:evaluate(t.aim,patternAtTarget(t.aim,pv),s,DEFAULT_COSTS,zs);return v.premium?cost(r,v.premium):r.expected;});const finite=values.filter(Number.isFinite),minimum=Math.min(...finite),winner=values.findIndex(v=>v===minimum);return{seed:seeds[si],winner:targets[winner]?.label||null,values,minimum,selectedBestGap:values[0]===null?null:values[0]-minimum};});return{id:v.id,runs};});
 result.cases.push({key,scenario:id,holeSeed:seed,handicap:h,type:s.type,flagYards:Math.hypot(s.pin.x,s.pin.y),best:{aim:best.aim,carry:best.pattern.carry,club:best.pattern.club,expected:best.result.expected},nearestSwitch:near,distanceToSwitch:Math.abs(d-near.capacity),targets:targets.map((t,i)=>({...t,club:patternAtTarget(t.aim,p).club,carry:Math.hypot(t.aim.x,t.aim.y),expected:baseRuns[0][i].expected,counts:baseRuns[0][i].counts,breakdown:baseRuns[0][i].breakdown})),sensitivity:rows});
 console.error(`Reviewed ${key}, handicap ${h} (${result.cases.length}/24)`);
}
// Compare the owner's two long-approach targets using the same feasible 3-wood.
const longScene=generateScenario(SCENARIOS.find(s=>s.id==='split'),347430499),p=setup('20',longScene),aims=[{label:'front',aim:{x:18,y:167}},{label:'center',aim:{x:longScene.green.x,y:longScene.green.y}}],ref=patternAtTarget(aims[1].aim,p);
for(let si=0;si<seeds.length;si++)for(const mode of ['automatic','same-3-wood'])result.lockedClub.push({seed:seeds[si],mode,targets:aims.map(t=>{const d=Math.hypot(t.aim.x,t.aim.y);assert.ok(d<=ref.stockDistance);const q=mode==='automatic'?patternAtTarget(t.aim,p):{...ref,autoBag:false,carry:d,sdSide:ref.sdSide*d/ref.carry,sdLong:ref.sdLong*d/ref.carry};return{label:t.label,club:q.club,sdSide:q.sdSide,sdLong:q.sdLong,expected:evaluate(t.aim,q,longScene,DEFAULT_COSTS,draws[si]).expected};})});
// Re-optimize the two owner cases for pattern/stock changes, not only fixed rows.
for(const [key,id,seed]of fixtures.filter(f=>['long-approach','dogleg'].includes(f[0])))for(const v of variants.filter(v=>['default','both-0.8','both-1.2','stock-0.98','stock-1.02'].includes(v.id))){const s=generateScenario(SCENARIOS.find(s=>s.id===id),seed),p=altered(setup('20',s),v),best=await optimizeTargets(fitTarget({x:0,y:s.aimY},p),p,s,DEFAULT_COSTS,draws[0]);result.reoptimized.push({key,variant:v.id,aim:best.aim,carry:best.pattern.carry,club:best.pattern.club,expected:best.result.expected});console.error(`Reoptimized ${key}, ${v.id}`);}
fs.writeFileSync(new URL('../docs/CLUB-SENSITIVITY-STUDY.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log('Study complete: '+result.cases.length+' cases, '+result.boundaries.length+' club boundaries.');
