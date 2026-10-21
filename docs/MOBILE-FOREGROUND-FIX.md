# Mobile full-screen foreground — 17.15.1

Tall phone full-screen viewports reveal a larger part of the scene behind the ball than the original 960×580 course illustration. The fairway stops at the origin, so that exposed area previously used the surrounding rough color (brown in the desert). A separate decorative rough-colored strip beneath the tee created a second abrupt band.

Eye-level views now continue the near short-grass color behind the origin, matching the fairway gradient's near endpoint. The extra rough strip is removed; the ball, tee and contact shadow remain. The foreground extension is decorative and ignores pointer events; the existing behind-origin aiming rejection remains in place. Hole geometry, projection/framing, targets, hazard lies, shot calculations, scores and saved formats are unchanged. The extension is not drawn in the overhead review.

Validation: syntax checks and 12 focused camera/art/layer-renderer tests passed. Chromium phone checks cover six environments at 390×844, 320×740 and 844×390, both graphics styles, flat/elevated views and rotation; they verify matching near-ground colors, ignored behind-ball taps and preserved saved settings. Existing full-screen flow checks cover native desktop full screen and phone fallback, committing/reviewing/retrying, feedback visibility, rotation and exit. This is browser testing, not a physical iPhone/Android certification.

Browser scripts: `scripts/browser-review/mobile-foreground.cjs` and `scripts/browser-review/fullscreen.cjs`, with the existing Playwright/base-URL/output environment variables. The full simulation suite was not rerun for this decorative-only fix.
