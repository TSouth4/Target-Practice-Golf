import {shotAt,outcome} from './model.js';
// Planning aid only: follows the selected aim, before curve, bias or misses.
// It does not reveal a simulated center flight, hazard result or recommended aim.
export function plannedRollout(aim,p){
 const distance=Math.hypot(aim.x,aim.y),dx=distance?aim.x/distance:0,dy=distance?aim.y/distance:1;
 return{landing:{x:dx*p.carry,y:dy*p.carry},finish:{x:dx*(p.carry+p.roll),y:dy*(p.carry+p.roll)},roll:p.roll};
}
// Review-only center of the core flight, not the mean of all mixture outcomes.
// Use the same water contact rule as the scored shots, so roll ends at contact.
export function centerFlight(aim,p,s){
 const shot=shotAt(aim,{...p,sdSide:0,sdLong:0,bigPct:0},{z1:0,z2:0,u:1,sign:1},s),o=outcome(shot,s);
 const finish=o.finish?{...o.finish}:{x:shot.x,y:shot.y};
 return{landing:{...shot.landing},finish,kind:o.kind,roll:Math.hypot(finish.x-shot.landing.x,finish.y-shot.landing.y)};
}
