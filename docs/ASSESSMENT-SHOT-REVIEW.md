# Optional assessment shot review — 17.18.0

## Report behavior

At the bottom of a completed ten-shot assessment, **View shot results** is collapsed by default. Opening it shows ten simple rows such as “Shot 1 — 98/100 · Strong decision · slightly aggressive.” Each row is another native, keyboard-accessible disclosure. Expanding it reveals the original intended carry, why, how to improve, an experiment to try later, and the original estimated strokes-lost comparison. There are no automatic pop-ups or expanded rows.

The original first-choice score, category and aggregate totals are unchanged. Scores of 95 or higher soften aggressive/conservative wording to acknowledge a strong choice with a small adjustment available. This is an editorial threshold, not a scoring or model change. Normal practice and new Par-3 verdicts use the same label helper. The stored category remains unchanged for tendency analysis.

Coaching is captured at the time of the shot but is not rendered into the shot-review UI until the assessment is complete. During the assessment, individual grades, coaching, comparison patterns and retries remain hidden. Reviewing does not re-run or re-score the simulation.

Completed current assessments can be reopened through **Assessment → View last assessment results** after returning Home or reloading. This uses the current saved round; starting another round or a new Practice session can replace it. This change does not create a permanent browsable archive of detailed assessment reports. The existing progress history still retains aggregate decision records. A full historical report library remains future work.

New explanation snapshots survive saving/reloading the current round and backup/restore. Older completed assessments show their stored scores/categories plus an honest notice that detailed notes were not saved. They are not re-evaluated against a newer model to manufacture historical feedback.

## Screen consistency

The following essentials were checked at desktop (1440 px) and phone (390/320 px) widths, in normal and full-screen layouts: hole/par/distance, shot type, profile/difficulty summary, front/flag/back yardages, wind/ground, intended carry, Commit, post-shot score/Retry/Next, and assessment progress without coaching leakage.

- Added a compact read-only profile/conditions summary to the course heading, because the editable setup controls are intentionally hidden in full screen. Exit full screen to change setup; round restrictions still apply.
- Kept green distances visible beside dogleg corner/runout distances in landscape full screen.
- Adjusted landscape heading spacing to avoid overlapping distance readouts.
- Moved phone full-screen right-side hazard callouts clear of the carry bar. The same terrain distances are retained.

Positions adapt to available space; the layouts are not pixel-identical. Existing assessment and Par-3 information restrictions are preserved. This is a targeted consistency check, not a comprehensive accessibility or all-device certification.

## Verification

- Syntax checks passed.
- New native coverage: completion-only review, collapsed nested markup, original score preservation, escaped text, historical-note fallback, saved-note validation, high-score wording, reopening the current report, private note recording and backup round-trip.
- Existing focused checks passed for round scheduling, complete learning/assessment flows, backups, decision coaching, Home, Practice sessions, course model, legacy ground rollout and lessons.
- Chromium: completed report expansion and unchanged stored scores passed at 1440/390/320 px; normal/full-screen essential-information parity, assessment secrecy, feedback controls and carry-bar label clearance passed at those widths.
- Landscape 844×390 dogleg check confirmed green yardages and corner/runout distances remain visible without header overlap.
- Phone report and full-screen screenshots were inspected. Physical-phone testing remains useful. The full app suite was not repeated for this update; targeted interaction and regression checks were used.

Browser scripts: `scripts/browser-review/assessment-shot-review.cjs` and `scripts/browser-review/play-information-parity.cjs` use `TARGET_PRACTICE_PLAYWRIGHT` and `TARGET_PRACTICE_BASE_URL`. The report script uses a synthetic completed fixture to exercise disclosure behavior; the native recording test and round-flow checks exercise actual assessment shot recording.

## Work integration

Based on repository 17.17.0. The separately discussed dark/light navigation mockups and newer external Work changes are not included. Merge these changes into Work's latest app rather than replacing its newer UI wholesale. No app hosting, billing or production deployment was changed.
