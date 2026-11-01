# Target Practice launch readiness

## Agreed release path

**Small private test pilot → refinement → one public web launch with free and paid membership ready.** A separate public free-only launch is not planned. The private pilot can be free and can precede accounts/payments if suitable private access and clear browser-local save limitations are in place. Tyler approves invitations, public access and charging separately.

This checklist incorporates Tyler's supplied GPT launch notes (14 October 2026). It records planning requirements, not verified legal advice, service prices, tax classifications or implemented features. The document's proposed free-public-launch stage does not replace Tyler's chosen path. Its example subscription prices, customer counts and costs are illustrative, not decisions or forecasts. Stripe is a candidate, not a selected provider. Confirm business location, launch markets and age policy before applying jurisdiction-specific guidance.

## Current starting point

The current app is a private, static web prototype with browser-based simulations and local saves. It includes practice, lessons, Introduction, assessments, five-shot rounds, 18-hole par-3 rounds, custom shot profiles, wind and firmness. Current tests establish software behavior; they do not establish measured golf accuracy, subscription readiness or independent security assurance.

Accounts, cross-device member history, a production database, payment integration and secure paid-feature enforcement remain to be built. Tools presently labeled member preview are not protected paid memberships. Launch hosting capabilities and production operating costs still need confirmation. Record evidence and mark items complete only after verification.

## Product direction recorded October 21, 2026

The planned free Par-3 offering is a shared daily three-hole challenge, replacing a separate static three-hole sampler and separate daily decision mode. Full explanations and unscored retries remain available; first attempts count. Paid members receive unlimited randomized 18-hole rounds, custom profiles and deeper progress tools. Introduction/core Lessons and a basic result/recent summary remain free. Exact limits for other modes, history allowances and pricing are not yet finalized. Competition/leaderboards remain later work. See [the project plan](PROJECT-PLAN.md) for the build sequence.

## Ownership and operational preparation

Use [OWNER-OPERATIONS-PREP.md](docs/OWNER-OPERATIONS-PREP.md) as the owner's practical preparation guide. Before paid launch, every applicable gate needs a named owner, verification evidence, unresolved issues and a go/no-go decision. Review at least account isolation/paid access, backup restore, payment lifecycle and incident response beyond the implementing developer's own checks. Choose a focused outside technical review proportionate to the final architecture; record its scope and resolve significant findings. Managed providers help with infrastructure but do not verify our permissions, policies or integration automatically. Production service ownership, alert recipients, emergency controls and recovery contacts must be in place; AI assistance is not a monitored on-call service.

## Launch gates

All items below are **pending** as complete launch gates. Existing development checks contribute evidence but do not close production requirements by themselves.

| # | Area | Work and evidence required before full launch |
| --- | --- | --- |
| 1 | Hosting and HTTPS | Choose production hosting/domain and confirm support for accounts, database and billing services. Verify encrypted connections, representative load/performance, deployment rollback and a usable failure page. |
| 2 | Accounts | Use a suitable managed authentication service. Test sign-up, verification, login, recovery, logout and session expiry on supported devices. |
| 3 | Member data and paid access | Store progress/profile/history securely across devices. Separate history by handicap/custom profile, difficulty and model version. Verify each user can access only their data; enforce premium permissions on trusted server services rather than browser-only flags. Cover direct URLs, altered requests and expired access. |
| 4 | Reliability and security | Protect secrets, validate untrusted inputs and limit abuse of server endpoints. Monitor errors without logging sensitive data. Test backups by restoring data. Arrange a focused security/reliability review beyond our own automated checks, and resolve significant findings. |
| 5 | Device support and accessibility | Verify actual iPhone/Safari, Android/Chrome and desktop browsers; include touch, full screen, keyboard, readable contrast/forms and alternatives to dragging. Record supported versions and outstanding limits. Desktop Chromium emulation alone does not close this gate. |
| 6 | Business administration | Tyler chooses business structure and confirms payment-account ownership. Consider formation/EIN as appropriate; establish suitable banking, business email, support ownership and income/expense records. Verify current filing requirements/fees rather than using pasted amounts. |
| 7 | Privacy and terms | Inventory actual data collection, providers, retention and deletion/export options. Publish policies matching implemented behavior. Decide launch audience/markets and age policy; assess children's privacy and applicable tracking consent before enabling analytics. Obtain appropriate review. |
| 8 | Subscription and refund terms | State price, billing frequency, renewal, paid benefits, cancellation timing and refund handling clearly before checkout. Provide straightforward self-service cancellation, required consent records/reminders and a support route. Verify applicable rules for launch markets. |
| 9 | Taxes and recordkeeping | Have an appropriate adviser confirm classification and obligations for this membership, seller location and customer markets. Decide registrations/collection/reporting and records. Do not assume SaaS is exempt everywhere or charge tax everywhere by default. |
| 10 | Rights and branding | Review app-name conflicts and commercial rights for code, libraries, artwork, fonts, audio, source assets, golf data and any course maps. Retain provenance/terms for generated assets. Avoid implying Tour, governing-body or brand endorsement. |
| 11 | Checkout and customer portal | Select a managed payment provider and supported plans/currency. Configure hosted checkout and account-management portal. Test free-to-paid upgrade, receipts, duplicate purchases and any offered monthly/annual options before enabling live charging. |
| 12 | Verified billing events | Activate/update access using verified provider events, not a successful-return page. Handle duplicate, delayed and out-of-order events safely; reconcile provider state and account permissions after outages. Test renewal, expiry and cancellation at the intended access end date. |
| 13 | Billing failures and refunds | Test declined payments, expired cards, retries, recovery, cancellations, refunds and disputes. Establish how each affects access and support. Verify live configuration separately from sandbox testing. |
| 14 | Golf credibility | Review probability totals, dispersion, lie/penalty costs, distance costs, target rankings, grades, short-side advice, wind/firmness and simulated finishes. Seek golfer/coach review and measured data where licensed. Explain illustrative profiles and Tour-reference limitations; do not promise handicap improvement or personal scoring accuracy. |
| 15 | Reference scenarios | Maintain at least 20 varied reference situations and edge cases with documented expected strategic behavior. Include penalty carries, tucked pins, excessive layback, reachability, narrow/wide tee shots, custom profiles and conditions. Check ranking stability/sensitivity and investigate surprising recommendations after model changes. |
| 16 | Economics, analytics and support | Define pilot success metrics and privacy-conscious analytics: introduction/round completion, return visits, trust/confusion, bugs; after billing, conversion/churn. Track actual hosting/database/email/storage/logging/payment/support costs, free usage limits and cost per active/paying user. Configure spend alerts and a support channel. Browser-local simulation currently avoids a per-shot external AI service; production services will still cost money. |
| 17 | Private pilot and launch decision | Agree pilot scope, access and success criteria, then invite an approved small group (10–30 is a suggestion, not a committed count). Gather usability, educational trust and return-use evidence. Resolve critical issues, retest, agree remaining limitations and review all applicable gates before Tyler authorizes public free-and-paid launch. |

## Decisions to make when launch preparation starts

- Free versus paid benefits, usage allowances, monthly/annual pricing and launch scope; avoid adding game modes merely to fill a paid tier.
- Production providers, data model and accounts/member-dashboard design. Preserve profile-specific results and support migration from browser-local history where practical.
- Business location/structure, initial customer markets, audience/age policy, policies and adviser/review needs.
- Pilot tasks, success criteria, feedback collection, support ownership and launch go/no-go evidence.

Use simple managed services where appropriate. Custom infrastructure, native phone apps, more game modes and public leaderboards can wait until pilot evidence supports them. Daily/all-time leaderboards later require accounts, comparable course/profile/conditions rules and trusted score validation.

## How we will use this

During product refinement, keep these requirements visible without treating every future service as work to build now. Before the pilot, confirm its access, privacy, support and measurement arrangements. During launch preparation, assign each gate an owner, evidence and unresolved issues, verify current official provider/legal/tax details, and close the applicable items before public membership launch. No launch date is committed yet.

## Explicit wind validation before paid launch — pending

Tyler requested this check after reviewing how the current wind estimate works. Software tests verify the implemented formula, not real-world displacement accuracy.

- Compare predicted carry/lateral movement with credible, appropriately licensed launch-monitor or ball-flight data and golfer/coach review.
- Cover crosswinds, headwinds and tailwinds across wedge/iron/long-club distances, different flight heights and straight/draw/fade profiles. Check whether spin/shape interaction needs a better model.
- Evaluate and document acceptable error and known limitations. Current coefficients (at standard height, roughly 10 yd sideways or short / 6 yd longer for 10 mph at 150 yd) are illustrative estimates, not measured calibration.
- Revisit the coefficients or model as evidence warrants; retest target rankings and teaching feedback, not just endpoint movement.
- Until validated, describe wind yardages as training estimates. If coefficients change, version conditions/results so historical progress and competitive scores remain interpretable.

## Early preparation: local recovery and performance baseline (17.3)

- Implemented manual local backup download and preview/replace restore for retained histories, saved rounds, settings and learning completion. Tests include malformed imports, storage-failure rollback and preservation of the selected course ball. See [backup instructions](docs/PROGRESS-BACKUPS.md). This contributes local-recovery evidence; it does not replace production database backups or account access checks.
- Added repeatable cold-load and shot-calculation measurements with desktop and slowed phone Chromium configurations. See [performance baseline](docs/PERFORMANCE-BASELINE.md). Slowed calculations need attention before claiming broad older-phone support; layout checks do not establish speed.
- Next performance work: reduce long main-thread blocks during exact target search, assess background calculation with a compatible fallback, and remeasure seeded results to retain grading consistency. Validate real Safari/iPhone and Android devices. Confirm compression/CDN caching, traffic limits and rollback with the production host before running an authorized production load test.
- Performance reports contain development timings only. No player telemetry, accounts, paid services, external monitoring or hosting changes were introduced in this round. All production gates above remain pending.

## Calculation isolation and background execution (17.5)

Committed shots now use a shared pure calculation core, with background module-worker execution and an established page-thread fallback. Tests compare seeded outcome arrays, targets, costs and grades, cover failures/timeouts, and check mode gating/retry/course persistence in Chromium. This contributes scheduling and reliability evidence, not real-phone certification. See [design](docs/SIMULATION-REFACTOR.md) and [responsiveness measurements](docs/WORKER-PERFORMANCE.md). Verify module imports, CSP/worker permissions and matched release assets on the production host. Initial lesson/Introduction preparation and SVG cloud rendering remain future profiling candidates; all production launch gates remain pending.

## Later tournament proposal — October 22, 2026

The roadmap now includes open-entry events with no paid membership or entry fee required, a fixed shared course/profile/conditions, and separate lowest-golf-score and highest-average-decision categories. One eligible attempt may resume after disconnection using server-saved commitments/outcomes; it cannot restart or reroll. Begin with a no-prize event test. Any later prizes require explicit approval, official rules/eligibility/tie/deadline decisions, a budget and applicable legal/tax/provider review. Two- or four-day formats remain later extensions. These events depend on trusted accounts/scoring and do not block the combined free-and-paid membership launch. See [the tournament plan](PROJECT-PLAN.md#planned-open-entry-tournaments--added-october-22-2026).


Tournament access clarification: event participants must be able to play the entire event course without a purchase or paid membership, regardless of normal free-play hole limits. A free account may be required. Validate this access path before any event; prizes require the existing review and approval gates.
