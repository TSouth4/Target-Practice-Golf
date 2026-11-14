import test from 'node:test';import assert from 'node:assert/strict';
import {setupDOM} from './dom-harness.mjs';import {ROUND_KEY} from '../dist/rounds.js';import {COURSE_KEY} from '../dist/course.js';import {PRACTICE_KEY} from '../dist/practice-session.js';
const dom=setupDOM(),$=dom.$;await import('../dist/app.js?save-warning');
const normalWrite=localStorage.setItem,settings='golfaim101-v2';
test('failed learning-round saves stay visible, preserve existing data, and retry the latest state',async()=>{
 assert.equal($('saveWarning').hidden,true);const original=dom.storage.get(ROUND_KEY);
 localStorage.setItem=()=>{throw new DOMException('Storage full','QuotaExceededError');};
 await $('homeLearning').fire('click');assert.equal($('saveWarning').hidden,false);assert.match($('roundStatus').textContent,/Learning round/);assert.equal(dom.storage.get(ROUND_KEY),original);
 await $('saveWarningRetry').fire('click');assert.equal($('saveWarning').hidden,false);assert.match($('saveWarningDetail').textContent,/Still unable/);
 localStorage.setItem=(key,value)=>{if(key===ROUND_KEY)throw Error('Still blocked');return normalWrite(key,value);};
 $('aimX').value='12';await $('aimX').fire('input');assert.equal($('saveWarning').hidden,false);
 const latest=JSON.parse(dom.storage.get(settings));assert.equal(latest.aim.x,12);await $('saveWarningRetry').fire('click');assert.equal($('saveWarning').hidden,false);assert.equal(dom.storage.get(ROUND_KEY),original);
 localStorage.setItem=normalWrite;await $('saveWarningRetry').fire('click');assert.equal($('saveWarning').hidden,true);assert.equal(JSON.parse(dom.storage.get(ROUND_KEY)).kind,'practice');assert.equal(JSON.parse(dom.storage.get(settings)).aim.x,12);assert.equal($('saveWarningDetail').textContent,'');
});
test('a free-practice-only failure is not hidden by successful settings and round writes',async()=>{
 localStorage.setItem=(key,value)=>{if(key===PRACTICE_KEY)throw Error('Storage denied');return normalWrite(key,value);};
 await $('homePractice').fire('click');assert.equal($('saveWarning').hidden,false);$('aimX').value='-8';await $('aimX').fire('input');
 localStorage.setItem=normalWrite;await $('saveWarningRetry').fire('click');assert.equal($('saveWarning').hidden,true);const free=JSON.parse(dom.storage.get(PRACTICE_KEY));assert.equal(free.hasAim,true);assert.equal(free.aim.x,-8);assert.equal(free.layoutVersion,'variety-v1');
});
test('a failed course save recovers both the latest round and course without restarting',async()=>{
 localStorage.setItem=(key,value)=>{if(key===COURSE_KEY)throw Error('Storage denied');return normalWrite(key,value);};
 await $('courseMenu').fire('click');await $('courseSetupStart').fire('click');assert.equal($('saveWarning').hidden,false);const active=dom.storage.get(ROUND_KEY);
 const create=document.createElement,body=document.body,createURL=URL.createObjectURL;let captured;
 document.createElement=()=>({click(){},remove(){}});document.body={appendChild(){}};URL.createObjectURL=blob=>{captured=blob;return 'blob:maintenance-test';};
 try{await $('saveWarningBackup').fire('click');assert.ok(captured);const backup=JSON.parse(await captured.text());assert.equal(backup.data[COURSE_KEY].id,JSON.parse(active).id);assert.equal($('saveWarning').hidden,false);}finally{document.createElement=create;document.body=body;URL.createObjectURL=createURL;}

 localStorage.setItem=normalWrite;await $('saveWarningRetry').fire('click');assert.equal($('saveWarning').hidden,true);assert.deepEqual(JSON.parse(dom.storage.get(COURSE_KEY)),JSON.parse(active));assert.equal(dom.storage.get(ROUND_KEY),active);
});

test('playing through a failed save preserves the first attempt and retries persistence without duplicating it',async()=>{
 await $('homePractice').fire('click');const progress='target-practice-progress-v1',before=JSON.parse(dom.storage.get(progress)||'[]');
 localStorage.setItem=()=>{throw Error('Storage denied');};$('aimX').value='0';await $('aimX').fire('input');await $('simulate').fire('click');assert.equal($('results').hidden,false);assert.equal($('saveWarning').hidden,false);assert.deepEqual(JSON.parse(dom.storage.get(progress)||'[]'),before);
 localStorage.setItem=normalWrite;await $('saveWarningRetry').fire('click');assert.equal($('saveWarning').hidden,true);const saved=JSON.parse(dom.storage.get(progress));assert.equal(saved.length,before.length+1);assert.equal(saved.at(-1).retry,false);await $('saveWarningRetry').fire('click');assert.deepEqual(JSON.parse(dom.storage.get(progress)),saved);
});
