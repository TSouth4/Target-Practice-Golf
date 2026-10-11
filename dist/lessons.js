import {shotAt,patternAtTarget,inPoly,segmentHitsPoly} from './model.js';
const ZERO={z1:0,z2:0,u:1,sign:1};
const HAZARDS=[['water','water'],['ob','OB'],['bunker','bunkers'],['trees','recovery vegetation']];
const rate=(r,k)=>r.counts[k]/r.n;
const pct=v=>(100*v).toFixed(1)+'%';
const yards=v=>Math.abs(v).toFixed(0)+' yd';
const nominal=(aim,p)=>shotAt(aim,{...patternAtTarget(aim,p),sdSide:0,sdLong:0,bigPct:0},ZERO);
export function hazardExplanation(aim,b,r,s){
 const candidates=s.hazards.filter(h=>!h.forest);
 const hits=(result,h)=>{
  if(result.points)return result.points.filter(point=>point.kind===h.kind&&(h.kind==='water'?segmentHitsPoly(point.landing||point,point,h.poly):inPoly(point,h.poly))).length/result.n;
  return candidates.filter(other=>other.kind===h.kind).length===1?rate(result,h.kind):null;
 };
 const risks=candidates.map(h=>({h,own:hits(r,h),best:hits(b.result,h)})).filter(v=>v.own!==null&&v.best!==null).sort((a,c)=>(c.own-c.best)-(a.own-a.best));
 const threat=risks[0];if(!threat||threat.own-threat.best<.005)return '';
 const {h,own,best}=threat,cx=h.poly.reduce((sum,p)=>sum+p[0],0)/h.poly.length,cy=h.poly.reduce((sum,p)=>sum+p[1],0)/h.poly.length;
 const dx=b.aim.x-aim.x,dy=b.aim.y-aim.y;
 let move='The comparison changes direction and depth to give this hazard more room';
 if(cy<s.green.y&&dy< -2&&b.aim.y<Math.min(...h.poly.map(point=>point[1])))move=`The comparison lays up short of ${h.label}, avoiding the carry attempt and accepting a longer next shot`;
 else if(Math.abs(cx-s.green.x)<(s.green.rx||10)&&cy<s.green.y&&dy>2)move=`The comparison aims deeper, giving shorter finishes more room beyond ${h.label}`;
 else if(Math.abs(cx-s.green.x)<(s.green.rx||10)&&cy>s.green.y&&dy< -2)move=`The comparison aims shorter, giving longer finishes more room before ${h.label}`;
 else if((cx<s.green.x-2&&dx>2)||(cx>s.green.x+2&&dx< -2))move=`The comparison moves ${dx>0?'right':'left'}, giving ${dx>0?'left':'right'} misses more room away from ${h.label}`;
 return `${move}. Shots finishing in ${h.label} fall from ${pct(own)} to ${pct(best)}. The comparison balances proximity with the cost of those misses.`;
}
export function decisionLesson(aim,p,r,b,s,assessment){
 const q=b.result,own=nominal(aim,p),comparison=nominal(b.aim,b.pattern||p);
 const ownDistance=Math.hypot(own.x-s.pin.x,own.y-s.pin.y),bestDistance=Math.hypot(comparison.x-s.pin.x,comparison.y-s.pin.y);
 const extraHazards=HAZARDS.map(([kind,name])=>({kind,name,gap:rate(r,kind)-rate(q,kind)})).sort((a,b)=>b.gap-a.gap);
 const leader=extraHazards[0],hazardGap=extraHazards.reduce((sum,h)=>sum+h.gap,0),cost=r.expected-q.expected;
 let why,principle;
 if(!Number.isFinite(q.expected)){
  why='Every shot at every sampled target finished OB. There is no usable comparison in this run, so this rating cannot identify a sound target.';
  principle='Check the club distances, start line and miss settings before practicing this scenario again.';
 }else if(!Number.isFinite(r.expected)){
  why=`All ${r.n.toLocaleString()} of your shots finished OB. In this model, repeating that target after stroke-and-distance never makes progress. The blue target produces some playable outcomes.`;
  principle='Move the whole pattern inside the boundaries, accounting for your start line and curve as well as your chosen aim.';
 }else if(assessment.kind==='balanced'){
  why=`Your target costs only ${Math.max(0,cost).toFixed(2)} extra expected strokes compared with the best sampled target. The full pattern gives a similar balance of proximity and costly misses.`;
  principle='Keep aiming for a good distribution of outcomes. One shot in a hazard would not, by itself, make this decision wrong.';
 }else if(assessment.kind==='aggressive'){
  why=`Your shots reach water, OB, bunkers or recovery vegetation ${(100*hazardGap).toFixed(1)} percentage points more often than the comparison. The largest extra exposure is ${leader.name}: ${pct(rate(r,leader.kind))} versus ${pct(rate(q,leader.kind))}. Those misses outweigh the benefit elsewhere in the pattern.`;
  principle=s.type==='approach'?'Give the costly side of the green more room. Judge where your misses finish, rather than aiming automatically at the flag.':'Choose a landing area that gives the costly miss more room; adjust depth as well as direction when a different club offers a better tradeoff.';
 }else if(assessment.kind==='conservative'){
  why=`Your nominal finish is ${yards(ownDistance)} from the pin, versus ${yards(bestDistance)} for the comparison. Your pattern is farther from the hole, and any safety benefit is not enough to offset the extra remaining-shot cost in this model.`;
  principle=s.type==='approach'?'Avoid giving up useful proximity just to eliminate every possible miss. Look for the target that balances distance to the flag with the expensive side of the green.':'A shorter club can narrow the pattern, but it can also leave a harder next shot. Compare the whole hole cost before laying back.';
 }else{
  why=`A different direction or depth lowers expected cost by ${Math.max(0,cost).toFixed(2)} strokes. This is not clearly an aggression mistake: club choice, proximity and the mix of lies all contribute.`;
  principle='Compare both patterns against the hazards and pin. Adjust direction and depth together instead of treating every error as too safe or too risky.';
 }
 const hazardDetail=hazardExplanation(aim,b,r,s);if(hazardDetail)why+=' '+hazardDetail;
 if(s.secondShot){why+=' This is your second shot on a par 5: expected strokes compares going for the green with leaving a shorter next shot, including the cost of missed attempts.';principle+=' Reaching in two is worthwhile only when your club reach and full miss pattern justify the risk.';}
 const dx=b.aim.x-aim.x,dy=b.aim.y-aim.y;
 const direction=Math.abs(dx)<1?'keep roughly the same left/right target':`move the target ${yards(dx)} ${dx<0?'left':'right'}`;
 const depth=Math.abs(dy)<1?'keep roughly the same depth':`set it ${yards(dy)} ${dy<0?'shorter':'deeper'}`;
 const action=!Number.isFinite(q.expected)?'Adjust your shot setup, then try again.':assessment.kind==='balanced'?'Retry and see whether you can choose a similarly balanced target before the pattern appears.':`Test an idea on retry: ${direction} and ${depth}. Before committing, predict whether the change will reduce costly misses enough to justify any change in proximity. Then compare ${p.club||'your club'} with ${b.pattern?.club||p.club||'the same club'} at that distance.`;
 return {why,principle,action,hazardDetail,rows:[
  {label:'Expected strokes',you:Number.isFinite(r.expected)?r.expected.toFixed(2):'∞',best:Number.isFinite(q.expected)?q.expected.toFixed(2):'∞'},
  ...HAZARDS.map(([kind,name])=>({label:name==='OB'?'Out of bounds':name[0].toUpperCase()+name.slice(1),you:pct(rate(r,kind)),best:pct(rate(q,kind))})),
  {label:'Nominal finish to pin',you:yards(ownDistance),best:yards(bestDistance)},
  {label:'Selected club / distance',you:`${p.club||'Custom'} · ${yards(p.carry+p.roll)}`,best:`${b.pattern?.club||p.club||'Custom'} · ${yards((b.pattern||p).carry+(b.pattern||p).roll)}`}
 ],note:'This explains the modeled tradeoff. The blue target is the best sampled target, not a proven optimum. Nominal finish is the core flight without random misses; it is not the average distance of every shot. Costs and shot assumptions can change the recommendation.'};
}

export function retryImpact(firstExpected,nowExpected){
 const gain=firstExpected-nowExpected;
 if(!Number.isFinite(gain))return 'At least one target produced an all-OB pattern; a finite improvement estimate is unavailable.';
 const change=Math.abs(gain),per100=(change*100).toFixed(1);
 return `This target ${gain>=0?'saves':'costs'} an estimated ${change.toFixed(2)} strokes per shot compared with your original decision — ${per100} strokes ${gain>=0?'saved':'lost'} per 100 similar shots. Same hole, profile and random draws. This scales the modeled average; it is not a prediction of your next 100 shots or real-world strokes gained.`;
}
