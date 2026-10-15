// Lightweight DOM contract harness. No browser or preview server is used.
import {readFileSync} from 'node:fs';
export function setupDOM({reducedMotion=true,practiceMode='free'}={}){
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),elements=new Map(),costs=[],storage=new Map();
 // Existing flow regressions explicitly use unrestricted practice; round behavior has separate checks.
 // Existing flow checks represent returning users; introduction tests remove this key.
 storage.set('target-practice-introduction-v1',JSON.stringify({version:'introduction-v1',status:'skipped'}));
 storage.set('golfaim101-v2',JSON.stringify({scenario:'cedar',practiceMode}));
 class Element{
  constructor(attrs={}){this.attrs=attrs;this.id=attrs.id;this.value=attrs.value||'';this.min=attrs.min||'';this.max=attrs.max||'';this.hidden='hidden'in attrs;this.innerHTML='';this.textContent='';this.style={};this.dataset=attrs['data-cost']?{cost:attrs['data-cost']}:{};this.listeners={};this.classList={toggle(){}};}
  addEventListener(type,handler){(this.listeners[type]??=[]).push(handler);}
  setAttribute(key,value){this.attrs[key]=value;}
  async fire(type,extra={}){for(const cb of this.listeners[type]||[])await cb({target:this,...extra});}
  dispatchEvent(event){return this.fire(event.type,{preventDefault(){}});}
  scrollIntoView(){this.scrolled=true;}
  createSVGPoint(){return {x:0,y:0,matrixTransform(){return{x:this.x,y:this.y};}};}
  getScreenCTM(){return {inverse(){return{};}};}
 }
 for(const match of html.matchAll(/<([a-z0-9]+)\b([^>]+)>/g)){const attrs={};for(const a of match[2].matchAll(/([a-zA-Z-]+)(?:="([^"]*)")?/g))attrs[a[1]]=a[2]||'';if(attrs.id){if(elements.has(attrs.id))throw Error('Duplicate HTML id '+attrs.id);elements.set(attrs.id,new Element(attrs));}if(attrs['data-cost'])costs.push(new Element(attrs));}
 globalThis.document={getElementById:id=>{if(!elements.has(id))throw Error('Missing DOM id: '+id);return elements.get(id);},querySelectorAll:selector=>selector==='[data-cost]'?costs:[]};
 globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 globalThis.matchMedia=()=>({matches:reducedMotion});
 return {html,elements,costs,storage,$:id=>elements.get(id)};
}
