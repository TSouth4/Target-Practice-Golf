// Illustrative, bounded teaching estimates; not a measured aerodynamic model.
export const CONDITIONS_VERSION='wind-firmness-v1';
export const CALM={version:CONDITIONS_VERSION,difficulty:'easy',windX:0,windY:0,firmness:'normal'};
export function validConditions(c,difficulty=c?.difficulty){return !!c&&c.version===CONDITIONS_VERSION&&['easy','medium','hard'].includes(c.difficulty)&&c.difficulty===difficulty&&Number.isFinite(c.windX)&&Number.isFinite(c.windY)&&Math.hypot(c.windX,c.windY)<=15.01&&['soft','normal','firm'].includes(c.firmness)&&(difficulty!=='easy'||c.windX===0&&c.windY===0&&c.firmness==='normal');}
export function conditionsFor(difficulty='easy',seed=1){
 if(!['medium','hard'].includes(difficulty))return{...CALM};
 let a=seed>>>0;const rng=()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
 const speed=difficulty==='medium'?3+Math.floor(rng()*4):8+Math.floor(rng()*8),angle=Math.floor(rng()*8)*Math.PI/4;
 return{version:CONDITIONS_VERSION,difficulty,windX:Number((speed*Math.sin(angle)).toFixed(3))||0,windY:Number((speed*Math.cos(angle)).toFixed(3))||0,firmness:['soft','normal','firm'][Math.floor(rng()*3)]};
}
export function windEffect(aim,p,carry=p.carry){
 const c=p.conditions;if(!c||c.difficulty==='easy'||!validConditions(c))return{x:0,y:0,side:0,forward:0};
 const theta=Math.atan2(aim.x,aim.y),sin=Math.sin(theta),cos=Math.cos(theta),height=Math.max(.5,Math.min(1.7,(p.height||25)/25)),exposure=(Math.max(1,carry)/150)**1.15*height;
 const cross=c.windX*cos-c.windY*sin,along=c.windX*sin+c.windY*cos,side=cross*exposure,forward=Math.max(-carry*.25,Math.min(carry*.2,along*exposure*(along<0?1:.6)));
 return{x:cos*side+sin*forward,y:-sin*side+cos*forward,side,forward};
}
export function rolloutDistance(p,kind='fairway'){
 const c=p.conditions;if(!c||c.difficulty==='easy'||!validConditions(c))return p.roll;
 if(['bunker','trees','water','ob'].includes(kind))return 0;
 const height=Math.max(.5,Math.min(1.7,(p.height||25)/25)),extra=p.roll===0&&c.firmness==='firm'?Math.min(8,p.carry*.03)/height:0;
 return(p.roll*(c.firmness==='soft'?.35:c.firmness==='firm'?1.6:1)+extra)*(kind==='rough'?.35:1);
}
export function conditionsLabel(c){
 if(!validConditions(c)||c.difficulty==='easy')return'Calm · normal ground';
 const speed=Math.round(Math.hypot(c.windX,c.windY)),x=Math.abs(c.windX)<.1?'':c.windX>0?'right':'left',y=Math.abs(c.windY)<.1?'':c.windY>0?'toward green':'toward you';
 return`${speed} mph blowing ${[x,y].filter(Boolean).join(' and ')} · ${c.firmness} ground`;
}
export function conditionsFeedback(aim,p){
 const c=p.conditions;if(!validConditions(c)||c.difficulty==='easy')return'';const w=windEffect(aim,p),parts=[];
 if(Math.abs(w.side)>=.5)parts.push(`about ${Math.round(Math.abs(w.side))} yd ${w.side>0?'right':'left'}`);
 if(Math.abs(w.forward)>=.5)parts.push(`about ${Math.round(Math.abs(w.forward))} yd ${w.forward>0?'longer':'shorter'}`);
 return`For the center flight, wind moved the landing ${parts.join(' and ')||'less than 1 yd'}. Your chosen target stayed fixed. ${c.firmness==='firm'?'Firm ground adds roll, so leave room beyond the landing area.':c.firmness==='soft'?'Soft ground reduces roll, so a safe landing may leave a longer next shot.':'Normal ground uses the stock rollout estimate, with less roll from rough and no roll from sand or trees.'} Your usual shot shape is still included; higher flights feel more wind. The comparison uses the same conditions.`;
}
export function validConditionSchedule(profile,schedule,assessment=false){
 const difficulty=profile?.difficulty||'easy';if(!['easy','medium','hard'].includes(difficulty))return false;
 if(difficulty==='easy')return schedule.every(s=>s.conditions===undefined||validConditions(s.conditions,'easy'));
 return profile.conditionsVersion===CONDITIONS_VERSION&&schedule.every(s=>validConditions(s.conditions,difficulty))&&(!assessment||schedule.every(s=>JSON.stringify(s.conditions)===JSON.stringify(schedule[0].conditions)));
}
