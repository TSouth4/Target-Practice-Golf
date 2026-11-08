import {lie} from './model.js';
import {projectSurface,drawRelief} from './surfaces.js';
import {LANDSCAPES,vegetation} from './landscape.js';
import {illustratedTheme,illustratedDefinitions,drawIllustratedPlant} from './course-art.js';
import {tracerTrajectory,TRACER_COLORS} from './tracers.js';
// Fixed, authored lesson; no sampling, optimization, grading or gameplay edits.
export const INTRO_DOTS=Array.from({length:100},(_,i)=>{const radius=Math.sqrt(-2*Math.log(1-(i+.5)/100)),angle=i*2.399963229728653;return{x:radius*Math.cos(angle)*42,y:radius*Math.sin(angle)*25};});
export const INTRO_SCENE={id:'intro-fixed',type:'approach',hole:'01',par:3,length:150,maxY:215,aimY:150,elevationM:9,bounds:[-65,65],green:{x:0,y:150,rx:22,ry:18},pin:{x:14,y:150},fairway:[[-12,0],[12,0],[21,100],[19,148],[-22,148],[-23,95]],hazards:[{kind:'water',label:'Water',poly:[[23,100],[65,100],[65,215],[23,215]],drop:{x:18,y:100}},{kind:'bunker',label:'Bunker',poly:[[-35,132],[-24,134],[-24,154],[-34,156],[-40,147]]},{kind:'trees',label:'Trees',poly:[[-65,100],[-46,100],[-46,215],[-65,215]]}]};
export const introProject=p=>projectSurface(INTRO_SCENE,p,INTRO_SCENE.elevationM);
const theme=illustratedTheme(LANDSCAPES.woodland),poly=points=>points.map(([x,y])=>{const p=introProject({x,y});return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ');
let terrain;
const scope=(markup,prefix)=>markup.replace(/\bid="([^"]+)"/g,(_,id)=>`id="${prefix}-${id}"`).replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#${prefix}-${id})`);
export function introCourse(prefix='intro-controls'){
 if(terrain)return scope(terrain,prefix);
 const origin=introProject({x:0,y:0}),pin=introProject(INTRO_SCENE.pin);
 let out=`<defs>${illustratedDefinitions(theme,INTRO_SCENE,introProject)}<linearGradient id="intro-sky" x2="0" y2="1"><stop stop-color="${theme.sky[0]}"/><stop offset="1" stop-color="${theme.sky[1]}"/></linearGradient><linearGradient id="intro-grass" x2="0" y2="1"><stop stop-color="${theme.fairway[0]}"/><stop offset="1" stop-color="${theme.fairway[1]}"/></linearGradient><clipPath id="intro-fairway"><polygon points="${poly(INTRO_SCENE.fairway)}"/></clipPath></defs><rect width="960" height="580" fill="url(#intro-sky)"/><path d="M0 234Q100 205 230 225T500 220T960 234V260H0Z" fill="#a7b89c"/><rect y="235" width="960" height="345" fill="${theme.rough[0]}"/><g opacity=".45" fill="#fff9ed"><ellipse cx="160" cy="78" rx="80" ry="12"/><ellipse cx="690" cy="110" rx="100" ry="11"/></g><polygon points="${poly(INTRO_SCENE.fairway)}" fill="url(#intro-grass)"/>`;
 out+='<g clip-path="url(#intro-fairway)">';for(let y=0;y<215;y+=24)out+=`<polygon points="${poly([[-150,y],[150,y],[150,y+12],[-150,y+12]])}" fill="#bcdf81" opacity=".065"/>`;out+='</g>';
 out+=drawRelief(INTRO_SCENE,introProject,theme,false,true);
 out+=vegetation(INTRO_SCENE,'woodland').map((p,i)=>drawIllustratedPlant(p,introProject,theme,i)).join('');
 out+=`<g transform="translate(${pin.x},${pin.y})"><ellipse rx="5" ry="2" fill="#234936"/><path d="M0 0v-33l22 8-22 8" fill="#ed654a" stroke="#fffef9" stroke-width="2"/></g><g transform="translate(770 365)"><rect x="-75" y="-24" width="150" height="48" rx="8" fill="#173f35e8"/><text text-anchor="middle" y="9" font-family="Arial" font-size="30" fill="white">Water</text></g><circle cx="${origin.x}" cy="${origin.y}" r="6" fill="#fffef8" stroke="#b0baa7" stroke-width="2"/>`;
 terrain=out;return scope(out,prefix);
}
export function introExampleShots(moved=false){const aim=moved?{x:-6,y:150}:{...INTRO_SCENE.pin};return{aim,shots:INTRO_DOTS.map(p=>{const landing={x:aim.x+p.x/3.5,y:aim.y+p.y/2.5};return{...landing,landing,kind:lie(landing,INTRO_SCENE)};})};}
function flight(shot,aim,delay=0,single=false){const p={height:25,start:0},path=tracerTrajectory(shot,aim,p).map((v,i)=>{const at=introProject(v);return `${i?'L':'M'}${at.x.toFixed(2)} ${at.y.toFixed(2)}`;}).join(' ');return `<path class="shot-tracer intro-game-trace" data-intro-flight="true" d="${path}" pathLength="100" stroke="${TRACER_COLORS[shot.kind]}" stroke-width="${single?4:1.8}" opacity="${single?.95:.7}" style="animation-delay:${delay}ms"/>${single?`<circle r="5" fill="white"><animateMotion dur="1.35s" path="${path}" fill="freeze"/></circle>`:''}`;}
export function introStoryGraphic(step,moved=false){
 const group=step>=2,safer=step===3?moved:step>=4,{aim,shots}=introExampleShots(safer);let out=introCourse('intro-story');
 out+=`<g class="${group?'intro-group-flights':'intro-single-flight'}" fill="none" stroke-linecap="round" stroke-linejoin="round">`;
 if(!group){const landing=step===0?{...INTRO_SCENE.pin}:{x:36,y:147},shot={...landing,landing,kind:step===0?'green':'water'};out+=flight(shot,INTRO_SCENE.pin,0,true);}
 else for(let i=0;i<24;i++)out+=flight(shots[Math.floor((i+.5)*shots.length/24)],aim,i*12);
 out+='</g>';
 if(group)out+=`<g data-intro-finishes="100">${shots.map((shot,i)=>{const p=introProject(shot);return `<circle class="intro-finish intro-game-finish" style="animation-delay:${1.65+i*.003}s" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="3.5" fill="${TRACER_COLORS[shot.kind]}" stroke="#344d31" stroke-width=".6"/>`;}).join('')}</g>`;
 const target=introProject(group?aim:INTRO_SCENE.pin);out+=`<g transform="translate(${target.x},${target.y})"><circle r="12" fill="#173f3544" stroke="white" stroke-width="2"/><path d="M-20 0h10M10 0h10M0-20v10M0 10v10" stroke="#fff5cb" stroke-width="2"/></g>`;
 return out;
}
