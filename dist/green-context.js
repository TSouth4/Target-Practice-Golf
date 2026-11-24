import {greenBounds,greenOutline} from './green-geometry.js';
import {drawIllustratedPlant} from './course-art.js';
// Decorative trees are placed beyond the existing OB boundaries, not on playable turf.
const cache=new WeakMap();
export function contextPlants(scene){
 if(cache.has(scene))return cache.get(scene);
 const trees=[],add=(x,y,i)=>trees.push({x,y,height:10+Math.sin(i*1.7)*2,width:4+Math.cos(i)*.5,tone:Math.abs(i)%3,shape:'broadleaf',kind:'ob'});
 for(let i=0;i<27;i++)add(-156+i*12,scene.maxY+112+(i%3)*5,i);
 for(let i=0;i<12;i++)for(const side of [-1,1])add((side<0?scene.bounds[0]:scene.bounds[1])+side*(10+i%2*5),130+i*12,30+i+(side<0?0:12));
 trees.sort((a,b)=>b.y-a.y);cache.set(scene,trees);return trees;
}
export function drawGreenContext(scene,project,theme,{map=false}={}){
 const polygon=points=>points.map(([x,y])=>{const p=project({x,y});return`${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' '),b=greenBounds(scene.green);
 let out=map?'':`<g id="studyContextTrees" pointer-events="none">${contextPlants(scene).map((p,i)=>drawIllustratedPlant(p,project,theme,500+i)).join('')}</g>`;
 // Texture only where the existing layout is rough: exclude fairway, fringe and hazards.
 out+=`<defs><mask id="studyRoughContextMask" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="580"><rect width="960" height="580" fill="white"/><polygon points="${polygon(scene.fairway)}" fill="black"/><polygon points="${polygon(greenOutline(scene.green,72,3))}" fill="black"/>${scene.hazards.map(h=>`<polygon points="${polygon(h.poly)}" fill="black"/>`).join('')}</mask></defs><g id="studyRoughContext" mask="url(#studyRoughContextMask)" fill="#53743e" opacity=".22" pointer-events="none">`;
 const patches=[{x:b.minX-8,y:b.minY-12,rx:15,ry:6},{x:b.maxX+10,y:b.maxY+7,rx:20,ry:8},{x:scene.green.x,y:b.maxY+16,rx:scene.green.rx+14,ry:6}];
 for(const patch of patches)out+=`<polygon points="${polygon(greenOutline(patch,36))}"/>`;
 return out+'</g>';
}
