// Editorial interpretation of existing results. No sampling, optimization,
// grading, storage or counterfactual scoring takes place here.
const HAZARDS=[['water','water'],['ob','out of bounds'],['bunker','bunkers'],['trees','recovery vegetation']];
const rate=(r,k)=>(r.counts?.[k]||0)/Math.max(1,r.n||0);
export function comparisonAdjustment(aim,p,b){
 const heading=Math.atan2(aim.x,aim.y),other=Math.atan2(b.aim.x,b.aim.y);
 // Compare headings at the player's carry: changing distance at the same
 // heading can change world x without being a direction adjustment.
 const side=Math.sin(other-heading)*Math.max(1,p.carry),carry=(b.pattern?.carry??Math.hypot(b.aim.x,b.aim.y))-p.carry;
 const direction=Math.abs(side)>2,depth=Math.abs(carry)>3||!!p.club&&!!b.pattern?.club&&p.club!==b.pattern.club;
 const axis=direction&&depth?'both':direction?'direction':depth?'carry':'small';
 return {axis,side,carry,label:{both:'Direction and carry',direction:'Direction',carry:'Carry distance',small:'Small target adjustment'}[axis]};
}
function experiment(a){
 const turn=a.side<0?'left':'right',distance=a.carry<0?'shorter':'longer';
 if(a.axis==='both')return `Try aiming ${turn} with carry held steady, then test a ${distance} carry separately. Predict the effect on your misses before comparing.`;
 if(a.axis==='direction')return `Try aiming farther ${turn} with the same intended carry. Predict which misses will change, then compare.`;
 if(a.axis==='carry')return `Try a ${distance} intended carry with direction held steady. Predict the effect on your misses and next shot, then compare.`;
 return 'Try a small target adjustment and compare the whole pattern, rather than judging one ball.';
}
export function decisionStory(aim,p,r,b,s,assessment){
 const a=comparisonAdjustment(aim,p,b),q=b.result;

 const leader=HAZARDS.map(([key,name])=>({key,name,gap:rate(r,key)-rate(q,key)})).sort((x,y)=>y.gap-x.gap)[0];
 let why,principle,trial=experiment(a),courseReason;
 if(!Number.isFinite(q.expected)){
  why='Every sampled target produced only out-of-bounds outcomes. This run has no usable target comparison.';
  principle='Check your club distances, start line, shot shape and miss settings before trying to learn from this run.';
  trial='Adjust the shot setup and try again; the blue target is not a usable recommendation here.';
  courseReason='No usable target comparison was available. Check the shot setup before interpreting the rating.';
 }else if(!Number.isFinite(r.expected)){
  why='Every simulated shot from your choice finished out of bounds. The comparison has playable outcomes.';
  principle='Give the whole pattern room inside the boundaries, including your usual start line, curve and misses.';
  courseReason='The chosen pattern finished entirely out of bounds; the comparison had playable outcomes.';
 }else if(assessment.kind==='balanced'){
  why='The sampled alternative offers little or no modeled improvement over your choice. A single lucky or unlucky ball does not decide target quality.';
  principle='Keep weighing room for normal misses against useful distance. Several targets can be reasonable; the blue point is not the only acceptable choice.';
  trial='If you retry, predict how another reasonable target would change the pattern, then compare.';
  courseReason='The sampled alternative offered little or no modeled improvement. Judge the choice by the whole pattern, not this one ball.';
  if(rate(r,'water')+rate(r,'ob')>.1){why+=' The pattern still has substantial penalty exposure.';courseReason+=' Penalty risk was still substantial.';}
 }else if(assessment.kind==='aggressive'){
  why=`Your pattern reaches ${leader.name} more often than the comparison. The extra trouble was not worth the benefit in this simulation.`;
  principle=a.axis==='direction'?'When trouble sits beside a target, leave room for ordinary left and right misses, even if that means a longer next shot.':a.axis==='carry'?'Choose carry with room for ordinary short and long misses around trouble. Clearing a hazard with only your best strike leaves little margin.':'Judge the whole landing area: leave room for left/right and short/long misses, then weigh that safety against useful distance.';
  courseReason=`More of your pattern reached ${leader.name} than the comparison; the extra risk did not pay off in this model.`;
 }else if(assessment.kind==='conservative'){
  const nextGap=(r.breakdown?.nextShot??NaN)-(q.breakdown?.nextShot??NaN);
  why=(nextGap>.005?'Your target leaves a more costly next shot, and its safety benefit does not cover that cost in this simulation.':'Your central finish is farther from the flag. The alternative improves the overall mix of proximity and where misses finish.');
  principle=a.axis==='direction'?'Give trouble room, but avoid moving so far away that you leave an unnecessarily hard next shot.':a.axis==='carry'&&a.carry>0?'Before laying back, weigh the trouble avoided against the next shot you leave. A tighter pattern helps only when the safety gained is worth the distance given up.':a.axis==='carry'?'A safe target still needs useful proximity. Going well beyond the flag can give away closeness just as laying up short can.':'Weigh both miss room and the shot you leave. Before choosing extra safety, compare what you avoid with the distance or proximity you give up.';
  courseReason=nextGap>.005?'The safety gained did not cover the harder next shot left by this target.':'This target gave up proximity; the comparison improved the overall modeled tradeoff.';
 }else{
  why=`The alternative improves the overall mix of lies and proximity. This is not clearly just an aggression or caution mistake.`;
  principle='Compare where the whole pattern finishes. A change of club or position can help without meaning you should always play more safely or more aggressively.';
  courseReason='A direction or carry adjustment improved the overall tradeoff; this was not clearly a simple risk-versus-safety mistake.';
 }
 return {what:assessment.label,axis:assessment.kind==='balanced'?'Sound choice':a.label,why,principle,experiment:trial,courseReason};
}
const COSTS={nextShot:'next-shot and putting cost',rough:'rough recovery cost',bunker:'bunker recovery cost',trees:'tree recovery cost',water:'water penalty and recovery cost',ob:'out-of-bounds penalty and repeat cost'};
export function retryStory(first,now){
 const gain=first.expected-now.expected;
 if(!Number.isFinite(gain)){
  if(!Number.isFinite(first.expected)&&Number.isFinite(now.expected))return {verdict:'This adjustment created playable outcomes.',reason:'The original pattern was entirely out of bounds. The new choice makes progress in the model, but a finite strokes-saved estimate is unavailable.'};
  if(Number.isFinite(first.expected)&&!Number.isFinite(now.expected))return {verdict:'This adjustment finished entirely out of bounds.',reason:'The original choice had playable outcomes. A finite strokes-lost estimate is unavailable for the new all-OB pattern.'};
  return {verdict:'A finite comparison is unavailable.',reason:'Both choices had an all-out-of-bounds pattern. Check the shot setup before interpreting a numerical improvement.'};
 }
 if(Math.abs(gain)<.005)return {verdict:'These choices performed similarly.',reason:'The modeled difference is very small. Compare where the misses finish before treating either target as clearly better.'};
 const helped=gain>0;
 const changes=Object.entries(COSTS).map(([key,name])=>({name,value:(first.breakdown?.[key]??NaN)-(now.breakdown?.[key]??NaN)})).filter(v=>Number.isFinite(v.value)&&(helped?v.value>.005:v.value<-.005)).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));
 return {verdict:helped?'This adjustment helped.':'This adjustment cost more.',reason:changes.length?`The largest modeled ${helped?'saving':'added cost'} came from ${changes[0].name}. The result also includes the other parts of the tradeoff.`:'The overall modeled result changed. Compare both patterns; the available results do not isolate one reason.'};
}
