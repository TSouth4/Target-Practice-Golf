import {ROUND_HISTORY_KEY,ROUND_HISTORY_LIMIT,readRoundHistory,archiveRound,dashboardData,roundTrendSVG,difficultyOf,shotSetting} from './dashboard.js';
import {INTRO_KEY,INTRO_VERSION,INTRO_STEPS,INTRO_PURPOSE,hasSeenIntroduction,prepareIntroduction,introductionGraphic} from './introduction.js';
import {CALM,CONDITIONS_VERSION,conditionsFor,conditionsLabel,conditionsFeedback} from './conditions.js';
import {createCourse,readCourse,recordCourseShot,advanceCourse,courseTotal,scoreName,scoreToPar,COURSE_FINISH_LABEL,COURSE_KEY,courseFinishHeadline} from './course.js';
import {tutorialGraphic} from './tutorial-graphics.js';
import {CURRICULUM,CURRICULUM_VERSION,LESSON_KEY,LESSON_PROFILE,lessonById,lessonFixture,nearLessonTarget,readLessonCompletion} from './curriculum.js';
import {plannedRollout,centerFlight} from './rollout.js';
import {ROUND_VERSION,ROUND_KEY,createRound,readRound,addRoundAnswer,roundSummary,roundNarrative} from './rounds.js';
import {SCENARIOS,DEFAULT_COSTS,preset,basicPattern,clamp,random,samples,shotAt,evaluate,optimizeTargets,decisionScore,patternAtTarget,fitTarget,aimAtDepth,aimAtDistance,decisionFeedback} from './model.js';
import {targetFacts,hazardCallouts,retryRows,greenYardages} from './guidance.js';
import {decisionLesson,retryImpact} from './lessons.js';
import {PROGRESS_KEY,MODEL_VERSION,readProgress,profileKey,recordAttempt} from './progress.js';
import {DRIVER_LIMITS,reachLimit,trainingBag} from './bag.js';
import {FLIGHT_PIXEL,APEX_FLIGHT_PIXEL,defaultMemberBag,cleanMemberBag,editingPattern,flightHandles,moveFlightHandle,moveApex,applyFlightToBag,resetFlight,apexY,APEX_X,FINISH_X,FINISH_Y,flightDescription,flightSVG,heightSVG} from './shot-editor.js';
import {BRAND} from './config.js';
import {EYE_CAMERA,reviewCamera,projectReview,aimZoomBox,isDoubleAimTap} from './camera.js';
import {nextScenario,generateScenario,nextLandscape} from './practice.js';
import {TRACER_COLORS,tracerSample,tracerTrajectory} from './tracers.js';
import {LANDSCAPES,vegetation,drawPlant,drawBackdrop} from './landscape.js';
import {projectSurface,unprojectSurface,drawRelief} from './surfaces.js';
const $=id=>document.getElementById(id);
const KEYS=['carry','roll','sdSide','sdLong','bias','start','curve','height','bigPct','bigDirection','bigShift','bigShort','rho'];
const COLORS=TRACER_COLORS;
const NAMES={fairway:'Fairway',green:'Green',rough:'Rough',bunker:'Bunker',water:'Water',trees:'Recovery',ob:'OB'};
let state={scenario:'cedar',holeSeed:0,elevated:true,landscape:'woodland',practiceMode:'free',difficulty:'easy',basicLimits:{},mode:'basic',basicHandicap:'5',advanced:null,memberBag:null,memberCosts:null,practiceFilter:'mixed',recent:[],profile:'5',club:'Driver',view:'pov',aim:{x:0,y:270},pattern:basicPattern(5,SCENARIOS[0]),costs:{...DEFAULT_COSTS},seed:7142026};
let homeOpen=false;
let courseSetupOpen=false,courseSetupFocus=null;
let introduction=null,introductionSeen=false,introductionSaved=true;try{introductionSeen=hasSeenIntroduction(localStorage.getItem(INTRO_KEY));}catch{introductionSaved=false;}
let tutorial=null,tutorialReturn=null,lessonScreenOpen=false,lessonCompleted=[],lessonStorageOK=true;const tutorialCache=new Map();try{lessonCompleted=readLessonCompletion(localStorage.getItem(LESSON_KEY));}catch{lessonStorageOK=false;}
let round=null,roundView=false,roundResumed=false;try{round=readRound(localStorage.getItem(ROUND_KEY));roundResumed=round?.status==='active';}catch{}
let result=null,best=null,oneShot=null,working=false,hasAim=false,toastTimer,phase='choose',traceShots=[],transition=null;
let editorDraft=null,editorClub='Driver',editorDrag=null,editorInvalid=new Set();
let landingCamera=null;
let immersive=false,feedbackExpanded=true,nativeFullscreen=false;
let retryBaseline=null,retryHint='';
let courseStorageOK=true;
function isCourse(){return round?.kind==='course';}
function storedCourse(){try{return readCourse(localStorage.getItem(COURSE_KEY));}catch{courseStorageOK=false;return null;}}
function retryValid(){return retryBaseline&&retryBaseline.encounter===state.encounter&&retryBaseline.profile===currentProfile()&&retryBaseline.seed===state.seed&&JSON.stringify(retryBaseline.conditions||null)===JSON.stringify(state.pattern.conditions||null);}
let aimZoom=null,lastCourseTap=null,lastDoubleAimTap=null;
function resetAimZoom(){aimZoom=null;lastCourseTap=null;lastDoubleAimTap=null;}
function toggleAimZoom(point){if(working||isCourse()&&round.review||result||editorDraft||progressOpen)return;lastCourseTap=null;lastDoubleAimTap=null;aimZoom=aimZoom?null:aimZoomBox(point||projectSurface(scene(),state.aim,elevation()));updateLabels();}
const storeKey='golfaim101-v2';
let idCounter=0;
const makeId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${(++idCounter).toString(36)}-${Math.random().toString(36).slice(2,10)}`;
state.encounter=makeId();
let progressHistory=[],progressOpen=false,progressStored=true,progressMessage='';
try{progressHistory=readProgress(localStorage.getItem(PROGRESS_KEY));}catch{progressStored=false;}
let completedRounds=[],roundHistoryStored=true,progressDifficulty='all';try{completedRounds=readRoundHistory(localStorage.getItem(ROUND_HISTORY_KEY));}catch{roundHistoryStored=false;}
function rememberCompletedRound(candidate){const next=archiveRound(completedRounds,candidate);if(next===completedRounds&&roundHistoryStored)return;completedRounds=next;try{localStorage.setItem(ROUND_HISTORY_KEY,JSON.stringify(completedRounds));roundHistoryStored=true;}catch{roundHistoryStored=false;}}
const escapeHTML=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const RATING_LABELS={balanced:'Strong decision',aggressive:'Too aggressive',conservative:'Too conservative',refine:'Target needs refining'};
function effectiveBag(){return round?.profile.shotMode==='custom'?round.profile.bag:state.memberBag;}
function currentProfile(){return profileKey(state.mode,state.basicHandicap,state.pattern.driverLimit,effectiveBag(),state.costs,{version:CONDITIONS_VERSION,difficulty:state.pattern.conditions?.difficulty||'easy'});}
function selectedPlayerProfile(){return{handicap:state.basicHandicap,limit:state.basicLimits[state.basicHandicap]||DRIVER_LIMITS[state.basicHandicap],...(state.difficulty!=='easy'?{difficulty:state.difficulty,conditionsVersion:CONDITIONS_VERSION}:{}),...(state.mode==='advanced'?{shotMode:'custom',bag:structuredClone(state.memberBag)}:{})};}
function restorePlayerProfile(){state.difficulty=round.profile.difficulty||'easy';state.mode=round.profile.shotMode==='custom'?'advanced':'basic';state.basicHandicap=round.profile.handicap;state.basicLimits[round.profile.handicap]=round.profile.limit;state.costs={...DEFAULT_COSTS};state.practiceMode='round';}
function recordDecision(){
 if(introduction||tutorial||isCourse())return;
 if(!Number.isFinite(best.result.expected)){progressMessage='No progress entry: this run has no usable target comparison.';return;}
 const assessed=decisionFeedback(state.aim,state.pattern,result,best,scene());
 const entry={id:makeId(),encounter:state.encounter,at:new Date().toISOString(),model:MODEL_VERSION,profile:currentProfile(),profileLabel:state.mode==='basic'?`Free · ${state.basicHandicap==='0'?'scratch':state.basicHandicap+' handicap'} · ${Math.round(state.pattern.driverLimit)} yd limit · ${state.pattern.conditions?.difficulty||'easy'}`:`My clubs · ${state.pattern.conditions?.difficulty||'easy'}`,type:scene().type,kind:assessed.kind,score:decisionScore(result.expected,best.result.expected,state.aim,best.aim),regret:Number.isFinite(result.expected)?Math.max(0,result.expected-best.result.expected):null,penalty:result.penalty,conditions:structuredClone(state.pattern.conditions||CALM),handicap:state.basicHandicap,shotMode:state.mode==='advanced'?'custom':'handicap'};
 const recorded=recordAttempt(progressHistory,entry);progressHistory=recorded.history;
 try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(progressHistory));progressStored=true;}catch{progressStored=false;}
 progressMessage=progressStored?(recorded.entry.retry?'Retry saved separately; it does not enter your improvement trend.':'First attempt saved to My progress.'):'Progress is available for this visit, but could not be saved on this device.';
}
function renderProgress(){
 const data=dashboardData(progressHistory,completedRounds,progressDifficulty),average=v=>v===null?'—':v.toFixed(1)+' / 100',cost=d=>!d.count?'—':d.unbounded?'Unbounded':(d.cost*100).toFixed(1),relative=v=>v===null?'—':Math.abs(v)<.05?'Even par':(v>0?'+':'')+v.toFixed(1),date=at=>new Date(at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
 $('progressDifficulty').value=progressDifficulty;$('progressScope').textContent=progressDifficulty==='all'?'Overall · all difficulties':`${progressDifficulty[0].toUpperCase()+progressDifficulty.slice(1)} difficulty`;
 $('progressCount').textContent=data.count;$('progressRetryCount').textContent=`${data.retries} ${data.retries===1?'retry':'retries'} excluded`;$('progressAverage').textContent=average(data.score);$('progressAverageLabel').textContent='First choices only · current scoring rules';$('progressCost').textContent=cost(data);$('progressCourseAverage').textContent=relative(data.courseMean);$('progressCourseCount').textContent=`${data.courseCount} completed 18-hole ${data.courseCount===1?'round':'rounds'}`;
 $('progressChartLabel').textContent=`${data.learning.length} completed five-shot rounds · higher is better`;$('progressTrend').innerHTML=roundTrendSVG(data.learning,'practice');$('progressCourseChartLabel').textContent=`${data.courses.length} completed 18-hole rounds · lower is better`;$('progressCourseTrend').innerHTML=roundTrendSVG(data.courses,'course');
 $('progressKinds').innerHTML=Object.entries(data.kinds).map(([kind,count])=>`<div><span>${RATING_LABELS[kind]}</span><strong>${count}</strong><small>${data.count?(100*count/data.count).toFixed(0):0}%</small></div>`).join('');
 const tendency=d=>{if(!d.count)return'—';const max=Math.max(...Object.values(d.kinds)),top=Object.entries(d.kinds).filter(([,n])=>n===max);return top.length>1?'Mixed tendencies':RATING_LABELS[top[0][0]];};
 $('progressShotComparison').innerHTML=[['Decisions scored',data.tee.count,data.approach.count],['Average decision score',average(data.tee.score),average(data.approach.score)],['Estimated strokes lost per 100 decisions',cost(data.tee),cost(data.approach)],['Most common tendency',tendency(data.tee),tendency(data.approach)]].map(([label,tee,approach])=>`<tr><th scope="row">${label}</th><td>${tee}</td><td>${approach}</td></tr>`).join('');
 $('progressDifficultyRows').innerHTML=data.breakdown.filter(d=>d.count||d.courses.length).map(d=>`<tr><th scope="row">${d.difficulty==='unknown'?'Earlier unspecified difficulty':d.difficulty[0].toUpperCase()+d.difficulty.slice(1)}</th><td>${d.count}</td><td>${average(d.score)}</td><td>${cost(d)}</td><td>${d.courses.length?relative(d.courses.reduce((n,r)=>n+r.relative,0)/d.courses.length):'—'}</td></tr>`).join('')||'<tr><td colspan="5">No recorded decisions or completed rounds yet.</td></tr>';
 $('progressSettings').textContent=data.settings.length?`Shot settings included: ${data.settings.join(', ')}. Settings are saved with results; no profile selection is needed.`:'Your handicap or custom-shot setting will be saved with your results.';
 $('progressPilotNote').textContent=data.pilotCount?`${data.pilotCount} three-hole pilot ${data.pilotCount===1?'round is':'rounds are'} saved separately and excluded from the 18-hole average.`:'';
 $('progressPreviousNote').textContent=data.previousCount?`${data.previousCount} decisions under earlier scoring rules are retained separately.`:'';
 $('progressAssessmentRows').innerHTML=data.assessments.slice(-5).reverse().map(r=>`<li>${r.recovered?'Earlier round (recovered)':date(r.completedAt)} · ${average(r.decisions.reduce((n,d)=>n+d.score,0)/r.decisions.length)} · ${difficultyOf(r)} · ${shotSetting(r)}${r.model==='earlier-unrecorded'?' · earlier scoring rules not recorded':''}</li>`).join('')||'<li>Complete a ten-shot assessment to start this history.</li>';
 const recent=[...data.learning,...data.courses,...data.assessments,...data.pilots].sort((a,b)=>Date.parse(b.completedAt)-Date.parse(a.completedAt));
 $('progressRoundRows').innerHTML=recent.slice(0,12).map(r=>`<tr><td>${r.recovered?'Earlier round (recovered)':date(r.completedAt)}</td><td>${r.kind==='course'?(r.holes===18?'18-hole par-3':'3-hole pilot'):r.kind==='assessment'?'Assessment':'Learning round'}</td><td>${r.kind==='course'?relative(r.relative):average(r.decisions.reduce((n,d)=>n+d.score,0)/r.decisions.length)}</td><td>${difficultyOf(r)} · ${shotSetting(r)}</td></tr>`).join('')||'<tr><td colspan="4">Completed rounds will appear here.</td></tr>';
 $('progressRows').innerHTML=data.first.slice(-8).reverse().map(row=>`<tr><td>${escapeHTML(date(row.at))}</td><td>${row.type==='tee'?'Tee':'Approach'}</td><td>${row.score.toFixed(0)} / 100</td><td>${RATING_LABELS[row.kind]}</td></tr>`).join('');
 $('progressEmpty').textContent=data.count?'':'No scored decisions yet. Choose a target in practice or complete a round to begin.';
 $('progressStorage').textContent=progressStored&&roundHistoryStored?`Saved in this browser: up to 1,000 practice attempts and ${ROUND_HISTORY_LIMIT} completed rounds. Older rounds that were replaced before this update cannot be recovered. Clearing browser data removes history.`:'Local saving is unavailable for some history. Results from this visit may be lost when you close the page.';
}
function openProgress(){if(!prepareNavigation())return;roundView=false;$('roundScreen').hidden=true;leaveFullscreen();closeMenu();rememberCompletedRound(round);rememberCompletedRound(storedCourse());progressOpen=true;progressDifficulty='all';$('practiceScreen').hidden=true;$('progressScreen').hidden=false;renderProgress();updateLabels();$('progressScreen').scrollIntoView({behavior:'auto'});$('closeProgress').focus?.();}
function closeProgress(){progressOpen=false;$('progressScreen').hidden=true;$('practiceScreen').hidden=false;updateLabels();$('practiceScreen').scrollIntoView({behavior:'auto'});$('menuToggle').focus?.();}

let cachedScene,sceneKey;
function scene(){const key=state.scenario+':'+state.holeSeed+(isCourse()?':course':'');if(key!==sceneKey){cachedScene=generateScenario(SCENARIOS.find(s=>s.id===state.scenario),state.holeSeed);if(isCourse()){cachedScene.par=3;cachedScene.length=Math.round(Math.hypot(cachedScene.pin.x,cachedScene.pin.y));}sceneKey=key;}return cachedScene;}
function currentConditions(){if(tutorial||tutorialReturn)return{...CALM};const slot=round?.schedule[round.index];return slot?.conditions||conditionsFor(round?round.profile.difficulty||'easy':state.difficulty,state.holeSeed^Array.from(state.scenario).reduce((h,c)=>Math.imul(h,31)+c.charCodeAt(0),7)^0x6137);}
function basic(){return {...basicPattern(state.basicHandicap,scene(),state.basicLimits[state.basicHandicap]||DRIVER_LIMITS[state.basicHandicap]),aimMode:'carry',conditions:currentConditions()};}
function elevation(){return state.elevated?scene().elevationM:0;}
function landscape(){return LANDSCAPES[state.landscape];}
function num(v,a,b,fallback){return Number.isFinite(Number(v))?clamp(Number(v),a,b):fallback;}
try{const saved=JSON.parse(localStorage.getItem(storeKey));if(saved&&SCENARIOS.some(s=>s.id===saved.scenario)){state.scenario=saved.scenario;state.practiceMode=saved.practiceMode==='free'?'free':'round';if(typeof saved.encounter==='string'&&saved.encounter.length>0&&saved.encounter.length<100)state.encounter=saved.encounter;state.seed=num(saved.seed,1,2147483646,7142026);state.basicHandicap=['0','5','10','20'].includes(saved.basicHandicap)?saved.basicHandicap:'5';state.mode=saved.mode==='advanced'?'advanced':'basic';state.difficulty=['easy','medium','hard'].includes(saved.difficulty)?saved.difficulty:'easy';state.advanced=saved.advanced||null;state.memberBag=saved.memberBag||null;const savedCosts=saved.memberCosts||saved.advanced?.costs;state.memberCosts=savedCosts?.baseline===DEFAULT_COSTS.baseline?savedCosts:null;if(savedCosts&&savedCosts.baseline!==DEFAULT_COSTS.baseline)state.previousMemberCosts=savedCosts;else if(saved.previousMemberCosts)state.previousMemberCosts=saved.previousMemberCosts;state.practiceFilter=['tee','approach','mixed'].includes(saved.practiceFilter)?saved.practiceFilter:'mixed';state.recent=Array.isArray(saved.recent)?saved.recent.filter(id=>SCENARIOS.some(s=>s.id===id)).slice(-6):[];state.holeSeed=num(saved.holeSeed,0,2147483646,0);state.elevated=saved.elevated!==false;state.landscape=LANDSCAPES[saved.landscape]?saved.landscape:'woodland';for(const h of ['0','5','10','20'])if(saved.basicLimits?.[h])state.basicLimits[h]=num(saved.basicLimits[h],180,330,DRIVER_LIMITS[h]);}}catch{}
// Restore the chosen shot mode; legacy saves without a mode keep the standard profile.
state.pattern=basic();state.aim=fitTarget({x:0,y:scene().aimY},state.pattern);
const initialBag=defaultMemberBag(basic());
if(!state.memberBag&&state.advanced?.pattern){const old=initialBag.find(c=>c.club===state.advanced.club);if(old)Object.assign(old,state.advanced.pattern,{stock:state.advanced.pattern.carry+state.advanced.pattern.roll,club:old.club});}
state.memberBag=state.memberBag?cleanMemberBag(state.memberBag,basic()):cleanMemberBag(initialBag,basic());
if(state.mode==='advanced'){state.pattern=member();state.costs=memberCosts();state.aim=fitTarget({x:0,y:scene().aimY},state.pattern);}
state.recent=state.recent.length?state.recent:[state.scenario];
function member(){return{...basic(),customBag:effectiveBag(),shotType:scene().type};}
function memberCosts(){const out={...DEFAULT_COSTS};for(const el of document.querySelectorAll('[data-cost]'))out[el.dataset.cost]=num(state.memberCosts?.[el.dataset.cost],Number(el.min),Number(el.max),DEFAULT_COSTS[el.dataset.cost]);return out;}
function save(){if(tutorialReturn){try{localStorage.setItem(storeKey,JSON.stringify(tutorialReturn.state));localStorage.setItem(ROUND_KEY,JSON.stringify(tutorialReturn.round));}catch{}return;}rememberCompletedRound(round);if(round?.status==='active'&&!isCourse()&&!round.answers.length&&state.mode==='basic')round.profile=selectedPlayerProfile();try{localStorage.setItem(storeKey,JSON.stringify(state));localStorage.setItem(ROUND_KEY,JSON.stringify(round));if(isCourse()){localStorage.setItem(COURSE_KEY,JSON.stringify(round));courseStorageOK=true;}}catch{if(isCourse())courseStorageOK=false;}}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3500);}
function setSideTarget(x){
 const range=state.pattern.aimXRange||[-60,60],distance=state.pattern.carry;
 const side=clamp(x,Math.max(range[0],1-distance),Math.min(range[1],distance-1));
 state.aim={x:side,y:Math.sqrt(Math.max(1,distance*distance-side*side))};
}
function sided(x,unit='yd'){return Math.abs(x)<.01?'0 '+unit:`${Math.abs(x).toFixed(unit==='°'?1:0)}${unit==='°'?'°':' '+unit} ${x<0?'left':'right'}`;}
function syncTargetDistance(){state.aim=fitTarget(state.aim,state.pattern);let p=patternAtTarget(state.aim,state.pattern);const carry=clamp(p.carry,50,330);if(Math.abs(carry-p.carry)>.0001){state.aim=aimAtDistance(state.aim,carry+(p.aimMode==='carry'?0:p.roll),p.aimXRange);p=patternAtTarget(state.aim,p);}state.pattern=p;}
function depthRange(){const max=Math.min(scene().aimRange[1],reachLimit(state.pattern));return[Math.min(scene().aimRange[0],max),max];}
function chooseDepth(carry){if(isCourse()&&round.review)return;if(round?.kind==='assessment'&&roundRecorded())return;state.aim=aimAtDistance(state.aim,clamp(Math.round(carry),...depthRange()),state.pattern.aimXRange);hasAim=true;syncTargetDistance();updateControls();dirty();}
function updateControls(){
 syncTargetDistance();
 for(const el of document.querySelectorAll('[data-cost]'))el.value=state.costs[el.dataset.cost];
 $('aimX').min=(state.pattern.aimXRange||[-60,60])[0];$('aimX').max=(state.pattern.aimXRange||[-60,60])[1];$('aimX').value=state.aim.x;$('aimY').min=depthRange()[0];$('aimY').max=depthRange()[1];$('aimY').value=state.pattern.carry;
 $('basicHandicap').value=state.basicHandicap;
 $('driverLimit').value=state.basicLimits[state.basicHandicap]||DRIVER_LIMITS[state.basicHandicap];
 $('bagTable').innerHTML=trainingBag(basic()).map(c=>`<tr><td>${c.club}</td><td>${Math.round(c.stock)} yd</td><td>${c.roll} yd</td><td>${c.sdSide.toFixed(1)} / ${c.sdLong.toFixed(1)} yd</td></tr>`).join('');
 updateLabels();
}
function updateLabels(){
 const p=state.pattern,s=scene();
 const weather=p.conditions||CALM;$('difficulty').value=tutorialReturn?'easy':state.difficulty;$('difficulty').disabled=isCourse()||working||!!result||!!tutorialReturn||!!round?.answers.length||!!round?.current?.attempts.length;
 $('conditionsText').textContent=conditionsLabel(weather);$('conditionsBar').title=conditionsLabel(weather);$('conditionsCompact').innerHTML=`<strong>${weather.windX||weather.windY?Math.round(Math.hypot(weather.windX,weather.windY))+' mph':'Calm'}</strong><small>${weather.firmness==='soft'?'Soft':weather.firmness==='firm'?'Firm':'Normal'} ground</small>`;$('commitHint').hidden=!!result||working||isCourse()&&!!round.review||round?.kind==='assessment'&&roundRecorded();$('conditionsArrow').style.transform=`rotate(${Math.atan2(weather.windX,weather.windY)*180/Math.PI}deg)`;$('conditionsArrow').hidden=!weather.windX&&!weather.windY;$('conditionsBar').hidden=!!tutorialReturn;
 $('aimXOut').textContent=sided(state.aim.x);$('aimYOut').textContent=`${Math.round(p.carry)} yd`;$('rollEstimate').textContent=p.conditions?.difficulty&&p.conditions.difficulty!=='easy'?`${p.conditions.firmness==='firm'?'Firm · more roll':p.conditions.firmness==='soft'?'Soft · less roll':'Normal ground'}`:p.roll?'Roll estimated':'No roll modeled';$('aimY').setAttribute('aria-valuetext',`${Math.round(p.carry)} yards intended carry; rollout is uncertain`);
 $('rolloutKey').hidden=!hasAim&&!result;$('rolloutKey').textContent=p.conditions?.difficulty!=='easy'&&p.conditions?(result?(centerFlight(state.aim,p,s).roll<.25?'Land = finish':'○ Landing · ● Finish'):'Roll depends on ground'):p.roll<.25?'Carry = total':result?(centerFlight(state.aim,p,s).roll<.25?'Land = finish':'○ Landing · ● Finish'):'◎ Carry · ○ Finish';$('rolloutKey').title=result?'White markers show the center flight landing and finish, with water contact stopping rollout.':'Planned straight-line finish after rollout, before curve and random misses. Zoom in for a closer view.';
 $('aimBadge').textContent=hasAim?`◎ ${result?'Committed carry':'Your carry'} · ${Math.round(p.carry)} yd · ${sided(state.aim.x)}`:'◎ Pick direction, then depth';
 if(round?.kind==='assessment'&&roundRecorded())$('aimBadge').textContent='◎ Decision recorded · next scenario when ready';
 $('sampleStatus').textContent=`4,000 shots · seed ${state.seed}`;
 $('cloudBadge').textContent=result?'Outlines: carry core · dots: final positions':phase==='assessment-review'?`${traceShots.length} example flights · report at the end`:phase==='shooting'?`${traceShots.length} example flights · colored by outcome`:phase==='zooming'?'Zooming to your landing area…':'Pattern hidden until you commit';
 $('shotTypeLabel').textContent=isCourse()?'TEE':s.type==='tee'?'TEE':'APPROACH';$('appRoot').classList.toggle('calm-conditions',weather.difficulty==='easy');
 $('holeMeta').textContent=`PAR ${s.par} · ${s.secondShot?'SECOND SHOT · ':''}${s.length} YD${s.type==='approach'?' TO FLAG':''}`;
 $('scenarioDiagnostics').textContent=`Scenario ${s.id} · layout seed ${state.holeSeed} · shot seed ${state.seed} · ${s.generatorVersion||'authored baseline'} · ${s.woodlandVersion||''}`;
 $('greenYardageList').hidden=!!result||isCourse()&&!!round.review;$('greenYardageList').innerHTML=greenYardages(s).map(item=>`<span><small>${item.label}</small><strong>${Math.round(item.distance)} yd</strong></span>`).join('');
 $('holeName').textContent=s.name;$('environmentName').textContent=landscape().name;$('scenarioBrief').textContent=s.brief;$('sceneChip').textContent=s.tag;const woods=s.woods?.filter(w=>w.recoveryMultiplier>1);if(woods?.length)$('scenarioBrief').textContent+=' '+(woods[0].side<0?'Left':'Right')+' woods are denser and closer; the other side leaves more recovery room.';
 for(const [id,on] of [['povBtn',state.view==='pov'],['mapBtn',state.view==='map'],['teeTab',state.practiceFilter==='tee'],['approachTab',state.practiceFilter==='approach'],['mixedTab',state.practiceFilter==='mixed']]){$(id).classList.toggle('active',on);$(id).setAttribute('aria-pressed',on);}
 for(const id of ['teeTab','approachTab','mixedTab','practiceType'])$(id).disabled=working;
 $('difficultyField').hidden=isCourse();$('practiceTypeField').hidden=isCourse();$('practiceType').value=state.practiceFilter;$('practiceType').disabled=working;
 const advanced=state.mode==='advanced';
 $('basicBar').hidden=false;$('handicapField').hidden=advanced;$('aimDepthWrap').hidden=false;
 $('shotModeNote').textContent=advanced?'My shot · '+flightDescription(p):'Straight flight · automatic club for your depth';
 $('costEditor').hidden=!advanced;
 $('legend').hidden=!result;$('reviewViews').hidden=!result;$('tryAgain').hidden=!result;$('retryThisHole').hidden=!result;
 $('traceLegend').hidden=!result&&phase!=='shooting'&&phase!=='zooming';
 $('animationStatus').hidden=!working||phase==='course-hold';
 $('animationStatus').textContent=round?.kind==='assessment'&&phase==='shooting'?'Watching example flights · your report comes after all ten decisions.':phase==='shooting'?`Following ${traceShots.length} example shots. Color shows the final lie; percentages will use all 4,000.`:phase==='zooming'?'Now compare your landing pattern with the best sampled aim.':'Calculating 4,000 outcomes…';
 $('newShots').hidden=true;$('sampleStatus').hidden=!result;
 $('singleShot').hidden=true;$('useBest').hidden=true;
 $('simulate').hidden=!!result;$('simulate').disabled=working||!hasAim;
 if(!working)$('simulate').innerHTML=hasAim?'Commit & shoot <span>↗</span>':'Pick a target first <span>↗</span>';
 const facts=targetFacts(state.aim,p,s);
 $('targetDistance').textContent=`${Math.round(p.carry)} yd intended carry`; $('targetClub').textContent=p.conditions?.difficulty&&p.conditions.difficulty!=='easy'?`${p.club} · ${Math.round(p.carry)} intended carry · ${p.conditions.firmness} ground`:`${p.club}${p.customBag?'':' estimate'} · ${Math.round(p.carry)} carry + ${Math.round(p.roll)} roll`;
 $('targetContext').textContent=`${Math.round(facts.toPin)} yd from carry target to pin${facts.crossings.length?' · Along this aim line: '+facts.crossings.join('; '):''}`;
 $('targetReadout').hidden=!!result;
 $('mobileActionTarget').textContent=hasAim?`${Math.round(p.carry)} yd carry · ${p.club}`:'Choose direction and carry';
 $('mobileActionTarget').hidden=!!result||working;
 $('mobileHazards').hidden=true;$('mobileCourseDistances').hidden=!!result||working||isCourse()&&!!round.review;
 $('appRoot').classList.toggle('mobile-practice-actions',!editorDraft&&!progressOpen&&!roundView);
 $('retryGuide').hidden=!!result||!retryValid();$('retryGuide').textContent=retryValid()?`Guided retry · ${retryHint} Adjust your original target, then commit. Same hole, profile and 4,000-shot sample; patterns hidden again.`:'';
 $('stockShot').textContent=p.autoBag?`${p.customBag?'My ':''}${p.club}${p.customBag?'':' estimate'} · ${Math.round(p.carry)} yd carry · ${Math.round(reachLimit(p))} yd carry limit`:`Intended carry: ${Math.round(p.carry)} yd · custom`;
 $('cameraBadge').textContent=phase==='shooting'?'SHOT TRACERS':phase==='zooming'?'ZOOMING TO LANDING AREA':state.view==='map'?'LANDING-AREA ZOOM':`${aimZoom?'2× TARGET ZOOM · ':''}EYE LEVEL · ${elevation()} M ABOVE LANDING`;
 const zoomAllowed=!working&&!result&&!editorDraft&&!progressOpen;
 $('aimZoomToggle').hidden=!!result;$('aimZoomToggle').disabled=!zoomAllowed;$('aimZoomToggle').textContent=aimZoom?'Zoom out ⊖':'Zoom in ⊕';$('aimZoomToggle').setAttribute('aria-pressed',!!aimZoom);$('aimZoomToggle').setAttribute('data-mobile-label',aimZoom?'Zoom−':'Zoom+');
 updateCourseFrame(aimZoom&&zoomAllowed?aimZoom:{x:0,y:0,width:960,height:580});
 $('terrainToggle').hidden=!!result;$('terrainToggle').textContent=state.elevated?'Elevated view':'Flat view';$('terrainToggle').setAttribute('aria-pressed',state.elevated);$('terrainToggle').disabled=working||!!result;$('terrainToggle').setAttribute('data-mobile-label','View');$('driverLimit').disabled=working||!!result;$('driverLimitReset').disabled=working||!!result;
 $('aimHelp').textContent=result?'Your target is locked. Compare the patterns, then take the next shot or retry this hole.':'Choose left/right on the course. Double-tap or double-click to zoom in / out. Set Intended carry below the course, or on the right in full screen. Sliders work too. The pattern stays hidden until you commit.';
 for(const id of ['basicMode','advancedMode','courseMenu','editShotQuick'])$(id).disabled=working;const savedCourse=isCourse()?round:storedCourse();$('courseMenu').innerHTML=savedCourse?.status==='active'?`Resume par-3 course <span>${savedCourse.schedule.length} holes · score saved</span>`:'Par-3 course <span>18 holes · simulated finish</span>';
 $('menuToggle').disabled=working;$('progressMenu').disabled=working;
 $('aimControls').hidden=!!result;$('scenarioBriefWrap').hidden=!!result;$('appRoot').classList.toggle('review-mode',!!result);
 for(const [id,on] of [['stepChoose',!hasAim],['stepCommit',hasAim&&!result],['stepCompare',!!result]])$(id).classList.toggle('current',on);
 for(const id of ['basicHandicap','aimX','aimY'])$(id).disabled=working||!!result;
 for(const el of document.querySelectorAll('[data-cost]'))el.disabled=working||!!result;
 updateFullscreenControls();
 updateRoundControls();
 updateTutorialControls();updateCourseControls();updateIntroductionControls();
 $('tryAgain').disabled=working;$('retryThisHole').disabled=working;$('useBest').disabled=working;
}
async function openIntroduction(){
 if(working)return;const fromHome=homeOpen||!!tutorialReturn?.homeOpen;hideHome();if(introduction)closeIntroduction('skipped');else if(tutorialReturn)closeLessons();if(editorDraft)prepareNavigation();leaveFullscreen();closeMenu();
 tutorialReturn={homeOpen,state:structuredClone(state),round:structuredClone(round),roundView,progressOpen,result,best,oneShot,phase,hasAim,traceShots,landingCamera,retryBaseline,retryHint,progressMessage};
 hideHome();tutorialReturn.homeOpen=fromHome;$('introductionSkip').textContent=fromHome?'Back to home':'Back to practice';introduction={step:-1,selected:false,revealed:false,prepared:null};
 for(const id of ['practiceScreen','roundScreen','progressScreen','lessonsScreen'])$(id).hidden=true;
 $('introductionScreen').hidden=false;updateLabels();$('introductionTitle').focus?.();
 working=true;updateIntroductionControls();
 try{introduction.prepared=await prepareIntroduction(()=>wait(0));}catch(error){console.error(error);$('introductionTask').textContent='Could not prepare this example. Return to practice and try again.';}
 finally{working=false;updateIntroductionControls();}
}
function closeIntroduction(status='skipped'){
 if(working||!introduction)return;if(status==='completed'){introductionSeen=true;try{localStorage.setItem(INTRO_KEY,JSON.stringify({version:INTRO_VERSION,status}));introductionSaved=true;}catch{introductionSaved=false;}}
 introduction=null;$('introductionScreen').hidden=true;closeLessons();if(!introductionSaved)toast('Introduction finished for this visit. Browser saving is unavailable.');
}
function updateIntroductionControls(){
 $('homeIntroductionRecommended').hidden=!homeOpen||introductionSeen;$('introductionMenu').disabled=working;$('introductionStart').hidden=true;$('introductionScreen').hidden=!introduction;
 if(!introduction)return;const i=introduction.step,step=i<0?INTRO_PURPOSE:INTRO_STEPS[i];
 $('introductionStep').textContent=`Introduction · ${i+2} / ${INTRO_STEPS.length+1}`;$('introductionTitle').textContent=step.title;$('introductionText').textContent=step.text;
 const t=introduction.prepared?.targets[Math.min(i,2)];
 $('introductionTask').textContent=i<0?'Choose Next to explore three target choices on the same hole.':!t?'Preparing your fixed example…':i<3?(introduction.revealed?`Pattern revealed: ${Math.round((1-t.result.counts.green/t.result.n)*100)}% finished off the green. ${i===1?'The target leaves about '+Math.round(Math.hypot(t.aim.x-introduction.prepared.scene.pin.x,t.aim.y-introduction.prepared.scene.pin.y))+' yd to the flag. ':''}Choose Next to continue.`:introduction.selected?'Target selected. Choose Show shot pattern.':'Tap the blue target on the hole, or choose Select highlighted target below.'):'Choose Next to continue.';
 $('introductionSelect').hidden=i<0||i>=3||introduction.revealed;$('introductionSelect').disabled=working||!t;
 $('introductionReveal').hidden=i<0||i>=3||introduction.revealed;$('introductionReveal').disabled=working||!introduction.selected;
 $('introductionNext').hidden=i===INTRO_STEPS.length-1;$('introductionNext').disabled=working||i>=0&&i<3&&!introduction.revealed;
 $('introductionBack').hidden=i<0;$('introductionBack').disabled=working;$('introductionSkip').disabled=working;
 for(const id of ['introductionFinish','introductionRound','introductionLessons']){$(id).hidden=i!==INTRO_STEPS.length-1;$(id).disabled=working;}
 $('introductionDiagram').hidden=i>=0&&!t;if(i<0||t)$('introductionDiagram').innerHTML=introductionGraphic(introduction.prepared,i,i>=3||introduction.revealed);
 $('introductionSelection').textContent=i<0?'Learn what matters. Practise the choice. Build the habit.':i===7?(introductionSaved?'Introduction complete · saved in this browser. Replay any time from Menu.':'Introduction complete for this visit · browser saving is unavailable.'):t&&introduction.selected?`Selected: ${Math.round(t.pattern.carry)} yd intended carry`:'Fixed tucked-flag example · 5-handicap profile · calm conditions';
}
function selectIntroductionTarget(){if(working||!introduction?.prepared||(introduction.step<0||introduction.step>=3)||introduction.revealed)return;introduction.selected=true;updateIntroductionControls();}
$('introductionStart').addEventListener('click',openIntroduction);
$('introductionMenu').addEventListener('click',openIntroduction);
$('introductionSelect').addEventListener('click',selectIntroductionTarget);
$('introductionDiagram').addEventListener('click',e=>{if(e.target.closest?.('[data-intro-target]'))selectIntroductionTarget();});
$('introductionDiagram').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.closest?.('[data-intro-target]')){e.preventDefault();selectIntroductionTarget();}});
$('introductionReveal').addEventListener('click',()=>{if(working||!introduction?.selected)return;introduction.revealed=true;updateIntroductionControls();});
function changeIntroductionStep(delta){if(working||!introduction||delta>0&&introduction.step>=0&&introduction.step<3&&!introduction.revealed)return;introduction.step=Math.max(-1,Math.min(INTRO_STEPS.length-1,introduction.step+delta));introduction.selected=false;introduction.revealed=false;if(introduction.step===INTRO_STEPS.length-1){introductionSeen=true;try{localStorage.setItem(INTRO_KEY,JSON.stringify({version:INTRO_VERSION,status:'completed'}));introductionSaved=true;}catch{introductionSaved=false;}}updateIntroductionControls();$('introductionScreen').scrollIntoView({behavior:'auto'});$('introductionTitle').focus?.();}
$('introductionNext').addEventListener('click',()=>changeIntroductionStep(1));
$('introductionBack').addEventListener('click',()=>changeIntroductionStep(-1));
$('introductionSkip').addEventListener('click',()=>closeIntroduction('skipped'));
$('introductionFinish').addEventListener('click',()=>{if(introduction?.step===INTRO_STEPS.length-1)closeIntroduction('completed');});
$('introductionRound').addEventListener('click',()=>{if(introduction?.step!==INTRO_STEPS.length-1)return;closeIntroduction('completed');startRound('practice');});
$('introductionLessons').addEventListener('click',()=>{if(introduction?.step!==INTRO_STEPS.length-1)return;closeIntroduction('completed');openLessons();});
function openLessons(){
 if(working)return;const fromHome=homeOpen||!!tutorialReturn?.homeOpen;hideHome();if(introduction)closeIntroduction('skipped');if(editorDraft)prepareNavigation(false);
 if(!tutorialReturn)tutorialReturn={homeOpen,state:structuredClone(state),round:structuredClone(round),roundView,progressOpen,result,best,oneShot,phase,hasAim,traceShots,landingCamera,retryBaseline,retryHint,progressMessage};
 hideHome();tutorialReturn.homeOpen=fromHome;$('closeLessons').textContent=fromHome?'Back to home':'Back to practice';leaveFullscreen();closeMenu();tutorial=null;lessonScreenOpen=true;$('tutorialCard').hidden=true;$('practiceScreen').hidden=true;$('roundScreen').hidden=true;$('progressScreen').hidden=true;$('lessonsScreen').hidden=false;$('lessonCatalog').hidden=false;$('tutorialRecap').hidden=true;
 CURRICULUM.forEach((lesson,i)=>{$('lessonStatus'+(i+1)).textContent=lessonCompleted.includes(lesson.id)?'Completed · repeat any time':'Not completed';$('lessonStart'+(i+1)).textContent=lessonCompleted.includes(lesson.id)?'Repeat lesson':'Start lesson';});
 $('lessonStorage').textContent=lessonStorageOK?'Completion is saved in this browser. Lessons use selected examples, not random holes.':'Completion saving is unavailable; lessons still work for this visit.';
 updateLabels();$('lessonsScreen').scrollIntoView({behavior:'auto'});$('closeLessons').focus?.();
}
function closeLessons(){
 if(working)return;leaveFullscreen();const previous=tutorialReturn;tutorial=null;tutorialReturn=null;lessonScreenOpen=false;$('lessonsScreen').hidden=true;$('tutorialCard').hidden=true;
 if(previous){state=previous.state;round=previous.round;roundView=previous.roundView;progressOpen=previous.progressOpen;result=previous.result;best=previous.best;oneShot=previous.oneShot;phase=previous.phase;hasAim=previous.hasAim;traceShots=previous.traceShots;landingCamera=previous.landingCamera;retryBaseline=previous.retryBaseline;retryHint=previous.retryHint;progressMessage=previous.progressMessage;sceneKey=null;resetAimZoom();}
 homeOpen=previous?.homeOpen||false;$('homeScreen').hidden=!homeOpen;$('practiceScreen').hidden=homeOpen||roundView||progressOpen;$('roundScreen').hidden=!roundView;$('progressScreen').hidden=!progressOpen;$('results').hidden=!result;updateControls();if(result)showResult();else drawCourse();save();$('menuToggle').focus?.();
}
async function startTutorial(id){
 if(working)return;const definition=lessonById(id);if(!definition)return;if(!tutorialReturn)openLessons();
 round=null;roundView=false;progressOpen=false;lessonScreenOpen=false;state.mode='basic';state.practiceMode='free';state.basicHandicap=LESSON_PROFILE.handicap;state.basicLimits[LESSON_PROFILE.handicap]=LESSON_PROFILE.limit;state.costs={...DEFAULT_COSTS};
 tutorial={id,stage:'intro',index:0,collapsed:false,guide:null,guidedAnswer:null};$('lessonsScreen').hidden=true;$('practiceScreen').hidden=false;await loadTutorialFixture();
}
async function loadTutorialFixture(){
 const definition=lessonById(tutorial.id),fixture=lessonFixture(definition);resetAimZoom();retryBaseline=null;retryHint='';tutorial.guide=null;tutorial.error=false;tutorial.collapsed=immersive;
 state.scenario=fixture.id;state.holeSeed=fixture.seed;state.seed=fixture.drawSeed;state.landscape='woodland';state.encounter=`lesson-${tutorial.id}-${tutorial.stage}`;state.pattern=basic();state.aim=fitTarget({x:0,y:scene().aimY},state.pattern);hasAim=false;dirty();
 working=true;updateLabels();
 try{const key=`${fixture.id}:${fixture.seed}:${fixture.drawSeed}`;let prepared=tutorialCache.get(key);
  if(!prepared){const s=scene(),p={...state.pattern},zs=samples(4000,fixture.drawSeed),referenceAim=fitTarget(definition.reference||(s.type==='tee'?{x:0,y:250}:s.pin),p),reference=evaluate(referenceAim,patternAtTarget(referenceAim,p),s,DEFAULT_COSTS,zs);
   prepared={...await optimizeTargets(referenceAim,p,s,DEFAULT_COSTS,zs,()=>wait(0)),reference};tutorialCache.set(key,prepared);}
  if(!Number.isFinite(prepared.result.expected))throw new Error('No usable lesson target');tutorial.guide=prepared;
 }catch(error){console.error(error);tutorial.error=true;toast('Could not prepare this lesson. Leave it and try again.');}
 finally{working=false;updateControls();drawCourse();$('tutorialCard').scrollIntoView({behavior:'auto'});}
}
function tutorialAnswer(){return{expected:result.expected,regret:Math.max(0,result.expected-best.result.expected),kind:decisionFeedback(state.aim,state.pattern,result,best,scene()).kind};}
async function advanceTutorial(){
 if(working||!tutorial?.guide)return;const definition=lessonById(tutorial.id);
 if(tutorial.stage==='intro'){if(tutorial.index<definition.intro.length-1){tutorial.index++;updateLabels();}else{tutorial.stage='guided';tutorial.collapsed=immersive;hasAim=false;dirty();}}
 else if(tutorial.stage==='guided'&&result){tutorial.guidedAnswer=tutorialAnswer();finishTutorial();}
}
async function backTutorial(){
 if(working||!tutorial)return;
 if(tutorial.stage==='intro'){tutorial.index=Math.max(0,tutorial.index-1);updateLabels();}
 else if(tutorial.stage==='guided'){leaveFullscreen();tutorial.collapsed=false;tutorial.stage='intro';tutorial.index=lessonById(tutorial.id).intro.length-1;hasAim=false;dirty();}
}
function finishTutorial(){
 leaveFullscreen();const definition=lessonById(tutorial.id);lessonCompleted=[...new Set([...lessonCompleted,tutorial.id])];
 try{localStorage.setItem(LESSON_KEY,JSON.stringify({version:CURRICULUM_VERSION,completed:lessonCompleted}));lessonStorageOK=true;}catch{lessonStorageOK=false;}
 $('lessonStorage').textContent=lessonStorageOK?'Completion is saved in this browser.':'Completed for this visit, but browser saving is unavailable.';
 lessonScreenOpen=true;$('practiceScreen').hidden=true;$('lessonsScreen').hidden=false;$('lessonCatalog').hidden=true;$('tutorialRecap').hidden=false;
 $('tutorialRecapTitle').textContent='Lesson complete: '+definition.title;
 $('tutorialRecapText').textContent='You followed the target and saw how its whole shot pattern handled this hole. Keep this idea in mind when you play a learning round or practice on your own.';
 $('tutorialRecapPrinciple').textContent='Remember: '+definition.principle;$('tutorialRepeat').dataset.lesson=tutorial.id;$('tutorialCard').hidden=true;updateLabels();$('lessonsScreen').scrollIntoView({behavior:'auto'});$('tutorialCatalog').focus?.();
}
function updateTutorialControls(){
 for(const id of ['practiceRoundMenu','assessmentMenu','freePracticeMenu'])$(id).disabled=working;$('lessonsMenu').disabled=working;
 $('appRoot').classList.toggle('tutorial-mode',!!tutorial&&!lessonScreenOpen);
 $('tutorialCard').hidden=!tutorial||lessonScreenOpen;
 $('appRoot').classList.toggle('tutorial-explaining',!!tutorial&&!lessonScreenOpen&&tutorial.stage==='intro');
 if(tutorialReturn){for(const id of ['practiceRoundMenu','assessmentMenu','freePracticeMenu','advancedMode','basicMode','editShotQuick','progressMenu'])$(id).disabled=working;}
 if(!tutorial||lessonScreenOpen)return;
 const definition=lessonById(tutorial.id),intro=tutorial.stage==='intro',guided=tutorial.stage==='guided',exposure=definition.id==='green'?'bunker':'water';
 for(const id of ['basicHandicap','driverLimit','driverLimitReset','teeTab','approachTab','mixedTab','practiceType'])$(id).disabled=true;
 if(intro||!tutorial.guide){for(const id of ['aimX','aimY','simulate'])$(id).disabled=true;}
 $('tutorialBody').hidden=tutorial.collapsed;$('tutorialCollapse').textContent=tutorial.collapsed?'Show instructions':'Hide instructions';$('tutorialCollapse').setAttribute('aria-expanded',!tutorial.collapsed);
 $('tutorialStep').textContent=`${definition.title} · ${intro?`Explain ${tutorial.index+1} / ${definition.intro.length}`:'Guided practice'}`;
 $('tutorialTitle').textContent=intro?definition.intro[tutorial.index].title:(result?'Success: you followed the target idea':'Follow the highlighted target');
 $('tutorialIllustration').hidden=!intro;if(intro)$('tutorialIllustration').innerHTML=tutorialGraphic(definition.intro[tutorial.index].topic,scene(),tutorial.guide?.aim);
 $('tutorialText').textContent=intro?definition.intro[tutorial.index].text:definition.idea;
 $('tutorialTarget').textContent=guided&&tutorial.guide?`Set carry to ${Math.round(tutorial.guide.pattern.carry)} yd, then aim ${sided(tutorial.guide.aim.x)}. Use the highlighted area as your guide.`:'';
 $('tutorialMessage').textContent=tutorial.error?'Could not prepare this lesson. Leave it and try again.':!tutorial.guide?'Preparing this fixed example…':guided&&result?`You followed the target strategy. Some simulated shots can still find trouble; success is about the choice, not a guaranteed safe ball. ${exposure==='bunker'?'Bunker':'Water'} exposure for your target: ${(result.counts[exposure]/result.n*100).toFixed(1)}%, compared with ${(tutorial.guide.reference.counts[exposure]/tutorial.guide.reference.n*100).toFixed(1)}% at the example’s ${scene().type==='tee'?'longer target':'flag target'}.`:guided&&hasAim?(nearLessonTarget(state.aim,tutorial.guide.aim)?'You are in the suggested area. Commit to try it.':'Move closer to the highlighted target, using both aim and carry controls.') :'';
 if(guided&&result&&definition.id==='distance')$('tutorialMessage').textContent=`The shorter 190 yd choice is safer, but leaves a longer approach. Your longer choice trades a little safety for an easier next shot. Here it saves about ${Math.max(0,tutorial.guide.reference.expected-result.expected).toFixed(2)} modeled strokes per shot (${Math.round(Math.max(0,tutorial.guide.reference.expected-result.expected)*100)} per 100 shots). This is an example, not a promise about your score.`;
 $('tutorialNext').disabled=working||!tutorial.guide||(!intro&&!result);$('tutorialNext').textContent=intro?(tutorial.index===definition.intro.length-1?'Try the guided example':'Next'):'Finish lesson';
 $('tutorialBack').disabled=working||intro&&tutorial.index===0;$('tutorialExit').disabled=working;$('tutorialCollapse').disabled=working;
 if(guided&&result){$('results').hidden=true;$('feedbackToggle').hidden=true;}
 if(result){$('tryAgain').hidden=false;$('tryAgain').innerHTML='Finish lesson';}
 $('retryThisHole').hidden=true;$('newShots').hidden=true;
}
$('lessonsMenu').addEventListener('click',openLessons);$('closeLessons').addEventListener('click',closeLessons);
CURRICULUM.forEach((lesson,i)=>$('lessonStart'+(i+1)).addEventListener('click',()=>startTutorial(lesson.id)));
$('tutorialNext').addEventListener('click',advanceTutorial);$('tutorialBack').addEventListener('click',backTutorial);$('tutorialExit').addEventListener('click',openLessons);
$('tutorialCollapse').addEventListener('click',()=>{if(tutorial&&!working){tutorial.collapsed=!tutorial.collapsed;updateLabels();}});
$('tutorialReview').addEventListener('click',()=>{if(!tutorial||!result||working)return;lessonScreenOpen=false;$('lessonsScreen').hidden=true;$('practiceScreen').hidden=false;updateLabels();drawCourse();$('results').hidden=false;$('decisionLesson').hidden=false;$('decisionVerdict').setAttribute('aria-expanded',true);$('results').scrollIntoView({behavior:'auto'});});
$('tutorialCatalog').addEventListener('click',openLessons);$('tutorialRepeat').addEventListener('click',()=>startTutorial($('tutorialRepeat').dataset.lesson));

function courseCamera(){const shot=round.review.selected;return reviewCamera(shot,shot,state.pattern,{points:[shot,scene().pin,{x:scene().green.x-scene().green.rx,y:scene().green.y-scene().green.ry},{x:scene().green.x+scene().green.rx,y:scene().green.y+scene().green.ry}]});}
function restoreCourseReview(){state.aim={...round.review.aim};state.pattern={...round.review.pattern};hasAim=true;phase='course-review';state.view='map';landingCamera=courseCamera();result=null;best=null;updateLabels();drawCourse();}
function courseFinishText(review){
 if(review.retee)return `Out of bounds: your tee shot counts, plus one penalty stroke. Play again from the tee. Your next shot will be stroke ${review.strokes+1}.`;
 const f=review.finish,parts=[];if(f.offGreen)parts.push(`${f.offGreen} simulated ${f.kind==='bunker'?'bunker':f.kind==='trees'?'recovery':f.distance>60?'approach':'chip / pitch'} ${f.offGreen===1?'shot':'shots'}`);if(f.putts)parts.push(`${f.putts} ${f.putts===1?'putt':'putts'}`);if(!f.putts)parts.push('holed without putting');
 return `${NAMES[review.selected.kind]} finish. ${review.selected.kind==='water'?'One penalty stroke, then the example drop. ':''}${parts.join(' and ')}. ${round.current.attempts.length>1?`${round.current.attempts.length} tee shots and ${round.current.attempts.filter(a=>a.selected.kind==='ob').length} OB penalties are included.`:''}`;
}
function updateCourseControls(){
 const on=isCourse();$('courseBar').hidden=!on;$('courseOutcome').hidden=!on||!round?.review||working||roundView||progressOpen||lessonScreenOpen;$('appRoot').classList.toggle('course-mode',on);$('appRoot').classList.toggle('course-selecting',on&&phase==='course-selecting');$('appRoot').classList.toggle('course-ball-review',on&&!!round.review&&!working);
 if(!on)return;const total=courseTotal(round),r=round.review;
 $('courseStatus').textContent=`${r&&!r.retee?'Hole complete':`Next stroke ${round.current.strokes+1}`} · ${round.profile.difficulty||'easy'} difficulty${round.profile.shotMode==='custom'?' · Custom shot':''}${courseStorageOK?'':' · Saving unavailable'}`;
 $('courseHole').textContent=`Hole ${round.index+1} / ${round.schedule.length}`;$('courseScoreToPar').textContent=scoreToPar(total.relative);$('courseScoredHoles').textContent=total.holes?`Through ${total.holes} ${total.holes===1?'hole':'holes'}`:'No holes scored yet';
 $('roundStatus').hidden=true;$('results').hidden=true;for(const id of ['basicHandicap','driverLimit','driverLimitReset','teeTab','approachTab','mixedTab','practiceType'])$(id).disabled=true;
 $('practiceIntro').textContent=`Play ${round.schedule.length} par-3 holes. One shot is selected from your pattern, then the remaining shots are simulated. Target quality and hole score stay separate.`;
 for(const id of ['tryAgain','retryThisHole','newShots','roundContinue'])$(id).hidden=true;
 if(r)$('cameraBadge').textContent=working?'SELECTING YOUR SHOT':'BIRD’S-EYE · YOUR SELECTED SHOT';$('simulate').hidden=!!r;$('simulate').disabled=working||!hasAim||!!r;$('aimControls').hidden=!!r;for(const id of ['aimX','aimY'])$(id).disabled=working||!!r;$('reviewViews').hidden=true;
 if(r){$('cloudBadge').textContent=phase==='course-pattern'?'Your whole pattern':phase==='course-selecting'?'Highlighted ball: your selected outcome':'Selected ball only · simulated finish';$('courseOutcomeTitle').textContent=courseFinishHeadline(r); $('courseFinish').textContent=courseFinishText(r);$('courseDecision').textContent=`Target quality: ${r.decision.score} / 100 · ${r.decision.label}.`;$('courseDecisionReason').textContent=r.decision.reason;$('courseLearning').textContent=r.decision.action+' '+conditionsFeedback(r.aim,r.pattern)+' A lucky or unlucky ball does not change the quality of your target.';$('courseRunning').textContent=`Round total: ${scoreToPar(total.relative)}${total.holes?` through ${total.holes} completed ${total.holes===1?'hole':'holes'}`:' · no completed holes yet'}.`;$('courseNext').textContent=r.retee?`Re-tee · shot ${r.strokes+1}`:round.status==='complete'?'View scorecard':'Next hole';$('courseNext').disabled=working;}
 for(const id of ['courseScorecard','courseQuit','courseRestart','courseQuitReport','courseReplay'])$(id).disabled=working;$('courseMenu').disabled=working;$('feedbackToggle').hidden=!immersive||!r||working;
}
function showCourseReport(){leaveFullscreen();closeMenu();roundView=true;$('practiceScreen').hidden=true;$('roundScreen').hidden=false;$('courseReport').hidden=false;$('roundReport').hidden=true;$('startAssessment').hidden=true;$('startLearningRound').hidden=true;$('closeRound').hidden=false;const total=courseTotal(round);$('roundTitle').textContent=round.status==='complete'?'Your par-3 scorecard':'Par-3 scorecard';$('roundDescription').textContent=`${landscape().name} · ${round.schedule.length} holes · par ${round.schedule.length*3}. ${total.holes} completed. ${round.profile.shotMode==='custom'?'Custom profile saved at round start. ':''}${round.profile.difficulty||'easy'} conditions. ${COURSE_FINISH_LABEL}; not a personal scoring prediction.`;$('courseTotal').textContent=`${scoreToPar(total.relative)}${total.holes?` through ${total.holes} ${total.holes===1?'hole':'holes'}`:' · no holes scored yet'}`;const row=(label,values,totalValue,start=0)=>`<tr><th scope="row">${label}</th>${values.map((v,i)=>`<td data-hole="${start+i+1}">${v}</td>`).join('')}<td class="scorecard-total">${totalValue}</td></tr>`;
 const answers=round.schedule.map((_,i)=>round.answers.find(a=>a.index===i)),yardages=round.schedule.map(slot=>{const hole=generateScenario(SCENARIOS.find(s=>s.id===slot.id),slot.holeSeed);return Math.round(Math.hypot(hole.pin.x,hole.pin.y));});
 const nine=(start,headId,bodyId)=>{const slots=round.schedule.slice(start,start+9),scores=answers.slice(start,start+9),yards=yardages.slice(start,start+9),done=scores.filter(Boolean),strokes=done.reduce((n,a)=>n+a.holeScore,0);$(headId).innerHTML=`<tr><th scope="col">Hole</th>${slots.map((_,i)=>`<th scope="col">${start+i+1}</th>`).join('')}<th scope="col">${round.schedule.length>9?(start?'In':'Out'):'Total'}</th></tr>`;$(bodyId).innerHTML=row('Yards',yards,yards.reduce((a,b)=>a+b,0),start)+row('Par',slots.map(()=>3),slots.length*3,start)+row('Score',scores.map(a=>a?`<span class="score-mark ${a.holeScore<3?'under-par':a.holeScore>3?'over-par':''}" title="${escapeHTML(scoreName(a.holeScore))}">${a.holeScore}</span>`:'—'),done.length?strokes:'—',start)+row('To par',scores.map(a=>a?scoreToPar(a.holeScore-3):'—'),scoreToPar(strokes-done.length*3),start);};
 nine(0,'courseScoreHead','courseScoreRows');$('courseBackNine').hidden=round.schedule.length<=9;if(round.schedule.length>9)nine(9,'courseBackScoreHead','courseBackScoreRows');$('courseScoreSummary').textContent=`${total.strokes} strokes · ${scoreToPar(total.relative)} through ${total.holes} completed holes · full round par ${round.schedule.length*3}`;
 $('courseDecisionRows').innerHTML=round.answers.map(a=>`<li>Hole ${a.index+1}: ${a.score} / 100 · ${RATING_LABELS[a.kind]}</li>`).join('');$('courseReplay').hidden=false;$('courseReplay').textContent='Restart round';$('closeRound').textContent=round.status==='complete'?'Back to practice':'Back to hole';updateLabels();save();$('roundScreen').scrollIntoView({behavior:'auto'});}
$('courseNext').addEventListener('click',()=>{if(working||!isCourse()||!round.review)return;if(round.status==='complete'){showCourseReport();return;}advanceCourse(round);hasAim=false;dirty();loadRoundSlot();});
function quitCourse(){
 if(working||!isCourse())return;let cleared=true;try{localStorage.setItem(COURSE_KEY,'null');}catch{cleared=false;}
 leaveFullscreen();round=null;sceneKey=null;setMode(state.mode,true);toast(cleared?'Round ended. You are back in practice.':'Round ended for this visit. Browser saving is unavailable.');
}
for(const id of ['courseQuit','courseQuitReport'])$(id).addEventListener('click',quitCourse);
$('courseRestart').addEventListener('click',()=>{if(isCourse())openCourseSetup($('courseRestart'));});
$('courseScorecard').addEventListener('click',()=>{if(isCourse()&&!working)showCourseReport();});$('courseReplay').addEventListener('click',()=>openCourseSetup($('courseReplay')));

function roundRecorded(){return !!round?.answers.some(answer=>answer.index===round.index);}
function updateRoundControls(){
 const active=round?.status==='active',assessment=active&&round.kind==='assessment',locked=active&&round.answers.length>0;
 $('appRoot').classList.toggle('assessment-mode',assessment);$('appRoot').classList.toggle('learning-round-mode',active&&round.kind==='practice');$('practiceIntro').textContent=assessment?'Choose ten targets. Watch your example shot flights. Grades and recommendations stay hidden until the final report.':'Read the hole. Choose direction and carry. Commit, then see the whole pattern.';
 $('roundStatus').hidden=!active;$('roundStatus').textContent=active?`${assessment?'Assessment':'Learning round'} · ${round.index+1} / ${round.schedule.length}${roundResumed?' · Resumed':''}${roundRecorded()?' · Decision recorded':''}${assessment?' · Feedback at the end':''}`:'';
 if(active){for(const id of ['teeTab','approachTab','mixedTab','practiceType'])$(id).disabled=true;}
 if(locked){for(const id of ['basicHandicap','driverLimit','driverLimitReset'])$(id).disabled=true;}
 if(assessment)$('editShotQuick').disabled=true;
 $('roundContinue').hidden=!active||!roundRecorded()||!!result||roundView;$('roundContinue').disabled=working;
 $('roundContinue').textContent=round?.index===round?.schedule.length-1?(round.kind==='assessment'?'View assessment report':'View round summary'):'Next scenario';
 if(assessment&&roundRecorded()){$('simulate').hidden=true;$('aimX').disabled=true;$('aimY').disabled=true;$('mobileActionTarget').textContent='Decision recorded · feedback will appear in your report';}
 if(round&&result)$('tryAgain').innerHTML=round.index===round.schedule.length-1?'Round summary':'Next scenario';else $('tryAgain').innerHTML='Next shot <span>↗</span>';
}
function loadRoundSlot(){
 const slot=round.schedule[round.index];state.seed=slot.drawSeed;setScenario(slot.id,slot.holeSeed,slot.landscape);slot.landscape=state.landscape;if(isCourse()&&round.review)restoreCourseReview();state.encounter=`round-${round.id}-${round.index}`;save();
}
function refreshRoundProfile(){
 if(round?.status!=='active'||round.answers.length)return false;
 const profile=selectedPlayerProfile(),replacement=isCourse()?createCourse(round.seed,profile,round.schedule[0].landscape):createRound(round.kind,round.seed,profile);replacement.id=round.id;round=replacement;loadRoundSlot();return true;
}
function openCourseSetup(focusTarget){
 if(working)return;leaveFullscreen();closeMenu();courseSetupOpen=true;courseSetupFocus=focusTarget;$('courseDifficulty').value=state.difficulty||'easy';$('courseSetup').hidden=false;$('mainContent').inert=true;$('appHeader').inert=true;updateIntroductionControls();$('courseDifficulty').focus?.();
}
function closeCourseSetup(restoreFocus=true){
 if(!courseSetupOpen)return;courseSetupOpen=false;$('courseSetup').hidden=true;$('mainContent').inert=false;$('appHeader').inert=false;updateIntroductionControls();if(restoreFocus)(courseSetupFocus?.id==='courseMenu'?$('menuToggle'):courseSetupFocus)?.focus?.();
}
$('courseSetupCancel').addEventListener('click',()=>closeCourseSetup());
$('courseSetupStart').addEventListener('click',()=>{if(working||!courseSetupOpen)return;const difficulty=$('courseDifficulty').value;closeCourseSetup(false);state.difficulty=['easy','medium','hard'].includes(difficulty)?difficulty:'easy';startRound('course');});
$('courseSetup').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeCourseSetup();}if(e.key==='Tab'){const items=[$('courseDifficulty'),$('courseSetupCancel'),$('courseSetupStart')];if(e.shiftKey&&e.target===items[0]){e.preventDefault();items[2].focus?.();}else if(!e.shiftKey&&e.target===items[2]){e.preventDefault();items[0].focus?.();}}});
function startRound(kind){
 if(!prepareNavigation())return;roundResumed=false;leaveFullscreen();closeMenu();roundView=false;$('roundScreen').hidden=true;$('practiceScreen').hidden=false;
 const profile=selectedPlayerProfile();state.practiceMode='round';state.costs={...DEFAULT_COSTS};state.practiceFilter='mixed';
 const seed=(globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0]||Math.floor(Math.random()*2147483645))%2147483645+1;
 round=kind==='course'?createCourse(seed,profile,['woodland','coast','desert','mountain'][Math.floor(random(seed^0x4937)()*4)]):createRound(kind,seed,profile);round.id=makeId();loadRoundSlot();
}
function showRoundScreen(intro=false){
 if(!prepareNavigation())return;if(isCourse()&&!intro){showCourseReport();return;}$('courseReport').hidden=true;$('closeRound').textContent='Back to practice';leaveFullscreen();closeMenu();roundView=true;$('practiceScreen').hidden=true;$('roundScreen').hidden=false;
 $('roundEyebrow').textContent=intro?'BASELINE ASSESSMENT':'FIRST-ATTEMPT RECAP';$('roundTitle').textContent=intro?'Assessment Test':round.kind==='assessment'?'Your assessment report':'Your five-shot round';
 $('closeRound').hidden=!intro&&round?.kind==='assessment';$('roundReport').hidden=intro;$('startAssessment').hidden=!intro;$('startLearningRound').hidden=intro;
 $('roundDescription').textContent=intro?`Choose targets on 10 new scenarios using ${state.mode==='advanced'?'your saved custom shot profile':'your straight-shot handicap profile'} and ${state.difficulty} conditions. Wind and ground stay consistent through this test. Watch example flights from ground level after each choice. Grades, coaching, comparison targets and overhead views stay hidden until the report. No retries during the test. Your report arrives after shot 10. Starting replaces the current round.`:'First attempts only. Retries helped you experiment and did not change this recap.';
 if(!intro){const summary=roundSummary(round);$('roundPerShot').textContent=summary.average===null?'Unavailable':'+'+summary.average.toFixed(2);$('roundPer100').textContent=summary.per100===null?'Unavailable':'+'+summary.per100.toFixed(1);$('roundScore').textContent=summary.score===null?'—':summary.score.toFixed(1)+' / 100';
 const narrative=roundNarrative(summary);$('roundTendencies').textContent=narrative.tendencies;$('roundDirections').textContent=narrative.directions;
 if(round.version==='rounds-v1-model-v3')$('roundDirections').textContent=$('roundDirections').textContent.replaceAll('intended carry','forward target depth').replaceAll('carry-target','target-position');
 $('roundLimits').textContent='The per-100 number scales this round’s average modeled cost against the best sampled targets. It is not measured real-world strokes gained or a prediction of your next 100 shots. Costs use a historical PGA TOUR distance-and-lie reference with your selected shot pattern, not measured recovery skill for your handicap. This small round suggests practice opportunities, not established habits. If a comparison is unbounded, a finite total is unavailable.';
 if(round.version!==ROUND_VERSION)$('roundLimits').textContent='Previous-model report: scoring assumptions have changed. Keep this report separate from new-model results. '+$('roundLimits').textContent;
 if(round.kind==='assessment')$('roundDescription').textContent=`Your 10 first-attempt decisions, using ${round.profile.shotMode==='custom'?'your saved custom shot profile':'the '+round.profile.handicap+' handicap straight-shot profile'} with a ${round.profile.limit} yd distance limit. Try a learning round to test adjustments with immediate feedback. Personal clubs and unlimited practice remain available in this private pilot.`;
 }
 $('roundScreen').scrollIntoView({behavior:'auto'});$('closeRound').focus?.();save();
}
function recordRoundDecision(r,b){
 if(round?.status!=='active'||isCourse())return;
 const assessment=decisionFeedback(state.aim,state.pattern,r,b,scene());
 addRoundAnswer(round,{kind:assessment.kind,score:decisionScore(r.expected,b.result.expected,state.aim,b.aim),regret:Number.isFinite(r.expected)&&Number.isFinite(b.result.expected)?Math.max(0,r.expected-b.result.expected):null,dx:b.aim.x-state.aim.x,dy:b.pattern.carry-state.pattern.carry});if(round.answers.length===round.schedule.length&&!round.completedAt)round.completedAt=new Date().toISOString();save();
}
function nextRoundSlot(){
 if(working||!roundRecorded())return;roundResumed=false;
 if(round.index===round.schedule.length-1){round.status='complete';showRoundScreen();return;}
 round.index++;loadRoundSlot();
}
$('courseMenu').addEventListener('click',()=>{if(!prepareNavigation())return;const saved=isCourse()?round:storedCourse();if(saved?.status!=='active'){openCourseSetup($('courseMenu'));return;}round=saved;roundView=false;progressOpen=false;leaveFullscreen();closeMenu();$('roundScreen').hidden=true;$('progressScreen').hidden=true;$('practiceScreen').hidden=false;restorePlayerProfile();sceneKey=null;loadRoundSlot();});
$('practiceRoundMenu').addEventListener('click',()=>startRound('practice'));
$('assessmentMenu').addEventListener('click',()=>{if(!working)showRoundScreen(true);});
$('startAssessment').addEventListener('click',()=>startRound('assessment'));
$('startLearningRound').addEventListener('click',()=>startRound('practice'));
$('closeRound').addEventListener('click',()=>{if(isCourse()&&round.status==='complete'){round=null;state.practiceMode='free';dirty();}roundView=false;$('roundScreen').hidden=true;$('practiceScreen').hidden=false;updateLabels();});
$('roundContinue').addEventListener('click',nextRoundSlot);
$('freePracticeMenu').addEventListener('click',()=>{if(!prepareNavigation())return;round=null;state.practiceMode='free';roundView=false;$('roundScreen').hidden=true;$('practiceScreen').hidden=false;closeMenu();dirty();});
function updateCourseFrame(box){
 let {x,y,width,height}=box;
 if(immersive){const bounds=$('course').getBoundingClientRect(),aspect=bounds.width/Math.max(1,bounds.height);
  if(aspect>width/height){const expanded=height*aspect;x-=(expanded-width)/2;width=expanded;}else{const expanded=width/aspect;y-=(expanded-height)/2;height=expanded;}
 }
 $('course').setAttribute('viewBox',`${x} ${y} ${width} ${height}`);
}
function updateFullscreenControls(){
 $('appRoot').classList.toggle('immersive-mode',immersive);
 $('appRoot').classList.toggle('feedback-collapsed',immersive&&!feedbackExpanded);
 $('fullscreenToggle').textContent=immersive?'Exit full screen ✕':'Full screen ⛶';$('fullscreenToggle').setAttribute('aria-pressed',immersive);$('fullscreenToggle').setAttribute('data-mobile-label',immersive?'Exit':'Full');$('feedbackToggle').setAttribute('data-mobile-label',feedbackExpanded?'Hide':'Show');
 $('feedbackToggle').hidden=!immersive||!(result||isCourse()&&round.review);$('feedbackToggle').textContent=feedbackExpanded?'Hide feedback':'Show feedback';$('feedbackToggle').setAttribute('aria-expanded',feedbackExpanded);$('feedbackToggle').setAttribute('aria-controls',isCourse()?'courseOutcome':'results');
}
function leaveFullscreen(){
 if(!immersive)return;immersive=false;nativeFullscreen=false;updateLabels();drawCourse();
 if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
 $('fullscreenToggle').focus?.();
}
$('fullscreenToggle').addEventListener('click',async()=>{
 if(immersive){leaveFullscreen();return;}
 immersive=true;feedbackExpanded=true;if(tutorial)tutorial.collapsed=true;closeMenu();updateFullscreenControls();updateLabels();drawCourse();
 // The immersive layout also works where native fullscreen is unavailable or denied.
 try{if($('appRoot').requestFullscreen){await $('appRoot').requestFullscreen();nativeFullscreen=!!document.fullscreenElement;}}catch{}
 if(immersive){updateLabels();drawCourse();}
});
$('feedbackToggle').addEventListener('click',()=>{feedbackExpanded=!feedbackExpanded;updateFullscreenControls();});
document.addEventListener?.('fullscreenchange',()=>{if(nativeFullscreen&&!document.fullscreenElement)leaveFullscreen();else if(immersive)updateLabels();});
document.addEventListener?.('keydown',event=>{if(event.key==='Escape'&&immersive){event.preventDefault();leaveFullscreen();}});
globalThis.addEventListener?.('resize',()=>{if(immersive)updateLabels();});
function dirty(){lastCourseTap=null;$('decisionLesson').hidden=true;$('decisionVerdict').setAttribute('aria-expanded',false);progressMessage='';landingCamera=null;syncTargetDistance();phase='choose';traceShots=[];transition=null;result=null;best=null;oneShot=null;state.view='pov';$('results').hidden=true;save();updateLabels();drawCourse();}
function setScenario(id,holeSeed=0,setting=null){if(working)return;resetAimZoom();retryBaseline=null;retryHint='';state.encounter=makeId();state.scenario=id;state.holeSeed=holeSeed;state.landscape=Object.hasOwn(LANDSCAPES,setting)?setting:nextLandscape(state.landscape,holeSeed,scene());state.recent=[...state.recent,id].slice(-6);hasAim=false;state.aim={x:0,y:scene().aimY};state.pattern=state.mode==='basic'?basic():member();updateControls();dirty();}
function setMode(mode,allowAssessmentExit=false){if(!prepareNavigation())return;round=null;state.practiceMode='free';resetAimZoom();if(state.mode==='advanced')state.memberCosts={...state.costs};state.mode=mode;hasAim=false;state.aim={x:0,y:scene().aimY};state.pattern=mode==='basic'?basic():member();state.costs=mode==='basic'?{...DEFAULT_COSTS}:memberCosts();updateControls();dirty();closeMenu();}
function prepareNavigation(exitLessons=true){
 if(working)return false;hideHome();closeCourseSetup(false);if(introduction)closeIntroduction(introduction.compared?'completed':'skipped');if(exitLessons&&tutorialReturn)closeLessons();
 if(editorDraft){editorDraft=null;editorDrag=null;editorInvalid.clear();$('shotEditor').hidden=true;}
 hideHome();progressOpen=false;roundView=false;$('progressScreen').hidden=true;$('roundScreen').hidden=true;$('practiceScreen').hidden=false;closeMenu();return true;
}
function closeMenu(){$('practiceMenu').hidden=true;$('menuToggle').setAttribute('aria-expanded',false);}
function openEditor(){
 if(!prepareNavigation())return;roundView=false;$('roundScreen').hidden=true;leaveFullscreen();closeMenu();editorDraft=structuredClone(state.memberBag);editorClub='Driver';$('applyAllClubs').checked=true;$('clubSettings').open=false;editorDrag=null;editorInvalid.clear();
 $('practiceScreen').hidden=true;$('shotEditor').hidden=false;renderEditor();updateLabels();$('shotEditor').scrollIntoView({behavior:'auto'});
}
function editorPattern(){return editingPattern(editorDraft.find(c=>c.club===editorClub));}
function changeDraft(p,shape=false){if(shape&&$('applyAllClubs').checked){editorDraft=applyFlightToBag(editorDraft,editorClub,p);return;}const i=editorDraft.findIndex(c=>c.club===editorClub);editorDraft[i]={...p,stock:p.carry+p.roll,club:editorClub};delete editorDraft[i].carry;}
function renderEditor(keepInput=null){
 const p=editorPattern();$('club').innerHTML=editorDraft.map(c=>`<option>${c.club}</option>`).join('');$('club').value=editorClub;
 for(const key of KEYS)if(!editorInvalid.has(key)&&key!==keepInput)$(key).value=key==='bigDirection'?p[key]:Number(p[key].toFixed(2));
 $('startOut').textContent=sided(p.start,'°');$('curveOut').textContent=sided(p.curve);$('heightOut').textContent=Math.round(p.height)+' yd';$('biasOut').textContent=sided(p.bias);$('bigPctOut').textContent=p.bigPct+'%';$('rhoOut').textContent=p.rho.toFixed(1);
 $('dispersionText').textContent=`σ is one standard deviation. 80% of core shots span approximately ${(2*1.282*p.sdSide).toFixed(0)} yd left/right and ${(2*1.282*p.sdLong).toFixed(0)} yd short/long at stock distance.`;
 $('flightEditor').innerHTML=flightSVG(p);$('heightEditor').innerHTML=heightSVG(p);$('flightDescription').textContent=flightDescription(p);$('shapeScope').textContent=$('applyAllClubs').checked?'Use this usual shape across your clubs.':'Editing '+editorClub+' only.';
 $('saveEditor').disabled=editorInvalid.size>0;$('club').disabled=editorInvalid.size>0;
 $('editorStatus').textContent=editorInvalid.size?'Check your entries before saving. Carry: 50–330 yd; roll: 0–40 yd. Other settings must be within their control limits.':'Save uses this shot profile in new games. Cancel or switch pages to discard unsaved changes.';
}
function closeEditor(){editorDraft=null;editorDrag=null;editorInvalid.clear();$('shotEditor').hidden=true;$('practiceScreen').hidden=false;updateControls();$('practiceScreen').scrollIntoView({behavior:'auto'});}
function saveEditor(){if(!editorDraft||editorInvalid.size)return;state.memberBag=cleanMemberBag(editorDraft,basic());closeEditor();setMode('advanced',true);toast('My shot saved. Choose a target to see how it plays.');}
function editorPoint(svg,e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const ct=svg.getScreenCTM();return ct?p.matrixTransform(ct.inverse()):null;}
function dragEditor(id,e){if(!editorDraft||!editorDrag||editorInvalid.size)return;const at=editorPoint($(id),e);if(!at)return;let p=editorPattern();p=editorDrag==='mid'&&id==='flightEditor'?moveApex(p,(at.x-APEX_X)/APEX_FLIGHT_PIXEL,at.y):editorDrag==='height'?{...p,height:Math.round(clamp((166-at.y)/2.4,5,50))}:moveFlightHandle(p,editorDrag,(at.x-(editorDrag==='end'?FINISH_X:APEX_X))/FLIGHT_PIXEL);changeDraft(p,true);renderEditor();}
function practiceFilter(filter){if(working)return;state.practiceFilter=filter;if(filter!=='mixed'&&scene().type!==filter){state.seed=(state.seed+7919)%2147483646||1;setScenario(nextScenario(state.scenario,filter,state.seed,state.recent),state.seed);}else{save();updateLabels();}}
function comparisonCamera(comparison=best){
 const patterns=[[state.aim,state.pattern],[comparison?.aim||state.aim,comparison?.pattern||state.pattern]],points=[];
 const means=patterns.map(([aim,p])=>{points.push(aim);for(let i=0;i<64;i++){const t=i/64*Math.PI*2;const z={z1:1.794*Math.cos(t),z2:1.794*Math.sin(t),u:1,sign:1};points.push(shotAt(aim,{...p,bigPct:0},z,scene()),shotAt(aim,{...p,bigPct:0},z).landing);}const mean=shotAt(aim,{...p,sdSide:0,sdLong:0,bigPct:0},{z1:0,z2:0,u:1,sign:1},scene());points.push(mean);return mean;});
 return reviewCamera(means[0],means[1],state.pattern,{points});
}
function analysisCamera(){return transition?transition.camera:(landingCamera??=comparisonCamera());}
function project(p){
 if(transition){const a=projectSurface(scene(),p,elevation()),b=projectReview(p,transition.camera),t=transition.progress;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
 return state.view==='map'?projectReview(p,analysisCamera()):projectSurface(scene(),p,elevation());
}
function unproject(x,y){return unprojectSurface(scene(),x,y,elevation());}
function polygon(points){const vertices=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];vertices.push(a);if(elevation()&&(a[1]<80&&b[1]>80||a[1]>80&&b[1]<80))vertices.push([a[0]+(b[0]-a[0])*(80-a[1])/(b[1]-a[1]),80]);}return vertices.map(v=>{const p=project({x:v[0],y:v[1]});return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ');}
function ringPoints(cx,cy,rx,ry,n=64){return Array.from({length:n},(_,i)=>[cx+Math.cos(i/n*Math.PI*2)*rx,cy+Math.sin(i/n*Math.PI*2)*ry]);}
function line(a,b,attrs=''){const x=project(a),y=project(b);return `<line x1="${x.x}" y1="${x.y}" x2="${y.x}" y2="${y.y}" ${attrs}/>`;}
function textAt(x,y,label,attrs=''){const p=project({x,y});return `<text x="${p.x}" y="${p.y}" ${attrs}>${label}</text>`;}
function drawCourse(){
 const course=isCourse(),showPattern=!course||['course-pattern','course-selecting'].includes(phase);
 const focus=kind=>!!tutorial&&!lessonScreenOpen&&tutorial.stage==='guided'&&lessonById(tutorial.id).focus.includes(kind);
 const s=scene(),p=state.pattern,map=state.view==='map'||phase==='zooming',theme=landscape();
 let html=`<defs><linearGradient id="sky" x2="0" ${immersive?'gradientUnits="userSpaceOnUse" y1="-150" y2="235"':'y2="1"'}><stop stop-color="${theme.sky[0]}"/><stop offset="1" stop-color="${theme.sky[1]}"/></linearGradient><linearGradient id="rough" x2="0" ${immersive?'gradientUnits="userSpaceOnUse" y1="235" y2="580"':'y2="1"'}><stop stop-color="${theme.rough[0]}"/><stop offset="1" stop-color="${theme.rough[1]}"/></linearGradient><linearGradient id="fairway" x2="0" y2="1"><stop stop-color="${theme.fairway[0]}"/><stop offset="1" stop-color="${theme.fairway[1]}"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="${theme.water[0]}"/><stop offset="1" stop-color="${theme.water[1]}"/></linearGradient><radialGradient id="ball"><stop stop-color="#fffef8"/><stop offset=".8" stop-color="#e8e8dd"/><stop offset="1" stop-color="#b0baa7"/></radialGradient><clipPath id="fairwayClip"><polygon points="${polygon(s.fairway)}"/></clipPath></defs>`;
 if(map){const c=analysisCamera();html+=`<rect x="-3000" y="-3000" width="7000" height="7000" fill="${theme.ground}"/><rect width="960" height="580" fill="${theme.ground}"/>`;for(let x=-140;x<=160;x+=20)html+=line({x,y:c.minY-20},{x,y:c.maxY+20},'stroke="#b4c69c" stroke-width="1"');for(let y=Math.floor(c.minY/10)*10;y<c.maxY+20;y+=10)html+=line({x:-140,y},{x:160,y},'stroke="#b4c69c" stroke-width="1"');}
 else{html+=`<rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#rough)"/><rect x="-3000" y="-3000" width="7000" height="${3000+EYE_CAMERA.horizon}" fill="url(#sky)"/><rect width="960" height="580" fill="url(#sky)"/><path d="M0 234Q95 212 195 225T390 221T650 224T960 234V250H0Z" fill="#bac8b0"/><rect y="${EYE_CAMERA.horizon}" width="960" height="345" fill="url(#rough)"/><g opacity=".45"><ellipse cx="169" cy="80" rx="80" ry="12" fill="#f6f2e2"/><ellipse cx="658" cy="108" rx="101" ry="11" fill="#f6f2e2"/></g>`;}
 if(!map)html+=drawBackdrop(state.landscape,s);
 html+=`<polygon points="${polygon(s.fairway)}" fill="url(#fairway)" stroke="#5b8d3e" stroke-width="1.4"/>`;
 // Alternating mowing bands are clipped to the exact fairway polygon.
 html+='<g clip-path="url(#fairwayClip)">';for(let y=0;y<s.maxY;y+=24)html+=`<polygon points="${polygon([[-150,y],[150,y],[150,y+12],[-150,y+12]])}" fill="#bcdf81" opacity=".13"/>`;html+='</g>';
 for(const h of s.hazards.filter(h=>h.kind==='trees'))html+=`<polygon points="${polygon(h.poly)}" fill="${theme.recovery}" opacity="${map?.7:.42}"/>`;
 html+=`<polygon points="${polygon(ringPoints(s.green.x,s.green.y,s.green.rx+3,s.green.ry+3))}" fill="#75a747"/>`;
 html+=drawRelief(s,project,theme,map);
 // White-staked boundaries and wooded recovery areas.
 for(const bx of s.bounds){html+=line({x:bx,y:0},{x:bx,y:s.maxY},`stroke="${map?'#afba9f':'#e7e7d5'}" stroke-width="1.8" stroke-dasharray="6 6"`);for(let y=25;y<s.maxY;y+=40){const at=project({x:bx,y});html+=`<path d="M${at.x} ${at.y}v-${map?5:Math.max(3,14-y*.02)}" stroke="#fffef2" stroke-width="2"/>`;}}
 if(!map){html+=`<g id="vegetation" data-landscape="${state.landscape}">`;for(const plant of vegetation(s,state.landscape))html+=drawPlant(plant,project,theme);html+='</g>';}
 // Yardage labels and pin are above the terrain.
 if(map){const c=analysisCamera();for(let y=Math.ceil(c.minY/10)*10;y<c.maxY;y+=10){const at=project({x:c.centerX-450/c.scale,y});html+=`<text x="30" y="${at.y}" fill="#87977a" font-size="9" font-family="Arial">${y} yd</text>`;}}
 // Teaching overlays keep exact hazard edges visible without revealing shot patterns.
 html+='<g id="hazardEdges" fill="none" stroke-linejoin="round">';
 for(const h of s.hazards.filter(h=>focus(h.kind)&&['water','trees'].includes(h.kind)))html+=`<polygon data-tutorial-focus="${h.kind}" points="${polygon(h.poly)}" stroke="${h.kind==='water'?'#24cfe1':'#294f31'}" stroke-width="6"/>`;
 // Water already has a shoreline in the relief renderer; a second bright outline looks artificial.
 for(const h of s.hazards.filter(h=>h.kind==='bunker'))html+=`<polygon points="${polygon(h.poly)}" stroke="${focus('bunker')?'#c68d31':'#fff1c7'}" stroke-width="${focus('bunker')?7:map?1:3}" data-tutorial-focus="${focus('bunker')?'bunker':''}"/><polygon points="${polygon(h.poly)}" stroke="#99703d" stroke-width="1.3"/>`;
 for(const bx of s.bounds)html+=line({x:bx,y:25},{x:bx,y:s.maxY},`stroke="#c15a4f" stroke-width="${focus('ob')?6:2}" stroke-dasharray="8 7" opacity=".75"`);
 html+='</g>';
 const callouts=hazardCallouts(s,state.landscape);
 if(!working||phase==='review'||phase==='course-review'||phase==='assessment-review'){const placedLabels=[];for(const l of callouts){const at=project(l),x=clamp(at.x,115,845);let y=l.kind==='ob'?275:clamp(at.y-50,350,500);while(placedLabels.some(q=>Math.abs(q.x-x)<225&&Math.abs(q.y-y)<60))y-=60;placedLabels.push({x,y});const name=l.kind==='ob'?'OB':l.kind==='water'?'Water':'Sand',detail=`${l.label}: ${l.distance}. Distances describe terrain, not wind-adjusted clearance.`;
 html+=`<g class="mobile-hazard-marker" role="button" tabindex="0" aria-label="${escapeHTML(detail)}" data-hazard-detail="${escapeHTML(detail)}" transform="translate(${x},${y})"><title>${escapeHTML(detail)}</title><rect x="-110" y="-35" width="220" height="80" fill="transparent"/><rect x="-110" y="-18" width="220" height="52" rx="8" fill="#fffef9ed" stroke="${l.color}" stroke-width="2"/><text x="0" y="14" font-family="Arial" font-size="28" text-anchor="middle" fill="#203b30">${name} ${escapeHTML(l.distance.split(' yd')[0])} yd</text></g>`;}}

 const terrainHazards=s.hazards.filter(h=>['water','bunker'].includes(h.kind));
 $('mobileCourseDistances').innerHTML=callouts.filter(l=>l.kind!=='ob').map((l,i)=>`<span class="mobile-hazard-chip" data-kind="${l.kind}"><strong>${escapeHTML(terrainHazards[i]?.label||l.label)}</strong><small>${escapeHTML(l.distance.replace('forward','fwd'))}</small></span>`).join('')+`<span class="mobile-boundary-chip">OB: ${callouts.filter(l=>l.kind==='ob').map(l=>escapeHTML(l.distance.replace(' of center',''))).join(' · ')}</span>`;
 $('mobileHazardList').innerHTML=callouts.map((l,i)=>`<li><strong>${escapeHTML(terrainHazards[i]?.label||l.label)}</strong><span>${escapeHTML(l.distance)}</span></li>`).join('');
 if(map){for(const l of s.labels)html+=textAt(l.x,l.y,l.text==='TREES'&&state.landscape==='desert'?'SCRUB':l.text,'fill="#425d48" font-family="Arial" font-size="11" font-weight="700" text-anchor="middle"');}
 else{let left=0,right=0;for(const l of callouts){const at=project(l),side=l.x<0?'left':'right',index=side==='left'?left++:right++,labelX=side==='left'?100:860,top=112+index*52;
 html+=`<g class="hazard-callout" data-kind="${l.kind}"><line x1="${at.x}" y1="${at.y}" x2="${labelX}" y2="${top+25}" stroke="${l.color}" stroke-width="1.5"/><circle cx="${at.x}" cy="${at.y}" r="4" fill="${l.color}" stroke="#fffef0"/><rect x="${labelX-78}" y="${top-6}" width="156" height="42" rx="5" fill="#203f32ee" stroke="${l.color}"/><text x="${labelX}" y="${top+9}" fill="#fffef0" font-family="Arial" font-size="12" font-weight="700" text-anchor="middle">${l.label}</text><text x="${labelX}" y="${top+25}" fill="#e2e8cf" font-family="Arial" font-size="10" text-anchor="middle">${l.distance}</text></g>`;}}

 if(!map){
  const positions=greenYardages(s);let labels='';
  for(let i=0;i<positions.length;i++){const item=positions[i],at=project(item),labelX=480,top=78+i*42;
   labels+=`<g class="green-yardage-callout" data-edge="${item.kind}"><line x1="${at.x}" y1="${at.y}" x2="${labelX}" y2="${top+13}" stroke="#d9e9a9" stroke-width="1.2"/><rect x="${labelX-68}" y="${top-6}" width="136" height="32" rx="5" fill="#203f32ee" stroke="#d9e9a9"/><text x="${labelX}" y="${top+7}" fill="#fffef0" font-family="Arial" font-size="10" font-weight="700" text-anchor="middle">${item.label} · ${Math.round(item.distance)} yd</text></g>`;
  }
  html+=labels;
 }
 const pin=project(s.pin),ph=map?28:clamp(3*EYE_CAMERA.focal/(s.pin.y+6),20,30);html+=`<ellipse cx="${pin.x}" cy="${pin.y}" rx="3.4" ry="1.6" fill="#4b6946"/><g id="courseFlag" transform="translate(${pin.x},${pin.y})" pointer-events="none"><g class="flag-visual"><path d="M0 0v-${ph}" stroke="#244334" stroke-width="4.5"/><path d="M0 0v-${ph}" stroke="#fffef2" stroke-width="2.5"/><path d="M0 ${-ph}l20 6-20 8Z" fill="#ed5948" stroke="#fffef2" stroke-width="2" stroke-linejoin="round"/></g></g>`;
 if(!map)html+=`<text x="${pin.x+26}" y="${pin.y-ph-5}" font-size="9" fill="#fffef4" font-family="Arial" paint-order="stroke" stroke="#3f614c" stroke-width="2">${s.length} yd pin</text>`;
 else if(pin.y<60)html+=`<text x="480" y="65" text-anchor="middle" font-size="11" fill="#52704c" font-family="Arial">↑ Pin ${Math.round(s.pin.y-(analysisCamera().minY+analysisCamera().maxY)/2)} yd farther ahead</text>`;
 if(tutorial?.stage==='guided'&&tutorial.guide&&!result){const hint=project(tutorial.guide.aim);html+=`<g id="lessonTargetHint" data-target-x="${tutorial.guide.aim.x}" data-target-y="${tutorial.guide.aim.y}" data-target-carry="${tutorial.guide.pattern.carry}" transform="translate(${hint.x},${hint.y})"><title>Suggested lesson target</title><circle r="18" fill="#a680d640" stroke="#d8baff" stroke-width="3"/><path d="M-24 0h10M14 0h10M0-24v10M0 14v10" stroke="#d8baff" stroke-width="2"/></g>`;}
 const zero={x:0,y:0},a=project(state.aim);if(hasAim&&(!course||!round.review))html+=line(zero,state.aim,'stroke="#e7c581" stroke-width="1.8" stroke-dasharray="7 6" opacity=".85"');
 const center=result?centerFlight(state.aim,p,s):null;
 if(hasAim&&!result&&p.roll>=.25&&(!p.conditions||p.conditions.difficulty==='easy')){const plan=plannedRollout(state.aim,p),end=project(plan.finish);html+=`<g id="plannedRollout" data-carry-x="${plan.landing.x}" data-carry-y="${plan.landing.y}" data-finish-x="${plan.finish.x}" data-finish-y="${plan.finish.y}"><title>Estimated rollout; straight-line planning aid before curve and misses</title>${line(plan.landing,plan.finish,'stroke="#fffced" stroke-width="2" stroke-dasharray="3 3"')}<circle cx="${end.x}" cy="${end.y}" r="4" fill="#244b34" stroke="#fffced" stroke-width="2"/></g>`;}
 if(traceShots.length){html+='<g id="shotTracers" fill="none" stroke-linecap="round" stroke-linejoin="round">';for(let i=0;i<traceShots.length;i++){const shot=traceShots[i],path=tracerTrajectory(shot,state.aim,p).map((v,j)=>{const at=project(v);return `${j?'L':'M'}${at.x.toFixed(2)} ${at.y.toFixed(2)}`;}).join(' ');html+=`<path class="${phase==='shooting'?'shot-tracer':'shot-tracer complete'}" data-outcome="${shot.kind}" d="${path}" pathLength="100" stroke="${TRACER_COLORS[shot.kind]}" stroke-width="${course&&traceShots.length===1?4:1.8}" opacity=".78" style="animation-delay:${i*12}ms"/>`;}html+='</g>';}
 if(course&&result&&showPattern)html+='<g id="courseDiscarded">';
 if(result&&showPattern){if(!course){const path=tracerTrajectory({x:center.finish.x,y:center.finish.y,landing:center.landing},state.aim,p,48).slice(0,-1).map((world,i)=>{const at=project(world);return`${i?'L':'M'}${at.x.toFixed(1)} ${at.y.toFixed(1)} `;}).join('');
 html+=`<path d="${path}" fill="none" stroke="#fffced" stroke-width="2" opacity=".78"/>`+line(center.landing,center.finish,'stroke="#fffced" stroke-width="2" stroke-dasharray="4 4" opacity=".8"');}
 // Smooth carry core: wind and shape, before surface-dependent rollout.
 for(const [aim,color,id] of (course?[[state.aim,'#e5ab53','yourContour']]:[[best.aim,'#5195cc','idealContour'],[state.aim,'#e5ab53','yourContour']])){let contour=[];for(let i=0;i<64;i++){const t=i/64*Math.PI*2,pt=shotAt(aim,{...patternAtTarget(aim,p),bigPct:0},{z1:1.794*Math.cos(t),z2:1.794*Math.sin(t),u:1,sign:1});contour.push([pt.landing.x,pt.landing.y]);}html+=`<polygon id="${id}" points="${polygon(contour)}" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-dasharray="${id==='idealContour'?'7 4':'none'}" stroke-width="2.5"><title>80% carry core before rollout; dots show final outcomes</title></polygon>`;}
 if(!course){html+='<g id="idealCloud">';for(let i=0;i<best.result.points.length;i+=16){const shot=best.result.points[i],at=project(shot);html+=`<circle data-outcome="${shot.kind}" cx="${at.x.toFixed(2)}" cy="${at.y.toFixed(2)}" r="2" fill="none" stroke="${TRACER_COLORS[shot.kind]}" stroke-width="1.2" opacity=".6"/>`;}html+='</g>';}
 html+='<g id="shotCloud">';for(let i=0;i<result.points.length;i+=8){const shot=result.points[i],at=project(shot);html+=`<circle data-outcome="${shot.kind}" cx="${at.x.toFixed(2)}" cy="${at.y.toFixed(2)}" r="${shot.big?3.5:2.5}" fill="${TRACER_COLORS[shot.kind]}" stroke="#29422e" stroke-width=".65" opacity=".95"/>`;}html+='</g>';
  if(!course){const b=project(best.aim);html+=line(zero,best.aim,'stroke="#5195cc" stroke-width="1.5" stroke-dasharray="3 6" opacity=".65"');html+=`<g transform="translate(${b.x},${b.y})"><path d="M0-10L8 0 0 10-8 0Z" fill="#27608a" stroke="#acd6f3" stroke-width="2"/></g>`;}
 }
 if(result&&showPattern&&!course){const m=project(center.finish),landing=project(center.landing);if(center.roll>=.25)html+=`<g id="centerLanding" transform="translate(${landing.x},${landing.y})"><title>Center flight landing</title><circle r="5" fill="#244b34" stroke="#fffced" stroke-width="2"/></g>`;html+=`<g id="meanFinish" data-world-x="${center.finish.x}" data-world-y="${center.finish.y}" transform="translate(${m.x},${m.y})"><title>Center flight finish · ${center.kind}</title><circle r="5" fill="#fffef2" stroke="#244b34" stroke-width="2"/><circle r="9" fill="none" stroke="#fffef2" stroke-width="1"/></g>`;}
 if(course&&result&&showPattern)html+='</g>';
 if(course&&round.review&&['course-pattern','course-selecting','zooming','course-hold','course-review'].includes(phase)){const shot=round.review.selected,at=project(shot);html+=`<g id="courseSelectedBall" data-world-x="${shot.x}" data-world-y="${shot.y}" data-outcome="${shot.kind}"><title>Your selected shot · ${NAMES[shot.kind]}</title><circle cx="${at.x}" cy="${at.y}" r="10" fill="#fffef6" stroke="#bd7f27" stroke-width="3"/><circle cx="${at.x}" cy="${at.y}" r="4" fill="${TRACER_COLORS[shot.kind]}"/><text x="${at.x+15}" y="${at.y-12}" font-size="12" fill="#203f32" stroke="#fffef6" stroke-width="4" paint-order="stroke">Your shot</text></g>`;}
 if(oneShot){const o=project(oneShot);html+=`<circle cx="${o.x}" cy="${o.y}" r="10" fill="#f9f4df" stroke="#c76849" stroke-width="3"/><text x="${o.x+14}" y="${o.y-10}" font-size="11" fill="#fffef2" paint-order="stroke" stroke="#365340" stroke-width="3">${NAMES[oneShot.kind]}</text>`;}
 if(hasAim&&(!course||!round.review))html+=`<g id="aimMarker" transform="translate(${a.x},${a.y})"><circle r="12" fill="#254c3a99" stroke="#ebc782" stroke-width="2"/><circle r="3" fill="#ebc782"/><path d="M-18 0h8M10 0h8M0-18v8M0 10v8" stroke="#ebc782" stroke-width="1.5"/></g>`;
 if(!map){html+=`<path d="M0 552Q220 541 430 551T960 547V580H0Z" fill="${theme.rough[1]}" opacity=".55"/><ellipse cx="480" cy="549" rx="9" ry="2.5" fill="#29493055"/><circle cx="480" cy="545" r="4.5" fill="url(#ball)"/><path d="M480 549v5" stroke="#e0d2ab" stroke-width="1.5"/>`;}
 else if(!course||!round.review){const z=project(zero);html+=`<circle cx="${z.x}" cy="${z.y}" r="5" fill="#fffdf0" stroke="#557c50"/><text x="${z.x+12}" y="${z.y+4}" font-size="10" fill="#6f8565">YOUR BALL</text>`;}
 $('course').innerHTML=html;
}
function showResult(){
 const r=result,b=best.result,regret=Number.isFinite(r.expected)?Math.max(0,r.expected-b.expected):Number.isFinite(b.expected)?Infinity:0,score=decisionScore(r.expected,b.expected,state.aim,best.aim),s=scene();
 const assessment=decisionFeedback(state.aim,state.pattern,r,best,s);
 $('retryComparison').hidden=!retryValid();
 if(retryValid()){$('retryRows').innerHTML=retryRows(retryBaseline,{aim:state.aim,pattern:state.pattern,result:r,score:Number.isFinite(b.expected)?score:null}).map(row=>`<tr><th scope="row">${escapeHTML(row.label)}</th><td>${escapeHTML(row.first)}</td><td>${escapeHTML(row.now)}</td></tr>`).join('');$('retrySummary').textContent=retryImpact(retryBaseline.result.expected,r.expected);}
 feedbackExpanded=true;$('results').hidden=false;$('scoreValue').textContent=Number.isFinite(b.expected)?score:'—';
 $('decisionVerdict').textContent=assessment.label;$('decisionVerdict').setAttribute('aria-expanded',false);$('decisionLesson').hidden=true;
 const lesson=decisionLesson(state.aim,state.pattern,r,best,s,assessment);
 if(r.baselineClamped||b.baselineClamped)lesson.note+=` Source-range limit: ${r.baselineClamped} of your ${r.n} outcomes and ${b.baselineClamped} of the comparison's ${b.n} outcomes use a nearest table endpoint (including off-green shots under 10 yd or putts beyond 90 ft).`;
 $('lessonTitle').textContent=assessment.label+' — why?';$('lessonWhy').textContent=lesson.why;$('lessonPrinciple').textContent=lesson.principle;$('lessonAction').textContent=lesson.action;$('lessonLimit').textContent=lesson.note;
 $('lessonRows').innerHTML=lesson.rows.map(row=>`<tr><th scope="row">${escapeHTML(row.label)}</th><td>${escapeHTML(row.you)}</td><td>${escapeHTML(row.best)}</td></tr>`).join('');$('progressSaved').textContent=progressMessage;
 $('decisionVerdict').setAttribute('data-kind',assessment.kind);$('decisionReason').textContent=assessment.reason;
 $('scoreCircle').style.borderColor=score>=85?'#9bb773':score>=60?'#cba96e':'#c78169';
 $('resultTitle').textContent=assessment.kind==='balanced'?'A sound target.':'A better target is available.';
 $('resultSummary').textContent=!Number.isFinite(b.expected)?'Every sampled target produced only OB shots. Adjust the shot pattern.':regret<.05?'Your target is close to the best sampled direction and depth.':`Best sampled target: ${sided(best.aim.x)}, ${Math.round(best.pattern.carry)} yd carry.`;
 $('expectedValue').textContent=Number.isFinite(r.expected)?r.expected.toFixed(2):'∞';$('uncertainty').textContent=Number.isFinite(r.expected)?`± ${(1.96*r.se).toFixed(2)} · approximate 95% sampling error`:'Every simulated shot was OB';
 $('regretValue').textContent=!Number.isFinite(b.expected)?'—':Number.isFinite(regret)?`+${regret.toFixed(2)}`:'∞';$('penaltyValue').textContent=(r.penalty*100).toFixed(1)+'%';
 $('shownCount').textContent=`Tour reference · 4,000 simulated · 500 plotted · ${best.evaluated} targets compared`;
 const order=['green','fairway','rough','bunker','trees','water','ob'];
 $('outcomeBar').innerHTML=order.map(k=>`<div style="width:${r.counts[k]/r.n*100}%;background:${COLORS[k]}" title="${NAMES[k]}: ${(r.counts[k]/r.n*100).toFixed(1)}%"></div>`).join('');
 $('outcomeBreakdown').innerHTML=order.filter(k=>r.counts[k]>0).map(k=>`<span><i style="background:${COLORS[k]}"></i>${NAMES[k]} <strong>${(r.counts[k]/r.n*100).toFixed(1)}%</strong></span>`).join('');
 const penaltyGain=(r.penalty-b.penalty)*100,dx=best.aim.x-state.aim.x,dy=best.pattern.carry-state.pattern.carry;
 let note=!Number.isFinite(b.expected)?'No sampled target avoids an all-OB pattern. Adjust the shot settings; the comparison is not meaningful here.':regret<.05?'A bad single outcome can still follow a good decision.':`The comparison moves the target ${sided(dx)} and ${Math.abs(dy).toFixed(0)} yd ${dy>=0?'more carry':'less carry'}. It saves about ${Number.isFinite(regret)?regret.toFixed(2):'many'} expected strokes.`;
 if(penaltyGain>1)note+=` Water / OB exposure falls by ${penaltyGain.toFixed(1)} percentage points.`;
 if(s.type==='approach'&&Math.hypot(best.aim.x-s.pin.x,best.aim.y-s.pin.y)>8)note+=' The flag and the best target do not have to be the same point.';
 $('conditionsLearning').hidden=!conditionsFeedback(state.aim,state.pattern);$('conditionsLearning').textContent=conditionsFeedback(state.aim,state.pattern);
 $('coachNote').textContent=(lesson.hazardDetail?lesson.hazardDetail+(lesson.tradeoff?' '+lesson.tradeoff:''):lesson.why)+'\n\n'+lesson.action+'\n\n'+(lesson.hazardDetail?'':note)+(state.pattern.autoBag?` Your ${state.pattern.club}${state.pattern.customBag?'':' estimate'}: ${Math.round(state.pattern.carry)} yd intended carry. Comparison: ${best.pattern.club}, ${Math.round(best.pattern.carry)} yd intended carry. ${state.pattern.customBag?'Comparison uses your saved club settings, scaled to that distance.':'Shorter clubs use narrower patterns.'}`:' Custom dispersion stays fixed as target depth changes.')+' Off-frame finishes count in the totals.';const center=centerFlight(state.aim,state.pattern,s);if(center.kind==='water'&&state.pattern.roll>.25)$('coachNote').textContent+=' For the center flight, water contact stops the roll before the planned finish.';
 $('oneOutcome').textContent='A single shot can reward a poor decision. Judge the full pattern.';
 updateLabels();drawCourse();if(immersive)$('feedbackToggle').focus?.();
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function zoomToLanding(camera){
 phase='zooming';landingCamera=camera;transition={camera,progress:0};updateLabels();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||typeof requestAnimationFrame!=='function'){transition.progress=1;drawCourse();return;}
 await new Promise(resolve=>{let started;function frame(now){started??=now;const t=Math.min(1,(now-started)/650);transition.progress=t*t*(3-2*t);drawCourse();if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
}
async function run(newSeed=false){
 if(working||!hasAim||isCourse()&&round.review||round?.kind==='assessment'&&roundRecorded()||tutorial?.stage==='intro'||introduction)return;if(tutorial?.stage==='guided'&&(!tutorial.guide||!nearLessonTarget(state.aim,tutorial.guide.aim))){toast('Aim near the highlighted target using both controls, then commit.');updateLabels();return;}if(newSeed)state.seed=(state.seed+7919)%2147483646||1;
 resetAimZoom();working=true;phase='calculating';result=null;best=null;oneShot=null;state.view='pov';$('results').hidden=true;
 $('newShots').disabled=true;$('simulate').innerHTML='Calculating 4,000 shots…';updateLabels();drawCourse();
 const snapshot=JSON.stringify(state);await wait(30);
 try{
  const zs=samples(4000,state.seed),r=evaluate(state.aim,state.pattern,scene(),state.costs,zs,true),b=tutorial?.guide||await optimizeTargets(state.aim,state.pattern,scene(),state.costs,zs,()=>wait(0));
  const comparison={aim:b.aim,pattern:b.pattern,evaluated:b.evaluated,result:evaluate(b.aim,b.pattern,scene(),state.costs,zs,true)};
  if(snapshot!==JSON.stringify(state)){toast('Settings changed. Commit the updated target.');return;}
  if(isCourse()){
   const s=scene(),feedback=decisionFeedback(state.aim,state.pattern,r,comparison,s),lesson=decisionLesson(state.aim,state.pattern,r,comparison,s,feedback),decision={kind:feedback.kind,label:feedback.label,reason:feedback.reason,action:(lesson.hazardDetail||lesson.why)+' '+(lesson.tradeoff||'')+` The comparison target on this hole is ${Math.round(comparison.pattern.carry)} yd carry, ${sided(comparison.aim.x)}. Use practice mode to try the alternative.`,score:decisionScore(r.expected,comparison.result.expected,state.aim,comparison.aim),regret:Number.isFinite(r.expected)&&Number.isFinite(comparison.result.expected)?Math.max(0,r.expected-comparison.result.expected):null};
   const review=recordCourseShot(round,r.points,s,decision,state.aim,state.pattern);if(round.status==='complete'&&!round.completedAt)round.completedAt=new Date().toISOString();save();traceShots=tracerSample(r.points);traceShots[0]=review.selected;phase='shooting';updateLabels();drawCourse();
   const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;if(motion)await wait(2200);
   result=r;best=comparison;traceShots=[];phase='course-pattern';updateLabels();drawCourse();if(motion)await wait(1000);
   phase='course-selecting';traceShots=[review.selected];updateLabels();drawCourse();if(motion)await wait(900);
   traceShots=[];await zoomToLanding(courseCamera());transition=null;phase='course-hold';state.view='map';updateLabels();drawCourse();if(motion)await wait(1500);phase='course-review';feedbackExpanded=true;updateLabels();drawCourse();save();return;
  }
  if(round?.kind==='assessment'&&round.status==='active'){
   traceShots=tracerSample(r.points);phase='shooting';updateLabels();drawCourse();
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await wait(2200);
   recordRoundDecision(r,comparison);phase='assessment-review';transition=null;hasAim=false;result=null;best=null;save();updateLabels();drawCourse();return;
  }
  traceShots=tracerSample(r.points);phase='shooting';$('simulate').innerHTML='Shots in flight…';updateLabels();drawCourse();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await wait(2200);
  await zoomToLanding(comparisonCamera(comparison));
  transition=null;traceShots=[];phase='review';result=r;best=comparison;state.view='map';if(tutorial)tutorial.collapsed=false;recordRoundDecision(r,comparison);recordDecision();showResult();save();
 }
 catch(error){console.error(error);phase='choose';traceShots=[];transition=null;drawCourse();toast('Simulation failed. Reset the pattern and try again.');}
 finally{working=false;$('newShots').disabled=false;updateLabels();}
}
for(const key of KEYS)$(key).addEventListener('input',()=>{
 if(!editorDraft)return;const el=$(key),v=key==='bigDirection'?el.value:Number(el.value);
 if(key!=='bigDirection'&&(el.value===''||!Number.isFinite(v)||v<Number(el.min)||v>Number(el.max))){editorInvalid.add(key);renderEditor();return;}
 editorInvalid.delete(key);const p=editorPattern();p[key]=key==='bigDirection'?(['left','right','both'].includes(v)?v:'both'):v;changeDraft(p,['start','curve','height'].includes(key));renderEditor(key);
});
$('club').addEventListener('change',()=>{if(!editorDraft||editorInvalid.size)return;if(editorDraft.some(c=>c.club===$('club').value)){editorClub=$('club').value;$('applyAllClubs').checked=false;}renderEditor();});
for(const id of ['flightEditor','heightEditor']){
 $(id).addEventListener('pointerdown',e=>{if(!editorDraft||editorInvalid.size||e.isPrimary===false||e.button!==undefined&&e.button!==0)return;const at=editorPoint($(id),e);if(!at)return;const p=editorPattern(),q=flightHandles(p),handles=id==='heightEditor'?[{key:'height',x:300,y:166-p.height*2.4}]:[{key:'mid',x:APEX_X+APEX_FLIGHT_PIXEL*q.mid,y:apexY(p)},{key:'end',x:FINISH_X+FLIGHT_PIXEL*q.end,y:FINISH_Y}];const h=handles.sort((a,b)=>Math.hypot(a.x-at.x,a.y-at.y)-Math.hypot(b.x-at.x,b.y-at.y)).find(h=>Math.hypot(h.x-at.x,h.y-at.y)<=(e.pointerType==='touch'?48:32));if(!h)return;editorDrag=h.key;$(id).setPointerCapture?.(e.pointerId);e.preventDefault?.();dragEditor(id,e);});
 $(id).addEventListener('pointermove',e=>{if(editorDrag&&(e.buttons===1||e.pointerType==='touch'))dragEditor(id,e);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])$(id).addEventListener(type,()=>{editorDrag=null;});
}
$('straightFlight').addEventListener('click',()=>{if(!editorDraft)return;editorDraft=resetFlight(editorDraft,$('applyAllClubs').checked?null:editorClub);for(const key of ['start','curve','bias','height'])editorInvalid.delete(key);renderEditor();});
$('reset').addEventListener('click',()=>{if(!editorDraft)return;const defaults=defaultMemberBag(basic()).find(c=>c.club===editorClub);editorDraft[editorDraft.findIndex(c=>c.club===editorClub)]=defaults;editorInvalid.clear();renderEditor();});
$('applyAllClubs').addEventListener('change',()=>{if(editorDraft)renderEditor();});
$('clubSettings').addEventListener('toggle',()=>{if(editorDraft&&$('clubSettings').open){$('applyAllClubs').checked=false;renderEditor();}});
$('editShotQuick').addEventListener('click',openEditor);
$('flightEditor').addEventListener('keydown',e=>{if(!editorDraft||editorInvalid.size)return;const key=e.target.closest?.('[data-handle]')?.dataset.handle;if(!key||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||key==='end'&&['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();let p=editorPattern(),q=flightHandles(p);if(e.key==='ArrowLeft'||e.key==='ArrowRight')p=moveFlightHandle(p,key,q[key]+(e.key==='ArrowRight'?1:-1));else if(key==='mid')p={...p,height:clamp(p.height+(e.key==='ArrowUp'?1:-1),5,50)};changeDraft(p,true);renderEditor();$('flightEditor').querySelector?.(`[data-handle="${key}"]`)?.focus();});
$('cancelEditor').addEventListener('click',closeEditor);$('saveEditor').addEventListener('click',saveEditor);
$('menuToggle').addEventListener('click',()=>{if(working)return;$('practiceMenu').hidden=!$('practiceMenu').hidden;$('menuToggle').setAttribute('aria-expanded',!$('practiceMenu').hidden);});
for(const el of document.querySelectorAll('[data-cost]'))el.addEventListener('input',()=>{if(working||isCourse()&&round.review||result||state.mode!=='advanced'||el.value===''||!Number.isFinite(Number(el.value)))return;state.costs[el.dataset.cost]=clamp(Number(el.value),Number(el.min),Number(el.max));state.memberCosts={...state.costs};dirty();});
for(const el of document.querySelectorAll('[data-cost]'))el.addEventListener('change',()=>{el.value=state.costs[el.dataset.cost];});
for(const axis of ['X','Y'])$('aim'+axis).addEventListener('input',()=>{if(working||isCourse()&&round.review||result)return;if(axis==='Y'){chooseDepth(Number($('aimY').value));return;}setSideTarget(Number($('aimX').value));hasAim=true;syncTargetDistance();updateControls();dirty();});
function coursePoint(e){const svg=$('course'),point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const ct=svg.getScreenCTM();return ct?point.matrixTransform(ct.inverse()):null;}
function courseTap(e){return{at:Number.isFinite(e.timeStamp)?e.timeStamp:performance.now(),x:e.clientX,y:e.clientY,type:e.pointerType||'mouse'};}
$('course').addEventListener('keydown',e=>{const marker=e.target.closest?.('[data-hazard-detail]');if(marker&&['Enter',' '].includes(e.key)){e.preventDefault();toast(marker.getAttribute('data-hazard-detail'));}});
$('course').addEventListener('pointerdown',e=>{
 const marker=e.target.closest?.('[data-hazard-detail]');if(marker){e.preventDefault?.();toast(marker.getAttribute('data-hazard-detail'));return;}
 if(isCourse()&&round.review)return;
 if(round?.kind==='assessment'&&roundRecorded())return;
 if(working||editorDraft||progressOpen||e.isPrimary===false||e.button!==undefined&&e.button!==0)return;
 if(result){toast('Take the next shot or retry this hole to choose a fresh target.');return;}
 const local=coursePoint(e);if(!local)return;const tap=courseTap(e);
 if(isDoubleAimTap(lastCourseTap,tap)){
  const before=lastCourseTap.before;state.aim=before.aim;state.pattern=before.pattern;hasAim=before.hasAim;updateControls();dirty();toggleAimZoom(local);lastDoubleAimTap=tap;e.preventDefault?.();return;
 }
 const before={aim:{...state.aim},pattern:structuredClone(state.pattern),hasAim};
 if(local.y<=EYE_CAMERA.horizon+1){lastCourseTap={...tap,before};toast('Choose an aim on the ground, or use the left/right slider.');return;}
 const w=unproject(local.x,local.y);if(w.y<=0)return;
 setSideTarget(Math.round(state.pattern.carry*w.x/Math.hypot(w.x,w.y)));hasAim=true;syncTargetDistance();updateControls();dirty();lastCourseTap={...tap,before};
});
$('course').addEventListener('dblclick',e=>{if(e.target.closest?.('[data-hazard-detail]')){e.preventDefault?.();return;}if(working||isCourse()&&round.review||result||editorDraft||progressOpen||e.button!==undefined&&e.button!==0)return;e.preventDefault?.();const tap={...courseTap(e),type:'mouse'};if(isDoubleAimTap(lastDoubleAimTap?{...lastDoubleAimTap,type:'mouse'}:null,tap))return;const local=coursePoint(e);if(local)toggleAimZoom(local);});
$('aimZoomToggle').addEventListener('click',()=>toggleAimZoom());
$('practiceType').addEventListener('change',()=>{if($('practiceType').disabled)return;practiceFilter(['tee','approach','mixed'].includes($('practiceType').value)?$('practiceType').value:'mixed');});
for(const [id,filter] of [['teeTab','tee'],['approachTab','approach'],['mixedTab','mixed']])$(id).addEventListener('click',()=>practiceFilter(filter));
for(const [id,view] of [['povBtn','pov'],['mapBtn','map']])$(id).addEventListener('click',()=>{if(!result||working)return;state.view=view;save();updateLabels();drawCourse();});
$('simulate').addEventListener('click',()=>run());$('newShots').addEventListener('click',()=>run(true));
$('useBest').addEventListener('click',()=>{if(best&&!working){state.aim={...best.aim};hasAim=true;syncTargetDistance();updateControls();dirty();}});
$('tryAgain').addEventListener('click',()=>{if(working||!result||introduction)return;if(tutorial){advanceTutorial();return;}if(round){if(round.status==='complete')showRoundScreen();else nextRoundSlot();return;}state.seed=(state.seed+7919)%2147483646||1;setScenario(nextScenario(state.scenario,state.practiceFilter,state.seed,state.recent),state.seed);});
function retryShot(){if(working||!result)return;resetAimZoom();if(!retryValid()){retryBaseline={conditions:structuredClone(state.pattern.conditions||null),encounter:state.encounter,profile:currentProfile(),seed:state.seed,aim:{...state.aim},pattern:structuredClone(state.pattern),result:{expected:result.expected,penalty:result.penalty},score:Number.isFinite(best.result.expected)?decisionScore(result.expected,best.result.expected,state.aim,best.aim):null};}retryHint=decisionLesson(state.aim,state.pattern,result,best,scene(),decisionFeedback(state.aim,state.pattern,result,best,scene())).action;hasAim=false;syncTargetDistance();updateControls();dirty();$('aimX').focus?.();}
$('retryThisHole').addEventListener('click',retryShot);
$('difficulty').addEventListener('change',()=>{if(isCourse()||working||result||tutorialReturn||round?.answers.length||round?.current?.attempts.length)return;state.difficulty=['easy','medium','hard'].includes($('difficulty').value)?$('difficulty').value:'easy';retryBaseline=null;retryHint='';if(refreshRoundProfile())return;state.pattern=state.mode==='basic'?basic():member();dirty();});
$('basicHandicap').addEventListener('change',()=>{if(working||isCourse()&&round.review||result||state.mode!=='basic'||round?.answers.length||isCourse())return;state.basicHandicap=$('basicHandicap').value;if(refreshRoundProfile())return;state.pattern=basic();syncTargetDistance();updateControls();dirty();});
$('terrainToggle').addEventListener('click',()=>{if(working||isCourse()&&round.review||result)return;resetAimZoom();state.elevated=!state.elevated;save();updateLabels();drawCourse();});
$('driverLimit').addEventListener('change',()=>{if(working||isCourse()&&round.review||result||round?.answers.length||isCourse())return;state.basicLimits[state.basicHandicap]=num($('driverLimit').value,180,330,DRIVER_LIMITS[state.basicHandicap]);if(refreshRoundProfile())return;if(state.mode==='basic')state.pattern=basic();updateControls();dirty();});
$('driverLimitReset').addEventListener('click',()=>{if(working||isCourse()&&round.review||result||round?.answers.length||isCourse())return;delete state.basicLimits[state.basicHandicap];if(refreshRoundProfile())return;if(state.mode==='basic')state.pattern=basic();updateControls();dirty();});
$('basicMode').addEventListener('click',()=>setMode('basic'));$('advancedMode').addEventListener('click',openEditor);
$('playOne').addEventListener('click',()=>{if(!result)return;const rng=random(state.seed+Math.floor(performance.now()));oneShot=result.points[Math.floor(rng()*result.n)];$('oneOutcome').textContent=`${NAMES[oneShot.kind]} · ${Math.round(oneShot.y)} yd forward, ${sided(oneShot.x)}${oneShot.big?' · big-miss component':''}. This is one draw from your pattern.`;drawCourse();});
for(const id of ['modelTop','modelFooter'])$(id).addEventListener('click',()=>{$('assumptions').hidden=!$('assumptions').hidden;if(!$('assumptions').hidden)$('assumptions').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
$('decisionVerdict').addEventListener('click',()=>{if(!result)return;$('decisionLesson').hidden=!$('decisionLesson').hidden;$('decisionVerdict').setAttribute('aria-expanded',!$('decisionLesson').hidden);});
for(const id of ['progressMenu','progressResult'])$(id).addEventListener('click',openProgress);
$('closeProgress').addEventListener('click',closeProgress);
$('progressDifficulty').addEventListener('change',()=>{progressDifficulty=['all','easy','medium','hard'].includes($('progressDifficulty').value)?$('progressDifficulty').value:'all';renderProgress();});
function hideHome(){homeOpen=false;$('homeScreen').hidden=true;}
function resumableRound(){return round?.status==='active'?round:storedCourse()?.status==='active'?storedCourse():null;}
function openHome(){
 if(!prepareNavigation())return;leaveFullscreen();save();homeOpen=true;$('homeScreen').hidden=false;
 for(const id of ['practiceScreen','roundScreen','progressScreen','lessonsScreen','shotEditor','assumptions'])$(id).hidden=true;
 $('homePracticeChoices').hidden=true;const saved=resumableRound();$('homeContinue').hidden=!saved;$('homeContinueDetails').hidden=!saved;
 $('homeContinueDetails').textContent=saved?`${saved.kind==='course'?'Par-3 course':saved.kind==='assessment'?'Assessment':'Learning round'} · ${saved.kind==='course'?'Hole':'Shot'} ${saved.index+1} of ${saved.schedule.length}`:'';
 updateIntroductionControls();$('homeScreen').scrollIntoView({behavior:'auto'});$('homeTitle').focus?.();
}
$('homeLogo').addEventListener('click',e=>{e.preventDefault();openHome();});$('homeMenu').addEventListener('click',openHome);
for(const id of ['homeIntroduction','homeIntroductionRecommended'])$(id).addEventListener('click',openIntroduction);
$('homeLessons').addEventListener('click',openLessons);$('homeProgress').addEventListener('click',openProgress);
$('homePractice').addEventListener('click',()=>{$('homePracticeChoices').hidden=false;$('homeUnlimited').focus?.();});
for(const [id,target] of [['homeUnlimited','freePracticeMenu'],['homeLearning','practiceRoundMenu'],['homeAssessment','assessmentMenu']])$(id).addEventListener('click',()=>$(target).dispatchEvent(new Event('click')));
$('homeCourse').addEventListener('click',()=>{const saved=isCourse()?round:storedCourse();if(saved?.status==='active')$('courseMenu').dispatchEvent(new Event('click'));else openCourseSetup($('homeCourse'));});
$('homeContinue').addEventListener('click',()=>{const saved=resumableRound();if(!saved||!prepareNavigation())return;round=saved;restorePlayerProfile();sceneKey=null;loadRoundSlot();});
rememberCompletedRound(storedCourse());
$('brandName').textContent=BRAND.name;$('brandFooter').textContent=BRAND.name;document.title=BRAND.title;
if(round?.status==='active'){
 restorePlayerProfile();loadRoundSlot();
}else if(round?.status==='complete'){showRoundScreen();}
else if(state.practiceMode!=='free'){startRound('practice');}
updateControls();drawCourse();save();
updateIntroductionControls();

openHome();
