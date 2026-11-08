# Game-style introduction visuals — 17.18.10

The visual introduction keeps its existing story and controls flow, but now uses the game's standing-perspective rendering and flight style instead of the flat overview illustration.

## Shared game rendering

- Uses `projectSurface` with the same standing-camera projection and a fixed viewing elevation, `drawRelief`, `illustratedTheme`, `illustratedDefinitions`, `drawIllustratedPlant`, and the existing vegetation renderer.
- Flights use the unchanged `tracerTrajectory`, tracer animation class and `TRACER_COLORS`. The one-shot example has a highlighted path and ball animation.
- Uses the game's terrain classification for finish colors. The example hole is authored and fixed: green, visible right-side water, left bunker and woodland background.
- The aim practice graphic uses the same perspective background. Its marker and horizontal pointer mapping are adjusted to the new SVG coordinate system; direction/carry remain separate, ungraded decisions.
- Terrain markup is cached and first created when the introduction opens, avoiding an extra course render during ordinary startup.
- Generated SVG definition IDs are scoped separately for the story and controls, avoiding collisions with each other or the main game.

## Fixed teaching example

The ideal shot reaches the flag; the next slide shows a miss into water from the same starting position. Group examples animate 24 evenly selected flights from the fixed set, then fade those trails and leave all 100 finishing dots visible. Moving the target translates the same 100 offsets rather than drawing a new set. Colors change with the finishing terrain.

The camera, hole and offsets are fixed so comparisons remain repeatable. These are authored illustration positions, not a newly calibrated handicap distribution, scoring run or prediction. No random sample bank, optimization, scores, paid access or saved-round format changes. Existing Introduction wording, completion, skip/replay and assessment handoff remain intact.

Reduced-motion users receive the finished visual without the moving ball or flight group animation. Normal-motion animation replays correctly after changing that preference.

## Verification

- Relevant automated test files passed: controls tutorial, beginner setup, course art, tracers and Home.
- New checks confirm shared trajectory output, exactly 24 example flights/100 final dots, identical translated offsets, fewer water finishes after the target move, deterministic rendering, and unique SVG IDs.
- Existing tests continue to check direction/carry gates, keyboard/pointer input, skip/replay/completion, unchanged active round/profile and no practice scores saved.
- Chromium at 1440, 390 and 320 px checks the full intro, controls, reduced motion, completion persistence, assessment setup, no overflow and unchanged round/progress storage. Normal-motion checks verify the single flight and the 24-flight fade followed by 100 visible dots. Phone graphics were visually inspected.
- Syntax and prepared asset checks passed. The shared game renderer, trajectory, camera, grading and simulation modules themselves are unchanged.

Rebuild with `npm run prepare:assets`. Merge into the latest Work-hosted source while preserving its changes; this source branch does not publish the live app.
