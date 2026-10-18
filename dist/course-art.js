import {drawPlant} from './landscape.js';
const plantArtCache=new WeakMap();
// Presentation only. Geometry, vegetation placement and shot calculations stay shared.
export function illustratedTheme(theme){return {...theme,sky:[theme.shape==='broadleaf'?'#73a9c0':theme.sky[0],'#edf0df'],fairway:[theme.fairway[1],theme.fairway[0]],sand:['#c9b17a','#faedc8'],water:[theme.water[0],'#8bbfbe']};}
export function illustratedDefinitions(theme,s,project){const a=project({x:s.green.x-s.green.rx,y:s.green.y+s.green.ry}),b=project({x:s.green.x+s.green.rx,y:s.green.y-s.green.ry});return `<linearGradient id="art-green" gradientUnits="userSpaceOnUse" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"><stop stop-color="#b9d77e"/><stop offset="1" stop-color="#87ae57"/></linearGradient>${theme.tree.map((color,i)=>`<linearGradient id="art-canopy${i}" x2=".45" y2="1"><stop stop-color="${['#789653','#819c5c','#8aa366'][i]}"/><stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="#2b513b"/></linearGradient>`).join('')}`;}
function closedCurve(points){const n=v=>v.toFixed(2);return points.map((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length],c=points[(i+2)%points.length];return `${i?'':'M'+n(p[0])+','+n(p[1])}C${n(p[0]+(b[0]-a[0])/6)},${n(p[1]+(b[1]-a[1])/6)} ${n(b[0]-(c[0]-p[0])/6)},${n(b[1]-(c[1]-p[1])/6)} ${n(b[0])},${n(b[1])}`;}).join(' ')+'Z';}
export function drawIllustratedPlant(p,project,theme,index){
 if(p.shape!=='broadleaf')return drawPlant(p,project,theme).replace('class="landscape-plant"','class="landscape-plant illustrated-plant"').replaceAll(`fill="${theme.tree[p.tone]}"`,`fill="url(#art-canopy${p.tone})"`);
 const base=project(p),top=project({...p,z:p.height}),h=Math.max(3,base.y-top.y),w=Math.max(1,Math.abs(project({x:p.x+p.width,y:p.y}).x-base.x)),phase=p.x*1.7+p.y*.13,tone=p.tone,wide=.83+.1*Math.sin(phase);
 const key=[base.x,base.y,h,w,theme.tree[tone]].join(','),cached=plantArtCache.get(p);if(cached?.key===key)return cached.markup;
 const crown=closedCurve(Array.from({length:40},(_,i)=>{const a=i/40*Math.PI*2,r=.87+.065*Math.sin(a*7+phase)+.045*Math.cos(a*11-phase);return [w*Math.cos(a)*r*wide,-h*.64+h*.35*Math.sin(a)*r];}));
 const id='art-crown-'+index;
 let out=`<g class="landscape-plant illustrated-plant" data-lie="${p.kind}" data-shape="${p.shape}" transform="translate(${base.x.toFixed(2)},${base.y.toFixed(2)})" opacity="${p.y>180?.82:1}"><defs><clipPath id="${id}"><path d="${crown}"/></clipPath></defs><ellipse cx="${w*.6}" cy="3" rx="${w*1.4}" ry="${w*.16}" fill="#213d2920"/><path d="M${-w*.06} 0L${w*.04} ${-h*.72}M0 ${-h*.28}L${-w*.4} ${-h*.62}M0 ${-h*.4}L${w*.36} ${-h*.75}" stroke="#655c43" stroke-width="${Math.max(1,w*.15)}" stroke-linecap="round" fill="none"/><path d="M${-w*.03} 0L${w*.05} ${-h*.61}" stroke="#b3a477" stroke-width="${Math.max(.6,w*.035)}" opacity=".5"/><path d="${crown}" fill="url(#art-canopy${tone})"/><g clip-path="url(#${id})">`;
 for(let j=0;j<5;j++){
  const cx=Math.sin(phase+j*2.4)*w*.52,cy=-h*(.44+.09*j),rx=w*(.22+.07*Math.sin(phase+j)**2),ry=h*(.075+.018*Math.cos(j+phase));
  const patch=closedCurve(Array.from({length:16},(_,k)=>{const a=k/16*Math.PI*2,r=.8+.17*Math.sin(a*5+j+phase);return[cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r];}));
  out+=`<path d="${patch}" fill="${j%2?'#b4c17b':'#244c38'}" opacity="${j%2?.07:.08}"/>`;
 }
 const markup=out+`<path d="M${w*.2} ${-h}Q${w*.8} ${-h*.6} ${w*.35} ${-h*.25}H${w*1.3}V${-h}Z" fill="#1e4934" opacity=".13"/></g></g>`;
 plantArtCache.set(p,{key,markup});return markup;
}
