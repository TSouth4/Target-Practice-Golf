import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS,DEFAULT_COSTS,basicPattern,patternAtTarget,samples,evaluate,optimizeTargets,decisionFeedback} from '../dist/model.js';
import {decisionLesson,retryImpact,hazardExplanation} from '../dist/lessons.js';
const s=SCENARIOS[3],base=basicPattern(5,s),zs=samples(1200,7142026),best=await optimizeTargets({x:0,y:110},base,s,DEFAULT_COSTS,zs);
function lesson(aim){const p=patternAtTarget(aim,base),r=evaluate(aim,p,s,DEFAULT_COSTS,zs),assessment=decisionFeedback(aim,p,r,best,s);return{r,assessment,value:decisionLesson(aim,p,r,best,s,assessment)};}
test('conservative lesson explains the proximity tradeoff and uses the actual club comparison',()=>{const {assessment,value}=lesson({x:0,y:110});assert.equal(assessment.kind,'conservative');assert.match(value.why,/nominal finish/);assert.match(value.principle,/proximity/);assert.match(value.action,/deeper/);assert.ok(value.rows.some(r=>r.label==='Selected club / distance'&&r.you.includes('yd')));assert.match(value.note,/not a proven optimum/);});
test('aggressive lesson identifies the actual extra hazard and exact rates, rather than generic criticism',()=>{const {r,assessment,value}=lesson({x:50,y:172});assert.equal(assessment.kind,'aggressive');assert.match(value.why,/largest extra exposure is/);const ob=value.rows.find(r=>r.label==='Out of bounds');assert.equal(ob.you,(100*r.counts.ob/r.n).toFixed(1)+'%');assert.equal(ob.best,(100*best.result.counts.ob/best.result.n).toFixed(1)+'%');assert.match(value.principle,/costly side/);});
test('balanced lesson explains decision quality despite a possible bad individual outcome',()=>{const {assessment,value}=lesson(best.aim);assert.equal(assessment.kind,'balanced');assert.match(value.why,/0.00 extra expected strokes/);assert.match(value.principle,/One shot in a hazard/);assert.match(value.action,/before the pattern appears/);});
test('unbounded chosen cost and unusable comparison receive distinct honest lessons',()=>{const p=patternAtTarget({x:50,y:172},base),r={expected:Infinity,n:100,counts:{water:0,ob:100,bunker:0,trees:0,rough:0,green:0,fairway:0}};const a=decisionLesson({x:50,y:172},p,r,best,s,{kind:'aggressive'});assert.match(a.why,/All 100 of your shots finished OB/);assert.equal(a.rows[0].you,'∞');const b=decisionLesson({x:50,y:172},p,r,{...best,result:r},s,{kind:'aggressive'});assert.match(b.why,/no usable comparison/);assert.match(b.action,/shot setup/);});

test('ambiguous tradeoffs have a lesson without inventing extra hazard exposure',()=>{const p=patternAtTarget({x:0,y:172},base),r={...best.result,expected:best.result.expected+.4};const value=decisionLesson({x:0,y:172},p,r,best,s,{kind:'refine'});assert.match(value.why,/0.40 strokes/);assert.match(value.why,/not clearly an aggression mistake/);assert.ok(!value.why.includes('largest extra exposure'));});

test('retry impact scales the unrounded modeled difference with correct saved/lost direction',()=>{
 assert.match(retryImpact(3.5,3.25),/25.0 strokes saved per 100/);
 assert.match(retryImpact(3.25,3.5),/25.0 strokes lost per 100/);
 assert.match(retryImpact(3.5,3.5),/0.0 strokes saved/);
 assert.match(retryImpact(3.5,3.496),/0.4 strokes saved/);
 assert.match(retryImpact(Infinity,3),/unavailable/);
 assert.match(retryImpact(Infinity,Infinity),/unavailable/);
 assert.match(retryImpact(3.5,3.25),/not a prediction/);
});

test('hazard explanation connects deeper and sideways targets to measured miss reductions',()=>{
 const s={green:{x:0,y:150},hazards:[{kind:'bunker',label:'Front bunker',poly:[[-20,110],[20,110],[20,130],[-20,130]]}]},r={n:100,counts:{bunker:20}},b={aim:{x:0,y:155},result:{n:100,counts:{bunker:5}}};
 assert.match(hazardExplanation({x:0,y:135},b,r,s),/aims deeper.*shorter finishes.*Front bunker/);
 assert.match(hazardExplanation({x:0,y:135},b,r,s),/20.0% to 5.0%/);
 s.hazards[0]={kind:'water',label:'Right pond',poly:[[20,130],[40,130],[40,170],[20,170]]};r.counts={water:25};b.result.counts={water:3};b.aim={x:-10,y:150};
 assert.match(hazardExplanation({x:0,y:150},b,r,s),/moves left.*right misses.*Right pond/);
 b.result.counts.water=25;assert.equal(hazardExplanation({x:0,y:150},b,r,s),'');
});
