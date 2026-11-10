# Mobile hazard readability — initial review, 2026-11-10

Dispersion calibration is on hold at the owner's request. No gameplay/model changes were made for this review.

## Reproduced example

Saved free practice: sharp-dogleg, holeSeed 5, seed 1234, woodland, tee filter, aim (0,200), no target selected. Chromium at 390×844 and 320×844, regular and immersive layouts.

The page does not overflow horizontally, but that alone misses an internal SVG problem: long mobile hazard labels exceed their fixed 220-unit label boxes and get clipped at the course edge. The Sand 195–227 yd and Water 240–312 yd labels demonstrate this in the regular phone view. Fullscreen keeps their boxes farther inward, but label text still overruns its box. Whole-group bounds include connector lines, so those bounds alone must not be treated as label-clipping proof; screenshots show the text problem directly.

The dogleg's distant water and bunker are difficult to distinguish from the ground-level camera. This is an observation from one fixed scene, not evidence that every hole has poor visibility. OB labels also omit the left/right qualifier visible in their accessible description, which can make their meaning unclear to beginners.

## Recommended next change

1. Fit full hazard names/distances inside the mobile label boxes, with sufficient contrast and consistent units. Consider a two-line label before reducing font size.
2. Retain left/right context for lateral OB distances, distinct from forward distances to water/sand.
3. Check straight, curved and approach examples, both layouts and narrow phones, before changing terrain artwork globally.
4. Keep aim and flight paths clear. Preserve the existing tap-for-detail behavior and actual terrain distances.

Screenshots from this local review are in /workspace/browser-review/hazard-review-{390,320}-{false,true}.png. No deployed-site verification or user comprehension test was performed. Model, scoring and private access are unchanged.

## Implemented — v17.18.13

Phone labels now put the hazard name above its distance rather than squeezing both onto one line. OB headings identify left/right; their numeric distances remain lateral distances from center. Label backgrounds are slightly more opaque and vertical spacing accommodates the two lines and Chromium minimum font sizes. Connector lines, tap/keyboard detail behavior, terrain distances and game logic are unchanged.

Verification: guidance tests and full syntax checks passed. Chromium checked sharp dogleg, gentle bend, water approach and shoreline approach at 320, 390 and 1440 px in normal and fullscreen views (24 combinations). All visible phone label text stayed within its label box and course bounds; there was no horizontal page overflow. Desktop smoke checks passed. Phone screenshots of the dogleg and shoreline were visually reviewed. The browser review is reproducible with `node scripts/browser-review/hazard-readability.mjs`.

This fixes label containment and wording, not the distant terrain visibility noted above. No global artwork, model or scoring changes were made. Not deployed; rebuild fingerprinted assets when merging into the latest hosted source.
