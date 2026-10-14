# Wind and firmness — first teaching model

The golfer selects the intended carry and target for their usual shot. Conditions never move that target or automatically correct aim. Wind modifies the simulated carry landing; firmness modifies rollout afterward. The same profile, conditions and seeded misses are used by the golfer's shot and the sampled comparison targets.

## Settings

- Easy: calm wind, normal ground, exactly the previous shot outcomes and rollout rules.
- Medium: steady 3–6 mph wind, eight possible directions, soft/normal/firm ground.
- Hard: steady 8–15 mph wind, eight possible directions, soft/normal/firm ground.

Conditions are visible before commitment as an arrow pointing where wind blows, speed, direction in relation to the hole and ground firmness. No adjusted landing cloud, center flight, suggested aim or exact predicted total is shown beforehand. The existing Easy nominal rollout cue remains; it is suppressed in Medium/Hard. The intended carry and chosen club are not automatically altered by wind.

## Wind calculation

Coordinates are yards: x right of the golfer and y down the hole. Wind components are mph in those fixed directions; they are projected onto and across each candidate aim heading. This ensures comparison targets experience the same wind rather than a different wind relative to each target.

Exposure = (actual sampled carry / 150)^1.15 × clamp(illustrative height / 25, 0.5, 1.7).

Crosswind displacement is 1 yard per crosswind mph times exposure. Headwind shortening is 1 yard per headwind mph times exposure; tailwind increase is 0.6 yard per tailwind mph times exposure. Along-line change is bounded to −25% / +20% of sampled carry. For example, at 150 yards and 25 yards illustrative height, 10 mph crosswind adds 10 yards lateral movement. It adds to start, curve, bias and random misses; it does not change the saved swing shape. Opposing wind can reduce the net fade/draw movement, and sufficiently strong wind can move the final landing past the original line.

These coefficients are deliberately illustrative, bounded training estimates. They are not fitted to launch-monitor measurements and should be reviewed with golfers/coaches before public claims of accurate wind yardages. They do not model spin, gusts, aerodynamic curvature, wind varying with height, rain or elevation changes. The visual tracer is an illustration reaching the exact scored landing and finish, not a flight-physics prediction.

## Ground calculation

Easy preserves the old stock-roll behavior exactly. For Medium/Hard, soft/normal/firm ground multiplies stock roll by 0.35 / 1 / 1.6. A stock-zero-roll approach gains rollout only on firm ground: min(8, intended carry × 0.03) / the bounded height factor. Thus firmness can matter near a green without adding approach roll to the Easy baseline.

Roll from rough is 35% of the resulting roll on fairway/green. A landing in water, OB, sand or recovery vegetation has no roll. A rolling ball entering sand or recovery vegetation stops at its first contact. Existing water-contact rules stop the ball at entry and apply the authored drop/penalty. Finishing surface and rollout are shared by scoring, course results, center-flight markers and review contours. The rollout direction follows the aim heading. Surface friction changes during a fairway-to-green roll, slope, bounce and landing-angle physics are not modeled.

## Sessions and comparisons

Free-practice conditions are seeded by hole identity and difficulty, independently of random shot draws. Retry and new shot samples keep them. New scenarios create new conditions. Learning rounds and courses store conditions per slot; their selected difficulty stays fixed after the first recorded decision. Assessments store one set of conditions across all ten decisions. Changes before the first recorded decision regenerate the round using its same layout seed. Lessons use their existing calm fixtures and restore the previous conditions on exit.

Saved standard/custom profile snapshots retain difficulty and the `wind-firmness-v1` conditions version. Existing calm saves remain supported. Course reviews preserve their exact pattern, conditions, selected ball and finish on reload. Progress entries store the actual conditions; comparison groups separate profile/handicap and difficulty under decision-model-v7. Wind can vary between scenarios within a difficulty group, so those trends remain descriptive rather than proof of measured improvement. Earlier progress is retained and labeled as a previous model. Retry checks also require the exact condition snapshot.

Short-game/putting reference costs and course finishing distributions remain the existing historical Tour estimates. Conditions affect the played target decision, not an invented personal short-game model. Conditions do not yet alter tree density or hole geometry.

## Feedback

Feedback describes the approximate center-flight wind shift after commitment, explains soft/firm roll and identifies that the target remained fixed. The existing hazard/proximity/club tradeoff analysis uses the resulting condition-aware outcomes. Assessment feedback remains deferred to the final report; course target coaching remains separate from the selected-ball score.
