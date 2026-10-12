import {BROADIE_BENCHMARK} from './benchmark-broadie.js';
export const BASELINE_ID=BROADIE_BENCHMARK.id;
export const BASELINE_LABEL='Historical PGA TOUR reference';
// Input yards everywhere; the source putting table alone uses feet.
// Clamp unsupported distances rather than inventing measured values.
export function baselineLookup(kind,yards){
 const key={bunker:'sand',trees:'recovery'}[kind]||kind;
 const table=BROADIE_BENCHMARK.tables[key];
 if(!table||!Number.isFinite(yards)||yards<0)throw new RangeError('Invalid baseline lie or distance');
 const distance=key==='green'?yards*3:yards;
 if(distance<table[0][0])return{value:table[0][1],clamped:true,unit:key==='green'?'ft':'yd'};
 if(distance>table.at(-1)[0])return{value:table.at(-1)[1],clamped:true,unit:key==='green'?'ft':'yd'};
 let low=0,high=table.length-1;while(high-low>1){const middle=(low+high)>>1;if(table[middle][0]<distance)low=middle;else high=middle;}
 const [prev,a]=table[low],[x,v]=table[high];
 return{value:a+(v-a)*(distance-prev)/(x-prev),clamped:false,unit:key==='green'?'ft':'yd'};
}
export const baselineStrokes=(kind,yards)=>baselineLookup(kind,yards).value;
