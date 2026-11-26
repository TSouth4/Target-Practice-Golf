# Home screen refresh — v17.18.20

## Result

Home now follows the approved green/cream concept while retaining the existing logo and all modes. A compact, original SVG course illustration adds visual context without adding a dependency or external image request. New visitors get a prominent Start Introduction action and simple session rows. Returning players get a clear next step, a compact progress summary and session cards. An available saved round takes priority with a Continue action and its actual shot/hole count and player profile.

Home → Play resumes an active round first, then saved free practice, otherwise starts fresh practice. Progress and Lessons remain directly available, and Introduction remains replayable. The small Home/Play/Progress navigation is part of Home only; the play screens were not redesigned in this change.

The established recommended sequence (Introduction → baseline assessment → learning and relevant lessons/reassessment) remains. Alternatives are still available; no mode is locked. The recommendation is suppressed while a resumable round is the main action, avoiding competing primary buttons.

## Real results, not mock data

Home uses the existing dashboard's deduplicated current-model first choices, taking the most recent 20. Retries and previous-model results are excluded. The same source includes completed assessment/course results; no withheld ongoing assessment results are exposed. The mean is displayed to one decimal, with an all-settings label. The small line uses the fixed 0–100 scale and appears only after two results. An empty state replaces statistics when no results exist. There are no fabricated scores, improvement claims or example trends.

This is still browser-local progress. No login, cloud storage, billing, tracking or new storage keys were added. Saved rounds/profiles/results and the golf model are unchanged. Styling is scoped to Home. Existing logo asset and hosting identity are untouched.

## Checks

- Native tests passed for the refreshed Home data/empty/resume states, existing Home navigation, practice-session preservation, learning recommendations, Introduction controls and save-failure recovery.
- Data checks use known saved choices plus retries/older results and verify the correct recent mean, exclusion rules, and empty states.
- Packaged asset/startup checks and full syntax checks passed. Asset preparation contains the complete matching 52-file runtime release plus the new standalone SVG artwork in assets.
- Chromium checked first visit, introduced/no-results, and returning-with-active-round states at 1440, 390 and 320 px (nine combinations). Verified no horizontal overflow, banner loading, the existing logo reference, real mean/count, round ID/index preservation, Lessons/Progress/course-setup navigation and unchanged progress storage. Phone first-visit/returning and desktop screenshots were visually reviewed. New arrows use SVG to avoid missing-font glyphs, and programmatic heading focus does not add an unwanted border; interactive focus indicators remain.

No deployment or real-device/Safari certification was performed. After Work merges `feature/home-refresh` into its latest hosted source while preserving its changes, rebuild assets and deploy to the existing private site. Test the Home states and continue an existing round before inviting more testers. The angled-green prototype and outstanding bootstrap-independent loading recovery remain separate work.
