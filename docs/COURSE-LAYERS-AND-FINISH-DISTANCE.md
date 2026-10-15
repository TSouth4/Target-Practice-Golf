# Par-3 finish distances and retained course layers — 17.8

## Finish feedback

The on-course finish panel now shows the distance left by the selected outcome before the existing aggregate short-game/putting simulation. Green distances use feet; chip/pitch, approach, bunker and recovery distances use yards. Water uses the stored relief location's distance and explicitly says “After the drop.” OB hides the distance label and retains re-tee instructions; a holed shot has no remaining shot.

The label derives from the existing `review.finish.distance` and `kind`. It does not generate a second selected ball, recalculate a finish, invent subsequent putt distances, alter hole scores, or require saved-round migration. Previously saved reviews already contain the necessary distance.

## Rendering refactor

`course-renderer.js` owns four ordered SVG groups: terrain, aim/planning marks, flight tracers, and feedback/shot clouds. `app.js` still builds the same SVG content in the same paint order. The renderer replaces a group's contents only when that group's complete markup changes. This preserves unchanged scenery and clouds, focusable hazard labels, and ongoing animations. Camera transitions, settings, full-screen gradients and changed scenarios invalidate layers through their actual rendered markup, rather than an incomplete list of settings keys.

A WeakMap holds only the latest four markup strings/nodes per SVG root. Clearing/replacing the root reconstructs its layers. Markup-only consumers use the original concatenated content. There are no new dependencies, stored caches, telemetry, scoring-model versions or hosting configuration changes. World projection, physics, shot sampling and saved-round handling remain in their existing code.

## Validation

Three renderer tests cover paint order, unchanged node reuse, selective updates, clearing old flights, independent roots and rebuilding a cleared root. The finish test covers putting, short putts, chips, approaches, bunkers, recovery, water relief, OB and hole-outs.

Browser checks compare the retained-layer renderer with the previous flat replacement injected into the same build. Easy tee and Hard approach fixtures at 1440 and 390 px produce byte-identical screenshots of the course SVG in both overhead and eye-level views, matching contour/dot/flag markup, and matching recorded scores/regret/categories. The tests verify that aim adjustments retain terrain nodes and unchanged review redraws retain shot-cloud nodes.

Additional browser checks cover green/rough/water/OB saved finish labels at 1440, 390 and 320 px, retaining the same saved review through reload and full screen. Normal-motion par-3 checks at 1440 and 390 px exercise animated tracers, dispersion fade, selected-ball coordinates, camera transition and finish feedback. Mobile aim, keyboard, hazard-label and touch-drag checks exercise the retained DOM interaction path.

## Performance observations

[Raw paired report](COURSE-LAYER-PERFORMANCE.json). Local Chromium on shared cloud hardware; no native regression suite running during measurement. One paired run per fixture and width: 40 direction changes and 30 unchanged review redraws. Durations include SVG string construction and DOM insertion, but not complete browser paint or real input latency. The phone result is a viewport width, not physical hardware certification.

| Width | Fixture | Median aim redraw, flat → layers | Median repeated review redraw, flat → layers |
| --- | --- | --- | --- |
| 1440 | Easy tee | 21.8 → 8.4 ms | 27.8 → 9.9 ms |
| 1440 | Hard approach | 11.2 → 5.1 ms | 12.8 → 6.0 ms |
| 390 | Easy tee | 21.1 → 9.0 ms | 26.7 → 9.8 ms |
| 390 | Hard approach | 10.9 → 5.5 ms | 13.8 → 6.6 ms |

These observations support reduced DOM replacement work in reusable views. They do not establish production percentiles or equivalent gains during changing-camera animation, when projected content must change. SVG strings, scene geometry, vegetation and terrain relief are still calculated on the page; further profiling can determine whether caching those inputs is worthwhile.

Deploy the complete matching `dist` folder, including `course-renderer.js`. The version includes the preceding home/mobile changes and carry-outline refactor. The frozen website wording-review documents are unchanged.

Final validation: all 210 native tests passed, with zero failures, skips or cancellations. JavaScript syntax checks, paired renderer screenshots/results, normal-motion/fade checks, saved finish/reload/full-screen checks, mobile aiming and touch-drag checks passed. The phone-width finish panel was also inspected visually.
