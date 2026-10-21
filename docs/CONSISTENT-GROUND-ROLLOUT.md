# Consistent ground rollout — 17.16.0

New practice and new rounds use scoring model `decision-model-v8` and ground rule `surface-v2`.

## Player behavior

Easy is calm with normal ground. Medium and Hard add their existing wind and firmness settings. All three now share the same surface rules:

- Fairway/green use the available stock rollout, adjusted for firmness.
- Landing in rough reduces available roll to 35% of that amount.
- Landing in sand, recovery trees, water or OB has no further rollout.
- A rolling shot entering sand or recovery trees stops at the entry (slightly inside for stable lie classification); water stops at first contact through the existing outcome rule.

Firmness multipliers and the existing firm-ground approach-roll estimate are unchanged. Rough reduction is based on the landing lie, not continuous friction as the ball traverses grass. These are teaching estimates, not a spin, slope, bounce or airborne tree-collision model. The pre-commit straight-line roll aid remains an estimate before shape, random misses and terrain contact.

The audit's isolated shot—150 yd carry plus 15 yd stock roll into a bunker spanning 155–165 yd—now finishes in the bunker at approximately 155 yd in Easy, neutral Medium and neutral Hard. Its example Medium/Hard wind is explicitly set to zero to isolate ground behavior; normal generated Medium/Hard conditions retain wind.

## Existing data

The weather coefficients and condition version remain `wind-firmness-v1`; this is a ground/scoring change, not a wind recalibration. Round layout versions and browser storage keys do not change.

- Existing individual `decision-model-v7` entries remain readable and are labeled previous model. New-model profile keys and current decision/100-rate statistics remain separate.
- Already-started learning rounds, assessments and Par-3 courses retain their original seeds, answers and ground rules. Their patterns explicitly opt into `legacy-v1`, preserving the former Easy behavior. Existing course selected balls, finishes and scores are not rerolled. A visible Earlier model note explains this exception.
- Earlier learning/assessment decisions remain in that saved round rather than being misrecorded as new-model single-attempt progress; completed-round history archives them under their earlier model. Switching to unlimited practice or starting/restarting a round uses the new rules. Temporary lessons use the current rules and restore the paused session afterward.
- Completed earlier rounds remain available in the trends; lines do not connect incompatible model/settings groups and tooltips identify previous models. The Par-3 average now uses current-model rounds, with an earlier-round count explaining why older scores remain in the chart but not that average. A new-model average can therefore initially be empty.
- Backup/import retains the earlier records and saved rounds. Do not relabel or recalculate old scores to make them look comparable.

## Fixed-case review

The six original audit cases were recalculated with the same geometry, default costs and 4,000 draws, seed `7142026`. [Current calculations](MODEL-VALIDATION-CASES-V8.json) are separate from the [original audit snapshot](MODEL-VALIDATION-CASES.json).

| Situation | Corrected-model result |
| --- | --- |
| 122-yd front-water approach, 20 handicap | Green-center target: 3.454 expected strokes versus 3.619 for the short layup. The best sampled carry remains about 132 yd. |
| Tucked flag, 5 handicap | Flag target: 3.303; green center: 3.067; far safe-side target: 3.371. Balanced recommendation remains between extremes. |
| Crossing creek, longer profile | Best sampled carry about 263 yd clears the creek; cost 3.786 versus 3.979 for the tested 182-yd layup. |
| Same creek, shorter profile | Best sampled carry about 163 yd stays short; cost 4.098 versus 4.754 for maximum carry along the flag direction. |
| Sharp dogleg, 20 handicap | Best sampled corner target remains x=86, y=191 (about 209 yd carry), cost 4.466 versus 5.218 straight ahead. |
| Long Par-3, 20 handicap | Best sampled carry remains about 168 yd, cost 3.538 versus 3.578 at the green center and 3.763 at the flag. |

Lower cost means a better decision under the current assumptions. These checks do not establish empirical golf accuracy. Calm approaches have zero stock rollout, so those cases are unchanged. Tee costs can change as sand/trees stop rolling shots and rough reduces distance. The optimizer can consequently move its target. Primary-source verification, future-shot obstacle costs, short-side recovery and wind calibration remain open model-review work.

Running the review with `--legacy` reproduced every target, outcome percentage, clamped count and cost breakdown in all six original v7 cases exactly. Reproduction commands:

```
node scripts/model-validation-review.mjs > /tmp/current-ground-cases.json
node scripts/model-validation-review.mjs --legacy > /tmp/legacy-ground-cases.json
```

## Verification

The complete run executed 239 tests: 238 passed and one existing long-Par-3 assertion still expected earlier models to enter the current average. That test was updated to require both retained chart points but only the current-model average; all five tests in its file then passed. No production code changed after the complete run; the full suite was not repeated after this test-only correction. Syntax/whitespace checks passed.

The 24 initial focused rollout/conditions/progress checks and 15 saved-round/dashboard/backup checks passed. Focused tests cover neutral-condition equivalence across all three difficulties, all landing lies, shaped/correlated misses, sand/tree/water contact, center-flight parity, original Easy compatibility, saved learning/assessment/course continuation, new-round reload, backup preservation and model-separated averages. Browser checks passed at 1440, 390 and 320px for earlier learning/assessment/course resume, exact stored course review preservation, restart/new rules and separate history. Worker and page-thread fallback checks passed on desktop/phone for practice, hard conditions, learning, assessment and course play, including retry, privacy, selected-ball reload, blocked-worker recovery, full shot-array parity, cached guides and Infinity preservation.

Actual devices and the Work-hosted build still need owner review. To test the corrected behavior, use unlimited practice or start a new round; resuming an old round intentionally retains the earlier rules.
