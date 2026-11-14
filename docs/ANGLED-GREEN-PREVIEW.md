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
