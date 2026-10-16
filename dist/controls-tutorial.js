// A controls exercise only: no model, target optimization, storage or grading.
export function createControlsTutorial({get,onComplete,onAssessment,onStrategy}){
 let opened=false,step=0,side=0,carry=140,aimed=false,moved=false,focusTarget=null,drag=null;
 const $=get;
 function render(){
  $('controlsStep').textContent=step===3?'CONTROLS COMPLETE':`CONTROLS · ${step+1} / 3`;
  $('controlsTitle').textContent=['Choose direction','Set intended carry','Commit your choice','Ready for your baseline'][step];
  $('controlsText').textContent=[
   'Tap or drag left or right on the practice range. This chooses direction; tapping farther up does not change distance. You can also focus the range and use the arrow keys.',
   'Move the Intended carry bar to change distance. Carry is the distance before the ball first lands. Roll depends on the ground, so we choose carry separately.',
   'Choose Commit practice click. In a game, Commit & shoot locks your choice and reveals example shot flights. This exercise does not judge your target.',
   'You know the controls. The 10-shot assessment captures your starting choices without coaching between shots. Its report appears at the end. Strategy lessons can follow.'
  ][step];
  $('controlsMarker').setAttribute('transform',`translate(${300+side*2},${220-(carry-50)/180*150})`);
  $('controlsRange').setAttribute('tabindex',step===0?'0':'-1');$('controlsCarry').value=String(carry);$('controlsCarryOut').textContent=`${carry} yd`;$('controlsCarry').disabled=step!==1;
  $('controlsNext').hidden=step>=2;$('controlsNext').disabled=step===0?!aimed:!moved;
  $('controlsAssessment').textContent=step===3?'Go to 10-shot assessment':'Skip tutorial and view assessment setup';$('controlsAssessment').classList.toggle('primary',step===3);$('controlsAssessment').classList.toggle('secondary',step!==3);
  $('controlsBack').hidden=step===0||step===3;$('controlsCommit').hidden=step!==2;$('controlsStrategy').hidden=step!==3;
  $('controlsStatus').textContent=step===0?(aimed?'Direction selected. Choose Next.':'Choose a direction to continue, or go straight to the assessment.'):step===1?(moved?'Carry changed. Choose Next.':'Move the carry bar to practice changing distance.'):step===2?'No ideal target or score will be shown.':'Tutorial complete. No scored decision was recorded.';
  for(const [id,on]of [['controlsRange',step===0],['controlsCarry',step===1],['controlsCommit',step===2]])$(id).classList.toggle('control-highlight',on);
 }
 function close(restore=true){if(!opened)return;opened=false;drag=null;$('controlsDialog').hidden=true;$('mainContent').inert=false;$('appHeader').inert=false;if(restore)focusTarget?.focus?.();}
 function choose(e){if(!opened||step!==0)return;const point=$('controlsRange').createSVGPoint();point.x=e.clientX;point.y=e.clientY;const ct=$('controlsRange').getScreenCTM();if(!ct)return;const local=point.matrixTransform(ct.inverse());side=Math.max(-60,Math.min(60,(local.x-300)/2));aimed=true;render();}
 $('controlsRange').addEventListener('pointerdown',e=>{if(step!==0||e.isPrimary===false||e.button!==undefined&&e.button!==0)return;drag=e.pointerId;choose(e);$('controlsRange').setPointerCapture?.(e.pointerId);});
 $('controlsRange').addEventListener('pointermove',e=>{if(drag!==null&&drag===e.pointerId)choose(e);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])$('controlsRange').addEventListener(event,()=>{drag=null;});
 $('controlsRange').addEventListener('keydown',e=>{if(!opened||step!==0||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();side=Math.max(-60,Math.min(60,side+(e.key==='ArrowRight'?5:-5)));aimed=true;render();});
 $('controlsCarry').addEventListener('input',()=>{if(!opened||step!==1)return;const next=Number($('controlsCarry').value);if(!Number.isFinite(next))return;const value=Math.max(50,Math.min(230,next));moved=moved||value!==carry;carry=value;render();});
 $('controlsNext').addEventListener('click',()=>{if(!opened||step>=2||step===0&&!aimed||step===1&&!moved)return;step++;render();$('controlsTitle').focus?.();});
 $('controlsBack').addEventListener('click',()=>{if(!opened||step<1||step>2)return;step--;render();});
 $('controlsCommit').addEventListener('click',()=>{if(!opened||step!==2)return;step=3;onComplete();render();$('controlsTitle').focus?.();});
 $('controlsClose').addEventListener('click',()=>close());
 $('controlsAssessment').addEventListener('click',()=>{if(!opened)return;close(false);return onAssessment();});
 $('controlsStrategy').addEventListener('click',()=>{if(!opened||step!==3)return;close(false);return onStrategy();});
 $('controlsDialog').addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();close();}
  if(e.key==='Tab'){const items=['controlsClose','controlsRange','controlsCarry','controlsBack','controlsNext','controlsCommit','controlsAssessment','controlsStrategy'].map($).filter(el=>!el.hidden&&!el.disabled);if(e.shiftKey&&e.target===items[0]){e.preventDefault();items.at(-1).focus?.();}else if(!e.shiftKey&&e.target===items.at(-1)){e.preventDefault();items[0].focus?.();}}
 });
 return {open(target){focusTarget=target;step=0;side=0;carry=140;aimed=false;moved=false;opened=true;$('controlsDialog').hidden=false;$('mainContent').inert=true;$('appHeader').inert=true;render();$('controlsTitle').focus?.();},close};
}
