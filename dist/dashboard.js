import {MODEL_VERSION} from './progress.js';
import {readRound} from './rounds.js';
import {COURSE_VERSION} from './course.js';
import {SCENARIOS} from './model.js';
import {validPlayerProfile} from './shot-editor.js';
export const ROUND_HISTORY_KEY='target-practice-completed-rounds-v1';
export const ROUND_HISTORY_LIMIT=200;
const kinds=['balanced','aggressive','conservative','refine'];
const finite=(v,min=0,max=1e9)=>Number.isFinite(v)&&v>=min&&v<=max;
const mean=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
export function readRoundHistory(raw){
 try{const rows=typeof raw==='string'?JSON.parse(raw):raw;if(!Array.isArray(rows))return[];const seen=new Set();return rows.filter(r=>{if(!r||r.recovered!==undefined&&typeof r.recovered!=='boolean'||typeof r.id!=='string'||!r.id.length||r.id.length>60||seen.has(r.id)||!['practice','assessment','course'].includes(r.kind)||!Number.isFinite(Date.parse(r.completedAt))||typeof r.model!=='string'||r.model.length>60||typeof r.version!=='string'||r.version.length>80||!validPlayerProfile(r.profile))return false;const count=r.kind==='course'?r.holes:r.kind==='practice'?5:10;if(r.kind==='course'&&![3,18].includes(count)||r.holes!==count||!Array.isArray(r.decisions)||r.decisions.length!==count||r.decisions.some(d=>!d||!['tee','approach'].includes(d.type)||!kinds.includes(d.kind)||!finite(d.score,0,100)||!(d.regret===null||finite(d.regret))))return false;if(r.kind==='course'&&(!Number.isInteger(r.strokes)||r.strokes<count||r.strokes>100000||r.relative!==r.strokes-count*3))return false;if(r.excludedRetries!==undefined&&!finite(r.excludedRetries,0,100000))return false;seen.add(r.id);return true;}).slice(-ROUND_HISTORY_LIMIT);}catch{return[];}
}
export function completedRoundEntry(round,completedAt=new Date().toISOString()){
 if(!round||!round.schedule||round.answers?.length!==round.schedule.length)return null;
 const r=readRound(JSON.stringify({...round,status:'complete'}));if(!r)return null;
 const decisions=r.answers.map((a,i)=>({type:r.kind==='course'?'tee':SCENARIOS.find(s=>s.id===r.schedule[i].id).type,kind:a.kind,score:a.score,regret:a.regret}));
 const strokes=r.kind==='course'?r.answers.reduce((n,a)=>n+a.holeScore,0):undefined;
 const entry={id:r.id,kind:r.kind,version:r.version,model:r.decisionModel||'earlier-unrecorded',completedAt:r.completedAt||completedAt,recovered:!r.completedAt,profile:structuredClone(r.profile),holes:r.schedule.length,decisions,...(strokes!==undefined?{strokes,relative:strokes-r.schedule.length*3,excludedRetries:r.answers.reduce((n,a)=>n+Math.max(0,a.teeShots-1),0)}:{})};
 return readRoundHistory([entry])[0]||null;
}
export function archiveRound(history,round,at){if(!round||history.some(r=>r.id===round.id))return history;const entry=completedRoundEntry(round,at);return entry?[...history,entry].slice(-ROUND_HISTORY_LIMIT):history;}
export const difficultyOf=r=>r.conditions?.difficulty||r.profile?.difficulty||(r.profile&&typeof r.profile==='object'?'easy':'unknown');
export function shotSetting(row){if(row.profile&&typeof row.profile==='object')return row.profile.shotMode==='custom'?'Custom shot':`${row.profile.handicap} handicap`;if(row.shotMode==='custom'||row.profileLabel?.startsWith('My clubs'))return 'Custom shot';const h=row.handicap??row.profileLabel?.match(/(?:Free · )?(\d+) handicap/)?.[1]??(row.profileLabel?.includes('scratch')?'0':null);return h!==null?`${h} handicap`:'Earlier setting';}
function canonical(value){return Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;}
export function settingKey(row){return JSON.stringify(canonical([row.model,row.version,row.profile]));}
export function dashboardData(history,roundHistory,difficulty='all'){
 const selected=r=>difficulty==='all'||difficultyOf(r)===difficulty;
 const choices=new Map();for(const r of history.filter(r=>!r.retry&&r.model===MODEL_VERSION&&selected(r)))if(!choices.has(r.encounter))choices.set(r.encounter,r);
 for(const r of roundHistory.filter(r=>r.model===MODEL_VERSION&&selected(r)))for(const[d,choice]of r.decisions.entries()){const encounter=`round-${r.id}-${d}`;if(!choices.has(encounter))choices.set(encounter,{...choice,id:encounter,encounter,at:r.completedAt,profile:r.profile,model:r.model,conditions:{difficulty:difficultyOf(r)},profileLabel:shotSetting(r)});}
 const first=[...choices.values()].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)),summary=rows=>({count:rows.length,score:mean(rows.map(r=>r.score)),cost:rows.some(r=>r.regret===null)?null:mean(rows.map(r=>r.regret)),unbounded:rows.some(r=>r.regret===null),kinds:Object.fromEntries(kinds.map(k=>[k,rows.filter(r=>r.kind===k).length]))});
 const rounds=roundHistory.filter(selected).sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt)),courses=rounds.filter(r=>r.kind==='course'&&r.holes===18&&r.version===COURSE_VERSION),learning=rounds.filter(r=>r.kind==='practice'),assessments=rounds.filter(r=>r.kind==='assessment');
 const breakdown=['easy','medium','hard','unknown'].map(key=>({difficulty:key,...summary(first.filter(r=>difficultyOf(r)===key)),courses:courses.filter(r=>difficultyOf(r)===key)}));
 return{...summary(first),first,learning,courses,assessments,pilots:rounds.filter(r=>r.kind==='course'&&r.holes===3),breakdown,tee:summary(first.filter(r=>r.type==='tee')),approach:summary(first.filter(r=>r.type==='approach')),courseMean:mean(courses.map(r=>r.relative)),courseCount:courses.length,pilotCount:rounds.filter(r=>r.kind==='course'&&r.holes===3).length,previousCount:history.filter(r=>!r.retry&&r.model!==MODEL_VERSION&&selected(r)).length,retries:history.filter(r=>r.retry&&selected(r)).length+rounds.reduce((n,r)=>n+(r.excludedRetries||0),0),settings:[...new Set(first.map(shotSetting))],difficulty};
}
export function roundTrendSVG(rounds,kind){
 const data=rounds.slice(-30),values=data.map(r=>kind==='course'?r.relative:mean(r.decisions.map(d=>d.score))),low=kind==='course'?Math.min(0,...values)-1:0,high=kind==='course'?Math.max(2,...values)+1:100,span=high-low||1,x=i=>data.length===1?350:58+i*590/(data.length-1),y=v=>28+(high-v)/span*170;
 let svg='<rect width="700" height="250" rx="8" fill="#f4f7ee"/>';
 for(const v of [low,(low+high)/2,high])svg+=`<line x1="58" y1="${y(v)}" x2="648" y2="${y(v)}" stroke="#d5dfca"/><text x="46" y="${y(v)+4}" text-anchor="end" fill="#64765a" font-size="12">${v.toFixed(kind==='course'?1:0)}</text>`;
 if(!data.length)return svg+`<text x="350" y="120" text-anchor="middle" fill="#64765a" font-size="15">Complete ${kind==='course'?'an 18-hole round':'a five-shot learning round'} to start this chart.</text>`;
 for(let i=1;i<data.length;i++)if(data[i].model!=='earlier-unrecorded'&&settingKey(data[i])===settingKey(data[i-1]))svg+=`<line x1="${x(i-1)}" y1="${y(values[i-1])}" x2="${x(i)}" y2="${y(values[i])}" stroke="#2c6240" stroke-width="3"/>`;
 data.forEach((r,i)=>{const value=values[i],label=kind==='course'?`${value>0?'+':''}${value} to par`:`${value.toFixed(1)} / 100`;svg+=`<circle cx="${x(i)}" cy="${y(value)}" r="5" fill="#bb9349"><title>Round ${rounds.length-data.length+i+1}: ${label} · ${difficultyOf(r)} · ${shotSetting(r)}${r.model==='earlier-unrecorded'?' · earlier model not recorded':''}</title></circle>`;});
 return svg+`<text x="58" y="232" fill="#64765a" font-size="12">Round ${rounds.length-data.length+1}</text><text x="648" y="232" text-anchor="end" fill="#64765a" font-size="12">Round ${rounds.length}</text>`;
}
