# Shot calculation refactor — 17.5

## Scope

The first change extracts the existing committed-shot calculation from `app.js` into `shot-simulation.js`. It still creates exactly 4,000 seeded draws, evaluates the chosen aim, performs the same full target search (or uses the existing fixed lesson guide), and collects both outcome clouds using the same draws. It has no DOM, storage or animation dependencies. Commit `bb67389` records that step independently before adding background execution.

The second change adds `simulation-client.js` and the module worker `shot-worker.js`. Every committed shot takes a stable copy of aim, pattern, scenario, costs, seed and any cached guide. A supported browser runs the same calculation core in a disposable background worker. The worker is terminated after success, script/message failure, a calculation error, or a 120-second timeout. Its protocol and sample count come from the shared calculation module. Native structured cloning preserves non-finite modeled costs such as Infinity; it does not convert them to null through JSON.

If Worker is unavailable, its constructor is blocked, the script cannot load, or the response cannot be read, the client uses the established main-page path with row-by-row event-loop yields. It falls back once, with the same copied inputs and sample count. A reported calculation error or timeout fails the attempt rather than silently starting a second expensive calculation. The screen retains its existing busy controls, changed-settings guard, error recovery, animation and result-release sequence.

Calculation timestamps are exposed only through local browser Performance marks (`target-practice-calculation-start` and `target-practice-calculation-end`, with worker/main-thread execution detail). The previous marks are cleared at the next calculation. They contain no shot/profile/history payload, are not stored across visits and are not sent to a service. They support repeatable development measurements without adding telemetry.

## Preserved behavior

- Golf formulas, target-search coverage, 4,000-draw sample bank, optimum tie order, decision grades, modeled costs, dispersions, wind and rollout are unchanged.
- The screen still records course finishes, assessment answers and practice history after calculation; worker code cannot write local storage or activate memberships.
- Assessment feedback stays hidden until its report. Guided shots use their cached target. Retry encounters and original grades remain separate from subsequent attempts.
- Par-3 selected balls and finish scores use their existing finish seeds on the page. Reloading a saved review never selects a new ball.
- Progress/model/round schema versions are unchanged. The long-par-3 layout mix from 17.4 and old saved-course compatibility are retained.

## Validation

Unit comparisons reproduce the pre-refactor pipeline directly and compare every outcome point, aggregate cost, target, grade and feedback for a normal tee, a custom shot shape with wind/shoreline water, and a long tucked par 3. Additional tests cover cached guides, unbounded OB costs, snapshots during in-flight edits, unsupported/blocked workers, invalid messages, failures, timeout cleanup and termination.

`scripts/browser-review/simulation-worker.cjs` exercises actual module workers and forced fallback on desktop and phone widths for normal/hard practice, five-shot learning, ten-shot assessment and par-3 play. It checks identical decisions/selected balls, retries, hidden assessment feedback, old review persistence, worker closure, blocked-script recovery, no page overflow and no JavaScript page errors. A real browser also compares full worker outcome arrays with direct calculation, including a cached guide and Infinity.

See the separate performance comparison for measured responsiveness and its limits. Actual iPhone/Safari and Android hardware are still required before making phone-performance guarantees.

## Rollout and further work

Deploy the complete matching `dist` directory, including all three new modules. A blocked worker script has a fallback; missing initial application imports can still prevent app startup. A fresh worker can add per-shot startup/module-loading overhead; verify that on the real host alongside module MIME types, worker/CSP permissions and matched release/cache behavior. Existing hosting identity and audience are not changed by this refactor.

This is a focused change, not a complete app rewrite. Initial Introduction/lesson preparation still uses its existing on-page optimization/cache, and drawing both full SVG outcome clouds still runs on the page. Further profiling should decide whether preparation, message transfer or SVG rendering is the next bottleneck. Background execution improves scheduling; it does not reduce the number of physics evaluations. Navigation and persistence can be separated later in similarly small, independently verified changes.

The next focused rendering change is documented in [Carry-outline calculation refactor — 17.7](CARRY-OUTLINE-REFACTOR.md). It extracts and caches world-space carry outlines without changing camera projection or sampled outcome clouds. Full SVG replacement remains unchanged.

[Retained course layers — 17.8](COURSE-LAYERS-AND-FINISH-DISTANCE.md) now avoid replacing unchanged scenery, tracers and feedback SVG nodes. This release also adds the requested initial putt/chip distance to par-3 finish feedback, using existing saved finish data. String/geometry construction still runs on the page.
