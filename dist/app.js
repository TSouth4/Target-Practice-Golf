import {ROUND_KEY,createRound,readRound,addRoundAnswer,roundSummary,roundNarrative} from './rounds.js';
import {SCENARIOS,DEFAULT_COSTS,preset,basicPattern,clamp,random,samples,shotAt,evaluate,optimizeTargets,decisionScore,patternAtTarget,fitTarget,aimAtDepth,aimAtDistance,decisionFeedback} from './model.js';
import {targetFacts,hazardCallouts,retryRows,greenYardages} from './guidance.js';
import {decisionLesson,retryImpact} from './lessons.js';
import {PROGRESS_KEY,MODEL_VERSION,readProgress,profileKey,recordAttempt,progressSummary,trendSVG} from './progress.js';
import {DRIVER_LIMITS,reachLimit,trainingBag} from './bag.js';
import {FLIGHT_PIXEL,defaultMemberBag,cleanMemberBag,editingPattern,flightHandles,moveFlightHandle,flightDescription,flightSVG,heightSVG} from './shot-editor.js';
import {BRAND} from './config.js';
import {EYE_CAMERA,reviewCamera,projectReview,aimZoomBox,isDoubleAimTap} from './camera.js';
import {nextScenario,generateScenario,nextLandscape} from './practice.js';
import {TRACER_COLORS,tracerSample,tracerTrajectory} from './tracers.js';
import {LANDSCAPES,vegetation,drawPlant} from './landscape.js';
import {projectSurface,unprojectSurface,drawRelief} from './surfaces.js';
const $=id=>document.getElementById(id);
const KEYS=['carry','roll','sdSide','sdLong','bias','start','curve','height','bigPct','bigDirection','bigShift','bigShort','rho'];
const COLORS=TRACER_COLORS;
const NAMES={fairway:'Fairway',green:'Green',rough:'Rough',bunker:'Bunker',water:'Water',trees:'Recovery',ob:'OB'};
let state={scenario:'cedar',holeSeed:0,elevated:true,landscape:'woodland',practiceMode:'round',basicLimits:{},mode:'basic',basicHandicap:'5',advanced:null,memberBag:null,memberCosts:null,practiceFilter:'mixed',recent:[],profile:'5',club:'Driver',view:'pov',aim:{x:0,y:270},pattern:basicPattern(5,SCENARIOS[0]),costs:{...DEFAULT_COSTS},seed:7142026};
let round=null,roundView=false,roundResumed=false;try{round=readRound(localStorage.getItem(ROUND_KEY));roundResumed=round?.status==='active';}catch{}
let result=null,best=null,oneShot=null,working=false,hasAim=false,toastTimer,phase='choose',traceShots=[],transition=null;
let editorDraft=null,editorClub='Driver',editorDrag=null,editorInvalid=new Set();
let landingCamera=null;
let immersive=false,feedbackExpanded=true,nativeFullscreen=false;
let retryBaseline=null,retryHint='';
function retryValid(){return retryBaseline&&retryBaseline.encounter===state.encounter&&retryBaseline.profile===currentProfile()&&retryBaseline.seed===state.seed;}
let aimZoom=null,lastCourseTap=null,lastDoubleAimTap=null;
function resetAimZoom(){aimZoom=null;lastCourseTap=null;lastDoubleAimTap=null;}
function toggleAimZoom(point){if(working||result||editorDraft||progressOpen)return;lastCourseTap=null;lastDoubleAimTap=null;aimZoom=aimZoom?null:aimZoomBox(point||projectSurface(scene(),state.aim,elevation()));updateLabels();}
const storeKey='golfaim101-v2';
let idCounter=0;
const makeId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${(++idCounter).toString(36)}-${Math.random().toString(36).slice(2,10)}`;
state.encounter=makeId();
let progressHistory=[],progressOpen=false,progressSelection='',progressType='all',progressStored=true,progressMessage='';
try{progressHistory=readProgress(localStorage.getItem(PROGRESS_KEY));}catch{progressStored=false;}
const escapeHTML=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const RATING_LABELS={balanced:'Strong decision',aggressive:'Too aggressive',conservative:'Too conservative',refine:'Target needs refining'};
function currentProfile(){return profileKey(state.mode,state.basicHandicap,state.pattern.driverLimit,state.memberBag,state.costs);}
function recordDecision(){
 if(!Number.isFinite(best.result.expected)){progressMessage='No progress entry: this run has no usable target comparison.';return;}
 const assessed=decisionFeedback(state.aim,state.pattern,result,best,scene());
 const entry={id:makeId(),encounter:state.encounter,at:new Date().toISOString(),model:MODEL_VERSION,profile:currentProfile(),profileLabel:state.mode==='basic'?`Free · ${state.basicHandicap==='0'?'scratch':state.basicHandicap+' handicap'} · ${Math.round(state.pattern.driverLimit)} yd limit`:'My clubs',type:scene().type,kind:assessed.kind,score:decisionScore(result.expected,best.result.expected,state.aim,best.aim),regret:Number.isFinite(result.expected)?Math.max(0,result.expected-best.result.expected):null,penalty:result.penalty};
 const recorded=recordAttempt(progressHistory,entry);progressHistory=recorded.history;
 try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(progressHistory));progressStored=true;}catch{progressStored=false;}
 progressMessage=progressStored?(recorded.entry.retry?'Retry saved separately; it does not enter your improvement trend.':'First attempt saved to My progress.'):'Progress is available for this visit, but could not be saved on this device.';
}
function renderProgress(){
 const profiles=[...new Set(progressHistory.map(r=>r.profile))];if(!profiles.includes(progressSelection))progressSelection=profiles.includes(currentProfile())?currentProfile():profiles.at(-1)||'';
 $('progressProfile').innerHTML=profiles.length?profiles.map((key,i)=>{const row=progressHistory.find(r=>r.profile===key);return`<option value="${escapeHTML(key)}">${escapeHTML(row.profileLabel)} · profile ${i+1}</option>`;}).join(''):'<option value="">No decisions yet</option>';
 $('progressProfile').value=progressSelection;$('progressProfile').disabled=!profiles.length;$('progressType').value=progressType;
 const summary=progressSummary(progressHistory,progressSelection,progressType);
 $('progressCount').textContent=summary.first.length;$('progressRetryCount').textContent=`${summary.retries} retries recorded separately`;
 $('progressAverage').textContent=summary.recentMean===null?'—':summary.recentMean.toFixed(1)+' / 100';$('progressAverageLabel').textContent=`Last ${summary.recent.length} first attempts`;
 $('progressChange').textContent=summary.change===null?'—':`${summary.change>=0?'+':''}${summary.change.toFixed(1)} pts`;
 $('progressChange').setAttribute('data-trend',summary.change===null?'none':summary.change>0?'up':summary.change<0?'down':'flat');
 $('progressChangeLabel').textContent=summary.change===null?'Starts after 10 first attempts':`Latest ${summary.window} vs first ${summary.window}; no overlap`;
 $('progressCost').textContent=!summary.recent.length?'—':summary.recentRegret===null?'Unbounded':'+'+summary.recentRegret.toFixed(2);
 $('progressChartLabel').textContent=summary.first.length?`Last ${Math.min(50,summary.first.length)} first attempts · same profile · ${progressType==='all'?'tee + approach':progressType+' shots'}`:'Commit a target to start your decision history.';
 $('progressTrend').innerHTML=trendSVG(summary.first);
 $('progressKinds').innerHTML=Object.entries(summary.kinds).map(([kind,count])=>`<div><span>${RATING_LABELS[kind]}</span><strong>${count}</strong><small>${summary.first.length?(100*count/summary.first.length).toFixed(0):0}%</small></div>`).join('');
 $('progressRows').innerHTML=summary.first.slice(-8).reverse().map(row=>`<tr><td>${escapeHTML(new Date(row.at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}))}</td><td>${row.type==='tee'?'Tee':'Approach'}</td><td>${row.score} / 100</td><td>${RATING_LABELS[row.kind]}</td></tr>`).join('');
 $('progressEmpty').textContent=summary.first.length?'':summary.retries?'Only retries in this profile so far. Take Next shot to start a new first attempt.':'No first attempts in this profile and shot type yet.';
 $('progressStorage').textContent=progressStored?'Saved locally in this browser. Keeps the latest 1,000 attempts, including retries. Clearing browser data removes this history.':'Local saving is unavailable. History from this visit may be lost when you close the page.';
}
function openProgress(){if(working||editorDraft)return;roundView=false;$('roundScreen').hidden=true;leaveFullscreen();closeMenu();progressOpen=true;progressSelection=currentProfile();$('practiceScreen').hidden=true;$('progressScreen').hidden=false;renderProgress();updateLabels();$('progressScreen').scrollIntoView({behavior:'auto'});$('closeProgress').focus?.();}
function closeProgress(){progressOpen=false;$('progressScreen').hidden=true;$('practiceScreen').hidden=false;updateLabels();$('practiceScreen').scrollIntoView({behavior:'auto'});$('menuToggle').focus?.();}

let cachedScene,sceneKey;
function scene(){const key=state.scenario+':'+state.holeSeed;if(key!==sceneKey){cachedScene=generateScenario(SCENARIOS.find(s=>s.id===state.scenario),state.holeSeed);sceneKey=key;}return cachedScene;}
function basic(){return {...basicPattern(state.basicHandicap,scene(),state.basicLimits[state.basicHandicap]||DRIVER_LIMITS[state.basicHandicap]),aimMode:'carry'};}
function elevation(){return state.elevated?scene().elevationM:0;}
function landscape(){return LANDSCAPES[state.landscape];}
function num(v,a,b,fallback){return Number.isFinite(Number(v))?clamp(Number(v),a,b):fallback;}
try{const saved=JSON.parse(localStorage.getItem(storeKey));if(saved&&SCENARIOS.some(s=>s.id===saved.scenario)){state.scenario=saved.scenario;state.practiceMode=saved.practiceMode==='free'?'free':'round';if(typeof saved.encounter==='string'&&saved.encounter.length>0&&saved.encounter.length<100)state.encounter=saved.encounter;state.seed=num(saved.seed,1,2147483646,7142026);state.basicHandicap=['0','5','10','20'].includes(saved.basicHandicap)?saved.basicHandicap:'5';state.advanced=saved.advanced||null;state.memberBag=saved.memberBag||null;state.memberCosts=saved.memberCosts||saved.advanced?.costs||null;state.practiceFilter=['tee','approach','mixed'].includes(saved.practiceFilter)?saved.practiceFilter:'mixed';state.recent=Array.isArray(saved.recent)?saved.recent.filter(id=>SCENARIOS.some(s=>s.id===id)).slice(-6):[];state.holeSeed=num(saved.holeSeed,0,2147483646,0);state.elevated=saved.elevated!==false;state.landscape=LANDSCAPES[saved.landscape]?saved.landscape:'woodland';for(const h of ['0','5','10','20'])if(saved.basicLimits?.[h])state.basicLimits[h]=num(saved.basicLimits[h],180,330,DRIVER_LIMITS[h]);}}catch{}
// Start each visit with the free straight-flight lesson; member setup remains saved.
state.pattern=basic();state.aim=fitTarget({x:0,y:scene().aimY},state.pattern);
const initialBag=defaultMemberBag(basic());
if(!state.memberBag&&state.advanced?.pattern){const old=initialBag.find(c=>c.club===state.advanced.club);if(old)Object.assign(old,state.advanced.pattern,{stock:state.advanced.pattern.carry+state.advanced.pattern.roll,club:old.club});}
state.memberBag=state.memberBag?cleanMemberBag(state.memberBag,basic()):cleanMemberBag(initialBag,basic());
state.recent=state.recent.length?state.recent:[state.scenario];
function member(){return{...basic(),customBag:state.memberBag,shotType:scene().type};}
function memberCosts(){const out={...DEFAULT_COSTS};for(const el of document.querySelectorAll('[data-cost]'))out[el.dataset.cost]=num(state.memberCosts?.[el.dataset.cost],Number(el.min),Number(el.max),DEFAULT_COSTS[el.dataset.cost]);return out;}
function save(){if(round?.status==='active'&&!round.answers.length&&state.mode==='basic')round.profile={handicap:state.basicHandicap,limit:state.basicLimits[state.basicHandicap]||DRIVER_LIMITS[state.basicHandicap]};try{localStorage.setItem(storeKey,JSON.stringify(state));localStorage.setItem(ROUND_KEY,JSON.stringify(round));}catch{}}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3500);}
function sided(x,unit='yd'){return Math.abs(x)<.01?'0 '+unit:`${Math.abs(x).toFixed(unit==='°'?1:0)}${unit==='°'?'°':' '+unit} ${x<0?'left':'right'}`;}
function syncTargetDistance(){state.aim=fitTarget(state.aim,state.pattern);let p=patternAtTarget(state.aim,state.pattern);const carry=clamp(p.carry,50,330);if(Math.abs(carry-p.carry)>.0001){state.aim=aimAtDistance(state.aim,carry+(p.aimMode==='carry'?0:p.roll),p.aimXRange);p=patternAtTarget(state.aim,p);}state.pattern=p;}
function depthRange(){const max=Math.min(scene().aimRange[1],reachLimit(state.pattern));return[Math.min(scene().aimRange[0],max),max];}
function chooseDepth(carry){if(round?.kind==='assessment'&&roundRecorded())return;state.aim=aimAtDistance(state.aim,clamp(Math.round(carry),...depthRange()),state.pattern.aimXRange);hasAim=true;syncTargetDistance();updateControls();dirty();}
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
 $('aimXOut').textContent=sided(state.aim.x);$('aimYOut').textContent=Math.round(p.carry)+' yd';$('rollEstimate').textContent=`Expected roll ~${Math.round(p.roll)} yd`;
 $('aimBadge').textContent=hasAim?`◎ ${result?'Committed carry':'Your carry'} · ${Math.round(p.carry)} yd · ${sided(state.aim.x)}`:'◎ Pick direction, then depth';
 if(round?.kind==='assessment'&&roundRecorded())$('aimBadge').textContent='◎ Decision recorded · next scenario when ready';
 $('sampleStatus').textContent=`4,000 shots · seed ${state.seed}`;
 $('cloudBadge').textContent=result?'Dots: outcome colors · solid: yours · dashed: comparison':phase==='assessment-review'?`${traceShots.length} example flights · report at the end`:phase==='shooting'?`${traceShots.length} example flights · colored by outcome`:phase==='zooming'?'Zooming to your landing area…':'Pattern hidden until you commit';
 $('holeMeta').textContent=`PAR ${s.par} · ${s.secondShot?'SECOND SHOT · ':''}${s.length} YD${s.type==='approach'?' TO FLAG':''}`;
 $('scenarioDiagnostics').textContent=`Scenario ${s.id} · layout seed ${state.holeSeed} · shot seed ${state.seed} · ${s.generatorVersion||'authored baseline'} · ${s.woodlandVersion||''}`;
 $('greenYardageList').hidden=!!result;$('greenYardageList').innerHTML=greenYardages(s).map(item=>`<span><small>${item.label}</small><strong>${Math.round(item.distance)} yd</strong></span>`).join('');
 $('holeName').textContent=s.name;$('scenarioBrief').textContent=s.brief;$('sceneChip').textContent=s.tag;const woods=s.woods?.filter(w=>w.recoveryMultiplier>1);if(woods?.length)$('scenarioBrief').textContent+=' '+(woods[0].side<0?'Left':'Right')+' woods are denser and closer; the other side leaves more recovery room.';
 for(const [id,on] of [['povBtn',state.view==='pov'],['mapBtn',state.view==='map'],['teeTab',state.practiceFilter==='tee'],['approachTab',state.practiceFilter==='approach'],['mixedTab',state.practiceFilter==='mixed']]){$(id).classList.toggle('active',on);$(id).setAttribute('aria-pressed',on);}
 for(const id of ['teeTab','approachTab','mixedTab'])$(id).disabled=working;
 const advanced=state.mode==='advanced';
 $('basicBar').hidden=false;$('handicapField').hidden=advanced;$('aimDepthWrap').hidden=false;
 $('shotModeNote').textContent=advanced?'My shot · member preview · automatic club for depth':'Straight flight · automatic club for your depth';
 $('costEditor').hidden=!advanced;
 $('legend').hidden=!result;$('reviewViews').hidden=!result;$('tryAgain').hidden=!result;$('retryThisHole').hidden=!result;
 $('traceLegend').hidden=!result&&phase!=='shooting'&&phase!=='zooming';
 $('animationStatus').hidden=!working;
 $('animationStatus').textContent=round?.kind==='assessment'&&phase==='shooting'?'Watching example flights · your report comes after all ten decisions.':phase==='shooting'?`Following ${traceShots.length} example shots. Color shows the final lie; percentages will use all 4,000.`:phase==='zooming'?'Now compare your landing pattern with the best sampled aim.':'Calculating 4,000 outcomes…';
 $('newShots').hidden=true;$('sampleStatus').hidden=!result;
 $('singleShot').hidden=true;$('useBest').hidden=true;
 $('simulate').hidden=!!result;$('simulate').disabled=working||!hasAim;
 if(!working)$('simulate').innerHTML=hasAim?'Commit & shoot <span>↗</span>':'Pick a target first <span>↗</span>';
 const facts=targetFacts(state.aim,p,s);
 $('targetDistance').textContent=`${Math.round(p.carry)} yd intended carry`; $('targetClub').textContent=`${p.club}${p.customBag?'':' estimate'} · ${Math.round(p.carry)} carry + ${Math.round(p.roll)} roll`;
 $('targetContext').textContent=`${Math.round(facts.toPin)} yd from carry target to pin${facts.crossings.length?' · Along this aim line: '+facts.crossings.join('; '):''}`;
 $('targetReadout').hidden=!!result;
 $('mobileActionTarget').textContent=hasAim?`${Math.round(p.carry)} yd carry · ~${Math.round(p.roll)} yd roll · ${p.club}`:'Choose direction and carry';
 $('mobileActionTarget').hidden=!!result||working;
 $('mobileHazards').hidden=!!result||phase==='shooting'||phase==='zooming';
 $('appRoot').classList.toggle('mobile-practice-actions',!editorDraft&&!progressOpen&&!roundView);
 $('retryGuide').hidden=!!result||!retryValid();$('retryGuide').textContent=retryValid()?`Guided retry · ${retryHint} Adjust your original target, then commit. Same hole, profile and 4,000-shot sample; patterns hidden again.`:'';
 $('stockShot').textContent=p.autoBag?`${p.customBag?'My ':''}${p.club}${p.customBag?'':' estimate'} · ${Math.round(p.carry+p.roll)} yd · ${Math.round(reachLimit(p))} yd carry limit`:`Planned distance: ${Math.round(p.carry+p.roll)} yd · custom`;
 $('cameraBadge').textContent=phase==='shooting'?'SHOT TRACERS':phase==='zooming'?'ZOOMING TO LANDING AREA':state.view==='map'?'LANDING-AREA ZOOM':`${aimZoom?'2× TARGET ZOOM · ':''}EYE LEVEL · ${elevation()} M ABOVE LANDING`;
 const zoomAllowed=!working&&!result&&!editorDraft&&!progressOpen;
 $('aimZoomToggle').hidden=!!result;$('aimZoomToggle').disabled=!zoomAllowed;$('aimZoomToggle').textContent=aimZoom?'Zoom out ⊖':'Zoom in ⊕';$('aimZoomToggle').setAttribute('aria-pressed',!!aimZoom);
 updateCourseFrame(aimZoom&&zoomAllowed?aimZoom:{x:0,y:0,width:960,height:580});
 $('terrainToggle').hidden=!!result;$('terrainToggle').textContent=state.elevated?'Elevated view':'Flat view';$('terrainToggle').setAttribute('aria-pressed',state.elevated);$('terrainToggle').disabled=working||!!result;$('driverLimit').disabled=working||!!result;$('driverLimitReset').disabled=working||!!result;
 $('aimHelp').textContent=result?'Your target is locked. Compare the patterns, then take the next shot or retry this hole.':'Choose left/right on the course. Double-tap or double-click to zoom in / out. Use the carry bar beside the course. Sliders work too. The pattern stays hidden until you commit.';
 for(const id of ['basicMode','advancedMode'])$(id).disabled=working;
 $('menuToggle').disabled=working||!!editorDraft||progressOpen;$('progressMenu').disabled=working||!!editorDraft||progressOpen;
 $('aimControls').hidden=!!result;$('scenarioBriefWrap').hidden=!!result;$('appRoot').classList.toggle('review-mode',!!result);
 for(const [id,on] of [['stepChoose',!hasAim],['stepCommit',hasAim&&!result],['stepCompare',!!result]])$(id).classList.toggle('current',on);
 for(const id of ['basicHandicap','aimX','aimY'])$(id).disabled=working||!!result;
 for(const el of document.querySelectorAll('[data-cost]'))el.disabled=working||!!result;
 updateFullscreenControls();
 updateRoundControls();
 $('tryAgain').disabled=working;$('retryThisHole').disabled=working;$('useBest').disabled=working;
}
function roundRecorded(){return !!round?.answers.some(answer=>answer.index===round.index);}
function updateRoundControls(){
 const active=round?.status==='active',assessment=active&&round.kind==='assessment',locked=active&&round.answers.length>0;
 $('appRoot').classList.toggle('assessment-mode',assessment);$('practiceIntro').textContent=assessment?'Choose ten targets. Watch your example shot flights. Grades and recommendations stay hidden until the final report.':'Read the hole. Choose direction and carry. Commit, then see the whole pattern.';
 $('roundStatus').hidden=!active;$('roundStatus').textContent=active?`${assessment?'Assessment':'Learning round'} · ${round.index+1} / ${round.schedule.length}${roundResumed?' · Resumed':''}${roundRecorded()?' · Decision recorded':''}${assessment?' · Feedback at the end':''}`:'';
 if(active){for(const id of ['teeTab','approachTab','mixedTab'])$(id).disabled=true;}
 if(locked){for(const id of ['basicHandicap','driverLimit','driverLimitReset'])$(id).disabled=true;}
 if(assessment){for(const id of ['basicMode','advancedMode','progressMenu'])$(id).disabled=true;}
 $('roundContinue').hidden=!active||!roundRecorded()||!!result||roundView;$('roundContinue').disabled=working;
 $('roundContinue').textContent=round?.index===round?.schedule.length-1?(round.kind==='assessment'?'View assessment report':'View round summary'):'Next scenario';
 if(assessment&&roundRecorded()){$('simulate').hidden=true;$('aimX').disabled=true;$('aimY').disabled=true;$('mobileActionTarget').textContent='Decision recorded · feedback will appear in your report';}
 if(round&&result)$('tryAgain').innerHTML=round.index===round.schedule.length-1?'Round summary':'Next scenario';else $('tryAgain').innerHTML='Next shot <span>↗</span>';
}
function loadRoundSlot(){
 const slot=round.schedule[round.index];state.seed=slot.drawSeed;setScenario(slot.id,slot.holeSeed);state.encounter=`round-${round.id}-${round.index}`;save();
}
function refreshRoundProfile(){
 if(round?.status!=='active'||round.answers.length)return false;
 const replacement=createRound(round.kind,round.seed,{handicap:state.basicHandicap,limit:state.basicLimits[state.basicHandicap]||DRIVER_LIMITS[state.basicHandicap]});replacement.id=round.id;round=replacement;loadRoundSlot();return true;
}
function startRound(kind){
 if(working)return;roundResumed=false;leaveFullscreen();closeMenu();roundView=false;$('roundScreen').hidden=true;$('practiceScreen').hidden=false;
 state.mode='basic';state.practiceMode='round';state.costs={...DEFAULT_COSTS};state.practiceFilter='mixed';
 const seed=(globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0]||Math.floor(Math.random()*2147483645))%2147483645+1;
 round=createRound(kind,seed,{handicap:state.basicHandicap,limit:state.basicLimits[state.basicHandicap]||DRIVER_LIMITS[state.basicHandicap]});round.id=makeId();loadRoundSlot();
}
function showRoundScreen(intro=false){
 leaveFullscreen();closeMenu();roundView=true;$('practiceScreen').hidden=true;$('roundScreen').hidden=false;
 $('roundEyebrow').textContent=intro?'BASELINE ASSESSMENT':'FIRST-ATTEMPT RECAP';$('roundTitle').textContent=intro?'Assessment Test':round.kind==='assessment'?'Your assessment report':'Your five-shot round';
 $('closeRound').hidden=!intro&&round?.kind==='assessment';$('roundReport').hidden=intro;$('startAssessment').hidden=!intro;$('startLearningRound').hidden=intro;
 $('roundDescription').textContent=intro?'Choose targets on 10 new scenarios using your straight-shot handicap profile. Watch example flights from ground level after each choice. Grades, coaching, comparison targets and overhead views stay hidden until the report. No retries during the test. Your report arrives after shot 10. Starting replaces the current round.':'First attempts only. Retries helped you experiment and did not change this recap.';
 if(!intro){const summary=roundSummary(round);$('roundPerShot').textContent=summary.average===null?'Unavailable':'+'+summary.average.toFixed(2);$('roundPer100').textContent=summary.per100===null?'Unavailable':'+'+summary.per100.toFixed(1);$('roundScore').textContent=summary.score===null?'—':summary.score.toFixed(1)+' / 100';
 const narrative=roundNarrative(summary);$('roundTendencies').textContent=narrative.tendencies;$('roundDirections').textContent=narrative.directions;
 if(round.version!=='rounds-v2-model-v4')$('roundDirections').textContent=$('roundDirections').textContent.replaceAll('intended carry','forward target depth').replaceAll('carry-target','target-position');
 $('roundLimits').textContent='The per-100 number scales this round’s average modeled cost against the best sampled targets. It is not measured real-world strokes gained or a prediction of your next 100 shots. This small round suggests practice opportunities, not established habits. If a comparison is unbounded, a finite total is unavailable.';
 if(round.version!=='rounds-v2-model-v4')$('roundLimits').textContent='Previous-model report: targets used finishing distance rather than intended carry. Keep this report separate from new-model results. '+$('roundLimits').textContent;
 if(round.kind==='assessment')$('roundDescription').textContent=`Your 10 first-attempt decisions, using the ${round.profile.handicap} handicap straight-shot profile with a ${round.profile.limit} yd distance limit. Try a learning round to test adjustments with immediate feedback. Personal clubs and unlimited practice remain available in this private pilot.`;
 }
 $('roundScreen').scrollIntoView({behavior:'auto'});$('closeRound').focus?.();save();
}
function recordRoundDecision(r,b){
 if(round?.status!=='active')return;
 const assessment=decisionFeedback(state.aim,state.pattern,r,b,scene());
 addRoundAnswer(round,{kind:assessment.kind,score:decisionScore(r.expected,b.result.expected,state.aim,b.aim),regret:Number.isFinite(r.expected)&&Number.isFinite(b.result.expected)?Math.max(0,r.expected-b.result.expected):null,dx:b.aim.x-state.aim.x,dy:b.pattern.carry-state.pattern.carry});save();
}
function nextRoundSlot(){
 if(working||!roundRecorded())return;roundResumed=false;
 if(round.index===round.schedule.length-1){round.status='complete';showRoundScreen();return;}
 round.index++;loadRoundSlot();
}
$('practiceRoundMenu').addEventListener('click',()=>startRound('practice'));
$('assessmentMenu').addEventListener('click',()=>{if(!working)showRoundScreen(true);});
$('startAssessment').addEventListener('click',()=>startRound('assessment'));
$('startLearningRound').addEventListener('click',()=>startRound('practice'));
$('closeRound').addEventListener('click',()=>{roundView=false;$('roundScreen').hidden=true;$('practiceScreen').hidden=false;updateLabels();});
$('roundContinue').addEventListener('click',nextRoundSlot);
$('freePracticeMenu').addEventListener('click',()=>{if(working)return;round=null;state.practiceMode='free';roundView=false;$('roundScreen').hidden=true;$('practiceScreen').hidden=false;closeMenu();dirty();});
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
 $('fullscreenToggle').textContent=immersive?'Exit full screen ✕':'Full screen ⛶';$('fullscreenToggle').setAttribute('aria-pressed',immersive);
 $('feedbackToggle').hidden=!immersive||!result;$('feedbackToggle').textContent=feedbackExpanded?'Hide feedback':'Show feedback';$('feedbackToggle').setAttribute('aria-expanded',feedbackExpanded);
}
function leaveFullscreen(){
 if(!immersive)return;immersive=false;nativeFullscreen=false;updateLabels();drawCourse();
 if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
 $('fullscreenToggle').focus?.();
}
$('fullscreenToggle').addEventListener('click',async()=>{
 if(immersive){leaveFullscreen();return;}
 immersive=true;feedbackExpanded=true;closeMenu();updateFullscreenControls();updateLabels();drawCourse();
 // The immersive layout also works where native fullscreen is unavailable or denied.
 try{if($('appRoot').requestFullscreen){await $('appRoot').requestFullscreen();nativeFullscreen=!!document.fullscreenElement;}}catch{}
 if(immersive){updateLabels();drawCourse();}
});
$('feedbackToggle').addEventListener('click',()=>{feedbackExpanded=!feedbackExpanded;updateFullscreenControls();});
document.addEventListener?.('fullscreenchange',()=>{if(nativeFullscreen&&!document.fullscreenElement)leaveFullscreen();else if(immersive)updateLabels();});
document.addEventListener?.('keydown',event=>{if(event.key==='Escape'&&immersive){event.preventDefault();leaveFullscreen();}});
globalThis.addEventListener?.('resize',()=>{if(immersive)updateLabels();});
function dirty(){lastCourseTap=null;$('decisionLesson').hidden=true;$('decisionVerdict').setAttribute('aria-expanded',false);progressMessage='';landingCamera=null;syncTargetDistance();phase='choose';traceShots=[];transition=null;result=null;best=null;oneShot=null;state.view='pov';$('results').hidden=true;save();updateLabels();drawCourse();}
function setScenario(id,holeSeed=0){if(working)return;resetAimZoom();retryBaseline=null;retryHint='';state.encounter=makeId();state.scenario=id;state.holeSeed=holeSeed;state.landscape=nextLandscape(state.landscape,holeSeed);state.recent=[...state.recent,id].slice(-6);hasAim=false;state.aim={x:0,y:scene().aimY};state.pattern=state.mode==='basic'?basic():member();updateControls();dirty();}
function setMode(mode){if(working||round?.kind==='assessment'&&round.status==='active')return;round=null;state.practiceMode='free';resetAimZoom();if(state.mode==='advanced')state.memberCosts={...state.costs};state.mode=mode;hasAim=false;state.aim={x:0,y:scene().aimY};state.pattern=mode==='basic'?basic():member();state.costs=mode==='basic'?{...DEFAULT_COSTS}:memberCosts();updateControls();dirty();closeMenu();}
function closeMenu(){$('practiceMenu').hidden=true;$('menuToggle').setAttribute('aria-expanded',false);}
function openEditor(){
 if(working)return;roundView=false;$('roundScreen').hidden=true;leaveFullscreen();closeMenu();editorDraft=structuredClone(state.memberBag);editorClub=editorDraft.some(c=>c.club===state.pattern.club)?state.pattern.club:'Driver';editorDrag=null;editorInvalid.clear();
 $('practiceScreen').hidden=true;$('shotEditor').hidden=false;renderEditor();updateLabels();$('shotEditor').scrollIntoView({behavior:'auto'});
}
function editorPattern(){return editingPattern(editorDraft.find(c=>c.club===editorClub));}
function changeDraft(p){const i=editorDraft.findIndex(c=>c.club===editorClub);editorDraft[i]={...p,stock:p.carry+p.roll,club:editorClub};delete editorDraft[i].carry;}
function renderEditor(keepInput=null){
 const p=editorPattern();$('club').innerHTML=editorDraft.map(c=>`<option>${c.club}</option>`).join('');$('club').value=editorClub;
 for(const key of KEYS)if(!editorInvalid.has(key)&&key!==keepInput)$(key).value=key==='bigDirection'?p[key]:Number(p[key].toFixed(2));
 $('startOut').textContent=sided(p.start,'°');$('curveOut').textContent=sided(p.curve);$('heightOut').textContent=Math.round(p.height)+' yd';$('biasOut').textContent=sided(p.bias);$('bigPctOut').textContent=p.bigPct+'%';$('rhoOut').textContent=p.rho.toFixed(1);
 $('dispersionText').textContent=`σ is one standard deviation. 80% of core shots span approximately ${(2*1.282*p.sdSide).toFixed(0)} yd left/right and ${(2*1.282*p.sdLong).toFixed(0)} yd short/long at stock distance.`;
 $('flightEditor').innerHTML=flightSVG(p);$('heightEditor').innerHTML=heightSVG(p);$('flightDescription').textContent=flightDescription(p);
 $('saveEditor').disabled=editorInvalid.size>0;$('club').disabled=editorInvalid.size>0;
 $('editorStatus').textContent=editorInvalid.size?'Check your entries before saving. Carry: 50–330 yd; roll: 0–40 yd. Other settings must be within their control limits.':'Save applies all club edits and starts a fresh target choice. Back discards these edits.';
}
function closeEditor(){editorDraft=null;editorDrag=null;editorInvalid.clear();$('shotEditor').hidden=true;$('practiceScreen').hidden=false;updateControls();$('practiceScreen').scrollIntoView({behavior:'auto'});}
function saveEditor(){if(!editorDraft||editorInvalid.size)return;state.memberBag=cleanMemberBag(editorDraft,basic());closeEditor();setMode('advanced');toast('My shot saved. Choose a target to see how it plays.');}
function editorPoint(svg,e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const ct=svg.getScreenCTM();return ct?p.matrixTransform(ct.inverse()):null;}
function dragEditor(id,e){if(!editorDraft||!editorDrag||editorInvalid.size)return;const at=editorPoint($(id),e);if(!at)return;let p=editorPattern();p=editorDrag==='height'?{...p,height:Math.round(clamp((166-at.y)/2.4,5,50))}:moveFlightHandle(p,editorDrag,(at.x-300)/FLIGHT_PIXEL);changeDraft(p);renderEditor();}
function practiceFilter(filter){if(working)return;state.practiceFilter=filter;if(filter!=='mixed'&&scene().type!==filter){state.seed=(state.seed+7919)%2147483646||1;setScenario(nextScenario(state.scenario,filter,state.seed,state.recent),state.seed);}else{save();updateLabels();}}
function comparisonCamera(comparison=best){
 const patterns=[[state.aim,state.pattern],[comparison?.aim||state.aim,comparison?.pattern||state.pattern]],points=[];
 const means=patterns.map(([aim,p])=>{points.push(aim);for(let i=0;i<64;i++){const t=i/64*Math.PI*2;points.push(shotAt(aim,{...p,bigPct:0},{z1:1.794*Math.cos(t),z2:1.794*Math.sin(t),u:1,sign:1}));}const mean=shotAt(aim,{...p,sdSide:0,sdLong:0,bigPct:0},{z1:0,z2:0,u:1,sign:1});points.push(mean);return mean;});
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
 const s=scene(),p=state.pattern,map=state.view==='map'||phase==='zooming',theme=landscape();
 let html=`<defs><linearGradient id="sky" x2="0" ${immersive?'gradientUnits="userSpaceOnUse" y1="-150" y2="235"':'y2="1"'}><stop stop-color="${theme.sky[0]}"/><stop offset="1" stop-color="${theme.sky[1]}"/></linearGradient><linearGradient id="rough" x2="0" ${immersive?'gradientUnits="userSpaceOnUse" y1="235" y2="580"':'y2="1"'}><stop stop-color="${theme.rough[0]}"/><stop offset="1" stop-color="${theme.rough[1]}"/></linearGradient><linearGradient id="fairway" x2="0" y2="1"><stop stop-color="${theme.fairway[0]}"/><stop offset="1" stop-color="${theme.fairway[1]}"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="${theme.water[0]}"/><stop offset="1" stop-color="${theme.water[1]}"/></linearGradient><radialGradient id="ball"><stop stop-color="#fffef8"/><stop offset=".8" stop-color="#e8e8dd"/><stop offset="1" stop-color="#b0baa7"/></radialGradient><clipPath id="fairwayClip"><polygon points="${polygon(s.fairway)}"/></clipPath></defs>`;
 if(map){const c=analysisCamera();html+=`<rect x="-3000" y="-3000" width="7000" height="7000" fill="${theme.ground}"/><rect width="960" height="580" fill="${theme.ground}"/>`;for(let x=-140;x<=160;x+=20)html+=line({x,y:c.minY-20},{x,y:c.maxY+20},'stroke="#b4c69c" stroke-width="1"');for(let y=Math.floor(c.minY/10)*10;y<c.maxY+20;y+=10)html+=line({x:-140,y},{x:160,y},'stroke="#b4c69c" stroke-width="1"');}
 else{html+=`<rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#rough)"/><rect x="-3000" y="-3000" width="7000" height="${3000+EYE_CAMERA.horizon}" fill="url(#sky)"/><rect width="960" height="580" fill="url(#sky)"/><path d="M0 234Q95 212 195 225T390 221T650 224T960 234V250H0Z" fill="#bac8b0"/><rect y="${EYE_CAMERA.horizon}" width="960" height="345" fill="url(#rough)"/><g opacity=".45"><ellipse cx="169" cy="80" rx="80" ry="12" fill="#f6f2e2"/><ellipse cx="658" cy="108" rx="101" ry="11" fill="#f6f2e2"/></g>`;}
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
 // Water already has a shoreline in the relief renderer; a second bright outline looks artificial.
 for(const h of s.hazards.filter(h=>h.kind==='bunker'))html+=`<polygon points="${polygon(h.poly)}" stroke="#fff1c7" stroke-width="${map?1:3}"/><polygon points="${polygon(h.poly)}" stroke="#99703d" stroke-width="1.3"/>`;
 for(const bx of s.bounds)html+=line({x:bx,y:25},{x:bx,y:s.maxY},'stroke="#c15a4f" stroke-width="2" stroke-dasharray="8 7" opacity=".75"');
 html+='</g>';
 const callouts=hazardCallouts(s,state.landscape);
 const terrainHazards=s.hazards.filter(h=>['water','bunker'].includes(h.kind));
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
 const pin=project(s.pin),ph=map?20:clamp(2*EYE_CAMERA.focal/(s.pin.y+6),6,15);html+=`<ellipse cx="${pin.x}" cy="${pin.y}" rx="3.4" ry="1.6" fill="#4b6946"/><path d="M${pin.x} ${pin.y}v-${ph}" stroke="#fffef2" stroke-width="1.6"/><path d="M${pin.x} ${pin.y-ph}l10 3-10 4Z" fill="#f3efda"/>`;
 if(!map)html+=`<text x="${pin.x+15}" y="${pin.y-ph+4}" font-size="9" fill="#fffef4" font-family="Arial" paint-order="stroke" stroke="#3f614c" stroke-width="2">${s.length} yd pin</text>`;
 else if(pin.y<60)html+=`<text x="480" y="65" text-anchor="middle" font-size="11" fill="#52704c" font-family="Arial">↑ Pin ${Math.round(s.pin.y-(analysisCamera().minY+analysisCamera().maxY)/2)} yd farther ahead</text>`;
 const zero={x:0,y:0},a=project(state.aim);if(hasAim)html+=line(zero,state.aim,'stroke="#e7c581" stroke-width="1.8" stroke-dasharray="7 6" opacity=".85"');
 const meanPattern={...p,sdSide:0,sdLong:0,bigPct:0},mean=shotAt(state.aim,meanPattern,{z1:0,z2:0,u:1,sign:1});
 if(traceShots.length){html+='<g id="shotTracers" fill="none" stroke-linecap="round" stroke-linejoin="round">';for(let i=0;i<traceShots.length;i++){const shot=traceShots[i],path=tracerTrajectory(shot,state.aim,p).map((v,j)=>{const at=project(v);return `${j?'L':'M'}${at.x.toFixed(2)} ${at.y.toFixed(2)}`;}).join(' ');html+=`<path class="${phase==='shooting'?'shot-tracer':'shot-tracer complete'}" data-outcome="${shot.kind}" d="${path}" pathLength="100" stroke="${TRACER_COLORS[shot.kind]}" stroke-width="1.8" opacity=".78" style="animation-delay:${i*12}ms"/>`;}html+='</g>';}
 if(result){let path='';const theta=Math.atan2(state.aim.x,state.aim.y);for(let i=0;i<=48;i++){const t=i/48,forward=p.carry*t,lateral=p.carry*Math.tan(p.start*Math.PI/180)*t+(p.curve+p.bias)*t*t;const world={x:Math.sin(theta)*forward+Math.cos(theta)*lateral,y:Math.cos(theta)*forward-Math.sin(theta)*lateral,z:p.height*4*t*(1-t)};const at=project(world);path+=`${i?'L':'M'}${at.x.toFixed(1)} ${at.y.toFixed(1)} `;}
 html+=`<path d="${path}" fill="none" stroke="#fffced" stroke-width="2" opacity=".78"/>`+line(mean.landing,mean,'stroke="#fffced" stroke-width="2" stroke-dasharray="4 4" opacity=".8"');
 // Joint 80% core contour, including correlation and the mean flight transform.
 for(const [aim,color,id] of [[best.aim,'#5195cc','idealContour'],[state.aim,'#e5ab53','yourContour']]){let contour=[];for(let i=0;i<64;i++){const t=i/64*Math.PI*2,pt=shotAt(aim,{...patternAtTarget(aim,p),bigPct:0},{z1:1.794*Math.cos(t),z2:1.794*Math.sin(t),u:1,sign:1});contour.push([pt.x,pt.y]);}html+=`<polygon id="${id}" points="${polygon(contour)}" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-dasharray="${id==='idealContour'?'7 4':'none'}" stroke-width="2.5"/>`;}
 html+='<g id="idealCloud">';for(let i=0;i<best.result.points.length;i+=16){const shot=best.result.points[i],at=project(shot);html+=`<circle data-outcome="${shot.kind}" cx="${at.x.toFixed(2)}" cy="${at.y.toFixed(2)}" r="2" fill="none" stroke="${TRACER_COLORS[shot.kind]}" stroke-width="1.2" opacity=".6"/>`;}html+='</g>';
 html+='<g id="shotCloud">';for(let i=0;i<result.points.length;i+=8){const shot=result.points[i],at=project(shot);html+=`<circle data-outcome="${shot.kind}" cx="${at.x.toFixed(2)}" cy="${at.y.toFixed(2)}" r="${shot.big?3.5:2.5}" fill="${TRACER_COLORS[shot.kind]}" stroke="#29422e" stroke-width=".65" opacity=".95"/>`;}html+='</g>';
  const b=project(best.aim);html+=line(zero,best.aim,'stroke="#5195cc" stroke-width="1.5" stroke-dasharray="3 6" opacity=".65"');html+=`<g transform="translate(${b.x},${b.y})"><path d="M0-10L8 0 0 10-8 0Z" fill="#27608a" stroke="#acd6f3" stroke-width="2"/></g>`;
 }
 if(result){const m=project(mean);html+=`<g id="meanFinish" transform="translate(${m.x},${m.y})"><circle r="5" fill="#fffef2" stroke="#244b34" stroke-width="2"/><circle r="9" fill="none" stroke="#fffef2" stroke-width="1"/></g>`;}
 if(oneShot){const o=project(oneShot);html+=`<circle cx="${o.x}" cy="${o.y}" r="10" fill="#f9f4df" stroke="#c76849" stroke-width="3"/><text x="${o.x+14}" y="${o.y-10}" font-size="11" fill="#fffef2" paint-order="stroke" stroke="#365340" stroke-width="3">${NAMES[oneShot.kind]}</text>`;}
 if(hasAim)html+=`<g id="aimMarker" transform="translate(${a.x},${a.y})"><circle r="12" fill="#254c3a99" stroke="#ebc782" stroke-width="2"/><circle r="3" fill="#ebc782"/><path d="M-18 0h8M10 0h8M0-18v8M0 10v8" stroke="#ebc782" stroke-width="1.5"/></g>`;
 if(!map){html+=`<path d="M0 552Q220 541 430 551T960 547V580H0Z" fill="${theme.rough[1]}" opacity=".55"/><ellipse cx="480" cy="549" rx="9" ry="2.5" fill="#29493055"/><circle cx="480" cy="545" r="4.5" fill="url(#ball)"/><path d="M480 549v5" stroke="#e0d2ab" stroke-width="1.5"/>`;}
 else{const z=project(zero);html+=`<circle cx="${z.x}" cy="${z.y}" r="5" fill="#fffdf0" stroke="#557c50"/><text x="${z.x+12}" y="${z.y+4}" font-size="10" fill="#6f8565">YOUR BALL</text>`;}
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
 $('lessonTitle').textContent=assessment.label+' — why?';$('lessonWhy').textContent=lesson.why;$('lessonPrinciple').textContent=lesson.principle;$('lessonAction').textContent=lesson.action;$('lessonLimit').textContent=lesson.note;
 $('lessonRows').innerHTML=lesson.rows.map(row=>`<tr><th scope="row">${escapeHTML(row.label)}</th><td>${escapeHTML(row.you)}</td><td>${escapeHTML(row.best)}</td></tr>`).join('');$('progressSaved').textContent=progressMessage;
 $('decisionVerdict').setAttribute('data-kind',assessment.kind);$('decisionReason').textContent=assessment.reason;
 $('scoreCircle').style.borderColor=score>=85?'#9bb773':score>=60?'#cba96e':'#c78169';
 $('resultTitle').textContent=assessment.kind==='balanced'?'A sound target.':'A better target is available.';
 $('resultSummary').textContent=!Number.isFinite(b.expected)?'Every sampled target produced only OB shots. Adjust the shot pattern.':regret<.05?'Your target is close to the best sampled direction and depth.':`Best sampled target: ${sided(best.aim.x)}, ${Math.round(best.pattern.carry)} yd carry.`;
 $('expectedValue').textContent=Number.isFinite(r.expected)?r.expected.toFixed(2):'∞';$('uncertainty').textContent=Number.isFinite(r.expected)?`± ${(1.96*r.se).toFixed(2)} · approximate 95% sampling error`:'Every simulated shot was OB';
 $('regretValue').textContent=!Number.isFinite(b.expected)?'—':Number.isFinite(regret)?`+${regret.toFixed(2)}`:'∞';$('penaltyValue').textContent=(r.penalty*100).toFixed(1)+'%';
 $('shownCount').textContent=`4,000 simulated · 500 plotted · ${best.evaluated} targets compared`;
 const order=['green','fairway','rough','bunker','trees','water','ob'];
 $('outcomeBar').innerHTML=order.map(k=>`<div style="width:${r.counts[k]/r.n*100}%;background:${COLORS[k]}" title="${NAMES[k]}: ${(r.counts[k]/r.n*100).toFixed(1)}%"></div>`).join('');
 $('outcomeBreakdown').innerHTML=order.filter(k=>r.counts[k]>0).map(k=>`<span><i style="background:${COLORS[k]}"></i>${NAMES[k]} <strong>${(r.counts[k]/r.n*100).toFixed(1)}%</strong></span>`).join('');
 const penaltyGain=(r.penalty-b.penalty)*100,dx=best.aim.x-state.aim.x,dy=best.pattern.carry-state.pattern.carry;
 let note=!Number.isFinite(b.expected)?'No sampled target avoids an all-OB pattern. Adjust the shot settings; the comparison is not meaningful here.':regret<.05?'A bad single outcome can still follow a good decision.':`The comparison moves the target ${sided(dx)} and ${Math.abs(dy).toFixed(0)} yd ${dy>=0?'more carry':'less carry'}. It saves about ${Number.isFinite(regret)?regret.toFixed(2):'many'} expected strokes.`;
 if(penaltyGain>1)note+=` Water / OB exposure falls by ${penaltyGain.toFixed(1)} percentage points.`;
 if(s.type==='approach'&&Math.hypot(best.aim.x-s.pin.x,best.aim.y-s.pin.y)>8)note+=' The flag and the best target do not have to be the same point.';
 $('coachNote').textContent=(lesson.hazardDetail||lesson.why)+'\n\n'+lesson.action+'\n\n'+(lesson.hazardDetail?'':note)+(state.pattern.autoBag?` Your ${state.pattern.club}${state.pattern.customBag?'':' estimate'}: ${Math.round(state.pattern.carry+state.pattern.roll)} yd. Comparison: ${best.pattern.club}, ${Math.round(best.pattern.carry+best.pattern.roll)} yd. ${state.pattern.customBag?'Comparison uses your saved club settings, scaled to that distance.':'Shorter clubs use narrower patterns.'}`:' Custom dispersion stays fixed as target depth changes.')+' Off-frame finishes count in the totals.';$('oneOutcome').textContent='A single shot can reward a poor decision. Judge the full pattern.';
 updateLabels();drawCourse();if(immersive)$('feedbackToggle').focus?.();
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function zoomToLanding(camera){
 phase='zooming';landingCamera=camera;transition={camera,progress:0};updateLabels();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||typeof requestAnimationFrame!=='function'){transition.progress=1;drawCourse();return;}
 await new Promise(resolve=>{let started;function frame(now){started??=now;const t=Math.min(1,(now-started)/650);transition.progress=t*t*(3-2*t);drawCourse();if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
}
async function run(newSeed=false){
 if(working||!hasAim||round?.kind==='assessment'&&roundRecorded())return;if(newSeed)state.seed=(state.seed+7919)%2147483646||1;
 resetAimZoom();working=true;phase='calculating';result=null;best=null;oneShot=null;state.view='pov';$('results').hidden=true;
 $('newShots').disabled=true;$('simulate').innerHTML='Calculating 4,000 shots…';updateLabels();drawCourse();
 const snapshot=JSON.stringify(state);await wait(30);
 try{
  const zs=samples(4000,state.seed),r=evaluate(state.aim,state.pattern,scene(),state.costs,zs,true),b=await optimizeTargets(state.aim,state.pattern,scene(),state.costs,zs,()=>wait(0));
  const comparison={aim:b.aim,pattern:b.pattern,evaluated:b.evaluated,result:evaluate(b.aim,b.pattern,scene(),state.costs,zs,true)};
  if(snapshot!==JSON.stringify(state)){toast('Settings changed. Commit the updated target.');return;}
  if(round?.kind==='assessment'&&round.status==='active'){
   traceShots=tracerSample(r.points);phase='shooting';updateLabels();drawCourse();
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await wait(2200);
   recordRoundDecision(r,comparison);phase='assessment-review';transition=null;hasAim=false;result=null;best=null;save();updateLabels();drawCourse();return;
  }
  traceShots=tracerSample(r.points);phase='shooting';$('simulate').innerHTML='Shots in flight…';updateLabels();drawCourse();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await wait(2200);
  await zoomToLanding(comparisonCamera(comparison));
  transition=null;traceShots=[];phase='review';result=r;best=comparison;state.view='map';recordRoundDecision(r,comparison);recordDecision();showResult();save();
 }
 catch(error){console.error(error);phase='choose';traceShots=[];transition=null;drawCourse();toast('Simulation failed. Reset the pattern and try again.');}
 finally{working=false;$('newShots').disabled=false;updateLabels();}
}
for(const key of KEYS)$(key).addEventListener('input',()=>{
 if(!editorDraft)return;const el=$(key),v=key==='bigDirection'?el.value:Number(el.value);
 if(key!=='bigDirection'&&(el.value===''||!Number.isFinite(v)||v<Number(el.min)||v>Number(el.max))){editorInvalid.add(key);renderEditor();return;}
 editorInvalid.delete(key);const p=editorPattern();p[key]=key==='bigDirection'?(['left','right','both'].includes(v)?v:'both'):v;changeDraft(p);renderEditor(key);
});
$('club').addEventListener('change',()=>{if(!editorDraft||editorInvalid.size)return;if(editorDraft.some(c=>c.club===$('club').value))editorClub=$('club').value;renderEditor();});
for(const id of ['flightEditor','heightEditor']){
 $(id).addEventListener('pointerdown',e=>{if(!editorDraft||editorInvalid.size||e.button!==undefined&&e.button!==0)return;const at=editorPoint($(id),e);if(!at)return;const p=editorPattern(),q=flightHandles(p),handles=id==='heightEditor'?[{key:'height',x:300,y:166-p.height*2.4}]:[{key:'mid',x:300+FLIGHT_PIXEL*q.mid,y:215},{key:'end',x:300+FLIGHT_PIXEL*q.end,y:60}];const h=handles.find(h=>Math.hypot(h.x-at.x,h.y-at.y)<=(e.pointerType==='touch'?48:32));if(!h)return;editorDrag=h.key;$(id).setPointerCapture?.(e.pointerId);e.preventDefault?.();dragEditor(id,e);});
 $(id).addEventListener('pointermove',e=>{if(editorDrag&&(e.buttons===1||e.pointerType==='touch'))dragEditor(id,e);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])$(id).addEventListener(type,()=>{editorDrag=null;});
}
$('straightFlight').addEventListener('click',()=>{if(!editorDraft)return;changeDraft({...editorPattern(),start:0,curve:0});editorInvalid.delete('start');editorInvalid.delete('curve');renderEditor();});
$('reset').addEventListener('click',()=>{if(!editorDraft)return;const defaults=defaultMemberBag(basic()).find(c=>c.club===editorClub);editorDraft[editorDraft.findIndex(c=>c.club===editorClub)]=defaults;editorInvalid.clear();renderEditor();});
$('cancelEditor').addEventListener('click',closeEditor);$('saveEditor').addEventListener('click',saveEditor);
$('menuToggle').addEventListener('click',()=>{if(working||editorDraft||progressOpen)return;$('practiceMenu').hidden=!$('practiceMenu').hidden;$('menuToggle').setAttribute('aria-expanded',!$('practiceMenu').hidden);});
for(const el of document.querySelectorAll('[data-cost]'))el.addEventListener('input',()=>{if(working||result||state.mode!=='advanced'||el.value===''||!Number.isFinite(Number(el.value)))return;state.costs[el.dataset.cost]=clamp(Number(el.value),Number(el.min),Number(el.max));state.memberCosts={...state.costs};dirty();});
for(const el of document.querySelectorAll('[data-cost]'))el.addEventListener('change',()=>{el.value=state.costs[el.dataset.cost];});
for(const axis of ['X','Y'])$('aim'+axis).addEventListener('input',()=>{if(working||result)return;if(axis==='Y'){chooseDepth(Number($('aimY').value));return;}state.aim.x=Number($('aimX').value);hasAim=true;syncTargetDistance();updateControls();dirty();});
function coursePoint(e){const svg=$('course'),point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const ct=svg.getScreenCTM();return ct?point.matrixTransform(ct.inverse()):null;}
function courseTap(e){return{at:Number.isFinite(e.timeStamp)?e.timeStamp:performance.now(),x:e.clientX,y:e.clientY,type:e.pointerType||'mouse'};}
$('course').addEventListener('pointerdown',e=>{
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
 state.aim.x=Math.round(clamp(w.x/w.y*state.aim.y,...(state.pattern.aimXRange||[-60,60])));hasAim=true;syncTargetDistance();updateControls();dirty();lastCourseTap={...tap,before};
});
$('course').addEventListener('dblclick',e=>{if(working||result||editorDraft||progressOpen||e.button!==undefined&&e.button!==0)return;e.preventDefault?.();const tap={...courseTap(e),type:'mouse'};if(isDoubleAimTap(lastDoubleAimTap?{...lastDoubleAimTap,type:'mouse'}:null,tap))return;const local=coursePoint(e);if(local)toggleAimZoom(local);});
$('aimZoomToggle').addEventListener('click',()=>toggleAimZoom());
for(const [id,filter] of [['teeTab','tee'],['approachTab','approach'],['mixedTab','mixed']])$(id).addEventListener('click',()=>practiceFilter(filter));
for(const [id,view] of [['povBtn','pov'],['mapBtn','map']])$(id).addEventListener('click',()=>{if(!result||working)return;state.view=view;save();updateLabels();drawCourse();});
$('simulate').addEventListener('click',()=>run());$('newShots').addEventListener('click',()=>run(true));
$('useBest').addEventListener('click',()=>{if(best&&!working){state.aim={...best.aim};hasAim=true;syncTargetDistance();updateControls();dirty();}});
$('tryAgain').addEventListener('click',()=>{if(working||!result)return;if(round){if(round.status==='complete')showRoundScreen();else nextRoundSlot();return;}state.seed=(state.seed+7919)%2147483646||1;setScenario(nextScenario(state.scenario,state.practiceFilter,state.seed,state.recent),state.seed);});
$('retryThisHole').addEventListener('click',()=>{if(working||!result)return;resetAimZoom();if(!retryValid()){retryBaseline={encounter:state.encounter,profile:currentProfile(),seed:state.seed,aim:{...state.aim},pattern:structuredClone(state.pattern),result:{expected:result.expected,penalty:result.penalty},score:Number.isFinite(best.result.expected)?decisionScore(result.expected,best.result.expected,state.aim,best.aim):null};}retryHint=decisionLesson(state.aim,state.pattern,result,best,scene(),decisionFeedback(state.aim,state.pattern,result,best,scene())).action;hasAim=false;syncTargetDistance();updateControls();dirty();$('aimX').focus?.();});
$('basicHandicap').addEventListener('change',()=>{if(working||result||state.mode!=='basic'||round?.answers.length)return;state.basicHandicap=$('basicHandicap').value;if(refreshRoundProfile())return;state.pattern=basic();syncTargetDistance();updateControls();dirty();});
$('terrainToggle').addEventListener('click',()=>{if(working||result)return;resetAimZoom();state.elevated=!state.elevated;save();updateLabels();drawCourse();});
$('driverLimit').addEventListener('change',()=>{if(working||result||round?.answers.length)return;state.basicLimits[state.basicHandicap]=num($('driverLimit').value,180,330,DRIVER_LIMITS[state.basicHandicap]);if(refreshRoundProfile())return;if(state.mode==='basic')state.pattern=basic();updateControls();dirty();});
$('driverLimitReset').addEventListener('click',()=>{if(working||result||round?.answers.length)return;delete state.basicLimits[state.basicHandicap];if(refreshRoundProfile())return;if(state.mode==='basic')state.pattern=basic();updateControls();dirty();});
$('basicMode').addEventListener('click',()=>setMode('basic'));$('advancedMode').addEventListener('click',openEditor);
$('playOne').addEventListener('click',()=>{if(!result)return;const rng=random(state.seed+Math.floor(performance.now()));oneShot=result.points[Math.floor(rng()*result.n)];$('oneOutcome').textContent=`${NAMES[oneShot.kind]} · ${Math.round(oneShot.y)} yd forward, ${sided(oneShot.x)}${oneShot.big?' · big-miss component':''}. This is one draw from your pattern.`;drawCourse();});
for(const id of ['modelTop','modelFooter'])$(id).addEventListener('click',()=>{$('assumptions').hidden=!$('assumptions').hidden;if(!$('assumptions').hidden)$('assumptions').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
$('decisionVerdict').addEventListener('click',()=>{if(!result)return;$('decisionLesson').hidden=!$('decisionLesson').hidden;$('decisionVerdict').setAttribute('aria-expanded',!$('decisionLesson').hidden);});
for(const id of ['progressMenu','progressResult'])$(id).addEventListener('click',openProgress);
$('closeProgress').addEventListener('click',closeProgress);
$('progressProfile').addEventListener('change',()=>{progressSelection=$('progressProfile').value;renderProgress();});
$('progressType').addEventListener('change',()=>{progressType=['all','tee','approach'].includes($('progressType').value)?$('progressType').value:'all';renderProgress();});
$('brandName').textContent=BRAND.name;$('brandFooter').textContent=BRAND.name;document.title=BRAND.title;
if(round?.status==='active'){
 state.mode='basic';state.basicHandicap=round.profile.handicap;state.basicLimits[round.profile.handicap]=round.profile.limit;state.costs={...DEFAULT_COSTS};state.practiceMode='round';loadRoundSlot();
}else if(round?.status==='complete'){showRoundScreen();}
else if(state.practiceMode!=='free'){startRound('practice');}
updateControls();drawCourse();save();
