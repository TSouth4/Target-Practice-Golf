import {SCENARIOS,basicPattern,patternAtTarget,shotAt,samples,evaluate,DEFAULT_COSTS} from './model.js';
import {DISTANCE_EXAMPLES} from './curriculum.js';
import {generateScenario} from './practice.js';
const label=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="21" font-weight="700" fill="#203f32" stroke="#f5f4e9" stroke-width="5" paint-order="stroke">${t}</text>`;
export function lessonComparison(s,target){
 const base={...basicPattern(5,s,265),aimMode:'carry'},zs=samples(4000,7142026);
 return [s.pin,target].map((aim,i)=>{const pattern=patternAtTarget(aim,base),core={...pattern,bigPct:0},contour=Array.from({length:72},(_,j)=>shotAt(aim,core,{z1:1.794*Math.cos(j/72*Math.PI*2),z2:1.794*Math.sin(j/72*Math.PI*2),u:1,sign:1})),center=shotAt(aim,{...core,sdSide:0,sdLong:0},{z1:0,z2:0,u:1,sign:1}),result=evaluate(aim,pattern,s,DEFAULT_COSTS,zs);return{aim,center,contour,water:result.counts.water/result.n,color:i?'#367fc0':'#bc8128'};});
}
function comparisonGraphic(s,target){
 if(!target)return label(320,175,'Preparing calculated target…');
 const comparisons=lessonComparison(s,target),g=s.green,points=[...comparisons.flatMap(c=>c.contour),{x:g.x-g.rx,y:g.y-g.ry},{x:g.x+g.rx,y:g.y+g.ry}],minX=Math.min(...points.map(p=>p.x))-8,maxX=Math.max(...points.map(p=>p.x))+8,minY=Math.min(...points.map(p=>p.y))-12,maxY=Math.max(...points.map(p=>p.y))+8,scale=Math.min(590/(maxX-minX),245/(maxY-minY)),xy=(x,y)=>[320+(x-(minX+maxX)/2)*scale,150-(y-(minY+maxY)/2)*scale],poly=pts=>pts.map(p=>xy(p[0]??p.x,p[1]??p.y).join(',')).join(' ');
 let art=`<defs><clipPath id="lessonPlot"><rect x="20" y="20" width="600" height="265" rx="10"/></clipPath></defs><g clip-path="url(#lessonPlot)"><rect x="20" y="20" width="600" height="265" fill="#c6d6aa"/><polygon points="${poly(s.fairway)}" fill="#83b358"/>`;
 const [gx,gy]=xy(g.x,g.y);art+=`<ellipse cx="${gx}" cy="${gy}" rx="${g.rx*scale}" ry="${g.ry*scale}" fill="#a1ce63"/>`;
 for(const h of s.hazards.filter(h=>['water','bunker'].includes(h.kind)))art+=`<polygon points="${poly(h.poly)}" fill="${h.kind==='water'?'#53b6ce':'#eddaa4'}" stroke="${h.kind==='water'?'#0789ae':'#b8791d'}" stroke-width="4"/>`;
 for(const [i,c] of comparisons.entries()){const [cx,cy]=xy(c.center.x,c.center.y);art+=`<polygon data-pattern="${i?'recommended':'flag'}" data-center-x="${c.center.x}" data-center-y="${c.center.y}" points="${poly(c.contour)}" fill="${c.color}22" stroke="${c.color}" stroke-width="4" stroke-dasharray="${i?'8 5':'none'}"/><path d="M${cx-7} ${cy}h14M${cx} ${cy-7}v14" stroke="${c.color}" stroke-width="3"/>`;}
 const [px,py]=xy(s.pin.x,s.pin.y);art+=`<path d="M${px} ${py}v-22l18 6-18 6" fill="#dd594a" stroke="#294832" stroke-width="2"/></g>`;
 art+=label(320,310,`Gold: flag target · water ${(comparisons[0].water*100).toFixed(1)}%`)+label(320,342,`Blue: recommended · water ${(comparisons[1].water*100).toFixed(1)}%`)+label(320,375,'80% core spreads · water rates use all shots');return art;
}
function clubTargetsGraphic(shortSide=false){
 let art='';
 for(const [x,r,shift,title] of [[165,27,42,shortSide?'Short side: little room':'Wedge: tighter target'],[475,65,-10,shortSide?'Fat side: more room':'Long iron: more room']]){
  art+=`<ellipse cx="${x}" cy="170" rx="112" ry="106" fill="#a1ce63"/><path d="M${x+94} 112q45 25 12 88q-40 15-40-20Z" fill="#eddaa4" stroke="#b8791d" stroke-width="5"/><path d="M${x+65} 173v-28l19 7-19 7" fill="#dd594a" stroke="#294832" stroke-width="2"/>`;
  if(shortSide){const ballX=x+(x<300?125:-130);art+=`<circle cx="${ballX}" cy="185" r="7" fill="white" stroke="#294832" stroke-width="2"/><path d="M${ballX} 185L${x+65} 173" stroke="#367fc0" stroke-width="4" stroke-dasharray="6 5"/>`;}
  else art+=`<ellipse cx="${x+shift}" cy="170" rx="${r}" ry="${r*1.1}" fill="#367fc033" stroke="#367fc0" stroke-width="4" stroke-dasharray="7 5"/><path d="M${x+shift-7} 170h14M${x+shift} 163v14" stroke="#367fc0" stroke-width="3"/>`;
  art+=label(x,325,title);
 }
 return art+label(320,370,shortSide?'Same flag, different recovery room':'Same green · illustrative spreads and aims');
}
export function tutorialGraphic(topic,current,target){
 let art='';
 if(topic==='pattern')art=comparisonGraphic(current,target);
 else if(topic==='dartboard'){
  for(const r of [125,96,66,32])art+=`<circle cx="300" cy="168" r="${r}" fill="${r===32?'#de7460':r===96?'#b8d29a':'#e8ebd9'}" stroke="#294832" stroke-width="3"/>`;
  art+=`<path d="M405 105q-24-26-32-14q-3 8 15 30l-9-5q-24-7-27 8q-2 9 20 20l-12-2q-24 0-21 16q1 10 23 15l-10 4q-20 10-7 24q18 21 67 15l35-3v-69Z" fill="#ecc3a2" stroke="#976d50" stroke-width="3"/><circle cx="257" cy="168" r="10" fill="#367fc0"/><path d="M290 168h-22" stroke="#367fc0" stroke-width="4"/>${label(320,325,'Move the target away from costly trouble')}`;
 }
 else if(topic==='distance-cost'||topic==='distance-increments'){
  const selected=topic==='distance-cost'?DISTANCE_EXAMPLES.filter(d=>[100,150].includes(d.yards)):DISTANCE_EXAMPLES;
  selected.forEach((d,i)=>{const x=selected.length===2?180+i*280:85+i*155;art+=`<rect x="${x-60}" y="108" width="120" height="135" fill="#83b358" rx="8"/>${label(x,160,d.strokes.toFixed(2))}${label(x,194,'strokes')}${label(x,278,d.yards+' yd')}`;});
  art+=label(320,330,'Expected strokes to finish from fairway')+label(320,370,'Historical PGA TOUR reference · 2003–2010');
 }
 else if(topic==='club-targets'||topic==='short-side')art=clubTargetsGraphic(topic==='short-side');
 else if(topic==='dispersion'){
  for(const [x,r,title] of [[170,30,'Wedge: smaller spread'],[470,76,'Long iron: wider spread']])art+=`<ellipse cx="${x}" cy="175" rx="100" ry="112" fill="#85b951"/><path d="M${x+45} 100q55 20 38 75q-25 25-45-5Z" fill="#ead19b" stroke="#bd8534" stroke-width="7"/><ellipse cx="${x-10}" cy="180" rx="${r}" ry="${r*1.15}" fill="#efb34655" stroke="#be8322" stroke-width="4" stroke-dasharray="7 5"/>${label(x,325,title)}<path d="M${x+22} 158v-40l22 9-22 9" fill="#dc6652" stroke="#294832" stroke-width="3"/>`;
 }else{
  const s=['ob','trees'].includes(topic)?generateScenario(SCENARIOS.find(s=>s.id==='cedar'),0):current;
  const max=s.maxY||400,xy=(x,y)=>[320+x*2.5,325-y/max*290],poly=points=>points.map(([x,y])=>xy(x,y).join(',')).join(' '),point=(p)=>xy(p.x,p.y);
  art+=`<rect x="30" y="20" width="580" height="315" rx="14" fill="#c6d6aa"/><polygon points="${poly(s.fairway)}" fill="#83b358"/>`;
  for(const h of s.hazards){const color={water:'#53b6ce',bunker:'#eddaa4',trees:'#607b4d'}[h.kind]||'#aaa',focused=h.kind===topic||topic==='distance';art+=`<polygon data-topic-hazard="${h.kind}" points="${poly(h.poly)}" fill="${color}" stroke="${h.kind==='water'?'#0789ae':h.kind==='bunker'?'#b8791d':'#294e32'}" stroke-width="${focused?7:1}"/>`;}
  if(topic==='water'){const h=s.hazards.find(h=>h.kind==='water');if(h?.drop){const [dx,dy]=point(h.drop);art+=`<circle cx="${dx}" cy="${dy}" r="8" fill="white" stroke="#0789ae" stroke-width="4"/>${label(dx-75,dy+10,'Example drop')}`;}}
  const [gx,gy]=xy(s.green.x,s.green.y);art+=`<ellipse cx="${gx}" cy="${gy}" rx="${s.green.rx*2.5}" ry="${s.green.ry/max*290}" fill="#a1ce63"/>`;
  for(const bx of s.bounds){const [x]=xy(bx,0);art+=`<path data-topic-hazard="ob" d="M${x} 30V325" stroke="#d3584e" stroke-width="${topic==='ob'?8:2}" stroke-dasharray="12 8"/>`;}
  const [px,py]=point(s.pin);art+=`<path d="M${px} ${py}v-22l18 6-18 6" fill="#dd594a" stroke="#294832" stroke-width="2"/>`;
  const [tx,ty]=xy(0,0);art+=`<circle cx="${tx}" cy="${ty}" r="6" fill="#fff" stroke="#294832" stroke-width="2"/>`;
  if(topic==='ob'){const [bx]=xy(s.bounds[1],0);art+=`<path d="M${tx} ${ty}Q${tx+90} 190 ${bx+25} 150" fill="none" stroke="#d3584e" stroke-width="4"/><circle cx="${bx+25}" cy="150" r="7" fill="white" stroke="#d3584e" stroke-width="3"/>${label(320,365,'Beyond OB → replay from the tee')}`;}
  else if(topic==='distance'){for(const [p,color,name] of [[{x:0,y:190},'#376bb1','Shorter'],[target||{x:-6,y:249},'#b8791d','Longer']]){const [x,y]=point(p);art+=`<path d="M${tx} ${ty}L${x} ${y}" stroke="${color}" stroke-width="4" stroke-dasharray="6 6"/><circle cx="${x}" cy="${y}" r="9" fill="${color}"/>${label(x+(name==='Shorter'?-85:85),y,name)}`;}art+=label(320,365,'Both choices are reachable');}

  else art+=label(320,365,{water:'Blue outline: penalty area',bunker:'Gold outline: sand, no automatic penalty',trees:'Dark outline: difficult recovery'}[topic]||'Make room for your misses');
 }
 return `<svg viewBox="0 0 640 390" role="img" aria-label="${topic} teaching illustration" data-lesson-topic="${topic}" xmlns="http://www.w3.org/2000/svg">${art}</svg><p class="micro">Read-only illustration · ${topic==='pattern'?'equal yard scales · calculated core spreads': 'not to scale'} · use Next to continue</p>${topic.startsWith('distance-')?'<p class="micro"><a href="https://business.columbia.edu/sites/default/files-efs/pubfiles/4996/assessing_golfer_performance.full.pdf" target="_blank" rel="noopener noreferrer">Source: Broadie, Assessing Golfer Performance (2012), Table B.1</a><br>150 yd uses interpolation; displayed values are rounded.</p>':''}`;
}
