import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCourseLayers} from '../dist/course-renderer.js';
function fixture(){const doc={createElementNS(ns,tag){assert.equal(ns,'http://www.w3.org/2000/svg');assert.equal(tag,'g');return{setAttribute(key,value){this[key]=value;},writes:0,set innerHTML(value){this.html=value;this.writes++;}};}};return{ownerDocument:doc,childNodes:[],replaceChildren(...nodes){for(const old of this.childNodes)old.parentNode=null;this.childNodes=nodes;for(const node of nodes)node.parentNode=this;}};}
const markup={terrain:'<defs/><path id="terrain"/>',aim:'<circle id="aim"/>',flights:'<path id="flight"/>',feedback:'<g id="cloud"/>'};
test('layer updates preserve unaffected nodes and markup in the original paint order',()=>{
 const svg=fixture();renderCourseLayers(svg,markup);const nodes=[...svg.childNodes];
 assert.deepEqual(nodes.map(n=>n['data-course-layer']),['terrain','aim','flights','feedback']);
 assert.equal(nodes.map(n=>n.html).join(''),Object.values(markup).join(''));
 renderCourseLayers(svg,{...markup});assert.deepEqual(nodes.map(n=>n.writes),[1,1,1,1]);
 renderCourseLayers(svg,{...markup,aim:'<circle cx="10"/>'});assert.deepEqual(svg.childNodes,nodes);assert.deepEqual(nodes.map(n=>n.writes),[1,2,1,1]);
 renderCourseLayers(svg,{terrain:'new camera terrain',aim:'new aim',flights:'',feedback:'new view cloud'});assert.deepEqual(nodes.map(n=>n.writes),[2,3,2,2]);assert.equal(nodes[2].html,'');
});
test('renderer isolates roots and repairs a replaced or cleared SVG',()=>{
 const a=fixture(),b=fixture();renderCourseLayers(a,markup);renderCourseLayers(b,markup);assert.notEqual(a.childNodes[0],b.childNodes[0]);const old=a.childNodes[0];a.replaceChildren();renderCourseLayers(a,markup);assert.notEqual(a.childNodes[0],old);assert.equal(a.childNodes[0].html,markup.terrain);
});
test('markup-only hosts receive the unchanged combined SVG content',()=>{const svg={};renderCourseLayers(svg,markup);assert.equal(svg.innerHTML,Object.values(markup).join(''));});
