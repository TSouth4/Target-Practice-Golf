# Model review: what we know and what to check next

Prepared October 18, 2026 against app 17.15.0, application commit `686e907`, scoring model `decision-model-v7`. This is a read-only audit: no app, scoring or saved-data changes. It complements [the existing scoring reference](../STROKES-BASELINE.md).

Update: the rollout consistency issue is addressed in [17.16](CONSISTENT-GROUND-ROLLOUT.md), with a separate v8 case report. The observations and numbers below retain the original audit snapshot.

## Main finding

The app has a statistical foundation, but not every part is measured golf data. Its next-shot costs use a cited historical PGA TOUR reference. Handicap shot patterns, wind, ground response, forest severity and the probabilities used to finish a Par-3 hole contain teaching assumptions.

We can verify arithmetic and consistency ourselves. Your golf judgment helps identify missing context. Neither a passing test nor agreement with a recommendation establishes that the whole model predicts real amateur golf accurately.

## What each part is based on

| Part | Current basis | What is still unverified |
| --- | --- | --- |
| Strokes remaining by distance and lie | Transcription attributed to Mark Broadie: off-green Table B.1, *Assessing Golfer Performance on the PGA TOUR* (2012), 2003–2010 ShotLink; putting Figure 1/table, *Putts Gained* (2011). Third-party MIT attribution is retained. | Fresh comparison of every transcribed value against the primary papers. Both cited PDF URLs returned HTTP 403 during this audit; selected-value tests check the stored transcription, not the original papers. |
| Values between published distances | Linear interpolation; nearest endpoint outside the supported range. Off-green tables start at 10 yd; published putting begins at 2 ft. | Target recommendations sensitive to clamped distances. The 1-ft tap-in anchor is an added assumption. |
| Handicap and custom shot patterns | Illustrative club distances and Gaussian spreads; custom profiles can add shape, correlation and larger misses. Basic profiles disable the large-miss mixture. | Measured handicap-conditioned spread/tail data and calibration to a particular golfer. |
| Ability after the selected shot | The same Tour reference for every handicap, with optional custom offsets and authored woods multipliers. | A 20-handicap player's actual bunker, recovery and putting costs. Wider first-shot dispersion does not make subsequent play amateur-calibrated. |
| Wind and ground | Bounded teaching formulas: flight height/distance change wind exposure; headwind and tailwind differ; firmness changes rollout. | Comparison with measured ball flights/launch-monitor data and surface behavior. Wind is added to the shot shape, not a full aerodynamic interaction with spin. |
| Penalties | Water: one penalty plus modeled play from relief. OB: stroke and distance with the same strategy repeated in the expected-cost calculation. | Water relief location varies by authored drop point or shoreline bank. Repeated-strategy OB cost is a decision-policy estimate, not the official SG of one real shot. |
| Par-3 hole finish | One sampled first shot, then authored outcome probabilities adjusted to match the reference mean. | Matching the mean does not validate real birdie/bogey frequencies, individual chips, later putt lengths or amateur scores. |
| Grade and verdict | Grade penalizes cost relative to the best sampled target; 100 also requires closeness to that target. Verdict categories use risk/proximity thresholds. | The score scale and category thresholds are product choices. A searched target is approximate, and a short reason is not proof of a uniquely correct cause. |

## Recommended next checks, in order

1. **Make normal-ground rollout consistent across difficulty modes.** Confirmed diagnostic: with no shot error or wind, carry 150 yd and stock roll 15 yd, a bunker spans 155–165 yd. Easy finishes at 165 yd, classified as fairway; Medium with zero wind and normal ground stops at 155.00001 yd, classified as bunker. Medium's zero wind is an isolation test, not a normally generated Medium condition. The behavior comes from Easy preserving legacy rollout while Medium/Hard stop in sand/trees and reduce roll from rough. Agree on one terrain rule before changing it; changing scored outcomes requires deliberate model-version/history handling.
2. **Review future trouble after a layup.** Remaining-shot costs depend on straight-line distance and lie. They do not explicitly simulate the next creek crossing, a blocked route around a dogleg, or a tree blocking the next shot. This can make some layups/recovery positions too attractive. It is a known simplification, not evidence that every layup recommendation is wrong.
3. **Review short-side recovery teaching.** At the same distance and lie, the model does not add difficulty for having little green to work with, slopes or a high bunker lip. Lessons can explain the principle, but the numerical recommendation cannot fully demonstrate it yet.
4. **Verify the primary source tables and choose the reference-player promise.** Obtain accessible copies of the cited papers and check all values. Decide whether the app intentionally teaches against a common Tour reference or needs measured amateur recovery tables. Do not invent handicap-specific costs to match intuition.
5. **Check wind/firmness against measured examples.** Useful after the calm baseline is trusted. For illustration only, the current formula moves a 150-yd, 25-yd-high center flight 10 yd sideways in a 10 mph crosswind; the corresponding headwind reduces carry 10 yd and tailwind adds 6 yd. These are formula outputs, not verified accuracy claims.

## Six controlled examples for our discussion

All use calm conditions, normal ground, 4,000 identical draws per comparison, draw seed `7142026`, and default costs. Numbers are expected **current shot plus penalties plus remaining strokes**; lower is better. They are model calculations, not measured playing results. Each case uses one fixed search reference; this is not a reproduction of every alternative target's separate on-screen optimization/grade. Unreachable flag/center targets are capped at the club-profile limit.

| Case | Model comparison | Your useful judgment |
| --- | --- | --- |
| 1. 122-yd front-water approach, 20 handicap (`water`, hole seed 578) | Green-center carry ≈134 yd: **3.454** strokes; short layup carry ≈83 yd: **3.619**. Water rates: 7.70% versus 1.75%. The best sampled carry is ≈132 yd, cost 3.452. | Is risking that water exposure for the green sensible? What would make a layup reasonable here? |
| 2. Tucked flag from the graphics trial, 5 handicap (`tucked`, 17) | Flag: **3.303**; green center: **3.067**; far safe-side green target: **3.371**; sampled best: **3.027**. Water rates: 16.13%, 0.28%, 0%, 2.23%. | Does the balanced target leave believable room? Is the safe-side example clearly giving up too much proximity? |
| 3. Crossing creek, 0 handicap (`creek-tee`, 1) | Sampled best carry ≈263 yd clears the creek: **3.739**. The comparison 182-yd layup costs **3.979**. | Is the aggressive option physically believable with that profile? Is the next shot from the layup fairly represented? |
| 4. Same crossing creek, 20 handicap | Sampled best carry ≈161 yd: **4.100**, 0.78% water. The maximum-carry target along the flag direction (210 yd) costs **4.778**, 44.00% water. | Does the shorter profile genuinely need to lay back this much? Is the visual distance information sufficient to see why? |
| 5. Sharp dogleg, 20 handicap (`sharp-dogleg`, 5) | Straight 210-yd carry: **5.214**. Sampled corner target at world x=86, y=191, carry ≈209 yd: **4.419**. | Is the corner target visible/reachable and is the next route to the green believable? The model does not test airborne tree contact. |
| 6. Long Par-3, 20 handicap (`split`, 347430499; round seed 1234) | Flag carry ≈182 yd: **3.763**; green-center carry ≈180 yd: **3.578**; sampled best carry ≈168 yd: **3.538**. | Does the shorter target make golf sense, or is a short-side/recovery issue missing? Here the small center-versus-best difference deserves more scrutiny than the clear flag-versus-center difference. |

Some outcomes use clamped costs. For example, the tucked case's flag target has 894 of 4,000 outcomes (22.35%) with a remaining-distance lookup outside the supported range, versus 283 (7.08%) at the sampled best. These are not extra hazard probabilities; they flag source-range limits. We should inspect affected lies and recommendation sensitivity before treating small cost differences as precise.

These identifiers make the examples reproducible for development; the normal app does not currently provide an owner-facing seed picker. You do not need to enter them. When we review a case together, I can bring up the fixed layout and show the targets.

## What you can send while playing

A screenshot, handicap/custom profile, difficulty, intended carry, and scenario seed if shown. Add: **“I would aim here because…”** and **“I expected this recommendation because…”**. We can then separate incorrect geometry, incorrect accounting, a missing real-golf factor, and a surprising but internally consistent tradeoff.

Your feedback can guide the model without needing an independent coach to begin. Published-data transcription and measured flight accuracy still need evidence; opinion alone cannot establish those.

## Evidence and reproduction

- Four existing focused suites passed **14/14 tests** during this audit: `strokes-baseline`, `approach-layup-costs`, `tradeoff-costs`, and `conditions`. Coverage includes units/interpolation/clamping, the reachable 122-yd approach, cost-component accounting, OB recurrence, wind direction and ground rules. This is not a new full-app or empirical validation run; the preceding graphics integration passed its complete 232-test suite.
- [Raw case calculations](MODEL-VALIDATION-CASES.json) retain exact geometry, targets, club/carry, outcome percentages, clamped counts and cost breakdowns, plus the isolated rollout diagnostic.
- Reproduce with `node scripts/model-validation-review.mjs > /tmp/model-validation-cases.json`. It reads application modules and writes JSON to stdout; it does not start the app or access saved browser data. It uses the current checkout's formulas, so reproduce this snapshot from the audit commit.
- Implementation reviewed: `benchmark-broadie.js`, `strokes-baseline.js`, `model.js`, `bag.js`, `conditions.js`, `course.js`, plus the existing source documentation and relevant tests.

Primary sources: [off-green paper](https://business.columbia.edu/sites/default/files-efs/pubfiles/4996/assessing_golfer_performance.full.pdf) · [putting paper](https://www.columbia.edu/~mnb2/broadie/Assets/putting_strokes_gained_20110113.pdf). Primary-document comparison remains pending because the downloads returned 403. No change to the app is required to read this review.
