# Club selection and recommendation sensitivity

Internal computational study, November 4, 2026. App 17.18.4, model v8. No gameplay, grading, saved progress or deployment changed.

## Main finding

Automatic club selection can influence the recommended target as much as target placement itself. In the owner's long-approach example, the front target selects a hybrid while the center selects a 3-wood. Automatic selection favors the front by approximately 0.04–0.05 expected strokes. Holding a feasible 3-wood at both targets instead favors the center by approximately 0.01–0.02 strokes across three independent sample sets.

This does not establish which target is best in real golf. The same-club comparison is a diagnostic using the existing spread scaling, not a measured replacement model. It identifies a club assumption worth validating before changing the long-miss distribution.

## Results

- Reviewed six fixed layouts at four handicaps: **24 combinations**, not 24 independently sampled holes. Checked **68 club-switch boundaries**.
- Switching from 5-iron to hybrid reduces modeled front-to-back spread by **20–27%** across standard approach profiles. Such differences can exist for individual players, but these defaults need supporting evidence. Iron and hybrid spreads currently derive from different preset coefficients.
- Twenty boundaries change at least one spread axis by more than 5%. Five of the 24 selected baseline optima fall within two yards of a switch. These selected examples do not estimate prevalence across the whole app.
- Eight of 24 cases change their exact winning fixed candidate under at least one stress test while the original target remains reachable. The largest fixed-set advantage over the original target is only **0.0169 expected strokes**. Limited candidate comparisons cannot establish global robustness.
- Reoptimizing the owner's long approach moves recommended carry from about 168 yards to 155–176 yards under changed assumptions. Yet the original target costs only **0.0015–0.0319** additional expected strokes across independent checks. All remain within the current 0.05 strong-decision tolerance. A noticeably different recommended point need not mean the previous choice was poor.
- The owner's dogleg retains the same broad corner strategy under spread changes. Stock-distance changes adjust reach; the original target becomes unreachable under the smaller capacity. This is a feasibility change, not evidence of a bad recommendation. Tree clearance and the next-shot route are not physically validated by these tests.
- Collected outcome counts and cost components reconcile with the evaluator. No cost-accounting discrepancy was found in the checks performed.

## Method and limits

Fixtures: front-water (`water`, seed 578), tucked (`tucked`, 17), long approach (`split`, 347430499), dogleg (`sharp-dogleg`, 5), creek (`creek-tee`, 1), shoreline (`shore-green`, 29); handicaps 0, 5, 10, 20. Calm conditions and current surface rollout rules. Each evaluation uses 4,000 draws; independent seeds are 7142026, 112358 and 271828. Baseline optimization uses the first seed; candidate comparisons and validation use all three.

Fifteen configurations include baseline, lateral/depth/both spread multiplied by 0.8 or 1.2, the common stock-distance anchor multiplied by 0.98 or 1.02, and recovery premiums multiplied by 0.75 or 1.25 (rough/sand/woods together, woods alone, sand alone). These are exploratory stress bands, **not empirical confidence intervals**. Mandatory water and OB penalties are unchanged. Recovery adjustments rescore the collected premium above fairway cost.

Fixed candidate sets include baseline best, capped center/flag, selected strategic alternatives and nearby switch boundaries. Unreachable targets are marked unavailable. Only the two owner cases at handicap 20 were reoptimized, under baseline, joint spread and stock-distance changes. Recovery variants compare fixed candidates only. Reoptimized targets were checked on all three sample sets rather than independently optimized on every seed.

This study does not validate real-world carry distributions, mishit frequency, wind physics, amateur recovery costs, short-side geometry or airborne tree collisions. Those remain evidence/model questions. Public-source research remains blocked as described in the research protocol.

## Recommended follow-up

1. Define what stock/intended carry means before fitting distributions; a higher stated carry percentile does not by itself prove an asymmetric distribution.
2. Validate club-specific spreads and contact errors with measured carry data. Review the automatic club policy before smoothing its transitions; discrete club differences are not inherently errors.
3. Make the assumed club understandable in comparisons, and avoid implying that a near-equivalent target is meaningfully worse simply because its exact location differs.
4. Before changing defaults, preserve historical bag/pattern assumptions by model version or snapshots. Saved standard rounds can regenerate clubs from current presets; rollout versioning alone does not protect against future bag changes.
5. Continue source research when access is available. Do not label internal consistency checks as empirical validation.

## Reproduce and inspect

Run `node scripts/study-club-sensitivity.mjs`, then `node scripts/validate-club-study.mjs` from the repository root. Optimization can take several minutes.

- [Full results](CLUB-SENSITIVITY-STUDY.json)
- [Independent validation](CLUB-SENSITIVITY-VALIDATION.json)
- [Spreadsheet summary](CLUB-SENSITIVITY-SUMMARY.csv)
- [External research protocol](DISPERSION-RESEARCH-PROTOCOL.md)
