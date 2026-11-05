# Saved club assumptions and isolated selection prototype

App 17.18.5. This release preserves current scoring and automatic club selection.

## Saved rounds

New standard learning rounds, assessments and Par-3 rounds save a versioned stock snapshot containing tee/approach bags (distance, rollout and spread) and flight/error coefficients. Loaded rounds use those saved bags rather than rebuilding them from live club presets. Custom profiles continue to use their existing saved custom bags.

Legacy saves without a snapshot receive the frozen pre-snapshot stock assumptions on read. This migration has its own immutable coefficients and club fractions; future tuning of live presets must not edit that migration. Existing round/model versions and rollout compatibility rules remain in place. Snapshots are validated and copied rather than shared with mutable controls. Setup changes deliberately create a replacement round; routine saves no longer replace its profile before the first answer.

Scope: this freezes stock/preset assumptions, not the entire evaluator, future club-selection algorithm, physics or course geometry. Any future policy or scoring change still needs model-version dispatch and compatibility tests. Browser-only storage and backup behavior are unchanged. Unlimited practice does not become a historical saved round.

The carry control shows **Modeled club**, including full-screen mode. It identifies an assumption rather than prescribing which real club the user must hit.

## Controlled prototype

Open `/club-selection-prototype.html` on a preview of this branch, or follow the link from `/model-owner-review.html`. It does not appear as a new game mode and never writes progress or changes scores.

The page compares feasible clubs at the two original owner-review targets on each fixed example, for the 20-handicap profile. Every row uses the same three independent sets of 4,000 draws and the current calm/surface-rollout model. It lists clubs requiring 75–100% of their modeled stock carry. The 75% cutoff only limits the experiment; it is not a measured golfing threshold. Shorter swings retain the existing proportional spread rule. This rule, club spreads and Tour-reference recovery costs remain uncalibrated assumptions.

In the long approach, the front target averages 3.536 expected strokes with the automatic hybrid and 3.590 with a 3-wood; center averages 3.579 with a 3-wood. These close differences demonstrate the influence of club policy. The page does not optimize every possible target or establish the best real-world shot. Dogleg routes/tree clearance remain unverified.

Regenerate with `node scripts/prepare-club-prototype.mjs`. Raw results are in [CLUB-SELECTION-PROTOTYPE.json](CLUB-SELECTION-PROTOTYPE.json).

## Verification

- Snapshot regression: all four handicaps, tee/approach bags, club and spread equivalence, identical evaluator costs on shared draws, frozen override and isolation, legacy migration, malformed snapshot rejection.
- Existing focused round/course/shot-editor suites: five test files passed.
- Chromium at 1440, 390 and 320 px: club label visible in ordinary/full-screen layouts; snapshot survives reload; prototype tables fit through internal horizontal scrolling; no page errors or page overflow.
- Existing beginner browser flow at the same widths: introduction completion/reload, assessment setup, course profile/conditions, cancellation, navigation and progress wording passed. Its empty-storage check now compares parsed round values, treating absent storage and stored JSON null consistently.
- Syntax checks passed. Full suite: 66 files passed initially; the remaining legacy Par-3 fixture expected exact pre-migration shape. Updated it to permit only the additive snapshot and verify every existing field is unchanged; that file and snapshot/backup checks passed on rerun. All 67 files have passed.

No main merge or live deployment is included. Publish only a complete prepared `dist` asset set, preserving Work's source changes.
