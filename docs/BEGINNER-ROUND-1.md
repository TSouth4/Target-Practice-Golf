# Beginner setup, round 1 — 17.9

## Entry and learning sequence

Home keeps the requested card order. Introduction and its first-visit recommendation now open a short, optional controls exercise: choose direction, change intended carry, then practice committing. It uses a plain practice range without hazards, a flag, an ideal target, scoring, or a sampled shot model. It records no decision or assessment answer. Users may skip directly to assessment setup.

After the exercise, the primary action opens the ten-shot assessment setup. The existing strategy Introduction remains available directly from Menu as “Course-management introduction” and through the completed controls exercise. Its text explains that it teaches strategy and is best taken after an uncoached starting assessment. Lessons and all game modes remain accessible without completing either introduction.

This round creates a baseline-first entry path. It does not add a new assessment algorithm, equated test forms, longitudinal improvement estimates or paid access. The ten-shot report remains a starting snapshot. Later comparisons need matching profile/difficulty and comparable challenges; a small score change is not proof of improvement.

## Setup and clarity

- Assessment and par-3 setup visibly show the chosen training profile and difficulty. Presets are labeled by relative spread and described as illustrative profiles affecting both shot spread and club distances, not measured handicaps. Current custom shot settings can also be selected.
- New selections apply only on Start. Cancel preserves the existing round and settings. Par-3 profile and difficulty stay fixed throughout the round; switching to a preset retains custom settings for later use.
- Difficulty help accurately describes the present implementation: wind and ground firmness. Uneven tree layouts are in the general generated hole mix, not a difficulty-specific variation. Profile changes dispersion; difficulty does not change grading rules.
- A short direction/carry instruction appears directly above the normal course view before commitment. It is hidden in full screen to retain space.
- The strategy Introduction's last slide gives a completion instruction instead of telling users to select a hidden Next button.
- Progress controls say My Progress and explain browser saving/backups, without “Member preview” labels suggesting a payment requirement.

## Persistence and navigation

Controls completion is an optional `controlsTutorialSeen` boolean in the existing settings object. It is included in backups; older files without it remain valid. No storage keys, round versions, grading versions or backup-format versions changed. Existing strategy-introduction completion still suppresses the first-visit recommendation for returning users.

The controls exercise is an independent modal. Opening, cancelling or replaying it does not replace a round, apply a shot profile, reveal a best target or discard editor drafts. Going to assessment setup uses normal navigation (including leaving an unsaved editor draft); starting the assessment explicitly replaces the current round. Completion saves only its settings preference alongside the existing state. The modal supports tap/drag, keyboard direction and carry inputs, Escape, focus trapping and focus restoration. Strategy examples keep their existing snapshot/return behavior.

## Validation

New tests cover controls progression and skipping, inputs/escape, no score writes, completion persistence, starting assessments with selected settings, par-3 setup cancellation, custom/preset switching and old/new backup compatibility. Existing home and Introduction tests reflect the controls-first entry and corrected final-slide wording.

Browser checks at 1440, 390 and 320 px cover completion/reload, skip/replay, keyboard controls, assessment setup, profile selection, course cancellation and locking, progress wording and layout. A saved previous-version par-3 review retains identical round data, selected-ball markup, score and statistics after tutorial replay. Existing strategy-example browser checks still pass. Narrow-phone field labels and setup layouts are inspected visually.

## Following rounds

Round 2: simplify practice feedback to one verdict, one reason and one next action, retain the numerical evidence under details, and keep target quality visible alongside a par-3 hole score.

Round 3: refine the Home recommendation around controls, starting assessment, learning and later reassessment. Design comparable reassessment challenges before claiming measured improvement.

Deploy the complete matching `dist` folder, including `controls-tutorial.js`. Hosting identity is unchanged. The frozen website wording-review files remain untouched.

Final validation: all 215 native tests passed, with zero failures, skips or cancellations. JavaScript syntax checks and browser flows passed at all three widths. Strategy examples and saved previous-version round replay also passed.
