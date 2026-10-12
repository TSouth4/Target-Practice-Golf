# Target Practice — first browser review

## Update: v12.6 learning rounds and assessment

All 125 automated tests passed. `rounds.cjs` completed learning and assessment rounds at 1440- and 390-pixel widths. It verified first-attempt-only recaps despite retries, reloading a recorded decision without duplication, ten decisions with no visible grades/clouds/recommendations, profile selection and locking, an aggregate per-100 value calculated from stored unrounded regret, completed-report reload, and restarting learning. The phone assessment ran in native fullscreen and exited to its final report. No page errors were captured.

A representative same-profile strategy check favors Driver on a wider Cedar layout and 3 wood before wider crossing water. Generator checks cover 7,000 layouts; all fourteen families passed commit/retry browser checks. Unrestricted-practice regression fixtures explicitly select the pilot's Unlimited practice mode. Session and assessment flow tests cover the new default behavior separately. Physical-device and Safari/Firefox checks remain outstanding; publication still happens through Work.

## Previous update: v12.5 yardages and asymmetric woods

All 116 regression tests passed, including checks over 7,000 generated layouts and repeatable asymmetric woods. Additional focused checks verify that reversing dense/open woods shifts the sampled target toward the more forgiving side, and previous-model history remains readable without relabeling it as current-model progress.

Full-screen browser checks passed on desktop, portrait phones and a landscape phone layout with no radar. Front/flag/back labels remain visible during selection; answers stay hidden and Retry restores the same situation. All fourteen generated families passed commit/retry checks. Tree height is visual, recovery-zone severity affects scoring, and automatic environments do not change outcomes. Physical-device and Safari/Firefox checks remain outstanding.

## Previous update: v12.4 full-screen practice

All 114 regression tests and syntax checks passed. `fullscreen.cjs` passed at desktop 1440×1000 with native fullscreen, and fallback layouts at 390×844, 320×740 and 844×390. Browser checks verify the viewport fills the screen, entering preserves the saved target/profile, depth and floating-map input do not reveal answers, commitment locks depth, feedback collapses without clearing results, retry removes answers, Next shot stays immersive, resize retains the mode, and Escape/button exits restore normal controls. No page errors were captured.

Local screenshots show portrait and desktop choice/review layouts. Browser-native fullscreen denial is deliberately tested; the fallback does not remove browser chrome. The camera preserves the original frame while expanding to fit the viewport, and map framing still does not depend on dispersion. Physical-device, Safari and Firefox checks remain outstanding. The hosted site has not been published by this environment.

## Previous update: v12.3 guarded pins and descriptive feedback

All fourteen families passed generated commit/retry browser checks, including the new `approach-v2` layouts. Desktop front-pond and phone side-pond checks confirmed that coaching names the actual hazard, describes the relevant short or lateral miss, shows the measured rate reduction, and retains the expandable lesson. Elevated View is hidden after commitment. The numeric score formula is unchanged; the balanced rating reads Strong decision.

Geometry tests still cover 7,000 layouts. Strategy tests compare flag aiming against alternative targets for front, side and back guarded pins, with actual water-rate reductions and expected-cost improvements. `guarded-feedback.cjs` reproduces the focused feedback browser checks. Validation remains local Chromium; the private hosted site and physical devices have not been tested by this environment.

## Previous update: v12.2.2 automatic environments

Browser checks passed at 1440-, 390-, and 320-pixel widths: the selector is absent, Next shot changes environment, Retry preserves it, and reload retains the new environment without exposing shot outcomes. No browser errors were captured. The existing geometry test confirms that scenery does not alter outcomes, and a new sequence test covers deterministic selection, all three environments, and no immediate repeats. `learning.cjs` includes the browser checks.

## Previous update: v12.2.1 learning feedback and vertical depth

All 112 automated tests and syntax checks passed. The core browser flow passed at 1440-, 390-, and 320-pixel widths. Additional checks confirmed a vertical depth control beside the course, keyboard and touch adjustment without revealing outcomes, target locking after commitment, and per-100-shot feedback after retry. No horizontal overflow or page errors were captured. The main coaching now includes the actual lesson and a suggested retry experiment. The expanded outcome table remains available from the rating.

`learning.cjs` reproduces the additional browser checks. Per-100 scaling tests cover savings, losses, no change, differences smaller than display precision, and unbounded comparisons.

## Previous update: v12.2 scenario variety and course actions

Chromium checks passed the core flow at 1440-, 390-, and 320-pixel widths, touch gestures and normal-motion commitments, phone slider and orientation checks, and commit/retry for all fourteen generated families. No page errors were captured. Desktop and phone measurements placed the action bar ten pixels below the course; it remained visible while adjusting the aiming control. Sharp doglegs rendered correctly with the expanded aiming range.

All 111 automated tests and JavaScript syntax checks passed. Automated geometry checks cover 3,500 tee and 3,500 approach layouts. A 240-scenario mixed session covered all fourteen families without identical geometry. Strategy tests demonstrate profile-dependent creek carry/layup decisions and meaningful dogleg aiming penalties.

The owner reports that the prior hosted version works after Work corrected its deployment. This v12.2 review uses local Chromium; publishing and physical-phone, Safari, and Firefox checks remain outstanding.

## Previous update: mobile improvements and tee generation

The v12.1.0 development changes passed all 106 automated tests and code checks. The original browser flow was rerun successfully at 1440-, 390-, and 320-pixel widths, with both normal and reduced motion. Additional phone checks confirmed readable terrain-only labels, fixed practice actions during scrolling, 44-pixel slider areas with finger-like touch dragging, and orientation resizing without target loss or page overflow. Each of the four generated tee families was committed and retried in a simulated phone browser, preserving identical geometry and hiding answers again. No page errors were captured.

Mobile labels are now outside the scaled scene, sliders and controls have larger touch areas, the main action remains accessible while scrolling, and the bright duplicate water outline is removed. The new geometry tests validate 2,000 tee layouts, plus representative reach and strategy checks. The measured approximately 4-second normal-motion commitments remain a local environment observation rather than a physical-phone benchmark.

Tyler reported that the core flow on the existing private site worked as expected and noted the odd water outline. The device/browser was not recorded. The existing site has not received these development changes, so that feedback does not validate the updated mobile UI on a physical phone. Safari, Firefox, and physical-device validation of this update remain outstanding.

Reproducible browser scripts are now in `scripts/browser-review/`; commands are in `README.md`. Current local evidence is in `/workspace/browser-review/`. The original findings below explain why the mobile changes were made; their screenshot/result filenames have since been refreshed by the newer checks.

## Result

The unchanged imported v12 prototype completed the core practice flow in headless Chromium 154.0.8037.57 at desktop and simulated phone sizes. No page JavaScript errors were captured. This establishes a useful browser baseline; it does not establish that Safari, Firefox, or physical phones work correctly.

Baseline reviewed: `2460ecf1501aaa45a548ebc2a9f04fd2850655e9`. The uploaded app was served locally for testing; the existing hosted site was not tested or updated. App source files were not changed.

## Checks completed

| Setup | Result |
| --- | --- |
| Desktop, 1440 × 1000, reduced motion | 9 functional checks passed |
| Simulated touch phone, 390 × 844, reduced motion | 9 functional checks passed |
| Simulated touch small phone, 320 × 740, reduced motion | 9 functional checks passed |
| Desktop, normal motion | 4 additional functional checks passed |
| Simulated touch phone, normal motion | 4 additional functional checks passed |

The nine core checks covered:

1. Answers hidden on opening; commitment requires an explicit target.
2. Real browser pointer/touch target selection and zoom do not expose answers.
3. Commitment reveals 500 selected and 250 comparison dots.
4. Clicking the course during review cannot change the committed target.
5. Lesson opens; progress records a completed first attempt.
6. Retry hides answers, requires a fresh choice, preserves scenario seed and encounter, and shows a comparison after recommitment.
7. Next shot starts a new scenario and encounter with answers hidden.
8. Custom club cancel discards a changed carry value; save retains it across reload. Reload opens free practice with answers hidden.
9. Keyboard arrow input on the direction slider selects a target without revealing answers.

The four additional checks covered double-click/double-tap preserving the pre-gesture target, map input changing target depth, normal-motion tracers appearing before answer reveal while inputs are locked, and approach filtering keeping answers hidden. The two normal-motion commitments took approximately 4 seconds each in this environment; this is not a phone performance benchmark.

Initial and final practice screens had no horizontal page overflow at the three tested widths. Screenshots of choosing, results, and the custom editor were inspected. The existing 101 automated tests passed during the preceding source review; they were not rerun for this browser-only review.

## Prioritised findings

### 1. Improve mobile hazard readability

The course fits the phone width, but labels drawn inside the SVG shrink with the scene. At 390 pixels wide, a 12-unit hazard title is roughly 4.6 screen pixels high, and its yardage is smaller. At 320 pixels wide it is smaller still. Map labels also shrink. A page can fit without its information being readable.

Recommended follow-up: show readable hazard names and yardages outside the scaled scene, or adapt their presentation for small screens. Keep those labels based only on visible terrain; do not expose shot probabilities or recommendations before commitment. Check more scenarios before choosing the final layout.

### 2. Make the main mobile action easier to reach

The initial phone page is approximately 1,400–1,500 pixels tall in these screenshots. Commitment sits near the bottom, separated from the course by the map and controls. This is not a broken flow, but a golfer must scroll between reading the hole and committing.

Recommended follow-up: test a more compact arrangement or an accessible persistent commit action, while keeping direction and depth understandable. Ask a phone user whether the current scrolling is awkward before redesigning the screen.

### 3. Check slider touch comfort

The direction and depth input elements have a 4-pixel-high bounding box, with larger visible thumbs. Keyboard input works, and this measurement alone does not prove touch interaction is broken. Finger dragging, nearby scrolling, and accidental target changes need physical-phone testing.

### 4. Check icon rendering

Some decorative arrow characters appear as empty squares in this Linux browser's screenshots. Button words remain readable. Confirm on the intended devices; if reproduced, replace decorative text glyphs with consistent icons.

No core functional blocker was found in the flows tested. These findings are usability work, not proof the product is ready for launch.

## Physical phone checklist — still outstanding

Use the current private site only if you already have access. Record the device, browser, and app version. The hosted version has not been confirmed to match this imported source, so record any difference before attributing a problem to this baseline.

| Action | What to look for |
| --- | --- |
| Open practice in portrait | Text is readable; no information or buttons are cut off. |
| Read the hole without zooming | Can you read hazard names and distances comfortably? |
| Tap a target, then adjust both sliders | Direction and distance are predictable; dragging does not unintentionally scroll the page. |
| Double-tap the course | Zoom changes once and preserves the target chosen before the gesture. |
| Tap the terrain map | Depth changes while the direction stays consistent. |
| Commit and wait | Controls lock; animation finishes; results and both patterns appear. |
| Open the lesson | The explanation is readable and relates to your decision. |
| Adjust & compare, then recommit | Answers disappear while choosing; the same hole remains; the comparison appears after commitment. |
| Take Next shot; try Tee and Approach filters | A new scenario appears with answers hidden and the selected shot category respected. |
| Open custom clubs; drag the flight handles | Handles are easy to grab; cancel discards changes; save retains them. |
| Open progress, then reload | Your attempt remains saved in that same browser. |
| Rotate to landscape and back | Layout stays usable and your target or result is preserved. |
| Enable the phone's reduced-motion setting | Unnecessary shot/camera animation is skipped. |

Test iPhone Safari and Android Chrome when devices are available. Mobile emulation is not a substitute for either. Also check desktop Safari/Firefox if they are part of the intended launch support.

## Evidence and next action

Current workspace evidence is in `/workspace/browser-review/`: `results.json`, `gestures.json`, and nine screenshots. The temporary browser scripts are in `/tmp/target-practice-browser/`; they use Playwright Core with the installed system Chromium and isolated browser storage. No application dependencies were added.

Milestone 1 is partially complete. Next, gather physical-phone feedback and address mobile readability first, then rerun the affected browser checks. Broader scenario generation can follow once the main practice experience is comfortable to use.
