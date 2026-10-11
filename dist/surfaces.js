import {inPoly,clamp} from './model.js';
import {EYE_CAMERA,projectEye,unprojectEye} from './camera.js';
// Yard units. Relief is illustrative rendering; the shot model still uses 2D lies.
export const RELIEF={green:1.35,bunker:2.4,water:1.6};
const cache=new WeakMap();
function edgeDistance(p,poly){let d=Infinity;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);d=Math.min(d,Math.hypot(p.x-a[0]-dx*t,p.y-a[1]-dy*t));}return d;}
function geometry(s){if(!cache.has(s))cache.set(s,s.hazards.filter(h=>['water','bunker'].includes(h.kind)).map(h=>({...h,minX:Math.min(...h.poly.map(p=>p[0])),maxX:Math.max(...h.poly.map(p=>p[0])),minY:Math.min(...h.poly.map(p=>p[1])),maxY:Math.max(...h.poly.map(p=>p[1]))})));return cache.get(s);}
export function surfaceHeight(s,p){
 for(const h of geometry(s))if(p.x>=h.minX&&p.x<=h.maxX&&p.y>=h.minY&&p.y<=h.maxY&&inPoly(p,h.poly))return -RELIEF[h.kind]*Math.min(1,edgeDistance(p,h.poly)/(h.kind==='water'?2.5:4));
 const r2=((p.x-s.green.x)/s.green.rx)**2+((p.y-s.green.y)/s.green.ry)**2;return r2<1?RELIEF.green*(1-r2):0;
}
export function projectSurface(s,p,elevation){return projectEye({...p,z:surfaceHeight(s,p)+(p.z||0)},elevation);}
export function unprojectSurface(s,x,y,elevation){
 // Pick the actual painted faces, in reverse paint order. This also handles the
 // deliberately exposed hazard bowls without mistaking them for foreground turf.
 const meshes=[greenTriangles(s),...geometry(s).map(h=>hazardTriangles(h))];
 for(let m=meshes.length-1;m>=0;m--)for(let i=meshes[m].length-1;i>=0;i--){const triangle=meshes[m][i],screen=triangle.map(([x,y])=>projectSurface(s,{x,y},elevation)),[a,b,c]=screen;
  if(x<Math.min(a.x,b.x,c.x)||x>Math.max(a.x,b.x,c.x)||y<Math.min(a.y,b.y,c.y)||y>Math.max(a.y,b.y,c.y))continue;
  const det=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(det)<1e-10)continue;
  const u=((b.y-c.y)*(x-c.x)+(c.x-b.x)*(y-c.y))/det,v=((c.y-a.y)*(x-c.x)+(a.x-c.x)*(y-c.y))/det,w=1-u-v;if(Math.min(u,v,w)<-1e-8)continue;
  const weights=[u,v,w].map((q,j)=>q/(triangle[j][1]+EYE_CAMERA.behindBall)),total=weights.reduce((a,b)=>a+b,0);
  return{x:triangle.reduce((sum,p,j)=>sum+p[0]*weights[j],0)/total,y:triangle.reduce((sum,p,j)=>sum+p[1]*weights[j],0)/total};
 }
 return unprojectEye(x,y,elevation);
}
function cross(a,b,c){return(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);}
function triangulate(poly){
 const points=poly.map(p=>[...p]),area=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0);if(area<0)points.reverse();
 const triangles=[];let safety=0;
 while(points.length>3&&safety++<1000){let found=false;for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length];if(cross(a,b,c)<=1e-8)continue;if(points.some(p=>p!==a&&p!==b&&p!==c&&cross(a,b,p)>=-1e-8&&cross(b,c,p)>=-1e-8&&cross(c,a,p)>=-1e-8))continue;triangles.push([a,b,c]);points.splice(i,1);found=true;break;}if(!found)break;}
 if(points.length===3)triangles.push(points);return triangles;
}
function subdivide(t,depth){if(!depth)return[t];const[a,b,c]=t,ab=[(a[0]+b[0])/2,(a[1]+b[1])/2],bc=[(b[0]+c[0])/2,(b[1]+c[1])/2],ca=[(c[0]+a[0])/2,(c[1]+a[1])/2];return[[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]].flatMap(q=>subdivide(q,depth-1));}
function hazardTriangles(h){return h.mesh??=triangulate(h.poly).flatMap(t=>subdivide(t,3));}
const greenCache=new WeakMap();
function greenTriangles(s){if(!greenCache.has(s)){const g=s.green,rings=[1,.82,.56,.28,0],n=72,out=[],point=(r,i)=>[g.x+Math.cos(i/n*Math.PI*2)*g.rx*r,g.y+Math.sin(i/n*Math.PI*2)*g.ry*r];for(let r=0;r<rings.length-1;r++)for(let i=0;i<n;i++){const a=point(rings[r],i),b=point(rings[r],i+1),c=point(rings[r+1],i+1),d=point(rings[r+1],i);out.push([a,b,c],[a,c,d]);}greenCache.set(s,out);}return greenCache.get(s);}
function mix(a,b,t){const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),x=rgb(a),y=rgb(b);return'#'+x.map((v,i)=>Math.round(v+(y[i]-v)*clamp(t,0,1)).toString(16).padStart(2,'0')).join('');}
function poly(points,project,attrs){return`<polygon points="${points.map(([x,y])=>{const p=project({x,y});return`${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ')}" ${attrs}/>`;}
export function drawRelief(s,project,theme,map=false){
 let out='<g id="surfaceRelief">';
 // Raised green shoulders, followed by progressively higher putting-surface rings.
 const g=s.green,rings=[1,.82,.56,.28,0],n=72;
 const point=(r,i)=>[g.x+Math.cos(i/n*Math.PI*2)*g.rx*r,g.y+Math.sin(i/n*Math.PI*2)*g.ry*r];
 for(let r=0;r<rings.length-1;r++)for(let i=0;i<n;i++){const shade=.22+r*.2+(Math.sin(i/n*Math.PI*2)+Math.cos(i/n*Math.PI*2))*.08;out+=poly([point(rings[r],i),point(rings[r],i+1),point(rings[r+1],i+1),point(rings[r+1],i)],project,`fill="${mix('#5f9e34','#b3eb66',shade)}" stroke="${mix('#5f9e34','#b3eb66',shade)}" stroke-width=".35"`);}
 out+=poly(Array.from({length:n},(_,i)=>point(1,i)),project,'fill="none" stroke="#50822f" stroke-width="1.5"');
 for(const h of geometry(s)){
  hazardTriangles(h);
  out+=`<g data-surface="${h.kind}">`;
  for(const t of h.mesh){const z=t.reduce((sum,[x,y])=>sum-surfaceHeight(s,{x,y}),0)/3/RELIEF[h.kind],colors=h.kind==='water'?theme.water:theme.sand;out+=poly(t,project,`fill="${mix(colors[0],colors[1],h.kind==='water'?.25+z*.55:z*.8)}" stroke="${mix(colors[0],colors[1],h.kind==='water'?.25+z*.55:z*.8)}" stroke-width=".4"`);}
  out+=poly(h.poly,project,`fill="none" stroke="${h.kind==='water'?'#2d6572':'#799342'}" stroke-width="${map?1.6:2.5}"`);
  if(h.kind==='water')for(let y=h.minY+3;y<h.maxY;y+=5)for(let x=h.minX+3;x<h.maxX-5;x+=9){const a={x,y},b={x:x+5,y:y+.15};if(inPoly(a,h.poly)&&inPoly(b,h.poly)&&edgeDistance(a,h.poly)>2&&edgeDistance(b,h.poly)>2){const p=project(a),q=project(b);out+=`<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="#d1f0e6" stroke-width=".8" opacity=".48"/>`;}}
  out+='</g>';
 }
 return out+'</g>';
}
