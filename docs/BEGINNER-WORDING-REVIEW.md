# Beginner wording review — 17.16.2

Read the quick Introduction, course-management tutorial and four lesson scripts from a beginner's perspective. Kept useful copy, the dartboard and flashlight analogies, numeric examples and golf-rule qualifications.

Targeted improvements:

- Explain laying back before comparing the longer next shot.
- Define a tucked flag as a flag near the edge of the green.
- Explain that short-sided means little green to work with, not simply falling short of the green.
- Replace “Commit practice click” with “Try Commit & shoot” and explain that this exercise is not graded.
- Explain the assessment as a starting point to compare with later.
- Replace “best sampled target” with the best target the app found among the choices it tested; this still does not claim a guaranteed or globally perfect target.
- Clarify that water percentages include shots outside the displayed outline.
- Remove repeated wording in the Introduction footer and make lesson catalog descriptions more concrete.

Only wording changed. Model calculations, fixtures, completion storage, lesson sequence and historical references remain unchanged. The owner's older wording-review documents remain frozen.

## Verification

- `npm run check`: passed.
- Native checks for controls tutorial, beginner setup, introduction UI, tutorial UI and tutorial graphics: all five test files passed.
- `git diff --check`: passed.
- Browser/phone layout was not reverified: starting the local HTTP preview server was blocked by the execution environment's socket permissions. Longer captions should be checked on the deployed phone preview.

## Applying alongside Work's preview

The recovery-area preview created separately in Work is not present in this repository checkout. Preserve that preview when applying these changes; do not replace Work's newer app wholesale with this branch. Merge the wording changes from `dist/controls-tutorial.js`, `dist/curriculum.js`, `dist/introduction.js` and the relevant sections of `dist/index.html` into the latest Work version.


Work validation: 11 targeted native tests passed, including complete guided-lesson flows through the hashed deployment modules. Browser-sized iframe checks at 320×740 and 390×844 inspected Introduction opening text, revised catalog copy, approach and laying-back explanations, scrollable content and no horizontal page overflow. These are sampled layout checks, not physical-device or every-slide visual coverage. Heavy rough preview assets and menu entry were preserved.
