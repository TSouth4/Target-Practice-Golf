# Button polish — 17.18.1

Shared primary/secondary buttons now use softer 9 px corners, more readable type, restrained borders/shadows, and distinct hover/pressed states. Primary actions retain the existing dark green palette; secondary actions use a quiet light surface. Disabled buttons do not gain hover/pressed emphasis. Existing keyboard focus rings remain visible. Reduced-motion preferences suppress transitions and pressed movement.

Introduction, course-management tutorial and lesson action groups use consistent spacing and at least 46 px height. On small phones, Introduction Previous/Next sit on one row, with more width for Next; the assessment shortcut stays on its own row. The compact Introduction heading no longer wraps its step count at 320 px. General HTML buttons have a 44 px minimum height. Existing icon-only course controls keep their component-specific typography.

Only CSS changes application behavior visually. No labels, navigation handlers, progression gates, model calculations, saved progress or hosting configuration changed. This does not implement the separately pending desktop fullscreen distance-strip repositioning or tournament-plan addition.

## Checks

- `npm run check` passed.
- Four focused native files passed: controls-tutorial, beginner-setup, tutorial-ui and introduction-ui.
- Chromium at 1440/390/320 px: hover/pressed colors, keyboard focus, disabled-state stability, comfortable button dimensions, Introduction direction/carry gates and completion, fullscreen controls, no horizontal page overflow and no page errors.
- Small-phone screenshots were inspected. Physical-device feedback remains useful. No full model suite was needed for this CSS-only change.

Reproduce browser checks using `scripts/browser-review/button-polish.cjs` with `TARGET_PRACTICE_PLAYWRIGHT`, `TARGET_PRACTICE_BASE_URL`, and optional `TARGET_PRACTICE_REVIEW_OUTPUT` (existing directory, defaults to `/tmp`).

## Work integration

Based on repository 17.18.0. Merge into Work's latest app, preserving any newer UI/theme work; this branch does not contain the separately discussed dark mockup. No deployment has been performed.
