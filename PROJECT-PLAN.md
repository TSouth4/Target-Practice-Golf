# Target Practice — project plan

Updated November 1, 2026. This is the working order for remaining work; the [launch checklist](LAUNCH-CHECKLIST.md) tracks evidence for the final launch decision.

## Goal and release path

Teach golfers to choose targets, understand their misses and build good course-management habits through a simple web app.

**Small private pilot → refinement → one public launch with free and paid membership ready.** There is no separate public free-only launch. Tyler approves tester invitations, public access and live charging. No launch date is committed.

## Where we are

The current development version is 17.18.4. Two fixed [owner model-review examples](docs/TWO-MODEL-EXAMPLES.md) are prepared for discussion; club-switch sensitivity and dogleg tree-clearance assumptions remain under review, with no scoring changes. Desktop fullscreen hazard labels now clear the carry bar during resize and zoom; see [visibility fix](docs/FULLSCREEN-HAZARD-CLEARANCE.md). Desktop fullscreen yardages now use a centered top strip with separate dogleg facts; see [layout and checks](docs/DESKTOP-FULLSCREEN-YARDAGES.md). Shared buttons and Introduction Previous/Next controls have been polished without behavior changes; see [scope and verification](docs/BUTTON-POLISH.md). Assessment reports now include optional expandable shot-by-shot feedback, and essential play information has been checked across screen sizes and fullscreen states. See [review behavior and verification](docs/ASSESSMENT-SHOT-REVIEW.md). New/Continue practice are separate, new sessions choose a fresh layout, Mixed no longer strictly alternates shot types, and paused rounds and Practice sessions are included in backups. See [implementation and integration notes](docs/FRESH-PRACTICE-SESSIONS.md). A targeted beginner wording review clarified Introduction and Lessons instructions and golf terms without changing calculations or lesson flow; see [the review](docs/BEGINNER-WORDING-REVIEW.md). The Introduction now opens with target-selection context and explains separate direction/carry choices before controls practice. New games use consistent surface rollout; saved earlier rounds retain their original rules and model identity. See [the rollout update](docs/CONSISTENT-GROUND-ROLLOUT.md). The mobile full-screen foreground now continues the short grass behind the ball instead of exposing a rough-colored block. Practice, five-shot learning rounds, ten-shot assessments, Lessons, Introduction, custom shot profiles, local My Progress, backups, weather settings and randomized 18-hole Par-3 rounds already exist. The illustrated graphics are integrated, with an Original comparison option. The full 232-test suite and desktop/phone-size Chromium checks passed for that integration; owner testing on the deployed site and physical phones remains pending.

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
2. Using Work's now-reconciled source, refine the existing recovery-area menu preview into the environment-specific illustrations below. This visual-only task can run while feedback arrives; it does not change scoring.
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


## Consolidate development branches — added November 1, 2026

There were 70 remote branches at the last count. After the latest hosted/reconciled version is confirmed, establish one verified baseline in `main` and use short-lived feature/review branches for subsequent work. This is planned maintenance, not completed by this document update.

1. Inventory remote branches and identify the exact hosted source/version. Compare it with the latest cumulative development branch; preserve any newer Work or GitHub changes.
2. Verify ancestry and file differences, retain useful unmerged work, and create a named backup/tag of the chosen baseline before consolidation. Never infer that an older branch is redundant from its name alone.
3. Prepare a reviewable change into `main`, run appropriate validation, and obtain the owner's explicit authorization before merging main or deleting remote branches. This plan entry is not that authorization.
4. Retire only branches whose work is preserved and whose deletion was authorized. Commit history and release references remain available; retain baseline tags and deployment artifacts needed for rollback/cached releases.
5. Document the current source branch, hosted version and deployment handoff. Future work branches from the verified main, is reviewed/tested, then merges back rather than accumulating another chain of permanent branches.

Do not deploy or change site access as part of branch cleanup.

## Hole-variety refinement — owner feedback, November 1, 2026

The owner reports many scenarios feel straight or sharply doglegged, with repeated compositions despite changing seeds. Geometry variety must change both the view and the target-selection decision. This refines stage 3 above; it does not authorize immediate changes to scoring or saved round schedules.

### Current implementation findings

- The 16-family Practice bank includes eight tee and eight approach families. Regular tee families have small lateral movement, `bend` is a moderate gradual dogleg, and `sharp-dogleg` makes a sharper turn. Gentle bend may occur beyond the landing area, so a mathematically different fairway can still feel straight. Numeric lateral offsets are yards, not dogleg angles.
- Generated woodland hazards predominantly flank the fairway/green. Authored baselines include some back recovery patches, but the normal nonzero-seed approach generator rebuilds hazards and does not deliberately add a central rear-green tree belt. Side woods extending beyond a green are not the same as trouble directly behind it.
- `bowl` already places water behind the green and sand short. This gives one depth-risk composition, not a broad family of varied rear hazards.
- `shore-tee` and `shore-green` already add actual water along one side from roughly 45 yd forward through the green area, with the water side varying by seed. These are only two of the 16 families, reuse existing base geometry and do not constitute a purpose-built peninsula green. Background lake/ocean scenery alone is not a playable water boundary.
- Peninsula/island greens were already proposed, but are not implemented families yet.

### Prioritized content batch proposal

1. **Visible gentle-to-moderate doglegs:** Both left and right, with gradual, medium and sharp turns. Vary the bend's onset, length, fairway width and location relative to useful landing areas—not only the far end of the hole. Some should favor distance and some should favor laying back.
2. **Purposeful danger behind greens:** On selected wooded holes, add distinguishable rear recovery woods at varied setbacks, density and height, keeping a plausible bailout. Include some rear-bunker/water compositions too. Rear trees must be actual recovery geometry with matching art, not just background scenery; the existing model still does not simulate airborne tree strikes. Not every hole should have rear danger.
3. **Peninsula greens:** Water wraps two/three sides, with a defined land connection and at least one meaningful safer miss/route. Review reachable strategies for different profiles, drops and recommended targets. Keep this distinct from a full island green.
4. **More distinctive continuous-water layouts:** A coastal-style Par-3 with water along the green edge and longer water-lined tee/approach holes with varied shoreline shape, green angle and bailout side. Pebble Beach 7 / Bay Hill 18 are owner-provided inspiration for different water decisions, not a commitment to recreate the real courses. Preserve the existing shoreline families while improving their visual and strategic variety.

Approve a small set of fixed examples before expanding random generation. Inspect both eye-level and overhead geometry; check playable areas, hazard priority/relief, profile reach, optimizer targets, explanations and saved-round compatibility. Then choose frequency in Practice, learning/assessment schedules and Par-3 mixes so the new families are noticeable without dominating. Do not alter the fixed Introduction/Lessons examples unintentionally. Numerical score changes require deliberate model/history version handling.

Current action: added to roadmap only; no new hole geometry or runtime code was implemented in this update. Continue the two fixed model reviews and pilot feedback alongside this planning.

## Additional hole and green-shape backlog

The owner approved adding the following ideas to the roadmap, not implementing all of them at once. Prioritize recognizably different decisions, keep some open/inviting holes, and avoid turning every scenario into maximum danger.

| Variation | Learning purpose / implementation boundary |
| --- | --- |
| Diagonal creek | Carry requirement changes across the hole; compare a shorter crossing with a longer, more rewarding line. |
| Split fairway | Wider longer route versus narrower shortcut; actual playable geometry and meaningful target costs. |
| Fairway that ends | Account for landing and rollout before running through into recovery/trouble; do not score artwork as fairway when it is not. |
| Staggered bunkers | Different trouble distances on opposite sides make the best direction depend on the chosen carry/club. |
| Angled green | Direction changes available landing depth; rotate the actual playable boundary, not only the illustration. |
| Long narrow versus wide shallow green | Emphasize lateral versus depth misses; some variation already exists through ellipse width/depth, but compositions should be more distinctive. |
| Offset green | Break the assumption that fairway centerline points toward the sensible approach target. Some offset already exists; improve its strategic effect rather than calling every offset a new family. |
| Generous bailout with a cost | Compare safety with the longer putt/next shot; no automatic assumption that safer is always better. |
| Reachable Par-5 with angled entrance | Improve existing Par-5 families with going-for-it, close-layup and farther-layup choices; avoid duplicating current content under new names. |
| Double dogleg | Later batch; requires care with route feasibility and the model's current lack of explicit future-shot obstacle handling. |
| Elevated / downhill valley greens | Later batch; validate carry, landing and rollout effects before implying full elevation physics through the artwork. |

### Green shapes

Current scoring uses an axis-aligned ellipse (`x`, `y`, `rx`, `ry`); width and depth vary but there are no genuine rotated, kidney-shaped, L-shaped or polygonal playable greens. First candidates are rotated ovals and kidney-shaped greens, followed by selected irregular/L-shaped examples if they teach useful decisions.

Implement the shared geometric foundation before broad generation: rendered edges, lie classification, front/flag/back yardages, hazard clearance checks, pin placement, target search, close-up/scout views and course simulation must agree. Preserve the intended meaning of front/back distances. Legacy circles/ellipses and saved rounds must retain their original geometry and scoring, with default rotation/shape behavior or an explicit versioned compatibility path. Shape changes must not silently alter fixed tutorial examples or existing seeded rounds.

### Practical order while tester feedback is pending

1. Finish the branch-consolidation **audit** and prepare a reviewable baseline; merging main/deleting branches still needs explicit authorization.
2. Review the already-prepared long Par-3 and sharp-dogleg examples with the owner, documenting club-switch and tree-clearance assumptions before changing the model. Expand the reference cases and source checks afterward.
3. Prototype a small fixed variety pack: a clearly gentle/moderate dogleg, rear-green trouble with a bailout, a diagonal creek, and contrasting/angled green shapes. Approve the shared shape foundation before kidney/irregular generation. Peninsula and continuous-water families follow in reviewed batches.
4. Continue collecting pilot feedback without blocking all development. Offer one short observed session with specific tasks rather than relying only on open-ended written feedback. Test prototypes before expanding random generation; final public/paid launch still requires real-user/device evidence.

This update changes the plan only. It does not add playable holes, change scoring or begin account/payment implementation.


### Branch audit completed — promotion still pending

The [branch audit](docs/BRANCH-AUDIT.md) found 71 remote branches, all included in the latest cumulative planning/source baseline. Main remains the v12 import, 79 commits behind; 69 older refs are potential retirement candidates after promotion and approval. There is no unique remote commit work to integrate in this snapshot. Confirm the latest deployed Work source and active branch usage before preparing an authorized main update. No merge, tag creation, branch deletion or deployment was performed. See the [Excel inventory](docs/BRANCH-AUDIT.csv) and [pinned snapshot](docs/BRANCH-AUDIT.json).

### Owner review follow-up: dispersion realism and dogleg routes

Owner feedback on the two examples is recorded in [OWNER-MODEL-FEEDBACK.md](docs/OWNER-MODEL-FEEDBACK.md). Prioritize intended-carry semantics, measured execution-error distributions (especially short mishits and long tails), the automatic club switch, and future-route/tree-clearance assumptions before expanding scored content. The 179.6-yard sample is currently about 50/50 short/long with no rollout; 0.8% finish over 40 yd long. Owner favors green center and provisionally favors extra dogleg distance conditional on tree clearance. Reconcile the mentioned short-right water with the fixed case (which has no water). No distribution or grading change was implemented by this diagnostic; evidence and compatibility review remain required.

### Carry-dispersion evidence study — requested November 4, 2026

Before changing shot-pattern defaults, investigate the owner's hypothesis that stated stock/full-shot carry is nearer a higher percentile (perhaps around 70th) than the median, with more short mishits. Research TrackMan, Arccos, Shot Scope, PGA/public studies and data definitions, separating carry from finish/rollout and club-selection bias from execution error. The [research protocol](docs/DISPERSION-RESEARCH-PROTOCOL.md) and source/evidence registers are prepared. Public source retrieval is currently blocked by the environment network allowlist; a network-only draft was saved and needs owner review/save/publication before retrieval can proceed. No literature findings or new calibration are claimed yet. No gameplay or score distribution changed.

### Internal club and sensitivity study completed

The [club sensitivity study](docs/CLUB-SENSITIVITY-STUDY.md) covers six fixed layouts across four handicaps, 68 club boundaries and three independent sample sets. Automatic club choice reverses the front-versus-center preference in the owner's long approach when compared with holding the same feasible club; 5-iron-to-hybrid depth spread shrinks 20–27% in current presets. Broad strategic choices are more stable than exact winning points, with small cost differences in the checked alternatives. Validate stock-carry semantics and club-specific spreads with measured evidence before changing defaults. Preserve historical bag/pattern assumptions before any future model update. No runtime, scoring or deployment change was made; empirical source research remains pending network access.

### Club assumptions implementation — 17.18.5

Implemented standard-profile stock/flight snapshots for learning rounds, assessments and Par-3 rounds, with frozen legacy migration and validation; existing custom snapshots and model/rollout rules remain. Added a modeled-club label beside carry and an isolated [club comparison prototype](docs/CLUB-SELECTION-IMPLEMENTATION.md), accessible at `club-selection-prototype.html` and from the owner-review page. Current club-selection policy, scoring and live deployment remain unchanged. Measured carry research and future policy/version compatibility remain required before changing defaults. All 67 regression test files passed across the full run and the corrected legacy-fixture rerun; focused snapshot/backup and desktop/phone browser checks also passed. The legacy fixture now permits the additive snapshot while checking every existing saved field remains unchanged. No deployment was performed.

### Public dispersion research resumed — evidence review complete, calibration open

Read 19 substantive public sources after network publication. The [research findings](docs/DISPERSION-RESEARCH-FINDINGS.md) confirm that Arccos defines its player driving-distance statistic as P70 carry and describes club Smart Distance using different, unpublished club-dependent percentiles. TrackMan bag mapping describes rolling averages; Arccos/Shot Scope good-strike distances filter mishits/outliers. These conventions support testing an anchor separate from all-attempt outcomes, but no representative amateur shot-level carry dataset or universal iron percentile/tail calibration was retrieved. Added evidence CSV, source hashes/access register and reproducible analytic anchor illustrations. Next: specify intended/stock/partial-shot semantics, compare exploratory distributions with club held fixed, and obtain suitable measured carry data before adopting parameters. No gameplay or scoring changes; no deployment.

### Isolated dispersion comparison implemented — 17.18.6

Added `dispersion-prototype.html`, linked from the existing owner/club-review pages. It compares current symmetric, shifted P70-reference and illustrative tighter-core/short-mishit patterns on three fixed approach layouts at handicaps 5/20. Club and shared draws remain fixed, with same-target and per-pattern sampled-best views, experimental scores/costs, outcome rates and carry dots. All new parameters are explicitly exploratory; the live game and model version are unchanged. See [instructions and scope](docs/DISPERSION-PROTOTYPE.md), raw results and blank carry-data collection sheet. Numerical and browser verification are recorded with the prototype. Owner review and measured carry data remain the next gates before selecting production defaults.

### Beginner-feedback copy implemented — 17.18.7

Applied the owner's approved plain-language comments with tee/approach adaptations and evidence guards for carry-specific explanations. Initial results retain score/verdict and at most one short adjustment; technical coaching/statistics remain behind See details. Completed assessment shot review and Par-3 summaries use the same level of language, with legacy outcomes preserved. Pre-assessment setup now explains the ten-shot starting point and delayed feedback; Introduction → Assessment remains. No scoring, distribution, model-version or access changes. See [implementation notes](docs/BEGINNER-FEEDBACK.md). All 68 test files passed across the full run and corrected results/progress-file rerun; final coaching/assessment and syntax checks passed. Chromium checks at 1440/390/320 px passed, including assessment privacy, retry history and unchanged legacy Par-3 outcomes. No live deployment was performed.
