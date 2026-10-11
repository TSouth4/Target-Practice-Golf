export const TRACER_COLORS={fairway:'#b3ec77',green:'#b3ec77',rough:'#ffc165',water:'#4bd6fa',ob:'#ff776e',bunker:'#fff0c5',trees:'#d9a9ff'};
// Evenly spaced examples from the original random draws; not a new simulation or an outcome quota.
export function tracerSample(points,limit=48){const n=Math.min(limit,points.length);return Array.from({length:n},(_,i)=>points[Math.floor((i+.5)*points.length/n)]);}
// Illustrative flight shape. Exact carry and final locations come from the scored shot.
export function tracerTrajectory(shot,aim,p,steps=40){
 const theta=Math.atan2(aim.x,aim.y),sin=Math.sin(theta),cos=Math.cos(theta);
 const carry=shot.landing.x*sin+shot.landing.y*cos,lateral=shot.landing.x*cos-shot.landing.y*sin;
 const start=carry*Math.tan(p.start*Math.PI/180),points=[];
 // A later apex keeps the launch readable from standing height. Not aerodynamic physics.
 const apex=(1.3+Math.sqrt(5.89))/6,peak=apex*(1-apex)*(.35+apex);
 for(let i=0;i<=steps;i++){const t=i/steps,forward=carry*t,side=start*t+(lateral-start)*t*t;points.push({x:sin*forward+cos*side,y:cos*forward-sin*side,z:p.height*t*(1-t)*(.35+t)/peak});}
 points[steps]={...shot.landing,z:0};
 points.push({x:shot.x,y:shot.y,z:0});
 return points;
}
