# Hole variety — v17.18.14

## Implemented

New games started through the app use `variety-v1` layouts:

- The bend family alternates gentle 18–32 yard bends with the existing moderate bends; sharp doglegs remain a separate family. Both left and right bends remain available.
- Greens mix existing balanced proportions with wide/shallow and narrow/deep ovals. Wide greens have 23–27 yard half-widths and 11–13 yard half-depths; deep greens have 11–13 yard half-widths and 24–27 yard half-depths. These affect actual lie classification, surface rendering, pin placement and yardages together.
- One quarter of eligible seeds consider back trouble: bunker or a recovery vegetation patch. A conservative bounds-overlap check skips patches conflicting with existing hazards. In the 1,120-layout validation sample, 260 had added back trouble (about 23%). Existing back water remains. This is not a guarantee of a fixed number per round.
- Vegetation uses the existing environment renderer: woodland trees, mountain pines, coastal vegetation or desert plants, with the existing recovery-area scoring. No automatic penalty or lost-ball mechanic was added.

These remain oval greens. Rotated, kidney-shaped, peninsula and island greens are future work. No airborne tree interception, elevation physics, dispersion distribution or scoring coefficients changed. New geometry can naturally change the preferred target.

## Saved games and teaching examples

`layoutVersion` is stored in new player profiles and free-practice snapshots, including backup settings. Runtime scene caching includes it. Missing versions use the original generator path, preserving old rounds and resumed free-practice holes. New practice holes adopt the new version; existing rounds retain their version through continuation and player-setting refresh. Reassessment using an archived profile retains its layout policy. New course seed selection uses that same layout version when checking reach. Scorecard yardages also use the saved policy.

Introduction illustrations, fixed lesson examples and research prototypes continue using the original layout path. Original generator constants are unchanged; new scene objects also carry their layout version. Generator helper calls without an explicit layout version remain legacy-compatible.

## Verification

- 1,120 generated layouts across the 14 non-shoreline families passed polygon, pin, hazard, bounds and reachable-landing validation, with no fallback layouts. All three green proportions and both back-trouble kinds appeared.
- Compared 48 legacy seeded scenes against the prior committed source: exact deep equality.
- Native checks passed across nine relevant files: hole variety, tee generator, learning/assessment rounds, Par-3 course, practice sessions, course setup, backups, round UI and tutorial UI. New-game UI checks confirm version activation; backup and resume checks preserve saved state. New Par-3 schedules retain the long-hole mix and honor the selected handicap's reach.
- Chromium passed 16 combinations: gentle bend, split-green approach, front-water approach and shoreline approach; 390/1440 pixel widths; normal/fullscreen. Valid SVG geometry, contained phone hazard labels and saved version were checked. Wide and deep phone green screenshots were visually reviewed.
- Full syntax checks and asset preparation passed (47 runtime files).

No deployment performed. Work should merge this branch into its latest hosted source, preserving hosted changes, then rebuild assets and deploy to the existing private site. To try the variety, start a new round or new practice hole; continuing an older saved round intentionally keeps its old layout.
