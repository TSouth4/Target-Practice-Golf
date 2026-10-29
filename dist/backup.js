import {PRACTICE_KEY,PAUSED_ROUND_KEY,readPractice} from './practice-session.js';
import {PROGRESS_KEY,readProgress,HISTORY_LIMIT} from './progress.js';
import {ROUND_HISTORY_KEY,readRoundHistory,ROUND_HISTORY_LIMIT} from './dashboard.js';
import {ROUND_KEY,readRound} from './rounds.js';
import {COURSE_KEY,readCourse} from './course.js';
import {INTRO_KEY,INTRO_VERSION} from './introduction.js';
import {LESSON_KEY,CURRICULUM_VERSION,readLessonCompletion} from './curriculum.js';
import {SCENARIOS,DEFAULT_COSTS} from './model.js';
import {validPlayerProfile,SHOT_FIELDS} from './shot-editor.js';
import {LANDSCAPES} from './landscape.js';
export const SETTINGS_KEY='golfaim101-v2',BACKUP_VERSION=1,BACKUP_MAX_BYTES=5*1024*1024;
const requiredKeys=[SETTINGS_KEY,PROGRESS_KEY,ROUND_HISTORY_KEY,ROUND_KEY,COURSE_KEY,LESSON_KEY,INTRO_KEY];
const keys=[...requiredKeys,PRACTICE_KEY,PAUSED_ROUND_KEY];
const fail=()=>{throw Error('This file is not a complete, supported Target Practice backup. Your current data has not been changed.');};
const json=value=>JSON.stringify(value);
function safeTree(value,depth=0){if(depth>32)fail();if(typeof value==='number'&&!Number.isFinite(value)||typeof value==='string'&&value.includes('<'))fail();if(value&&typeof value==='object')for(const[k,v]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(k))fail();safeTree(v,depth+1);}}
function settings(s){
 if(s===null)return null;if(!s||typeof s!=='object'||Array.isArray(s)||!SCENARIOS.some(x=>x.id===s.scenario)||!['0','5','10','20'].includes(s.basicHandicap)||!['basic','advanced'].includes(s.mode)||!['easy','medium','hard'].includes(s.difficulty)||!['tee','approach','mixed'].includes(s.practiceFilter)||!['free','round'].includes(s.practiceMode)||!Object.hasOwn(LANDSCAPES,s.landscape)||typeof s.elevated!=='boolean'||!Number.isInteger(s.seed)||s.seed<1||s.seed>2147483646||!Number.isInteger(s.holeSeed)||s.holeSeed<0||s.holeSeed>2147483646)fail();
 const result=Object.fromEntries(['scenario','basicHandicap','mode','difficulty','practiceFilter','practiceMode','landscape','seed','holeSeed','elevated'].map(k=>[k,s[k]]));
 if(s.controlsTutorialSeen!==undefined&&typeof s.controlsTutorialSeen!=='boolean')fail();if(s.controlsTutorialSeen===true)result.controlsTutorialSeen=true;
 result.basicLimits={};for(const[h,v]of Object.entries(s.basicLimits||{})){if(!['0','5','10','20'].includes(h)||!Number.isFinite(v)||v<180||v>330)fail();result.basicLimits[h]=v;}
 if(s.memberBag){if(!validPlayerProfile({handicap:s.basicHandicap,limit:265,shotMode:'custom',bag:s.memberBag}))fail();result.memberBag=s.memberBag.map(c=>Object.fromEntries(['club','stock','bigDirection',...Object.keys(SHOT_FIELDS).filter(k=>k!=='carry')].map(k=>[k,c[k]])));}else if(s.mode==='advanced')fail();
 if(s.memberCosts){if(s.memberCosts.baseline!==DEFAULT_COSTS.baseline)fail();const ranges={base150:[2.5,4.5],longSlope:[0,1.5],puttBase:[0,1],rough:[0,1.5],bunker:[0,2],trees:[0,3],waterExtra:[0,2]};result.memberCosts={baseline:DEFAULT_COSTS.baseline};for(const[k,[lo,hi]]of Object.entries(ranges)){const v=s.memberCosts[k];if(!Number.isFinite(v)||v<lo||v>hi)fail();result.memberCosts[k]=v;}}
 if(typeof s.encounter==='string'&&s.encounter.length<100)result.encounter=s.encounter;
 result.recent=Array.isArray(s.recent)?s.recent.filter(id=>SCENARIOS.some(x=>x.id===id)).slice(-6):[];return result;
}
export function validateBackup(value){
 if(!value||value.format!=='target-practice-backup'||value.version!==BACKUP_VERSION||!Number.isFinite(Date.parse(value.createdAt))||!value.data||typeof value.data!=='object')fail();safeTree(value);
 const d=value.data;if(requiredKeys.some(k=>!Object.hasOwn(d,k))||Object.keys(d).some(k=>!keys.includes(k)))fail();
 const progress=readProgress(d[PROGRESS_KEY]),history=readRoundHistory(d[ROUND_HISTORY_KEY]);
 if(!Array.isArray(d[PROGRESS_KEY])||d[PROGRESS_KEY].length>HISTORY_LIMIT||progress.length!==d[PROGRESS_KEY].length||!Array.isArray(d[ROUND_HISTORY_KEY])||d[ROUND_HISTORY_KEY].length>ROUND_HISTORY_LIMIT||history.length!==d[ROUND_HISTORY_KEY].length)fail();
 const round=d[ROUND_KEY]===null?null:readRound(json(d[ROUND_KEY])),course=d[COURSE_KEY]===null?null:readCourse(d[COURSE_KEY]);if(d[ROUND_KEY]!==null&&!round||d[COURSE_KEY]!==null&&!course)fail();
 const lesson=d[LESSON_KEY];if(!lesson||lesson.version!==CURRICULUM_VERSION||!Array.isArray(lesson.completed)||readLessonCompletion(json(lesson)).length!==lesson.completed.length)fail();
 const free=d[PRACTICE_KEY]==null?null:readPractice(json(d[PRACTICE_KEY])),paused=d[PAUSED_ROUND_KEY]==null?null:readRound(json(d[PAUSED_ROUND_KEY]));if(d[PRACTICE_KEY]!=null&&!free||d[PAUSED_ROUND_KEY]!=null&&!paused)fail();
 const intro=d[INTRO_KEY];if(intro!==null&&(!intro||intro.version!==INTRO_VERSION||!['completed','skipped'].includes(intro.status)))fail();
 return {format:value.format,version:BACKUP_VERSION,createdAt:value.createdAt,data:{[SETTINGS_KEY]:settings(d[SETTINGS_KEY]),[PROGRESS_KEY]:progress,[ROUND_HISTORY_KEY]:history,[ROUND_KEY]:round,[COURSE_KEY]:course,[LESSON_KEY]:{version:CURRICULUM_VERSION,completed:lesson.completed},[INTRO_KEY]:intro,[PRACTICE_KEY]:free,[PAUSED_ROUND_KEY]:paused}};
}
export function makeBackup({state=null,progress=[],completedRounds=[],round=null,course=null,freeSession=null,pausedRound=null,lessons=[],introductionSeen=false},createdAt=new Date().toISOString()){
 return validateBackup({format:'target-practice-backup',version:BACKUP_VERSION,createdAt,data:{[PRACTICE_KEY]:freeSession,[PAUSED_ROUND_KEY]:pausedRound,[SETTINGS_KEY]:state,[PROGRESS_KEY]:progress,[ROUND_HISTORY_KEY]:completedRounds,[ROUND_KEY]:round,[COURSE_KEY]:course,[LESSON_KEY]:{version:CURRICULUM_VERSION,completed:lessons},[INTRO_KEY]:introductionSeen?{version:INTRO_VERSION,status:'completed'}:null}});
}
export function parseBackup(text){if(typeof text!=='string'||new TextEncoder().encode(text).length>BACKUP_MAX_BYTES)throw Error('Choose a backup file smaller than 5 MB.');try{return validateBackup(JSON.parse(text));}catch(error){if(error instanceof SyntaxError)fail();throw error;}}
export function backupSummary(backup){const d=backup.data,r=d[ROUND_KEY]?.status==='active'?d[ROUND_KEY]:d[COURSE_KEY]?.status==='active'?d[COURSE_KEY]:null;return {decisions:d[PROGRESS_KEY].length,rounds:d[ROUND_HISTORY_KEY].length,lessons:d[LESSON_KEY].completed.length,customShot:!!d[SETTINGS_KEY]?.memberBag,activeRound:r?`${r.kind==='course'?'Par-3 course':r.kind==='assessment'?'Assessment':'Learning round'} · ${r.index+1} of ${r.schedule.length}`:null};}
export function restoreBackup(storage,backup){
 const clean=validateBackup(backup),before=keys.map(k=>[k,storage.getItem(k)]),written=[];
 try{for(const k of keys){storage.setItem(k,json(clean.data[k]));written.push(k);}}
 catch(cause){let rollbackFailed=false;for(const k of written)try{storage.removeItem(k);}catch{rollbackFailed=true;}for(const[k,v]of before.filter(([k])=>written.includes(k)))try{if(v!==null)storage.setItem(k,v);}catch{rollbackFailed=true;}const error=Error(rollbackFailed?'Restore could not finish or fully undo its changes. Download the safety backup before closing this page.':'Restore failed, and your previous saved data was kept. The browser may be out of storage.');error.rollbackFailed=rollbackFailed;error.cause=cause;throw error;}
 return clean;
}
