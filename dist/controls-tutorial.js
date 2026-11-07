import {introStoryGraphic,introCourse} from './intro-story.js';
// Introduction only: independent of gameplay, probability defaults and scoring.
export function createControlsTutorial({get,onComplete,onAssessment,onStrategy}){
 const DIRECTION=5,CARRY=6,COMMIT=7,COMPLETE=9;
 let opened=false,completed=false,step=0,side=0,carry=140,aimed=false,moved=false,patternMoved=false,focusTarget=null,drag=null;
 const $=get;
 $('controlsBackground').innerHTML=introCourse();
 const slides=[
  ['The shot we picture','It’s easy to choose a target based on the shot you hope to hit. Picture one perfect shot finishing close to the flag.'],
  ['The shots we also hit','But we won’t hit that shot every time. The ball might finish shorter, longer, left, or right—even when we aim at the same target.'],
  ['Think beyond one shot','Imagine staying here and hitting 100 shots toward that same target. Where would they all finish? This group is your shot pattern, also called dispersion.'],
  ['Choose a target for the whole group','A good target gives your good shots a chance to finish close and leaves room for your misses. Try moving the target away from the water and watch the whole group move.'],
  ['What you’re practicing','You’re practicing how to choose a target that puts your shot pattern in a good position—giving your good shots a chance to finish close and keeping more of your misses away from trouble. The goal is to build this habit before every shot.'],
  ['Choose direction','Tap or drag left or right to choose your direction. Tapping farther up does not change distance. You can also focus the picture and use the arrow keys.'],
  ['Set intended carry','Move the carry bar to choose how far the ball travels before landing. Direction and distance are two separate decisions, so we ask you to think through both. Rollout changes with the ground; carry is our starting point.'],
  ['Commit your choice','Choose Try Commit & shoot. In the game, this reveals the possible shots after you choose your target. Here, you’re just practicing the controls—your choice is not graded.'],
  ['Judge the group, not one ball','A target can give you a lucky result or an unlucky one. We score how the whole group of possible shots performs. You can then adjust your target and compare. This illustration shows the idea; it does not grade the target you just selected.'],
  ['Find your starting point','Now choose targets for 10 shots on your own. We’ll score your decisions, but save the feedback until the end. This gives you a starting point to compare with after practicing. Afterward, practice with feedback after each shot or explore the lessons.']
 ];
 function render(){
  const controls=step>=DIRECTION&&step<=COMMIT;
  $('controlsStep').textContent=step===COMPLETE?'INTRODUCTION COMPLETE':`INTRODUCTION · ${step+1} / ${slides.length}`;
  $('controlsTitle').textContent=slides[step][0];$('controlsText').textContent=slides[step][1];
  $('controlsStory').hidden=controls;$('controlsStory').style.display=controls?'none':'';$('controlsStory').setAttribute('aria-hidden',String(controls));$('controlsStory').setAttribute('aria-label',slides[step][0]+(step>=2?' —100 illustrated possible finishes.':' —one illustrated ball flight.'));
  if(!controls){$('controlsStory').innerHTML=introStoryGraphic(step,patternMoved);if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){$('controlsStory').pauseAnimations?.();$('controlsStory').setCurrentTime?.(5);}else{$('controlsStory').setCurrentTime?.(0);$('controlsStory').unpauseAnimations?.();}}
  $('controlsStoryCaption').hidden=controls;$('controlsStoryCaption').textContent=step===0?'One illustrated shot toward the flag.':step===1?'Same target. A different finish.':'100 illustrated possible finishes. White cross: your target.';
  $('controlsMoveTarget').hidden=step!==3;$('controlsMoveTarget').disabled=patternMoved;$('controlsMoveTarget').textContent=patternMoved?'Target moved':'Move the target away from water';
  $('controlsMarker').setAttribute('transform',`translate(${300+side*2},${220-(carry-50)/180*150})`);
  $('controlsRange').setAttribute('tabindex',step===DIRECTION?'0':'-1');$('controlsCarry').value=String(carry);$('controlsCarryOut').textContent=`${carry} yd`;$('controlsCarry').disabled=step!==CARRY;
  $('controlsNext').hidden=step===COMMIT||step===COMPLETE;$('controlsNext').disabled=step===DIRECTION?!aimed:step===CARRY?!moved:step===3?!patternMoved:false;
  $('controlsRange').style.display=controls?'':'none';$('controlsCarry').hidden=!controls;$('controlsCarryOut').parentElement?.toggleAttribute('hidden',!controls);
  $('controlsAssessment').textContent=step===COMPLETE?'Go to assessment setup':'Skip introduction and view assessment setup';$('controlsAssessment').classList.toggle('primary',step===COMPLETE);$('controlsAssessment').classList.toggle('secondary',step!==COMPLETE);
  $('controlsBack').hidden=step===0;$('controlsCommit').hidden=step!==COMMIT;$('controlsStrategy').hidden=step!==COMPLETE;
  $('controlsStatus').textContent=step===3?(patternMoved?'The target and the group moved together. More of the misses now have room away from the water.':'Choose Move the target to compare.'):step===DIRECTION?(aimed?'Direction selected. Choose Next.':'Choose a direction to continue.'):step===CARRY?(moved?'Carry changed. Choose Next.':'Move the carry bar to practice changing distance.'):step===COMMIT?'Your choice here is not graded.':step===COMPLETE?'Introduction complete. Your game scores and saved rounds are unchanged.':'';
  for(const [id,on]of [['controlsRange',step===DIRECTION],['controlsCarry',step===CARRY],['controlsCommit',step===COMMIT]])$(id).classList.toggle('control-highlight',on);
 }
 function close(restore=true){if(!opened)return;opened=false;drag=null;$('controlsDialog').hidden=true;$('mainContent').inert=false;$('appHeader').inert=false;if(restore)focusTarget?.focus?.();}
 function choose(e){if(!opened||step!==DIRECTION)return;const point=$('controlsRange').createSVGPoint();point.x=e.clientX;point.y=e.clientY;const ct=$('controlsRange').getScreenCTM();if(!ct)return;const local=point.matrixTransform(ct.inverse());side=Math.max(-60,Math.min(60,(local.x-300)/2));aimed=true;render();}
 $('controlsMoveTarget').addEventListener('click',()=>{if(opened&&step===3){patternMoved=true;render();$('controlsNext').focus?.();}});
 $('controlsRange').addEventListener('pointerdown',e=>{if(step!==DIRECTION||e.isPrimary===false||e.button!==undefined&&e.button!==0)return;drag=e.pointerId;choose(e);$('controlsRange').setPointerCapture?.(e.pointerId);});
 $('controlsRange').addEventListener('pointermove',e=>{if(drag!==null&&drag===e.pointerId)choose(e);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])$('controlsRange').addEventListener(event,()=>{drag=null;});
 $('controlsRange').addEventListener('keydown',e=>{if(!opened||step!==DIRECTION||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();side=Math.max(-60,Math.min(60,side+(e.key==='ArrowRight'?5:-5)));aimed=true;render();});
 $('controlsCarry').addEventListener('input',()=>{if(!opened||step!==CARRY)return;const next=Number($('controlsCarry').value);if(!Number.isFinite(next))return;const value=Math.max(50,Math.min(230,next));moved=moved||value!==carry;carry=value;render();});
 $('controlsNext').addEventListener('click',()=>{if(!opened||step===COMMIT||step>=COMPLETE||step===3&&!patternMoved||step===DIRECTION&&!aimed||step===CARRY&&!moved)return;step++;if(step===COMPLETE&&!completed){completed=true;onComplete();}render();$('controlsTitle').focus?.();});
 $('controlsBack').addEventListener('click',()=>{if(!opened||step<=0)return;step--;render();});
 $('controlsCommit').addEventListener('click',()=>{if(!opened||step!==COMMIT)return;step=8;render();$('controlsTitle').focus?.();});
 $('controlsClose').addEventListener('click',()=>close());
 $('controlsAssessment').addEventListener('click',()=>{if(!opened)return;close(false);return onAssessment();});
 $('controlsStrategy').addEventListener('click',()=>{if(!opened||step!==COMPLETE)return;close(false);return onStrategy();});
 $('controlsDialog').addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();close();}
  if(e.key==='Tab'){const items=['controlsClose','controlsRange','controlsMoveTarget','controlsCarry','controlsBack','controlsNext','controlsCommit','controlsAssessment','controlsStrategy'].map($).filter(el=>!el.hidden&&!el.disabled&&(el!==$('controlsRange')||step===DIRECTION));if(e.shiftKey&&e.target===items[0]){e.preventDefault();items.at(-1).focus?.();}else if(!e.shiftKey&&e.target===items.at(-1)){e.preventDefault();items[0].focus?.();}}
 });
 return {open(target){focusTarget=target;completed=false;step=0;side=0;carry=140;aimed=false;moved=false;patternMoved=false;opened=true;$('controlsDialog').hidden=false;$('mainContent').inert=true;$('appHeader').inert=true;render();$('controlsTitle').focus?.();},close};
}
