# Target Practice — Product specification and Codex handoff

Owner: Tyler Southcott  
Prepared: October 11, 2026  
Baseline: private prototype v12.0.0  
Purpose: continue the existing golf decision trainer without losing its product requirements or rebuilding it unnecessarily.

## 1. Copy this as your initial Codex prompt

```text
Help me continue developing my existing golf decision-making trainer, Target Practice. Read the attached Target-Practice-Codex-Specification.md and the current source code before editing. Treat the specification as the product brief, and verify implementation details against the actual code.

This is an existing working private prototype, not a request to start from scratch. Preserve the current app and reuse its simulation, aim selection, custom club editor, feedback, progress, and hosting identity where practical. Do not change frameworks just to reorganize the project.

The most important product rule is that no shot dispersion, mean finish, or ideal target can appear before the user commits their target. Keep the free experience simple: straight flight, handicap-based dispersion and distance limits, target selection, Commit & shoot, results, Adjust & compare, and Next shot. Personal shot shapes, custom distances/misses, and long-term progress are future paid features; they currently exist only as private member previews.

Keep the app private. Do not make it public, broaden access, change its domain, start charging customers, or submit it to an app store without my explicit approval. Private updates within an authorized development task can proceed through the supported hosting workflow.

First inspect the source and identify what is implemented, what is estimated, and what is missing. Do not invent access to source files or treat the deployed URL as a substitute for the repository. If the source is unavailable, request the repository or source files before making implementation claims.

My recommended next development milestone is broader procedural scenario generation: varied fairway shapes, doglegs, green locations, hazards, landing widths, and par-5 go-for-it/layup decisions. Generate varied, valid strategic situations, not merely cosmetic random variations. Preserve deterministic seeds, exact view/scoring geometry, distance constraints, hidden-before-commit behavior, and retries on the same hole/sample. Add meaningful geometry and interaction validation. Improve the existing generator incrementally rather than replacing the app.

Explain the concrete scope and any unresolved design choices before major architecture changes. Distinguish measured golf data from illustrative assumptions and do not describe the sampled comparison as a proven optimum. Validate changes appropriately, report actual browser/device testing limits honestly, and deliver a working private version when authorized and supported. Do not claim account security, billing, cloud sync, or unlimited strategic variety before they exist.
```

The procedural milestone above is the recommended next task, not work already completed. Change that paragraph if another priority becomes more important. This document contains specifications and source references; it does not contain the application source code.

## 2. Product purpose

Target Practice trains target selection and course management. The user sees a golf shot from a golfer’s perspective, chooses direction and depth, then sees the distribution of likely outcomes and an explanation of the decision.

The objective is to teach selection of a good distribution of outcomes, not to reward one lucky shot or teach users to aim at every flag. Users should learn when to be aggressive, when to lay back, which side needs room, and how club distance and dispersion affect the choice.

Primary contexts are tee shots, ordinary approaches, and par-5 second shots with an opportunity to reach in two. Chips are a possible later expansion, not a current requirement.

## 3. Non-negotiable requirements

1. Brand name is **Target Practice**. Earlier working names GolfAim101 and “7 Steps to Scratch” must not appear as app branding. The book brand is separate. Keep branding centralized so it can change later.
2. Preserve private owner-only access unless Tyler explicitly approves a different audience.
3. **Never reveal dispersion or the comparison target before commitment.** This includes dots, contours, a nominal/mean flight endpoint, hazard outcome percentages, recommendation markers, and preview overlays. Visible terrain, hazards, pin, yardages, selected aim, and club information are allowed.
4. Keep the main practice experience simple. Do not reintroduce a list of named holes or a prominent advanced settings dashboard.
5. Use the same world geometry for rendered terrain, picking, hazards, and scoring. Visual changes must not secretly change shot outcomes.
6. Intended target distance must respect the eligible club/handicap reach, including diagonal targets. Random misses may finish beyond that intended-target limit.
7. Next shot presents a new scenario. Retry preserves the same scenario and random sample.
8. Explain model assumptions and uncertainty. Do not market heuristic scores as validated strokes gained or actual handicap improvement.
9. Support touch and cursor input, with keyboard alternatives for essential actions. Respect reduced-motion settings.

## 4. Primary practice flow

| Step | Required behavior |
| --- | --- |
| Open practice | Start with the simple free straight-flight profile; saved custom clubs remain available through the menu. |
| Select type | Tee shots, Approaches, or Mixed. Par-5 second shots belong to Approaches and Mixed. |
| Inspect hole | Ground-level golfer POV with readable water, bunker, OB, trees, fairway, green, flag, and distance information. |
| Pick direction | Tap/click the main course or use the left/right slider. |
| Pick depth | Use the bird’s-eye terrain map or depth slider, preserving the chosen heading. Update club and pattern parameters internally. |
| Inspect distance | Prominent target yardage, selected club, carry/roll, target-to-pin distance, and terrain-only hazard ranges along the aim line. |
| Zoom | Double-tap/double-click to toggle a 2× terrain crop; a Zoom in/out button provides an alternative. A recognized double gesture preserves the target from before the gesture. |
| Commit & shoot | Require an explicit target choice, lock inputs, calculate outcomes, show colored example shot tracers, then zoom to the landing area. |
| Review | Reveal selected and comparison patterns, modeled decision score, rating, outcome percentages, and an expandable lesson explaining why. |
| Adjust & compare | Retain the original decision, hide answers again, adjust the target and recommit. Compare original and retry using the same hole, profile, and random draws. |
| Next shot | Start a new encounter and generated scenario, with no answer overlays carried forward. |

Do not reveal new answers when opening a menu, changing a camera, zooming, selecting a profile, or opening progress. Results remain locked until a retry/new scenario begins.

## 5. Visual direction and interaction requirements

The POV should feel like standing on the tee or at the approach location. A purely flat eye-level projection made hazards hard to see; the current prototype uses an elevated location while maintaining standing eye height. Preserve the ability to read depth rather than optimizing only for photorealism.

Current visual decisions:

- Vivid green putting surfaces; distinct fairway and rough colors.
- Raised green shoulders, sunken bunker bowls, water banks, and highlighted hazard boundaries for readability.
- Per-hazard labels with the correct hazard’s forward yardage range; visible OB boundaries and stakes.
- Dense tree corridors and varied heights/canopies to define doglegs. Selected outside-OB woodland/coast trees are taller and wider. Trees must not obscure every meaningful decision.
- East Coast woodland, Pacific Coast, and desert palettes/vegetation. These currently reuse the same strategic layouts; genuine regional hole architecture is future work.
- The terrain map sits below the POV so it does not cover the hole.
- Results framing fits both core patterns and target markers with less blank space. Rare tail outcomes can be off-frame but still count.

The basic UI should stay understandable on a phone. Further graphical improvement is welcome, but should not require abandoning functioning simulation or delaying useful training features.

## 6. Outcome colors and pattern identity

Tracers, dispersion dots, and outcome percentages share one outcome palette:

| Outcome | Color | Current hex |
| --- | --- | --- |
| Fairway / green | Lime | `#b3ec77` |
| Rough | Orange | `#ffc165` |
| Water | Cyan | `#4bd6fa` |
| OB | Red | `#ff776e` |
| Bunker | Pale sand | `#fff0c5` |
| Trees / recovery | Purple | `#d9a9ff` |

Selected shots are filled dots with dark borders. Comparison shots are hollow circles. Solid gold and dashed blue outlines distinguish selected/comparison 80% core contours. Big misses use larger selected dots while retaining their outcome color. Do not use dot color simultaneously to mean player identity and outcome.

## 7. Free experience and future paid experience

| Capability | Free product intent | Paid product intent | Current implementation |
| --- | --- | --- | --- |
| Straight flight | Yes | Yes | Implemented |
| Handicap dispersion and estimated bag | Yes | Optional | Implemented; illustrative estimates |
| Direction/depth, simulation, lessons, retry | Yes | Yes | Implemented |
| Custom ball flight | No | Yes | Private member preview |
| Own carry/roll and dispersion by club | No | Yes | Private member preview |
| Usual miss and occasional big miss | No | Yes | Private member preview |
| Performance history and trends | Not decided beyond basic practice | Yes | Browser-local preview; no secure entitlement |
| Accounts, subscriptions, cloud sync | Not required for current private prototype | Required for commercial membership | Not implemented |

The desired paid interface remains as simple as the free interface. Use a menu item such as **Customize my Shot**, not a permanently exposed advanced tab. Actual entitlement checks must happen in a trusted backend; hiding a menu or checking localStorage is insufficient.

### Custom shot editor

Open a separate clean screen showing a straight shot toward a target. Users manipulate the midpoint and endpoint horizontally to create push draws, center-start draws, fades, slices, and other combinations. Move the side-view apex to set height. Provide sliders/numeric controls as alternatives.

Current editor supports ten clubs, independent draft settings per club, Save, Back/cancel, reset-to-straight, validated numeric limits, carry, roll, lateral/longitudinal standard deviations, start line, curvature, mean miss bias, correlation, height, and big-miss settings. Midpoint and endpoint jointly determine a quadratic shape; changing one is not a perfectly independent start-line/curvature adjustment. Preserve honest descriptions of that coupling.

Height currently changes the illustration only. Wind, aerodynamics, and airborne tree collisions are not modeled.

## 8. Distance and club behavior

Current free driver total-distance teaching limits are scratch 280 yd, handicap 5: 265 yd, handicap 10: 250 yd, handicap 20: 225 yd. These are adjustable per handicap in assumptions and are **not measured handicap averages or universal maximums**.

Choose the shortest stock club that can reach the requested nominal target. Shorter target depth must select/scale the appropriate club and narrow its dispersion rather than moving a driver cloud backward unchanged. Scale core spread proportionally to requested/stock distance, currently with a 25% floor.

Approaches, including par-5 second shots, exclude Driver and currently use zero rollout. Tee stock distances include rollout; custom approach stock distances use saved carry. Future refinement should examine fairway-wood carry, stopping behavior, launch/landing angle, and partial-swing realism rather than quietly implying those are solved.

## 9. Decision scoring and teaching feedback

Show modeled decision quality, expected strokes from the current position, cost versus the best sampled aim, hazard frequencies, and the distribution of final lies.

Ratings include Just about perfect, Too aggressive, Too conservative, Target needs refining, and an explicit unusable-pattern case. A rating must open a lesson explaining the actual tradeoff using that run’s modeled numbers, including proximity, water/OB/bunker/recovery exposure, selected club, and target adjustment.

For par-5 second shots, compare attempting the green with a layup that leaves a shorter next shot. Neither aggression nor laying up is inherently correct. Different club reach and miss patterns should produce different recommendations. Par-5 scoring currently estimates strokes remaining from the second-shot location; it does not simulate the opening drive or an entire round.

Guided retries compare original and current target, club/distance, score, expected strokes, and water/OB exposure. Do not resample between them or attribute an improvement to target selection after the player changes profile/assumptions. Repeated retries compare against the original decision. This baseline comparison is session-local, not a cloud-saved coaching record.

A good decision can produce a bad outcome. Several nearby targets may be similarly good. The comparison is the **best sampled target**, not a proven unique ideal.

## 10. Current statistical model and its limits

The existing model is usable for a prototype but has not been calibrated to an empirical golf dataset.

- 4,000 seeded Monte Carlo shots per decision; 48 evenly spaced examples animate, 500 selected shots and 250 comparison shots are plotted.
- Correlated Gaussian core in lateral and longitudinal axes.
- Optional Bernoulli big-miss component doubles both standard deviations, adds the chosen left/right shift, and subtracts carry loss. “Both sides” splits direction equally.
- Free profiles are straight: no curvature, mean bias, correlation, or occasional big-miss mixture.
- Custom start line, curve, bias, and rotating aim transform the pattern.
- 80% joint core contour uses a radius of approximately 1.794 standard deviations. It describes the core distribution, not 80% of a core-plus-big-miss mixture. Per-axis 80% intervals use approximately ±1.282 standard deviations.
- Water is checked at carry and during rollout through exact polygon intersection; contact stops the plotted shot. Water uses a fixed scenario drop and penalty.
- OB is checked at the endpoint when water was not contacted. Expected stroke-and-distance cost models repetition of the same strategy; all-OB expectation is infinite.
- Remaining-stroke costs and lie penalties are heuristics, visible and adjustable in the private member tools. They are not a fitted strokes-gained database.
- Comparison search uses a coarse 6-yd lateral / 10-yd depth grid, then 2-yd refinement. It includes the chosen target, shares random draws, club rules and reach limits, and is limited to the scenario’s depth range and ±60 yd laterally.
- Score is `max(0, 100 - 60 × extra expected strokes)`; the score scale is a design choice. Runs with no finite comparison are ungraded.
- Approximate Monte Carlo confidence intervals describe sampling noise only, not uncertainty in assumptions, scoring costs, or optimization.

Before making strong effectiveness claims or selling scores as authoritative, source credible shot data, document provenance/licensing, calibrate profiles and remaining-stroke costs, and test sensitivity to assumptions. Do not fabricate fitted data or cite estimates as measurements.

## 11. Scenario generation: baseline and next milestone

Current baseline has ten authored families with deterministic variation in width, depth, safe pin position, and some dogleg mirroring:

1. Cedar corridor tee shot.
2. Water-long dogleg tee shot.
3. Water-guarded approach.
4. Tucked/bunker-guarded approach.
5. Drivable par 4.
6. Narrow par 4 with OB both sides.
7. Short approach with front sand/back water.
8. Long approach with split bunkers.
9. Open par-5 second shot.
10. Water-carry par-5 second shot.

Mixed favors the opposite shot type and avoids recent families when possible. Users choose shot category rather than a named hole. Retry reproduces the exact geometry and random sample.

### Recommended next milestone: constrained procedural generation

Expand from rescaling templates to generating meaningful structural variation. Parameterize hole centerline/curvature, landing width by distance, bends, green position and dimensions, legal pin locations, OB/recovery corridors, bunker placement, pond geometry, carry distances, layup zones, and region style. Begin with validated strategic families rather than unrestricted random polygon placement.

Required generation guarantees:

- A stable seed and generator version reproduce a scenario and allow retries/bug reports.
- Valid non-self-intersecting polygons and consistent rendering/scoring footprints.
- Legal pins on the actual green and sensible green/hazard relationships.
- Playable corridors and at least one plausible legal strategy under the scenario’s intended constraints. An unreachable green can be intentional if a playable layup exists.
- Meaningful reach-dependent go-for-it/layup choices, not unreachable targets offered as routine choices.
- Tested variety in both geometry and strategic problem; distinguish cosmetic variety from new decisions.
- Automatic rejection or repair of invalid generated layouts, with bounded retries and a known-good fallback.
- No recommendation/dispersion leakage while the user chooses.
- No immediate repetitions; use a seed history or variation signature where needed.

“Nearly unlimited” should mean many valid combinations within a designed generator. Do not promise unlimited distinct strategic architectures or realism just because the seed space is large. Validate representative seeds across all handicap/member reach ranges. Broader generation is not yet implemented.

## 12. Progress and future commercial product

The private preview stores up to 1,000 attempts locally. Only the first completed attempt per scenario encounter enters improvement trends; retries are separate. Profile/assumption changes create separate comparison groups. It shows recent score/regret, ratings, a last-50 chart with rolling averages, and first/latest disjoint windows after sufficient attempts.

History is browser-local and can be lost when browser data is cleared. There is no cross-device sync, account authentication, real subscription gate, or billing. Variable scenario difficulty confounds improvement trends. Future progress should control for difficulty, shot type, profile and model version before asserting learning or handicap improvement.

A commercial web product requires secure identity/entitlements, subscription billing, appropriate production infrastructure, cloud profile/history persistence, privacy/deletion behavior, and broader browser/device validation. Confirm the chosen hosting platform supports those services before implementing billing. None of those capabilities should be inferred from current private Sites access.

A native iOS/Android app is optional later work. Reuse the web product where feasible; device builds, signing, store rules and submission require separate tooling/accounts. Do not redesign the prototype as a native app without a concrete requirement.

## 13. Source and deployment handoff

| Item | Verified baseline |
| --- | --- |
| Working private URL | https://scratch-decision-lab.tsouthcott.chatgpt.site |
| Sites project ID | `appgprj_6ac9a3e7317c8191b1a10027146d39c8` |
| Current source commit | `1333c6c5051a6c89e7b790f0b319faab8a99d628` |
| Prototype version | `12.0.0` |
| Source checkout in the original workspace | `/workspace/sites/scratch-decision-lab` |
| Hosting | Sites; static `dist/` |
| Stack | Buildless HTML/CSS/SVG and JavaScript ES modules; no app runtime dependencies or third-party asset requests |
| Verification at v12 | 101 automated tests passed; syntax checks passed; rendered SVG scenes inspected |
| Unverified | Actual phone/browser layout and gesture behavior; production accounts/billing/native builds |

The checkout path is environment-specific and may not exist in a new Codex session. Obtain the actual source through the existing Sites source workflow or an owner-provided repository/export. The deployed page alone does not transfer the source or credentials. Never embed private tokens in the document, code, command arguments, or logs.

Relevant files:

| File | Responsibility |
| --- | --- |
| `dist/app.js` | UI state, commitment/reveal, rendering, menus and practice flow |
| `dist/index.html`, `dist/styles.css` | Interface and responsive layout |
| `dist/config.js` | Brand strings |
| `dist/model.js` | Shot distributions, lies, expected cost, target search and decision feedback |
| `dist/bag.js` | Club selection, reach, distance/spread scaling |
| `dist/holes.js`, `dist/practice.js` | Extra authored scenarios, family selection and seeded generation |
| `dist/camera.js`, `dist/surfaces.js` | Projection, zoom, terrain relief and picking |
| `dist/landscape.js` | Regional palettes and vegetation |
| `dist/tracers.js` | Outcome palette and illustrated example flights |
| `dist/shot-editor.js` | Custom club validation and flight editor |
| `dist/lessons.js`, `dist/guidance.js` | Explanations, geometry yardages and retry comparison |
| `dist/progress.js` | Local history, profile grouping and trends |
| `tests/` | Model and lightweight DOM interaction checks |
| `README.md`, `package.json` | Implementation notes and test commands |
| `.openai/hosting.json` | Existing Site identity and static hosting configuration |

Run `npm run check` and `npm test`. Use real browser/device QA when supported; the existing DOM harness does not verify CSS layout or actual touch behavior. Preserve existing local settings/migration behavior where practical. The original environment lacks the supported browser preview capability; that is an environment limitation, not a universal rule for new Codex environments.

## 14. Acceptance criteria for future updates

1. No chosen or comparison dispersion/mean/recommendation appears before commit, including after zoom, retry, profile switching and menu navigation.
2. Both target axes influence club selection, reach, dispersion and scoring consistently.
3. Outcome-colored tracers/dots correspond to actual scored shots; no manufactured hazard frequencies.
4. Inputs cannot mutate a committed/running simulation.
5. Retry keeps the same scenario, eligible profile and draws; Next creates a new scenario.
6. Tee/Approach/Mixed filtering works; par-5 second shots are labeled and appear in the appropriate filters.
7. Generated pins and hazard geometry are valid; seeds reproduce exact scenarios.
8. Feedback explains actual modeled tradeoffs and handles infinity/no usable comparison honestly.
9. Custom editor saves valid settings, cancels drafts, keeps clubs separate and preserves free/member isolation.
10. Progress does not treat rehearsed retries as new first attempts or compare changed assumptions as target-only learning.
11. Essential interactions work with touch, cursor and keyboard; reduced motion avoids unnecessary animation.
12. Private access and Site identity remain unchanged; tests and verification limitations are reported accurately.

## 15. Priorities and unresolved choices

Recommended order: procedural strategic variety → actual phone/browser QA → model calibration/sensitivity → commercial accounts/billing/cloud progress → native packaging if justified. Continue visual improvements when they make hazards and decisions easier to understand.

Tyler has not set subscription price, final free/paid entitlements, supported launch platforms, a production backend/payment provider, a licensed statistical dataset, or a native release date. Do not invent those decisions. Routine reversible implementation choices can proceed within an authorized task; consequential external changes need the owner’s explicit scope/approval.
