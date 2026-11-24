import {drawGreenMowing} from './green-mowing.js';
import {greenShapeScene} from './green-shape-fixtures.js';
import {greenOutline} from './green-geometry.js';
import {greenYardages} from './guidance.js';
import {basicPattern,patternAtTarget,aimAtDistance} from './model.js';
import {projectSurface,unprojectSurface,drawRelief} from './surfaces.js';
import {LANDSCAPES,drawBackdrop} from './landscape.js';
import {illustratedDefinitions} from './course-art.js';
import {simulateShot} from './simulation-client.js';
import {DEFAULT_COSTS} from './model.js';
const $=id=>document.getElementById(id),theme=LANDSCAPES.woodland,colors={green:'#b7ef78',fairway:'#b7ef78',rough:'#eeb764',bunker:'#fff2cb',water:'#39c7de',trees:'#b795d4',ob:'#ef7770'};
let scene,aim,answer=null,busy=false;
const base=()=>({...basicPattern($('studyProfile').value,scene),aimMode:'carry'});
function project(p){return $('studyView').value==='map'?{x:480+p.x*6,y:530-(p.y-95)*4.5}:projectSurface(scene,p,8);}
const polygon=points=>points.map(([x,y])=>{const p=project({x,y});return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ');
function initialize(){scene=greenShapeScene($('studyExample').value);aim={x:scene.green.x,y:scene.green.y};answer=null;$('studyResult').hidden=true;$('studyStatus').textContent='Choose a target to inspect the same shot model on an angled green.';render();}
function render(){
 const map=$('studyView').value==='map',pin=project(scene.pin),target=project(aim),camera=project({x:0,y:0});
 let svg=`<defs>${illustratedDefinitions(theme,scene,project)}</defs>`+(map?'<rect width="960" height="580" fill="#8da66d"/>':'<rect width="960" height="580" fill="#9bbdce"/><path d="M0 234Q95 212 195 225T390 221T650 224T960 234V250H0Z" fill="#708d5f"/><rect y="235" width="960" height="345" fill="#8da66d"/>'+drawBackdrop('woodland',scene));
 svg+=`<polygon points="${polygon(scene.fairway)}" fill="#83b653"/><g id="studyGreenFringe"><polygon points="${polygon(greenOutline(scene.green,72,3))}" fill="#56793b"/><polygon points="${polygon(greenOutline(scene.green,72,1.2))}" fill="#96ad65"/></g>`+drawRelief(scene,project,theme,map,true);
 if($('studyMowing').checked)svg+=drawGreenMowing(scene.green,project);
 svg+=`<polygon id="studyGreenEdge" points="${polygon(greenOutline(scene.green))}" fill="none" stroke="#43632e" stroke-width="1.25" vector-effect="non-scaling-stroke"/>`;
 if(answer){for(const p of answer.result.points.filter((_,i)=>i%8===0)){const q=project(p);svg+=`<circle cx="${q.x}" cy="${q.y}" r="2.5" fill="${colors[p.kind]}" stroke="#344b36" stroke-width=".4"/>`;}const best=project(answer.comparison.aim);svg+=`<path d="M${best.x} ${best.y-7}l7 7-7 7-7-7Z" fill="#3487b6" stroke="white"/>`;}
 svg+=`<path d="M${pin.x} ${pin.y}v-25l18 6-18 7" fill="#ed6551" stroke="white" stroke-width="2"/><line x1="${camera.x}" y1="${camera.y}" x2="${target.x}" y2="${target.y}" stroke="white" stroke-width="1.4" stroke-dasharray="6 5"/><circle cx="${target.x}" cy="${target.y}" r="6" fill="none" stroke="white" stroke-width="2"/>`;
 $('studyCourse').innerHTML=svg;$('studyYardages').innerHTML=greenYardages(scene).map(x=>`<span>${x.label.replace('GREEN ','')}<br><strong>${Math.round(x.distance)} yd</strong></span>`).join('');
 $('studySide').value=aim.x;$('studyCarry').value=Math.hypot(aim.x,aim.y);$('studySideOut').textContent=Math.round(aim.x)+' yd';$('studyCarryOut').textContent=Math.round(Math.hypot(aim.x,aim.y))+' yd';
 for(const id of ['studyExample','studyProfile','studySide','studyCarry','studyFlag','studyCenter','studyReset'])$(id).disabled=busy;
 $('studyCommit').disabled=busy||!!answer;$('studyCommit').textContent=busy?'Calculating…':'Commit & reveal';
}
function change(x,carry){if(busy)return;aim=aimAtDistance({x,y:Math.sqrt(Math.max(1,carry*carry-x*x))},carry,[-50,50]);answer=null;$('studyResult').hidden=true;$('studyStatus').textContent='Target updated. Commit to reveal the possible finishes.';render();}
$('studyExample').onchange=initialize;$('studyProfile').onchange=initialize;$('studyView').onchange=render;$('studyMowing').onchange=render;
$('studySide').oninput=()=>change(Number($('studySide').value),Math.hypot(aim.x,aim.y));$('studyCarry').oninput=()=>change(aim.x,Number($('studyCarry').value));
$('studyFlag').onclick=()=>change(scene.pin.x,Math.hypot(scene.pin.x,scene.pin.y));$('studyCenter').onclick=()=>change(0,155);$('studyReset').onclick=initialize;
$('studyCourse').onclick=e=>{if(busy)return;const p=$('studyCourse').createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform($('studyCourse').getScreenCTM().inverse()),at=$('studyView').value==='map'?{x:(q.x-480)/6,y:95+(530-q.y)/4.5}:unprojectSurface(scene,q.x,q.y,8);change(Math.max(-50,Math.min(50,at.x)),Math.hypot(aim.x,aim.y));};
$('studyCommit').onclick=async()=>{if(busy||answer)return;busy=true;$('studyStatus').textContent='Calculating this fixed example. Nothing will be saved.';render();try{const p=base();answer=await simulateShot({scenario:scene,aim,pattern:patternAtTarget(aim,p),costs:DEFAULT_COSTS,seed:7142026});const r=answer.result;$('studyResult').textContent=`On green: ${(r.counts.green/r.n*100).toFixed(1)}% · Water: ${(r.counts.water/r.n*100).toFixed(1)}%. Estimated difference from blue comparison: ${Math.max(0,r.expected-answer.comparison.result.expected).toFixed(2)} strokes per shot.`;$('studyResult').hidden=false;$('studyStatus').textContent='Dots show possible finishes; the blue diamond is the sampled comparison. Use either view to inspect the green edge.';}catch{$('studyStatus').textContent='The calculation could not finish. Try again; nothing has been saved.';}finally{busy=false;render();}};
initialize();
