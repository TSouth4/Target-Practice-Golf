// Stock bag and spread snapshot; independent of future preset edits.
import {basicPattern} from './model.js';
import {trainingBag} from './bag.js';
const fields=['driverSide','driverLong','ironSide','ironLong','height','start','curve','bias','rho','bigPct','bigShort','bigShift'];
const names=['Driver','3 wood','Hybrid','5 iron','6 iron','7 iron','8 iron','9 iron','PW','SW'];
export function validStockSnapshot(s){
 return s?.version===1&&['tee','approach'].every(type=>{
  const x=s[type];return x&&x.flight?.height>=5&&x.flight.height<=50&&Math.abs(x.flight.rho)<=.8&&['driverSide','driverLong','ironSide','ironLong','bigPct','bigShort','bigShift'].every(k=>x.flight[k]>=0)&&fields.every(k=>Number.isFinite(x.flight?.[k])&&Math.abs(x.flight[k])<=200)&&Array.isArray(x.bag)&&x.bag.length===(type==='tee'?10:9)&&new Set(x.bag.map(c=>c.club)).size===x.bag.length&&x.bag.every(c=>names.includes(c.club)&&(type==='tee'||c.club!=='Driver')&&['stock','roll','sdSide','sdLong'].every(k=>Number.isFinite(c[k])&&c[k]>=0&&c[k]<=500)&&c.stock>c.roll);
 });
}
export function snapshotProfile(profile){
 const p=structuredClone(profile);
 if(p.shotMode==='custom'||p.stockSnapshot)return p;
 p.stockSnapshot={version:1};
 for(const type of ['tee','approach']){
  const pattern={...basicPattern(p.handicap,{type,aimY:155},p.limit),aimMode:'carry'};
  p.stockSnapshot[type]={flight:Object.fromEntries(fields.map(k=>[k,pattern[k]])),bag:trainingBag(pattern)};
 }
 return p;
}
export function savedBasicPattern(profile,scene){
 const p={...basicPattern(profile.handicap,scene,profile.limit),aimMode:'carry'};
 if(profile.stockSnapshot){const saved=profile.stockSnapshot[scene.type];Object.assign(p,saved.flight,{autoBag:true,bigDirection:'both',stockBag:structuredClone(saved.bag)});}
 return p;
}

// Frozen pre-snapshot stock assumptions. Keep this migration unchanged when
// tuning live presets: unopened legacy rounds must not acquire future defaults.
export function pinLegacyProfile(profile){
 if(profile.shotMode==='custom'||profile.stockSnapshot)return snapshotProfile(profile);
 const presets={0:[11,9,5,6,32,18],5:[15,12,7,8,40,22],10:[20,16,10,11,48,28],20:[28,21,14,16,58,34]},[driverSide,driverLong,ironSide,ironLong,teeShift,approachShift]=presets[profile.handicap];
 const clubs=[['Driver',1,15,1],['3 wood',.89,10,.82],['Hybrid',.78,7,.66],['5 iron',.71,4,null],['6 iron',.66,3,null],['7 iron',.585,3,null],['8 iron',.53,2,null],['9 iron',.475,2,null],['PW',.415,1,null],['SW',.30,0,null]],p=structuredClone(profile);
 p.stockSnapshot={version:1};
 for(const type of ['tee','approach']){
  const bag=clubs.filter(c=>type==='tee'||c[0]!=='Driver').map(([club,f,roll,spread])=>{const stock=profile.limit*f-(type==='approach'?roll:0);return {club,stock,roll:type==='tee'?roll:0,sdSide:spread===null?ironSide*stock/155:driverSide*spread,sdLong:spread===null?ironLong*stock/155:driverLong*spread};});
  p.stockSnapshot[type]={flight:{driverSide,driverLong,ironSide,ironLong,height:type==='tee'?32:25,start:0,curve:0,bias:0,rho:0,bigPct:0,bigShort:0,bigShift:type==='tee'?teeShift:approachShift},bag};
 }
 return p;
}
