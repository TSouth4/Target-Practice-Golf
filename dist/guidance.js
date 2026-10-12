import {inPoly} from './model.js';
// Distances along the selected straight aim ray, in yards. Terrain only;
// this describes geometry, not the probability that a curved shot clears it.
export function rayIntervals(poly,aim){
 const length=Math.hypot(aim.x,aim.y),dx=aim.x/length,dy=aim.y/length;if(!length)return[];
 const hits=[0];
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ex=b[0]-a[0],ey=b[1]-a[1],cross=dx*ey-dy*ex;if(Math.abs(cross)<1e-9)continue;const t=(a[0]*ey-a[1]*ex)/cross,u=(a[0]*dy-a[1]*dx)/cross;if(t>=0&&u>=0&&u<=1)hits.push(t);}
 const sorted=[...new Set(hits.map(x=>Math.round(x*1e6)/1e6))].sort((a,b)=>a-b),intervals=[];
 for(let i=1;i<sorted.length;i++){const mid=(sorted[i-1]+sorted[i])/2;if(inPoly({x:dx*mid,y:dy*mid},poly))intervals.push([sorted[i-1],sorted[i]]);}
 return intervals;
}
export function targetFacts(aim,p,s){return{total:Math.hypot(aim.x,aim.y),toPin:Math.hypot(aim.x-s.pin.x,aim.y-s.pin.y),crossings:s.hazards.filter(h=>['water','bunker'].includes(h.kind)).flatMap(h=>rayIntervals(h.poly,aim).map(([near,far])=>`${h.kind==='water'?'water':'sand'} ${Math.round(near)}–${Math.round(far)} yd`))};}
export function hazardCallouts(s,style){
 const out=s.hazards.filter(h=>['water','bunker'].includes(h.kind)).map(h=>{const near=Math.min(...h.poly.map(p=>p[1])),far=Math.max(...h.poly.map(p=>p[1])),y=near+(far-near)*.25;const edges=[];for(let i=0;i<h.poly.length;i++){const a=h.poly[i],b=h.poly[(i+1)%h.poly.length];if(a[1]!==b[1]&&y>=Math.min(a[1],b[1])&&y<=Math.max(a[1],b[1]))edges.push(a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]));}return{kind:h.kind,x:edges.length?(Math.min(...edges)+Math.max(...edges))/2:h.poly[0][0],y,label:h.kind==='water'?'WATER':'BUNKER',color:h.kind==='water'?'#8cdeef':'#f6d89c',distance:`${Math.round(near)}–${Math.round(far)} yd forward`};});
 for(const x of s.bounds)out.push({kind:'ob',x,y:Math.min(s.aimY,s.maxY),label:'OUT OF BOUNDS',color:'#eb9685',distance:`${Math.round(Math.abs(x))} yd ${x<0?'left':'right'} of center`});
 return out;
}
export function retryRows(first,now){const f=x=>Number.isFinite(x)?x.toFixed(2):'∞',target=a=>`${Math.round(Math.abs(a.x))} yd ${a.x<0?'left':'right'} · ${Math.round(a.y)} deep`,club=p=>`${p.club} · ${Math.round(p.carry+p.roll)} yd`;return[
 {label:'Target',first:target(first.aim),now:target(now.aim)},
 {label:'Club / planned distance',first:club(first.pattern),now:club(now.pattern)},
 {label:'Decision score',first:first.score===null?'—':first.score+' / 100',now:now.score===null?'—':now.score+' / 100'},
 {label:'Expected strokes',first:f(first.result.expected),now:f(now.result.expected)},
 {label:'Water + OB',first:(first.result.penalty*100).toFixed(1)+'%',now:(now.result.penalty*100).toFixed(1)+'%'}];}

// Front/back are intersections of the ball-to-green-center line with the green ellipse.
export function greenYardages(s){
 const g=s.green,length=Math.hypot(g.x,g.y),dx=g.x/length,dy=g.y/length;
 const radius=1/Math.sqrt((dx/g.rx)**2+(dy/g.ry)**2);
 return [{label:'GREEN FRONT',kind:'front',x:g.x-dx*radius,y:g.y-dy*radius,distance:length-radius},{label:'FLAG',kind:'flag',...s.pin,distance:Math.hypot(s.pin.x,s.pin.y)},{label:'GREEN BACK',kind:'back',x:g.x+dx*radius,y:g.y+dy*radius,distance:length+radius}];
}
