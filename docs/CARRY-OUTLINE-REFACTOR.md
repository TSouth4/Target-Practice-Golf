# Carry-outline calculation refactor — 17.7

The renderer previously recalculated each 64-point carry outline on every redraw, including animation frames. Each point repeated club selection. `carry-outline.js` now owns that world-space geometry: it selects the club once per outline and computes the same 64 landing points. A four-entry cache reuses those points for unchanged aim and pattern values. The renderer still projects every point through the current camera, including transitions and elevated terrain.

Cache keys snapshot the complete pattern, including nested custom clubs and conditions, so in-place changes invalidate the entry. Non-finite numbers and signed zero bypass caching to avoid JSON key collisions. Returned points are immutable. The cache is local to the page, bounded to four entries, never persisted, and independent of scores, sampled shot clouds, saved rounds and progress. No model formulas, scoring versions, public copy or settings have changed.

## Validation

Three new native tests compare every coordinate against the former inline calculation across four handicap profiles, three difficulty settings and three distances with custom shape; check input preservation; exercise nested settings changes, value-equivalent copies, eviction and immutable results; and cover unusual numeric values. Existing integration tests exercise the normal round and lesson paths.

`scripts/browser-review/carry-outline.cjs` compares the same build with the cache enabled versus the original inline calculation injected by the development browser test. Two fixtures (Easy tee and Hard approach), at 1440 and 390 px, reproduce identical overhead and eye-level outline markup, outcome-dot markup, colors and recorded score/regret/category. The browser test also checks JavaScript page errors. Existing long-par-3 browser checks cover chosen-ball persistence and legacy review compatibility at 1440, 390 and 320 px.

Historical performance scripts have also been updated to use the current direct Practice home button, removing the obsolete second Unlimited button click.

## Measurements and limits

[Raw report](CARRY-OUTLINE-PERFORMANCE.json). Local Chromium on shared cloud hardware, no full regression suite running during measurement. Each fixture/backend has one 20-redraw observation; timings include JavaScript string construction and SVG insertion, not complete browser paint or input latency. Repeated drawing medians were mixed: desktop tee 23.0 to 22.8 ms, desktop approach 13.1 to 13.6 ms, phone-width tee 24.2 to 25.5 ms, phone-width approach 15.3 to 13.6 ms. These observations do not establish a reliable whole-page speedup.

An isolated three-trial benchmark of 600 outlines over 300 redraws had median 10.9 ms uncached versus 3.0 ms cached, with identical coordinate checksums. Its uncached path already includes the newly hoisted club selection. This demonstrates reduced repeated geometry work, not a comparable improvement in overall app speed. Course scenery construction and full SVG replacement still dominate rendering; they remain candidates for a separately measured refactor.

Deploy the complete matching `dist` directory, including the new module. No dependencies, database migrations, account changes or hosting identity changes are required. Actual mobile hardware and production hosting performance remain separate pilot checks.

Final validation: all 206 native tests passed (0 failed, skipped or cancelled), all JavaScript syntax checks passed, and both browser comparison and long-par-3 review checks completed successfully.
