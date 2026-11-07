# Purpose-first introduction — 17.18.9

The Home/Menu Introduction now opens with the owner's agreed story, using original authored SVG artwork and wording:

1. **The shot we picture:** one animated flight finishes at the flag.
2. **The shots we also hit:** the same target, with a miss finishing in water.
3. **Think beyond one shot:** 100 illustrated flights/finishes explain shot pattern and dispersion.
4. **Choose a target for the whole group:** the user moves the target away from water; the same 100 offsets move with it.
5. **What you're practicing:** place the whole pattern in a good position, helping good shots finish close and keeping more misses away from trouble.
6. **Choose direction:** existing tap/drag and arrow-key practice.
7. **Set intended carry:** separate distance decision and why carry is used.
8. **Commit your choice:** ungraded button practice.
9. **Judge the group, not one ball:** the displayed example explains the principle; it explicitly does not grade the user's controls-practice target.
10. **Find your starting point:** explain the ten-shot assessment and feedback at the end; the main action opens assessment setup.

## Illustration boundary

The visual examples are authored teaching illustrations, not newly calibrated player profiles, model runs, or predictions of the next shot. Exactly 100 deterministic positions are used for the group; moving the target translates those positions rather than resampling them. No numeric success rates, estimated strokes or grades are invented. Both the group and the target move; the flag stays fixed. Some misses can remain outside the green or near trouble. Course/background art stays consistent through the explanation and controls practice.

No Golf Digest/Scott Fawcett imagery, metaphor sequence or video excerpts are used. The 100-shot explanation and copy follow the owner's direction. Normal gameplay and research prototypes keep their existing model assumptions.

## Navigation, accessibility and persistence

- Short captions, visible water label, intended-target marker and step counter accompany the graphics.
- Reduced-motion users see the completed flight without motion; normal-motion replays reset and resume the animation correctly.
- Moving the example target, selecting direction and changing carry have explicit gates. Other slides can advance immediately.
- Previous, Close, Escape, skip-to-assessment and replay remain available. Focus stays inside the modal and returns to the originating control when closed. Skipping does not mark completion.
- Completion is recorded once per opening after reaching the last slide. Returning users retain their existing completion flag and can replay the new introduction through Home/Menu; no forced reset occurs.
- Illustration/control state is local to the introduction. Active rounds, selected player profile, scores and My Progress entries are not changed by the practice.
- The existing fuller course-management tutorial in Lessons is retained.

## Verification

Coaching-story tests cover deterministic 100-dot graphics, moving the group, control gates, pointer/keyboard inputs, completion once, backward navigation, Escape, skipping and replay. App integration checks preserve an active round/profile and avoid recording scores. Existing Home and fuller Introduction lesson checks pass.

Chromium checks at 1440, 390 and 320 px cover every story step, exactly 100 dots, no page overflow, direction/carry practice, reduced motion, persisted completion, replay, assessment setup and no changed round/progress storage. Normal-motion SVG timeline progression is also verified. First-shot, group and moved-target phone graphics were visually inspected. Scripts: `node tests/controls-tutorial.test.mjs` and `node scripts/browser-review/intro-story.mjs`.

`intro-story.js` is included in the fingerprinted complete asset bundle. Run `npm run prepare:assets` before preview/deployment. No model, grading, private-access or hosted-site publication changes are part of this update.
