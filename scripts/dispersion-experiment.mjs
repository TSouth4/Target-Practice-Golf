// Research only. Never imported by gameplay or its workers.
export const EXPERIMENTS=[
 {id:'current',label:'Current symmetric pattern',note:'Existing depth spread; stated carry is the center.'},
 {id:'shifted',label:'Shifted reference',note:'Same width; stated carry is P70. Experimental for irons.'},
 {id:'mixture',label:'Good contact + short mishits',note:'65% of current depth SD; 20% of shots lose another 1.5 original SD. Illustrative, not fitted.'}
];
export function experimentDraws(draws,id){
 if(!EXPERIMENTS.some(v=>v.id===id))throw Error('Unknown experiment');
 return draws.map(z=>({...z,z2:id==='current'?z.z2:id==='shifted'?z.z2-.5244005127080409:.65*z.z2-(z.u<.2?1.5:0)}));
}
export function fixedClubPattern(base,club,aim){
 const d=Math.hypot(aim.x,aim.y),capacity=club.stock-club.roll,f=d/capacity;
 if(base.rho!==0||base.bigPct!==0||base.aimMode!=='carry')throw Error('This isolated experiment requires zero correlation, no existing mishit mixture and carry mode');
 if(f<.75-1e-8||f>1+1e-8)return null;
 return {...base,autoBag:false,club:club.club,stockDistance:capacity,carry:d,roll:club.roll,sdSide:club.sdSide*f,sdLong:club.sdLong*f};
}
