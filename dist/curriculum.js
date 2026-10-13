import {baselineStrokes} from './strokes-baseline.js';
export const LESSON_KEY='target-practice-lessons-v1';
export const CURRICULUM_VERSION='lessons-v1-baseline-v6';
export const LESSON_PROFILE={handicap:'5',limit:265};
const sand20=(baselineStrokes('bunker',20)-baselineStrokes('fairway',20)).toFixed(2),sand60=(baselineStrokes('bunker',60)-baselineStrokes('fairway',60)).toFixed(2);
export const CURRICULUM=[
 {id:'trouble',title:'What trouble costs',description:'Understand penalties and harder next shots.',principle:'Give costly misses more room. Avoiding every possible miss is not the goal.',guided:{id:'water',seed:578},practice:{id:'water',seed:654},idea:'Aim beyond the front water so shorter finishes have more room. You accept a longer putt to reduce penalty risk.',intro:[
  {title:'OB and lost balls: stroke and distance',text:'The shot counts. Add one penalty stroke and play again from the previous spot. From the tee, you normally hit your third shot. A miss OB costs the stroke and penalty without advancing you.'},
  {title:'Water: penalty plus another shot',text:'A common penalty-area relief option adds one penalty stroke. Relief is based on where the ball last crossed the penalty-area edge; options depend on red or yellow markings. Our examples use a designated drop, followed by another shot.'},
  {title:'Bunkers: a harder shot, not an automatic penalty',text:`In our historical Tour reference, a 20 yd bunker shot costs about ${sand20} more strokes than a 20 yd fairway shot. At 60 yd the difference is about ${sand60}. Sand is not one fixed penalty, and these are reference-player averages, not your personal score.`},
  {title:'Rough and trees: consider the next shot',text:'Rough has its own distance-based cost. Trees can block the direct route and require recovery. In this simulator, denser woods have a higher recovery cost; tree height does not block airborne shots.'},
  {title:'Put the costs to work',text:'Give the most expensive miss more room, but consider what you give up. Now follow a target that reduces water exposure without laying up far from the green.'}
 ]},
 {id:'room',title:'Give danger more room',description:'Move the pattern away from the costly side.',principle:'Choose room for your misses, not just a line for your best shot.',guided:{id:'tucked',seed:17},practice:{id:'tucked',seed:21},idea:'Move toward the safer part of the green, away from the side pond. Your misses need room too.',intro:[
  {title:'Your target positions a whole pattern',text:'Even a straight-shot profile has left/right and short/long misses. A flag beside water can put part of that pattern in the penalty area.'},
  {title:'Give the costly side more room',text:'A target farther from the pond can reduce water exposure while leaving a manageable putt. The right adjustment depends on which side has the danger—not a rule to always aim left or right.'}
 ]},
 {id:'distance',title:'Distance versus safety',description:'Understand when laying back is worthwhile.',principle:'Compare the cost of the longer next shot with the risk the longer club adds.',guided:{id:'creek-tee',seed:6},practice:{id:'cedar',seed:3},idea:'Lay back before this crossing creek. The longer club reaches water too often for the distance gained to pay off.',intro:[
  {title:'Extra distance can help—or hurt',text:'A longer club can leave an easier approach, but that gain must pay for the extra trouble it brings into your pattern. In this example a creek makes the longer target expensive.'},
  {title:'Not every layback costs the same',text:'Our Tour reference adds about 0.065 strokes when the next fairway shot moves from 75 to 100 yd, versus 0.110 from 150 to 175 yd. Distance costs depend on where you start. In the independent example, decide again: do not assume laying back is always best.'}
 ]},
 {id:'green',title:'Choosing an approach target',description:'Find a useful target beyond the flag.',principle:'The flag is a destination for the ball, not automatically the best target for the full pattern.',guided:{id:'split',seed:20},practice:{id:'split',seed:22},idea:'Give the bunker beside this pin more room by moving toward the wider part of the green.',intro:[
  {title:'A tempting flag can crowd your misses',text:'A flag near sand or water may offer little room for a miss. A nearby target in the wider part of the green can leave slightly longer putts but fewer difficult recoveries.'},
  {title:'Choose useful room, not safety at any price',text:'Compare the entire pattern. Moving away from the flag helps only if the reduction in costly misses outweighs the proximity you give up. Follow the tested target, then try a second green without the hint.'}
 ]}
];
export function lessonById(id){return CURRICULUM.find(l=>l.id===id);}
export function nearLessonTarget(aim,target){return Math.hypot(aim.x-target.x,aim.y-target.y)<=4;}
export function readLessonCompletion(raw){try{const v=JSON.parse(raw);return v?.version===CURRICULUM_VERSION&&Array.isArray(v.completed)?[...new Set(v.completed.filter(id=>lessonById(id)))]:[];}catch{return[];}}
export function lessonFixture(lesson,independent=false){const fixture=independent?lesson.practice:lesson.guided;return{...fixture,drawSeed:7142026};}
