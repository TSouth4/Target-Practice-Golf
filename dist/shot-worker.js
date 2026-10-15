import {calculateShot,SIMULATION_PROTOCOL} from './shot-simulation.js';
// Keep the protocol independent of the client so the worker does not import UI
// orchestration or fallback code. Both sides use the same fixed draw count.
self.onmessage=async({data})=>{
 const {id,input,guide}=data||{};
 try{
  if(data?.protocol!==SIMULATION_PROTOCOL)throw Error('Unsupported calculation protocol.');
  const payload=await calculateShot(input,{guide});
  self.postMessage({protocol:SIMULATION_PROTOCOL,id,type:'result',payload});
 }catch(error){self.postMessage({protocol:SIMULATION_PROTOCOL,id,type:'error',message:error?.message||'Shot calculation failed.'});}
};
