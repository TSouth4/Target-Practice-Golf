import test from 'node:test';import assert from 'node:assert/strict';import {setupDOM} from './dom-harness.mjs';
const dom=setupDOM(),$=dom.$;await import('../dist/app.js?menu-navigation');
const routes=['lessonsMenu','courseMenu','practiceRoundMenu','assessmentMenu','freePracticeMenu','advancedMode','progressMenu','basicMode'];
test('all menu routes work from the custom editor, progress and an active assessment',async()=>{
 for(const origin of ['editor','progress','assessment'])for(const route of routes){
  await $('freePracticeMenu').fire('click');const before=JSON.parse(dom.storage.get('golfaim101-v2')).memberBag;
  if(origin==='editor'){await $('advancedMode').fire('click');$('curve').value='13';await $('curve').fire('input');}
  if(origin==='progress')await $('progressMenu').fire('click');
  if(origin==='assessment'){await $('assessmentMenu').fire('click');await $('startAssessment').fire('click');}
  assert.equal($('menuToggle').disabled,false);await $('menuToggle').fire('click');assert.equal($('practiceMenu').hidden,false);
  for(const id of routes)assert.equal($(id).disabled,false,id+' from '+origin);
  await $(route).fire('click');assert.equal($('practiceMenu').hidden,true);
  assert.equal($('shotEditor').hidden,route!=='advancedMode');assert.equal($('progressScreen').hidden,route!=='progressMenu');assert.equal($('lessonsScreen').hidden,route!=='lessonsMenu');
  if(before)assert.deepEqual(JSON.parse(dom.storage.get('golfaim101-v2')).memberBag,before,'navigation must not save a draft');
 }
});
