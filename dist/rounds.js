import {random,SCENARIOS} from './model.js';
import {generateScenario} from './practice.js';
import {greenYardages} from './guidance.js';
export const ROUND_KEY='target-practice-round-v1';
export const ROUND_VERSION='rounds-v1-model-v3';
const groups=[['drivable'],['cedar'],['narrow','squeeze-par4','creek-tee'],['bend','sharp-dogleg'],['creek-tee','drivable']];
export function createRound(kind,seed,profile){
 const rng=random(seed),count=kind==='assessment'?10:5,approaches=['water','tucked','bowl','split','creek-par3','par5-open','par5-carry'],schedule=[];
 for(let i=0;i<count;i++){
  const pool=i%2?approaches:groups[Math.floor(i/2)%groups.length],id=pool[Math.floor(rng()*pool.length)];
  if(i%2)approaches.splice(approaches.indexOf(id),1);
  let holeSeed=Math.floor(rng()*2147483645)+1;
  // A wide tee slot complements the short and tight tee slots in each learning round.
  if(id==='cedar'||id==='creek-tee'&&i===4)while(holeSeed%3!==0)holeSeed++;
  if(id==='drivable'&&profile.limit>=225){
   let closest=Infinity,bestSeed=holeSeed;for(let attempt=0;attempt<128;attempt++){const candidate=holeSeed+attempt,front=greenYardages(generateScenario(SCENARIOS.find(s=>s.id===id),candidate))[0].distance;if(front<closest){closest=front;bestSeed=candidate;}if(front<=profile.limit-3)break;}holeSeed=bestSeed;
  }
  schedule.push({id,holeSeed,drawSeed:Math.floor(rng()*2147483645)+1});
 }
 for(let i=schedule.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[schedule[i],schedule[j]]=[schedule[j],schedule[i]];}
 return {id:`${kind}-${seed}`,version:ROUND_VERSION,kind,seed,profile,schedule,index:0,answers:[],status:'active'};
}
export function readRound(raw){
 try{const r=JSON.parse(raw);if(!r||r.version!==ROUND_VERSION||!['practice','assessment'].includes(r.kind)||!['active','complete'].includes(r.status))return null;
  if(!Number.isInteger(r.seed)||r.seed<1||r.seed>2147483646||typeof r.id!=='string'||r.id.length<1||r.id.length>60)return null;
  const count=r.kind==='assessment'?10:5;
  if(!Array.isArray(r.schedule)||r.schedule.length!==count||!Number.isInteger(r.index)||r.index<0||r.index>=count||!Array.isArray(r.answers)||r.answers.length>count)return null;
  if(!r.profile||!['0','5','10','20'].includes(r.profile.handicap)||!Number.isFinite(r.profile.limit)||r.profile.limit<180||r.profile.limit>330)return null;
  if(r.schedule.some(s=>!SCENARIOS.some(b=>b.id===s.id)||!Number.isInteger(s.holeSeed)||s.holeSeed<=0||!Number.isInteger(s.drawSeed)||s.drawSeed<=0))return null;
  if(r.answers.some((a,i)=>!a||a.index!==i||!['balanced','aggressive','conservative','refine'].includes(a.kind)||!Number.isFinite(a.score)||a.score<0||a.score>100||!(a.regret===null||Number.isFinite(a.regret)&&a.regret>=0)||!Number.isFinite(a.dx)||!Number.isFinite(a.dy)))return null;
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
