# Course illustration study 02

Open visual-prototype.html on the static site. This is a separate read-only page; the simulator's renderer, model, scoring and stored data are unchanged. It does not replace the live course graphics. The later playable trial is available separately from Menu → Graphics Preview.

Preview images:

- [Current and proposed side by side](visuals/course-style-comparison.png)
- [Proposed close-up](visuals/proposed-course-closeup.png)

The fixed example is the woodland tucked approach, seed 17. Its existing world geometry and camera projection are used in both views. Current art is an SVG capture of the production renderer, with interface callouts removed so the same prototype labels can be shown over both. Proposed art uses the same polygons, green ellipse, boundaries, tree placements, height/spacing and pin location. It changes the drawing style: softer lighting, a subtle fringe, restrained mowing, shaded sand, reflective water and layered tree canopies. The prototype's camera crop and close-up apply equally to both styles.

Use Proposed, Current or Compare both; toggle labels and the optional aim reference; choose Close-up. Distance labels are approximate direct distances to the nearest hazard edge, not wind-adjusted carries. The optional aim marker is a neutral visual reference at the green center, not an optimizer recommendation. There are no shot controls, grades or paid features on this page.

Review the visibility of the flag, green, water, sand and boundaries on a phone as well as a computer. The goal is to decide the art direction before applying it to dynamic holes and every environment. Production integration would still need touch-aim alignment, landing-view overlays, performance and actual-device checks. This prototype does not establish those integration results.

Validation: syntax checks and isolated Chromium checks at 1440, 390 and 320px cover both views, compare mode, close-up, label/aim toggles, no horizontal overflow, no uncaught page errors and unchanged browser storage. No full simulation suite was rerun because no existing application files or calculations changed. The added browser check is scripts/browser-review/visual-prototype.cjs (use the same Playwright/base-URL environment variables as the other browser checks).

To preview through Work, provide the complete repository ZIP and ask it to serve visual-prototype.html alongside the existing app. Do not replace index.html with the prototype. The screenshots can be reviewed on GitHub without deploying anything.


Second refinement: irregular smooth canopy outlines now vary deterministically by existing tree position, with restrained interior foliage shading and visible branches. Sand uses a clipped inset basin and darker upper lip. Water uses broken ripples, soft reflection shapes, a shallow edge and low bank grasses. All material detail is clipped to the original hazard polygons; the cosmetic bank grasses do not change the modeled edge. Screen-coordinate paths use two-decimal precision to keep the static SVG compact. Browser verification also checks the exact hazard boundary point strings against the original scene projection and preserves the existing tree count. The simulator renderer is still unchanged.
