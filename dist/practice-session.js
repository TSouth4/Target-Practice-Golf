import {SCENARIOS} from './model.js';
export const PRACTICE_KEY='target-practice-free-session-v1';
export const PAUSED_ROUND_KEY='target-practice-paused-round-v1';
export function freshPracticeSeed(previous=0){
 const value=(globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0]??Math.floor(Math.random()*2147483645))%2147483645+1;
 return value===previous?value%2147483645+1:value;
}
export function readPractice(raw){
 try{const s=JSON.parse(raw);if(s?.version!==1||!SCENARIOS.some(h=>h.id===s.scenario)||!Number.isInteger(s.holeSeed)||s.holeSeed<=0||s.holeSeed>2147483646||!Number.isInteger(s.seed)||s.seed<=0||s.seed>2147483646)return null;
 return {...s,hasAim:s.hasAim===true&&Number.isFinite(s.aim?.x)&&Number.isFinite(s.aim?.y),practiceFilter:['tee','approach','mixed'].includes(s.practiceFilter)?s.practiceFilter:'mixed',recent:Array.isArray(s.recent)?s.recent.filter(id=>SCENARIOS.some(h=>h.id===id)).slice(-6):[]};
 }catch{return null;}
}
export function practiceSnapshot(state,hasAim){return {version:1,scenario:state.scenario,holeSeed:state.holeSeed,seed:state.seed,landscape:state.landscape,aim:{...state.aim},hasAim,practiceFilter:state.practiceFilter,recent:[...state.recent],encounter:state.encounter};}
