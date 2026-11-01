# Fullscreen hazard-label clearance — 17.18.3

A consistency review found right-side desktop hazard labels could sit behind the Intended Carry panel. They now stop at least 12 CSS pixels before the panel when fullscreen is active. Placement uses the panel's measured screen position converted into the course SVG coordinates; it does not change hazard positions, terrain distances, targets or shot calculations. Connector lines still point to their original terrain locations.

Resize and target-zoom changes redraw labels immediately so their clearance stays correct. Normal-view label placement and the existing phone marker system remain unchanged. The previous centered desktop yardage strip is retained.

## Verification

- Syntax checks passed.
- Focused native checks passed for aim zoom, carry controls, assessment note secrecy, Practice session persistence, dogleg distances, conditions UI and legacy ground rollout.
- Chromium at 1440×900, 1920×1080, 1024×768, 761×900 and 1280×720 verified all right-side desktop label boxes remain at least 11 px clear (allowing 1 px rounding) after actual resizing. All label text remained identical.
- Target zoom preserved the measured 12 px gap. Fullscreen/zoom exit preserved saved state; Commit and Retry retained the same shot seed.
- Existing information-parity checks passed at 1440, 390 and 320 px, including normal/fullscreen controls and assessment feedback staying hidden during the test.
- A desktop screenshot was inspected. This is targeted presentation verification, not a new full-suite or physical-device run.

Browser reproduction: `scripts/browser-review/hazard-label-clearance.cjs` using the existing Playwright/base-URL settings.

Asset preparation generated complete release `4486c61858d0a5ac`. Run `npm run prepare:assets` before preview/publishing and preserve older release folders as described in DEPLOYMENT.md. The branch has not been deployed and hosting identity/access are unchanged.
