# Fresh Practice sessions — 17.17.0

## Player behavior

- **New practice** on Home or Menu selects a fresh generated layout using a new session seed. It avoids the last saved Practice family and honors the selected Tee / Approach / Mixed filter. No more authored Cedar opening on every new session.
- **Continue practice** appears after starting a session. It restores that session's hole, scenery, target and shot seed, including after a browser reload. It uses the currently selected player settings. The result panel and animation are not persisted; returning presents the target for another attempt rather than restoring the previous result panel.
- **Next shot** continues generating layouts with recent-family avoidance. A session's seeded sequence remains reproducible for diagnostics.
- **Mixed** can put two or three shots of the same type together. It avoids four consecutive shots of one type, while retaining all 16 families in the selection bank. This balances variety over a session, not an exact 50/50 quota in every short run.
- **Retry** retains the existing same-hole, same-draw behavior. Scoring and shot simulation are unchanged.
- Switching from an active round into Practice saves a paused copy. Home's **Continue round** resumes that round. One paused round is retained; this is not a library of multiple unfinished rounds. Starting another round still follows the existing replacement behavior.

The new free-session and paused-round slots are browser-local. They are included in exports and restored with backups. Older backup files without these slots are accepted, with the absent slots restored as empty. Clearing browser data still removes local saves. Storage failures may prevent persistence; this does not add cloud accounts.

## Checks

- Syntax checks passed, including the new practice-session module.
- New native regression coverage checks fresh/continue targets, reload, paused round preservation, mixed ordering limits, invalid saved sessions and supported seed bounds.
- Backup coverage checks both new slots and compatibility with older files.
- Existing Home, Practice dropdown, learning/assessment round flows, ground-rollout compatibility, shot editor and tracers passed focused checks.
- Chromium checks passed at 1440, 390 and 320 pixels: fresh layout, saved target, reload, round resumption, Retry seed/layout, no page errors and no horizontal overflow.
- Full-suite run: 59 of 61 test files passed initially. The two failures required the old forced alternation. Those expectations were updated, and both affected files then passed when rerun directly (including the complete repeated-shot interaction sequence). Follow-up Home, backup and Practice-session regressions also passed after the final state-tracking refinements. This is verification across the full run and affected-file reruns, not a second complete suite run.

Reproduce the selection audit using `node scripts/practice-randomization-review.mjs`. It now exercises Continue practice when checking layout preservation. The previously committed audit JSON remains a historical snapshot of the behavior before this fix.

## Integrating with Work

This branch is based on repository version 17.16.2 plus the diagnostic review. The newer navigation mockup and separately created recovery-area preview are not present here. Merge this change into Work's latest code rather than replacing newer Work files wholesale. New buttons need wiring in any redesigned Home/Menu as well.

Implementation: `dist/practice-session.js`, Practice selection in `dist/practice.js`, navigation/storage in `dist/app.js`, Home/Menu labels in `dist/index.html`, and optional backup slots in `dist/backup.js`. No model-version or history migration is needed because numerical scoring and existing round schedules are unchanged.
