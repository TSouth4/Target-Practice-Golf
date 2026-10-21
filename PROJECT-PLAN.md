# Target Practice — project plan

## Goal

Build a simple golf decision trainer that helps golfers choose targets, understand the risks of their misses, and practice better course management. Start with a useful private web app, test it with real people, and expand based on what we learn.

The current development version is 17.15.0. Illustrated course graphics are integrated, with an Original comparison option. Its complete 232-test suite and desktop/phone-size Chromium checks passed; owner testing on the deployed site and physical phones remains pending. The subsequent read-only model audit passed 14 focused checks and documented six reproducible review cases. Published historical Tour distance-and-lie references support the scoring, while player spreads, weather and finishing distributions include teaching assumptions. See [the model review](docs/MODEL-VALIDATION-REVIEW.md).

## Agreed next sequence — updated October 21, 2026

1. Finish owner testing of the integrated graphics and resolve blocking usability issues.
2. Make normal-ground rollout consistent across difficulty modes, then verify the six model-review cases and preserve/version historical results appropriately.
3. Add three distinct playable hole families: island green, peninsula green with a bailout, and split fairway with meaningful route choices. Each must teach a different decision and have geometry, aiming, scoring and explanations that agree. Existing reachable Par-5 situations should be improved rather than counted as a new feature. Full elevation effects remain later work.
4. Run the approved small private pilot, refine the experience, and measure clarity, trust and willingness to return.
5. Introduce the free daily three-hole Par-3 challenge, alongside membership preparation. Refine scope using pilot evidence.
6. Complete accounts, data protection, subscriptions, operating readiness and the applicable launch gates before one public launch with free and paid membership together. No launch date is committed.

## Planned free and paid experience

This is the agreed product direction, not functionality or paid restrictions already implemented.

| Free | Paid |
| --- | --- |
| Daily three-hole Par-3 challenge; shared new selection each day | Unlimited randomized 18-hole Par-3 rounds |
| Fixed standard profile and conditions for the daily challenge | Choose profiles/conditions and use custom shot profiles |
| Full decision explanations and unscored learning retries | Deeper personal history, trends and personalization |
| Introduction and core Lessons; a basic result/recent summary | Sustained practice and progress tools |

The daily challenge replaces the proposed separate free course sampler and separate three-decision challenge. Keep golf score to par and decision quality visible as distinct measures. First attempts count for the daily result; optional learning retries must not replace them. Mandatory OB retees and their penalties remain part of the played hole, not a free retry. Specify the daily reset timezone, same-day resume/completion rules and version-stable shared setup before implementation. A local attempt record is a convenience, not competitive score verification.

Public leaderboards, weekend tournaments and verified competition come later, after accounts and trusted server validation. The same daily course/profile/conditions must be shared by entrants. Account and scoring/model versions must make results comparable. Whether remaining practice/assessment modes have free limits, exact history allowances, and pricing are still open decisions; do not remove existing pilot access or assume those details are settled.


## Ground rules

- Keep the app private until Tyler approves inviting testers or launching publicly.
- Hide shot patterns and recommended targets until the golfer commits a target.
- Keep the main experience simple: choose, commit, review, retry, next shot.
- Preserve the existing app and improve it in manageable steps.
- Explain estimates honestly; do not promise handicap improvement or describe the best sampled target as a proven optimum.
- Save changes in GitHub and run relevant checks after each change. Major changes use a separate branch so the saved starting point remains recoverable.

## Milestone 1 — check the current experience

**Goal:** Establish whether the existing app is understandable and usable on a computer and a phone.

**Work:** Test target direction and distance, zoom, commitment, results, retry, next shot, custom clubs, and saved history. Check narrow screens, touch controls, keyboard controls, readable hazards, and reduced-motion behavior. Record problems in a short prioritised list, then fix the problems that prevent normal practice.

**Finished when:** The core practice flow completes in actual desktop and mobile browsers; answers stay hidden until commitment; no known issue blocks that flow. Record the browsers/devices tested and any remaining limitations. Automated checks continue to pass.

## Milestone 2 — create more meaningful golf situations

**Goal:** Make practice varied enough to teach different decisions, rather than repeatedly changing the appearance of the same hole.

**Work:** Extend the existing generator gradually. Vary fairway bends and landing widths, green positions, hazards, and par-5 go-for-it versus layup choices. Keep repeatable scenario seeds so a retry or bug report reproduces the same situation. Validate new layouts before showing them, with a safe fallback if generation fails.

**Finished when:** Generated layouts have valid terrain, legal pin positions, and at least one plausible reachable strategy for their intended profiles. Examples demonstrate different strategic choices, including reaching the green and laying up. Retry preserves the exact hole and shot sample, and new scenarios keep answers hidden. Geometry and interaction checks pass.

## Milestone 3 — review the advice and golf assumptions

**Goal:** Understand when the app's advice is useful and where its estimates are uncertain.

**Work:** Review club distances, shot spreads, hazard penalties, and scoring. Check whether reasonable changes to these assumptions produce sensible advice. Seek feedback from golfers or a coach. Investigate credible measured data and its usage rights before claiming calibration.

**Finished when:** Important assumptions and limitations are documented, representative decisions have been reviewed, and feedback clearly distinguishes estimates from measured facts. Any unexplained advice is fixed or listed as a limitation. Strong claims about effectiveness remain out of scope until supported by evidence.

## Milestone 4 — run a small approved web pilot

**Goal:** Learn whether people can use the app and find the practice valuable.

**Work:** With Tyler's approval, invite a small group through suitable access controls. Give them simple tasks and collect feedback on ease of use, clarity of advice, variety, and willingness to return. Choose the pilot success criteria before invitations, then fix the most important problems.

**Finished when:** Testers can complete the practice flow without coaching, feedback is recorded, and we have evidence to decide whether to expand, improve, or pause. Record how access and feedback are handled. Browser-local history and the lack of cross-device saving are explained.

## Milestone 5 — prepare a public web launch

**Goal:** Make the product reliable and ready for one public launch serving both free and paid members after the private pilot and refinement.

Use [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) to track the 17 launch gates, evidence and business decisions. The supplied external launch notes inform that checklist; their proposed public free-only stage is not our release plan.

**Work:** Agree on launch scope and free/paid features. Confirm hosting supports the required services. If profiles or history need to follow users across devices, add secure accounts, storage, and deletion controls. If charging, add trusted payment and subscription checks. Test the chosen browser/device support and complete relevant privacy and support information.

**Finished when:** The agreed launch features work, required account/data/payment protections are verified, known limitations are clear, and Tyler approves public access and any charging. Accounts, secure member data, paid access and verified billing are required for the agreed full membership launch. They are not prerequisites for a free private pilot when its access and data handling are suitable and clearly explained.

## Later decision — a phone app

**Recommendation:** Launch and test a mobile-friendly web app first. Users can try it through a link on their phones, and improvements can reach everyone without app-store releases. This keeps early development simpler while we learn whether the training experience is worth returning to.

After the web pilot, consider a progressive web app (a website that can support installation on a phone's home screen) if that helps users. Installation and offline behavior need separate implementation and testing; they are not currently promised.

Consider an iPhone/Android app when user feedback establishes a concrete need, such as app-store discovery, deeper device integration, or offline use that the web version cannot adequately provide. Phone apps add device testing, signing, store review, and maintenance. Reuse the existing web work where practical rather than assuming a rewrite is necessary.

## How we will manage the work

- Work on one milestone at a time, starting with browser and phone validation.
- Before each implementation task, state the change and how we will check it.
- After each task, report what changed, what passed, and what remains unresolved.
- Keep a short prioritised issue list; fix blockers before adding more features.
- Set dates once the first validation pass establishes the amount of work. Do not guess a launch date yet.

**Earlier implementation history (through v17.5):** v17.5 isolates deterministic committed-shot calculations and runs them in a disposable module worker with a verified page-thread fallback. Seeded results, grading and saved formats are preserved. Responsiveness is measured separately from total execution speed; actual phone and hosting checks remain pending. v17.4 adds a balanced four/five-long-hole mix to new 18-hole par-3 rounds, with profile/condition-aware ranges, preserved original saves and retained historical 18-hole progress. Existing authored geometry and scoring formulas are unchanged. v17.3 adds manual local progress backups with checked/previewed restore and a repeatable performance baseline. Phone calculation speed remains a launch follow-up; accounts/cloud saving are still pending. v17.2 adds a dedicated Home screen, logo/Home navigation, five clear destinations, practice-mode choices, a first-time Introduction recommendation and Continue round for saved active sessions. v17.1 simplifies My Progress into overall decision quality/cost-per-100 and 18-hole score KPIs, habits, tee/approach comparison, optional difficulty details and separate completed-round trends. Local completed-round history retains settings, excludes retries and keeps pilots separate; accounts/cloud history remain future work. v17 expands new par-3 rounds to 18 holes/par 54 across five seeded hole styles, with fixed environment/difficulty, front/back scorecards and a delayed on-course finish card after the selected-ball overhead reveal. Saved three-hole pilots remain supported. v16.7 adds a pre-round difficulty setup for par-3 starts/restarts with cancellation and saved-round resume; active course difficulty is fixed and its Difficulty/Practice type selectors are hidden. Introduction recommendation is restricted to practice home; a new purpose slide and visible reading-diagram bunker/flag complete the nine-slide walkthrough. v16.6 refines the Introduction with a far-left green target and topic-specific illustrations, saves completion on the final slide, moves practice type to a dropdown and replaces phone hazard tiles with compact labels hidden during flights. Normal phone yardages/wind sit above the course. v16.5 cleans the main play layout, puts wind/ground beside on-course green yardages, uses horizontal carry and a full-width action in normal mode, and retains vertical carry in full screen. v16.4 makes Introduction an optional standalone eight-slide walkthrough, beginning with three guided targets on one tucked-flag hole; a home recommendation remains until completion and menu replay stays available. This supersedes the original v16.2 introduction behavior. v16.3 simplifies mobile normal/fullscreen information, keeps the selected par-3 ball visibly consistent and introduces a conventional scorecard. v16.2 adds a skippable six-step first-visit Introduction and permanent menu replay, with a fixed calm practice shot/comparison and preserved sessions/statistics. v16.1 clarifies carry-core guides versus final dots, adds two dedicated shoreline families and reliably includes lake/ocean shoreline approaches in new learning rounds/assessments. v16 introduces steady wind and firmness with Easy/Medium/Hard settings, condition-aware scoring and feedback, custom flight interaction, fixed retry conditions, consistent assessment conditions and saved round/course snapshots. Coefficients need golfer/coach review before launch claims. v15.2 presents par-3 scores relative to par with a top-right running total and direct Quit/Restart controls. v15.1 consolidates custom shot navigation into one menu item, restores navigation from all secondary screens, and refines the down-the-line flight illustration and beginner explanation. v15 simplifies custom flight editing into a single apex/finish illustration with reset, optional club detail, and saved profiles used by new learning rounds, assessments and courses. Paused rounds retain their original profile. v14 adds a three-hole par-3 course pilot with a selected-ball overhead reveal, illustrative finishing, separate target quality, a saved running score and resumable scorecard. An 18-hole expansion follows player/coach review. v13.3 adds mountain, lakeside and oceanfront scenery to the random mix, preserves existing scored water hazards, and keeps the four improved guided lessons, local completion, selected consistent examples, calculated flag-versus-recommended spreads, historical distance-cost examples, short-side/fat-side illustrations and guided-shot recaps. Lessons preserve existing practice sessions and do not inflate normal statistics. The carry display is simpler, and left/right aim preserves selected carry. Five-shot rounds, ten-shot assessments, varied strategic holes, calculated tradeoff explanations, the historical Tour distance-and-lie reference and landing/rollout markers are included. Golfer/coach review, broader device checks and an approved external pilot remain outstanding.

**Current next task:** Owner playtest the integrated graphics. Follow the prioritized sequence above; the rollout inconsistency is documented and has not yet been fixed. Membership services and launch gates remain pending.

## Future priority — daily and weekend par-3 challenges

Tyler requested daily challenges, weekend tournaments, and daily/all-time leaderboards as a way to attract golfers and give them a reason to return. The simple free daily three-hole format is now part of the product direction above. Weekend tournaments and competitive daily/all-time leaderboards remain later candidates after accounts, reliable member history and trusted server-validated results are ready; no competitive release date is committed.

- Offer a shared seeded course and conditions for everyone in an event, with clearly stated opening/closing times and timezone.
- Define fair divisions or restrictions for handicap/custom profiles, difficulty and course length. Keep results from incompatible models/rules separate.
- Establish attempt limits, practice/retry rules, tie handling and whether first or best eligible scores count. Validate eligible results on the server; current browser-local scores are practice results.
- Show golf score and decision quality together so the learning purpose stays visible alongside competition. Consider shareable results and personal bests as optional ways to encourage invitations and return visits.
- Evaluate a simple daily challenge first, then weekend events and longer-term leaderboards. Use pilot feedback and participation/return-use evidence to choose scope. Entry fees and prizes are not part of the current proposal.

## Future candidate — handicap progress and GHIN connection

Tyler wants to explore whether members' real-world Handicap Index changes are associated with how often and how they practise in the app. Start after accounts and reliable, profile-specific member history are available.

- Offer voluntary, dated Handicap Index entries as an initial option; label self-reported data clearly and keep it distinct from the handicap simulation profile selected for play.
- Investigate approved USGA/GHIN access, user authorization, permitted uses, provider agreements and potential fees before committing to an integration. A GHIN number alone does not establish access or permission. No provider access or commercial terms have been verified.
- With informed consent, compare handicap trends with practice frequency, completed lessons, assessments and rounds over meaningful periods. Account for other influences such as golf participation and coaching; observed correlations do not establish that the app caused improvement.
- Plan privacy, account linking/unlinking, retention/deletion and appropriate aggregate reporting before collecting linked records. Do not make public handicap-improvement claims without adequate evidence.

Suggested competition sequence: member accounts/history and trusted score validation → daily leaderboards → weekend events; investigate GHIN feasibility alongside this work, with voluntary tracking as a possible first step. Neither GHIN access nor competitive events should block the agreed pilot → refinement → combined free-and-paid launch. Real-course recreation and uploaded-hole conversion remain exploratory ideas, not additions requested in this roadmap update.

## Launch planning reference

Tyler supplied GPT launch notes on 14 October 2026 and asked that we retain them for launch preparation. [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) captures technical/security, billing, legal/privacy/accessibility, business/tax/IP, cost/analytics/support and golf-validation requirements. Its gates remain open until evidence is recorded. Fees, tax statements, legal requirements and provider choices must be verified when applicable; the supplied figures are not confirmed budgets or decisions. This is planning work, not authorization to invite testers, register services, accept payments or publish.

## Product ownership and operations

Use the [owner preparation guide](docs/OWNER-OPERATIONS-PREP.md) alongside the launch checklist. Tyler owns production service accounts, business decisions, access approval and incident/support escalation. Development implements and verifies the agreed controls; focused independent review supplies a second check before collecting paid-member data. Maintain named contacts, tested recovery steps and an evidence-based launch decision. An AI chat is not unattended monitoring or guaranteed incident response.
