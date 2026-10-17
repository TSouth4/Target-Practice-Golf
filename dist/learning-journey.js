import {MODEL_VERSION} from './progress.js';
// Editorial recommendations; these never change a grade or a shot.
export function learningRecommendation(decisions){
 const kinds=['aggressive','conservative','refine','balanced'],counts=kinds.map(kind=>({kind,n:decisions.filter(d=>d.kind===kind).length})).sort((a,b)=>b.n-a.n),top=counts[0];
 if(!decisions.length||top.n<=decisions.length/2)return {lesson:null,title:'Explore one change at a time',text:'There is no clear majority tendency in this small round. Try changing direction with carry fixed, then carry with direction fixed. Predict what will happen to the misses before comparing.'};
 const ideas={aggressive:['room','Give danger more room','Leave room for normal misses around the most costly trouble, then check how much useful distance that safety costs.'],conservative:['distance','Distance versus safety','Safety has a price when it leaves a harder next shot. Compare the trouble you avoid with the distance you give up.'],refine:['green','Choosing an approach target','Judge the whole pattern rather than the flag alone. Compare the room for misses and the shot you leave.'],balanced:[null,'Keep testing your judgment','Several targets can be sensible. Predict how a small change affects the whole pattern, then compare rather than judging one ball.']};
 const [lesson,title,principle]=ideas[top.kind];return {lesson,title,text:`${top.n} of your ${decisions.length} choices were ${top.kind==='balanced'?'strong':top.kind==='refine'?'in need of refinement':'too '+top.kind}. ${principle} This is a practice clue, not an established habit.`};
}
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export function assessmentSetting(profile){return JSON.stringify(canonical({handicap:profile.handicap,limit:profile.limit,difficulty:profile.difficulty||'easy',shotMode:profile.shotMode||'handicap',...(profile.shotMode==='custom'?{bag:profile.bag}:{})}));}
export function comparableAssessments(history,current){
 if(!current||current.kind!=='assessment'||current.model!==MODEL_VERSION)return {baseline:null,latest:null};
 const rows=history.filter(r=>r.kind==='assessment'&&r.model===current.model&&r.version===current.version&&assessmentSetting(r.profile)===assessmentSetting(current.profile)).sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt));
 return {baseline:rows[0]||null,latest:rows.at(-1)||null};
}
export function assessmentComparison(history,current){
 const {baseline}=comparableAssessments(history,current);if(!baseline||baseline.id===current.id)return 'This is your baseline for these settings. After practice, take another assessment with the same profile and difficulty to compare.';
 const avg=r=>r.decisions.reduce((n,d)=>n+d.score,0)/r.decisions.length,delta=avg(current)-avg(baseline),cost=r=>r.decisions.some(d=>d.regret===null)?null:r.decisions.reduce((n,d)=>n+d.regret*100,0)/r.decisions.length;
 const a=cost(baseline),b=cost(current);return `Compared with your first assessment at these settings: average decision score ${avg(baseline).toFixed(1)} → ${avg(current).toFixed(1)} (${delta===0?'unchanged':Math.abs(delta).toFixed(1)+' points '+(delta>0?'higher':'lower')}). ${a===null||b===null?'A finite strokes-lost comparison is unavailable.':`Estimated strokes lost per 100 similar decisions: ${a.toFixed(1)} → ${b.toFixed(1)}.`} Target-choice categories: too aggressive ${baseline.decisions.filter(d=>d.kind==='aggressive').length} → ${current.decisions.filter(d=>d.kind==='aggressive').length}; too conservative ${baseline.decisions.filter(d=>d.kind==='conservative').length} → ${current.decisions.filter(d=>d.kind==='conservative').length}. Different random holes and just 10 choices per test can move these results. This suggests a change in simulator decisions, not proof of lower scores on the course.`;
}
export function nextLearningStep(history,introduced,completedLessons=[]){
 if(!introduced)return {action:'introduction',label:'Recommended: Start Introduction',text:'Learn the controls and why we use carry and shot patterns.'};
 const rounds=history.filter(r=>r.model===MODEL_VERSION).sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt)),assessment=rounds.filter(r=>r.kind==='assessment').at(-1);
 if(!assessment)return {action:'assessment',label:'Recommended: Set your baseline',text:'Take the 10-shot assessment before strategy lessons. Feedback waits until the end.'};
 const practice=rounds.filter(r=>r.kind==='practice'&&Date.parse(r.completedAt)>Date.parse(assessment.completedAt));
 if(!practice.length)return {action:'learning',label:'Recommended: Try a 5-shot learning round',text:'Test adjustments with immediate feedback. Your first choices form the recap.'};
 const suggestion=learningRecommendation(practice.at(-1).decisions);
 if(suggestion.lesson&&!completedLessons.includes(suggestion.lesson))return {action:'lesson',lesson:suggestion.lesson,label:`Suggested lesson: ${suggestion.title}`,text:suggestion.text};
 if(practice.length>=2)return {action:'reassess',profile:assessment.profile,label:'Suggested: Check your progress',text:'Try another 10-shot assessment with your last assessment settings. New holes make this a fresh snapshot, not a memorization test.'};
 return {action:'learning',label:'Suggested: Practice another 5 shots',text:'Try applying the principle. After more practice, repeat the assessment with the same settings.'};
}
