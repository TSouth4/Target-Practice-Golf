# Distance-and-lie scoring reference

The app now uses a documented historical PGA TOUR expected-strokes reference, rather than the earlier hand-tuned distance formula and fixed rough/bunker/tree surcharges.

## Data and provenance

- Off-green reference: Mark Broadie, *Assessing Golfer Performance on the PGA TOUR* (2012), Interfaces 42(2), 146–165, Table B.1; ShotLink period 2003–2010.
- Putting reference: Mark Broadie, *Putts Gained: Measuring Putting on the PGA TOUR* (2011), Figure 1 and accompanying table.
- Source links are included in `dist/benchmark-broadie.js` and the app’s model explanation.
- The distributed transcription is adapted from [mixxen/golf-strokes-gained](https://github.com/mixxen/golf-strokes-gained/blob/1e83f0c6f1aa55fc89253341dd52eb44b53851c7/js/benchmark-broadie.js), commit `1e83f0c6f1aa55fc89253341dd52eb44b53851c7`. Retain its MIT notice in `third-party/broadie-benchmark-MIT.txt` and the deployed benchmark module header. The one-foot tap-in anchor is an explicitly documented supplement to the published putting points, which begin at two feet.
- The primary PDFs could not be downloaded in this environment (domain access returned 403). Validation checks the cited transcription and selected reference values, not a fresh extraction from the original PDFs. Before public launch, independently check the transcription against those papers and validate recommendations with a golf coach. This is not a current, official or event-adjusted PGA TOUR statistic.

## Calculation

A standard strokes-gained calculation is:

`SG = baseline at start − stroke taken − penalties − baseline after the shot/relief`

The simulation compares targets at the same starting position, so the starting baseline cancels. Lower expected shot-plus-remaining cost is the better target under the selected assumptions. The displayed difference is decision cost against the best sampled target, not observed strokes gained from a real round.

The app retains its repeated-strategy expectation for OB: the physical stroke and stroke-and-distance penalty cost two strokes, then the same strategy repeats. That is a policy comparison, rather than the official per-stroke SG treatment of one OB shot. Water uses the existing authored drop point and rough lie after relief. Subsequent shots are represented by the reference table, not separately simulated on this hole, so future creek crossings and unique recovery geometry still need review.

Fairway, rough, bunker (sand), recovery (trees) and green each use a separate distance curve. Off-green distances are yards; putting distances are feet. Intermediate points use linear interpolation. Off-green distances outside 10–600 yd and putting distances outside 1–90 ft clamp to the nearest endpoint; collected results count these events and show a limitation in the lesson. We do not extrapolate measured values beyond the source range.

Reference examples:

| State | Reference strokes remaining |
| --- | ---: |
| Fairway, 75 yd | 2.735 |
| Fairway, 100 yd | 2.800 |
| Fairway, 150 yd | 2.945 |
| Fairway, 175 yd | 3.055 |
| Sand, 20 yd | 2.530 |
| Sand, 40 yd | 2.820 |
| Green, 10 ft | 1.610 |

A 25-yard layback from 75 to 100 yd adds 0.065 reference strokes; 150 to 175 adds 0.110. These demonstrate distance-dependent costs without inventing a fixed price per yard or bunker miss.

## Player and scenario adjustments

Handicap still selects an illustrative shot dispersion and club-distance profile. It does not select a measured handicap-specific putting/recovery table. Costs combine that shot distribution with the common historical Tour reference for subsequent play; they are not a prediction of a 20-handicap player’s hole score.

Forest density scales the recovery-table premium above fairway, preserving the existing asymmetric woods lesson. Custom cost controls add explicit adjustments: rough/sand/recovery and putting offsets; a fairway 150-yard adjustment tapered to zero at the ball; and an optional extra distance cost beyond 150 yd. Defaults leave the reference unchanged apart from forest severity. These adjustments are simulator assumptions, not empirical player data.

Earlier custom cost values have different meanings, so they reset for the new baseline. Their original values are retained as `previousMemberCosts` in browser state. Personal clubs remain saved. Completed older reports remain readable with a previous-model notice; unfinished older rounds restart and history is grouped under a new scoring version.

## Validation scope

Tests cover published reference examples, units, interpolation, range limits, differing wedge/iron layback costs, distance-dependent sand costs, custom offsets, complete penalty/recovery cost accounting, and a reachable front-water approach. Browser checks cover lesson rendering and complete learning/assessment flows. Personal golfer/coach calibration, full future-shot obstacle simulation, wind and firmness are outside this update.
