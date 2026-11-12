// Opt-in layout version. Missing versions retain the original seeded geometry.
export const HOLE_VARIETY_VERSION='variety-v1';
export function varyGreen(g,seed){
 const shape=['balanced','wide','deep'][seed%3];
 if(shape==='wide'){g.rx=Math.max(g.rx,23+seed%5);g.ry=11+seed%3;}
 if(shape==='deep'){g.rx=11+seed%3;g.ry=24+seed%4;}
 g.shape=shape;return g;
}
export function addBackTrouble(s,seed){
 if(seed%4!==0)return; // Occasional, never every hole.
 const g=s.green,x=g.x,y=g.y+g.ry+13,rx=Math.min(g.rx,12),ry=5;
 const poly=[[x-rx,y-ry],[x+rx,y-ry],[x+rx+2,y+ry],[x-rx-2,y+ry]];
 // Leave existing back water/sand alone; do not layer conflicting hazards.
 const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);
 if(s.hazards.some(h=>Math.max(...h.poly.map(p=>p[0]))>=Math.min(...xs)&&Math.min(...h.poly.map(p=>p[0]))<=Math.max(...xs)&&Math.max(...h.poly.map(p=>p[1]))>=Math.min(...ys)&&Math.min(...h.poly.map(p=>p[1]))<=Math.max(...ys)))return;
 const recovery=seed%8===0;
 s.hazards.push({kind:recovery?'trees':'bunker',label:recovery?'Back recovery area':'Back bunker',poly,...(recovery?{forest:true,density:.8,height:9,recoveryMultiplier:1.1}:{})});
 if(!recovery)s.labels.push({x,y,text:'SAND'});
 s.maxY=Math.max(s.maxY,y+ry+12);s.backTrouble=recovery?'recovery':'bunker';
}
