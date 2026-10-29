import test from 'node:test';import assert from 'node:assert/strict';
import {setupDOM} from './dom-harness.mjs';import {ROUND_KEY} from '../dist/rounds.js';
import {PRACTICE_KEY,PAUSED_ROUND_KEY,readPractice,freshPracticeSeed} from '../dist/practice-session.js';
import {nextScenario} from '../dist/practice.js';import {SCENARIOS} from '../dist/model.js';
test('mixed permits neighboring shot types while bounding runs and covering the bank',()=>{
 let id='cedar',recent=[id],run=1,repeats=0;const seen=new Set();
 for(let i=1;i<=1000;i++){const next=nextScenario(id,'mixed',i*7919,recent),same=SCENARIOS.find(h=>h.id===id).type===SCENARIOS.find(h=>h.id===next).type;assert.notEqual(next,id);run=same?run+1:1;if(same)repeats++;assert.ok(run<=3);seen.add(next);id=next;recent=[...recent,id].slice(-6);}
 assert.equal(seen.size,16);assert.ok(repeats>100&&repeats<700);
});
test('corrupt saved practice does not become a continue session; seeds are in supported range',()=>{for(const raw of [null,'bad','{}',JSON.stringify({version:1,scenario:'bad',holeSeed:1,seed:1})])assert.equal(readPractice(raw),null);for(let i=0;i<30;i++){const seed=freshPracticeSeed();assert.ok(seed>0&&seed<=2147483646);assert.notEqual(freshPracticeSeed(seed),seed);}});
test('new practice changes layout; continue restores target and seed across rounds and reload',async()=>{
 let dom=setupDOM(),$=dom.$;await import('../dist/app.js?practice-sessions');
 assert.equal($('homeContinuePractice').hidden,true);
 await $('homePractice').fire('click');const initial=readPractice(dom.storage.get(PRACTICE_KEY));assert.ok(initial.holeSeed>0);
 $('aimX').value='12';await $('aimX').fire('input');const selected=readPractice(dom.storage.get(PRACTICE_KEY));assert.ok(selected.hasAim);
 await $('homeLogo').fire('click',{preventDefault(){}});await $('homeLearning').fire('click');const round=dom.storage.get(ROUND_KEY);
 await $('homeLogo').fire('click',{preventDefault(){}});await $('homeContinuePractice').fire('click');const continued=readPractice(dom.storage.get(PRACTICE_KEY));assert.equal(continued.holeSeed,selected.holeSeed);assert.equal(continued.seed,selected.seed);assert.deepEqual(continued.aim,selected.aim);assert.deepEqual(continued.recent,selected.recent);assert.equal(dom.storage.get(PAUSED_ROUND_KEY),round);
 await $('homeLogo').fire('click',{preventDefault(){}});assert.equal($('homeContinue').hidden,false);await $('homeContinue').fire('click');assert.equal(dom.storage.get(ROUND_KEY),round);
 await $('homeLogo').fire('click',{preventDefault(){}});await $('homePractice').fire('click');const fresh=readPractice(dom.storage.get(PRACTICE_KEY));assert.notEqual(fresh.holeSeed,selected.holeSeed);assert.notEqual(fresh.scenario,selected.scenario);assert.equal(fresh.hasAim,false);
 const old=dom;dom=setupDOM();$=dom.$;for(const [key,value]of old.storage)dom.storage.set(key,value);await import('../dist/app.js?practice-sessions-reload');assert.equal($('homeContinuePractice').hidden,false);assert.equal($('homeContinue').hidden,false);await $('homeContinuePractice').fire('click');assert.equal(readPractice(dom.storage.get(PRACTICE_KEY)).holeSeed,fresh.holeSeed);
});
