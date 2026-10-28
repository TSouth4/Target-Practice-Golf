// Re-evaluate fixed audit targets with independent draws; does not re-optimize them.
import fs from 'node:fs';
import {SCENARIOS,DEFAULT_COSTS,basicPattern,patternAtTarget,samples,evaluate} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
import {CALM,SURFACE_ROLLOUT} from '../dist/conditions.js';
const path=process.argv[2];if(!path)throw Error('Pass the JSON output of scripts/model-validation-review.mjs');
const report=JSON.parse(fs.readFileSync(path)),out=[];
for(const c of report.cases){
 const s=generateScenario(SCENARIOS.find(s=>s.id===c.family),c.holeSeed),p={...basicPattern(c.handicap,s),aimMode:'carry',rolloutRules:SURFACE_ROLLOUT,conditions:{...CALM}},runs=[];
 for(const seed of [112358,271828,314159]){const draws=samples(4000,seed);runs.push({seed,targets:c.targets.map(t=>({label:t.label,expected:evaluate(t.aim,patternAtTarget(t.aim,p),s,DEFAULT_COSTS,draws).expected}))});}
 out.push({key:c.key,runs});
}
console.log(JSON.stringify(out,null,2));
