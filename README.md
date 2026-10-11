# Target Practice

## Current development update: v12.2.2

New scenarios automatically mix East Coast woodland, Pacific Coast, and desert environments. The landscape selector is removed. Consecutive new scenarios use different environments; retries and reloads preserve the current one. Environment affects scenery, not scoring or the shot model. This version includes all v12.2.1 learning and depth improvements. All 112 automated tests and syntax checks passed, plus desktop and phone browser checks for automatic mixing, retry, and reload.

## Previous development update: v12.2.1

The depth slider is now a vertical control immediately beside the course, with farther targets at the top. It uses the same target, heading, reach limits and commit lock as the terrain map. Keyboard and touch controls remain available.

Post-shot coaching now shows the actual tradeoff and a suggested experiment in the main feedback, alongside the expandable outcome table. Retry comparisons show the expected stroke difference per shot and per 100 similar shots, calculated before display rounding. These are modeled savings against the original target, not measured real-world strokes gained or a promise about the next 100 shots.

Validation: all 112 automated tests and syntax checks passed, plus desktop and phone browser checks covering the new depth control and retry feedback.

This follow-up is saved separately from the v12.2 publishing branch so Work can finish its current update. Publish the complete follow-up archive when ready.

## Previous development update: v12.2.0

This update expands practice to 14 families: seven tee situations and seven approaches. New families include sharp doglegs, crossing creeks, a short par 4 with a narrowing entrance, and a creek par 3. Reachable par 4s and par-5 second shots remain part of the mix. Every family now varies its geometry, including fairway shape, landing width, green size and position, hazards, and pin placement. Sharp doglegs support aiming up to 120 yards sideways.

Commit & shoot and the review actions sit immediately below the course on desktop and phone. The action bar stays visible while adjusting lower controls.

Nonzero seeds use `tee-v2` or `approach-v1`; seed zero preserves authored layouts. Retry keeps the exact scenario and shot draws. Both generators validate geometry and safe landing areas, try at most eight candidates, and retain an authored fallback. Seeds from earlier generator versions can produce different layouts in this version.

All 111 automated tests and JavaScript syntax checks passed. Validation covers 7,000 generated layouts and a 240-scenario mixed session with no identical geometry. Strategy checks exercise creek carry versus layup, sharp-dogleg aim, and reachable versus unreachable par-5 greens. These are varied versions of 14 architectures; player feedback is still needed to judge difficulty during longer sessions. The golf model remains illustrative.

The v12.2 changes are prepared in GitHub, but have not been published to the private site from this environment. See `DEPLOYMENT.md` for the complete-file publishing handoff and `BROWSER-REVIEW.md` for browser verification.

## Previous development update: v12.1.0

The original v12.0.0 import remains the baseline on `main`. This update adds:

- Readable mobile hazard names and terrain distances below the course, replacing the tiny in-scene callouts on narrow screens.
- A persistent mobile practice action bar with selected distance/club, Commit & shoot, and review actions. It is absent from custom-club and progress screens.
- 44-pixel-high mobile slider areas, larger thumbs, and minimum 44-pixel button/select heights.
- Removal of the extra bright water outline; the existing shoreline and hazard scoring remain.
- Constrained procedural tee variations in the existing cedar, bend, short-par-4, and narrow families: changing centerlines, bend onset, landing widths, hazards, boundaries, green dimensions and positions, and safe pins. Approaches and par-5 second shots retain their previous generator.

Seed zero retains each authored baseline. Nonzero tee seeds use `tee-v1`, shown beside the scenario seed. These seeds now produce the new geometry rather than the older rescaled tee layout; historical seed reports need their source/generator version. Retries within this version retain exactly the same geometry and draws. The generator tries at most eight candidates, rejects invalid geometry/unsafe pins or drops/missing reachable landing areas, and falls back to the authored family. It still represents four designed tee architectures, not unlimited strategic variety or calibrated golf advice.

Validation: 106 automated tests passed, including checks over 2,000 generated tee examples, representative 180/250/330-yard reach profiles, geometry rejection, and a reach-dependent green-versus-layup decision. Headless Chromium checks passed on desktop and simulated 320/390-pixel phones, including real touch dispatch, sliders, normal/reduced motion, hidden answers, retry, saving, and orientation resizing. Actual device checks of this update and Safari/Firefox checks remain outstanding. See `BROWSER-REVIEW.md`.

The private hosted site has not been updated by this GitHub change. `.openai/hosting.json` identifies the existing site but does not grant publishing access.

### Optional browser checks

The browser scripts are development tools, not runtime dependencies. In a separate terminal, serve the existing checkout without creating another worktree:

```sh
cd /workspace/Target-Practice-Golf
python -m http.server 8765 --bind 127.0.0.1 --directory dist
```

In the test terminal:

```sh
npm install --prefix /tmp/target-practice-browser --cache /tmp/target-practice-npm-cache playwright-core --no-audit --no-fund
export TARGET_PRACTICE_PLAYWRIGHT=/tmp/target-practice-browser/node_modules/playwright-core
node scripts/browser-review/check.cjs
node scripts/browser-review/gestures.cjs
node scripts/browser-review/mobile-and-generated.cjs
node scripts/browser-review/learning.cjs
```

These scripts use the installed `/usr/bin/chromium`, isolated browser storage, and the local server. Output defaults to `/tmp/target-practice-browser-results`. Override `TARGET_PRACTICE_CHROMIUM`, `TARGET_PRACTICE_BASE_URL`, or `TARGET_PRACTICE_REVIEW_OUTPUT` as needed. Stop only the server you started after testing. These current browser checks supersede the older environment-specific note below that browser QA was unavailable.

Private, buildless golf decision trainer. Serve `dist/` as static assets. The app has no dependencies or third-party asset requests. Settings and member-preview decision history save in browser localStorage; raw simulated shot data stays on the page. Branding lives in `dist/config.js`. Preserve the existing Site identity, URL and owner-only audience.

## Practice

Every visit starts with the free handicap profile: straight flight, no big-miss mixture, automatic club selection and distance-dependent dispersion. There is one practice screen. Tee / Approach / Mixed filters replace the named hole chooser. Next shot selects a different authored family, avoids the recent six families when possible, and generates seeded fairway, green, pin, and hazard variations. Mixed favors the other shot type. There are currently fourteen underlying families. Retry preserves the exact layout and shot sample.

Choose direction on the standing-eye POV and depth along that heading on the terrain-only bird’s-eye inset. Double-tap/double-click toggles a terrain-only 2× crop centered on the tapped area; the Zoom in/out button offers a keyboard-accessible alternative centered on the nominal target. The recognized double gesture restores the selection from before its first tap. Single taps retain normal target selection. The SVG screen transform maps picks back through the crop to the same world geometry. Zoom does not inspect dispersion or comparison targets, resets on commitment, retry, new scenario, profile switch or elevation change, and is never persisted across reloads. Keyboard sliders provide the same controls. No dispersion, mean finish or comparison aim is drawn before commitment. Commit & shoot locks controls, simulates 4,000 seeded outcomes, animates 48 evenly spaced examples colored by final lie, then zooms to the orange selected distribution and blue best sampled comparison. Reduced motion skips animation. Feedback labels and model estimates describe the decision, not the quality of one lucky shot. The landing zoom fits both exact 80% core contours, aim markers and mean finishes with tighter margins; rare tails can leave the frame and still count. Review hides locked aim controls and the repeated scenario brief. Tap the rating to expand a lesson grounded in the run’s hazard rates, nominal proximity, expected cost and club comparison. The lesson includes a target adjustment and distinguishes all-OB/no-usable-comparison cases.

## Member preview

Menu → Customize my Shot opens a separate screen with a deterministic flight illustration and a per-club setup. Drag the gold midpoint and blue carry finish horizontally to edit shape; drag the side-view apex vertically for height. Start / curve / height sliders offer keyboard equivalents. The shape is quadratic: lateral x(t) = carry × tan(start) × t + curve × t². Midpoint M and finish E imply initial tangent S = 4M − E and curve C = 2E − 4M. Limits are ±10° start and ±50 yd curve; outside those limits the other anchor may move. The displayed height is illustrative only.

Each of ten clubs stores carry, rollout, core σ on both axes, shaped start and curve, usual miss bias, lateral/distance correlation, height and an occasional big-miss mixture. Editing another club retains draft edits. Back discards the entire draft; Save applies it and starts a fresh target choice. Empty or out-of-range numerical entries block Save and club changes. Saved older Advanced lab settings migrate into the matching club. Reloading returns to the free profile while preserving the member bag. Free settings and member scoring costs remain separate.

This is an owner-private preview of future member tools. Billing, subscriptions, account-backed profiles and secure paid-feature entitlement enforcement are not implemented. Browser settings are not an access-control system.

## Progress preview

Menu → My progress opens a separate screen without disturbing the current practice target or result. The private prototype records committed free and personal-profile decisions as a preview of a future member feature. Store `target-practice-progress-v1` keeps at most 1,000 attempts, including retries. A scenario encounter ID persists through retry, reload and shot-setting changes; Next shot or a new filtered scenario starts a new encounter. Only the first completed attempt per encounter enters trends. Repeated attempts are counted separately. Runs with no finite comparison are not recorded; an all-OB chosen target with a finite comparison records score zero and unbounded expected cost.

Profiles fingerprint the model version, free handicap/reach or complete personal bag, and scoring costs. Changes start separate comparison groups. Filter by profile and tee/approach/all. Show recent average score and expected regret, a chart of the last 50 first attempts with a rolling average of up to five, rating counts, and recent first attempts. After ten first attempts, compare disjoint first/latest windows of up to ten; no overlap. Hole difficulty and sample mix still vary, so the displayed trend is descriptive practice feedback, not measured handicap, strokes gained or proof of improved course performance. Failed local saving is explicitly shown. There is no cross-device sync, account system or paid entitlement enforcement.

## Statistical model

Coordinates are yards, right positive x and forward positive y. The free handicap profiles have illustrative driver total-distance limits of 280 / 265 / 250 / 225 yd for scratch / 5 / 10 / 20, with separate per-handicap reach overrides in assumptions. These are teaching estimates, not measured averages or universal maxima. `bag.js` exposes estimated club fractions, rollout and spread.

Both profiles automatically select the shortest stock club that reaches the nominal target. Core σ scales by requested distance / stock distance with a 25% floor. Member curve, usual bias and big-miss shifts/shortfall use that same scale; start angle, height, probability and correlation remain fixed. Member tee stock distance is saved carry plus rollout. Approaches exclude Driver, use saved carry as stock distance, and apply zero rollout. Target distance is capped by the longest eligible club, including diagonal targets. The cap applies to the intended target, not every sampled outcome.

The core is a correlated Gaussian. A Bernoulli big-miss component doubles both standard deviations, adds a configured left/right offset and subtracts carry loss. Both-sides uses equal probability. Mean lateral finish is carry × tan(start) + curve + bias. Rotating aim rotates the whole pattern. The 80% contour is a joint core ellipse with radius 1.794σ; per-axis 80% intervals are ±1.282σ. Big misses are outside that core contour.

Water is checked at carry and by exact polygon intersection during rollout, and contact stops the plotted shot. OB is checked at final position when water was not contacted. Non-OB cost is one stroke + penalties + heuristic strokes remaining. Water uses a fixed scenario drop and one penalty stroke. OB repeats the strategy: E = (average non-OB total + 2 × pOB) / (1 − pOB). All-OB expectation is infinite. Recovery and remaining-stroke assumptions are visible and adjustable; this is not a fitted strokes-gained database.

The comparison samples a 6-yard horizontal / 10-yard depth grid and refines near the best in 2-yard steps, using the same 4,000 random draws, personal bag, club selection and distance limits. Search is restricted to the hole’s authored depth range and ±60 yd horizontally. The selected target is included; the result is an approximate sampled optimum. Score = max(0, 100 − 60 × extra expected strokes). When every sampled target is all-OB, the UI shows an ungraded dash and “Pattern needs adjustment” rather than a decision score. Approximate 95% Monte Carlo intervals cover sampling noise only. Feedback uses a 0.05-stroke closeness threshold, a 2-percentage-point extra hazard-exposure threshold, and a 5-yard nominal proximity threshold; ambiguous cases say target needs refining.

## Landscape and limitations

The eye is 1.7 m above the ball. Elevated tees are 9 m and approaches 8 m above the landing area, descending over the first 80 yd. The flat/elevated toggle affects visuals only. Raised greens and exposed sand/water bowls exaggerate relief for readability. Pins, aim markers and tracer contacts follow those surfaces; perspective-correct surface picking and scoring use the same world x/y footprints. Review and scout maps preserve equal yard scales.

East Coast woodland, Pacific Coast and desert change foliage and palettes on the same geometry. Vegetation follows fairway edges with a rough buffer, occupies recovery zones within the stakes and remains OB outside them. Dedicated regional architecture is future work. Airborne tree collision, wind, downhill carry, slope-dependent rollout and real flight physics are excluded. The flight arcs are illustrations with exact scored endpoints.

## Validation and hosting

Run `npm run check` and `npm test`. Tests cover numerical properties, hazard and OB scoring, optimization, camera/picking coordinates, distance limits, generated layouts, commitment/reveal/animation gates, scenario filters and retry, draft save/cancel/validation, mouse/touch flight controls, per-club shapes and misses, persistence, legacy migration and free/member isolation. The DOM harness is not a real browser. Course and editor SVGs are independently rasterized for visual inspection. Full browser QA is unavailable in the current managed environment; do not launch an improvised browser or preview server.

Deploy through Sites’ source workflow helper and private deployment operation. Never change audience to public without the owner’s explicit approval.

## V11: readable hazards and guided retries
- Exact water/bunker boundary highlights, distinct per-hazard forward yardage callouts, explicit left/right OB distances. Terrain map sits below the POV so it cannot cover the hole.
- Prominent radial target distance, selected estimated/custom club, carry/roll, straight aim-line hazard entry/exit distances, and target-to-pin distance. These describe geometry, not curved-flight clearance probabilities.
- Adjust & compare retains the original target, encounter, profile, seed and hole. Recommit after moving the aim to compare original and latest target, club/distance, score, expected cost and water/OB exposure. Repeated retries compare with the original; Next resets. Profile changes suppress comparisons across different assumptions. Retry clouds stay hidden until recommitted. Retry records remain excluded from first-attempt progress.
- Selected OB woodland/coast trees are 25% taller and 15% wider, preserving playable tree buffers and lie geometry. Desert plants stay the same size.
- No statistical calibration or new source data is claimed. Native browser/phone QA unavailable in this environment; DOM interaction and rendered SVG checks used.

## V12: outcome dispersion and par-5 decisions
- Both dispersion clouds share tracer outcome colors. Selected shots are filled circles with dark borders; comparison shots are hollow circles. Gold solid and blue dashed core contours preserve pattern identity. Larger dots still mark big misses, without replacing outcome colors. Outcome percentages use the same palette.
- Added open and forced-carry par-5 second-shot families to Approach/Mixed practice. Layup depths and going-for-green depths use the same reach limits and optimization. Driver is excluded and approach rollout stays zero. Scores compare modeled strokes from the second-shot location; no first-shot simulation or fitted par-5 scoring database is claimed.
- Generation remains seeded variations of ten authored strategic families, not a fully procedural course architect.
