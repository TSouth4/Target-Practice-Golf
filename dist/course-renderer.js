const NAMES=['terrain','aim','flights','feedback'];
const states=new WeakMap();

// Preserve unchanged SVG nodes (including focus and running animations). Full
// markup comparison makes invalidation independent of camera/settings keys.
export function renderCourseLayers(svg,markup){
 const values=NAMES.map(name=>markup[name]);
 const doc=svg.ownerDocument;
 if(!doc?.createElementNS||!svg.replaceChildren){svg.innerHTML=values.join('');return;}
 let state=states.get(svg);
 if(!state||svg.childNodes.length!==NAMES.length||state.nodes.some(node=>node.parentNode!==svg)){
  const nodes=NAMES.map(name=>{const group=doc.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('data-course-layer',name);return group;});
  svg.replaceChildren(...nodes);state={nodes,values:[]};states.set(svg,state);
 }
 values.forEach((value,i)=>{
  if(value!==state.values[i]){state.nodes[i].innerHTML=value;state.values[i]=value;}
 });
}
