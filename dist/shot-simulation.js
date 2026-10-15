import {samples,evaluate,optimizeTargets} from './model.js';

export const SHOT_COUNT=4000;
// Pure calculation boundary: no DOM, storage, animation or mode-specific scoring.
// Both targets use the same full seeded draw bank, including cached lesson guides.
export async function calculateShot({aim,pattern,scenario,costs,seed},{guide=null,yieldControl=async()=>{}}={}){
 const draws=samples(SHOT_COUNT,seed),result=evaluate(aim,pattern,scenario,costs,draws,true);
 const best=guide||await optimizeTargets(aim,pattern,scenario,costs,draws,yieldControl);
 const comparison={aim:best.aim,pattern:best.pattern,evaluated:best.evaluated,result:evaluate(best.aim,best.pattern,scenario,costs,draws,true)};
 return{result,comparison};
}
