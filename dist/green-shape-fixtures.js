import {greenPoint,greenBounds} from './green-geometry.js';
const degrees=n=>n*Math.PI/180;
export const GREEN_SHAPE_EXAMPLES=[
 {id:'left',name:'Long green angled left',rotation:35,rx:12,ry:27,pinAngle:Math.PI/2,waterSide:1},
 {id:'right',name:'Long green angled right',rotation:-35,rx:12,ry:27,pinAngle:Math.PI/2,waterSide:-1},
 {id:'wide',name:'Wide green at an angle',rotation:25,rx:27,ry:12,pinAngle:0,waterSide:0}
];
export function greenShapeScene(id){
 const f=GREEN_SHAPE_EXAMPLES.find(f=>f.id===id);if(!f)throw Error('Unknown green example');
 const green={x:0,y:155,rx:f.rx,ry:f.ry,rotation:degrees(f.rotation)},b=greenBounds(green),pin=greenPoint(green,f.pinAngle,.65);
 const s={id:'green-study-'+id,type:'approach',name:f.name,par:3,hole:'01',green,pin,maxY:225,aimY:155,aimRange:[100,200],bounds:[-75,75],elevationM:8,fairway:[[-12,0],[12,0],[25,130],[26,165],[-26,165],[-25,130]],hazards:[],labels:[]};
 if(f.waterSide){const side=f.waterSide,inner=side>0?b.maxX+6:b.minX-6,outer=side*65;s.hazards.push({kind:'water',label:side>0?'Right pond':'Left pond',poly:[[inner,125],[outer,125],[outer,195],[inner,195]],drop:{x:0,y:110}});const x=side>0?b.minX-12:b.maxX+12;s.hazards.push({kind:'bunker',label:'Side bunker',poly:[[x-4,145],[x+4,145],[x+4,163],[x-4,163]]});}
 else s.hazards.push({kind:'water',label:'Front water',poly:[[-58,b.minY-20],[58,b.minY-20],[58,b.minY-6],[-58,b.minY-6]],drop:{x:0,y:90}});
 s.length=Math.round(Math.hypot(pin.x,pin.y));return s;
}
