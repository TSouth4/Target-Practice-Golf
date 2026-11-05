// Isolated comparison of feasible club/target pairs; never imported by the app.
import fs from 'node:fs';
import {SCENARIOS,basicPattern,patternAtTarget,samples,evaluate,DEFAULT_COSTS} from '../dist/model.js';
import {trainingBag} from '../dist/bag.js';
import {generateScenario} from '../dist/practice.js';
import {CALM,SURFACE_ROLLOUT} from '../dist/conditions.js';
const seeds=[7142026,112358,271828],draws=seeds.map(s=>samples(4000,s)),cases=[];
for(const [label,id,seed,targets] of [
 ['Long approach','split',347430499,[['Front',{x:18,y:167}],['Center',null]]],
 ['Dogleg','sharp-dogleg',5,[['Earlier fairway',{x:7.636243541538617,y:140}],['Longer corner target',{x:86,y:191}]]]
]){
 const s=generateScenario(SCENARIOS.find(s=>s.id===id),seed),base={...basicPattern('20',s),aimMode:'carry',conditions:{...CALM},rolloutRules:SURFACE_ROLLOUT};
 const rows=[];
 for(const [target,point] of targets){const aim=point||{x:s.green.x,y:s.green.y},d=Math.hypot(aim.x,aim.y),automatic=patternAtTarget(aim,base);
 for(const club of trainingBag(base)){
  const capacity=club.stock-club.roll,f=d/capacity;if(f>1+1e-7||f<.75)continue;
  const pattern={...base,autoBag:false,club:club.club,carry:d,roll:club.roll,sdSide:club.sdSide*f,sdLong:club.sdLong*f};
  const costs=draws.map(z=>evaluate(aim,pattern,s,DEFAULT_COSTS,z).expected);
  rows.push({target,aim,club:club.club,automatic:club.club===automatic.club,fraction:f,sdSide:pattern.sdSide,sdLong:pattern.sdLong,costs,mean:costs.reduce((a,b)=>a+b)/costs.length});
 }
 }
 cases.push({label,rows});
}
const data={seeds,cases};fs.writeFileSync('docs/CLUB-SELECTION-PROTOTYPE.json',JSON.stringify(data,null,2)+'\n');
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;');
const body=cases.map(c=>`<section><h2>${c.label}</h2><div style="overflow-x:auto"><table><thead><tr><th>Target</th><th>Club</th><th>Stock carry used</th><th>Estimated strokes to finish ↓</th><th>Range across samples</th></tr></thead><tbody>${c.rows.map(r=>`<tr><td>${esc(r.target)} · ${Math.hypot(r.aim.x,r.aim.y).toFixed(1)} yd</td><td>${esc(r.club)}${r.automatic?' (current automatic)':''}</td><td>${(100*r.fraction).toFixed(0)}%</td><td>${r.mean.toFixed(3)}</td><td>${Math.min(...r.costs).toFixed(3)}–${Math.max(...r.costs).toFixed(3)}</td></tr>`).join('')}</tbody></table></div></section>`).join('');
fs.writeFileSync('dist/club-selection-prototype.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Club selection comparison — Target Practice</title><style>body{font:18px/1.5 system-ui;background:#f5f0e4;color:#123c32;max-width:1000px;margin:30px auto;padding:20px}section{background:white;padding:20px;margin:24px 0;border-radius:12px}th,td{text-align:left;padding:12px;border-bottom:1px solid #ddd}a{color:inherit}</style><main><a href="/">Back to app</a> · <a href="dispersion-prototype.html">Compare carry patterns</a><h1>Club selection comparison</h1><p>Research prototype — the main scoring model is unchanged.</p><p>Compare several feasible clubs at each fixed target. Lower estimated strokes is better. Each row uses three independent sets of 4,000 shots, with the same misses across choices.</p><p><strong>Important:</strong> reduced swings use the existing proportional spread assumption. That is not measured evidence. Only clubs requiring 75–100% of stock carry are shown; this threshold is an experimental scope limit, not a recommendation. Small differences may be near-equivalent. These are fixed targets, not a search for the best possible shot.</p><p>The dogleg uses the two original owner-review targets. Their routes through the trees are not physically validated. This model does not simulate airborne tree clearance. All costs use the existing Tour reference.</p>${body}</main></html>`);
