// Read-only audit of the shipped Practice selection, not a randomness certification.
import {setupDOM} from '../tests/dom-harness.mjs';
import {SCENARIOS} from '../dist/model.js';
import {nextScenario,generateScenario,PRACTICE_SEQUENCE} from '../dist/practice.js';
import assert from 'node:assert/strict';
const dom=setupDOM();dom.storage.delete('golfaim101-v2');
await import('../dist/app.js?practice-randomization-review');
await dom.$('homePractice').fire('click');
const saved=()=>JSON.parse(dom.storage.get('golfaim101-v2'));
const first=saved();await dom.$('homeLogo').fire('click',{preventDefault(){}});await dom.$('homeContinuePractice').fire('click');
assert.equal(saved().scenario,first.scenario);assert.equal(saved().holeSeed,first.holeSeed);
const report={freshStart:{scenario:first.scenario,holeSeed:first.holeSeed,shotSeed:first.seed},reenterPreservesLayout:true,familyCount:PRACTICE_SEQUENCE.length,filters:{}};
for(const filter of ['mixed','tee','approach']){
 let id='cedar',seed=7142026,recent=[],previousType=null,adjacentRepeats=0,sameTypePairs=0,fallbacks=0;
 const counts={},fingerprints=new Set(),firstTwelve=[];
 for(let i=0;i<1000;i++){
  seed=(seed+7919)%2147483646||1;
  const next=nextScenario(id,filter,seed,recent);assert.ok(next);
  if(next===id)adjacentRepeats++;
  const base=SCENARIOS.find(s=>s.id===next);assert.ok(filter==='mixed'||base.type===filter);
  if(previousType===base.type)sameTypePairs++;
  const s=generateScenario(base,seed);if(s.generation?.fallback)fallbacks++;
  // Exclude cosmetic metadata and seed so identical playable geometry counts as identical.
  fingerprints.add(JSON.stringify({fairway:s.fairway,green:s.green,pin:s.pin,hazards:s.hazards.map(h=>({kind:h.kind,poly:h.poly}))}));
  counts[next]=(counts[next]||0)+1;if(i<12)firstTwelve.push(next);
  previousType=base.type;id=next;recent=[...recent,id].slice(-6);
 }
 report.filters[filter]={samples:1000,counts,uniqueGeometry:fingerprints.size,adjacentRepeats,sameTypePairs,fallbacks,firstTwelve};
}
console.log(JSON.stringify(report,null,2));
