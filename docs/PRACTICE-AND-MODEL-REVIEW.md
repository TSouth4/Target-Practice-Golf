# Practice selection and model review — October 28, 2026

Reviewed repository app 17.16.2, commit 7ae5c11. This is a diagnostic review, not a deployed-site audit. Work may contain newer changes not present here. No application behavior, scoring, saved data or version numbers changed.

## Practice: the opening repetition is real

The default application state sets `scenario: 'cedar'`, `holeSeed: 0`, `seed: 7142026`, and woodland scenery. A fresh browser starts on the authored Cedar hole rather than a randomly generated layout. Saved settings restore the scenario and layout seed on return. Choosing Home → Practice simply reopens that layout; it does not request a new hole. Switching from a round into unlimited Practice can also retain the round's current scene.

Next shot increments the shot seed by 7919 and uses it to select the next family and generate its layout. That is seeded pseudorandom generation: reproducible from the same starting state. It is not an independently randomized session on every visit. Retry intentionally keeps the same misses for comparison.

The picker has 16 base families (eight tee and eight approach), excludes the current family and tries to avoid the last six. Mixed explicitly prefers the opposite shot type, producing strict tee/approach alternation. Eight choices with six recently excluded leaves a small pool in single-type practice, producing a cycling feel despite changing geometry. Several families also share the same underlying generation structure; shoreline variants reuse existing families with side water. Unique coordinates do not establish unique learning experiences.

## Reproduction and sample results

`node scripts/practice-randomization-review.mjs` opens the actual app module through the DOM harness with no saved app state and verifies that returning Home → Practice keeps the layout. It then exercises the actual next-family and geometry functions for 1,000 transitions per filter, starting from the default seed. It does not visually drive 3,000 shots in a browser or simulate arbitrary user histories.

| Filter | Families encountered | Unique playable geometry | Immediate family repeats | Generator fallbacks |
| --- | --- | --- | --- | --- |
| Mixed | 16 | 1,000 / 1,000 | 0 | 0 |
| Tee | 8 | 1,000 / 1,000 | 0 | 0 |
| Approach | 8 | 1,000 / 1,000 | 0 | 0 |

Mixed encountered each family 56–67 times and alternated type on every transition. Tee counts ranged 124–127 and approach 123–127. This is one long seeded stream per filter, not a proof of statistical independence. Exact output: [Practice results](PRACTICE-RANDOMIZATION-RESULTS.json).

Recommended implementation next: distinguish Continue practice from New practice; choose a fresh session seed/layout for New practice while preserving unfinished rounds; use a separate selection stream from shot-comparison draws; consider a balanced shuffled family deck and less rigid mixed ordering. Verify resume, filters, retry, browser reload and saved rounds. More visually and strategically distinct families remain a separate content improvement. These changes have not been implemented by this audit.

## Model checks

Re-ran `node scripts/model-validation-review.mjs`. All six case calculations exactly match the retained v8 report, excluding app-version metadata. These are estimated strokes to finish including the selected shot; lower is better.

| Case | Comparison | Sampled recommendation | Interpretation |
| --- | --- | --- | --- |
| 122 yd front water, 20 handicap | Green center 3.454; short layup 3.619 | 3.452 | Clearing the creek beats laying back here; center is effectively tied with the selected optimum. |
| Tucked flag, 5 handicap | Flag 3.303; center 3.067; far safe side 3.371 | 3.027 | Both flag hunting and excessive caution cost more in this example. |
| Crossing creek, 0 handicap | Before creek 3.979; beyond creek 3.883 | 3.786 | Reachable longer carry gains enough distance to justify risk in this model. |
| Same creek, 20 handicap | Before creek 4.402; flag-direction maximum carry 4.754 | 4.098 at about 163 yd carry | Wider misses and shorter reach favor leaving more room before the creek. |
| Sharp dogleg, 20 handicap | Straight 210 yd 5.219 | 4.466 toward the corner | Internally consistent, but no airborne tree collision or full next-route simulation is modeled. |
| Long Par-3, 20 handicap | Flag 3.763; center 3.578 | 3.538 at about 168 yd carry | Center versus slightly shorter target needs human review; small advantage depends on recovery assumptions. |

Then re-evaluated all fixed candidate targets with three additional independent 4,000-shot draw sets (without re-optimizing): `node scripts/model-validation-sensitivity.mjs /tmp/model-validation-oct28.json`. Raw output: [target sensitivity](MODEL-TARGET-SENSITIVITY.json).

Major comparisons retained their direction in all three sets. In front-water, the center was 0.002 strokes better than the original sampled recommendation in one set, and 0.003–0.012 worse in the others. Do not interpret thousandths as reliably distinguishing a perfect aim. In the long Par-3, the center remained about 0.041–0.047 strokes worse, but the model omits some short-side recovery context; numerical stability does not establish realism.

The zero-wind/normal-ground diagnostic gives the same bunker-stopping finish in Easy and Medium, confirming the previous rollout inconsistency remains resolved.

Five focused native test files passed: strokes-baseline, approach-layup-costs, tradeoff-costs, conditions, practice-dropdown. They cover reference interpolation/accounting, the reachable front-water regression, risk-distance tradeoffs and wind behavior. This is not empirical calibration or a full-suite/browser run.

Still pending: primary-paper transcription verification; measured amateur dispersions/recovery costs; wind calibration; next-shot blocked routes; short-side difficulty. Existing limitations are documented in [the earlier model review](MODEL-VALIDATION-REVIEW.md). No newly confirmed calculation defect was found in these cases, but the model's estimates should not be presented as uniquely correct real-golf answers.
