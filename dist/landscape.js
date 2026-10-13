import {random,inPoly,lie} from './model.js';
export const LANDSCAPES={
 woodland:{name:'East Coast woodland',sky:['#aebfd0','#e6e7d6'],rough:['#789357','#627d42'],fairway:['#639843','#87bd57'],ground:'#c7d7ad',recovery:'#386344',tree:['#274b38','#386344','#547b48'],shape:'broadleaf',density:1,sand:['#e5ca98','#fff0c6'],water:['#397f9b','#81c7d4']},
 coast:{name:'Pacific Coast',sky:['#9bbac9','#e1e5dc'],rough:['#9ca779','#899369'],fairway:['#699f54','#90bd66'],ground:'#d6dcc0',recovery:'#73866b',tree:['#294f49','#3c6757','#63816c'],shape:'cypress',density:.75,sand:['#e4cfaa','#fff3cf'],water:['#276f96','#80cbd7']},
 mountain:{name:'Mountain valley',sky:['#9fbacb','#e7ecdf'],rough:['#7a9567','#607e51'],fairway:['#669b4c','#8cbd65'],ground:'#c7d6b6',recovery:'#355e4c',tree:['#244c40','#376653','#557a61'],shape:'pine',density:.9,sand:['#decea9','#f5e9c9'],water:['#357b95','#91c9d3'],backdrop:'mountain'},
 lake:{name:'Lakeside',sky:['#a5c7db','#e6ede1'],rough:['#83a375','#688b57'],fairway:['#68a24f','#94c871'],ground:'#c7dab5',recovery:'#426e51',tree:['#315744','#4a7554','#70916b'],shape:'broadleaf',density:.7,sand:['#e4d3ad','#fff1d1'],water:['#3a89a6','#9fd6dd'],backdrop:'lake'},
 ocean:{name:'Oceanfront',sky:['#8dbcd2','#e2ece6'],rough:['#a1b47d','#819562'],fairway:['#71a55b','#9bc777'],ground:'#d9dec0',recovery:'#748a68',tree:['#355e4b','#4c765b','#729174'],shape:'cypress',density:.5,sand:['#e9d8b3','#fff6db'],water:['#207fa6','#7dd3df'],backdrop:'ocean'},
 desert:{name:'Desert',sky:['#9ecad6','#f0e1c4'],rough:['#d4b787','#b59865'],fairway:['#61923e','#8abc50'],ground:'#e5cda6',recovery:'#ad966a',tree:['#476858','#5c7960','#76906a'],shape:'cactus',density:.35,sand:['#cb9f69','#f5d8a0'],water:['#277f98','#6fcbd1']}
};
export function fairwaySection(s,y){
 const xs=[];for(let i=0;i<s.fairway.length;i++){const a=s.fairway[i],b=s.fairway[(i+1)%s.fairway.length];if(y>=Math.min(a[1],b[1])&&y<=Math.max(a[1],b[1])&&a[1]!==b[1])xs.push(a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]));}
 if(Math.abs(y-s.green.y)<=s.green.ry+10){const width=s.green.rx+8;xs.push(s.green.x-width,s.green.x+width);}
 return xs.length?[Math.min(...xs),Math.max(...xs)]:[s.green.x-s.green.rx,s.green.x+s.green.rx];
}
export function decorateScenario(s){
 const baseline=s.type==='tee'?13:10,rng=random(((s.variantSeed||0)+Number(s.hole)*173+7183)>>>0),denseSide=rng()<.5?-1:1;
 s.woodlandVersion='woods-v2';s.woods=[];
 for(const side of [-1,1]){
  const varied=!!s.variantSeed,dense=side===denseSide;
  const buffer=varied?(dense?6+rng()*6:18+rng()*10):baseline;
  const density=varied?(dense?.85+rng()*.15:.3+rng()*.2):1;
  const recoveryMultiplier=varied?(dense?1.25+rng()*.4:.45+rng()*.25):1;
  const height=varied?(dense?12+rng()*6:6+rng()*5):11;
  const start=varied?45+Math.floor(rng()*40):45,outer=side<0?s.bounds[0]+1:s.bounds[1]-1,inner=[];
  for(let y=start;y<=s.maxY;y+=7){const edge=fairwaySection(s,y)[side<0?0:1]+side*buffer;inner.push([side<0?Math.max(outer,edge):Math.min(outer,edge),y]);}
  const woods={side,buffer,density,height,recoveryMultiplier,start};s.woods.push(woods);
  const runs=[];let run=[];for(const point of inner){if(Math.abs(point[0]-outer)>3)run.push(point);else if(run.length){runs.push(run);run=[];}}if(run.length)runs.push(run);const patch=runs.sort((a,b)=>b.length-a.length)[0]||[];
  if(patch.length>1)s.hazards.push({kind:'trees',label:`${side<0?'Left':'Right'} ${varied?(dense?'dense woods':'open woods'):'woods'}`,forest:true,...woods,poly:[...patch,[outer,patch.at(-1)[1]],[outer,patch[0][1]]]});
 }
 return s;
}
const vegetationCache=new WeakMap();
export function vegetation(s,style='woodland'){
 let cache=vegetationCache.get(s);if(!cache){cache={};vegetationCache.set(s,cache);}if(cache[style])return cache[style];
 const theme=LANDSCAPES[style],rng=random((s.variantSeed||131)+Number(s.hole)*173),plants=[];
 function add(x,y){const woods=s.woods?.find(w=>w.side===(x<fairwaySection(s,y).reduce((a,b)=>a+b,0)/2?-1:1));const kind=lie({x,y},s);if(!['trees','ob'].includes(kind))return;if(rng()>theme.density*(woods?.density||1))return;const height=theme.shape==='cactus'?3.5+rng()*3:9+rng()*5,width=theme.shape==='cactus'?1.8:3.4+rng()*2.2;const mature=theme.shape!=='cactus'&&kind==='ob'&&rng()<.45;plants.push({x,y,kind,height:height*(mature?1.25:1)*(woods?woods.height/11:1),width:width*(mature?1.15:1),tone:Math.floor(rng()*3),shape:theme.shape});}
 for(const h of s.hazards.filter(h=>h.kind==='trees')){const xs=h.poly.map(p=>p[0]),ys=h.poly.map(p=>p[1]);for(let y=Math.min(...ys)+2;y<=Math.max(...ys);y+=7)for(let x=Math.min(...xs)+2;x<=Math.max(...xs);x+=5.5){const p={x:x+(rng()-.5)*3,y:y+(rng()-.5)*3};if(inPoly(p,h.poly))add(p.x,p.y);}}
 // Two overlapping rows beyond the white stakes complete the visual corridor.
 for(let y=45;y<s.maxY+12;y+=7)for(const side of [-1,1])for(let row=0;row<2;row++)add((side<0?s.bounds[0]:s.bounds[1])+side*(5+row*7+rng()*3),y+rng()*5);
 cache[style]=plants.sort((a,b)=>b.y-a.y);return cache[style];
}
export function drawPlant(p,project,theme){
 const base=project({x:p.x,y:p.y}),top=project({x:p.x,y:p.y,z:p.height}),h=Math.max(3,base.y-top.y),w=Math.max(1,p.width*1000/(p.y+6)),color=theme.tree[p.tone];
 let canopy;
 if(p.shape==='cactus')canopy=`<path d="M0 0V${-h}M0 ${-h*.45}H${-w}V${-h*.75}M0 ${-h*.3}H${w}V${-h*.58}" fill="none" stroke="${color}" stroke-width="${Math.max(2,w*.4)}" stroke-linecap="round"/><path d="M${w*.1} 0V${-h}" stroke="#a2b492" stroke-width="1" opacity=".5"/>`;
 else if(p.shape==='pine')canopy=`<path d="M0 ${-h}L${w*.5} ${-h*.65}H${w*.25}L${w*.8} ${-h*.38}H${w*.45}L${w} ${-h*.13}H${-w}L${-w*.45} ${-h*.38}H${-w*.8}L${-w*.25} ${-h*.65}H${-w*.5}Z" fill="${color}"/><path d="M0 ${-h}L${w*.5} ${-h*.65}H${w*.25}L${w*.8} ${-h*.38}H${w*.45}L${w} ${-h*.13}H0Z" fill="#153b32" opacity=".28"/>`;
 else if(p.shape==='cypress')canopy=`<path d="M0 ${-h}Q${w*.38} ${-h*.75} ${w*.2} ${-h*.6}L${w*.85} ${-h*.3}L${w*.5} ${-h*.25}L${w} ${-h*.1}Q0 ${-h*.02} ${-w} ${-h*.1}L${-w*.5} ${-h*.25}L${-w*.85} ${-h*.3}L${-w*.2} ${-h*.6}Q${-w*.35} ${-h*.75} 0 ${-h}Z" fill="${color}"/><path d="M0 ${-h}L${w*.2} ${-h*.6}L${w*.85} ${-h*.3}L${w*.5} ${-h*.25}L${w} ${-h*.1}H0Z" fill="#16392d" opacity=".3"/>`;
 else canopy=`<path d="M${-w*.75} ${-h*.25}C${-w*1.25} ${-h*.3} ${-w*1.2} ${-h*.65} ${-w*.7} ${-h*.68}C${-w} ${-h*.95} ${-w*.3} ${-h*1.04} 0 ${-h*.94}C${w*.28} ${-h*1.12} ${w*.94} ${-h*.93} ${w*.72} ${-h*.67}C${w*1.27} ${-h*.7} ${w*1.25} ${-h*.31} ${w*.68} ${-h*.24}Q0 ${-h*.1} ${-w*.75} ${-h*.25}Z" fill="${color}"/><ellipse cx="${-w*.3}" cy="${-h*.71}" rx="${w*.38}" ry="${h*.16}" fill="#a5bd79" opacity=".16"/><path d="M0 ${-h*.93}Q${w*.95} ${-h*.98} ${w*.72} ${-h*.67}Q${w*1.3} ${-h*.5} ${w*.68} ${-h*.24}Q${w*.2} ${-h*.15} 0 ${-h*.22}Z" fill="#183b2c" opacity=".26"/>`;
 return `<g class="landscape-plant" data-lie="${p.kind}" transform="translate(${base.x.toFixed(2)},${base.y.toFixed(2)})"><ellipse cy="2" rx="${w*1.05}" ry="${Math.max(1,w*.18)}" fill="#203d2828"/><path d="M0 0V${-h*.65}" stroke="#665c43" stroke-width="${Math.max(1,w*.13)}"/>${canopy}</g>`;
}

// Only offer shoreline settings where the authored water already runs beside the hole.
// The environment renderer never creates or changes a playable hazard footprint.
export function shorelineWater(s){
 return s?.hazards.find(h=>{if(h.kind!=='water')return false;const ys=h.poly.map(p=>p[1]),y=(Math.min(...ys)+Math.max(...ys))/2,[left,right]=fairwaySection(s,y),center=(left+right)/2,xs=h.poly.map(p=>p[0]);return Math.max(...ys)-Math.min(...ys)>=20&&(Math.max(...xs)<center-5||Math.min(...xs)>center+5);});
}
export function drawBackdrop(style,s){
 const kind=LANDSCAPES[style]?.backdrop;if(!kind)return '';
 let art='';
 if(kind==='mountain')art=`<path d="M-400 235L-220 130-80 176 70 54 218 162 370 86 525 178 662 44 805 157 970 80 1160 189 1360 120 1560 235Z" fill="#819aaa"/><path d="M-250 235L-90 177 50 207 190 119 346 221 502 151 680 220 864 132 1040 219 1210 163 1410 235Z" fill="#658578"/><path d="M70 54L24 107 66 92 91 116 112 105ZM662 44L616 101 658 84 684 109 703 96Z" fill="#eaf0ec"/><path d="M-200 235Q90 183 265 217T630 209T1000 222T1400 235V241H-200Z" fill="#55765e"/>`;
 else if(kind==='lake')art=`<path d="M-400 234Q-120 111 115 183T505 170T920 177T1350 167L1560 240Z" fill="#819a7e"/><path d="M-300 235Q-55 170 182 207T575 193T980 213T1440 202V241H-300Z" fill="#6e8e70"/><path d="M-400 212Q-100 225 120 216T500 219T940 212T1500 220V239H-400Z" fill="#77b8c8"/><path d="M-200 230H140M250 227H460M590 232H850M970 225H1230" stroke="#d1e7df" stroke-width="2" opacity=".65"/>`;
 else art=`<rect x="-400" y="190" width="1960" height="49" fill="#5aa6bd"/><path d="M-400 207H1560M-180 222H140M230 214H445M590 226H930M1030 217H1350" stroke="#d8eeeb" stroke-width="2" opacity=".65"/><path d="M-400 237Q-170 201 20 225T330 231T640 225T990 233T1560 227V245H-400Z" fill="#b9c79a"/><path d="M745 199l12-7v7zM770 204l10-6v6z" fill="#f6f4df"/>`;
 return `<g id="scenicBackdrop" data-environment="${style}" aria-label="${LANDSCAPES[style].name} distant scenery">${art}</g>`;
}
