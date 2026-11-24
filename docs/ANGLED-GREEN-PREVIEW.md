# Angled oval green prototype — v17.18.16

## Owner review

Open Menu → **Angled green preview**, or `/green-shape-preview.html`, after Work integrates this branch. This is an isolated page with three fixed examples: long green leaning left, its mirrored right-leaning example, and a wide/shallow green rotated 25 degrees. Long examples use ±35 degrees. Normal play remains on the existing unrotated layout versions.

Choose a handicap (5 or 20), inspect eye level and bird’s-eye views, and aim at the flag, green center, or a direction/carry of your own. Commit uses the existing 4,000-shot evaluator and sampled target search. Only after commitment are finishes and the blue comparison displayed. No grades/history, settings, rounds or progress are saved by this page. The pre-shot overhead view is explicitly for geometric inspection in this prototype; normal gameplay’s hidden-dispersion and pre-shot-view behavior is unchanged.

Review whether the outline looks right in both views, the yardages make sense, and changing the target produces believable changes in the number of shots finishing on the green. Do not select a shape based on getting a higher score; the purpose is to review the shape foundation.

## Shared geometry

`green-geometry.js` defines local coordinates, normalized ellipse level, perimeter points, bounding extents and the radius along a direction. Optional rotation is in radians. Drawing/relief, lie classification, front/back yardages and hazard-clearance validation share these operations. Fixture pins are placed in the rotated local ellipse. The evaluator and target search therefore use the rotated playable shape, not an unrotated scoring boundary beneath rotated artwork.

Front/back retain the app’s established meaning: intersections along the ball-to-green-center line. They are not the globally nearest/farthest corners, and left/right edges can have different depths. Rendering relief is illustrative and introduces no putting slopes or elevation physics. Eye-level surface picking is approximate over the triangulated relief; as in normal aiming, tapping changes direction, while carry is selected separately. Bird’s-eye inspection uses the exact yard-plane mapping.

No production generator emits rotation. No rotation is added to any saved layout/profile. Ordinary scenes keep the original in-green arithmetic, and zero/missing rotations retain their geometry. Wider integration still needs rotated shoulder/camera/scenery handling throughout the main app and a new explicit layout policy before randomization. Kidney/irregular shapes are later work.

## Checks

- Geometry tests cover missing/zero rotation, local/world transforms, inside/outside boundary points, rotated bounds, pins, front/back edge intersections, relief consistency, center picking and mirrored examples.
- Existing tee generator, hole variety, guidance, landscape/surface, ground-rollout and model checks passed.
- Compared both old and current unrotated layout policies against the prior committed source: 96 generated scene comparisons matched exactly. Four complete 4,000-shot evaluations (tee, tucked, water, split) also matched exactly, including results/points.
- Chromium: all three examples, both views, at 1440/390/320 px (18 view combinations), with no page overflow or invalid SVG coordinates. All three examples completed simulations at phone width; existing local-storage sentinel/history values remained unchanged. Phone eye-level and overhead screenshots were visually reviewed.
- Packaged-asset and shot-simulation tests passed, including normal Commit/Retry flows.
- Syntax and complete asset preparation passed (50 runtime asset files).

No deployment or physical-device/Safari test performed. Work must merge into its latest hosted source, preserve its changes and private access, rebuild assets and deploy to the existing private site. Owner review comes before randomizing or integrating angled greens into normal rounds.


## Edge/fringe trial — v17.18.17

Owner found the angle difficult to read from eye level. This preview-only trial changes the grass collar contrast and adds a clearer inner putting-surface edge. The outer collar stays at the original three-yard illustrative width. A lighter inner band softens the transition; the exact playable boundary has a restrained stroke that stays legible across screen sizes. Fringe outside that boundary is not scored as putting surface.

No mowing lines, camera changes, raised terrain, larger playable green or gameplay integration were added. Fixtures, yardages, scoring and saved data are unchanged. Geometry and syntax checks passed. The browser sweep checked all three examples in both views at desktop/phone widths, with simulations and preserved storage; a final phone screenshot check followed a reduction of fringe width back to its original value. The angle remains subtle at ground level, so owner review is still needed. This is a readability trial, not proof that a first-time player can judge the angle correctly.

Merge `feature/angled-green-fringe` into Work’s latest hosted source, preserving its changes and private access; rebuild assets. Then review Menu → Angled green preview.


## Mowing-band trial — v17.18.18

Subtle alternating bands now follow each green's long local axis, so the wide example uses the opposite local direction from the long examples. They follow the existing projected relief and are clipped to the exact putting-surface outline. The preview-only Show mowing bands checkbox permits an immediate on/off comparison without changing aim or results.

This adds artwork, not a change to grass lies, slope, elevation, camera, playable green boundary or scoring. No bands were added to normal gameplay. The low eye-level perspective still compresses the green; this is a visual trial rather than a claim that the angle is now obvious.

Verification: syntax and geometry checks passed. All 840 projected vertices per example (including the clipping outline) lie inside/on the same ellipse, with fixtures unchanged. Chromium checked all three examples and both views at 1440/390/320 px, including the toggle, unchanged edge/yardages, three simulations, unchanged results after toggling, no overflow/invalid SVG and preserved storage. Phone eye-level and overhead screenshots were visually reviewed. Complete asset release contains 51 files.

Merge `feature/angled-green-mowing` into Work's latest hosted source, preserving its changes/private access, then rebuild assets. Review Menu → Angled green preview and toggle Show mowing bands. No deployment was performed here.


## Narrower bands and scenery — v17.18.19

Band width is reduced from four to two yards, giving about six darker bands rather than three across these examples. Sampling density per yard stays consistent. A separate Show scenery checkbox adds distant/side trees and subtle rough texture near/far from the green. The original mowing-band toggle remains available.

Trees are placed beyond the existing lateral/far OB boundaries; they do not create unscored obstacles on playable turf. Rough textures are masked out of the fairway, green/fringe and existing hazards. Trees use the game's existing illustrated artwork and appear in eye-level view; the overhead view keeps its terrain-focused presentation. Camera, terrain relief, green boundary, pin, hazards and scoring are unchanged. No scenery or striping changes are enabled in normal play.

Checks: geometry/scenery tests and syntax passed. Tree bases classify as OB in all three examples and rendering leaves fixtures unchanged. The existing browser sweep passed all examples/both views at desktop and phone sizes, including toggles, unchanged edges/yardages/results, valid SVG and preserved storage. Stripe vertices remain inside the scored green. Phone eye-level/overhead screenshots were visually reviewed. Asset preparation includes 52 files. The visual depth effect remains limited by eye-level perspective and needs owner review.

Merge `feature/angled-green-context` into Work's latest hosted source while preserving its changes/private access, then rebuild assets and deploy to the existing private site. Review Menu → Angled green preview, using Show mowing bands and Show scenery for comparison. Not deployed here.
