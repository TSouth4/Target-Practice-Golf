# Three-part expanded feedback — 17.18.8

Live Practice and learning-round results now organize **See details** as:

1. **Your decision:** the approved plain-language comment.
2. **Why the comparison scores better:** a short description of the largest observed cost advantage, followed by the largest added cost where supported.
3. **The difference:** estimated saving per shot and per 100 attempts, calculated from the unrounded expected-strokes difference.

The initial summary, score and verdict are unchanged. The repeated score circle and repeated analytical paragraphs no longer appear. One comparison table remains. Advanced metrics, outcome breakdown and source limitations are available under **Calculation notes and limits**. Existing hidden element bindings are retained for compatibility; the duplicate material is not displayed.

## Evidence and edge cases

- The new helper reads existing cost components and frequencies; it does not evaluate targets or change grades.
- Next-shot savings are described as an easier next shot on average. That component includes putting and water-drop positions, as explained in the calculation notes.
- When hazard frequency and cost move together, the text describes fewer/more shots reaching that trouble. If cost changes without a matching frequency change, it describes the overall stroke cost instead. It does not invent a hazard count or claim that a single adjustment was independently tested.
- Improvements and added costs use the largest available component differences beyond the existing editorial 0.005-stroke precision. This is an explanation filter, not a scoring threshold.
- Differences below 0.005 use **How the targets compare** and say the choices score about the same. Zero difference says the estimated scores are equal. If the original target scores better, the heading and saving direction explicitly favor it.
- All-OB/unusable comparisons have no invented finite saving. Missing component evidence receives a neutral explanation rather than a fabricated cause.
- Example: an unrounded difference of 0.047 displays about 0.05 strokes per shot and 4.7 per 100. The per-100 value is not computed from the rounded per-shot display.
- Strong original choices are still called good choices; the text does not require matching the blue point exactly.

Historical assessment/Par-3 notes and saved outcomes are not rewritten or reconstructed. The new paired explanation uses live paired results where the supporting comparison data is available. No probabilities, club policy, model version, random draws, private access or storage schema changed.

## Verification

- Coaching tests: positive/inverse/tied/unavailable comparisons, missing evidence, main benefit plus tradeoff, unrounded scaling and non-mutation.
- Automated files passed: results/progress, assessment recording, assessment review, coaching, lessons, tradeoff costs and stock-snapshot compatibility.
- Syntax checks and prepared-asset checks passed.
- Chromium at 1440, 390 and 320 px: collapsed initial feedback, all three expanded sections, one table, hidden duplicate score, optional advanced notes and unchanged saved first-attempt data. Expanded phone layout visually inspected.
- Browser script: `node scripts/browser-review/three-part-feedback.mjs`. Existing feedback browser scripts were updated for the new disclosure structure.

Run `npm run prepare:assets` before preview or deployment. This branch is source ready for Work integration, not a live deployment. Preserve Work's current hosted changes when merging.
