// Use existing first-choice history. No new storage keys or scoring rules.
export function achievementFor(score,{guided=false,assessment=false,retry=false}={}){
 if(score!==100||guided||assessment)return null;
 return {title:retry?'100 · Outstanding refinement':'100 · Outstanding first choice',note:retry?'You refined this target to an outstanding choice. Your original first-choice result stays unchanged.':'You gave the whole pattern an outstanding target. This rewards the decision, regardless of where one ball finishes.'};
}
export function hundredSummary(first,retries=[]){
 const recent=first.slice(-50),previous=first.slice(-100,-50),count=rows=>rows.filter(r=>r.score===100).length;
 return {count:count(recent),total:recent.length,rate:recent.length?100*count(recent)/recent.length:null,previousCount:count(previous),previousTotal:previous.length,previousRate:previous.length?100*count(previous)/previous.length:null,retryCount:count(retries)};
}
export function hundredTrendSVG(first){
 const data=first.slice(-100),offset=first.length-data.length,x=i=>data.length===1?350:50+i*600/(data.length-1),rate=i=>{const end=offset+i+1,rows=first.slice(Math.max(0,end-20),end);return 100*rows.filter(r=>r.score===100).length/rows.length;};
 let svg='<rect width="700" height="240" rx="8" fill="#fff9e8"/>';
 for(const n of [0,50,100])svg+=`<line x1="50" y1="${200-n*1.6}" x2="650" y2="${200-n*1.6}" stroke="#ded5bb"/><text x="40" y="${204-n*1.6}" text-anchor="end" fill="#665c40" font-size="12">${n}%</text>`;
 if(!data.length)return svg+'<text x="350" y="115" text-anchor="middle" fill="#665c40" font-size="14">Your first unassisted decision starts this trend.</text>';
 svg+=`<polyline points="${data.map((_,i)=>`${x(i).toFixed(1)},${(200-rate(i)*1.6).toFixed(1)}`).join(' ')}" stroke="#ad7a16" stroke-width="3" fill="none"/>`;
 data.forEach((_,i)=>{const n=Math.min(20,offset+i+1);svg+=`<circle cx="${x(i)}" cy="${200-rate(i)*1.6}" r="3" fill="#ad7a16"><title>Decision ${offset+i+1}: ${rate(i).toFixed(1)}% across ${n} first choices</title></circle>`;});
 return svg+`<text x="50" y="227" fill="#665c40" font-size="12">Decision ${offset+1}</text><text x="650" y="227" text-anchor="end" fill="#665c40" font-size="12">Decision ${first.length}</text>`;
}
export function goldPulseMarkup(at){return `<g class="gold-achievement" transform="translate(${at.x},${at.y})" aria-hidden="true"><circle class="gold-ring" r="18"/><circle class="gold-ring gold-ring-second" r="18"/>${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return `<circle class="gold-spark" cx="${Math.cos(a)*38}" cy="${Math.sin(a)*38}" r="3"/>`;}).join('')}</g>`;}
