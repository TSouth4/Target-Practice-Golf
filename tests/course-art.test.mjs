import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIOS} from '../dist/model.js';
import {generateScenario} from '../dist/practice.js';
import {LANDSCAPES,vegetation} from '../dist/landscape.js';
import {drawRelief,projectSurface} from '../dist/surfaces.js';
import {illustratedTheme,illustratedDefinitions,drawIllustratedPlant} from '../dist/course-art.js';
test('illustrated materials preserve every rendered surface vertex in both camera projections',()=>{
 const s=generateScenario(SCENARIOS.find(s=>s.id==='tucked'),17),projectors=[p=>projectSurface(s,p,s.elevationM),p=>({x:480+p.x*3,y:580-p.y*3})];
 for(const theme of Object.values(LANDSCAPES))for(const [i,project] of projectors.entries()){
 const before=drawRelief(s,project,theme,!!i),after=drawRelief(s,project,illustratedTheme(theme),!!i,true);
 const vertices=html=>[...html.matchAll(/<polygon points="([^"]+)"|<path data-relief-mesh="[^"]+" d="([^"]+)"/g)].flatMap(m=>m[1]?[m[1]]:m[2].split('Z').filter(Boolean).map(t=>t.slice(1).replaceAll('L',' ')));assert.deepEqual(vertices(after),vertices(before));assert.ok(!/NaN|undefined|Infinity/.test(after+illustratedDefinitions(theme,s,project)));
 }
});
test('illustrated foliage is deterministic, never changes scenario or plant data, and follows camera changes',()=>{
 const s=generateScenario(SCENARIOS.find(s=>s.id==='tucked'),17),project=p=>projectSurface(s,p,s.elevationM),shift=p=>{const a=project(p);return{x:a.x+40,y:a.y+20};},sceneBefore=JSON.stringify(s);
 for(const theme of Object.values(LANDSCAPES)){
 const plants=vegetation(s,Object.keys(LANDSCAPES).find(k=>LANDSCAPES[k]===theme)),before=JSON.stringify(plants);
 for(const [i,p] of plants.entries()){
 const art=drawIllustratedPlant(p,project,theme,i);assert.equal(drawIllustratedPlant(p,project,theme,i),art);assert.ok(!/NaN|undefined|Infinity/.test(art));assert.notEqual(drawIllustratedPlant(p,shift,theme,i),art);assert.equal(drawIllustratedPlant(p,project,theme,i),art);
 }assert.equal(JSON.stringify(plants),before);
 }assert.equal(JSON.stringify(s),sceneBefore);
});
