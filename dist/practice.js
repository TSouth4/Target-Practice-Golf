import {random,lie} from './model.js';
import {decorateScenario} from './landscape.js';
export const PRACTICE_SEQUENCE=['cedar','water','bend','tucked','drivable','bowl','narrow','split','par5-open','par5-carry'];
export function nextScenario(id,filter='mixed',seed=1,recent=[]){
 const typeOf=key=>['cedar','bend','drivable','narrow'].includes(key)?'tee':'approach';
 const allowed=PRACTICE_SEQUENCE.filter(key=>(filter==='mixed'||typeOf(key)===filter)&&key!==id);
 // Keep a short history, then prefer the other shot type in mixed practice.
 let fresh=allowed.filter(key=>!recent.includes(key));if(!fresh.length)fresh=allowed;
 if(filter==='mixed'){const opposite=fresh.filter(key=>typeOf(key)!==typeOf(id));if(opposite.length)fresh=opposite;}
 return fresh[Math.floor(random(seed)()*fresh.length)];
}
export function generateScenario(base,seed=0){
 const s=structuredClone(base);s.elevationM=base.type==='tee'?9:8;s.variantSeed=seed;
 if(!seed)return decorateScenario(s);
 const rng=random(seed),width=.9+rng()*.22,depth=.94+rng()*.12,mirror=base.id==='bend'&&rng()<.5?-1:1;
 const at=p=>({x:p.x*width*mirror,y:p.y*depth});
 s.fairway=s.fairway.map(([x,y])=>{const q=at({x,y});return[q.x,q.y];});
 s.hazards=s.hazards.map(h=>({...h,poly:h.poly.map(([x,y])=>{const q=at({x,y});return[q.x,q.y];}),...(h.drop?{drop:at(h.drop)}:{})}));
 s.bounds=s.bounds.map(x=>x*width*mirror).sort((a,b)=>a-b);
 s.green={...at(s.green),rx:s.green.rx*width,ry:s.green.ry*depth};s.pin=at(s.pin);s.maxY=Math.round(s.maxY*depth);
 // Vary the pin only within the safe part of the actual green.
 for(let i=0;i<10;i++){const candidate={x:s.green.x+(rng()*2-1)*s.green.rx*.7,y:s.green.y+(rng()*2-1)*s.green.ry*.7};if(lie(candidate,s)==='green'){s.pin=candidate;break;}}
 s.labels=s.labels.map(p=>({...p,...at(p)}));s.aimY=Math.round(s.aimY*depth);s.aimRange=s.aimRange.map(y=>Math.round(y*depth));s.length=Math.round(Math.hypot(s.pin.x,s.pin.y));
 if(base.id==='bend'){s.tag=`Dogleg ${mirror<0?'left':'right'} · water long`;s.name=mirror<0?'The left-hand bend':'The right-hand bend';}
 if(base.id==='water')s.brief='A changing flag position on a green guarded by water short and right. Distance control matters as much as your aim.';
 if(base.id==='tucked')s.brief='A changing pin position makes this bunker-guarded green a new decision. The right boundary still punishes a large miss.';
 if(base.type==='approach')s.tag=s.tag.replace(/^\d+ yards/,`${s.length} yards`);
 s.brief=s.brief.replace(/\b\d+-yard/,`${s.length}-yard`);
 return decorateScenario(s);
}
