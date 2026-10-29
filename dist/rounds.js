import {validAssessmentNote} from './assessment-review.js';
import {MODEL_VERSION} from './progress.js';
import {CONDITIONS_VERSION,conditionsFor,validConditionSchedule} from './conditions.js';
import {validPlayerProfile} from './shot-editor.js';
import {readCourse} from './course.js';
import {random,SCENARIOS} from './model.js';
import {generateScenario} from './practice.js';
import {greenYardages} from './guidance.js';
export const ROUND_KEY='target-practice-round-v1';
export const ROUND_VERSION='rounds-v4-model-v6';
const groups=[['drivable'],['cedar'],['narrow','squeeze-par4','creek-tee'],['bend','sharp-dogleg'],['creek-tee','drivable']];
export function createRound(kind,seed,profile){
 profile={...profile,...(profile.difficulty&&profile.difficulty!=='easy'?{conditionsVersion:CONDITIONS_VERSION}:{})};
 const rng=random(seed),count=kind==='assessment'?10:5,approaches=['water','tucked','bowl','split','creek-par3','par5-open','par5-carry'],schedule=[];
 for(let i=0;i<count;i++){
  const pool=i===1?['shore-green']:i%2?approaches:groups[Math.floor(i/2)%groups.length],id=pool[Math.floor(rng()*pool.length)];
  if(i%2&&approaches.includes(id))approaches.splice(approaches.indexOf(id),1);
  let holeSeed=Math.floor(rng()*2147483645)+1;
  // A wide tee slot complements the short and tight tee slots in each learning round.
  if(id==='cedar'||id==='creek-tee'&&i===4)while(holeSeed%3!==0)holeSeed++;
  if(id==='drivable'&&profile.limit>=225){
   let closest=Infinity,bestSeed=holeSeed;for(let attempt=0;attempt<128;attempt++){const candidate=holeSeed+attempt,front=greenYardages(generateScenario(SCENARIOS.find(s=>s.id===id),candidate))[0].distance;if(front<closest){closest=front;bestSeed=candidate;}if(front<=profile.limit-3)break;}holeSeed=bestSeed;
  }
  schedule.push({id,holeSeed,drawSeed:Math.floor(rng()*2147483645)+1});
 }
 for(let i=schedule.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[schedule[i],schedule[j]]=[schedule[j],schedule[i]];}
 if(profile.difficulty&&profile.difficulty!=='easy')for(const slot of schedule)slot.conditions=conditionsFor(profile.difficulty,kind==='assessment'?seed^0x6137:slot.drawSeed^0x6137);
 return {id:`${kind}-${seed}`,version:ROUND_VERSION,decisionModel:MODEL_VERSION,kind,seed,profile,schedule,index:0,answers:[],status:'active'};
}
export function readRound(raw){
 try{const r=JSON.parse(raw);if(r?.kind==='course')return readCourse(r);if(!r||!(r.version===ROUND_VERSION||['rounds-v3-model-v5','rounds-v2-model-v4','rounds-v1-model-v3'].includes(r.version)&&r.status==='complete')||!['practice','assessment'].includes(r.kind)||!['active','complete'].includes(r.status))return null;
  if(!Number.isInteger(r.seed)||r.seed<1||r.seed>2147483646||typeof r.id!=='string'||r.id.length<1||r.id.length>60)return null;
  const count=r.kind==='assessment'?10:5;
  if(!Array.isArray(r.schedule)||r.schedule.length!==count||!Number.isInteger(r.index)||r.index<0||r.index>=count||!Array.isArray(r.answers)||r.answers.length>count)return null;
  if(!validPlayerProfile(r.profile)||!validConditionSchedule(r.profile,r.schedule,r.kind==='assessment'))return null;
  if(r.schedule.some(s=>!SCENARIOS.some(b=>b.id===s.id)||!Number.isInteger(s.holeSeed)||s.holeSeed<=0||!Number.isInteger(s.drawSeed)||s.drawSeed<=0))return null;
  if(r.answers.some((a,i)=>!a||a.index!==i||!['balanced','aggressive','conservative','refine'].includes(a.kind)||!Number.isFinite(a.score)||a.score<0||a.score>100||!(a.regret===null||Number.isFinite(a.regret)&&a.regret>=0)||!Number.isFinite(a.dx)||!Number.isFinite(a.dy)||!validAssessmentNote(a.review)))return null;
  if(r.answers.length<r.index||r.answers.length>r.index+1||r.status==='complete'&&r.answers.length!==count)return null;
  return r;
 }catch{return null;}
}
export function addRoundAnswer(round,answer){
 if(round.status!=='active'||round.answers.some(a=>a.index===round.index))return false;
 round.answers.push({...answer,index:round.index});return true;
}
export function roundSummary(round){
 const rows=round.answers,kinds=Object.fromEntries(['balanced','aggressive','conservative','refine'].map(k=>[k,rows.filter(a=>a.kind===k).length]));
 const finite=rows.filter(a=>a.regret!==null),average=rows.length&&finite.length===rows.length?rows.reduce((sum,a)=>sum+a.regret,0)/rows.length:null;
 const direction={short:rows.filter(a=>a.dy>5).length,long:rows.filter(a=>a.dy< -5).length,left:rows.filter(a=>a.dx>5).length,right:rows.filter(a=>a.dx< -5).length};
 return {count:rows.length,kinds,direction,average,per100:average===null?null:average*100,score:rows.length?rows.reduce((sum,a)=>sum+a.score,0)/rows.length:null};
}

export function roundNarrative(summary){
 const {count,kinds,direction}=summary,ranked=Object.entries(kinds).sort((a,b)=>b[1]-a[1]),[kind,n]=ranked[0];
 const label={aggressive:'too aggressive',conservative:'too conservative',balanced:'strong',refine:'in need of refinement'};
 let tendencies=n?`Your target choices tended to be ${label[kind]} in this simulation, with ${n} of your ${count} decisions in that category.`:'There are no completed decisions to summarize.';
 if(ranked[1]?.[1]===n&&n>0)tendencies=`Your round was mixed: ${n} of your ${count} target choices were ${label[kind]}, and ${n} were ${label[ranked[1][0]]}.`;
 if(kinds.aggressive>=2&&kinds.aggressive>=kinds.conservative)tendencies=`Your target choices were too aggressive on ${kinds.aggressive} of your ${count} decisions in this simulation. ${kinds.balanced} of your choices were strong. Practice giving your costly miss more room, while checking how much proximity you give up.`;
 if(kind==='conservative'&&n>=2)tendencies+=' Test a closer target and compare its extra risk with the value of a shorter next shot.';
 const entries=Object.entries(direction).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
 const names={short:'less intended carry',long:'more intended carry',left:'a target farther left',right:'a target farther right'};
 const directions=entries.length?`You chose ${names[entries[0][0]]} than the sampled comparison targets on ${entries[0][1]} of your ${count} decisions (by more than 5 yd). These are carry-target differences, not evidence of a physical ball-flight tendency.`:'Your carry targets stayed within 5 yd of the sampled comparisons in each direction. These observations describe this round, not established habits.';
 return {tendencies,directions};
}
