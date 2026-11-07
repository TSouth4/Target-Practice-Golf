// Authored teaching illustration, not a measured player distribution or scored simulation.
export const INTRO_DOTS=Array.from({length:100},(_,i)=>{
 const radius=Math.sqrt(-2*Math.log(1-(i+.5)/100)),angle=i*2.399963229728653;
 return {x:radius*Math.cos(angle)*42,y:radius*Math.sin(angle)*25};
});
export const introCourse=()=>`<rect width="600" height="380" rx="12" fill="#dce6ce"/><path d="M200 380L220 170Q235 115 260 90H350L395 380Z" fill="#85af58"/><ellipse cx="300" cy="105" rx="110" ry="75" fill="#afd17a" stroke="#638946" stroke-width="2"/><path d="M410 0Q385 80 398 130T410 210L450 380H600V0Z" fill="#5daec4"/><path d="M410 0Q385 80 398 130T410 210L450 380" fill="none" stroke="#287d96" stroke-width="3"/><text x="478" y="180" text-anchor="middle" fill="#123c32" font-size="18">Water</text><path d="M370 85v-27l20 7-20 9" fill="#d85842" stroke="#fffef9" stroke-width="2"/><circle cx="300" cy="350" r="5" fill="white" stroke="#294835"/>`;
export function introStoryGraphic(step,moved=false){
 const group=step>=2,safer=step===3?moved:step>=4,x=safer?295:370,y=safer?105:85;
 let svg=introCourse();
 if(!group){const end=step===0?{x:370,y:85}:{x:440,y:140},path=`M300 350C290 225 ${end.x-35} 160 ${end.x} ${end.y}`;
  svg+=`<path d="${path}" fill="none" stroke="#f9ed9c" stroke-width="3"/><circle r="6" fill="white" stroke="#244b34"><animateMotion dur="1.4s" path="${path}" fill="freeze"/></circle><circle cx="${end.x}" cy="${end.y}" r="8" fill="none" stroke="#244b34" stroke-width="2"/>`;
 }else{
  svg+=`<g data-intro-finishes="100">${INTRO_DOTS.map((p,i)=>`<path class="intro-trace" d="M300 350Q${300+p.x*.3} 190 ${x+p.x} ${y+p.y}" fill="none" stroke="#fff6c6" stroke-width="1"/><circle class="intro-finish" style="animation-delay:${i*.008}s" cx="${x+p.x}" cy="${y+p.y}" r="3.5" fill="#f4dc86" stroke="#5e6037" stroke-width=".6"/>`).join('')}</g>`;
 }
 svg+=`<path d="M${x-11} ${y}h22M${x} ${y-11}v22" stroke="#244b34" stroke-width="6"/><path d="M${x-11} ${y}h22M${x} ${y-11}v22" stroke="white" stroke-width="3"/><text x="18" y="365" fill="#203b30" font-size="15">${group?'100 illustrated possible finishes':'One illustrated shot'} · no score</text>`;
 return svg;
}
