import {patternAtTarget,shotAt} from './model.js';

// World-space landing geometry only. Projection, animation and scoring stay with
// their existing callers. Match the original 64-point, 80% carry core exactly.
export function carryOutline(aim,pattern){
 const contour=[],targetPattern={...patternAtTarget(aim,pattern),bigPct:0};
 for(let i=0;i<64;i++){
  const t=i/64*Math.PI*2;
  const pt=shotAt(aim,targetPattern,{z1:1.794*Math.cos(t),z2:1.794*Math.sin(t),u:1,sign:1});
  contour.push(Object.freeze([pt.landing.x,pt.landing.y]));
 }
 return Object.freeze(contour);
}

// Four entries cover chosen/comparison outlines across nearby redraws without
// retaining a round's geometry. Snapshot values so in-place edits cannot return
// stale geometry. The projection is deliberately excluded: every frame still
// projects the same world points using its current camera.
export function createCarryOutlineCache(){
 const entries=new Map();
 return (aim,pattern)=>{
  let cacheable=true;
  const key=JSON.stringify([aim.x,aim.y,pattern],(_,value)=>{
   if(typeof value==='number'&&(!Number.isFinite(value)||Object.is(value,-0)))cacheable=false;
   return value;
  });
  // JSON merges non-finite numbers with null and -0 with 0. Do not cache those
  // unusual inputs; calculating normally preserves their original semantics.
  if(!cacheable)return carryOutline(aim,pattern);
  if(entries.has(key)){
   const value=entries.get(key);entries.delete(key);entries.set(key,value);return value;
  }
  const value=carryOutline(aim,pattern);entries.set(key,value);
  if(entries.size>4)entries.delete(entries.keys().next().value);
  return value;
 };
}
