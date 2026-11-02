// Read-only Git audit. Fetch refs separately; this script only writes reports.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const file=process.argv[2],ref=process.argv[3]||'origin/docs/consolidation-and-hole-variety';
if(!file)throw Error('Pass saved output of git ls-remote --heads origin');
const baseline=git('rev-parse',ref+'^{commit}'),main=git('rev-parse','origin/main^{commit}');
const branches=fs.readFileSync(file,'utf8').trim().split('\n').map(line=>{
 const [sha,head]=line.split('\t');if(!/^[a-f0-9]{40}$/.test(sha)||!head?.startsWith('refs/heads/'))throw Error('Invalid remote branch snapshot');
 const name=head.slice('refs/heads/'.length),uniqueCommits=Number(git('rev-list','--count',`${baseline}..${sha}`)),behindBaseline=Number(git('rev-list','--count',`${sha}..${baseline}`));
 return {name,sha,uniqueCommits,behindBaseline,included:uniqueCommits===0,recommendation:name==='main'?'Keep main; candidate promotion pending':sha===baseline?'Keep candidate / active planning branch':uniqueCommits?'Review unique work; do not retire':'Potential retirement only after promotion, backup and approval'};
}).sort((a,b)=>a.name.localeCompare(b.name));
const local=git('for-each-ref','--format=%(refname:short) %(objectname)','refs/heads').split('\n').map(line=>{const [name,sha]=line.split(' ');return{name,sha,uniqueCommits:Number(git('rev-list','--count',`${baseline}..${sha}`)),remoteNamePresent:branches.some(b=>b.name===name)};});
const report={baselineRef:ref,baseline,main,mainBehind:Number(git('rev-list','--count',`${main}..${baseline}`)),mainUnique:Number(git('rev-list','--count',`${baseline}..${main}`)),filesChangedFromMain:git('diff','--name-only',main,baseline).split('\n').filter(Boolean).length,remoteCount:branches.length,includedCount:branches.filter(b=>b.included).length,uniqueBranchCount:branches.filter(b=>b.uniqueCommits).length,local,tags:git('tag','--list').split('\n').filter(Boolean),branches};
fs.writeFileSync(new URL('../docs/BRANCH-AUDIT.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
const quote=x=>'"'+String(x).replaceAll('"','""')+'"';
fs.writeFileSync(new URL('../docs/BRANCH-AUDIT.csv',import.meta.url),[['Branch','Commit','Commits outside baseline','Commits behind baseline','Included','Recommendation'],...branches.map(b=>[b.name,b.sha,b.uniqueCommits,b.behindBaseline,b.included,b.recommendation])].map(r=>r.map(quote).join(',')).join('\n')+'\n');
console.log(JSON.stringify({baseline,remoteBranches:report.remoteCount,included:report.includedCount,uniqueBranches:report.uniqueBranchCount,mainBehind:report.mainBehind,localOnlyNames:local.filter(b=>!b.remoteNamePresent).map(b=>b.name)}));
