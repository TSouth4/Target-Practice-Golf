// Reproducible owner review. Writes only a diagnostic JSON and standalone HTML.
import fs from 'node:fs';
import {SCENARIOS,DEFAULT_COSTS,basicPattern,patternAtTarget,samples,evaluate,segmentHitsPoly} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
import {fairwaySection} from '../dist/landscape.js';
import {CALM,SURFACE_ROLLOUT} from '../dist/conditions.js';
import {MODEL_VERSION} from '../dist/progress.js';
const input=process.argv[2];if(!input)throw Error('Pass JSON output from scripts/model-validation-review.mjs');
const source=JSON.parse(fs.readFileSync(input));if(source.model!==MODEL_VERSION||source.rolloutRules!==SURFACE_ROLLOUT||source.n!==4000)throw Error('Use a current-model 4,000-shot audit report');
const draws=samples(4000,source.drawSeed),review={app:JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url))).version,model:MODEL_VERSION,drawSeed:source.drawSeed,conditions:CALM,n:4000,cases:[]};
for(const key of ['long-par3','sharp-dogleg']){
 const c=source.cases.find(c=>c.key===key);if(!c)throw Error('Missing '+key);
 const s=generateScenario(SCENARIOS.find(s=>s.id===c.family),c.holeSeed),base={...basicPattern(c.handicap,s),aimMode:'carry',rolloutRules:SURFACE_ROLLOUT,conditions:{...CALM}},candidates=key==='long-par3'?[['A · Flag',c.targets[0].aim],['B · Green center',c.targets[1].aim],['C · Sampled recommendation',c.targets.at(-1).aim]]:[['A · Earlier fairway',(()=>{const [l,r]=fairwaySection(s,140);return{x:(l+r)/2,y:140}})()],['B · Sampled recommendation',c.targets.at(-1).aim],['C · Straight 210 yd',c.targets.find(t=>t.label==='straight at selected depth').aim]];
 const rows=candidates.map(([label,aim])=>{const p=patternAtTarget(aim,base),r=evaluate(aim,p,s,DEFAULT_COSTS,draws,true);return{label,aim,carry:p.carry,club:p.club,sdSide:p.sdSide,sdLong:p.sdLong,expected:r.expected,counts:r.counts,breakdown:r.breakdown,clamped:r.baselineClamped,points:r.points.filter((_,i)=>i%8===0).map(p=>({x:p.x,y:p.y,kind:p.kind})),footprints:s.hazards.filter(h=>h.kind==='trees'&&segmentHitsPoly({x:0,y:0},aim,h.poly)).map(h=>h.label)};});
 const notes=key==='long-par3'?{title:'Long Par-3: front edge or center?',explanation:'20-handicap training profile · about 182 yd to the flag · calm, normal ground. C is on the front of the green, not a short layup. B and C are close in estimated cost.',known:'The model switches clubs automatically. At 168.5 yd it uses a hybrid; just beyond that it uses a 3-wood with a wider assumed pattern. The model does not explicitly price how much green is available for a recovery shot.',questions:['Would you choose a hybrid toward the front of this green, or a 3-wood toward its center? Why?','Does missing short here leave a fairly simple chip, or is there trouble/terrain the model is missing?'],caution:'The roughly 0.04-stroke center-versus-front difference is a small modeled edge, not proof of one perfect target.'}:{title:'Sharp dogleg: challenge the corner?',explanation:'20-handicap training profile · about 417 yd to the flag · calm, normal ground. Compare a genuinely playable earlier fairway target with the longer corner target.',known:'The recommended target is on fairway, but its straight ground projection crosses the Right open woods footprint. The model scores the finish and rollout; it does not test flying into branches. Later shots use distance and lie, not a full route simulation.',questions:['Could a golfer with this profile realistically reach B over or past those trees, or would you favor A?','From the likely misses around B, would they have a usable next shot, or need a sideways recovery?'],caution:'The dashed lines show geometric references, not simulated flight clearance or a guaranteed next-shot route.'};
 const row={key,family:c.family,holeSeed:c.holeSeed,handicap:c.handicap,flagYards:c.flagYards,scene:s,targets:rows,...notes};
 if(key==='long-par3'){
  const heading={x:s.green.x/Math.hypot(s.green.x,s.green.y),y:s.green.y/Math.hypot(s.green.x,s.green.y)};
  row.clubBoundary=[167,168,168.5,168.51,169,175,180].map(carry=>{const aim={x:heading.x*carry,y:heading.y*carry},p=patternAtTarget(aim,base),r=evaluate(aim,p,s,DEFAULT_COSTS,draws);return {carry,club:p.club,sdSide:p.sdSide,expected:r.expected};});
 }
 review.cases.push(row);
}
fs.writeFileSync(new URL('../docs/TWO-MODEL-EXAMPLES.json',import.meta.url),JSON.stringify(review,null,2)+'\n');
const template=fs.readFileSync(new URL('./templates/owner-model-review.html',import.meta.url),'utf8');
fs.writeFileSync(new URL('../dist/model-owner-review.html',import.meta.url),template.replace('/* REVIEW_DATA */',JSON.stringify(review).replaceAll('<','\\u003c')));
console.log('Prepared two read-only owner examples; gameplay and browser saves unchanged.');
