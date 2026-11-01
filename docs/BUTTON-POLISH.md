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

## Work integration verification (2026-11-01)

Merged the CSS polish into the hosted 17.18.0 source while preserving its portrait/landscape full-screen spacing fixes, startup loader, heavy-rough trial, assessment review and fresh practice sessions. All application JavaScript remained byte-for-byte unchanged. Only CSS, release references, documentation and the package version changed.

Syntax checks passed. Eight focused tests passed across controls-tutorial, beginner-setup, tutorial-ui and introduction-ui. Managed Chrome sampled desktop button appearance/keyboard focus and actual embedded 320×740 and 390×844 layouts. The narrowest modal initially clipped its heading and stacked Previous/Next; scoped padding/type/flex refinements corrected that. Final 320-pixel Previous/Next buttons shared the same y-coordinate, measured approximately 101/115 pixels wide and 46 pixels high, and the dialog had no internal horizontal overflow. The 390-pixel pair also measured 46 pixels high and remained aligned.

The 320-pixel Introduction passed actual direction/carry gates and reached completion; full-screen entry/exit preserved component-specific icon labels. Browser console inspection found no app-origin errors. Final phone screenshots were reviewed. Native tests and real input checks cover behavior; the branch's separate hover/pressed-state browser script was not rerun in Work. Physical-phone, Safari and reduced-motion runtime checks remain unverified here. Temporary QA markup was removed before packaging. Existing private invited-viewer access is preserved.
