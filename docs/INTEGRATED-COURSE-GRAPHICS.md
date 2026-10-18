# Integrated illustrated course graphics — 17.15

The main simulator now starts with the illustrated style. Menu → Graphics: Illustrated switches to Original, and the same control switches back. This comparison preference lasts only for the current page session; reload starts with Illustrated. Switching changes no saved data, targets, sampled shots, results or scores. The control is disabled during shot/reveal work, just like other settings that would interrupt that sequence. The separate one-hole Graphics Preview remains available.

The shared course renderer covers unlimited practice, five-shot learning rounds, assessments, guided lessons and Par-3 Course, including elevated/flat eye views, aiming zoom, full screen, camera transitions and overhead review. Presentation changes include softer course colors/mowing, organic broadleaf canopies with varied outlines, shaded foliage in the other wooded settings, a smooth putting-surface material, sand reaching bunker boundaries and softer irregular water highlights. Mountain evergreen, coastal cypress and desert cactus silhouettes and distant scenery retain their environment-specific forms.

The production renderer preserves its existing raised-green and sunken-hazard triangle meshes, rather than replacing them with the preview's flat artwork. Those exact surfaces are also used by aiming and shot contacts. Sand and water use continuous material gradients across a single compound path containing those exact mesh triangles, avoiding internal drawing seams, conspicuous triangle patches and the inset/double bunker border. Tutorial emphasis, hazard distances, flag visibility, flights, landing cores, dots and the single selected course ball remain above the terrain. The broadleaf artwork is cached per plant and projected camera geometry so routine target changes reuse the same canopy strings; the existing layered renderer still preserves unchanged SVG nodes.

No hole-generation, shot/scoring/penalty/rollout/wind formulas, progress schemas, round schedules or backup keys were changed. Original graphics remain a reversible comparison inside this build. The owner's wording-review snapshot is untouched.

Validation:

- Chromium checks passed at 1440×1000, 390×900, 320×800 and 844×390 across all six environments. They compare every surface vertex and plant placement between styles, check identical targets/dots/grades and exact storage preservation when switching, and exercise full screen, committing, overhead/eye review, retry and lesson entry.
- A saved legacy course resumes its identical selected ball and score; switching styles leaves its complete saved storage unchanged.
- Normal-motion desktop/phone checks passed for the flight animation, fade to one selected ball, camera transition and remaining finish distance. Real Chromium touch input moves the aiming marker. Assessment checks confirm that flights appear while coaching and overhead controls remain withheld.
- The final complete automated suite passed all 232 tests. Syntax and whitespace checks passed. Two new rendering tests verify exact surface-vertex parity, finite artwork, deterministic foliage, camera changes and no plant/scenario mutation; the ten focused rendering/landscape checks passed.

Repeat browser checks with `TARGET_PRACTICE_PLAYWRIGHT` pointing to Playwright Core, `TARGET_PRACTICE_BASE_URL` to the running static server, and `TARGET_PRACTICE_REVIEW_OUTPUT` to an existing output folder: `node scripts/browser-review/integrated-graphics.cjs`. Additional existing scripts: `layer-motion.cjs`, `assessment-feedback-privacy.cjs`, `touch-aim.cjs` and `dogleg-clarity.cjs`.

Actual phone hardware and the Work-hosted deployment still need the owner's visual review; browser-sized checks are not a device-performance guarantee.
