// Authored topology keeps randomized versions playable and understandable.
export const EXTRA_HOLES=[
 {id:'drivable',type:'tee',name:'Go for the green?',tag:'Drivable par 4 · pond right',hole:'05',par:4,length:258,pin:{x:4,y:258},maxY:290,aimY:250,aimRange:[130,285],bounds:[-62,58],
  brief:'A short par 4 offers a wedge layup or a drive at the green. A pond and front bunker punish the ambitious line; the wider fairway ends before the green.',
  fairway:[[-12,0],[12,0],[24,70],[29,145],[24,190],[15,228],[-15,228],[-25,190],[-30,145],[-23,70]],green:{x:0,y:254,rx:20,ry:17},
  hazards:[{kind:'water',label:'Right pond',poly:[[24,190],[58,183],[58,279],[24,277],[20,267],[22,234]],drop:{x:15,y:187}},{kind:'bunker',label:'Front bunker',poly:[[-17,222],[7,220],[17,232],[9,237],[-10,237],[-21,232]]}],labels:[{x:38,y:238,text:'WATER'},{x:-4,y:230,text:'SAND'}]},
 {id:'narrow',type:'tee',name:'Thread the needle',tag:'Narrow par 4 · OB both sides',hole:'07',par:4,length:392,pin:{x:0,y:392},maxY:425,aimY:250,aimRange:[130,300],bounds:[-26,26],
  brief:'White stakes line both sides of this narrow par 4. A shorter club can tighten the pattern, but leaves a longer approach. Choose the tradeoff.',
  fairway:[[-9,0],[9,0],[17,90],[16,160],[12,235],[11,285],[16,367],[-16,367],[-11,285],[-12,235],[-16,160],[-17,90]],green:{x:0,y:392,rx:15,ry:18},
  hazards:[{kind:'bunker',label:'Right bunker',poly:[[14,212],[24,215],[24,238],[17,245],[12,237]]}],labels:[{x:-29,y:270,text:'OB'},{x:29,y:250,text:'OB'},{x:19,y:227,text:'SAND'}]},
 {id:'bowl',type:'approach',name:'Front edge, back trouble',tag:'125 yards · sand short · water long',hole:'06',par:4,length:125,pin:{x:-4,y:125},maxY:175,aimY:125,aimRange:[70,160],bounds:[-56,56],
  brief:'A short approach to a wide green. A bunker guards the front edge and water waits beyond the back. Set depth carefully instead of only aiming left or right.',
  fairway:[[-12,0],[12,0],[22,65],[18,105],[-20,105],[-24,65]],green:{x:0,y:124,rx:25,ry:16},
  hazards:[{kind:'bunker',label:'Front bunker',poly:[[-18,93],[12,95],[17,104],[6,108],[-16,106],[-23,101]]},{kind:'water',label:'Back pond',poly:[[-45,147],[-13,146],[12,148],[45,143],[53,169],[-48,174]],drop:{x:-29,y:143}}],labels:[{x:-3,y:101,text:'SAND'},{x:23,y:160,text:'WATER'}]},
 {id:'split',type:'approach',name:'The long approach',tag:'190 yards · bunkers both sides',hole:'08',par:4,length:190,pin:{x:4,y:190},maxY:240,aimY:190,aimRange:[120,225],bounds:[-57,57],
  brief:'A longer approach calls for a longer club and a wider pattern. Two greenside bunkers squeeze the entrance, while a short layup leaves a straightforward next shot.',
  fairway:[[-12,0],[12,0],[25,70],[27,120],[18,166],[-18,166],[-27,120],[-25,70]],green:{x:0,y:192,rx:23,ry:22},
  hazards:[{kind:'bunker',label:'Left bunker',poly:[[-38,167],[-20,162],[-18,173],[-23,192],[-36,195],[-43,180]]},{kind:'bunker',label:'Right bunker',poly:[[22,165],[39,173],[42,194],[29,204],[24,188],[20,179]]},{kind:'trees',label:'Back recovery',poly:[[-48,224],[47,224],[51,239],[-51,239]]}],labels:[{x:-30,y:180,text:'SAND'},{x:32,y:188,text:'SAND'},{x:0,y:232,text:'TREES'}]},
 {id:'par5-open',type:'approach',secondShot:true,name:'Par 5: the open invitation',tag:'215 yards · par 5 second shot',hole:'09',par:5,length:215,pin:{x:2,y:215},maxY:265,aimY:215,aimRange:[90,260],bounds:[-65,65],
  brief:'Your second shot on a par 5. A broad fairway runs into an open green. Compare going for it with a shorter layup; your available club distance matters.',
  fairway:[[-13,0],[13,0],[28,65],[33,125],[31,175],[25,214],[-25,214],[-31,175],[-33,125],[-28,65]],green:{x:0,y:215,rx:25,ry:23},
  hazards:[{kind:'bunker',label:'Right greenside bunker',poly:[[29,204],[40,208],[44,225],[34,235],[27,224]]}],labels:[{x:35,y:217,text:'SAND'}]},
 {id:'par5-carry',type:'approach',secondShot:true,name:'Par 5: earn the carry',tag:'238 yards · par 5 second shot · water short',hole:'10',par:5,length:238,pin:{x:5,y:238},maxY:295,aimY:230,aimRange:[90,280],bounds:[-64,64],
  brief:'Your second shot on a par 5. A wide layup area ends before a pond guarding the green. Choose a distance you can reliably carry, or leave a shorter next shot.',
  fairway:[[-13,0],[13,0],[29,70],[34,120],[32,165],[26,183],[-26,183],[-32,165],[-34,120],[-29,70]],green:{x:0,y:241,rx:24,ry:20},
  hazards:[{kind:'water',label:'Front carry pond',poly:[[-48,194],[-15,191],[18,195],[49,193],[52,218],[20,221],[-15,219],[-50,216]],drop:{x:0,y:185}},{kind:'bunker',label:'Right greenside bunker',poly:[[28,227],[43,229],[46,247],[34,259],[26,247]]}],labels:[{x:0,y:205,text:'WATER'},{x:36,y:242,text:'SAND'}]}

];

// Additional authored fallbacks for the expanded strategic generator.
EXTRA_HOLES.push(
 {id:'sharp-dogleg',type:'tee',name:'The sharp corner',tag:'Sharp dogleg · inside sand',hole:'11',par:4,length:389,pin:{x:80,y:380},maxY:420,aimY:230,aimRange:[125,320],aimXRange:[-120,120],bounds:[-70,145],green:{x:80,y:380,rx:18,ry:19},
 brief:'A sharp corner forces a choice between stopping before the bend and carrying toward the second landing area.',fairway:[[-10,0],[10,0],[20,170],[20,200],[85,250],[98,350],[96,380],[64,380],[60,350],[55,265],[-20,215],[-20,170]],hazards:[{kind:'bunker',label:'Inside bunker',poly:[[23,180],[39,183],[56,215],[35,213]]}],labels:[{x:38,y:200,text:'SAND'}]},
 {id:'creek-tee',type:'tee',name:'The awkward creek',tag:'Creek across the landing area',hole:'12',par:4,length:395,pin:{x:0,y:395},maxY:430,aimY:240,aimRange:[110,320],bounds:[-75,75],green:{x:0,y:395,rx:19,ry:19},
 brief:'A creek cuts across the landing area. Compare stopping short with carrying it, including where rollout ends.',fairway:[[-10,0],[10,0],[25,100],[22,190],[18,250],[20,380],[-20,380],[-18,250],[-22,190],[-25,100]],hazards:[{kind:'water',label:'Crossing creek',poly:[[-70,202],[70,210],[70,230],[-70,222]],drop:{x:0,y:188}}],labels:[{x:0,y:217,text:'CREEK'}]},
 {...structuredClone(EXTRA_HOLES[0]),id:'squeeze-par4',name:'The shrinking invitation',tag:'Short par 4 · tight green entrance',hole:'13',brief:'The fairway is generous for a layup, then narrows toward a guarded green. Extra distance brings extra danger.'},
 {id:'creek-par3',type:'approach',name:'Par 3: across the creek',tag:'165 yards · par 3 · creek short',hole:'14',par:3,length:165,pin:{x:0,y:165},maxY:215,aimY:165,aimRange:[65,205],bounds:[-65,65],green:{x:0,y:165,rx:19,ry:18},
 brief:'A creek and a smaller green make both distance and direction important. A safe short shot remains available.',fairway:[[-10,0],[10,0],[24,60],[23,140],[18,165],[-18,165],[-23,140],[-24,60]],hazards:[{kind:'water',label:'Front creek',poly:[[-58,100],[58,106],[58,126],[-58,120]],drop:{x:0,y:88}},{kind:'bunker',label:'Right bunker',poly:[[24,151],[37,154],[39,175],[26,178]]}],labels:[{x:0,y:114,text:'CREEK'},{x:30,y:166,text:'SAND'}]}
);
