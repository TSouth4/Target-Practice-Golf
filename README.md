# Par-3 score and round controls (15.2.0)

Par-3 scores are presented relative to par: Even par, +2 or -1. The top-right course summary shows the current hole, running total to par and number of completed holes. It remains visible in full screen. An unfinished hole, including a pending OB re-tee, does not enter the total until completed.

Quit and Restart are available beside the score and on the scorecard. Quit ends the saved course and returns to practice. Restart starts a fresh randomized three-hole round with the current selected profile, reset to hole 1 and even par. Switching modes through the menu still preserves a course for later resumption; Quit explicitly ends it.

# Custom shot and menu refinement (15.1.0)

The menu has one **Create your custom shot** item. Save and Reset remain on that page. The preview now looks directly down the target line, with aligned launch/target positions, a golfer at address and a smooth two-part flight arc. The explanation asks golfers to match their usual flight and finish so practice can teach an appropriate aim adjustment.

The menu works from the editor, progress, lesson screens, assessment, learning rounds and course scorecards. Switching pages discards unsaved shot edits while preserving the saved bag. Navigation remains temporarily locked during shot/lesson processing. Leaving an assessment does not reveal its hidden individual feedback.

# Simple shot profile (15.0.0)

Menu → Create your custom shot, or the shortcut beside the player controls, opens one flight illustration with a golfer at address. Drag the red apex left/right to change the start and bend while keeping the finish; drag it up/down for illustrative height. Drag the blue finish left/right while keeping the start line. Plain captions describe the result. Reset shot shape restores straight flight without erasing distances or dispersion settings.

The usual shape applies across all ten clubs by default. Club distances and detailed settings remain optional in a folded section. Save & play activates the saved profile; Cancel changes discards the draft. The selected standard/custom profile survives reload. New learning rounds, assessments and par-3 courses use the selected profile. A paused round keeps its original club snapshot, even if the saved profile is edited afterward.

See [SHOT-PROFILE.md](SHOT-PROFILE.md) for the model and save rules. This remains a private member-feature preview; accounts and billing are future work.

# Three-hole par-3 course (14.0.0)

Menu → Par-3 course introduces a three-hole pilot with one environment, a running score and a scorecard. Choose a tee target, see the full pattern, then follow one selected ball as the others fade. The camera switches to bird’s-eye with just that endpoint; the simulated finish and hole score appear afterward. Target quality stays separate from the score. Longer coaching is available under “Why this target rating?”.

Water adds a penalty and uses the existing modeled drop. OB requires a re-tee with stroke-and-distance counted; it cannot produce a fake short-game finish. The selected ball, simulated finish, pending re-tee and score are saved before animation. Reload resumes them without rerolling. You can leave for another mode and use Resume par-3 course to return. Course attempts stay outside normal learning/assessment progress; the scorecard retains each hole's first target grade.

Remaining strokes are sampled as whole-number outcomes from explicitly authored distributions calibrated to the historical Tour distance/lie mean. They are illustrative rather than measured score frequencies or personal handicap predictions. The later shot counts are narrated, not physically played. Read [COURSE-MODEL.md](COURSE-MODEL.md) for probabilities, limits, penalty handling and save behavior. This is the agreed three-hole test before an 18-hole expansion; wind and firmness remain later work.

Validation is recorded in DEPLOYMENT.md.

# Scenic environments (13.3.0)

Mountain valley, Lakeside and Oceanfront join the automatic environment mix, alongside woodland, Pacific Coast and desert. Mountain scenery includes layered peaks, snow caps and evergreen silhouettes. Lake scenery includes distant wooded hills and calm-water reflections; ocean scenery includes an open sea horizon, dunes and small sails. Each setting has its own sky, water, turf and vegetation palette, with its name below the hole heading.

This is a visual update: mountains do not change carry, elevation, terrain physics or scoring. Lakeside/ocean settings are selected only when the generated hole already has water along its side. Existing playable water polygons, relief, callouts and penalties remain scored by the same model; distant background water lies outside the playable scene. No new water footprints or drop rules are introduced. New scenery appears in regular practice and rounds; fixed lessons retain woodland. Retry retains the setting, and round slots now store it so a reload preserves the same scenery.

Validation and deployment checks are recorded in DEPLOYMENT.md.

# Lesson target comparisons (13.2.1)

The lesson menu now allows direct switching to Learning round, Assessment, Unlimited practice, Customize my Shot, the free profile and My progress. Switching restores the previous practice profile before entering the selected screen. The lesson catalog also permits switching when an assessment was paused. Saving custom clubs after that switch starts member practice; Back from the editor keeps the restored session.

Menu → Lessons keeps four fixed lessons with read-only explanations, a guided target and a recap. Explanation slides hide Commit and course controls; independent practice stays in the other game modes. Lessons restore the prior practice settings/round/review and do not affect normal progress. Existing completed lesson IDs remain completed.

The pattern slides now compare actual flag-target and recommended-target core contours from the fixed 5-handicap straight-shot model, using equal yard scales and shared 4,000-shot draws. Gold is the flag target; blue is the optimizer target. Outlines enclose 80% of the Gaussian core, not every possible miss. Water percentages use every sampled shot. For the selected examples, flag/recommended rates are 13.5%/1.7% (front water) and 16.1%/2.2% (side water). We do not invent 50% water exposure for an illustrative effect. The OB, penalty-area/drop, sand and trees explanation slides remain separate rule illustrations.

Lesson 2 uses the dartboard/hand analogy instead of a drop-location picture. Lesson 3 first explains fairway hole-out costs at 100 versus 150 yd, then compares 50→100, 100→150 and 150→200 yd. Values come from the existing historical PGA TOUR reference: 2.66, 2.80, 2.945 and 3.19 strokes remaining. The differences are 0.14, 0.145 and 0.245. The first two are nearly equal; we do not claim that the first is much smaller. The lesson identifies the historical source, rounding and interpolation at 150 yd. These are reference estimates, not minimum costs or personal predictions. The guided tee still compares a reachable safer 190 yd shot with a reachable longer target.

Lesson 4 retains the introductory wedge/long-iron spread example, adds different targets on the same tucked-pin green, then defines short side versus fat side with illustrated recovery paths. These club-target and recovery drawings are conceptual, not computed recommendations. The model still uses distance-and-lie references; it does not explicitly simulate green available to a chip, spin, slope or short-sided recovery difficulty. See STROKES-BASELINE.md for source and scoring limits.

Completion means participation, not mastery. The fixed training profile is 5 handicap, a 265 yd driver-total limit, straight shots, calm conditions and woodland. Guided success requires being within 4 yd of the sampled optimum and means following the idea, not guaranteeing a safe outcome. Lessons can be repeated, instructions hidden/reopened, and the calculated guided result reviewed from the recap.

Validation is recorded in DEPLOYMENT.md. Physical-device and Safari/Firefox checks remain outstanding.

# Landing and rollout markers (12.10.0)

After choosing a target, a small hollow marker and short dotted line show the planned straight-line finish after rollout, before curve and misses. The carry target remains the gold ring. The distance bar includes a compact marker key; zero-roll approaches use one location. The planning aid does not reveal dispersion, a center-flight curve, hazard outcomes or an ideal target.

Validation: all 144 regression tests passed. Desktop and phone browser checks covered planning, zoom, full screen, review, retry, zero-roll approaches and a water landing that stops rollout. A landscape full-screen check verified the compact carry bar.

Normal shot review now distinguishes the core center flight landing from its finish. This is a deterministic illustration of the core flight, not the average of all simulated outcomes. Its rollout stops at the same water-contact position used by scoring. This fixes the previous visual marker that could continue hypothetically beyond water. Assessment still shows its example flights without center markers or individual coaching. Scores, shot distributions and baseline costs are unchanged.

# Distance-and-lie reference upgrade (12.9.0)

Default next-shot costs now use a documented historical PGA TOUR reference published by Mark Broadie, with separate fairway, rough, sand, recovery and putting tables. This replaces the hand-tuned distance curve and fixed hazard surcharges. Costs vary with both distance and lie; putting uses feet. Handicap still changes shot dispersion, not measured personal recovery or putting skill.

Validation: all 139 regression tests passed. Desktop and phone browser checks passed for complete learning/assessment rounds and calculated lessons. Reference-value, unit, range, wedge/iron tradeoff, distance-dependent sand, custom-setting migration and preservation checks are included.

See [STROKES-BASELINE.md](STROKES-BASELINE.md) for data provenance, formulas, range limits, simulator adjustments and remaining limitations. The source transcription and MIT attribution are included. New scores use decision-model-v6 and rounds-v4-model-v6; older completed reports remain readable separately.

# Calculated decision tradeoffs (12.8.0)

Practice coaching now explains changes in modeled next-shot/putting cost versus rough, bunker, trees, water and OB costs. The expandable lesson includes each cost for both targets and the current shot; the text gives the net saving per decision and per 100 similar decisions. No cost difference is inferred from hazard percentages alone.

Validation: all 134 regression tests passed. Added checks verify exact accounting across every lie, water relief, dense-woods costs, OB repeats and unbounded results. Desktop and phone browser checks verified the expanded lesson and main coaching text.

Collected simulations expose an exact accounting breakdown of the existing expectation: one current stroke, average baseline remaining cost among non-OB outcomes, incremental lie/penalty costs on those outcomes, and OB repeat overhead 2p/(1-p). Baseline remaining cost uses the actual water drop for water outcomes. Forest recovery multipliers are preserved. All-OB results have no finite breakdown. Components sum to the original expected strokes before display rounding; scoring and target selection are unchanged. The components are not isolated causal effects: changing targets also changes which outcomes remain playable and their locations. They do not simulate subsequent shots.

The distance bar now reads **Estimated distances**, with **Carry 180 yd (185 total)** above the slider. Total is nominal carry plus expected rollout. Desktop and phone browser checks passed.

# Approach layup scoring correction (12.7.1)

The previous linear short-game estimate underpriced 20–50 yard pitches and could recommend an 80-yard layup on a reachable 122-yard front-water approach. The off-green estimate now interpolates explicit illustrative anchors: 2.05 strokes at 0 yd, 2.40 at 20, 2.65 at 50, 2.85 at 100 and the editable baseline at 150. Beyond 150 the existing distance rate remains. These are teaching assumptions, not empirical golfer data. The model still does not simulate subsequent shots or subsequent creek-crossing risk, and requires further golfer/coach validation.

A reproducible 20-handicap example (water family, seed 578, 122 yd flag) now favors a green target around 130 yd instead of an 81 yd layup. This does not force all approaches to favor the green. Header distances equal rounded ball-to-pin geometry; the 149 yd marker in the supplied screenshot was the committed target, not the flag.

Validation: 131 regression tests passed, including a 4,000-shot front-water comparison and full learning/assessment UI flows. An additional 700 generated approaches had consistent flag yardages. Syntax checks passed.

New progress uses decision-model-v5 and rounds-v3-model-v5. Old completed reports are preserved with a previous-model notice; unfinished old-model rounds restart so a report cannot mix scoring assumptions.

# Target Practice

## Current development update: v12.7.0

The right-side control now specifies **Intended carry**, measured along the chosen direction. Club selection uses carry capacity; baseline rollout is then added to determine the finish. The depth control preserves heading as carry changes, and shows the current **Expected roll** estimate. Basic driver limits and saved club stock distances still include rollout; stock carry is stock total minus roll. Approaches retain zero baseline rollout. Finishing dots continue to represent final positions, not landing points. Wind, firmness and terrain-dependent rollout are separate future model work.

The public course heading shows larger par and distance text without variant/version numbers. Current scenario ID, layout seed, shot seed and generator versions remain in How the model works for reproducing issues.

Assessment now shows 48 representative ground-level shot flights after each decision. Grades, coaching, comparison targets and overhead review stay hidden. Flights remain visible until Next scenario; after the tenth flight choose **View assessment report**. This is an assessment with outcome observation, which can influence later decisions. Reduced-motion mode shows static example flights rather than requiring animation. No retries during the assessment.

Recaps use conversational counts, such as “Your target choices were too aggressive on 5 of your 10 decisions,” and identify the most frequent carry or lateral target difference. They describe simulation decisions, not measured physical misses or established habits. Carry differences are measured against the sampled comparison’s carry, not just its forward coordinate.

Progress now uses `decision-model-v4` and sessions use `rounds-v2-model-v4`; earlier progress remains readable separately. Older in-progress rounds restart under the new carry model rather than combining incompatible decisions. Completed previous-model reports remain readable with a previous-model label. This update leaves the strokes-remaining cost model unchanged; nonlinear next-shot costs and quantified layup-versus-bunker explanations are the next planned model update.

Validation: all 128 regression tests passed, plus a focused previous-report preservation check. Carry-specific checks cover landing/finishing separation, reach limits, angled targets, custom clubs with different rollout, and zero-roll approaches. Desktop and phone browser checks cover intended carry, readable heading and rollout, full learning and assessment sessions, observed flights with no individual assessment coaching, reports, reload and full-screen assessment. Physical-device and Safari/Firefox checks remain outstanding.

## Previous development update: v12.6.0

Practice starts with a randomized five-scenario learning round. The menu offers **Learning round**, **Assessment Test**, and **Unlimited practice** for the private pilot. Learning rounds show immediate feedback and allow retries; only the original decision contributes to the recap. Assessment starts with an introduction, then ten straight-profile decisions with no individual grades, patterns, recommendations or retries. Its aggregate report appears after decision ten. Neither mode has a daily limit or payment gate during this pilot.

Each learning round mixes short par 4, wide tee, and tighter/carry-decision families with two approaches; the order and geometry are seeded and randomized. Assessment mixes five tees and five approaches. Short-par-4 seeds favor a reachable green entrance for the standard distance profiles, while lower custom reach can still require a layup. Wider Cedar layouts and occasional wider crossing water provide representative driver versus shorter-club decisions. `tee-v4` changes those layouts; `approach-v3` and `woods-v2` remain current.

The handicap and distance limit can be selected before the first decision; thereafter the profile is locked for the round. Starting another mode replaces the current round. Unfinished rounds resume on this browser when local saving is available; recorded decisions do not count twice after reload. Finished reports remain available on reload until a new round starts. Assessment answers do not appear in the individual learning progress history.

Reports show first-attempt rating counts, target-direction differences and average extra modeled strokes against sampled targets, scaled to 100 similar decisions before rounding. They include a practice suggestion and distinguish this small sample from established habits or measured real-world strokes gained. Unbounded comparisons show an unavailable finite total.

A 100 now requires a target within 2 yd of the sampled comparison and no more than 0.005 extra modeled strokes. Other choices that round to 100 are capped at 99. New progress uses `decision-model-v3`; earlier-model history remains readable separately. The sampled comparison is an approximation, not a proven optimum.

Validation: all 125 automated tests passed. Browser checks completed entire learning and assessment rounds on desktop and a 390-pixel phone, including retries, resume, profile selection/locking, withheld assessment answers, final aggregate math, saved reports and starting another round. The phone assessment also completed in native fullscreen and returned to its report. All fourteen generated families passed commit/retry checks; layout validation still covers 7,000 examples. Physical-device and Safari/Firefox checks remain outstanding.

## Previous development update: v12.5.0

The pre-shot bird's-eye map is removed, including the floating fullscreen radar. Choose direction from the ground view and depth with the right-side slider. Front, flag, and back yardages use course callouts; narrow screens use readable matching labels below the course or above it in fullscreen. Front/back are intersections of the ball-to-green-center line with the actual green ellipse; flag yardage is the direct ball-to-pin distance. These are terrain information, independent of the chosen target. The overhead landing comparison remains available after commitment.

Seeded woods now vary independently on each side in fairway setback, starting distance, density and visual height. Dense woods have a higher recovery cost; open woods are less costly. The base recovery setting is multiplied by the zone's severity, so custom costs still apply. Geometry, vegetation and scoring share the same zones. Tree height remains visual; airborne branch collision is not modeled. Seed zero preserves baseline severity.

Generator versions are now `tee-v3` and `approach-v3`, with `woods-v2`. Retry retains exactly the current layout and random sample. Progress uses `decision-model-v2` so new scores are not mixed into earlier-model trends. Earlier history remains readable and is labeled “previous model.”

## Previous development update: v12.4.0

**Full screen** opens an immersive practice layout: course across the viewport, depth on the right, a floating terrain-only bird's-eye map, and aim/commit actions over the course. The map can be collapsed. Results appear in a scrollable overlay; **Hide feedback / Show feedback** toggles that overlay without changing the target or answers. Retry clears the answers, and Next shot stays in the immersive layout. **Exit full screen** or Escape restores the normal view. Opening progress or the club editor also exits immersive practice.

Native browser fullscreen is requested when available; otherwise the same layout fills the page while browser chrome can remain. The camera expands its frame to fit portrait and landscape screens without stretching the course or cropping the original frame. Fullscreen is session-only and does not change the saved shot profile, seed, or target. The floating map shows known terrain, not hidden dispersion or recommended targets.

Validation: all 114 regression tests passed. Real Chromium checks cover native fullscreen on desktop, denied-fullscreen fallback at 390 and 320 pixels and 844-pixel landscape, depth and map controls, hidden answers, commitment lock, feedback collapse, retry, Next shot, rotation, and Escape/button exits. Physical-device and Safari/Firefox checks remain outstanding.

## Previous development update: v12.3.0

Approaches now include front flags just beyond a pond, flags tucked beside side water, front/back flags between sand and water, and flags near one of two side bunkers. This changes existing families rather than adding more copies to the bank. `approach-v2` changes generated geometry and pin placement; older seeds need their generator version to reproduce the prior layout. Seed zero still retains each authored baseline, and Retry preserves the current layout.

Feedback connects the actual target adjustment with a named hazard, the side of the miss pattern it protects, and measured outcome-rate changes. It distinguishes laying up before a carry from aiming deeper to clear a front hazard. It does not claim that shorter simulated shots were caused by measured mishits.

The numeric grade remains `100 − 60 × extra expected strokes`, rounded and bounded to 0–100. A score near 98 corresponds to about 0.03 extra modeled strokes; an off-center target can deserve a high score when its outcomes are nearly as good. The balanced rating now reads **Strong decision**, replacing **Just about perfect**. Elevated View is hidden during review; Eye level and Landing zoom remain available.

Validation: all 114 regression tests passed. Focused lesson tests and desktop/phone feedback checks were rerun after refining the descriptive wording. All fourteen generated families passed browser commit/retry checks.

## Previous development update: v12.2.2

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
node scripts/browser-review/guarded-feedback.cjs
node scripts/browser-review/fullscreen.cjs
node scripts/browser-review/rounds.cjs
node scripts/browser-review/intended-carry.cjs
```

These scripts use the installed `/usr/bin/chromium`, isolated browser storage, and the local server. Output defaults to `/tmp/target-practice-browser-results`. Override `TARGET_PRACTICE_CHROMIUM`, `TARGET_PRACTICE_BASE_URL`, or `TARGET_PRACTICE_REVIEW_OUTPUT` as needed. Stop only the server you started after testing. These current browser checks supersede the older environment-specific note below that browser QA was unavailable.

Private, buildless golf decision trainer. Serve `dist/` as static assets. The app has no dependencies or third-party asset requests. Settings and member-preview decision history save in browser localStorage; raw simulated shot data stays on the page. Branding lives in `dist/config.js`. Preserve the existing Site identity, URL and owner-only audience.

## Practice

First-time visits use the standard handicap profile: straight flight, no big-miss mixture, automatic club selection and distance-dependent dispersion. Later visits restore the selected standard or custom profile. There is one practice screen. Tee / Approach / Mixed filters replace the named hole chooser. Next shot selects a different authored family, avoids the recent six families when possible, and generates seeded fairway, green, pin, and hazard variations. Mixed favors the other shot type. There are currently fourteen underlying families. Retry preserves the exact layout and shot sample.

Choose direction on the standing-eye POV and depth along that heading on the terrain-only bird’s-eye inset. Double-tap/double-click toggles a terrain-only 2× crop centered on the tapped area; the Zoom in/out button offers a keyboard-accessible alternative centered on the nominal target. The recognized double gesture restores the selection from before its first tap. Single taps retain normal target selection. The SVG screen transform maps picks back through the crop to the same world geometry. Zoom does not inspect dispersion or comparison targets, resets on commitment, retry, new scenario, profile switch or elevation change, and is never persisted across reloads. Keyboard sliders provide the same controls. No dispersion, mean finish or comparison aim is drawn before commitment. Commit & shoot locks controls, simulates 4,000 seeded outcomes, animates 48 evenly spaced examples colored by final lie, then zooms to the orange selected distribution and blue best sampled comparison. Reduced motion skips animation. Feedback labels and model estimates describe the decision, not the quality of one lucky shot. The landing zoom fits both exact 80% core contours, aim markers and mean finishes with tighter margins; rare tails can leave the frame and still count. Review hides locked aim controls and the repeated scenario brief. Tap the rating to expand a lesson grounded in the run’s hazard rates, nominal proximity, expected cost and club comparison. The lesson includes a target adjustment and distinguishes all-OB/no-usable-comparison cases.

## Member preview

Menu → Create your custom shot opens a single flight illustration. The red apex adjusts start, bend and illustrative height; the blue finish changes the endpoint while preserving the start. Keyboard arrow controls and optional sliders provide alternatives. See [SHOT-PROFILE.md](SHOT-PROFILE.md) for the mean-flight equations and limits.

Each of ten clubs stores carry, rollout, core σ on both axes, shaped start and curve, usual miss bias, lateral/distance correlation, height and an occasional big-miss mixture. The default editor applies the usual shape across clubs, scaling lateral shape with carry. Opening detailed settings or choosing another club switches to individual-club editing. Cancel discards the entire draft; Save applies it and starts a fresh target choice. Empty or out-of-range numerical entries block Save and club changes. Saved older Advanced lab settings migrate into the matching club. Reload preserves the selected profile and member bag. Free settings and member scoring costs remain separate.

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

Run `npm run check` and `npm test`. Tests cover numerical properties, hazard and OB scoring, optimization, camera/picking coordinates, distance limits, generated layouts, commitment/reveal/animation gates, scenario filters and retry, draft save/cancel/validation, mouse/touch flight controls, per-club shapes and misses, persistence, legacy migration and free/member isolation. The DOM harness is not a real browser. Course and editor SVGs are independently rasterized for visual inspection. Browser review scripts use Chromium through Playwright against the static dist folder; the scripts supplement the DOM and numerical checks.

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
