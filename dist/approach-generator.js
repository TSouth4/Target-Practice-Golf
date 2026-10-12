import {random} from './model.js';
import {decorateScenario} from './landscape.js';
import {validateTeeScenario,validPolygon} from './tee-generator.js';

export const APPROACH_GENERATOR_VERSION='approach-v3';
function build(base,seed,attempt){
 const rng=random((seed+attempt*104729)>>>0),between=(a,b)=>a+(b-a)*rng(),side=rng()<.5?-1:1;
 const par5=!!base.secondShot,creek=base.id==='creek-par3'||base.id==='par5-carry';
 const y=par5?between(190,275):between(110,215),x=between(-28,28);
 const green={x,y,rx:between(11,21),ry:between(13,23)},sway=between(-9,9),center=d=>x*d/y+sway*Math.sin(Math.PI*d/y);
 const early=between(20,30),late=between(11,19),width=d=>d<50?10+(early-10)*d/50:early+(late-early)*Math.min(1,d/y);
 const end=y-green.ry*.4,ys=[0,50,80,110,150,190,230].filter(d=>d<end);ys.push(end);
 const right=ys.map(d=>[center(d)+width(d),d]),left=ys.map(d=>[center(d)-width(d),d]);
 const bounds=[Math.min(...left.map(p=>p[0]),x-green.rx)-40,Math.max(...right.map(p=>p[0]),x+green.rx)+40];
 const s={...structuredClone(base),green,fairway:[...right,...left.reverse()],bounds,hazards:[],labels:[],maxY:Math.ceil(y+green.ry+48),aimY:Math.round(y),aimRange:[par5?75:55,Math.ceil(y+green.ry+20)],variantSeed:seed,generatorVersion:APPROACH_GENERATOR_VERSION,elevationM:8};
 const drop={x:center(Math.max(30,y-green.ry-50)),y:Math.max(30,y-green.ry-50)};
 function hazard(kind,label,cx,cy,rx,ry){
  s.hazards.push({kind,label,poly:[[cx-rx,cy-ry*.6],[cx-rx*.65,cy-ry],[cx+rx*.7,cy-ry],[cx+rx,cy+ry*.7],[cx+rx*.6,cy+ry],[cx-rx*.7,cy+ry]],...(kind==='water'?{drop:{...drop}}:{})});
  s.labels.push({x:cx,y:cy,text:kind==='water'?'WATER':'SAND'});
 }
 let problem;
 if(base.id==='water'){
  hazard('water','Front pond',x,y-green.ry-12,between(25,40),between(7,9));
  hazard('bunker','Back-side bunker',x+side*(green.rx+10),y+5,between(5,8),between(9,15));
  problem='A front pin sits just beyond water. Compare flag proximity with room for shorter finishes; too much depth can leave a longer next putt or miss the back of the green.';
 }else if(creek){
  const far=y-green.ry-10,near=far-between(12,30),tilt=between(-4,4);
  s.hazards.push({kind:'water',label:par5?'Carry creek':'Front creek',poly:[[bounds[0]+3,near+tilt],[bounds[1]-3,near-tilt],[bounds[1]-3,far-tilt],[bounds[0]+3,far+tilt]],drop:{...drop}});
  s.labels.push({x:center(near),y:(near+far)/2,text:'CREEK'});
  hazard('bunker','Greenside bunker',x+side*(green.rx+10),y+between(-3,8),between(5,8),between(9,15));
  problem='A crossing creek separates the layup from a smaller green. Its carry distance changes with each scenario. Compare a safe short target with a carry your clubs can reach.';
 }else if(base.id==='bowl'){
  hazard('bunker','Front bunker',x+between(-8,8),y-green.ry-14,between(12,22),between(5,8));
  hazard('water','Back pond',x+between(-10,10),y+green.ry+20,between(25,38),between(8,12));
  problem='A smaller green lies between front sand and back water. More depth clears the sand but brings the pond into the pattern; direction changes the tradeoff too.';
 }else if(base.id==='split'){
  for(const bankSide of [-1,1])hazard('bunker',bankSide<0?'Left bunker':'Right bunker',x+bankSide*(green.rx+10),y+between(-8,8),between(5,8),between(10,18));
  problem='The green sits at a changing angle between two bunkers. Its width and depth vary independently, so the flag is not always the safest target.';
 }else if(par5){
  hazard('bunker','Greenside bunker',x+side*(green.rx+10),y+between(-8,8),between(5,8),between(10,16));
  problem='Your second shot on a par 5 has a reachable green for some club profiles and a layup for others. Compare the wider short landing area with the tighter green entrance.';
 }else{
  hazard('water',side<0?'Left pond':'Right pond',x+side*(green.rx+11),y+between(-6,6),between(7,9),green.ry+between(9,19));
  hazard('bunker','Front-side bunker',x-side*green.rx*.7,y-green.ry-12,between(6,12),between(5,8));
  problem='A side pond and front-side sand guard a green whose angle, size and pin position change. Give your dispersion room without leaving an unnecessarily long next shot.';
 }
 const angle=between(0,Math.PI*2),radius=between(.15,.7);
 s.pin={x:x+Math.cos(angle)*green.rx*radius,y:y+Math.sin(angle)*green.ry*radius};
 // Tucked flags deliberately tempt players toward a guarded edge; the green remains playable.
 if(base.id==='tucked')s.pin={x:x+side*green.rx*.84,y:y+green.ry*between(-.2,.2)};
 if(base.id==='water')s.pin={x:x+green.rx*between(-.15,.15),y:y-green.ry*.84};
 if(base.id==='bowl')s.pin={x:x+green.rx*between(-.15,.15),y:y+green.ry*(side<0?-.82:.82)};
 if(base.id==='split')s.pin={x:x+side*green.rx*.85,y:y+green.ry*between(-.15,.15)};
s.length=Math.round(Math.hypot(s.pin.x,s.pin.y));
 s.tag=`${s.length} yards · ${par5?'par 5 second shot':s.par===3?'par 3':'approach'} · ${creek?'crossing creek':base.id==='bowl'?'sand short / water long':'guarded green'}`;
 s.brief=problem;s.generation={attempt,greenWidth:green.rx*2,greenDepth:green.ry*2,hazardSide:side,creek};
 return s;
}
export function generateApproachScenario(base,seed){
 for(let attempt=0;attempt<8;attempt++){
  const s=decorateScenario(build(base,seed,attempt));if(!validateTeeScenario(s,{minimumReach:160}).length)return s;
 }
 const s=decorateScenario({...structuredClone(base),variantSeed:seed,generatorVersion:APPROACH_GENERATOR_VERSION,elevationM:8,generation:{fallback:true}});
 s.hazards=s.hazards.filter(h=>!h.forest||validPolygon(h.poly));return s;
}
