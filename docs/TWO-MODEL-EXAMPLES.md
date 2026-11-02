# Two fixed model examples for owner review — 17.18.4

Open `model-owner-review.html` on a local preview or the existing hosted app after publication. It is an isolated, read-only page with target buttons, equal-scale hole/close-up diagrams and original outcome percentages. It is intentionally not added to the main navigation, does not run live optimization, and does not write browser saves or collect answers. Reply in the conversation with your target choice and reasoning.

Both cases use the illustrative 20-handicap profile, calm/normal conditions, 4,000 draws (seed 7142026), model v8 and surface-v2 rollout. Dots are 500 sampled final positions; tabulated percentages use all 4,000. Geometric reference lines are not ball-flight clearance or simulated future shots.

## 1. Long Par-3: front of green versus center

Fixed layout: `split`, seed `347430499`, about 181.9 yd to the flag.

| Target | Carry and club | Estimated strokes to finish | Green | Recovery woods |
| --- | --- | --- | --- | --- |
| A: flag | 181.9 yd, 3 wood | 3.763 | 24.2% | 15.6% |
| B: center | 179.6 yd, 3 wood | 3.578 | 30.1% | 6.1% |
| C: sampled recommendation | 168.0 yd, hybrid | 3.538 | 30.6% | 4.8% |

**Correction to the initial concern:** C lies on the front of the green. It is not a layup short of the green. B and C are only about 0.04 modeled strokes apart; aiming at the tucked flag is the larger difference.

A controlled sweep at the green-center heading exposes automatic club-choice sensitivity: carry 168.5 yd uses a hybrid and costs about 3.534; 168.51 yd switches to a wider 3-wood pattern and costs about 3.588. This is a discontinuity in the illustrative club/pattern assumptions, not measured evidence that an extra 0.01 yd causes that real-world cost. Do not silently smooth it or change grading before discussing club-choice policy and evidence.

Questions:

1. Would a hybrid toward C or a 3-wood toward B be your sensible choice, and why?
2. Is a short miss a manageable chip on the depicted geometry, or is relevant green shape/recovery context missing?

The model includes distance, lie, generated woodland severity and penalties, but not explicit short-side recovery geometry or slopes. The outcome reference uses Tour data, not handicap-conditioned recovery skill. Existing independent-draw checks preserve C's small advantage but cannot establish those assumptions as realistic.

## 2. Sharp dogleg: earlier fairway versus corner

Fixed layout: `sharp-dogleg`, seed `5`, about 417 yd to the flag.

| Target | Carry and club | Estimated strokes to finish | Fairway | Recovery woods |
| --- | --- | --- | --- | --- |
| A: earlier fairway | 140.2 yd, 6 iron | 4.715 | 88.7% | 4.8% |
| B: sampled recommendation | 209.5 yd, driver | 4.466 | 51.8% | 24.3% |
| C: straight at 210 | 210.0 yd, driver | 5.219 | 1.4% | 96.2% |

A is an illustrative practical layback at the fairway center around 140 yd forward, not a claim to be the optimized best layup. It provides a more useful comparison than only contrasting B with C, which finishes almost entirely in woods.

The model favors B over A by about 0.249 strokes (about 25 per 100 similar decisions under its assumptions). B's intended target is fairway. However, the tee-to-B straight ground projection crosses **Right open woods**. Tree height and airborne collisions are not simulated, so that crossing is a flag for judgment, not proof of a tree strike. The target-to-flag projection itself does not cross recovery woods in this geometry; misses may still leave blocked recovery shots.

Questions:

1. Is B a realistic reachable route for this profile over/past those trees, or would you choose A?
2. Would likely misses near B usually leave a playable next shot, or require a sideways recovery?

Later-shot costs depend on distance and lie with generic recovery assumptions; they do not explicitly simulate the next route or enforce the selected handicap's club reach through the rest of the hole. This limits how confidently we can call B best in real amateur play.

## Verification and reproduction

- Re-ran the six-case audit against the current unchanged model. Existing compared target costs exactly match the retained v8 report.
- Re-evaluated all displayed targets; counts sum to 4,000, all sampled positions are finite and each display includes 500 dots. The new earlier-fairway comparison is calculated from the same draws and model.
- Three independent 4,000-shot draw sets preserved the main comparisons: center versus front on the Par-3 differed by about 0.041–0.047 strokes; the earlier-fairway dogleg option versus the corner differed by about 0.247–0.253. This checks sampling stability, not the physical assumptions.
- Four focused native files passed: strokes-baseline, approach-layup-costs, tradeoff-costs and long-par3.
- Syntax checks passed. Chromium over HTTP at 1440/390/320 px checked both examples, all target buttons, diagram rendering and no page overflow/errors. Screenshots were inspected.
- File-URL access was blocked by the managed browser's policy, so local-file opening was not verified. The page is self-contained, but serving over HTTP is the verified route.
- Gameplay code, scoring rules, history and current runtime asset release `4486c61858d0a5ac` are unchanged. The full app suite was not repeated for this read-only artifact.

Reproduce:

```sh
node scripts/model-validation-review.mjs > /tmp/current-model-cases.json
node scripts/prepare-owner-model-review.mjs /tmp/current-model-cases.json
```

The generator writes `docs/TWO-MODEL-EXAMPLES.json` and `dist/model-owner-review.html` from `scripts/templates/owner-model-review.html`. Do not hand-edit generated outputs. Browser reproduction is in `scripts/browser-review/owner-model-review.cjs`.

**Next decision:** gather the owner's golf reasoning, distinguish a missing factor from a surprising valid tradeoff, and agree any model/club-selection policy changes before implementing them. These examples do not complete empirical validation or source-table verification.
