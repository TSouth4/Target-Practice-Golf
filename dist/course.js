import {MODEL_VERSION} from './progress.js';
import {CONDITIONS_VERSION,conditionsFor,validConditionSchedule} from './conditions.js';
import {validPlayerProfile} from './shot-editor.js';
import {SCENARIOS,random,outcome,remaining,DEFAULT_COSTS} from './model.js';
import {generateScenario} from './practice.js';
import {baselineStrokes} from './strokes-baseline.js';
export const COURSE_KEY='target-practice-course-v1';
export const COURSE_VERSION='par3-v2-18-finish-v1';
export const LEGACY_COURSE_VERSION='par3-v1-finish-v1';
export const COURSE_HOLES=18;
const COURSE_FAMILIES=['tucked','water','split','bowl','creek-par3'];
export const COURSE_FINISH_LABEL='Illustrative Tour-reference finish';
// Authored distribution shapes, tilted to match the reference mean. These weights
// are not measured handicap or Tour score frequencies. Do not treat them as such.
export function finishDistribution(kind,yards,reference=null){
 const mean=reference??baselineStrokes(kind,yards),green=kind==='green';
 const values=green?[1,2,3,4]:[1,2,3,4,5,6,7,8];
 const weights=green?[.15,.75,.095,.005]:[kind==='trees'?0:Math.max(.0001,.025*Math.exp(-yards/35)),.22,.50,.20,.06,.015,.004,.001];
 function distribution(t){const raw=values.map((v,i)=>weights[i]*Math.exp(t*(v-4))),total=raw.reduce((a,b)=>a+b,0);return raw.map((v,i)=>({strokes:values[i],probability:v/total}));}
 let lo=-40,hi=40;for(let i=0;i<70;i++){const mid=(lo+hi)/2,d=distribution(mid),m=d.reduce((n,p)=>n+p.strokes*p.probability,0);if(m<mean)lo=mid;else hi=mid;}
 return{mean,probabilities:distribution((lo+hi)/2)};
}
export function simulateFinish(kind,yards,seed,reference=null){
 if(kind==='green'&&yards<=.059)return{strokes:0,putts:0,offGreen:0,kind,distance:yards,reference:0};
 const rng=random(seed),d=finishDistribution(kind,yards,reference);let u=rng(),strokes=d.probabilities.at(-1).strokes;
 for(const p of d.probabilities){u-=p.probability;if(u<=0){strokes=p.strokes;break;}}
 const putts=kind==='green'?strokes:strokes===1?0:Math.min(strokes-1,strokes<=3?strokes-1:2+(rng()<.35?1:0));
 return{strokes,putts,offGreen:kind==='green'?0:strokes-putts,kind,distance:yards,reference:d.mean};
}
export function createCourse(seed,profile,landscape='woodland'){
 profile={...profile,...(profile.difficulty&&profile.difficulty!=='easy'?{conditionsVersion:CONDITIONS_VERSION}:{})};
 const rng=random(seed),families=['tucked','water','split'],schedule=[];
 for(let i=0;i<COURSE_HOLES;i++){if(i>=families.length){const bag=[...COURSE_FAMILIES];for(let n=bag.length-1;n>0;n--){const j=Math.floor(rng()*(n+1));[bag[n],bag[j]]=[bag[j],bag[n]];}if(bag[0]===families.at(-1))[bag[0],bag[1]]=[bag[1],bag[0]];families.push(...bag);}const id=families[i];let holeSeed=Math.floor(rng()*2147483000)+1;for(let n=0;n<512;n++){const s=generateScenario(SCENARIOS.find(s=>s.id===id),holeSeed);if(Math.hypot(s.pin.x,s.pin.y)<=175)break;holeSeed++;}schedule.push({id,holeSeed,drawSeed:Math.floor(rng()*2147483000)+1,finishSeed:Math.floor(rng()*2147483000)+1,landscape});}
 if(profile.difficulty&&profile.difficulty!=='easy')for(const slot of schedule)slot.conditions=conditionsFor(profile.difficulty,slot.drawSeed^0x6137);
 return{id:`course-${seed}`,kind:'course',decisionModel:MODEL_VERSION,version:COURSE_VERSION,seed,profile,schedule,index:0,answers:[],status:'active',current:{strokes:0,attempts:[]},review:null};
}
export function courseTotal(c){const strokes=c.answers.reduce((n,a)=>n+a.holeScore,0),par=c.answers.length*3;return{strokes,par,relative:strokes-par,holes:c.answers.length};}
export function scoreToPar(relative){return relative===0?'Even par':relative>0?'+'+relative:String(relative);}
export function scoreName(score){return({1:'Hole in one',2:'Birdie',3:'Par',4:'Bogey',5:'Double bogey',6:'Triple bogey'})[score]||`${score-3} over par`;}
export function recordCourseShot(c,points,s,decision,aim,pattern){
 if(c.review||c.status!=='active')return c.review;
 const slot=c.schedule[c.index],seed=(slot.finishSeed+c.current.attempts.length*104729)>>>0,rng=random(seed),point=points[Math.floor(rng()*points.length)],selected=structuredClone(point),o=outcome(selected,s);
 // Keep the original carry landing for flight animation. Evaluation already stops
 // water rollout at its contact point, and outcome supplies the authored relief.
 let finish=null,penalty=0;
 if(selected.kind==='water'){const drop=o.drop;if(!drop)throw new Error('Water outcome has no relief location');penalty=1;finish=simulateFinish(o.dropKind||'rough',Math.hypot(drop.x-s.pin.x,drop.y-s.pin.y),seed^0x783abc,remaining(drop,s,DEFAULT_COSTS,o.dropKind||'rough'));finish.drop={...drop};}
 else if(selected.kind!=='ob')finish=simulateFinish(selected.kind,Math.hypot(selected.x-s.pin.x,selected.y-s.pin.y),seed^0x783abc,remaining(selected,s,DEFAULT_COSTS,selected.kind));
 const attempt={selected,decision,aim:{...aim},pattern:structuredClone(pattern),penalty:selected.kind==='ob'?1:penalty};c.current.attempts.push(attempt);
 if(selected.kind==='ob')c.current.strokes+=2;
 else c.current.strokes+=1+penalty+finish.strokes;
 c.review={...attempt,finish,strokes:c.current.strokes,retee:selected.kind==='ob'};
 if(finish){const first=c.current.attempts[0].decision;c.answers.push({index:c.index,holeScore:c.current.strokes,par:3,kind:first.kind,score:first.score,regret:first.regret,teeShots:c.current.attempts.length,penalties:c.current.attempts.reduce((n,a)=>n+a.penalty,0),finish,selected,attempts:structuredClone(c.current.attempts)});if(c.answers.length===c.schedule.length)c.status='complete';}
 return c.review;
}
export function advanceCourse(c){if(!c.review)return false;if(c.review.retee){c.review=null;return true;}if(c.status==='complete')return false;c.index++;c.current={strokes:0,attempts:[]};c.review=null;return true;}
export function readCourse(raw){
 try{
  const c=typeof raw==='string'?JSON.parse(raw):raw;
  const integer=(n,min=0,max=2147483646)=>Number.isInteger(n)&&n>=min&&n<=max;
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
  const shot=p=>point(p)&&point(p.landing)&&['fairway','green','rough','bunker','trees','water','ob'].includes(p.kind);
  const decision=d=>d&&['balanced','aggressive','conservative','refine'].includes(d.kind)&&['label','reason','action'].every(k=>typeof d[k]==='string'&&d[k].length<12000)&&Number.isFinite(d.score)&&d.score>=0&&d.score<=100&&(d.regret===null||Number.isFinite(d.regret)&&d.regret>=0);
  const attempt=a=>a&&shot(a.selected)&&point(a.aim)&&a.pattern&&['carry','roll','sdSide','sdLong','height','start','curve','bias','rho'].every(k=>Number.isFinite(a.pattern[k]))&&a.pattern.carry>0&&decision(a.decision)&&a.penalty===(['water','ob'].includes(a.selected.kind)?1:0);
  const finish=f=>f&&integer(f.strokes,0,8)&&integer(f.putts,0,4)&&integer(f.offGreen,0,8)&&f.putts+f.offGreen===f.strokes&&Number.isFinite(f.distance)&&f.distance>=0&&Number.isFinite(f.reference)&&f.reference>=0&&['green','fairway','rough','bunker','trees'].includes(f.kind);
  const validAttempts=arr=>Array.isArray(arr)&&arr.length>0&&arr.length<1000&&arr.every(attempt)&&arr.slice(0,-1).every(a=>a.selected.kind==='ob');
  if(c?.kind!=='course'||![COURSE_VERSION,LEGACY_COURSE_VERSION].includes(c.version)||!['active','complete'].includes(c.status)||!integer(c.seed,1)||typeof c.id!=='string'||!c.id.length||c.id.length>60)return null;
  if(!validPlayerProfile(c.profile))return null;
  const holes=c.version===LEGACY_COURSE_VERSION?3:COURSE_HOLES;
  if(!Array.isArray(c.schedule)||c.schedule.length!==holes||!integer(c.index,0,holes-1)||c.schedule.some(s=>!(c.version===LEGACY_COURSE_VERSION?['tucked','water','split']:COURSE_FAMILIES).includes(s.id)||!integer(s.holeSeed,1)||!integer(s.drawSeed,1)||!integer(s.finishSeed,1)||!['woodland','coast','desert','mountain'].includes(s.landscape))||new Set(c.schedule.map(s=>s.landscape)).size!==1)return null;
  if(!validConditionSchedule(c.profile,c.schedule)||c.review&&c.profile.difficulty&&c.profile.difficulty!=='easy'&&JSON.stringify(c.review.pattern.conditions||null)!==JSON.stringify(c.schedule[c.index].conditions||null))return null;
  if(!Array.isArray(c.answers)||c.answers.length>holes||c.answers.some((a,i)=>a.index!==i||a.par!==3||!integer(a.holeScore,1)||!validAttempts(a.attempts)||!finish(a.finish)||!shot(a.selected)||a.teeShots!==a.attempts.length||a.penalties!==a.attempts.reduce((n,t)=>n+t.penalty,0)||a.holeScore!==a.teeShots+a.penalties+a.finish.strokes||a.score!==a.attempts[0].decision.score||a.kind!==a.attempts[0].decision.kind||a.regret!==a.attempts[0].decision.regret))return null;
  if(!c.current||!integer(c.current.strokes)||!Array.isArray(c.current.attempts)||c.current.attempts.length>=1000||c.current.attempts.some(a=>!attempt(a)))return null;
  if(c.status==='complete'&&(c.answers.length!==holes||c.index!==holes-1||!c.review)||c.status==='active'&&c.answers.length!==c.index+(c.review&&!c.review.retee?1:0))return null;
  if(c.review){const r=c.review;if(!attempt(r)||r.retee!==(r.selected.kind==='ob')||r.strokes!==c.current.strokes||!validAttempts(c.current.attempts)||JSON.stringify(c.current.attempts.at(-1))!==JSON.stringify({selected:r.selected,decision:r.decision,aim:r.aim,pattern:r.pattern,penalty:r.penalty}))return null;
   if(r.retee){if(r.finish!==null||c.current.strokes!==c.current.attempts.length*2)return null;}
   else if(!finish(r.finish)||c.current.strokes!==c.current.attempts.length+c.current.attempts.reduce((n,a)=>n+a.penalty,0)+r.finish.strokes||c.answers.at(-1)?.holeScore!==c.current.strokes)return null;
  }else if(c.current.attempts.some(a=>a.selected.kind!=='ob')||c.current.strokes!==c.current.attempts.length*2)return null;
  return c;
 }catch{return null;}
}

export function courseFinishHeadline(review){
 if(review.retee)return 'Out of bounds — re-tee';
 const f=review.finish,result=scoreName(review.strokes).toLowerCase();
 if(!f.strokes)return review.strokes===1?'Hole in one!':`Holed tee shot for ${result}`;
 if(!f.putts)return `Simulated hole-out for ${result}`;
 if(!f.offGreen)return `Simulated ${f.putts}-putt for ${result}`;
 const shot=f.kind==='bunker'?'bunker shot':f.kind==='trees'?'recovery shot':f.distance>60?'approach':'chip / pitch';
 return `Simulated ${f.offGreen} ${shot}${f.offGreen===1?'':'s'} + ${f.putts} putt${f.putts===1?'':'s'} for ${result}`;
}
