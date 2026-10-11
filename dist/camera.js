// A standing golfer's eye height: 1.70 m, expressed in the model's yard units.
export const EYE_CAMERA={height:1.7/.9144,behindBall:6,focal:1000,horizon:235,center:480};
// The golfer remains 1.7 m above the tee. Ground descends over the first 80 yd.
export function terrainDrop(y,elevationM=0){return elevationM/.9144*Math.max(0,Math.min(1,y/80));}
export function projectEye(p,elevationM=0){const depth=Math.max(.5,p.y+EYE_CAMERA.behindBall);return{x:EYE_CAMERA.center+p.x*EYE_CAMERA.focal/depth,y:EYE_CAMERA.horizon+(EYE_CAMERA.height+terrainDrop(p.y,elevationM)-(p.z||0))*EYE_CAMERA.focal/depth};}
export function unprojectEye(x,y,elevationM=0){const u=Math.max(.00001,(y-EYE_CAMERA.horizon)/EYE_CAMERA.focal),drop=elevationM/.9144;const far=(EYE_CAMERA.height+drop)/u-EYE_CAMERA.behindBall;const groundY=far>=80?far:(EYE_CAMERA.height-EYE_CAMERA.behindBall*u)/(u-drop/80);const depth=groundY+EYE_CAMERA.behindBall;return{x:(x-EYE_CAMERA.center)*depth/EYE_CAMERA.focal,y:groundY};}
// Fit both core contours and aim points. Rare tails can leave the frame; totals still include them.
export function reviewCamera(mean,bestMean,p,{points}={}){
 const side=p.sdSide||0,long=p.sdLong||0;
 const bounds=points?.length?points:[mean,bestMean].flatMap(m=>[{x:m.x-side*2.2,y:m.y-long*2.2},{x:m.x+side*2.2,y:m.y+long*2.2}]);
 const xs=bounds.map(q=>q.x),ys=bounds.map(q=>q.y),left=Math.min(...xs),right=Math.max(...xs),near=Math.min(...ys),far=Math.max(...ys);
 const span=Math.max(52,far-near+16,(right-left+16)*460/864),mid=(near+far)/2;
 return {centerX:(left+right)/2,minY:mid-span/2,maxY:mid+span/2,scale:460/span};
}
export function projectReview(p,c){return{x:480+(p.x-c.centerX)*c.scale,y:525-(p.y-c.minY)*c.scale};}
// Scout map shows known terrain only. Its framing never depends on dispersion or ideal aim.
export function scoutCamera(s){const span=s.type==='tee'?200:130,width=320,height=240;return{width,height,centerX:(s.bounds[0]+s.bounds[1])/2,centerY:s.aimY,scale:Math.min((width-40)/(s.bounds[1]-s.bounds[0]+24),(height-36)/span),minY:s.aimY-span/2,maxY:s.aimY+span/2};}
export function projectScout(p,c){return{x:c.width/2+(p.x-c.centerX)*c.scale,y:c.height/2-(p.y-c.centerY)*c.scale};}
export function unprojectScout(x,y,c){return{x:c.centerX+(x-c.width/2)/c.scale,y:c.centerY-(y-c.height/2)/c.scale};}

// A terrain-only 2× crop of the existing eye-level image; no shot-pattern inputs.
export function aimZoomBox(point){const width=480,height=290;return{x:Math.max(0,Math.min(960-width,point.x-width/2)),y:Math.max(0,Math.min(580-height,point.y-height/2)),width,height};}
// Gesture distance uses CSS pixels, independent of the SVG crop and device density.
export function isDoubleAimTap(previous,next){return !!previous&&previous.type===next.type&&next.at>=previous.at&&next.at-previous.at<=(next.type==='touch'?350:500)&&Math.hypot(next.x-previous.x,next.y-previous.y)<=(next.type==='touch'?24:8);}
