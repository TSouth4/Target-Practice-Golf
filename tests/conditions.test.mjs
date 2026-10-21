import test from 'node:test';import assert from 'node:assert/strict';
import {CALM,LEGACY_ROLLOUT,CONDITIONS_VERSION,conditionsFor,windEffect,rolloutDistance,conditionsFeedback} from '../dist/conditions.js';
import {SCENARIOS,preset,shotAt,samples,evaluate,DEFAULT_COSTS,patternAtTarget,optimizeTargets} from '../dist/model.js';
import {centerFlight} from '../dist/rollout.js';import {createRound,readRound} from '../dist/rounds.js';import {createCourse,readCourse} from '../dist/course.js';
const z={z1:0,z2:0,u:1,sign:1},aim={x:0,y:150},base={...preset('5','approach'),carry:150,sdSide:0,sdLong:0,start:0,curve:0,bias:0},weather=(x,y,firmness='normal')=>({...CALM,difficulty:'hard',windX:x,windY:y,firmness});
test('explicit legacy rules preserve original Easy outcomes exactly, including misses and stock rollout',()=>{
 for(const type of ['tee','approach']){const p={...preset('10',type),rolloutRules:LEGACY_ROLLOUT},s=SCENARIOS[type==='tee'?0:2],zs=samples(60,745);assert.deepEqual(evaluate(aim,p,s,DEFAULT_COSTS,zs,true),evaluate(aim,{...p,conditions:CALM},s,DEFAULT_COSTS,zs,true));
 for(const draw of zs){const theta=Math.atan2(aim.x,aim.y),sin=Math.sin(theta),cos=Math.cos(theta),big=draw.u<p.bigPct/100,f=big?2:1,sign=p.bigDirection==='left'?-1:p.bigDirection==='right'?1:draw.sign,carry=Math.max(1,p.carry+p.sdLong*(p.rho*draw.z1+Math.sqrt(1-p.rho*p.rho)*draw.z2)*f-(big?p.bigShort:0)),offset=carry*Math.tan(p.start*Math.PI/180)+p.curve+p.bias+p.sdSide*draw.z1*f+(big?sign*p.bigShift:0);assert.deepEqual(shotAt(aim,{...p,conditions:CALM},draw),{x:sin*(carry+p.roll)+cos*offset,y:cos*(carry+p.roll)-sin*offset,landing:{x:sin*carry+cos*offset,y:cos*carry-sin*offset},big});}}
});
test('wind adds to shape without moving the target; opposing wind reduces a fade and height changes sensitivity',()=>{
 const original={...aim},fade={...base,curve:10};const noWind=shotAt(aim,fade,z),withWind=shotAt(aim,{...fade,conditions:weather(10,0)},z),against=shotAt(aim,{...fade,conditions:weather(-10,0)},z);assert.equal(noWind.landing.x,10);assert.equal(withWind.landing.x,20);assert.equal(against.landing.x,0);assert.deepEqual(aim,original);
 assert.ok(shotAt(aim,{...base,conditions:weather(0,-10)},z).landing.y<150);assert.ok(shotAt(aim,{...base,conditions:weather(0,10)},z).landing.y>150);
 assert.ok(windEffect(aim,{...base,height:40,conditions:weather(10,0)}).x>windEffect(aim,{...base,height:15,conditions:weather(10,0)}).x);
 const angled={x:90,y:120},p={...base,conditions:weather(10,0)},w=windEffect(angled,p);assert.ok(w.x>0);assert.ok(Number.isFinite(w.y));assert.match(conditionsFeedback(aim,p),/target stayed fixed/);
});
test('firmness acts after landing, respects surface and stops roll at sand, trees and water',()=>{
 const s={...SCENARIOS[0],bounds:[-100,100],maxY:400,green:{x:80,y:300,rx:10,ry:10},fairway:[[-30,0],[30,0],[30,400],[-30,400]],hazards:[],pin:{x:0,y:300}},p={...base,roll:15,conditions:weather(0,0,'firm')},soft={...p,conditions:weather(0,0,'soft')},firm=shotAt(aim,p,z,s),a=shotAt(aim,soft,z,s);assert.deepEqual(firm.landing,a.landing);assert.ok(firm.y>a.y);assert.ok(rolloutDistance(p,'rough')<rolloutDistance(p,'fairway'));assert.equal(rolloutDistance(p,'bunker'),0);
 assert.ok(rolloutDistance({...p,roll:0},'green')>0);
 for(const kind of ['bunker','trees','water']){const hazard={kind,poly:[[-20,155],[20,155],[20,165],[-20,165]],drop:{x:0,y:140}},scene={...s,hazards:[hazard]},r=evaluate(aim,p,scene,DEFAULT_COSTS,[z],true);assert.equal(r.points[0].kind,kind);assert.ok(r.points[0].y<=155.001);assert.ok(r.points[0].landing.y===150);const center=centerFlight(aim,p,scene);assert.equal(center.kind,kind);assert.ok(center.finish.y<=155.001);}
});
test('seeded conditions survive readers, assessments share conditions, and malformed saves are rejected',()=>{
 for(const difficulty of ['medium','hard']){const r=createRound('assessment',234,{handicap:'10',limit:250,difficulty});assert.deepEqual(readRound(JSON.stringify(r)),r);assert.ok(r.schedule.every(s=>JSON.stringify(s.conditions)===JSON.stringify(r.schedule[0].conditions)));assert.deepEqual(r,createRound('assessment',234,{handicap:'10',limit:250,difficulty}));
 const c=createCourse(234,{handicap:'10',limit:250,difficulty});assert.deepEqual(readCourse(JSON.stringify(c)),c);const broken=structuredClone(c);broken.schedule[0].conditions.windX=100;assert.equal(readCourse(JSON.stringify(broken)),null);const wrong=structuredClone(r);wrong.schedule[1].conditions.firmness=wrong.schedule[0].conditions.firmness==='firm'?'soft':'firm';assert.equal(readRound(JSON.stringify(wrong)),null);}
 assert.equal(conditionsFor('easy',23).windX,0);assert.deepEqual(conditionsFor('hard',23),conditionsFor('hard',23));assert.equal(CONDITIONS_VERSION,'wind-firmness-v1');
});
test('optimizer and scored shots use the same wind and ground, with wind compensation changing the best intended target',async()=>{
 const s={...SCENARIOS[3],bounds:[-100,100],maxY:230,green:{x:0,y:150,rx:12,ry:12},pin:{x:0,y:150},fairway:[[-30,0],[30,0],[30,230],[-30,230]],hazards:[],aimRange:[100,190],aimXRange:[-40,40]},p={...base,conditions:weather(12,0),aimMode:'carry',sdSide:3,sdLong:3},zs=samples(120,79),best=await optimizeTargets(aim,p,s,DEFAULT_COSTS,zs);assert.ok(best.aim.x<-5);assert.deepEqual(best.result,evaluate(best.aim,patternAtTarget(best.aim,p),s,DEFAULT_COSTS,zs));assert.deepEqual(aim,{x:0,y:150});
});
