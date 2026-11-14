// Shared ellipse geometry; rotation is radians, positive counterclockwise in yard coordinates.
// Missing/zero rotation keeps the original arithmetic and geometry.
export function greenLocal(p,g){const x=p.x-g.x,y=p.y-g.y;if(!g.rotation)return{x,y};const c=Math.cos(g.rotation),s=Math.sin(g.rotation);return{x:x*c+y*s,y:-x*s+y*c};}
export function greenLevel(p,g){const q=greenLocal(p,g);return(q.x/g.rx)**2+(q.y/g.ry)**2;}
export function greenPoint(g,t,r=1){const x=Math.cos(t)*g.rx*r,y=Math.sin(t)*g.ry*r;if(!g.rotation)return{x:g.x+x,y:g.y+y};const c=Math.cos(g.rotation),s=Math.sin(g.rotation);return{x:g.x+x*c-y*s,y:g.y+x*s+y*c};}
export function greenOutline(g,n=72,extra=0){const ring={...g,rx:g.rx+extra,ry:g.ry+extra};return Array.from({length:n},(_,i)=>{const p=greenPoint(ring,i/n*Math.PI*2);return[p.x,p.y];});}
export function greenBounds(g){const c=Math.cos(g.rotation||0),s=Math.sin(g.rotation||0),x=Math.hypot(g.rx*c,g.ry*s),y=Math.hypot(g.rx*s,g.ry*c);return{minX:g.x-x,maxX:g.x+x,minY:g.y-y,maxY:g.y+y};}
export function greenRadiusAlong(g,dx,dy){const q=greenLocal({x:g.x+dx,y:g.y+dy},g);return 1/Math.sqrt((q.x/g.rx)**2+(q.y/g.ry)**2);}
