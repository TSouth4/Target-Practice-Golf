export const PROGRESS_KEY='target-practice-progress-v1';
export const MODEL_VERSION='decision-model-v4';
export const HISTORY_LIMIT=1000;
const KINDS=['balanced','aggressive','conservative','refine'];
const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
export function readProgress(raw){
 try{const data=typeof raw==='string'?JSON.parse(raw):raw;if(!Array.isArray(data))return[];
  return data.filter(r=>r&&typeof r.id==='string'&&r.id.length<100&&typeof r.encounter==='string'&&r.encounter.length<100&&typeof r.profile==='string'&&r.profile.length<100&&typeof r.profileLabel==='string'&&r.profileLabel.length<100&&[MODEL_VERSION,'decision-model-v3','decision-model-v2','decision-model-v1'].includes(r.model)&&['tee','approach'].includes(r.type)&&KINDS.includes(r.kind)&&finite(r.score,0,100)&&finite(r.penalty,0,1)&&(r.regret===null||finite(r.regret,0,1e6))&&Number.isFinite(Date.parse(r.at))&&typeof r.retry==='boolean').slice(-HISTORY_LIMIT).map(r=>({...r,score:Math.round(r.score),profileLabel:r.model!==MODEL_VERSION&&!r.profileLabel.endsWith(' · previous model')?r.profileLabel+' · previous model':r.profileLabel}));
 }catch{return[];}
}
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
export function profileKey(mode,handicap,driverLimit,bag,costs){
 const source=JSON.stringify(canonical({model:MODEL_VERSION,mode,profile:mode==='basic'?{handicap,driverLimit}:bag,costs}));
 let a=2166136261,b=3339675911;for(let i=0;i<source.length;i++){a=Math.imul(a^source.charCodeAt(i),16777619);b=Math.imul(b^source.charCodeAt(i),2246822519);}return`${(a>>>0).toString(16)}-${(b>>>0).toString(16)}-${source.length}`;
}
export function recordAttempt(history,entry){
 const previous=history.find(r=>r.id===entry.id);if(previous)return{history,entry:previous};
 const next={...entry,model:MODEL_VERSION,retry:history.some(r=>r.encounter===entry.encounter)};
 const clean=readProgress([next]);if(!clean.length)throw Error('Invalid progress entry');
 return{history:[...history,clean[0]].slice(-HISTORY_LIMIT),entry:clean[0]};
}
const average=rows=>rows.length?rows.reduce((sum,r)=>sum+r.score,0)/rows.length:null;
export function progressSummary(history,profile,type='all'){
 const selected=history.filter(r=>r.profile===profile&&(type==='all'||r.type===type));
 const first=selected.filter(r=>!r.retry),recent=first.slice(-10),window=Math.min(10,Math.floor(first.length/2));
 const change=first.length>=10?average(first.slice(-window))-average(first.slice(0,window)):null;
 const kinds=Object.fromEntries(KINDS.map(k=>[k,first.filter(r=>r.kind===k).length]));
 return{first,recent,retries:selected.length-first.length,mean:average(first),recentMean:average(recent),change,window,kinds,recentRegret:recent.some(r=>r.regret===null)?null:recent.length?recent.reduce((sum,r)=>sum+r.regret,0)/recent.length:null};
}
export function trendSVG(entries){
 const data=entries.slice(-50),x=i=>data.length===1?350:48+i*604/(data.length-1),y=v=>24+(100-v)*1.8;
 let svg='<rect width="700" height="250" rx="8" fill="#f4f7ee"/>';
 for(const score of [0,50,100])svg+=`<line x1="48" y1="${y(score)}" x2="652" y2="${y(score)}" stroke="#d5dfca"/><text x="36" y="${y(score)+4}" text-anchor="end" fill="#748566" font-size="11">${score}</text>`;
 if(!data.length)return svg+'<text x="350" y="117" text-anchor="middle" fill="#718163" font-size="14">Your first committed decision starts the chart.</text>';
 const raw=data.map((r,i)=>`${x(i).toFixed(2)},${y(r.score).toFixed(2)}`).join(' ');
 const smooth=data.map((r,i)=>`${x(i).toFixed(2)},${y(average(data.slice(Math.max(0,i-4),i+1))).toFixed(2)}`).join(' ');
 svg+=`<polyline points="${raw}" fill="none" stroke="#a3b191" stroke-width="1.5"/><polyline points="${smooth}" fill="none" stroke="#2c6240" stroke-width="3"/>`;
 data.forEach((r,i)=>svg+=`<circle cx="${x(i)}" cy="${y(r.score)}" r="3.5" fill="#bb9349"><title>First attempt ${entries.length-data.length+i+1}: ${r.score}/100</title></circle>`);
 svg+=`<text x="48" y="231" fill="#748566" font-size="11">Decision ${entries.length-data.length+1}</text><text x="652" y="231" text-anchor="end" fill="#748566" font-size="11">Decision ${entries.length}</text>`;
 return svg;
}
