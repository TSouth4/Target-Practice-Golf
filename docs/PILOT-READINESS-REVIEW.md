# Pilot readiness review — 17.12.1

The reviewed local build supports a small pilot after the owner checks the deployed link and a real phone. No blocking application failure was found in the reviewed flows. This is not a paid-launch readiness review or a claim about the production host's traffic capacity.

## Verified

| Area | Evidence |
| --- | --- |
| First visit | Introduction completion leads to the baseline recommendation; tested at 1440, 390 and 320px. |
| Navigation | Menus work from the custom-shot editor and a lesson explanation; return to Home and My Progress; active assessment resumes without revealing coaching. |
| Touch aiming | Chromium touch events moved the aim through a drag on the phone viewport. |
| Full screen | Native desktop full screen and fallback mode passed at 390×844, 320×740 and 844×390. Controls change carry; commit reveals the pattern; feedback collapses/reopens; retry clears the pattern; rotation and exit preserve the flow. |
| Backups | Real JSON downloads, invalid-file rejection, preview, cancel, injected quota failure with rollback, confirmed restore/reload, custom settings and the identical selected course ball passed at 1440, 390 and 320px. |
| Storage blocked | With browser storage reads and writes denied, practice still completes and feedback/progress explain that results cannot be saved. |
| Worker blocked | With the worker script request blocked, calculation fallback completes; navigation is enabled again and exactly one history entry is saved. |
| Errors/layout | The above navigation and recovery checks assert no uncaught page errors; tested layouts check page overflow. Full-screen screenshots were captured for inspection. |

The targeted automated suite passed 13 backup, navigation, home and simulation-client tests. The preceding 17.12 feature release passed all 228 tests; this review does not rerun that entire suite because application calculation code did not change. Syntax and whitespace checks passed for this release.

## Changes

Corrected the custom-shot height caption: higher flights respond more to wind in Medium/Hard; Easy remains calm. The old caption incorrectly said wind was not implemented. No scoring, physics, model versions, saved-data formats or dependencies changed.

Updated two older browser checks to follow the current Home entry and restore an explicitly completed controls introduction. Added a repeatable pilot-reliability browser check. The owner's frozen wording-review files remain untouched.

## Still manual

- Real iPhone Safari and Android behavior: touch feel, browser bars, rotation, full-screen fallback, keyboard and readability. Viewport emulation is useful but does not establish device compatibility.
- Actual deployed URL, sharing/access while signed out, and production asset/module loading. The local server is not the deployed Work site.
- Whether uncoached beginners understand the app, trust the explanations and want to return. Automated success cannot answer this.
- Production traffic/capacity and monitoring. No production load test was run. Accounts, cloud saving, payment handling and member access remain a later launch phase.

See [the pilot guide](PILOT-TESTER-GUIDE.md) for a session outline, feedback questions, issue template and the owner's short pre-invitation checks. Keep the planned sequence: small pilot → refine → one public launch with free and paid access ready together.

## Repeat these checks

Serve dist with the repository's normal static server. Set TARGET_PRACTICE_BASE_URL to that server and TARGET_PRACTICE_PLAYWRIGHT to an installed playwright-core module, with Chromium available at /usr/bin/chromium. Run scripts/browser-review/pilot-reliability.cjs, backups.cjs, touch-aim.cjs and fullscreen.cjs. These use isolated browser contexts and local test fixtures. The backup test intentionally injects and verifies recovery from a storage failure. Run node --test tests/backup.test.mjs tests/menu-navigation.test.mjs tests/home-ui.test.mjs tests/simulation-client.test.mjs for the targeted native suite.
