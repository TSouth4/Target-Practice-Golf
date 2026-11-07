import test from 'node:test';import assert from 'node:assert/strict';
import {comparisonAdjustment,decisionStory,retryStory} from '../dist/decision-coaching.js';
const counts={water:0,ob:0,bunker:0,trees:0,rough:20,green:80,fairway:0};
const result=(extra={})=>({n:100,expected:3,counts:{...counts},...extra});
const input=(kind='aggressive')=>({aim:{x:20,y:150},p:{carry:Math.hypot(20,150)},r:result({expected:3.5,counts:{...counts,water:25,green:55}}),b:{aim:{x:0,y:Math.hypot(20,150)},pattern:{carry:Math.hypot(20,150)},result:result({counts:{...counts,water:3,green:77}})},s:{type:'approach'},assessment:{kind,label:kind}});
const story=x=>decisionStory(x.aim,x.p,x.r,x.b,x.s,x.assessment);
test('axis interpretation separates heading from distance, including depth changes with a nonzero lateral coordinate',()=>{
 const x=input();assert.equal(comparisonAdjustment(x.aim,x.p,x.b).axis,'direction');
 x.aim={x:30,y:150};x.p.carry=Math.hypot(30,150);x.b.aim={x:40,y:200};x.b.pattern.carry=Math.hypot(40,200);assert.equal(comparisonAdjustment(x.aim,x.p,x.b).axis,'carry');
 x.b.aim={x:-20,y:200};assert.equal(comparisonAdjustment(x.aim,x.p,x.b).axis,'both');
 x.aim={x:0,y:150};x.p={carry:150,club:'7 iron'};x.b.aim={x:0,y:151};x.b.pattern={carry:151,club:'6 iron'};assert.equal(comparisonAdjustment(x.aim,x.p,x.b).axis,'carry');
});
test('aggressive coaching connects measured trouble to a reusable miss-room principle without numeric clutter',()=>{
 const x=input(),before=structuredClone(x),v=story(x);assert.match(v.why,/water more often/);assert.match(v.principle,/ordinary left and right misses/);assert.match(v.experiment,/left.*same intended carry/);assert.doesNotMatch(v.why,/strokes|percentage/);assert.deepEqual(x,before);
 x.b.pattern.carry+=20;x.b.aim.y+=20;assert.equal(story(x).axis,'Direction and carry');assert.match(story(x).experiment,/separately/);
});
test('conservative coaching uses remaining-shot evidence and avoids claiming an unobserved cost',()=>{
 const x=input('conservative');x.aim={x:0,y:100};x.p.carry=100;x.b.aim={x:0,y:150};x.b.pattern.carry=150;x.r.breakdown={nextShot:2.9};x.b.result.breakdown={nextShot:2.6};assert.match(story(x).why,/more costly next shot/);assert.match(story(x).principle,/Before laying back/);assert.match(story(x).experiment,/longer intended carry/);
 x.r.breakdown.nextShot=2.4;assert.match(story(x).why,/central finish is farther/);assert.doesNotMatch(story(x).why,/more costly next shot/);
});
test('strong, ambiguous and unusable decisions have distinct honest lessons',()=>{
 const x=input('balanced');assert.match(story(x).principle,/Several targets can be reasonable/);assert.match(story(x).why,/substantial penalty exposure/);
 x.assessment.kind='refine';assert.match(story(x).why,/not clearly/);assert.doesNotMatch(story(x).why,/water more often/);
 x.b.result.expected=Infinity;assert.match(story(x).why,/no usable target comparison/);assert.match(story(x).experiment,/not a usable recommendation/);
 x.b.result.expected=3;x.r.expected=Infinity;assert.match(story(x).why,/Every simulated shot.*out of bounds/);
});
test('retry headlines separate direction of improvement from its observed accounting, and handle ties and Infinity',()=>{
 const first=result({expected:3.5,breakdown:{nextShot:2.2,water:.3}}),now=result({expected:3.2,breakdown:{nextShot:2.2,water:0}});assert.match(retryStory(first,now).verdict,/helped/);assert.match(retryStory(first,now).reason,/water penalty/);assert.match(retryStory(now,first).verdict,/cost more/);assert.match(retryStory(now,first).reason,/added cost/);assert.match(retryStory(first,{...first,expected:3.497}).verdict,/similarly/);assert.match(retryStory(first,{expected:Infinity}).verdict,/out of bounds/);assert.match(retryStory({expected:Infinity},now).verdict,/created playable outcomes/);assert.match(retryStory({expected:Infinity},{expected:Infinity}).verdict,/unavailable/);
});
test('beginner comments are separate from detailed analysis and preserve input results',()=>{
 const x=input(),before=structuredClone(x),v=story(x);assert.match(v.summary,/little too aggressive/);assert.doesNotMatch(v.summary,/model|sampled|simulation|tradeoff/);assert.match(v.adjustment,/left.*same carry/);assert.deepEqual(x,before);
 x.assessment.kind='balanced';assert.match(story(x).summary,/good target/);assert.doesNotMatch(story(x).summary,/blue point/);assert.equal(story(x).adjustment,'');
 x.s={type:'tee',par:4};assert.match(story(x).summary,/easier next shot/);assert.doesNotMatch(story(x).summary,/green|flag|finish close/);
 x.assessment.kind='refine';assert.match(story(x).summary,/target adjustment/);x.b.aim={...x.aim};x.b.pattern.carry=x.p.carry;assert.match(story(x).summary,/close to a good target/);
});
test('depth comments require a carry-only comparison and measured short or long misses',()=>{
 const x=input();x.s.green={y:150,ry:10};x.aim={x:0,y:150};x.p.carry=150;x.b.aim={x:0,y:160};x.b.pattern.carry=160;x.r.points=[{landing:{y:120}},{landing:{y:150}}];x.b.result.points=[{landing:{y:150}},{landing:{y:150}}];
 assert.match(story(x).summary,/shorter shots/);assert.equal(story(x).adjustment,'Try a little more carry.');
 x.r.points=[{landing:{y:180}},{landing:{y:150}}];x.b.aim.y=140;x.b.pattern.carry=140;assert.match(story(x).summary,/beyond the green/);assert.equal(story(x).adjustment,'Try a little less carry.');
 x.b.aim.x=20;assert.doesNotMatch(story(x).summary,/beyond the green/);
 x.b.aim.x=0;delete x.r.points;assert.doesNotMatch(story(x).summary,/beyond the green/);
 x.s.type='tee';x.s.par=4;assert.doesNotMatch(story(x).summary,/green/);
});
test('expanded comparison explains benefits, tradeoffs and unrounded per-100 cost plainly',async()=>{
 const {comparisonDetails}=await import('../dist/decision-coaching.js');
 const own=result({expected:2.837,breakdown:{nextShot:1.8,rough:.037,water:0,ob:0,bunker:0,trees:0}}),blue=result({expected:2.79,counts:{...counts,rough:25},breakdown:{nextShot:1.74,rough:.05,water:0,ob:0,bunker:0,trees:0}}),before=structuredClone({own,blue});
 const d=comparisonDetails(own,blue,'balanced');assert.match(d.heading,/comparison scores better/);assert.match(d.comparison,/slightly easier next shot/);assert.match(d.comparison,/more shots into the rough/);assert.match(d.difference,/0.05 strokes per shot/);assert.match(d.difference,/4.7 strokes over 100/);assert.match(d.difference,/still a good choice/);assert.deepEqual({own,blue},before);
 const inverse=comparisonDetails(blue,own,'refine');assert.match(inverse.heading,/your target scores better/);assert.match(inverse.difference,/original target saves/);
 assert.match(comparisonDetails(own,own,'balanced').comparison,/about the same/);assert.match(comparisonDetails(own,{...blue,expected:Infinity},'refine').difference,/not available/);assert.match(comparisonDetails({...own,expected:Infinity},blue,'aggressive').comparison,/out of bounds/);
 const missing=comparisonDetails({...own,breakdown:null},{...blue,breakdown:null},'refine');assert.match(missing.comparison,/don’t identify one clear reason/);
});
