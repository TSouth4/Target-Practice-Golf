// Reproducible read-only review cases. Redirect stdout to retain a JSON report.
import {SCENARIOS,DEFAULT_COSTS,basicPattern,patternAtTarget,fitTarget,samples,evaluate,optimizeTargets,shotAt,outcome,lie} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
import {CALM,LEGACY_ROLLOUT,SURFACE_ROLLOUT,CONDITIONS_VERSION} from '../dist/conditions.js';
import {fairwaySection} from '../dist/landscape.js';
import {createCourse} from '../dist/course.js';
import {MODEL_VERSION} from '../dist/progress.js';
import {readFileSync} from 'node:fs';
const legacy=process.argv.includes('--legacy'),rolloutRules=legacy?LEGACY_ROLLOUT:SURFACE_ROLLOUT,app=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).version;
const drawSeed=7142026,n=4000,draws=samples(n,drawSeed),report={schema:1,app,model:legacy?'decision-model-v7':MODEL_VERSION,rolloutRules,drawSeed,n,conditions:CALM,scope:'Internal model consistency and owner review; not empirical golfer calibration',cases:[]};
const long=createCourse(1234,{handicap:'20',limit:225},'woodland').schedule.find(s=>s.distanceBand==='long');
for(const item of [{key:'front-water',id:'water',seed:578,h:'20'},{key:'tucked-flag',id:'tucked',seed:17,h:'5'},{key:'crossing-creek-longer',id:'creek-tee',seed:1,h:'0'},{key:'crossing-creek-shorter',id:'creek-tee',seed:1,h:'20'},{key:'sharp-dogleg',id:'sharp-dogleg',seed:5,h:'20'},{key:'long-par3',id:long.id,seed:long.holeSeed,h:'20'}]){
 const s=generateScenario(SCENARIOS.find(s=>s.id===item.id),item.seed),p={...basicPattern(item.h,s),aimMode:'carry',rolloutRules,conditions:{...CALM}},target=a=>fitTarget(a,p),center=target({x:s.green.x,y:s.green.y}),selected=target({x:0,y:s.aimY}),best=await optimizeTargets(selected,p,s,DEFAULT_COSTS,draws),candidates=[['flag direction/carry (capped if unreachable)',target(s.pin)],['green center (capped if unreachable)',center]];
 if(item.key==='front-water')candidates.push(['short layup from regression example',target({x:18,y:81})]);
 if(item.key==='tucked-flag')candidates.push(['far safe-side green target',target({x:s.green.x-Math.sign(s.pin.x-s.green.x)*s.green.rx*.8,y:s.green.y})]);
 if(item.id==='creek-tee'){const creek=s.hazards.find(h=>h.kind==='water'),ys=creek.poly.map(v=>v[1]);for(const [name,y] of [['before creek',Math.min(...ys)-12],['beyond creek',Math.max(...ys)+12]]){const [a,b]=fairwaySection(s,y);candidates.push([name+' (capped if unreachable)',target({x:(a+b)/2,y})]);}}
 if(item.key==='sharp-dogleg')candidates.push(['straight at selected depth',selected]);
 candidates.push(['best sampled target',best.aim]);
 const summarize=([label,aim])=>{const pattern=patternAtTarget(aim,p),r=evaluate(aim,pattern,s,DEFAULT_COSTS,draws,true);return{label,aim,carry:pattern.carry,club:pattern.club,targetLie:lie(aim,s),expected:r.expected,extraVsSampledBest:r.expected-best.result.expected,percentages:Object.fromEntries(Object.entries(r.counts).map(([k,v])=>[k,100*v/n])),breakdown:r.breakdown,baselineClamped:r.baselineClamped};};
 report.cases.push({key:item.key,family:item.id,holeSeed:item.seed,generator:s.generatorVersion,handicap:item.h,flagYards:Math.hypot(s.pin.x,s.pin.y),green:s.green,pin:s.pin,aimRange:s.aimRange,bounds:s.bounds,hazards:s.hazards,targets:candidates.map(summarize)});
}
// Isolate terrain-roll rules with zero wind; this is a diagnostic, not a generated Medium hole.
const scene={...SCENARIOS[0],bounds:[-100,100],maxY:400,green:{x:80,y:300,rx:10,ry:10},fairway:[[-30,0],[30,0],[30,400],[-30,400]],hazards:[{kind:'bunker',poly:[[-20,155],[20,155],[20,165],[-20,165]]}],pin:{x:0,y:300}},base={carry:150,roll:15,sdSide:0,sdLong:0,rho:0,start:0,curve:0,bias:0,bigPct:0,height:25},draw={z1:0,z2:0,u:1,sign:1};
report.diagnostics={normalGroundRoll:[CALM,{version:CONDITIONS_VERSION,difficulty:'medium',windX:0,windY:0,firmness:'normal'}].map(conditions=>{const shot=shotAt({x:0,y:150},{...base,conditions,rolloutRules},draw,scene);return{conditions,landing:shot.landing,finish:{x:shot.x,y:shot.y},lie:outcome(shot,scene).kind};})};
console.log(JSON.stringify(report,null,2));
