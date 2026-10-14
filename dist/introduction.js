import {SCENARIOS,DEFAULT_COSTS,basicPattern,samples,evaluate,patternAtTarget,optimizeTargets} from './model.js';
import {generateScenario} from './practice.js';
export const INTRO_KEY='target-practice-introduction-v1';
export const INTRO_VERSION='introduction-v2';
export function hasSeenIntroduction(raw){try{const s=JSON.parse(raw);return ['introduction-v1',INTRO_VERSION].includes(s?.version)&&s.status==='completed';}catch{return false;}}
export const INTRO_STEPS=[
 {title:'A tempting target: the flag',text:'This flag is tucked close to the edge of the green. Tap the highlighted target to aim directly at it, then reveal the shots. Your best shot may be close, but your normal misses need room too.'},
 {title:'Too much caution',text:'Now try the highlighted target well away from the green. It avoids the danger, but leaves an unnecessarily long next shot. Safety has a cost when you give up too much distance.'},
 {title:'Find the balance',text:'Try the highlighted target toward the roomy part of the green. You give up a little closeness to the flag to make room for your misses. This is the best sampled target in our model: a sensible blend of opportunity and safety, not a guarantee.'},
 {title:'Why we choose intended carry',text:'Carry is how far you intend the ball to travel before landing. It is a useful starting point for course management because rollout depends heavily on the ground. Wind and imperfect contact can still change actual carry. In practice, set direction on the course and distance with the Intended carry bar.'},
 {title:'One decision, thousands of possibilities',text:'The app simulates 4,000 possible shots from your selected profile. Together they show a range of outcomes, rather than one guaranteed average shot. In normal practice, the outline shows the main carry pattern and the dots show final positions after rollout. Some misses fall outside the outline.'},
 {title:'We score your decision',text:'We judge your target choice, rather than one lucky or unlucky ball. Too aggressive brings costly trouble into play. Too conservative makes the next shot unnecessarily hard. Look for a balance between danger and useful distance. The blue comparison in practice is the best sampled alternative.'},
 {title:'Read the hole first',text:'The shot-selection view stays clear of extra predictions. Use the distances, visible hazards and conditions, just as you would on a real course. Choose your target before seeing its pattern. Then adjust and compare to test your ideas using the same misses.'},
 {title:'Build the habit',text:'Learn the basics, recognise what matters, and practise choosing a sensible target before every shot. This app trains your eyes and judgement through experience. Try a five-shot learning round, or explore the lessons for more guided examples.'}
];
export async function prepareIntroduction(yieldFn=async()=>{}){
 const scene=generateScenario(SCENARIOS.find(s=>s.id==='tucked'),17),pattern=basicPattern('5',scene,265),zs=samples(4000,7142026);
 const best=await optimizeTargets(scene.pin,pattern,scene,DEFAULT_COSTS,zs,yieldFn);
 const aims=[{...scene.pin},{x:scene.green.x,y:scene.green.y-65},best.aim];
 return {scene,targets:aims.map(aim=>({aim,pattern:patternAtTarget(aim,pattern),result:evaluate(aim,patternAtTarget(aim,pattern),scene,DEFAULT_COSTS,zs,true)}))};
}
export function introductionGraphic(prepared,index,revealed){
 const s=prepared.scene,t=prepared.targets[Math.min(index,2)],minY=s.green.y-90,maxY=s.green.y+45;
 const project=p=>({x:300+(p.x-s.green.x)*5,y:350-(p.y-minY)/(maxY-minY)*320});
 const poly=pts=>pts.map(([x,y])=>{const q=project({x,y});return `${q.x},${q.y}`;}).join(' '),g=project(s.green),pin=project(s.pin),a=project(t.aim);
 let svg=`<rect width="600" height="380" fill="#d7dfc1"/><polygon points="${poly(s.fairway)}" fill="#86af59"/>`;
 const colors={water:'#4bd6fa',bunker:'#fff0c5',trees:'#71866b'};
 for(const h of s.hazards)svg+=`<polygon points="${poly(h.poly)}" fill="${colors[h.kind]||'#82916c'}" stroke="#586e60"/>`;
 svg+=`<ellipse cx="${g.x}" cy="${g.y}" rx="${s.green.rx*5}" ry="${s.green.ry/(maxY-minY)*320}" fill="#a8cf65" stroke="#477637" stroke-width="2"/><path d="M${pin.x} ${pin.y}v-20l14 5-14 5" stroke="#fff" stroke-width="2" fill="#fff"/>`;
 if(revealed){const outcome={green:'#b3ec77',fairway:'#b3ec77',rough:'#ffc165',water:'#4bd6fa',ob:'#ff776e',bunker:'#fff0c5',trees:'#d9a9ff'};for(const p of t.result.points.filter((_,i)=>i%6===0)){const q=project(p);svg+=`<circle cx="${q.x}" cy="${q.y}" r="2.1" fill="${outcome[p.kind]}" stroke="#415747" stroke-width=".4"/>`;}}
 svg+=`<g id="introductionTarget" role="${revealed?'img':'button'}" tabindex="${revealed?-1:0}" aria-label="${revealed?'Selected target':'Select highlighted target'}" data-intro-target="true"><title>Select highlighted target</title><circle cx="${a.x}" cy="${a.y}" r="19" fill="#238cc440" stroke="#166c9c" stroke-width="3"/><path d="M${a.x-26} ${a.y}h12m28 0h12M${a.x} ${a.y-26}v12m0 28v12" stroke="#166c9c" stroke-width="2"/></g>`;
 return svg;
}
