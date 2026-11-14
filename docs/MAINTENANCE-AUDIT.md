# Maintenance audit — 14 November 2026

Audited source: app **17.18.14**, commit `dd172fd6e6738a800df06975c7d0556ba3b97750`, branch `feature/hole-variety`. This is a local source audit, not verification of Work's hosted deployment or a completed launch/security audit. No golf-model, page-design or application behavior changes were made.

## Prioritized findings

| Priority | Finding and evidence | Recommended next action |
| --- | --- | --- |
| High | Browser save failures can be silent. With `localStorage.setItem` throwing `QuotaExceededError`, choosing Home → Learning round shows `Learning round · 1 / 5`, but the stored round stays `null` and the toast stays hidden. The central `save()` catches settings/round/free-practice failures without showing a warning; course/progress/lesson code has separate handling. | Add a persistent, non-blocking warning for unsaved settings/rounds, keep the current session usable, and offer the existing backup path where possible. Verify recovery when storage becomes writable. Do not clear data as a repair. |
| High | Bootstrap-file failure has no visible recovery. In Chromium, forcing `/releases/<hash>/boot.js` to return 404 leaves `courseRendered:false` and `startupError.hidden:true`. Existing tests correctly cover failures *inside* `startGame`, but that function cannot execute when its own module is absent. | Provide a small recovery mechanism independent of the release loader, with a useful reload action and no storage clearing. Test missing bootstrap and missing downstream modules separately. |
| Medium | Source/version instructions are inconsistent. Local package is 17.18.14; the starting guide still describes v12/v12.7 and deployment heading says 17.18.4. Cached `origin/main` is v12 at `2460ecf`; it was not refreshed for this audit. The earlier branch audit is explicitly a historical snapshot. | Current-source notices added to README, deployment and starting guides. Before main promotion, reconcile the latest hosted source and obtain owner authorization. No branches were merged/deleted. |
| Medium / verification gap | Fresh performance check used normal cloud CPU and local networking. Worker calculations work, but actual low-end phone/Safari performance is unverified. Main-thread fallback has cooperative yields but does not inherit the worker's timeout. | Retest representative physical devices. Investigate a bounded/cancellable fallback if slow-device evidence warrants it; do not change shot counts, caching or calculation semantics speculatively. |
| Low / housekeeping | This workspace contains 82 generated asset-release directories, approximately 38 MB. They are ignored by Git. Historical releases can be needed by cached clients; this is not evidence that every visitor downloads them. | Decide a deployment retention/rollback policy before pruning. Nothing deleted. |

## Checks that passed

- `node --test tests/backup.test.mjs tests/simulation-client.test.mjs tests/deployment-assets.test.mjs`: all three files passed.
- Backup checks cover validation before writes, rollback on failure, selected course outcome preservation, layout-version preservation, and corrupt/oversized input rejection.
- Worker checks cover unavailable/blocked/mismatched workers, deterministic fallback, input snapshots, calculation errors, timeout, and termination.
- Packaged-asset checks verify complete matching fingerprinted modules/CSS and packaged Commit, Retry and progression flows. Startup diagnostics work for import/render failures after the bootstrap begins executing.

## Fresh local performance sample

Reproduce with `node scripts/browser-review/maintenance-audit.mjs` using installed Chromium. Raw evidence: [MAINTENANCE-PERFORMANCE.json](MAINTENANCE-PERFORMANCE.json).

Three fresh navigation samples per width, disabled browser cache, reduced motion, fixed new-version tucked approach seed 4 and shot seed 7142026. There is no network/CPU throttling. Polling adds timing overhead; width 390 is a phone layout on the same cloud CPU, not a phone benchmark. Worker CPU is not inferred from viewport size.

| Layout | Median course-ready observation | Median Commit to review |
| --- | --- | --- |
| Desktop, 1440 px | 282 ms | 3.12 s |
| Phone layout, 390 px | 334 ms | 3.02 s |

All six used the worker. Largest observed main-thread long task was 61 ms; a zero in the raw log means none observed in that sample, not a guarantee that no blocking occurred. Observed page-resource encoded bodies total about 0.85 MB per sample; this is not a compressed production transfer or a full accounting of dedicated-worker dependencies. Intentional normal-motion shot/reveal pauses are absent. These measurements do not establish traffic capacity or a performance regression against older, differently configured reports.

## Reproducing the save failure

1. Use the DOM harness and import the app normally.
2. Replace `localStorage.setItem` with a function throwing `QuotaExceededError`.
3. Dispatch Home → Learning round.
4. Observe the visible round status, unchanged stored round and hidden toast.

The evidence is a deliberately induced storage fault, not a claim that testers' browsers are currently failing. The browser bootstrap fault is also deliberately induced.

## Recommended maintenance round

Fix save-failure visibility first, then bootstrap-independent recovery. Keep both changes isolated from the golf model and preserve all saved data. Next verify the resulting behavior in real phone browsers and reconcile hosted/GitHub versions before source consolidation.

Accounts, payments, production access controls, external monitoring and legal readiness remain launch-plan work. This audit did not test them or close those gates. No live-site deployment, load test, tracking, branch deletion or asset cleanup was performed.
