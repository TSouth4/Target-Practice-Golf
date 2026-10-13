import {SCENARIOS} from './model.js';
import {generateScenario} from './practice.js';
const label=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="21" font-weight="700" fill="#203f32" stroke="#f5f4e9" stroke-width="5" paint-order="stroke">${t}</text>`;
export function tutorialGraphic(topic,current,target){
 let art='';
 if(topic==='dispersion'){
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
  else if(topic==='pattern'){art+=`<ellipse cx="${px-20}" cy="${py+20}" rx="48" ry="35" fill="#eab04955" stroke="#b8791d" stroke-width="4" stroke-dasharray="6 5"/>${label(320,365,'Plan for the whole spread of shots')}`;}
  else art+=label(320,365,{water:'Blue outline: penalty area',bunker:'Gold outline: sand, no automatic penalty',trees:'Dark outline: difficult recovery'}[topic]||'Make room for your misses');
 }
 return `<svg viewBox="0 0 640 390" role="img" aria-label="${topic} teaching illustration" data-lesson-topic="${topic}" xmlns="http://www.w3.org/2000/svg">${art}</svg><p class="micro">Read-only illustration · not to scale · use Next to continue</p>`;
}
