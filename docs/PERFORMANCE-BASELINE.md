# Performance baseline — 17.3.0

This is a development measurement, not a production capacity claim or real-phone certification. No live site was load-tested and no user telemetry was added. See the [raw measurements](PERFORMANCE-BASELINE.json).

## Method

Measured on a Linux cloud machine with Node 24.19.0, Chromium 154.0.8037.57 and Playwright Core 1.64.0, using the local Python static server. Each row below uses three fresh browser contexts with caching disabled. No automated regression suite ran during the final measurement. Contexts begin at Home; the script opens unlimited practice and commits the same seeded target.

- Desktop: 1440 × 900, normal CPU, local unthrottled network.
- Slowed phone approximation: 390 × 900, 6× CPU slowdown, 1.6 Mbps download / 750 Kbps upload / 150 ms latency through Chrome DevTools.
- Easy tee: Cedar, 20-handicap profile, seed 7142026, hole seed 47, calm conditions.
- Hard approach: Tucked, same profile/seeds, generated Hard wind/ground.
- Reduced motion removes the intentional flight/zoom/reveal pauses. Timings still include rendering and browser automation scheduling. Normal play adds those deliberate animations.
- Home readiness is measured after the Home section becomes visible to the browser runner; it is not a precise interactive-paint metric. First contentful paint and resource sizes are also in the raw file where available.
- Long tasks measure individual main-thread blocks during commitment-to-review. They are not total calculation time.

The local server has no production CDN or compression. CPU/network throttling approximates a constrained device; it cannot reproduce a particular phone, Safari, thermal throttling or mobile storage behavior. These are repeated samples, not percentiles from a large device population.

## Results

| Configuration | Scenario | Median cold Home readiness | Median commit to review | Worst individual main-thread block |
| --- | --- | --- | --- | --- |
| desktop-local | tee-easy | 0.28 s | 1.98 s | 134 ms |
| desktop-local | approach-hard | 0.24 s | 2.55 s | 197 ms |
| phone-slowed | tee-easy | 4.06 s | 10.41 s | 914 ms |
| phone-slowed | approach-hard | 4.05 s | 14.75 s | 1134 ms |

## What this tells us

The static app is small enough for a straightforward cached web deployment, but the exact 4,000-shot target search is a meaningful phone CPU cost. Desktop calculations are around two to three seconds here; the heavily slowed runs take roughly ten to fifteen seconds. Individual long blocks can make the page feel frozen. Adding more visitors does not itself multiply that browser CPU cost, but more visitors will expose a wider range of devices.

This round establishes a baseline and adds manual recovery. It does not claim a calculation-speed improvement. The comparison algorithm, number of draws, grading and physics are unchanged.

## Next work and launch targets

1. Reduce main-thread blocking during exact target search. Evaluate a background Web Worker with a supported fallback and shorter work slices. Preserve seeded draws, optimum-search coverage, scores and feedback; do not hide slower devices by silently reducing their scoring sample count.
2. Rerun the same fixtures and compare selected target, score and modeled cost before/after optimization. Measure slow-device responsiveness as well as total time. A worker moves work off the page thread; it does not guarantee less computation, and CPU throttling may affect workers differently.
3. Pilot engineering targets: median cold Home within 3 seconds on the constrained network, median commit-to-review within 3 seconds on common devices and within 6 seconds on the agreed slower-device set; target individual main-thread work slices below 100 ms. These are proposed goals, not current guarantees. The slowed calculation results do not meet them.
4. Test actual iPhone/Safari and Android/Chrome devices, including older phones, before promising support. Record versions, storage/download/restore behavior, repeated-shot responsiveness and any limitations.
5. Confirm production compression, cache/release consistency, HTTPS, CDN/hosting quotas, monitoring and rollback. Measure the real deployed site after those choices. Once accounts/payments exist, test their server services separately under an agreed load; this script does not establish their capacity.

## Later builds

These figures describe 17.3 before background execution. On 17.5 and later, use the [same-build worker/fallback comparison](WORKER-PERFORMANCE.md) to distinguish page responsiveness from worker execution time. The general performance script now records its detected backend and warns that page CPU throttling may not affect workers. The historical raw baseline remains unchanged.

## Reproduce

Use a separate terminal to serve the unmodified static site:

```bash
cd /workspace/Target-Practice-Golf
python3 -m http.server 8799 --directory dist --bind 127.0.0.1
```

The browser tools are development-only and are not app dependencies. This measurement used Playwright Core 1.64.0 installed outside the checkout and system Chromium. If missing, install that version into a temporary developer tools directory rather than adding it to the deployed app. Then run:

```bash
cd /workspace/Target-Practice-Golf
TARGET_PRACTICE_PLAYWRIGHT=/tmp/target-practice-browser/node_modules/playwright-core \
TARGET_PRACTICE_BASE_URL=http://127.0.0.1:8799 \
TARGET_PRACTICE_PERF_OUTPUT=/tmp/target-practice-performance.json \
node scripts/browser-review/performance.cjs
```

`TARGET_PRACTICE_CHROMIUM` can select an installed compatible Chromium executable. Keep the computer otherwise idle while measuring. The script checks that all twelve runs reach feedback without JavaScript errors and writes JSON only after completion. Its timings are observations, not a pass/fail performance gate. The browser-only endpoint is for internal validation, not a user preview link.
