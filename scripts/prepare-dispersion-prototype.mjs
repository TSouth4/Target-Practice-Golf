import fs from 'node:fs';
import {SCENARIOS,basicPattern,patternAtTarget,samples,evaluate,DEFAULT_COSTS,decisionScore} from '../dist/model.js';
import {trainingBag} from '../dist/bag.js';
import {generateScenario} from '../dist/practice.js';
import {CALM,SURFACE_ROLLOUT} from '../dist/conditions.js';
import {EXPERIMENTS,experimentDraws,fixedClubPattern} from './dispersion-experiment.mjs';
const seeds=[7142026,112358,271828],draws=seeds.map(s=>samples(4000,s)),data={version:1,seeds,n:4000,experiments:EXPERIMENTS,cases:[]};
for(const [id,label,seed] of [['split','Long approach',347430499],['water','Front water',578],['tucked','Tucked flag',17]])for(const handicap of ['5','20']){
 const scene=generateScenario(SCENARIOS.find(s=>s.id===id),seed),base={...basicPattern(handicap,scene),aimMode:'carry',conditions:{...CALM},rolloutRules:SURFACE_ROLLOUT};
 const reference=patternAtTarget({x:scene.green.x,y:scene.green.y+8},base),club=trainingBag(base).find(c=>c.club===reference.club),targets=[];
 const add=(label,aim)=>{if(!fixedClubPattern(base,club,aim))return null;const old=targets.findIndex(t=>Math.hypot(t.aim.x-aim.x,t.aim.y-aim.y)<.001);if(old>=0)return old;targets.push({label,aim});return targets.length-1;};
 const presets=[['Flag',scene.pin],['Green center',{x:scene.green.x,y:scene.green.y}],['Front-center',{x:scene.green.x,y:scene.green.y-scene.green.ry*.6}]].map(([label,aim])=>({label,index:add(label,aim)})).filter(p=>p.index!==null);
 for(let x=-18;x<=18;x+=6)for(let y=-24;y<=24;y+=8)add('Grid target',{x:scene.green.x+x,y:scene.green.y+y});
 const variants=[];
 for(const v of EXPERIMENTS){const zs=draws.map(z=>experimentDraws(z,v.id)),values=targets.map(t=>evaluate(t.aim,fixedClubPattern(base,club,t.aim),scene,DEFAULT_COSTS,zs[0]).expected);let best=0;for(let i=1;i<values.length;i++)if(values[i]<values[best])best=i;
 const visible=[...new Set([...presets.map(p=>p.index),best])],results={};
 for(const i of visible){const aim=targets[i].aim,p=fixedClubPattern(base,club,aim),r=evaluate(aim,p,scene,DEFAULT_COSTS,zs[0],true),d=p.carry,sin=aim.x/d,cos=aim.y/d;let short=0,long20=0,long40=0;for(const point of r.points){const error=point.landing.x*sin+point.landing.y*cos-d;if(error<0)short++;if(error>20)long20++;if(error>40)long40++;}
 results[i]={expected:r.expected,score:decisionScore(r.expected,values[best],aim,targets[best].aim),counts:r.counts,short,long20,long40,carry:d,sdLong:p.sdLong,points:r.points.filter((_,j)=>j%8===0).map(q=>({x:q.landing.x,y:q.landing.y,kind:q.kind})),independentCosts:zs.map(z=>evaluate(aim,p,scene,DEFAULT_COSTS,z).expected)};
 }
 variants.push({id:v.id,best,values,results});
 }
 // Make every pattern's winner available under every pattern for fair target comparisons.
 const shared=[...new Set(variants.map(v=>v.best))];for(const v of variants){const zs=draws.map(z=>experimentDraws(z,v.id));for(const i of shared)if(!v.results[i]){const aim=targets[i].aim,p=fixedClubPattern(base,club,aim),r=evaluate(aim,p,scene,DEFAULT_COSTS,zs[0],true),d=p.carry,sin=aim.x/d,cos=aim.y/d;const errors=r.points.map(q=>q.landing.x*sin+q.landing.y*cos-d);v.results[i]={expected:r.expected,score:decisionScore(r.expected,v.values[v.best],aim,targets[v.best].aim),counts:r.counts,short:errors.filter(x=>x<0).length,long20:errors.filter(x=>x>20).length,long40:errors.filter(x=>x>40).length,carry:d,sdLong:p.sdLong,points:r.points.filter((_,j)=>j%8===0).map(q=>({x:q.landing.x,y:q.landing.y,kind:q.kind})),independentCosts:zs.map(z=>evaluate(aim,p,scene,DEFAULT_COSTS,z).expected)};}}
 data.cases.push({label,handicap,scene,club:club.club,capacity:club.stock-club.roll,targets,presets,variants});console.log('Prepared',label,handicap,targets.length,'feasible grid targets');
}
fs.writeFileSync('docs/DISPERSION-PROTOTYPE-RESULTS.json',JSON.stringify(data,null,2)+'\n');
const template=fs.readFileSync('scripts/templates/dispersion-prototype.html','utf8');fs.writeFileSync('dist/dispersion-prototype.html',template.replace('/* DATA */',JSON.stringify(data).replaceAll('<','\\u003c')));
