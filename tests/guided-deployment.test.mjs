import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setupDOM} from './dom-harness.mjs';
const dom=setupDOM(),$=dom.$;
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const script=html.match(/src="(releases\/[^\"]+\/boot.js)"/)[1];
await import(new URL('../dist/'+script,import.meta.url));
test('all four packaged guided lessons complete without adding normal progress and restore practice',async()=>{
 const prior=dom.storage.get('golfaim101-v2'),progress=dom.storage.get('target-practice-progress-v1');
 for(let i=1;i<=4;i++){
  await $('lessonsMenu').fire('click');await $('lessonStart'+i).fire('click');
  for(let step=0;step<12&&!$('course').innerHTML.includes('id="lessonTargetHint"');step++)await $('tutorialNext').fire('click');
  const hint=$('course').innerHTML.match(/id="lessonTargetHint" data-target-x="([^"]+)" data-target-y="([^"]+)" data-target-carry="([^"]+)"/);
  assert.ok(hint,'guided target is present');
  $('aimX').value=hint[1];await $('aimX').fire('input');$('aimY').value=hint[3];await $('aimY').fire('input');
  await $('simulate').fire('click');assert.match($('tutorialTitle').textContent,/Success/);
  await $('tutorialNext').fire('click');assert.ok(!$('tutorialRecap').hidden);
  assert.equal(dom.storage.get('target-practice-progress-v1'),progress);
  await $('closeLessons').fire('click');assert.equal(dom.storage.get('golfaim101-v2'),prior);
 }
});
