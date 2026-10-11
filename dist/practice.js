import {SCENARIOS,random} from './model.js';
import {decorateScenario} from './landscape.js';
import {generateTeeScenario} from './tee-generator.js';
import {generateApproachScenario} from './approach-generator.js';
export const PRACTICE_SEQUENCE=['cedar','water','bend','tucked','drivable','bowl','narrow','split','par5-open','par5-carry','sharp-dogleg','creek-tee','squeeze-par4','creek-par3'];
export function nextScenario(id,filter='mixed',seed=1,recent=[]){
 const typeOf=key=>SCENARIOS.find(s=>s.id===key)?.type;
 const allowed=PRACTICE_SEQUENCE.filter(key=>(filter==='mixed'||typeOf(key)===filter)&&key!==id);
 // Keep a short history, then prefer the other shot type in mixed practice.
 let fresh=allowed.filter(key=>!recent.includes(key));if(!fresh.length)fresh=allowed;
 if(filter==='mixed'){const opposite=fresh.filter(key=>typeOf(key)!==typeOf(id));if(opposite.length)fresh=opposite;}
 return fresh[Math.floor(random(seed)()*fresh.length)];
}
export function generateScenario(base,seed=0){
 const s=structuredClone(base);s.elevationM=base.type==='tee'?9:8;s.variantSeed=seed;
 if(!seed)return decorateScenario(s);
 if(base.type==='tee')return generateTeeScenario(base,seed);
 return generateApproachScenario(base,seed);
}
