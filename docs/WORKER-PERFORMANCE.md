# Background calculation comparison — 17.5.0

See the [raw 24-run report](WORKER-PERFORMANCE.json) and [refactor design](SIMULATION-REFACTOR.md). These are development measurements, not production capacity evidence or actual-phone certification.

## Method and limits

Compare the exact same 17.5 build with native Worker available versus deliberately unavailable. The fallback reproduces the original on-page algorithm. Each backend uses three fresh browser contexts for each of two fixtures/configurations, interleaved within a trial. All runs use 4,000 draws and the same seeded targets. The report asserts identical grade, modeled regret and feedback category for each fixture across all backends/trials. Direct result-array equivalence is checked separately in the functional/browser tests.

- Local uncompressed Python static server; Chromium 154.0.8037.57 through Playwright Core 1.64.0; reduced motion excludes deliberate flight/zoom/reveal waits.
- Desktop: 1440 × 900, local unthrottled network and normal page CPU.
- Slowed page: 390 × 900, 6× page CPU slowdown and 1.6 Mbps down / 750 Kbps up / 150 ms page network latency.
- Easy tee: Cedar, 20 handicap, seed 7142026, hole seed 47. Hard approach: Tucked with the same profile/seeds and generated Hard conditions. A direction of 5 yd is chosen using the normal aim control.
- **CPU throttling may not apply equally to workers.** The slowed-page comparison demonstrates page scheduling/responsiveness; its apparent reduction in calculation time is not a controlled whole-phone speedup. Worker networking may also have different throttling/cache behavior.
- Shared cloud hardware/load varied during the run. This is a small sample, not a percentile guarantee or an isolated hardware benchmark. Do not compare absolute timings directly with the older 17.3 cloud session.
- No full regression suite or other browser QA ran during these measurements. No player data was measured or uploaded, and production hosting was not load-tested.

Calculation duration comes from the client's local start/end Performance marks. Cumulative blocking is the sum of each page long task's duration beyond 50 ms whose start falls within that interval. A completion task may include result transfer and the following SVG rendering. A 25 ms timer records completed heartbeat gaps within that interval; it is a responsiveness signal, not a user-input latency measurement. Initial pre-calculation screen work and post-calculation rendering are not comprehensively represented by that interval. End-to-end commit/review and cold-Home observations are also retained in the raw report.

## Observations

Arrows compare page fallback → background worker.

| Configuration | Fixture | Median calculation duration | Median cumulative page blocking | Worst completed timer gap during calculation |
| --- | --- | --- | --- | --- |
| desktop-local | tee-easy | 3.42 → 2.86 s | 2256 → 309 ms | 646 → 420 ms |
| desktop-local | approach-hard | 5.91 → 4.94 s | 4033 → 51 ms | 899 → 50 ms |
| phone-page-slowed | tee-easy | 21.94 → 5.19 s | 20322 → 911 ms | 4840 → 453 ms |
| phone-page-slowed | approach-hard | 34.58 → 3.60 s | 30374 → 531 ms | 3557 → 133 ms |

The defensible result is substantially less page blocking during calculation with identical model outputs. Background execution does not remove the computation, guarantee a universal wall-time speedup, or meet every phone target. Some slowed-page completion tasks still exceeded one second; receiving results and drawing full outcome clouds remain useful profiling targets. Initial lesson/Introduction preparation is also unchanged.

## Reproduce

Serve `dist` locally, then run this while the machine is otherwise idle:

```bash
cd /workspace/Target-Practice-Golf
TARGET_PRACTICE_PLAYWRIGHT=/tmp/target-practice-browser/node_modules/playwright-core \
TARGET_PRACTICE_BASE_URL=http://127.0.0.1:8799 \
TARGET_PRACTICE_PERF_OUTPUT=/tmp/target-practice-worker-performance.json \
node scripts/browser-review/worker-performance.cjs
```

Use system Chromium or set `TARGET_PRACTICE_CHROMIUM`; Playwright Core is a developer tool outside the deployed app. The script writes its report only after all runs and equality checks finish. Timings are observations rather than a performance pass/fail gate. Real iPhone/Safari, Android devices and production module-worker/CSP behavior remain required launch checks.
