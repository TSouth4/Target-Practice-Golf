# Work / GitHub source reconciliation — November 1, 2026

## Baseline and provenance

Compared GitHub `feature/button-polish`, commit `ef1c348` (17.18.1), with the owner-uploaded `Target-Practice-Hosted-v17.18.1-Complete-Source.zip`. A remote fetch confirmed the configured branch still pointed to that commit. Work identifies its Sites source commit as `ece336dbe9980bf05c4acad6cfd86742c9044b1f` and deployment release as `f33a66debce6ec84`; those are provenance identifiers, not GitHub commits to cherry-pick.

Actual uploaded ZIP SHA-256: `c2abfb7381473f637d8110900a2b8781efcfcffeedec10c119eb516c58b66d3c`.

All **1,614** source/deployed files matched the export's checksum manifest. This verifies archive consistency, not an independent live-site download. Original provenance, checksum manifest and Work's comparison are retained in `docs/hosted-export-v17.18.1/`.

## Reconciled differences

- Imported the startup loader/error panel and matching content-hashed asset preparation.
- Imported the isolated heavy-rough preview, menu entry and SVG assets. It changes no lie costs, scoring or generated holes.
- Preserved Work's additional portrait/landscape full-screen spacing and narrow-phone button fixes.
- Imported packaged-asset/guided-flow regression coverage and the sub-nanoyard floating-point tolerance in the Practice resume assertion. Family and seed comparisons remain exact.
- Retained the newer GitHub roadmap and launch checklist. Work's plan snapshot was older and would have removed recent implementation status and tournament decisions; it was not copied over them.
- Retained current README history and added the source-reconciliation entry. Work's implementation verification notes were appended to their corresponding feature documents.
- Preserved the original hosting project configuration; the nested `dist/.openai/hosting.json` export artifact was not adopted as a second configuration.
- Frozen owner wording-review snapshots were not edited.

All **44 root JavaScript/CSS files and the application index HTML are byte-identical to the uploaded hosted source** after preparation. Gameplay/model modules, scores, saved-data formats, fresh Practice, assessment review and backups are unchanged. The version remains 17.18.1 because this synchronizes the existing hosted release rather than introducing a new gameplay release.

## Reproducible checkout workflow

Generated release folders remain ignored by Git. They are derived from tracked root modules/CSS, not separate editable app versions. On a fresh checkout, run:

```sh
npm run prepare:assets
npm run check
npm test
python3 -m http.server 8810 --directory dist
```

`npm test` now prepares assets automatically via `pretest`, so the packaged graph tests also work on a clean checkout. No dependencies are required. Re-run preparation after changing root modules or styles before browser preview or publication. Preparation currently reproduces Work's exact **44-file release `f33a66debce6ec84`**.

Retain existing older generated release folders in the hosting workspace when publishing; cached older pages may still request them. The supplied export contains those historical artifacts, and they were retained locally for comparison. Git tracks editable source and provenance rather than the full generated deployment history. Do not deploy a fresh source-only folder without preparing its assets and preserving the host's retained releases.

## Pending plan decision now recorded

Open-entry tournaments give everyone access to the event's full course without purchasing membership, even beyond normal free three-hole limits. A free account may be required. Owner-only shared round records and CSV export are a proposed initial administration step. Prize events retain rules, eligibility and applicable legal/tax/provider review and approval gates. No account service, event, payment or prize behavior was implemented.

## Verification

- Source integrity: 1,614 checksum matches; no missing tracked GitHub files in the export.
- Runtime equality: 44 root JS/CSS files, app HTML and root hosting identity match the export exactly.
- A clean temporary source tree regenerated the same release without existing generated files; changing its CSS produced a new release while retaining the earlier one.
- Preparation reproduced release `f33a66debce6ec84`; syntax checks passed.
- Chromium at 1440/390/320 px verified the actual hashed boot/stylesheet, visible course rendering, Commit/Retry with unchanged seed, no failed asset requests/page errors, and rough-preview controls without altering browser saves.
- The rough preview supports patch toggle, close-up and full-screen entry/exit with no page overflow in those samples.
- Full `npm test` regression run passed all **66 test files**, with zero failures/skips (approximately 325 seconds), including packaged deployment, guided lessons, Practice, assessment, course, backups and model checks. Work's earlier test results remain separately attributed in its feature notes.

This reconciliation does not deploy anything, change audience/access, merge main or alter billing. Future development should start from the reconciled branch rather than an older feature branch until it is deliberately merged. Physical-phone and Safari testing remain outstanding.
