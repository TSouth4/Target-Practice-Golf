# Owner feedback on fixed model examples — November 3, 2026

## What the owner observed

- The long approach appears to have too many/far-too-long results. The owner expects imperfect strikes to produce more short misses and prefers the green center to make room for those misses.
- The owner considers a just-short miss here relatively manageable, potentially puttable.
- The owner mentions water short-right in example 1. The saved fixed `split` Par-3 has no water polygons; verify the displayed page/layout/version with a screenshot before treating that feature as confirmed. Do not dismiss the general dispersion concern because of this mismatch.
- On the dogleg, the owner provisionally favors the extra distance of B, conditional on tree height and clearance. A can also leave blocked routes; merely laying back does not guarantee an easy next shot.

These are review findings, not authorization to overwrite scoring assumptions or declare calibration complete.

## Checked against the current code

The standard 20-handicap approach uses a symmetric Gaussian longitudinal error with no separate short-mishit mixture (`bigPct=0`, `bigShort=0`). Carry is its distribution center. Side/long correlation is zero. This does not represent a measured handicap-specific, short-skewed strike distribution. The separate custom large-miss settings do not change the standard defaults.

For B (179.629 yd nominal carry, 3 wood), all 4,000 outcomes have zero rollout in these calm approach conditions. Error is measured along the chosen aim line:

| Outcome | Count / 4,000 | Percentage |
| --- | --- | --- |
| Short of intended carry | 1,991 | 49.775% |
| Long of intended carry | 2,009 | 50.225% |
| More than 20 yd long | 452 | 11.3% |
| More than 40 yd long | 32 | 0.8% |
| More than 60 yd long | 1 | 0.025% |

The 10th–90th percentile range is about 158.8–200.7 yd along the aim line. The longest full-sample forward position is about 244.3 yd; the displayed 500-point subset reaches about 235.0 yd forward. None reaches 250 yd forward in this fixed case. The chart's 250-yard axis tick is not itself an outcome. The Gaussian is unbounded and its 16.26 yd longitudinal standard deviation is illustrative, not measured evidence of actual 3-wood tails for a 20-handicap golfer.

The concern is therefore not frequent 40-yard overshoots: those are 0.8% here. The important calibration questions are the symmetric default, spread width/long tail, intended-carry definition, club-specific error assumptions, and automatic club-choice discontinuity already documented. Many poor strikes lose distance, but short-of-green statistics also include club selection, target choice and conditions; they cannot be substituted directly for one club's carry-error distribution.

In the fixed case, C lies on the front of the green rather than short of it. The center is only about 0.040 modeled strokes worse than C and qualifies as a strong decision under current feedback rules. Do not describe the owner's center choice as clearly bad.

## Dogleg geometry check

From A's intended target to the pin, the straight ground reference crosses `Left dense woods`; its direct remaining distance is about 280.2 yd. From B's intended target to the pin, that reference crosses no recovery woods and is about 215.0 yd. These are distances from intended carry targets, not the actual rolled finish of every shot.

The tee-to-B reference crosses `Right open woods`. No airborne branch/height test exists, so feasibility remains conditional. The owner is right to consider whether the longer first shot opens the route, not just the landing lie. Existing recovery costs vary by lie/distance and woodland multiplier but do not explicitly simulate the future route or this handicap's remaining club reach.

## Recommended investigation before model changes

1. Reconcile the scenario-1 screenshot/version and define intended carry clearly (typical well-struck stock carry versus all-strike average). Those anchors imply different error/bias calibration.
2. Seek appropriate measured club/profile strike data and separate execution misses from underclubbing/target-choice bias. The existing Tour distance/lie table does not supply those distributions.
3. Build isolated comparisons of the present symmetric distribution and a normal-strike-plus-mostly-short-mishit candidate, with assumptions visibly labeled and club selection controlled. Keep plausible long misses; do not adopt arbitrary short-bias percentages or a hard stock-carry cap without evidence.
4. Recheck target rankings, club-boundary effects, tails, each handicap, woods/penalty accounting and feedback. Decide whether calibration changes are justified before changing live scoring; version historical model/results deliberately.
5. Preserve the owner's conditional dogleg reasoning and validate route feasibility separately from landing/next-shot costs.

No runtime files, grading rules or stored progress changed. Reproduce the distance diagnostic with `node scripts/review-dispersion-distances.mjs`; [raw output](DISPERSION-DISTANCE-REVIEW.json) records all three targets.
