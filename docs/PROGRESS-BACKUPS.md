# Progress backups

Open **My Progress**, scroll to **Back up your progress**, and choose **Download backup**. Keep the downloaded JSON file somewhere you can find it. You can copy it to another device and restore it there. Download a fresh copy after practice you want to keep; this is a manual backup, not automatic cloud saving.

The file contains practice attempt history (including separately recorded retries), retained completed-round summaries, saved active/latest rounds and the separate saved par-3 round, custom club/shot settings, handicap/difficulty preferences, lesson completion and Introduction completion. It preserves the model versions and saved settings attached to results. It contains the history still available in this browser, within the existing 1,000-attempt/200-completed-round limits. Results already lost or overwritten cannot be recovered by exporting later. Saved rounds resume using their existing recorded choices and selected course ball. Ordinary free-practice animations/review screens and unsaved shot-editor changes are not session backups.

To restore:

1. Close other Target Practice tabs.
2. Download your current backup if you want to keep the current results.
3. Choose your backup under **Restore from a backup file**.
4. Check its date and counts. Selecting a file only previews it; it changes no saved data.
5. Choose **Replace saved data and restore**, or **Cancel**. After a successful restore, the app reloads on Home.

Restoring replaces this browser's app data with that point-in-time copy; it does not merge two histories. Other websites' data is unaffected. Supported backup files are JSON, version 1, up to 5 MB. Invalid, partial and unsupported files are rejected before writing. Storage write failures attempt to put the old values back; if that rollback also fails, the app explicitly offers a safety backup of the previous in-memory state before you close the page.

File reading/checking happens on the device. The app does not upload the file or send it to analytics. Treat the file as personal because it includes your practice history and shot settings. There are no account passwords or payment details in this prototype's backup format.

## Implementation and limits

`dist/backup.js` accepts only an explicit allowlist of seven app storage keys. Existing progress/round/course/profile readers validate their contents; malformed rows are rejected as a whole file rather than silently discarding portions. Settings are reconstructed from permitted fields, and unrelated storage/unknown keys are never imported. File size, format/version, nesting, unsafe object keys and markup-bearing strings are checked. Browser restore requires a separate explicit replacement action after preview.

The export uses live in-memory histories and player settings, which can retain results from this visit even when local saving has failed. Successful import still requires browser storage to work. Multiple open app tabs can overwrite one another's local data, so close them first. Clearing browser data still removes local history; the downloaded file is the recovery copy.

These files are user-controlled copies, not trusted proof of scores, paid membership or leaderboard eligibility. Future accounts need authenticated server authorization, verified scoring where appropriate, an explicit import policy and database backups/restoration tests. Local export/restore does not close those launch requirements.
