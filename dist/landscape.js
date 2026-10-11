import {random,inPoly,lie} from './model.js';
export const LANDSCAPES={
 woodland:{name:'East Coast woodland',sky:['#aebfd0','#e6e7d6'],rough:['#789357','#627d42'],fairway:['#639843','#87bd57'],ground:'#c7d7ad',recovery:'#386344',tree:['#274b38','#386344','#547b48'],shape:'broadleaf',density:1,sand:['#e5ca98','#fff0c6'],water:['#397f9b','#81c7d4']},
 coast:{name:'Pacific Coast',sky:['#9bbac9','#e1e5dc'],rough:['#9ca779','#899369'],fairway:['#699f54','#90bd66'],ground:'#d6dcc0',recovery:'#73866b',tree:['#294f49','#3c6757','#63816c'],shape:'cypress',density:.75,sand:['#e4cfaa','#fff3cf'],water:['#276f96','#80cbd7']},
 desert:{name:'Desert',sky:['#9ecad6','#f0e1c4'],rough:['#d4b787','#b59865'],fairway:['#61923e','#8abc50'],ground:'#e5cda6',recovery:'#ad966a',tree:['#476858','#5c7960','#76906a'],shape:'cactus',density:.35,sand:['#cb9f69','#f5d8a0'],water:['#277f98','#6fcbd1']}
};
function section(s,y){
 const xs=[];for(let i=0;i<s.fairway.length;i++){const a=s.fairway[i],b=s.fairway[(i+1)%s.fairway.length];if(y>=Math.min(a[1],b[1])&&y<=Math.max(a[1],b[1])&&a[1]!==b[1])xs.push(a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]));}
 if(Math.abs(y-s.green.y)<=s.green.ry+10){const width=s.green.rx+8;xs.push(s.green.x-width,s.green.x+width);}
 return xs.length?[Math.min(...xs),Math.max(...xs)]:[s.green.x-s.green.rx,s.green.x+s.green.rx];
}
export function decorateScenario(s){
 const buffer=s.type==='tee'?13:10;
 for(const side of [-1,1]){
  const outer=side<0?s.bounds[0]+1:s.bounds[1]-1,inner=[];
  for(let y=45;y<=s.maxY;y+=7){const edge=section(s,y)[side<0?0:1]+side*buffer;inner.push([side<0?Math.max(outer,edge):Math.min(outer,edge),y]);}
  if(inner.some(p=>Math.abs(p[0]-outer)>3))s.hazards.push({kind:'trees',label:'Recovery vegetation',forest:true,poly:[...inner,[outer,inner.at(-1)[1]],[outer,inner[0][1]]]});
 }
 return s;
}
const vegetationCache=new WeakMap();
export function vegetation(s,style='woodland'){
 let cache=vegetationCache.get(s);if(!cache){cache={};vegetationCache.set(s,cache);}if(cache[style])return cache[style];
 const theme=LANDSCAPES[style],rng=random((s.variantSeed||131)+Number(s.hole)*173),plants=[];
 function add(x,y){const kind=lie({x,y},s);if(!['trees','ob'].includes(kind))return;if(rng()>theme.density)return;const height=theme.shape==='cactus'?3.5+rng()*3:9+rng()*5,width=theme.shape==='cactus'?1.8:3.4+rng()*2.2;const mature=theme.shape!=='cactus'&&kind==='ob'&&rng()<.45;plants.push({x,y,kind,height:height*(mature?1.25:1),width:width*(mature?1.15:1),tone:Math.floor(rng()*3),shape:theme.shape});}
 for(const h of s.hazards.filter(h=>h.kind==='trees')){const xs=h.poly.map(p=>p[0]),ys=h.poly.map(p=>p[1]);for(let y=Math.min(...ys)+2;y<=Math.max(...ys);y+=7)for(let x=Math.min(...xs)+2;x<=Math.max(...xs);x+=5.5){const p={x:x+(rng()-.5)*3,y:y+(rng()-.5)*3};if(inPoly(p,h.poly))add(p.x,p.y);}}
 // Two overlapping rows beyond the white stakes complete the visual corridor.
 for(let y=45;y<s.maxY+12;y+=7)for(const side of [-1,1])for(let row=0;row<2;row++)add((side<0?s.bounds[0]:s.bounds[1])+side*(5+row*7+rng()*3),y+rng()*5);
 cache[style]=plants.sort((a,b)=>b.y-a.y);return cache[style];
}
export function drawPlant(p,project,theme){
 const base=project({x:p.x,y:p.y}),top=project({x:p.x,y:p.y,z:p.height}),h=Math.max(3,base.y-top.y),w=Math.max(1,p.width*1000/(p.y+6)),color=theme.tree[p.tone];
 let canopy;
 if(p.shape==='cactus')canopy=`<path d="M0 0V${-h}M0 ${-h*.45}H${-w}V${-h*.75}M0 ${-h*.3}H${w}V${-h*.58}" fill="none" stroke="${color}" stroke-width="${Math.max(2,w*.4)}" stroke-linecap="round"/><path d="M${w*.1} 0V${-h}" stroke="#a2b492" stroke-width="1" opacity=".5"/>`;
 else if(p.shape==='cypress')canopy=`<path d="M0 ${-h}Q${w*.38} ${-h*.75} ${w*.2} ${-h*.6}L${w*.85} ${-h*.3}L${w*.5} ${-h*.25}L${w} ${-h*.1}Q0 ${-h*.02} ${-w} ${-h*.1}L${-w*.5} ${-h*.25}L${-w*.85} ${-h*.3}L${-w*.2} ${-h*.6}Q${-w*.35} ${-h*.75} 0 ${-h}Z" fill="${color}"/><path d="M0 ${-h}L${w*.2} ${-h*.6}L${w*.85} ${-h*.3}L${w*.5} ${-h*.25}L${w} ${-h*.1}H0Z" fill="#16392d" opacity=".3"/>`;
 else canopy=`<path d="M${-w*.75} ${-h*.25}C${-w*1.25} ${-h*.3} ${-w*1.2} ${-h*.65} ${-w*.7} ${-h*.68}C${-w} ${-h*.95} ${-w*.3} ${-h*1.04} 0 ${-h*.94}C${w*.28} ${-h*1.12} ${w*.94} ${-h*.93} ${w*.72} ${-h*.67}C${w*1.27} ${-h*.7} ${w*1.25} ${-h*.31} ${w*.68} ${-h*.24}Q0 ${-h*.1} ${-w*.75} ${-h*.25}Z" fill="${color}"/><ellipse cx="${-w*.3}" cy="${-h*.71}" rx="${w*.38}" ry="${h*.16}" fill="#a5bd79" opacity=".16"/><path d="M0 ${-h*.93}Q${w*.95} ${-h*.98} ${w*.72} ${-h*.67}Q${w*1.3} ${-h*.5} ${w*.68} ${-h*.24}Q${w*.2} ${-h*.15} 0 ${-h*.22}Z" fill="#183b2c" opacity=".26"/>`;
 return `<g class="landscape-plant" data-lie="${p.kind}" transform="translate(${base.x.toFixed(2)},${base.y.toFixed(2)})"><ellipse cy="2" rx="${w*1.05}" ry="${Math.max(1,w*.18)}" fill="#203d2828"/><path d="M0 0V${-h*.65}" stroke="#665c43" stroke-width="${Math.max(1,w*.13)}"/>${canopy}</g>`;
}
