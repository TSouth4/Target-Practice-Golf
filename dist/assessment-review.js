// Presentation only: original scores and verdict categories remain unchanged.
export function decisionLabel(score,kind){
 const labels={balanced:'Strong decision',aggressive:'Too aggressive',conservative:'Too conservative',refine:'Target needs refining'};
 if(score>=95&&kind==='aggressive')return 'Strong decision · slightly aggressive';
 if(score>=95&&kind==='conservative')return 'Strong decision · slightly conservative';
 if(score>=95&&kind==='refine')return 'Strong decision · small adjustment available';
 return labels[kind]||'Decision unavailable';
}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function assessmentReviewHTML(round){
 if(round?.kind!=='assessment'||round.status!=='complete'||round.answers?.length!==round.schedule?.length)return '';
 return round.answers.map((a,i)=>{const note=a.review;return `<details class="assessment-shot"><summary>Shot ${i+1} — ${a.score}/100 · ${escape(decisionLabel(a.score,a.kind))}</summary>${note?`<p><strong>Your target:</strong> ${note.carry} yd intended carry.</p><h3>Why</h3><p>${escape(note.why)}</p><h3>How to improve</h3><p>${escape(note.principle)}</p><p>${escape(note.experiment)}</p>`:'<p>Detailed notes were not saved for this older assessment. Your original score and decision category are shown above.</p>'}<p class="micro">${a.regret===null?'A finite strokes-lost comparison was unavailable.':`Estimated strokes lost: ${a.regret.toFixed(2)} per shot (${(a.regret*100).toFixed(1)} per 100 similar decisions).`} Compared with the best target found in that simulation.</p></details>`;}).join('');
}
export function validAssessmentNote(note){return note===undefined||!!note&&typeof note==='object'&&Number.isFinite(note.carry)&&note.carry>=0&&note.carry<=1000&&['why','principle','experiment'].every(k=>typeof note[k]==='string'&&note[k].length<=3000);}
