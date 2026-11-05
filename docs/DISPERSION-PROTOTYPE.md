# Experimental carry-pattern comparison — 17.18.6

Open **`/dispersion-prototype.html`** on a preview/host containing this source. Links also appear on the original model-review and club-comparison pages. Normal gameplay has no new distribution, scoring rule or stored progress change.

## How to review

1. Start with **Long approach · 20 handicap**, **Green center**, **Same target**. Compare how many carries finish short, 20/40 yards long, and on the green. All three panels show the same course scale, club, intended carry, lateral misses, weather and underlying random draws.
2. Switch to **Each pattern's best sampled target**. The white cross moves to the best target in that pattern's candidate set; the blue diamond marks that same best. Inspect target movement and estimated cost, not only the score. Each score compares with its own pattern's benchmark and is not evidence of improvement across models.
3. Try front-water and tucked-flag examples, then the 5-handicap settings. Ask whether normal strikes, mishits, long misses and the recommended area look plausible. Note what seems wrong rather than choosing the version with the highest green percentage.

Useful feedback: which hole/profile/target/view; which pattern; what looked unrealistic; and whether the distribution or the recommendation caused concern. Do not treat visual preference as calibration data.

## Exact experimental choices

- Six combinations: three fixed approach layouts × handicaps 5 and 20. Seeds/families match the prior study: split/347430499, water/578 and tucked/17.
- Each combination holds one club fixed, selected using current automatic policy at a reference eight yards beyond green center. Aiming at different distances scales that same club's spread proportionally, using the existing assumption.
- Target candidates: flag, green center and front-center when feasible, plus x±18 yd at 6-yd steps and y±24 yd at 8-yd steps. Only 75–100% of that club's stock carry is allowed. These are limited experiment boundaries, not global optimization or validated partial-swing rules. Some named targets can be absent when outside the held club's range.
- Three independent sets of 4,000 shots: 7142026, 112358 and 271828. The first selects the best candidate and supplies displayed metrics/dots. All three evaluate the displayed targets for sensitivity. Independent seed checks do not repeat target optimization.
- Current: unchanged standard-normal depth errors, with approximately half short.
- Shifted: subtract 0.5244005 original depth SD from each draw, keeping width unchanged; this places the stated carry around P70. It is not a calibrated iron parameter.
- Mixture: multiply original depth errors by 0.65; for draws whose original uniform variate is below 0.20, subtract another 1.5 original SD. Thus 20% are designated experimental mishits. Their frequency/severity and the tighter core are illustrative. Lateral errors remain unchanged. Zero correlation and zero pre-existing large-miss mixture are required to avoid accidental double counting.
- These approach patterns have no rollout, so the charts show carry landings. Colors use outcome classification. No ellipse or empirical coverage is inferred. Half the cloud can lie outside the green without indicating the target was poor relative to other feasible choices.
- Existing Tour-reference costs, hazard geometry and grading function are reused for comparison. No personalized scoring claim or airborne-tree simulation is added. Near-equivalent targets can receive nearly identical cost estimates; rare 100-point criteria remain visible in the experimental scores.

## Early observations — conditional on chosen assumptions

For the 20-handicap long approach with a held 3-wood, best sampled carry moves from roughly **171 yd** in the current pattern to **179 yd** in the shifted pattern, and **180 yd** in the mixture. This demonstrates sensitivity to the depth model; it does not establish that the last version is correct.

At the same green-center target, the first sample set has approximately **50% / 69% / 59%** short carries for current/shifted/mixture. The mixture changes both width and mishit structure, whereas the shifted pattern changes only the center. More greens under a narrower assumed pattern does not prove better model realism.

## Build, verify and collect evidence

Run `node scripts/prepare-dispersion-prototype.mjs` to regenerate the standalone page and [raw results](DISPERSION-PROTOTYPE-RESULTS.json). The research helper lives in `scripts/dispersion-experiment.mjs`, outside runtime modules. Run `node tests/dispersion-experiment.test.mjs` for deterministic transforms, baseline evaluator equivalence, fixed-club/feasibility restrictions and generated artifact consistency.

Browser QA uses installed Chromium directly through its DevTools protocol: `node scripts/browser-review/dispersion-prototype.mjs`. It checks all six combinations and both views at 1440, 390 and 320 px, 1,500 rendered points, page overflow and unchanged local storage. The temporary npm browser-driver download was denied by network policy; no denial was bypassed.

The [collection sheet](CARRY-DATA-COLLECTION.csv) is a blank starting template, not acquired observations. Use participant codes, record stated stock carry before hitting, distinguish full/partial intent, retain real mishits and identify sensor failures separately. Obtain participant permission before collecting or sharing identifiable information or exports. Nothing has been collected or uploaded automatically. Follow the full [research protocol](DISPERSION-RESEARCH-PROTOCOL.md) before fitting defaults.

No production-model version bump is warranted because the experiment is isolated. A future adopted distribution still needs a new model version, historical evaluator compatibility, coverage tests and owner review before deployment.
