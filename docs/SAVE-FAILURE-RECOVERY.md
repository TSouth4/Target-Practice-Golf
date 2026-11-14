# Save-failure visibility and recovery — v17.18.15

A browser save failure now shows a persistent notice: “Your latest changes haven’t been saved.” It explains that play can continue in the current tab, but closing/reloading may lose unsaved changes. The notice offers Try saving again and Download backup, works in normal/fullscreen layouts, and clears only when every pending write has succeeded.

## Behavior

- Failed writes are retained by storage key in memory. A newer write replaces the older pending value for that same key.
- Settings, active rounds, free practice and paused rounds are attempted independently. One failure does not prevent the remaining values from being attempted or falsely imply that everything is saved.
- Existing progress, completed-history, lesson and introduction writes also participate in the warning; their existing status messages remain.
- Retry persists the latest pending values without restarting the round, recalculating shots or creating duplicate progress entries. Partial recovery leaves the warning visible.
- Backup uses the existing local download/validation path, including the current in-memory round/progress and a pending course snapshot rather than an older disk copy. Downloading does not dismiss an outstanding save warning.
- Custom-shot confirmation distinguishes settings applied for this visit from settings successfully saved.
- No existing stored data is cleared to repair a failure. No schema, scoring or model changes. No background network retry or telemetry added.

The in-memory queue cannot survive closing or reloading the page. The notice explains this limitation; the backup download is the recovery option while the page remains open. It is not cloud storage. A browser may still restrict downloads, and download errors are shown in the notice.

## Verification

Six relevant native test files passed: save-warning, backup, practice-sessions, course-setup, deployment-assets and tutorial-ui. Checks cover all-write and single-key failures, preserved old storage, latest target recovery, course recovery/backup, playing through a failed save, and restoring exactly one first-attempt record without duplication. Existing packaged Commit/Retry and lesson flows passed.

Chromium checks passed at 1440, 390 and 320 px: rejected writes show the warning, backup downloads contain the active unsaved learning round, the warning remains visible after download, fullscreen keeps it inside the viewport, and recovery preserves the round ID and latest target. A 390 px warning screenshot was visually reviewed. The script is `node scripts/browser-review/save-warning.mjs`.

Full syntax checks and asset preparation passed. No live deployment or physical-device/Safari verification was performed.

## Integration

Merge `feature/save-failure-warning` into Work’s latest hosted source while preserving its changes. Rebuild fingerprinted assets and deploy to the existing private site. Bootstrap-independent loading recovery remains a separate pending maintenance fix.
