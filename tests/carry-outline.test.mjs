import test from 'node:test';
import assert from 'node:assert/strict';
import {carryOutline,createCarryOutlineCache} from '../dist/carry-outline.js';
import {SCENARIOS,basicPattern,patternAtTarget,shotAt} from '../dist/model.js';
import {conditionsFor} from '../dist/conditions.js';
import {defaultMemberBag} from '../dist/shot-editor.js';

function original(aim,p){const points=[];for(let i=0;i<64;i++){const t=i/64*Math.PI*2,pt=shotAt(aim,{...patternAtTarget(aim,p),bigPct:0},{z1:1.794*Math.cos(t),z2:1.794*Math.sin(t),u:1,sign:1});points.push([pt.landing.x,pt.landing.y]);}return points;}
test('carry outlines exactly preserve all original world points across profiles, distances, weather and custom shape',()=>{
 for(const handicap of ['0','5','10','20'])for(const difficulty of ['easy','medium','hard']){
  const p={...basicPattern(handicap,SCENARIOS[0]),aimMode:'carry',conditions:conditionsFor(difficulty,991)};
  p.customBag=defaultMemberBag(p).map(c=>({...c,start:2,curve:8,bias:-3,bigPct:15}));
  for(const aim of [{x:0,y:90},{x:-22,y:180},{x:12,y:250}]){
   const snapshot=structuredClone({aim,p});assert.deepEqual(carryOutline(aim,p),original(aim,p));assert.deepEqual({aim,p},snapshot);
  }
 }
});
test('bounded cache reuses equivalent geometry but invalidates in-place aim, weather and nested club changes',()=>{
 const cached=createCarryOutlineCache(),aim={x:2,y:180},p={...basicPattern('5',SCENARIOS[0]),aimMode:'carry',conditions:conditionsFor('hard',991)};
 p.customBag=defaultMemberBag(p);const first=cached(aim,p);
 assert.equal(cached({...aim},structuredClone(p)),first);
 aim.x+=3;let changed=cached(aim,p);assert.notEqual(changed,first);assert.deepEqual(changed,original(aim,p));
 p.conditions.windX+=2;const wind=cached(aim,p);assert.notEqual(wind,changed);assert.deepEqual(wind,original(aim,p));
 p.customBag[0].curve+=2;const club=cached(aim,p);assert.notEqual(club,wind);assert.deepEqual(club,original(aim,p));
 assert.throws(()=>{club[0][0]=999;},TypeError);assert.throws(()=>{club.push([0,0]);},TypeError);
 for(let i=0;i<5;i++)cached({x:i,y:150},p);
 assert.notEqual(cached(aim,p),club);
});

test('non-finite and signed-zero inputs bypass JSON keys without changing calculation semantics',()=>{
 const cached=createCarryOutlineCache(),p={...basicPattern('5',SCENARIOS[0]),autoBag:false},aim={x:0,y:180};
 for(const value of [null,NaN,Infinity,-Infinity,-0,0]){p.bias=value;assert.deepEqual(cached(aim,p),original(aim,p));}
});
