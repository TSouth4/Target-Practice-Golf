# Carry-dispersion research — protocol and access status

**Status: preparatory work, not a completed literature review.** No public TrackMan, Arccos, Shot Scope or PGA page content was retrieved in this session. The workspace proxy denied the attempted research requests before their content could be read. Do not cite this document as empirical support for a new distribution.

## Owner's hypothesis

The owner expects a chosen stock/full-shot yardage to sit toward the longer end of ordinary outcomes for that club, perhaps near the 70th rather than 50th percentile. Mishits would therefore more often carry short. Both unusually long and unusually short shots should remain possible. The suggested 150–180 yd range around a stated 170 yd is a hypothesis from experience, not a measured bound or adopted model parameter.

The owner also wants the displayed shot pattern to represent average real play rather than only ideal contact. Standard profiles currently use illustrative symmetric carry errors, with no separate short-mishit mixture. The existing historical Tour distance/lie costs do not validate these execution-error distributions.

## Questions the research must answer

1. What does a golfer/provider mean by stock distance: self-reported full-shot carry, mean, median, trimmed mean, best strike, total distance or something else?
2. Relative to a stock carry stated **before** collecting shots, what proportion of valid full-shot carries finish short? Does it vary by golfer, handicap, club and lie?
3. Are measured distributions mainly shifted below that anchor, genuinely short-skewed, mixtures of contact types, or a combination? A 70th-percentile anchor alone does not prove skewness: even a symmetric distribution can have its stock reference above its mean.
4. How wide is the typical spread, and how frequent are 10/20/40-yard long and short carry errors? Are tails measured or artifacts of sensor/recording errors or mixed shot types?
5. Does a proposed 150–180 range describe the central 80%, 90%, all ordinary strikes, or literal minimum/maximum? Those are different claims.
6. Which errors are execution versus club/target selection? A short-of-green statistic cannot directly determine one club's carry-error distribution.
7. Are club-distance thresholds and automatic club selection causing recommendations to exploit an assumed dispersion jump?

## Evidence hierarchy and intended sources

| Source type | Useful evidence | Critical qualification |
| --- | --- | --- |
| TrackMan / launch-monitor studies | Shot-level carry, lateral carry, total, launch/spin/contact and measured dispersion, preferably amateurs with club/ability context | Public averages do not supply distribution shape. Verify normalization, range-ball corrections, indoor/outdoor setting and filtered mishits. No source content verified yet. |
| Arccos / Shot Scope | On-course club outcomes, golfers' distance-reference definitions, handicap/lie/context and filtering methodology | GPS start/end positions alone give finish displacement, not the landing point. Verify any carry field rather than treating total as carry. Do not assume access to proprietary shot data/API. |
| PGA / ShotLink / USGA / R&A | Definitions, measured pro context and published reports/data | Professional results are a useful cross-check, not an amateur 20-handicap distribution. Separate final-position datasets from actual tracked flight. |
| Peer-reviewed/public datasets | Methods, sample sizes, raw distributions and uncertainty | Check participant selection, shot intent, clubs, units, ball type, lie, weather and excluded shots. |
| Secondary instructional articles | Leads to original data and practical hypotheses | Do not promote an unsourced rule or marketing number to a calibrated default. |
| Owner/volunteer launch-monitor data | Direct comparison of self-reported stock carry with actual full-shot results | Record intent/stock reference first, retain genuine mishits, stratify by club/player and label a small convenience sample as exploratory. |

Public research only is authorized. Do not contact providers/players, buy data, access private accounts or assume commercial reuse rights. Record terms/permission requirements for any data proposed for the paid app.

## Data extraction and quality controls

Use DISPERSION-EVIDENCE-TEMPLATE.csv to record source claims and methods. Prefer shot-level observations with participant/club identifiers and a pre-existing stock-carry reference. At minimum record the following:

- Carry versus total/rollout; distance definition and yards/meters; along-line versus radial measurement.
- Full swing, deliberate partial, punch/recovery or chip; tee/fairway/rough; weather and normalization.
- Handicap/ability and club; stated stock carry; how stock carry was calculated; whether reported before the sample.
- All valid strike results, explicit tracking/sensor failures, genuine mishits and provider outlier filters separately. Do not delete short or long strikes merely to make the cloud tidy.
- Sampling balance by player, not just number of shots; dataset dates, sample size and access/reuse limitations.

A practical exploratory protocol can begin with 30–50 intended full shots per selected club per participant, with rest/normal play and all valid results retained. This is a collection starting point, not sufficient validation of rare tails: even zero events in 50 shots leaves an approximate 95% upper frequency bound of about 6% by the rule of three. Claims about 0.1% tails require far more observations and appropriate sampling.

Analyze player-relative errors (carry minus stated stock carry), normalized errors where justified, median/mean, stock percentile, central coverage, short/long rates, tail counts, skew and lateral/depth dependence. Report uncertainty and between-player variation. Do not pool all clubs/intentional partial shots into one apparent short-bias distribution.

## Model comparison plan — no default changes yet

- Retain the current model as a reproducible baseline.
- Separate **anchor calibration** (where stated stock carry lies in outcomes) from **shape calibration** (spread, skew, mishit mixtures and long tails).
- Compare empirical/bootstrap and explicitly labeled candidate distributions. Consider a typical-strike component plus genuine mishit component if the data supports it; avoid hard-capping all shots at stock carry or guessing a universal 70th percentile.
- Keep wind/firmness and rollout separate from baseline carry error; do not double-count real-world wind already present in training data.
- Control club selection in sensitivity comparisons, then test automatic club transitions separately. Re-run fixed green-center/front and dogleg examples before drawing coaching conclusions.
- Validate the displayed carry contour against the actual simulated distribution. The current outline uses the 1.794-sigma Gaussian core with the large-miss component excluded; this construction must be reconsidered for non-Gaussian mixtures. A smooth oval is not itself evidence that it contains 80% of all real shots.
- Preserve nominal intended carry as the user's decision variable. Explain how real contact shifts outcomes without turning the aiming aid into a reveal of the answer before commitment.
- Any adopted scoring-distribution change needs versioned historical compatibility, updated coaching, coverage/tail tests, all handicap/club checks and owner review before deployment.

## Access diagnosis and prepared configuration

A session-level network permission was granted, but the managed environment's separate enforced policy remains restricted to its configured domains. Four attempts—Google search, TrackMan blog, Arccos community and Shot Scope statistics—failed with `Tunnel connection failed: 403 Forbidden`. These are workspace proxy denials, not verified provider paywalls or refusals to share data.

A network-only configuration draft was successfully saved, adding the named public research/search domains below while preserving package-manager presets and all repository/script/credential settings. The tool returned `requires_publish: true`; it has not been applied or published. The owner must review/save/publish the environment configuration before the blocked web research can continue. This is environment publication, not website publication.

Prepared domains: Google/Bing/Scholar; TrackMan main/blog; Arccos main/support; Shot Scope main/support; USGA, R&A and PGA TOUR; Columbia's published golf research; Crossref, PubMed and PMC; MyGolfSpy, Practical Golf, Golf Digest and Golf Monthly. Additional publisher hosts may need narrow additions as actual sources are identified. No credentials were requested or saved.

The saved draft ID is `3e2b2752-8bb8-4606-8dea-5baa51344753~cecfgdraft_6aeb2e4103848197ada467e3cd209ca9`. Runtime access must be retested after a meaningful configuration change; saving a draft does not establish source accessibility.

## Deliverable after access is available

A source-linked evidence report with extracted carry/total definitions, measured distributions or explicit data gaps, source quality/filters, support or contradiction for the stock-percentile hypothesis, and a justified model recommendation. Distinguish observed data, mathematical implications and teaching assumptions. If public data cannot establish amateur carry tails, specify a realistic data-collection/licensing path rather than inventing calibration.

No gameplay, grading, probability defaults or saved progress changed in this preparatory update.
