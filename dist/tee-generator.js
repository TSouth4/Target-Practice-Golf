import {random,inPoly,inGreen,lie} from './model.js';
import {decorateScenario} from './landscape.js';

// Versioned, constrained families: different landing decisions, not random scenery.
export const TEE_GENERATOR_VERSION='tee-v2';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function onSegment(a,b,p){return Math.abs(cross(a,b,p))<1e-8&&p[0]>=Math.min(a[0],b[0])-1e-8&&p[0]<=Math.max(a[0],b[0])+1e-8&&p[1]>=Math.min(a[1],b[1])-1e-8&&p[1]<=Math.max(a[1],b[1])+1e-8;}
function intersects(a,b,c,d){return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0||onSegment(a,b,c)||onSegment(a,b,d)||onSegment(c,d,a)||onSegment(c,d,b);}
export function validPolygon(poly){
 if(!Array.isArray(poly)||poly.length<3||poly.some(p=>p.length!==2||!p.every(Number.isFinite)))return false;
 let area=0;
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-8)return false;area+=a[0]*b[1]-a[1]*b[0];
  for(let j=i+1;j<poly.length;j++){if(j===i+1||i===0&&j===poly.length-1)continue;if(intersects(a,b,poly[j],poly[(j+1)%poly.length]))return false;}
 }
 return Math.abs(area)>1;
}
export function touchesGreen(poly,s){
 if(inPoly(s.green,poly))return true;
 const g=s.green,at=([x,y])=>[(x-g.x)/g.rx,(y-g.y)/g.ry];
 for(let i=0;i<poly.length;i++){const a=at(poly[i]),b=at(poly[(i+1)%poly.length]),dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(-(a[0]*dx+a[1]*dy)/(dx*dx+dy*dy||1),0,1);if((a[0]+t*dx)**2+(a[1]+t*dy)**2<=1)return true;}
 return false;
}
export function validateTeeScenario(s,{minimumReach=180}={}){
 const failures=[];
 if(!validPolygon(s.fairway))failures.push('fairway polygon');
 if(!s.bounds.every(Number.isFinite)||s.bounds[0]>=s.bounds[1])failures.push('boundaries');
 if(![s.green.x,s.green.y,s.green.rx,s.green.ry,s.pin.x,s.pin.y,s.maxY,...s.aimRange,s.aimY].every(Number.isFinite)||s.green.rx<=0||s.green.ry<=0)failures.push('coordinates');
 if(!inGreen(s.pin,s)||lie(s.pin,s)!=='green')failures.push('pin');
 if(s.green.x-s.green.rx<=s.bounds[0]||s.green.x+s.green.rx>=s.bounds[1]||s.green.y+s.green.ry>=s.maxY)failures.push('green bounds');
 if(!(s.aimRange[0]<s.aimY&&s.aimY<s.aimRange[1]))failures.push('target range');
 for(const h of s.hazards){
  if(!validPolygon(h.poly))failures.push(`${h.label} polygon`);
  if(!h.forest&&touchesGreen(h.poly,s))failures.push(`${h.label} touches green`);
  if(h.kind==='water'&&(!h.drop||!['fairway','rough'].includes(lie(h.drop,s))))failures.push('water drop');
 }
 // Even the supported 180-yard minimum reach must have a legal fairway target.
 let playable=false;
 for(let y=Math.ceil(s.aimRange[0]);y<=Math.min(minimumReach-5,s.aimRange[1]);y+=5)for(let x=-55;x<=55;x+=5)if(Math.hypot(x,y)<=minimumReach&&lie({x,y},s)==='fairway')playable=true;
 if(!playable)failures.push('reachable landing area');
 return failures;
}

function buildTee(base,seed,attempt){
 const rng=random((seed+attempt*104729)>>>0),between=(a,b)=>a+(b-a)*rng();
 const squeeze=base.id==='squeeze-par4',creek=base.id==='creek-tee',sharp=base.id==='sharp-dogleg';
 const short=base.id==='drivable'||squeeze,tight=base.id==='narrow',dogleg=base.id==='bend'||sharp;
 const side=rng()<.5?-1:1,greenY=short?between(235,305):between(335,425);
 const bendStart=between(125,205),bend=side*(sharp?between(65,100):dogleg?between(35,58):tight?between(0,7):between(4,18));
 const betweenTurn=between(38,70),sway=between(-12,12),center=y=>bend*smooth((y-bendStart)/(sharp?betweenTurn:greenY-bendStart))+sway*Math.sin(Math.PI*clamp(y/greenY,0,1));
 const earlyWidth=tight?between(14,19):between(24,34),lateWidth=tight?between(9,14):squeeze?between(8,12):between(12,22),neckY=between(205,280),neckDepth=between(3,tight?5:12);
 const width=y=>y<65?10+(earlyWidth-10)*y/65:Math.max(8,earlyWidth+(lateWidth-earlyWidth)*smooth((y-100)/(greenY-100))-neckDepth*Math.exp(-(((y-neckY)/45)**2)));
 const green={x:center(greenY),y:greenY,rx:short?between(12,18):tight?between(12,16):between(15,22),ry:between(16,22)};
 const fairwayEnd=short?greenY-green.ry-15:greenY-green.ry*.45;
 const ys=[0,65,110,150,190,230,270,310,350,390].filter(y=>y<fairwayEnd);ys.push(fairwayEnd);
 const right=ys.map(y=>[center(y)+width(y),y]),left=ys.map(y=>[center(y)-width(y),y]);
 const margin=tight?between(23,27):between(31,46);
 const bounds=[Math.min(...left.map(p=>p[0]),green.x-green.rx)-margin,Math.max(...right.map(p=>p[0]),green.x+green.rx)+margin];
 const s={...structuredClone(base),fairway:[...right,...left.reverse()],green,bounds,maxY:Math.ceil(greenY+green.ry+25),hazards:[],labels:[],aimXRange:sharp?[-120,120]:[-60,60],generatorVersion:TEE_GENERATOR_VERSION,variantSeed:seed,elevationM:9};
 // A monotone bank polygon shares the course centerline but changes its start,
 // end, and intrusion independently of the fairway's width and bend.
 const bank=(kind,label,bankSide,near,far,intrusion,outerWidth)=>{
  const rows=[near,near+(far-near)*.35,near+(far-near)*.7,far];
  const inner=rows.map(y=>[clamp(center(y)+bankSide*(width(y)-intrusion),bounds[0]+2,bounds[1]-2),y]);
  const outer=rows.map((y,i)=>[clamp(inner[i][0]+bankSide*outerWidth,bounds[0]+1,bounds[1]-1),y]);
  const poly=[...inner,...outer.reverse()],mid={x:(inner[1][0]+outer.at(-2)[0])/2,y:rows[1]};
  const h={kind,label,poly};if(kind==='water')h.drop={x:center(near-12),y:near-12};
  s.hazards.push(h);s.labels.push({...mid,text:kind==='water'?'WATER':'SAND'});
 };
 let strategicTag;
 if(creek){
  const creekY=between(175,240),creekWidth=between(10,24),tilt=between(-10,10),left=bounds[0]+2,right=bounds[1]-2;
  s.hazards.push({kind:'water',label:'Crossing creek',poly:[[left,creekY+tilt],[right,creekY-tilt],[right,creekY-tilt+creekWidth],[left,creekY+tilt+creekWidth]],drop:{x:center(creekY-25),y:creekY-25}});
  s.labels.push({x:center(creekY),y:creekY+creekWidth/2,text:'CREEK'});
  bank('bunker','Bunker beyond the creek',side,creekY+creekWidth+20,creekY+creekWidth+45,4,10);
  strategicTag='Crossing creek · stop short or carry';
  s.brief='The creek crosses the landing area at a changing distance and angle. Compare stopping before it with carrying to a narrower landing zone; carry and rollout both matter.';
 }else if(short){
  // The pond stays outside the actual green; front sand stops before its edge.
  const pondNear=between(150,175),pondFar=greenY+green.ry+8;
  const innerX=green.x+side*(green.rx+5),outerX=innerX+side*24;
  s.hazards.push({kind:'water',label:side<0?'Left pond':'Right pond',poly:[[innerX,pondNear],[outerX,pondNear-5],[outerX,pondFar],[innerX,pondFar]],drop:{x:center(pondNear-12),y:pondNear-12}});
  s.labels.push({x:(innerX+outerX)/2,y:(pondNear+pondFar)/2,text:'WATER'});
  const sandY=greenY-green.ry-12;
  s.hazards.push({kind:'bunker',label:'Front bunker',poly:[[green.x-14,sandY-7],[green.x+10,sandY-7],[green.x+15,sandY+6],[green.x-18,sandY+6]]});
  s.labels.push({x:green.x,y:sandY,text:'SAND'});
  strategicTag=`${squeeze?'Narrowing short par 4':'Reachable par 4'} · water ${side<0?'left':'right'}`;
  s.brief='A generous layup area narrows toward a smaller, guarded green. A wide layup area leads to a separate green guarded by front sand and a side pond. Compare a shorter club with going for the green; your reach matters.';
 }else if(tight){
  bank('bunker',side<0?'Left fairway bunker':'Right fairway bunker',side,between(195,230),between(250,275),between(1,4),7);
  strategicTag='Narrow landing area · OB both sides';
  s.brief='The landing corridor changes width with distance, with close boundaries and a fairway bunker. A shorter club tightens the pattern but leaves a longer approach.';
 }else{
  const near=dogleg?between(240,265):between(165,215),far=Math.min(greenY-green.ry-18,near+between(55,90));
  bank('water',dogleg?'Pond beyond the bend':side<0?'Left pond':'Right pond',dogleg?-side:side,near,far,between(1,5),between(20,30));
  const bunkerNear=between(185,220);
  bank('bunker',dogleg?'Inside fairway bunker':'Fairway bunker',dogleg?side:-side,bunkerNear,bunkerNear+between(22,35),between(1,4),between(7,11));
  strategicTag=dogleg?`${sharp?'Sharp dogleg':'Dogleg'} ${side<0?'left':'right'} · water long`:`Changing landing width · water ${side<0?'left':'right'}`;
  s.brief=dogleg?'The bend starts at a different distance and changes the landing angle. An inside bunker and a pond beyond the bend make direction and club choice matter.':'A shifting fairway opens and narrows at different distances. A side pond and an opposing bunker reward choosing room for your misses, not simply aiming at the flag.';
 }
 // Pin placement is within the central ellipse, away from all generated hazards.
 const angle=between(0,Math.PI*2),radius=between(0,.6);s.pin={x:green.x+Math.cos(angle)*green.rx*radius,y:green.y+Math.sin(angle)*green.ry*radius};
 s.length=Math.round(Math.hypot(s.pin.x,s.pin.y));s.aimRange=[short?110:125,short?Math.ceil(greenY+green.ry+5):320];s.aimY=short?Math.round(greenY):250;
 s.name=dogleg?`The ${sharp?'sharp ':''}${side<0?'left':'right'}-hand bend`:base.name;s.tag=strategicTag;
 s.generation={attempt,bendStart,bend,earlyWidth,lateWidth,neckY,neckDepth,hazardSide:side};
 return s;
}

export function generateTeeScenario(base,seed){
 for(let attempt=0;attempt<8;attempt++){
  const s=decorateScenario(buildTee(base,seed,attempt));if(!validateTeeScenario(s).length)return s;
 }
 // Preserve the known-good authored family if a candidate cannot be validated.
 const fallback=decorateScenario({...structuredClone(base),variantSeed:seed,generatorVersion:TEE_GENERATOR_VERSION,elevationM:9,generation:{fallback:true}});
 fallback.hazards=fallback.hazards.filter(h=>!h.forest||validPolygon(h.poly));
 return fallback;
}
