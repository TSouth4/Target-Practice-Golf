# Plain-language feedback — 17.18.7

The first result now shows the existing score/verdict, one short general comment and at most one adjustment to try. The existing analytical explanation, learning principle, detailed experiment and statistics remain under **See details**. Retry analysis is under **See retry details**. No scoring, target search, probability distributions, shot geometry or simulation rules changed.

## Approved wording and guards

- Good target: “You picked a good target. It gives your good shots a chance to finish close and leaves room for your misses.” Practice adds that matching the blue point exactly is unnecessary. Par-3 single-ball results do not refer to an unseen blue point.
- Aggressive: “This target is a little too aggressive. Your good shots may finish close, but aiming this close to trouble makes your misses costly.”
- Conservative: “You’ve given the trouble plenty of room, but played a little too safely. You could aim closer without taking on much more risk.” If the comparison has materially more hazard exposure, the last sentence instead invites comparison with an easier next shot; it does not promise little additional risk.
- Short carry: “Your good shots may reach the green, but you haven’t left enough room for shorter shots.” Then: “Try a little more carry.”
- Long carry: “Your target leaves too little room behind it. Too many of your longer shots finish beyond the green.” Then: “Try a little less carry.”
- Refinement: “You’re close to a good target. A small adjustment could help more of your shots finish in a better position.” This is used when the comparison actually indicates a small adjustment. Otherwise: “A target adjustment could help more of your shots finish in a better position.”

Tee comments refer to leaving an easier next shot or gaining useful distance rather than reaching a distant green. Pure carry explanations require collected short/long landing evidence, a carry-only comparison and a difference exceeding two percentage points. Short-carry wording additionally requires some green outcomes. Mixed direction/carry changes receive a single exploratory adjustment rather than a claim that one factor caused the result. All-OB and unusable-comparison cases retain clear setup/boundary warnings rather than positive generic comments. Real contact mishits are not inferred from short finishes.

## Assessment and saved rounds

The existing pre-assessment screen is titled **Find your starting point** and states:

> Choose a target for each of the next 10 shots. We’ll score your decisions, but save the feedback until the end. This gives you a starting point to compare with after practicing.

Setup and replacement information remain visible. The button says **Start assessment**. Introduction → Assessment remains the intended flow; no navigation or onboarding-mode reorder was introduced.

Active assessments still withhold individual grades, comments, comparison targets and overhead feedback until completion. New saved assessment notes include optional plain summary/adjustment fields; detailed notes remain available in nested See details. Older notes and scores remain readable. New Par-3 decisions save their plain comment alongside detailed learning text. Older Par-3 reviews display a category-based general comment while retaining their original explanation in the details; selected shots, scores, finish simulation and stored answers are not recomputed.

Optional new fields are bounded/validated. All displayed stored assessment text remains escaped. No new storage keys, membership rules or access settings are introduced.

## Verification

- Coaching tests cover non-mutating summaries, tee wording, unusable outcomes, evidence-required depth advice and unchanged detailed lessons.
- Assessment tests cover completion-only rendering, original scores, escaped summaries, nested numeric details, optional-field validation and older saves.
- Focused round/course/assessment recording suites passed.
- Chromium review checks ordinary/full-screen practice, collapsed and expanded details, score retention on detail toggles, first-attempt preservation on retry, assessment privacy and legacy Par-3 selected-ball/score preservation at 1440/390/320 px. Script: `node scripts/browser-review/plain-feedback.mjs`.
- Full suite: 67 files passed initially; one results/progress assertion still required an adjustment prompt on every result. Updated that assertion to allow no prompt for a good target and verify the detailed experiment remains available. All seven tests in that file passed on rerun; all 68 test files have passed across the full run and corrected-file rerun. Final coaching/assessment unit checks and syntax checks passed.
- Browser checks passed at 1440, 390 and 320 px, including ordinary/full-screen layout, detail toggles, retry history, withheld assessment feedback and unchanged legacy selected ball, score and answers. Desktop and phone result screenshots were visually inspected.

Build matched assets with `npm run prepare:assets` before previewing or publishing. This source update is not a live deployment; merge into the latest Work-hosted source while preserving its changes.
