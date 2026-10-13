# Publish v13.0.0 in the existing Work project

Download the complete development branch from GitHub using **Code → Download ZIP**, and upload it to the original Work conversation.

Suggested instruction for Work:

> Update the existing private Target Practice site from this complete archive. Deploy the entire `dist/` directory together, including `rounds.js`, `approach-generator.js`, `tee-generator.js`, and the matching HTML, CSS, and application modules. Preserve the existing project identity and owner-only access. Before publishing, check that the course actually renders, the browser has no missing-module errors, Commit & shoot appears immediately below the course, and Next shot and Retry work for both tee and approach scenarios.

Keep `.openai/hosting.json` with project ID `appgprj_6ac9a3e7317c8191b1a10027146d39c8` and static directory `dist`. Do not create a replacement public site. There is no build step or runtime dependency installation.

An incomplete upload can leave the selectors visible while the course is blank green. In particular, the new approach module must be published alongside the rest of the files. Check the rendered course after deployment, rather than treating an uploaded archive as proof that the site works.

This environment can save and test the GitHub changes; it has no publishing access to the existing private Work site.

After publishing, try Full screen, the front/flag/back yardage labels and depth bar, a shot and its feedback overlay, Hide/Show feedback, Retry, and Exit full screen. Test the normal view as well. Browsers without native fullscreen use the page-filling fallback.

Confirm that the pre-shot bird’s-eye map is absent in normal and full-screen practice. Green yardages should remain readable on a phone. The overhead landing comparison is available after commitment. Deploy all files together; the new generator and progress model versions are part of this update.

Test the menu’s Learning round and Assessment Test. Finish five learning scenarios, including a retry, and confirm the recap uses first attempts. Finish ten assessment decisions and confirm example flights appear from ground level while grades, coaching and comparison patterns stay hidden until the aggregate report. Reload an unfinished round and a finished report. Include the new `dist/rounds.js` module in the complete deployment. Daily limits and payments are not part of this private pilot.

Check the Intended carry slider and Expected roll readout together: the selected carry is where the nominal straight shot lands, while finishing dots include rollout. Check the larger par/distance heading. After the tenth assessment flight, choose View assessment report; its wording should describe target decisions conversationally.

The distance bar is now labeled Estimated distances, with Carry and estimated total together above the slider.

After a normal practice shot, tap the rating to open the lesson. Confirm the comparison table includes next-shot/putting, rough, bunker, trees, water and OB cost components, with a calculated tradeoff in the coaching text. Assessment still hides individual coaching.

Deploy the new `dist/benchmark-broadie.js` and `dist/strokes-baseline.js` together with the complete matching dist folder. Costs now use the historical Tour distance-and-lie reference. Check that the model explanation links its sources, the lesson identifies the reference and any endpoint limits, old completed reports remain labeled separately, and an unfinished old-model round restarts. Personal club settings remain saved; old custom cost settings reset for the changed meanings.

Include the new `dist/rollout.js` with the complete matching dist folder. Before commitment, select a tee target and check the carry ring, planned finish dot and short rollout line in normal/zoom/full-screen views. A zero-roll approach should show Carry = total with no separate finish preview. Normal review shows center landing/finish, stopping at water contact. Retry removes review markers; the assessment keeps center markers and individual coaching hidden.

Include `dist/curriculum.js` with the entire matching dist folder. Check Menu → Lessons, all four lesson cards, explanation steps, highlighted guided target, success after following it, an unhinted independent example, recap/review/repeat and saved completion after reload. During a lesson the profile is fixed; leaving must restore the previous round and personal settings. Lesson attempts must not enter normal progress history. Check that the distance bar has intended carry without an exact-looking total, and that changing left/right aim preserves carry. Preserve the existing private project and owner-only access.
