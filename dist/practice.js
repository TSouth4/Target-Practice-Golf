import {SCENARIOS,random,segmentHitsPoly,inPoly} from './model.js';
import {decorateScenario,LANDSCAPES,shorelineWater,fairwaySection} from './landscape.js';
import {generateTeeScenario,touchesGreen} from './tee-generator.js';
import {generateApproachScenario} from './approach-generator.js';
export const PRACTICE_SEQUENCE=['cedar','water','bend','tucked','drivable','bowl','narrow','split','par5-open','par5-carry','sharp-dogleg','creek-tee','squeeze-par4','creek-par3','shore-tee','shore-green'];
export function nextScenario(id,filter='mixed',seed=1,recent=[]){
 const typeOf=key=>SCENARIOS.find(s=>s.id===key)?.type;
 const allowed=PRACTICE_SEQUENCE.filter(key=>(filter==='mixed'||typeOf(key)===filter)&&key!==id);
 // Keep a short history, then prefer the other shot type in mixed practice.
 let fresh=allowed.filter(key=>!recent.includes(key));if(!fresh.length)fresh=allowed;
 if(filter==='mixed'){const opposite=fresh.filter(key=>typeOf(key)!==typeOf(id));if(opposite.length)fresh=opposite;}
 return fresh[Math.floor(random(seed)()*fresh.length)];
}
export function generateScenario(base,seed=0){
 if(base.shoreline){
  const source=SCENARIOS.find(s=>s.id===base.source),s=generateScenario(source,seed),side=random(seed^0x193a)()<.5?-1:1,near=45,far=s.green.y+s.green.ry+15;
  const rows=[near,...Array.from({length:Math.ceil((far-near)/12)},(_,i)=>near+(i+1)*12).filter(y=>y<far),far],outer=s.bounds[side<0?0:1]+(side<0?1:-1);
  const inner=rows.map(y=>{const [l,r]=fairwaySection(s,y),edge=side<0?l:r,greenEdge=s.green.x+side*(s.green.rx+6),x=side<0?Math.min(edge-6,greenEdge):Math.max(edge+6,greenEdge);return[side<0?Math.max(outer+2,x):Math.min(outer-2,x),y];});
  const clearance=[...inner.map(([x,y])=>[x-side*3,y]),[outer,far],[outer,near]],blocked=h=>h.poly.some((p,i)=>{const q=h.poly[(i+1)%h.poly.length];return segmentHitsPoly({x:p[0],y:p[1]},{x:q[0],y:q[1]},clearance);})||inPoly({x:clearance[0][0],y:clearance[0][1]},h.poly);
  s.hazards=s.hazards.filter(h=>h.kind!=='water'&&(h.kind!=='bunker'||!touchesGreen(h.poly,s)&&!blocked(h)));s.labels=s.labels.filter(l=>!['WATER','CREEK','SAND'].includes(l.text));for(const h of s.hazards.filter(h=>h.kind==='bunker'))s.labels.push({x:h.poly.reduce((n,p)=>n+p[0]/h.poly.length,0),y:h.poly.reduce((n,p)=>n+p[1]/h.poly.length,0),text:'SAND'});
  const poly=[...inner,[outer,far],[outer,near]],dropY=30,[l,r]=fairwaySection(s,dropY);s.hazards.unshift({kind:'water',label:side<0?'Left shoreline':'Right shoreline',poly,reliefBank:inner,reliefSide:side,drop:{x:(l+r)/2,y:dropY}});
  const at=inner[Math.floor(inner.length/2)];s.labels.push({x:(at[0]+outer)/2,y:at[1],text:'WATER'});
  Object.assign(s,{id:base.id,name:base.name,shoreline:true,shorelineVersion:'shore-v1',tag:`Water along the ${side<0?'left':'right'} side`,brief:'Water runs along the side of the hole and green. Give your usual miss room, while weighing the longer next shot from a safer target.'});return s;
 }
 const s=structuredClone(base);s.elevationM=base.type==='tee'?9:8;s.variantSeed=seed;
 if(!seed)return decorateScenario(s);
 if(base.type==='tee')return generateTeeScenario(base,seed);
 return generateApproachScenario(base,seed);
}

export function nextLandscape(current,seed,scenario=null){
 if(scenario?.shoreline&&shorelineWater(scenario)){const choices=['lake','ocean'].filter(s=>s!==current);return choices[Math.floor(random(seed^0x5a17c9)()*choices.length)];}
 const choices=Object.keys(LANDSCAPES).filter(style=>style!==current&&(!scenario||!['lake','ocean'].includes(style)||shorelineWater(scenario)));
 return choices[Math.floor(random((seed^0x5a17c9)>>>0)()*choices.length)];
}
