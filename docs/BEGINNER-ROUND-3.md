# Learning journey and outstanding decisions — 17.12

Home recommends Introduction, then a baseline assessment, then a five-shot learning round. After a learning round with a majority tendency it suggests a relevant existing lesson. With no clear majority it recommends testing one adjustment at a time. After further practice and the suggested lesson, reassessment is offered. All existing modes and Continue round remain available.

Round reports include one next-step principle and a direct lesson action. A majority means more than half of the decisions; a tie is not treated as a dominant tendency. The recap describes a small simulation sample, not an established personal habit.

Reassessment can be opened from the report, Home or My Progress. Setup remains reviewable before Start. It reuses the saved assessment's handicap, distance limit, difficulty and custom bag snapshot when the selection is unchanged. Reusing an older custom bag for the assessment does not overwrite the player's current personal bag. Canceling setup does not start a replacement round. Changing the setup selections starts an ordinary assessment at those selections.

Assessment comparisons match model, round version and normalized profile, including the custom bag. Easy omitted in older profiles matches explicit easy. They compare average decision score, estimated strokes lost per 100 similar decisions, and aggressive/conservative category counts with the earliest retained matching assessment. Changed settings start a separate baseline. Ten choices and new randomized holes can change results; the comparison does not claim measured handicap improvement. Round history is limited to the existing retained browser records.

A score of 100 already requires both a target within two yards of the best sampled target and no more than 0.005 modeled strokes of regret. Boundary tests protect that rule. Grading, simulation and model version are unchanged.

Unguided 100s receive a gold target pulse with a small particle burst and an achievement card. First-choice and refinement messages differ. The pulse has a short lifetime and is not replayed after reloading a saved course review. Reduced-motion settings replace animation with a still gold highlight. No sound or new preference/storage keys are introduced. Par-3 target achievements remain separate from the selected ball and hole score; re-tees are identified as refinements.

My Progress shows how many of the most recent up-to-50 first choices scored 100, with an explicit denominator and percentage, a non-overlapping previous window, and a rolling up-to-20-choice trend. Existing dashboard deduplication combines completed assessment/course choices with ordinary history without double counting learning rounds. Guided examples do not enter that history. Saved practice retry 100s are counted separately. Mixed settings and small samples are disclosed; the existing difficulty filter applies. Earlier model results remain excluded from current-model totals.

Assessment shots show no celebration, 100 badge or coaching before the report. The final report can acknowledge the number of first-choice 100s. Existing saved rounds, progress, backup format and owner wording-review documents remain compatible and untouched in format.

Release includes dist/learning-journey.js and dist/achievements.js; transfer the complete repository ZIP through Work. This branch does not deploy the site.

Validation includes threshold and matching-profile unit tests; restored report and custom-baseline setup tests; practice/retry/history tests; and browser checks at 1440px, 390px and 320px for recommendations, progress rates and reassessment. Actual optimized-target shots verified first-choice and retry 100 celebrations in normal and reduced motion, while preserving the first result. Assessment browser checks explicitly assert all new achievement surfaces and the pulse are hidden. A restored par-3 100 verifies the static award, accessible Next control and no repeated pulse. Existing progress KPIs remain above the added rate/trend section.

Final verification: syntax checks passed; all 228 tests passed with zero failures/skips. After the final pulse lifetime and retry-label adjustment, 15 focused journey/history/result tests and desktop/phone journey plus normal/reduced-motion achievement browser checks passed. Assessment privacy and restored-course checks also passed. No dependencies were added.
