import {greenPoint,greenOutline} from './green-geometry.js';
// Preview-only artwork: alternate two-yard bands parallel to the long axis.
// Vertices stay inside the same ellipse and are projected on its existing relief.
export function drawGreenMowing(g,project){
 const longY=g.ry>=g.rx,shortRadius=longY?g.rx:g.ry,width=2,sections=2,rows=16;
 const screen=(across,along)=>{const limit=Math.sqrt(Math.max(0,1-across*across)),u=longY?across:along*limit,v=longY?along*limit:across,p=greenPoint(g,Math.atan2(v,u),Math.hypot(u,v)),q=project(p);return`${q.x.toFixed(2)},${q.y.toFixed(2)}`;};
 let path='';
 for(let start=-shortRadius,band=0;start<shortRadius;start+=width,band++){
  if(band%2===0)continue;
  const end=Math.min(shortRadius,start+width);
  for(let i=0;i<sections;i++)for(let j=0;j<rows;j++){
   const a=(start+(end-start)*i/sections)/shortRadius,b=(start+(end-start)*(i+1)/sections)/shortRadius,c=-1+2*j/rows,d=-1+2*(j+1)/rows;
   path+=`M${screen(a,c)}L${screen(b,c)}L${screen(b,d)}L${screen(a,d)}Z`;
  }
 }
 const edge=greenOutline(g).map(([x,y])=>{const q=project({x,y});return`${q.x.toFixed(2)},${q.y.toFixed(2)}`;}).join(' ');
 return `<defs><clipPath id="studyMowingClip"><polygon points="${edge}"/></clipPath></defs><g id="studyMowingBands" fill="#315d2e" opacity=".14" clip-path="url(#studyMowingClip)" pointer-events="none"><path d="${path}"/></g>`;
}
