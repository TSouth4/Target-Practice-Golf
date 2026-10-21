# Target Practice — project plan

Updated October 21, 2026. This is the working order for remaining work; the [launch checklist](LAUNCH-CHECKLIST.md) tracks evidence for the final launch decision.

## Goal and release path

Teach golfers to choose targets, understand their misses and build good course-management habits through a simple web app.

**Small private pilot → refinement → one public launch with free and paid membership ready.** There is no separate public free-only launch. Tyler approves tester invitations, public access and live charging. No launch date is committed.

## Where we are

The current development version is 17.15.0. Practice, five-shot learning rounds, ten-shot assessments, Lessons, Introduction, custom shot profiles, local My Progress, backups, weather settings and randomized 18-hole Par-3 rounds already exist. The illustrated graphics are integrated, with an Original comparison option. The full 232-test suite and desktop/phone-size Chromium checks passed for that integration; owner testing on the deployed site and physical phones remains pending.

A read-only [model audit](docs/MODEL-VALIDATION-REVIEW.md) passed 14 focused checks and prepared six reproducible cases. Distance-and-lie costs use a cited historical Tour reference; spreads, weather and finishing distributions include teaching assumptions. The rollout inconsistency is documented and not fixed yet.

Accounts, cloud member history, paid permissions, subscriptions and the daily three-hole challenge are not implemented. A private GitHub repository does not by itself protect a deployed website. Earlier development details are retained in [the implementation history](docs/IMPLEMENTATION-HISTORY-THROUGH-17-5.md).

## Remaining work, in dependency order

| Order | Work | Finished when |
| --- | --- | --- |
| 1 | **Stabilize the current experience.** Finish owner graphics testing; fix blocking control/readability issues; check real desktop, iPhone/Safari and Android/Chrome use, including touch, full screen and saved-round resume. | The main choose → commit → review → retry flow works on the recorded supported devices; no known blocker prevents normal use. |
| 2 | **Establish a trustworthy model baseline.** Make normal-ground rollout consistent across difficulty modes. Review the six fixed cases together, then expand the reference set toward at least 20 varied cases. Review future-shot obstacles, short-side limitations, source-table transcription, and target-ranking sensitivity. Establish what the model can honestly claim. | Critical arithmetic/geometry/recommendation issues are resolved; remaining simplifications are documented and acceptable for the pilot. Scoring changes preserve/version historical results deliberately. Complete the applicable wind/firmness validation gate before paid launch, even if calibration work continues after the initial calm-condition review. |
| 3 | **Add distinct content in small batches.** Island green, peninsula green with a bailout, and split fairway with meaningful routes. Improve existing reachable Par-5 choices rather than count them as new content. | Each family teaches a different decision, has valid playable geometry and reachable strategies for intended profiles, and has matching graphics, aiming, scoring and explanations. Review each before expanding its generator. Full elevation physics remains later work. |
| 4 | **Run the small private pilot and refine.** Agree access, tasks and success criteria; invite approved testers; observe first use, the baseline assessment, learning, retries and course play. Collect trust, confusion, return-use and willingness-to-pay feedback. | Evidence identifies the most important improvements and supports the launch scope. Fix critical issues and retest. A stable first pilot can begin before all three new families are finished; do not delay useful feedback for extra content. |
| 5 | **Finalize membership scope and service design.** Use pilot evidence to confirm pricing, remaining mode/history limits and launch audience. Select hosting, authentication, storage and billing providers; map data and costs; design permissions, backup, deletion and billing integration before building them. | The free/paid boundaries, data responsibilities and architecture are explicit enough to implement without guessing. Lightweight decisions/research can start earlier, but do not purchase services or collect new member data without the appropriate authorization. |
| 6 | **Build secure accounts and member progress.** Login/recovery, cross-device profiles/history, account-only access, export/deletion and tested backups. Plan a checked migration of existing local progress with duplicate handling. Retain handicap/custom-profile, conditions and model-version context. | Two-account/direct-request checks prevent cross-account access; recovery and restore work; local progress is preserved or migration limitations are explained. Monitoring and privacy-aware logging are designed here, not postponed until launch. |
| 7 | **Build the daily challenge and membership benefits.** Shared daily three-hole Par-3 setup, first-attempt result, resume/reset rules, complete explanations and separate learning retries. Connect deeper paid history/customization and unlimited 18-hole play to trusted permissions. | The daily setup stays consistent across users/devices and the day's version; retries do not overwrite eligible first results. Free/premium boundaries work through direct requests, not just hidden buttons. Browser-local records are not advertised as verified competitive scores. |
| 8 | **Integrate and verify subscriptions.** Hosted checkout/customer portal, verified payment events, access changes, renewal, failures, cancellation, refunds and reconciliation. | The account-to-payment-to-access lifecycle passes sandbox/end-to-end checks, including delayed/duplicate events. Clearly state benefits, price and cancellation/refund behavior. Live payment configuration/testing requires separate authorization. |
| 9 | **Complete launch review, then release.** Run a small private end-to-end check of the final membership experience. Complete security review and significant fixes, actual-device/accessibility/performance checks, production backup restore/rollback drills, alert delivery, costs, policies, rights and applicable business/tax requirements. Review the owner operating guide and all 17 launch gates. | Named owners, evidence and unresolved issues are recorded; required protections work; Tyler approves public access and live charging. Launch free and paid together, then monitor and support the release. |

**Immediate next work:** finish the current graphics playtest, then address the normal-ground rollout inconsistency and review its effects on the fixed model cases. Do not start accounts, billing or more game modes merely to keep busy.

## Work that can happen alongside those steps

- **Start now:** Tyler can inventory accounts/recovery access, choose a support contact, consider launch markets/audience, and budget for services and focused outside review. Use the [owner preparation guide](docs/OWNER-OPERATIONS-PREP.md).
- **During model/content work:** Prepare pilot tasks, access and feedback collection. Investigate source data and rights. A golfer/coach can add perspective, but we can begin the controlled review ourselves; professional feedback does not substitute for source verification or measured calibration.
- **During the pilot:** Draft free/paid boundaries and evaluate providers/costs. Avoid committing to the full account/payment build before the scope is clear.
- **During member development:** Implement security, privacy, backup and billing tests as features are built. The final independent review checks them; it is not the first time we think about them.

These are dependencies and review gates, not a promise that every task must be completely serial. Pilot feedback or a significant defect can change priorities; record the change here.

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

- **Daily/all-time leaderboards and weekend tournaments:** Shared event setup, fair profile/condition divisions, attempt/tie rules, timezone windows and trusted server-side eligibility/results. Keep incompatible scoring versions separate. No entry fees or prizes are currently planned.
- **GHIN and handicap trends:** Begin with optional dated self-reports if useful. Investigate authorized USGA/GHIN access, agreements, permitted uses and fees before promising integration. Obtain consent and support unlinking/deletion. Correlation with app usage is not proof the app caused improvement.
- **Elevation physics:** Make height effects on carry, landing, rollout and recommendations agree; decorative elevation is not physical calibration.
- **Full multi-shot courses, real-course recreation and uploaded-hole conversion:** Exploratory scope. Future multi-shot courses should preserve a single generated hole and advance from the actual shot result; no launch commitment.
- **Phone installation/native apps:** Start with the mobile-friendly web app. Consider PWA installation/offline behavior or app-store releases only when users establish a need; none is currently promised.

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
