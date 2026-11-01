# Target Practice — project plan

Updated November 1, 2026. This is the working order for remaining work; the [launch checklist](LAUNCH-CHECKLIST.md) tracks evidence for the final launch decision.

## Goal and release path

Teach golfers to choose targets, understand their misses and build good course-management habits through a simple web app.

**Small private pilot → refinement → one public launch with free and paid membership ready.** There is no separate public free-only launch. Tyler approves tester invitations, public access and live charging. No launch date is committed.

## Where we are

The current development version is 17.18.2. Desktop fullscreen yardages now use a centered top strip with separate dogleg facts; see [layout and checks](docs/DESKTOP-FULLSCREEN-YARDAGES.md). Shared buttons and Introduction Previous/Next controls have been polished without behavior changes; see [scope and verification](docs/BUTTON-POLISH.md). Assessment reports now include optional expandable shot-by-shot feedback, and essential play information has been checked across screen sizes and fullscreen states. See [review behavior and verification](docs/ASSESSMENT-SHOT-REVIEW.md). New/Continue practice are separate, new sessions choose a fresh layout, Mixed no longer strictly alternates shot types, and paused rounds and Practice sessions are included in backups. See [implementation and integration notes](docs/FRESH-PRACTICE-SESSIONS.md). A targeted beginner wording review clarified Introduction and Lessons instructions and golf terms without changing calculations or lesson flow; see [the review](docs/BEGINNER-WORDING-REVIEW.md). The Introduction now opens with target-selection context and explains separate direction/carry choices before controls practice. New games use consistent surface rollout; saved earlier rounds retain their original rules and model identity. See [the rollout update](docs/CONSISTENT-GROUND-ROLLOUT.md). The mobile full-screen foreground now continues the short grass behind the ball instead of exposing a rough-colored block. Practice, five-shot learning rounds, ten-shot assessments, Lessons, Introduction, custom shot profiles, local My Progress, backups, weather settings and randomized 18-hole Par-3 rounds already exist. The illustrated graphics are integrated, with an Original comparison option. The full 232-test suite and desktop/phone-size Chromium checks passed for that integration; owner testing on the deployed site and physical phones remains pending.

A read-only [model audit](docs/MODEL-VALIDATION-REVIEW.md) passed 14 focused checks and prepared six reproducible cases. Distance-and-lie costs use a cited historical Tour reference; spreads, weather and finishing distributions include teaching assumptions. The rollout fix is implemented; owner testing of the corrected behavior and the broader model review remain pending.

The app is now with pilot testers; feedback collection is underway. Work’s isolated heavy-rough appearance preview and its loading/cache/spacing fixes are now reconciled into this checkout; see [source reconciliation](docs/HOSTED-SOURCE-RECONCILIATION.md). Heavy-rough scoring is still not implemented. Accounts, cloud member history, paid permissions, subscriptions and the daily three-hole challenge are not implemented. A private GitHub repository does not by itself protect a deployed website. Earlier development details are retained in [the implementation history](docs/IMPLEMENTATION-HISTORY-THROUGH-17-5.md).

## Remaining work, in dependency order

| Order | Work | Finished when |
| --- | --- | --- |
| 1 | **Stabilize the current experience.** Finish owner graphics testing; fix blocking control/readability issues; check real desktop, iPhone/Safari and Android/Chrome use, including touch, full screen and saved-round resume. | The main choose → commit → review → retry flow works on the recorded supported devices; no known blocker prevents normal use. |
| 2 | **Establish a trustworthy model baseline.** Owner-test the consistent normal-ground rollout update. Review the six recalculated fixed cases together, then expand the reference set toward at least 20 varied cases. Review future-shot obstacles, short-side limitations, source-table transcription, and target-ranking sensitivity. Establish what the model can honestly claim. | Critical arithmetic/geometry/recommendation issues are resolved; remaining simplifications are documented and acceptable for the pilot. Scoring changes preserve/version historical results deliberately. Complete the applicable wind/firmness validation gate before paid launch, even if calibration work continues after the initial calm-condition review. |
| 3 | **Add distinct content in small batches.** Approve the environment-specific recovery-area preview, then validate its recovery costs before scored integration. Add island green, peninsula green with a bailout, and split fairway with meaningful routes in reviewed batches. Improve existing reachable Par-5 choices rather than count them as new content. | Each family teaches a different decision, has valid playable geometry and reachable strategies for intended profiles, and has matching graphics, aiming, scoring and explanations. Review each before expanding its generator. Full elevation physics remains later work. |
| 4 | **Continue the small private pilot and refine (underway).** Confirm tasks and success criteria; observe first use, the baseline assessment, learning, retries and course play. Collect trust, confusion, return-use and willingness-to-pay feedback. | Evidence identifies the most important improvements and supports the launch scope. Fix critical issues and retest. A stable first pilot can begin before all three new families are finished; do not delay useful feedback for extra content. |
| 5 | **Finalize membership scope and service design.** Use pilot evidence to confirm pricing, remaining mode/history limits and launch audience. Select hosting, authentication, storage and billing providers; map data and costs; design permissions, backup, deletion and billing integration before building them. | The free/paid boundaries, data responsibilities and architecture are explicit enough to implement without guessing. Lightweight decisions/research can start earlier, but do not purchase services or collect new member data without the appropriate authorization. |
| 6 | **Build secure accounts and member progress.** Login/recovery, cross-device profiles/history, account-only access, export/deletion and tested backups. Plan a checked migration of existing local progress with duplicate handling. Retain handicap/custom-profile, conditions and model-version context. | Two-account/direct-request checks prevent cross-account access; recovery and restore work; local progress is preserved or migration limitations are explained. Monitoring and privacy-aware logging are designed here, not postponed until launch. |
| 7 | **Build the daily challenge and membership benefits.** Shared daily three-hole Par-3 setup, first-attempt result, resume/reset rules, complete explanations and separate learning retries. Connect deeper paid history/customization and unlimited 18-hole play to trusted permissions. | The daily setup stays consistent across users/devices and the day's version; retries do not overwrite eligible first results. Free/premium boundaries work through direct requests, not just hidden buttons. Browser-local records are not advertised as verified competitive scores. |
| 8 | **Integrate and verify subscriptions.** Hosted checkout/customer portal, verified payment events, access changes, renewal, failures, cancellation, refunds and reconciliation. | The account-to-payment-to-access lifecycle passes sandbox/end-to-end checks, including delayed/duplicate events. Clearly state benefits, price and cancellation/refund behavior. Live payment configuration/testing requires separate authorization. |
| 9 | **Complete launch review, then release.** Run a small private end-to-end check of the final membership experience. Complete security review and significant fixes, actual-device/accessibility/performance checks, production backup restore/rollback drills, alert delivery, costs, policies, rights and applicable business/tax requirements. Review the owner operating guide and all 17 launch gates. | Named owners, evidence and unresolved issues are recorded; required protections work; Tyler approves public access and live charging. Launch free and paid together, then monitor and support the release. |

**Immediate action list:**

1. Collect the current pilot feedback and fix blocking usability/recommendation issues first. Owner-test the latest Introduction, mobile foreground and corrected rollout using new rounds or Unlimited Practice.
2. Once Work's latest ZIP is available, refine its existing recovery-area menu preview into the environment-specific illustrations below. This visual-only task can run while feedback arrives; it does not change scoring.
3. Review the six fixed model cases together; verify source tables and extend reference coverage. Establish and check any new recovery-area costs before enabling them in scored play.
4. Add and test approved recovery patches/new hole families in small batches, guided by pilot feedback; do not make finishing every content idea a prerequisite for learning from testers.
5. Confirm membership scope/providers, then build accounts/cloud progress → daily challenge and paid access → subscriptions → final launch/security/operations review.

Do not start accounts, billing or extra game modes merely to keep busy. Tournament competition remains later work.

## Work that can happen alongside those steps

- **Start now:** Tyler can inventory accounts/recovery access, choose a support contact, consider launch markets/audience, and budget for services and focused outside review. Use the [owner preparation guide](docs/OWNER-OPERATIONS-PREP.md).
- **During model/content work:** Prepare pilot tasks, access and feedback collection. Investigate source data and rights. A golfer/coach can add perspective, but we can begin the controlled review ourselves; professional feedback does not substitute for source verification or measured calibration.
- **During the pilot:** Draft free/paid boundaries and evaluate providers/costs. Avoid committing to the full account/payment build before the scope is clear.
- **During member development:** Implement security, privacy, backup and billing tests as features are built. The final independent review checks them; it is not the first time we think about them.

These are dependencies and review gates, not a promise that every task must be completely serial. Pilot feedback or a significant defect can change priorities; record the change here.

## Recovery areas — visual trial, then scoring review

**Purpose:** Add an occasional tougher recovery lie beyond ordinary rough, without an automatic penalty stroke or lost balls. These areas must create a meaningful choice rather than clutter every hole.

| Environment | Visual direction |
| --- | --- |
| Woodland | Heavy rough / tall grass |
| Coastal and lakeside | Fescue or native grasses |
| Mountain | Long grass with low scrub |
| Desert | Sparse scrub and gravel, without large blocking rocks |

**Stage A — appearance only:** Adapt Work's existing preview menu tab, using its latest files. Show environment-specific versions in the actual illustrated course style. Use irregular strips/patches beside relevant landing areas, with normal rough as a buffer where appropriate. Vary tuft height, spacing and direction. Keep textures distinct from normal rough, bunkers and trees and readable on mobile/full screen; use small labels. Owner approves the visuals before changes to scoring, generation or saved data. The supplied reference image is visual direction, not a promise of photographic rendering.

**Stage B — controlled model examples:** Define the recovery lie, available rollout and distance-dependent next-shot cost. Our current reference does not separately measure fescue/heavy rough, so any adjustment needs evidence or an explicit teaching-assumption label. No lost balls or automatic penalty strokes. Do not assume different environments' real lies are equally difficult, and do not imply modeled rock bounces, blocked shots or airborne collisions. Compare targets with/without the area and review the golf reasoning together.

**Stage C — occasional scored integration:** Easy remains ordinary rough. Introduce recovery areas occasionally in Medium and more frequently/strategically in Hard, but never require one on every hole. Exact frequencies remain to be chosen and tested. The same defined recovery lie uses the same cost rule across difficulty settings; difficulty changes presence/placement, not a hidden severity multiplier. Explain the expanded course-setup meaning of difficulty, preserve seeded retries and version affected scores/saves. Tournament layouts/settings remain fixed for all entrants. Enabling Stage C depends on Stage B, not just approving the artwork.

## Planned free and paid experience

This is agreed product direction, not paid restrictions already active in the prototype.

| Free | Paid |
| --- | --- |
| Shared daily three-hole Par-3 challenge, with a new selection each day | Unlimited randomized 18-hole Par-3 rounds |
| Fixed standard profile and conditions in the challenge | Choice of profiles/conditions and custom shot profiles |
| Full explanations and unscored learning retries | Deeper personal history, trends and personalization |
| Introduction and core Lessons; a basic result/recent summary | Sustained play and progress tools |

The daily challenge replaces the proposed separate three-hole sampler and separate three-decision challenge. Show golf score to par and decision quality as distinct measures. First attempts count; optional learning retries cannot replace them. Mandatory OB retees and penalties remain part of the played hole, not free retries.

Before implementation, specify the daily reset timezone, incomplete-round/resume rules, stable shared setup and model version, and the treatment of resets/repeated attempts. Leaderboards are not required for this first daily mode. Exact allowances for other practice/assessment modes, history and pricing remain open; preserve existing private-pilot access until the agreed restrictions are built and verified.

## Later roadmap — does not block the planned launch

- **Open-entry scheduled tournaments and leaderboards:** Use the event format below, after accounts and trusted scoring are ready. This is a later engagement feature, not a launch blocker.
- **GHIN and handicap trends:** Begin with optional dated self-reports if useful. Investigate authorized USGA/GHIN access, agreements, permitted uses and fees before promising integration. Obtain consent and support unlinking/deletion. Correlation with app usage is not proof the app caused improvement.
- **Elevation physics:** Make height effects on carry, landing, rollout and recommendations agree; decorative elevation is not physical calibration.
- **Full multi-shot courses, real-course recreation and uploaded-hole conversion:** Exploratory scope. Future multi-shot courses should preserve a single generated hole and advance from the actual shot result; no launch commitment.
- **Phone installation/native apps:** Start with the mobile-friendly web app. Consider PWA installation/offline behavior or app-store releases only when users establish a need; none is currently promised.

## Planned open-entry tournaments — added October 22, 2026

**Purpose:** Attract golfers to the app and encourage return visits. Tournament entry is available without a paid membership or entry fee. This changes the tournament proposal, not the planned free/paid membership offering. Paid-entry prize pools and a hosting cut are not the chosen format.

- **Fixed event setup:** Publish one repeatable course, a standard shot profile, difficulty and per-hole conditions shared by all entrants. Settings can change between events (for example, this week's event uses a particular handicap profile and Easy conditions), but remain locked within an event. Lock the scoring/generator versions too; custom profiles cannot alter competitive play. A 15-handicap profile was an example, not an existing preset or a committed addition; current presets are 0, 5, 10 and 20.
- **Two separate leaderboards/award categories:** Lowest simulated golf score and highest average decision score. Explain that golf score includes sampled-shot/finish luck, while the decision score evaluates target selection. Use one decimal place for displayed tournament decision scores/averages, calculated from underlying unrounded decision costs rather than averaging already-rounded integer ratings. Round only for display, keep the existing 100-achievement rule separate, and establish a meaningful tie threshold/published tie rule instead of breaking displayed ties with hidden decimals. Golf stroke scores remain whole numbers. This scoring presentation is planned, not implemented. Define eligible completed rounds and tie handling before launch; do not silently combine the categories into one ranking.
- **One eligible attempt:** No restart or optional retry that can replace a committed tournament choice or resample its outcome. Mandatory OB retees and penalties remain part of the same hole. Keep learning retries separate and unranked; decide when they become available to avoid undermining the event's fairness.
- **Reconnect, not reroll:** Save accepted commitments and selected outcomes on the server. A disconnected golfer resumes that same round; refreshes, duplicate requests or another device must not create another outcome. Define when an attempt starts, interrupted-submit handling, the resumption deadline and treatment of unfinished rounds. Entrants should not lose progress solely because a phone connection drops.
- **Scheduled events:** Start with a one-day event with clear opening/closing times and timezone. Two- or four-day events can follow once the foundation works; specify whether each day has a new round, which rounds count and how totals/averages are calculated. Those details remain open.
- **Trusted results:** Require suitable accounts/identity and enforce attempt limits, commitments and score eligibility on trusted server services. Address altered browser results, repeated accounts, shared answers and reporting/disputes. Browser-local scores are not sufficient for valuable prizes; public leaderboard names also need appropriate privacy/moderation choices.
- **Prizes later:** Pilot the event without prizes first. Potential later prizes can recognize each category, subject to a defined budget, official rules, eligibility/jurisdiction review, provider compatibility and any applicable prize/tax obligations. No prize amount, funding arrangement or promise is approved. Free entry alone does not remove the need for this review.

**Dependency order:** Accounts and secure storage → server-verified tournament scoring/attempt recovery → private no-prize event test → approved open event → prizes after the required review. This complements the daily three-hole challenge and does not replace it. Public access and awarding prizes require Tyler's explicit approval; this roadmap addition does not authorize either.

## Ownership and launch controls

Use the [owner preparation guide](docs/OWNER-OPERATIONS-PREP.md) throughout member development and review it explicitly in step 9, alongside [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md). Track each requirement as **item → named owner → evidence → unresolved issue → next review**.

Tyler owns production accounts, business choices, access approval and incident/support escalation. Development implements and verifies controls; focused independent review supplies a second check before paid launch. Establish alert recipients, emergency controls, restore steps and technical contacts. An AI chat is not unattended monitoring or guaranteed incident response.

The supplied external launch notes inform the checklist; their proposed public free-only stage does not replace our release path. Legal/tax requirements, provider terms, prices and data rights need verification for the actual markets and services. This plan does not authorize invitations, public access, service purchases, customer-data collection or live charging by itself.

## Working rules

- Preserve the app, saved rounds and progress while improving it in manageable steps.
- Keep patterns and recommendations hidden until commitment, with the agreed guided-lesson exceptions.
- State each implementation change and its checks; fix blockers before adding features.
- Use GitHub branches and appropriate tests. Do not treat historical passing checks as evidence for untested new changes.
- Describe teaching estimates honestly; do not promise handicap improvement, personal scoring accuracy or a proven optimal target.
- Keep the [pilot guide](docs/PILOT-TESTER-GUIDE.md), model review and launch checklist aligned as scope changes.


## Tournament access clarification — November 1, 2026

Event entry requires no purchase or paid membership. Nonmembers can play the full event course even when it exceeds the ordinary free three-hole allowance; that exception applies only to the event. A free account may be required for identification and saved scores. Begin with no-prize tests. Prize events still require published rules, eligibility and applicable legal/tax/provider review and explicit approval before promotion. Free entry is not a blanket legal exemption.

A simple owner-only shared results table and CSV export is a proposed first administration step before a public leaderboard. Record player/event/round identity, course and scoring-model versions, profile/conditions, timestamps/completion, golf score and average decision score. Requires managed account/database access rules, duplicate-safe submissions and later score verification for prizes; none is implemented by this reconciliation.

Completed in 17.18.2: desktop full-screen Front / Flag / Back distances use a centered top strip, with dogleg facts on a separate row. Work’s imported phone and short-landscape spacing fixes remain intact.
