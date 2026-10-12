// Teaching profiles, not measured handicap averages or personal maximums.
export const DRIVER_LIMITS={0:280,5:265,10:250,20:225};
const CLUBS=[['Driver',1,15,1],['3 wood',.89,10,.82],['Hybrid',.78,7,.66],['5 iron',.71,4,null],['6 iron',.66,3,null],['7 iron',.585,3,null],['8 iron',.53,2,null],['9 iron',.475,2,null],['PW',.415,1,null],['SW',.30,0,null]];
export function trainingBag(p){
 if(p.customBag)return p.customBag.filter(c=>p.shotType==='tee'||c.club!=='Driver').map(c=>({...c,stock:p.shotType==='approach'?c.stock-c.roll:c.stock,roll:p.shotType==='approach'?0:c.roll})).sort((a,b)=>b.stock-a.stock);
 const maximum=p.driverLimit||DRIVER_LIMITS[p.handicap];
 return CLUBS.filter(c=>p.shotType==='tee'||c[0]!=='Driver').map(([club,fraction,roll,spread])=>{
  const stock=maximum*fraction-(p.aimMode==='carry'&&p.shotType==='approach'?roll:0);
  return{club,stock,roll:p.shotType==='tee'?roll:0,sdSide:spread===null?p.ironSide*stock/155:p.driverSide*spread,sdLong:spread===null?p.ironLong*stock/155:p.driverLong*spread};
 });
}
export function reachLimit(p){return p.autoBag?Math.max(...trainingBag(p).map(c=>c.stock-(p.aimMode==='carry'?c.roll:0))):330+(p.aimMode==='carry'?0:p.roll);}
export function clubPattern(distance,p){
 const carryMode=p.aimMode==='carry',bag=trainingBag(p),capacity=c=>c.stock-(carryMode?c.roll:0),d=Math.min(distance,Math.max(...bag.map(capacity)));
 const club=[...bag].sort((a,b)=>capacity(a)-capacity(b)||a.stock-b.stock).find(c=>capacity(c)>=d-1e-7)||bag[0];
 const fraction=Math.max(.25,Math.min(1,d/capacity(club)));
 const custom=p.customBag?{start:club.start,curve:club.curve*fraction,bias:club.bias*fraction,height:club.height,bigPct:club.bigPct,bigDirection:club.bigDirection,bigShift:club.bigShift*fraction,bigShort:club.bigShort*fraction,rho:club.rho}:{};
 return {...p,...custom,club:club.club,stockDistance:capacity(club),carry:Math.max(1,d-(carryMode?0:club.roll)),roll:club.roll,sdSide:club.sdSide*fraction,sdLong:club.sdLong*fraction};
}
