# Carry dispersion: public evidence and model recommendations

Public-source review resumed after environment publication. Sources accessed November 5, 2026 UTC. **No gameplay, grading, club policy or distribution defaults changed.**

## What we learned

The owner's concern is well founded as a model-design question: a golfer's stated good-strike yardage need not be the middle of every attempted shot. Arccos explicitly uses a higher percentile for one distance statistic and club-dependent percentiles for others. Both Arccos and Shot Scope distinguish well-struck distances from mishits.

However, this review did **not** retrieve a representative shot-level amateur carry dataset that establishes the correct short/long percentages, handicap-specific widths, 20/40-yard tail frequencies or club-to-club spread changes. It does not validate either our current symmetric defaults or a universal P70 replacement. Public definitions support a better experiment; they do not supply all of its parameters.

Nineteen substantive public pages were read and logged. This is a bounded source review, not an exhaustive systematic literature review. Search/discovery pages are not counted as substantive evidence. No provider contacted, account accessed, data purchased or commercial reuse license obtained.

## Strongest sources and what they establish

| Source | Finding | What it does not establish |
| --- | --- | --- |
| [TrackMan: What is Carry?](https://www.trackman.com/blog/what-is-carry) | Carry is distance to where the trajectory returns to launch height, often called carry-flat. | It is not always the actual first ground contact on elevated terrain; no amateur error shape. |
| [TrackMan: Map My Bag, May 2025](https://www.trackman.com/blog/know-your-numbers-introducing-map-my-bag-in-tps-10-1) | Shows carry and total separately; describes a rolling average of up to 30 shots per club and carry/total dispersion views. | No published stock percentile, all-mishit inclusion guarantee or reliable rare-tail sample. Six suggested starter shots cannot validate tails. |
| [Arccos: Driving Distance Number, June 2026](https://support.arccosgolf.com/hc/en-us/articles/50224911416212-What-Does-the-Driving-Distance-Number-Mean) | Explicitly defines the player driving-distance statistic as **P70 carry** across tracked par-4/par-5 tee shots: 70% at/below, 30% farther. Suggests ten rounds for stability. | This is a provider statistic definition, not evidence that all golfers naturally choose P70, nor a rule for every iron or Par-3 tee shot. Carry measurement/reconstruction method is not explained. |
| [Arccos: Club Overview, June 2026](https://support.arccosgolf.com/hc/en-us/articles/50225781366164-Understanding-Your-Club-Overview-Stats) | Describes good-contact Smart Distance as a **club-dependent percentile**, with drivers lower and wedges higher, filtering mishits and partial swings. | Exact percentiles, retained-shot denominator and raw error distributions are unpublished. |
| [Arccos: Smart Distance support](https://support.arccosgolf.com/hc/en-us/articles/360036475132-What-is-Smart-Distance-Smart-Range-and-Longest) and [2021 release](https://www.arccosgolf.com/blogs/community/arccos-launches-new-smart-club-distances) | Describes well-struck outcomes with mishits, unusually long shots, chips and recoveries excluded; sparse club data can be AI-predicted. | A filtered good-shot yardage is not the distribution of all intended full swings. Large platform shot counts do not make unavailable raw data available to us. |
| [Shot Scope: P-AVG](https://support.shotscope.com/hc/en-us/articles/360000810145-What-is-the-P-AVG-Performance-Average-Distance) | Removes long and short outliers to describe a well-struck distance; positional shots and shots inside 50 yards are excluded. | No carry/roll separation, exact filter thresholds, percentile or all-strike distribution in this article. |
| [TrackMan: Consistency Number](https://www.trackman.com/blog/how-to-utilize-the-consistency-number) | Defines consistency as standard deviation; gives one competitive junior's carry SD of 4.8 yards at a 70-yard target and 3.5 at 80 yards. | Partial-distance junior examples cannot set 20-handicap full-iron spreads; no raw shot sequence or sample size supplied. |
| [Practical Golf: Ball Control](https://practical-golf.com/golf-ball-control) | A near-scratch golfer reports 20 indoor shots per club: SW target 105 yd, observed 97–117; 8i target 160, observed 148–171; 5i target 195, observed 178–201. | One self-described good-striking, low-pressure mat session. Min/max of 20 is not a central interval, universal bound, tail rate or population estimate. Iron distances are described as where shots landed; underlying raw coordinate definitions cannot be independently checked. |

### Provider wording needs care

Arccos's [Distance Distribution](https://support.arccosgolf.com/hc/en-us/articles/50225607598612-What-Is-Distance-Distribution) page calls Smart Distance the “most common carry,” whereas Club Overview calls it a percentile. A mode and a percentile are different mathematical quantities. Historical Smart Distance descriptions also use “well-struck” and “true average.” We should not treat these labels as interchangeable or silently resolve the inconsistency by guessing an algorithm.

Newer Arccos pages explicitly call values carry. It would therefore be inaccurate to dismiss every current Arccos value as total distance. Equally, the pages reviewed do not explain how those carry values are measured or reconstructed from on-course tracking. Treat them as **provider-described carry with unknown measurement methodology**, not verified launch-monitor observations.

Arccos [normalizes environmental effects](https://support.arccosgolf.com/hc/en-us/articles/19008593261972-What-is-Normalized-Smart-Distances), and users can [edit shot inclusion](https://support.arccosgolf.com/hc/en-us/articles/4407629857556-How-do-I-included-or-excluded-shots-in-my-Smart-Distance). Any future export needs raw/normalized status and inclusion flags. Otherwise wind and mishits can be omitted or counted twice.

## Answers to the owner's questions

**Should more full-shot attempts finish short of stated carry?** Plausible and supported as a distinction between good-strike reference and all-strike outcomes. Not established quantitatively for our standard profiles. A mishit component can produce extra short outcomes, but we still need frequency and severity by club/player.

**Is P70 reasonable?** It is a real provider convention for the Arccos driving statistic. It is a defensible experimental candidate, not an empirically validated universal iron setting. The club page explicitly says percentiles vary.

**Are so many 20–40-yard long carries realistic?** The review does not verify our current frequency. The current owner-example model's symmetric SD around 16.26 yd remains illustrative. No retrieved source establishes its long tail as representative of a 20-handicap golfer. Lack of evidence is not evidence that those shots are impossible; unusually long contact/flyers, wrong club, wind, rollout and measurement error must be distinguished rather than pooled.

**Does the proposed 150–180 range around 170 make sense?** It can be a hypothesis, but define coverage first. A 20-shot observed range, a central 80% interval and a hard limit are different. The small scratch example gives context, not sufficient grounds to impose that range on every handicap.

**Should left misses be long and right misses short?** No retrieved source establishes a universal correlation. [Arccos bias documentation](https://support.arccosgolf.com/hc/en-us/articles/50225732640916-What-Is-Directional-Bias) is club-specific and uses reference lines that need not equal actual intended aim. Shot shape, handedness, loft/contact and lie can change the relationship. Keep correlation player/club-specific unless measured evidence supports defaults.

**Do professional tables validate our dispersion?** No. [TrackMan Tour Averages](https://www.trackman.com/blog/introducing-updated-tour-averages) reports broad professional sampling, mixed range/competition context and mean quantities. Between-player averages cannot identify within-player variance/skew or amateur mishits. Historical Tour expected-strokes tables address next-shot cost, not execution-error distributions.

**Do short-of-green statistics prove short contact errors?** No. Club selection, chosen target, lie, wind and green geometry all contribute. [Practical Golf's iron overview](https://practical-golf.com/golf-iron-distances) gives useful aggregate context, not a club-relative carry-error distribution with known prior intent.

## Why changing the anchor alone is not enough

The following are **mathematical illustrations, not fitted recommendations**. For a stated 170-yard carry, use the current owner-example SD of 16.2587 yd only to show the effect of changing assumptions. The last row instead asks what a normal distribution with 150–180 as its central 80% would imply.

| Hypothetical normal model | Mean carry | Central 80% | Probability >20 yd long | Probability >40 yd long |
| --- | ---: | ---: | ---: | ---: |
| Stated carry is median | 170.0 | 149.2–190.8 | 10.93% | 0.694% |
| Same width; stated carry is P70 | 161.5 | 140.6–182.3 | 3.97% | 0.142% |
| Hypothetical 150–180 central 80% | 165.0 | 150.0–180.0 | 1.63% | 0.006% |

The second row reduces long outcomes but keeps the same width, moving more outcomes far short. The third changes both anchor and width; its stated 170-yard reference is about P66.5, not P70. None includes a mishit mixture or hard cap. These rows cannot be adopted as calibrated defaults.

Reproduce with `python3 scripts/illustrate-carry-anchors.py`; see [numerical output](CARRY-ANCHOR-ILLUSTRATIONS.json).

## Recommended model work, in order

1. **Write an explicit carry contract.** Decide whether the user's input means typical good-contact/full-shot carry or all-attempt average. A stock-club reference and a chosen partial-shot target are separate concepts; moving the carry slider must not assume every arbitrary partial distance has identical good-strike semantics.
2. **Keep club and distribution changes separate.** Use the isolated club prototype and fixed-club comparisons. Our prior [sensitivity study](CLUB-SENSITIVITY-STUDY.md) found that club policy itself can reverse the front/center preference. Adding short bias does not fix an unvalidated hybrid/iron spread jump.
3. **Prototype alternatives without changing production.** Compare current symmetric reference; shifted-reference candidates across a range of percentiles; and a good-contact-plus-short-mishit mixture. Label every unmeasured parameter as exploratory. A P70 candidate belongs in the comparison, not automatically in the shipped model.
4. **Acquire qualifying data before choosing numbers.** Prefer opted-in launch-monitor exports from multiple players and separate clubs, with stock carry recorded before collection. Keep valid mishits, identify deliberate partials/recoveries and sensor failures, record lie/ball/conditions and intended direction. Separate observed carry-flat, actual landing and total. No account access or collection has been initiated.
5. **Validate by player and session.** Compare per-player short fraction, stock percentile, central intervals, long/short tails and lateral-depth correlation; hold out players/sessions. Fit good-contact and mishit components only where data identifies them. Do not fit hundreds of correlated shots from one golfer as hundreds of independent golfers.
6. **Recheck decisions and feedback.** Evaluate front-water, tucked flags, long approaches and doglegs at all handicaps. Compare regret and near-equivalent choices, not just exact optimizer position. Review contours: [Arccos uses approximately 68%](https://support.arccosgolf.com/hc/en-us/articles/50225866664468-How-Do-I-Read-the-Dispersion-Graph); our current 80% Gaussian-core contour is a different construction. If a mixture is adopted, test actual simulated coverage rather than assuming the old oval remains valid.
7. **Preserve historical behavior.** Standard club/flight snapshots are now implemented, but an altered distribution or club policy still requires versioned evaluator behavior, worker consistency, backup/resume and grading tests before deployment.

A practical initial collection is 30–50 intended full shots per selected club/player, across sessions, retaining real mishits. This is a starting protocol, **not enough to calibrate rare tails**. With zero events in 50 attempts, a rough 95% upper frequency bound is still about 6%. A 0.1–1% tail requires much more evidence. Any provider dataset also needs an explicit commercial-use basis; public webpage access grants no blanket dataset license.

## Search/access limitations

TrackMan and Arccos articles and Shot Scope support pages were accessible after environment publication. Shot Scope's statistics blog returned HTTP403; its cause was not established and no bypass was attempted. Google search returned a redirect/JavaScript shell; Bing returned overly broad discovery results; Google Scholar returned HTTP429. These are discovery limits, not proof that relevant literature does not exist.

PubMed search and Crossref metadata identified studies concerning pitching practice, music/stress in collegiate golfers, disability categories and attention/accuracy. Individual PubMed records returned a cookie challenge in this session, and PMC search routes did not yield the relevant article bodies. **No independent full-text result from those leads was used for calibration.** Search metadata alone cannot establish participant-level carry tails. Example leads: DOI `10.3390/ijerph191912550`, `10.7717/peerj.13557`, `10.3389/fspor.2026.1748973`. Their populations/tasks may also be unsuitable for our target profiles even if full text becomes available.

## Evidence artifacts

- [Extraction spreadsheet](DISPERSION-EVIDENCE.csv): 19 pages, claims, reported methods and limitations; unknowns explicitly marked.
- [Source manifest](DISPERSION-SOURCE-MANIFEST.json): canonical retrieved URLs, page titles and HTML SHA256 hashes; full page copies remain temporary, not redistributed in the repository.
- [Source/access register](DISPERSION-SOURCE-REGISTER.csv): preserves the earlier blocked attempts and appends successful reads/current limitations.
- [Collection and analysis protocol](DISPERSION-RESEARCH-PROTOCOL.md).

**Decision:** evidence supports revisiting the carry-reference design and testing short-mishit alternatives. It does not yet justify claiming that a new default distribution is empirically calibrated or setting a universal percentile/tail width. Keep live scoring unchanged while preparing the controlled comparison and a realistic data path.
