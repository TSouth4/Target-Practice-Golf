import {calculateShot,SHOT_COUNT,SIMULATION_PROTOCOL} from './shot-simulation.js';

export {SIMULATION_PROTOCOL} from './shot-simulation.js';
function mark(name,execution){try{if(name==='target-practice-calculation-start'){globalThis.performance?.clearMarks?.(name);globalThis.performance?.clearMarks?.('target-practice-calculation-end');}globalThis.performance?.mark?.(name,{detail:execution?{execution}:null});}catch{}}
const yieldToPage=()=>new Promise(resolve=>setTimeout(resolve,0));
let requestId=0;
function browserWorker(){return typeof globalThis.Worker==='function'?new Worker(new URL('./shot-worker.js',import.meta.url),{type:'module',name:'target-practice-calculation'}):null;}
function inWorker(worker,input,guide,timeoutMs){
 return new Promise((resolve,reject)=>{
  const id=++requestId;let settled=false;
  function finish(action,value){if(settled)return;settled=true;clearTimeout(timer);worker.onmessage=worker.onerror=worker.onmessageerror=null;try{worker.terminate();}catch{}action(value);}
  // Script loading / browser support failures can safely use the established path.
  const fallback=event=>{event?.preventDefault?.();finish(resolve,null);};
  const timer=setTimeout(()=>{const error=Error('Shot calculation timed out. Try again.');error.name='SimulationTimeoutError';finish(reject,error);},timeoutMs);
  worker.onerror=fallback;worker.onmessageerror=fallback;
  worker.onmessage=({data})=>{
   if(!data||data.id!==id)return;
   if(data.protocol!==SIMULATION_PROTOCOL){fallback();return;}
   if(data.type==='error'){finish(reject,Error(data.message||'Shot calculation failed.'));return;}
   if(data.type!=='result'||data.payload?.result?.n!==SHOT_COUNT||data.payload?.comparison?.result?.n!==SHOT_COUNT){fallback();return;}
   finish(resolve,data.payload);
  };
  try{worker.postMessage({protocol:SIMULATION_PROTOCOL,id,input,guide});}catch{fallback();}
 });
}
// Keep request data stable across awaits; the screen also rejects results if its
// state changed. A fresh worker is terminated after every success or failure.
export async function simulateShot(input,{guide=null,yieldControl=yieldToPage,workerFactory=browserWorker,timeoutMs=120000}={}){
 mark('target-practice-calculation-start');
 const snapshot=structuredClone({input,guide:guide?{aim:guide.aim,pattern:guide.pattern,evaluated:guide.evaluated}:null});
 let worker=null;try{worker=workerFactory();}catch{}
 if(worker){const result=await inWorker(worker,snapshot.input,snapshot.guide,timeoutMs);if(result){mark('target-practice-calculation-end','worker');return{...result,execution:'worker'};}}
 const result=await calculateShot(snapshot.input,{guide:snapshot.guide,yieldControl});mark('target-practice-calculation-end','main-thread');return{...result,execution:'main-thread'};
}
