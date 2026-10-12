import {DRIVER_LIMITS,clubPattern,reachLimit} from './bag.js';
import {EXTRA_HOLES} from './holes.js';
// Geometry, rendering, and simulation share these exact yard coordinates.
export const SCENARIOS = [
 {id:'cedar',type:'tee',name:'Cedar corridor',tag:'OB right · water left',hole:'01',par:4,length:410,pin:{x:8,y:410},maxY:440,aimY:270,aimRange:[170,310],bounds:[-76,47],
  brief:'A 410-yard par 4 with a narrowing landing area. Water guards the left; the white-staked boundary punishes a big miss right.',
  fairway:[[-12,0],[12,0],[24,100],[22,190],[16,275],[22,335],[24,388],[-12,388],[-15,335],[-23,275],[-29,190],[-22,100]],
  green:{x:8,y:410,rx:17,ry:19},
  hazards:[{kind:'water',label:'Water',poly:[[-76,155],[-32,168],[-29,218],[-26,260],[-32,305],[-76,310]],drop:{x:-24,y:170}},
   {kind:'bunker',label:'Fairway bunker',poly:[[20,244],[34,248],[37,269],[27,281],[18,271]]},
   {kind:'trees',label:'Recovery trees',poly:[[35,70],[47,70],[47,218],[32,214]]}],labels:[{x:-49,y:235,text:'WATER'},{x:51,y:280,text:'OB'},{x:27,y:262,text:'SAND'}]},
 {id:'bend',type:'tee',name:'The long temptation',tag:'Dogleg right · water long',hole:'02',par:4,length:385,pin:{x:42,y:382},maxY:415,aimY:250,aimRange:[170,305],bounds:[-47,92],
  brief:'This dogleg rewards position. A pond beyond the main landing area makes extra distance less useful than it first looks.',
  fairway:[[-12,0],[12,0],[22,110],[24,190],[27,242],[48,285],[58,340],[54,365],[29,365],[25,320],[5,285],[-18,260],[-25,210],[-24,130]],
  green:{x:42,y:382,rx:17,ry:18},
  hazards:[{kind:'water',label:'Long pond',poly:[[-32,282],[0,285],[12,305],[14,339],[-7,363],[-40,350]],drop:{x:0,y:278}},
   {kind:'bunker',label:'Inside bunker',poly:[[22,221],[40,225],[44,245],[33,258],[23,248]]},
   {kind:'trees',label:'Right trees',poly:[[49,110],[90,110],[90,282],[58,269],[44,213]]}],labels:[{x:-17,y:320,text:'WATER'},{x:-51,y:236,text:'OB'},{x:64,y:188,text:'TREES'}]},
 {id:'water',type:'approach',name:'Carry the corner',tag:'155 yards · water short',hole:'03',par:4,length:155,pin:{x:8,y:155},maxY:200,aimY:155,aimRange:[95,190],bounds:[-66,66],
  brief:'The flag sits in the back-right portion of a green guarded by water short and right. Distance control matters as much as your aim.',
  fairway:[[-12,0],[12,0],[20,45],[23,82],[20,112],[19,145],[-21,145],[-23,90],[-22,40]],
  green:{x:0,y:150,rx:22,ry:18},
  hazards:[{kind:'water',label:'Front pond',poly:[[-5,106],[43,101],[60,125],[55,159],[24,167],[23,132],[-5,130]],drop:{x:-9,y:101}},
   {kind:'bunker',label:'Left bunker',poly:[[-30,132],[-21,137],[-22,157],[-30,161],[-39,149],[-38,139]]},
   {kind:'trees',label:'Back recovery',poly:[[-53,180],[58,180],[61,198],[-55,198]]}],labels:[{x:34,y:117,text:'WATER'},{x:-31,y:148,text:'SAND'}]},
 {id:'tucked',type:'approach',name:'The tucked flag',tag:'172 yards · bunker left',hole:'04',par:3,length:172,pin:{x:-11,y:176},maxY:215,aimY:172,aimRange:[110,205],bounds:[-63,43],
  brief:'A tempting left pin sits just over a bunker. The right half of the green offers space, but a large right miss reaches the boundary.',
  fairway:[[-12,0],[12,0],[22,70],[17,125],[20,158],[-21,158],[-24,125],[-23,70]],
  green:{x:0,y:172,rx:23,ry:19},
  hazards:[{kind:'bunker',label:'Left bunker',poly:[[-38,149],[-19,146],[-14,156],[-19,169],[-30,174],[-42,165]]},
   {kind:'trees',label:'Back recovery',poly:[[-57,197],[42,197],[42,215],[-57,215]]}],labels:[{x:-30,y:159,text:'SAND'},{x:46,y:178,text:'OB'}]}
 ,...EXTRA_HOLES
];
export const DEFAULT_COSTS = {rough:.22,bunker:.45,trees:.9,waterExtra:0,base150:3.1,longSlope:.55,puttBase:1.2};
// These are deliberately illustrative, not empirical handicap-conditioned data.
const PRESETS = {
 0:{tee:[265,11,9,2,32],approach:[155,5,6,2,18]},
 5:{tee:[250,15,12,4,40],approach:[155,7,8,4,22]},
 10:{tee:[235,20,16,6,48],approach:[155,10,11,6,28]},
 20:{tee:[210,28,21,10,58],approach:[155,14,16,10,34]}
};
export function preset(handicap,type){const [carry,sdSide,sdLong,bigPct,bigShift]=PRESETS[handicap][type];return {carry,roll:type==='tee'?15:0,sdSide,sdLong,bigPct,bigShift,bigDirection:'both',bigShort:12,start:0,curve:0,bias:0,height:type==='tee'?32:25,rho:0};}
export function basicPattern(handicap,s,driverLimit=DRIVER_LIMITS[handicap]){const driver=preset(handicap,'tee'),iron=preset(handicap,'approach');const p={...preset(handicap,s.type),autoBag:true,handicap,driverLimit,shotType:s.type,aimXRange:s.aimXRange||[-60,60],driverSide:driver.sdSide,driverLong:driver.sdLong,ironSide:iron.sdSide,ironLong:iron.sdLong,start:0,curve:0,bias:0,rho:0,bigPct:0,bigShort:0};return patternAtTarget(fitTarget({x:0,y:s.aimY},p),p);}
// The target sets nominal straight-flight finish distance. Custom curve/bias still moves the finish.
export function patternAtTarget(aim,p){const distance=Math.hypot(aim.x,aim.y);return p.autoBag?clubPattern(distance,p):{...p,carry:Math.max(1,distance-(p.aimMode==='carry'?0:p.roll))};}
export function fitTarget(aim,p){const distance=Math.hypot(aim.x,aim.y);return distance>reachLimit(p)?aimAtDistance(aim,reachLimit(p),p.aimXRange):{...aim};}
export function aimAtDepth(aim,y,range,lateralRange=[-60,60]){const depth=clamp(y,...range);return{x:clamp(aim.x/Math.max(1,aim.y)*depth,...lateralRange),y:depth};}
export function aimAtDistance(aim,distance,lateralRange=[-60,60]){const theta=Math.atan2(aim.x,aim.y),x=clamp(Math.sin(theta)*distance,...lateralRange);return{x,y:Math.sqrt(Math.max(1,distance*distance-x*x))};}
export function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
const polyBounds=new WeakMap();
export function inPoly(p,poly){let bounds=polyBounds.get(poly);if(!bounds){bounds=[Math.min(...poly.map(v=>v[0])),Math.max(...poly.map(v=>v[0])),Math.min(...poly.map(v=>v[1])),Math.max(...poly.map(v=>v[1]))];polyBounds.set(poly,bounds);}if(p.x<bounds[0]||p.x>bounds[1]||p.y<bounds[2]||p.y>bounds[3])return false;let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if((a[1]>p.y)!==(b[1]>p.y)&&p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function segmentPolyEntry(a,b,poly){
 if(inPoly(a,poly))return {x:a.x,y:a.y};
 const rx=b.x-a.x,ry=b.y-a.y;
 let earliest=Infinity;
 for(let i=0;i<poly.length;i++){const c=poly[i],d=poly[(i+1)%poly.length],sx=d[0]-c[0],sy=d[1]-c[1],cross=rx*sy-ry*sx;if(Math.abs(cross)<1e-10)continue;const qx=c[0]-a.x,qy=c[1]-a.y,t=(qx*sy-qy*sx)/cross,u=(qx*ry-qy*rx)/cross;if(t>=0&&t<=1&&u>=0&&u<=1)earliest=Math.min(earliest,t);}
 return Number.isFinite(earliest)?{x:a.x+earliest*rx,y:a.y+earliest*ry}:inPoly(b,poly)?{x:b.x,y:b.y}:null;
}
export function segmentHitsPoly(a,b,poly){return segmentPolyEntry(a,b,poly)!==null;}
export function inGreen(p,s){return ((p.x-s.green.x)/s.green.rx)**2+((p.y-s.green.y)/s.green.ry)**2<=1;}
export function lie(p,s){if(p.x<s.bounds[0]||p.x>s.bounds[1]||p.y<0||p.y>s.maxY+100)return 'ob';for(const h of s.hazards)if(inPoly(p,h.poly))return h.kind;if(inGreen(p,s))return 'green';return inPoly(p,s.fairway)?'fairway':'rough';}
export function remaining(p,s,c,kind=lie(p,s)){
 const d=Math.hypot(p.x-s.pin.x,p.y-s.pin.y);
 if(kind==='green')return Math.min(2.8,c.puttBase+.3*Math.log1p(d*3));
 const base=d<=150?2.05+(c.base150-2.05)*d/150:c.base150+(d-150)*c.longSlope/100;
 const woods=kind==='trees'?s.hazards.find(h=>h.forest&&inPoly(p,h.poly)):null;
 return base+(c[kind]||0)*(woods?.recoveryMultiplier||1);
}
export function random(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export function samples(n=4000,seed=7142026){const rng=random(seed),out=[];for(let i=0;i<n;i++){const r=Math.sqrt(-2*Math.log(Math.max(1e-12,rng()))),theta=2*Math.PI*rng();out.push({z1:r*Math.cos(theta),z2:r*Math.sin(theta),u:rng(),sign:rng()<.5?-1:1});}return out;}
export function shotAt(aim,p,z){
 const theta=Math.atan2(aim.x,aim.y),sin=Math.sin(theta),cos=Math.cos(theta);
 const big=z.u<p.bigPct/100,sign=p.bigDirection==='left'?-1:p.bigDirection==='right'?1:z.sign;
 const factor=big?2:1;
 const longitudinal=p.sdLong*(p.rho*z.z1+Math.sqrt(1-p.rho*p.rho)*z.z2)*factor-(big?p.bigShort:0);
 const carry=Math.max(1,p.carry+longitudinal);
 const offset=carry*Math.tan(p.start*Math.PI/180)+p.curve+p.bias+p.sdSide*z.z1*factor+(big?sign*p.bigShift:0);
 const end={x:sin*(carry+p.roll)+cos*offset,y:cos*(carry+p.roll)-sin*offset};
 const landing={x:sin*carry+cos*offset,y:cos*carry-sin*offset};
 return {...end,landing,big};
}
export function outcome(end,s){
 // Water contact is tested at carry and along a fixed roll segment, not airborne flight.
 for(const h of s.hazards.filter(h=>h.kind==='water')){const finish=segmentPolyEntry(end.landing,end,h.poly);if(finish)return {kind:'water',drop:h.drop,finish};}
 if(lie(end,s)==='ob')return {kind:'ob'};
 return {kind:lie(end,s)};
}
export function evaluate(aim,p,s,c,zs,collect=false){
 const counts={fairway:0,green:0,rough:0,bunker:0,water:0,trees:0,ob:0};let subtotal=0;const points=collect?[]:null;const vals=[];
 for(const z of zs){const end=shotAt(aim,p,z),o=outcome(end,s);counts[o.kind]++;
  const v=o.kind==='ob'?null:o.kind==='water'?2+c.waterExtra+remaining(o.drop,s,c,'rough'):1+remaining(end,s,c,o.kind);
  if(v!==null)subtotal+=v;vals.push(v);if(collect)points.push({...end,...o.finish,kind:o.kind});
 }
 const n=zs.length,pob=counts.ob/n;
 // Repeating the same strategy after stroke-and-distance: E = (nonOB + 2*pOB)/(1-pOB).
 const expected=pob===1?Infinity:(subtotal/n+2*pob)/(1-pob);
 let variance=0;if(Number.isFinite(expected))for(const v of vals)variance+=((v===null?2+expected:v)-expected)**2;
 return {counts,expected,se:Math.sqrt(variance/n)/Math.sqrt(n)/Math.max(.001,1-pob),points,n,penalty:(counts.water+counts.ob)/n,big:zs.filter(z=>z.u<p.bigPct/100).length/n};
}
export function optimize(aim,p,s,c,zs){
 // Fixed club and aim depth: 61 horizontal candidates plus the selected aim.
 let best={aim:{...aim},result:evaluate(aim,p,s,c,zs)};
 for(let x=-60;x<=60;x+=2){const candidate={x,y:aim.y},result=evaluate(candidate,p,s,c,zs);if(result.expected<best.result.expected)best={aim:candidate,result};}
 return best;
}
export async function optimizeTargets(aim,p,s,c,zs,yieldRow=async()=>{}){
 // Full shared draws at every candidate: broad 6 × 10 yd grid, then local 2 × 2 yd refinement.
 const lateralRange=s.aimXRange||[-60,60];
 const seen=new Set();let best={aim:{...aim},pattern:patternAtTarget(aim,p),result:null},evaluated=0;
 function consider(candidate){const key=`${candidate.x.toFixed(4)},${candidate.y.toFixed(4)}`;if(seen.has(key))return;seen.add(key);if(Math.hypot(candidate.x,candidate.y)>reachLimit(p)+1e-7)return;const pattern=patternAtTarget(candidate,p);if(pattern.carry<50||pattern.carry>330)return;const result=evaluate(candidate,pattern,s,c,zs);evaluated++;if(!best.result||result.expected<best.result.expected)best={aim:{...candidate},pattern,result};}
 consider(aim);
 const depths=new Set([Math.min(s.aimRange[1],reachLimit(p)),Math.min(s.aimY,reachLimit(p))]);for(let y=s.aimRange[0];y<=Math.min(s.aimRange[1],reachLimit(p));y+=10)depths.add(y);
 if(aim.y>=s.aimRange[0]&&aim.y<=s.aimRange[1])depths.add(aim.y);
 if(s.pin.y>=s.aimRange[0]&&s.pin.y<=s.aimRange[1]){depths.add(s.pin.y);consider({x:clamp(s.pin.x,...lateralRange),y:s.pin.y});}
 for(const y of depths){for(let x=lateralRange[0];x<=lateralRange[1];x+=6)consider({x,y});await yieldRow();}
 const center={...best.aim};
 for(let dy=-10;dy<=10;dy+=2){for(let dx=-6;dx<=6;dx+=2)consider({x:clamp(center.x+dx,...lateralRange),y:clamp(center.y+dy,...s.aimRange)});await yieldRow();}
 return {...best,evaluated};
}
export const FEEDBACK_RULES={closeStrokes:.05,riskGap:.02,proximityGap:5};
export function decisionFeedback(aim,p,r,b,s){
 if(!Number.isFinite(b.result.expected))return{kind:'refine',label:'Pattern needs adjustment',reason:'Every sampled target produced only OB outcomes. This run has no usable target comparison.'};
 const regret=Number.isFinite(r.expected)?Math.max(0,r.expected-b.result.expected):Infinity;
 if(regret<=FEEDBACK_RULES.closeStrokes)return{kind:'balanced',label:'Strong decision',reason:'Within 0.05 expected strokes of the best sampled target in this model.'};
 if(!Number.isFinite(r.expected))return{kind:'aggressive',label:'Too aggressive',reason:'Every simulated shot finished OB. Change the target or the shot pattern.'};
 const risk=q=>(q.counts.water+q.counts.ob+q.counts.bunker+q.counts.trees)/q.n;
 const extraRisk=risk(r)-risk(b.result);
 if(extraRisk>FEEDBACK_RULES.riskGap)return{kind:'aggressive',label:'Too aggressive',reason:'Your pattern reaches water, OB, sand or trees more often. Give the misses more room.'};
 const mean=a=>shotAt(a,{...patternAtTarget(a,p),sdSide:0,sdLong:0,bigPct:0},{z1:0,z2:0,u:1,sign:1});
 const distance=a=>{const q=mean(a);return Math.hypot(q.x-s.pin.x,q.y-s.pin.y);};
 if(distance(aim)>distance(b.aim)+FEEDBACK_RULES.proximityGap)return{kind:'conservative',label:'Too conservative',reason:'You give up more distance or proximity than the safety gain is worth in this model.'};
 return{kind:'refine',label:'Target needs refining',reason:'A different direction or depth lowers the modeled cost; this is not clearly a simple risk-versus-safety mistake.'};
}
export function decisionScore(expected,best,aim=null,bestAim=null){
 if(!Number.isFinite(expected)||!Number.isFinite(best))return 0;
 const regret=Math.max(0,expected-best),score=Math.round(clamp(100-60*regret,0,100));
 const close=aim&&bestAim?Math.hypot(aim.x-bestAim.x,aim.y-bestAim.y)<=2:regret===0;
 return score===100&&(!close||regret>.005)?99:score;
}
