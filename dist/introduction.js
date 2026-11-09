import {SCENARIOS,DEFAULT_COSTS,basicPattern,samples,evaluate,patternAtTarget,optimizeTargets} from './model.js';
import {generateScenario} from './practice.js';
export const INTRO_KEY='target-practice-introduction-v1';
export const INTRO_VERSION='introduction-v2';
export function hasSeenIntroduction(raw){try{const s=JSON.parse(raw);return ['introduction-v1',INTRO_VERSION].includes(s?.version)&&s.status==='completed';}catch{return false;}}
export const INTRO_PURPOSE={title:'Train better golf decisions',text:'Good course management means thinking about your target before you hit. Try three choices on the same hole. See where the shots finish and what each choice changes.'};
export const INTRO_STEPS=[
 {title:'A tempting target: the flag',text:'This flag is near the edge of the green. Golfers call this a tucked flag. Choose the highlighted target to aim at it, then show the shots. Your best shots may finish close. Watch what happens to the misses.'},
 {title:'Too much caution',text:'Now aim far left, away from the water. That leaves a longer putt, and some left misses can fall off the green. Playing farther from one danger does not always make the whole shot better.'},
 {title:'Find the balance',text:'Try the highlighted target on the roomier part of the green. It leaves a slightly longer putt than aiming at the flag, but gives more misses room to stay on the green. This is the best target the app found for this example. Other targets can work well too, and no target makes every shot safe.'},
 {title:'Why we choose intended carry',text:'Carry is how far the ball travels before it lands. We choose carry because rollout changes with the ground. Wind and contact can still change how far a shot carries. In Practice, aim on the course and set distance with the Intended carry bar.'},
 {title:'One decision, thousands of possibilities',text:'Your shots spread across an area. That is your shot pattern, also called dispersion. The app tests 4,000 possible shots, then shows example finishes. In Practice, the outline shows the main landing pattern. The dots show where balls finish after rolling. Some shots land outside the outline.'},
 {title:'We score your decision',text:'We score your choice, not one lucky or unlucky ball. Aim too close to trouble and your misses can cost you. Play too safely and you may leave a harder next shot. The blue target is the best choice the app found in this example. You do not need to copy it exactly to make a good choice.'},
 {title:'Read the hole first',text:'First, look at the distances, trouble and conditions. Choose your target before seeing the shots. Then retry to test a different idea. The misses stay the same, so you can see what moving the target changes. Practice noticing these things until they become part of your routine.'},
 {title:'Build the habit',text:'Before each shot, ask: where is the trouble, where might my misses finish, and what shot will I have next? Try a five-shot learning round to practice those questions, or choose another lesson.'}
];
export async function prepareIntroduction(yieldFn=async()=>{}){
 const scene=generateScenario(SCENARIOS.find(s=>s.id==='tucked'),17),pattern=basicPattern('5',scene,265),zs=samples(4000,7142026);
 const best=await optimizeTargets(scene.pin,pattern,scene,DEFAULT_COSTS,zs,yieldFn);
 const aims=[{...scene.pin},{x:scene.green.x-scene.green.rx*.8,y:scene.green.y},best.aim];
 return {scene,targets:aims.map(aim=>({aim,pattern:patternAtTarget(aim,pattern),result:evaluate(aim,patternAtTarget(aim,pattern),scene,DEFAULT_COSTS,zs,true)}))};
}
export function introductionGraphic(prepared,index,revealed){
 if(index<0)return `<g data-introduction-purpose="true" role="img" aria-label="Learn, practice, build the habit"><rect width="600" height="380" fill="#edf2e5"/><circle cx="300" cy="140" r="85" fill="#dceab8" stroke="#477637" stroke-width="3"/><circle cx="300" cy="140" r="55" fill="none" stroke="#477637" stroke-width="3"/><circle cx="300" cy="140" r="22" fill="#477637"/><text x="300" y="280" text-anchor="middle" font-family="Arial" font-size="25" fill="#203b30">Learn → Practice → Build the habit</text><text x="300" y="320" text-anchor="middle" font-family="Arial" font-size="18" fill="#203b30">Choose targets with room for your misses</text></g>`;
 if(index>=3)return introductionTopicGraphic(prepared,index);
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

function introductionTopicGraphic(prepared,index){
 const text=(x,y,value,size=20)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#203b30" font-family="Arial" font-size="${size}">${value}</text>`;
 let body='';
 if(index===3)body=`<path d="M45 280Q220 -30 440 280" fill="none" stroke="#c97745" stroke-width="5"/><path d="M440 280h105" stroke="#477637" stroke-width="5" stroke-dasharray="8 5"/><circle cx="440" cy="280" r="7" fill="#c97745"/>${text(235,330,'Intended carry: to landing')}${text(480,230,'Rollout',18)}${text(480,254,'depends on ground',15)}`;
 if(index===4){let dots='';for(const p of prepared.targets[2].result.points.filter((_,i)=>i%12===0)){const x=300+(p.x-prepared.targets[2].aim.x)*9,y=175+(p.y-prepared.targets[2].aim.y)*6;dots+=`<circle cx="${x}" cy="${y}" r="3" fill="#5b8d3e" opacity=".7"/>`;}body=`<ellipse cx="300" cy="175" rx="125" ry="95" fill="#dceab8"/>${dots}${text(300,322,'4,000 possibilities, not one promise')}${text(300,350,'Illustration shows a sample of the dots',15)}`;}
 if(index===5)body=prepared.targets.map((t,i)=>{const x=100+i*200;return `<rect x="${x-85}" y="90" width="170" height="190" rx="10" fill="${i===2?'#dceab8':'#f5f4ed'}" stroke="#9eb286"/>${text(x,125,['Flag','Far left','Balanced'][i])}${text(x,183,((1-t.result.counts.green/t.result.n)*100).toFixed(0)+'% off green',16)}${text(x,225,t.result.expected.toFixed(2)+' strokes',18)}`;}).join('')+text(300,325,'Compare choices, not one lucky ball')+text(300,350,'Estimated strokes to finish',15);
 if(index===6)body=`<rect x="30" y="45" width="540" height="290" rx="12" fill="#d7dfc1"/><path d="M200 335L240 130H390L440 335" fill="#86af59"/><ellipse cx="310" cy="150" rx="90" ry="55" fill="#a8cf65"/><g id="introReadingBunker"><path d="M160 240Q170 205 213 220L245 252 218 272 170 265Z" fill="#fff0c5" stroke="#99703d" stroke-width="2"/><path d="M142 211L181 235" stroke="#99703d" stroke-width="2"/></g><g id="introReadingFlag"><path d="M340 145v-43l26 8-26 9" fill="#e65345" stroke="#203b30" stroke-width="2"/><ellipse cx="340" cy="145" rx="5" ry="2" fill="#203b30"/></g><path d="M395 120L480 180 450 260 395 245Z" fill="#4bd6fa"/>${text(300,83,'Front 116 · Flag 132 · Back 144',18)}${text(130,185,'Bunker',17)}${text(130,210,'99–110 yd',16)}${text(460,295,'Water',17)}${text(460,318,'96–158 yd',16)}${text(300,365,'Read distances, trouble and wind first',18)}<path d="M110 265l30-30m-30 0h30v30" stroke="#203b30" fill="none" stroke-width="3"/>`;
 if(index===7)body=['Read the hole','Choose your target','Commit','Review and learn'].map((label,i)=>{const y=50+i*80;return `<rect x="100" y="${y}" width="400" height="54" rx="9" fill="${i%2?'#dceab8':'#fffef9'}" stroke="#9eb286"/>${text(300,y+34,(i+1)+'. '+label,21)}${i<3?`<path d="M300 ${y+58}v16m-6-6 6 6 6-6" fill="none" stroke="#477637" stroke-width="2"/>`:''}`;}).join('');
 return `<g data-introduction-topic="${index}" role="img" aria-label="${INTRO_STEPS[index].title}"><rect width="600" height="380" fill="#edf2e5"/>${body}</g>`;
}
