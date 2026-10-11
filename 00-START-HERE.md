Treat the existing code as a working baseline, not something you must defend. Explain what should be retained, improved, or replaced and why.

# Target Practice — start here

Development note: `README.md` describes the v12.2.0 scenario variety and course-action changes. The v12.0.0 details below describe the original uploaded baseline; the specification is the product brief, not a claim that later development is absent. The original private hosted site has not been updated by this GitHub development change.

Read Target-Practice-Codex-Specification.md, then inspect the source before editing. This is the working private v12.0.0 prototype, not a request to start over. Review it independently and challenge weak assumptions. Preserve a working baseline and use a separate branch or experiment for major redesigns.

Do not make the app public or broaden access without Tyler’s explicit approval. Preserve the hidden-dispersion-before-commit rule. Do not claim that illustrative golf assumptions are measured data or that the best sampled aim is a proven optimum.

## Contents

- Target-Practice-Codex-Specification.md: full requirements and initial prompt.
- dist/: runnable browser app, including HTML, CSS, SVG rendering and JavaScript modules.
- tests/: existing automated checks and lightweight DOM harness.
- README.md: implementation and model notes. Its V12 section supersedes the older orange/blue cloud description: dots now use outcome colors, selected dots are filled and comparison dots hollow.
- package.json: syntax and test commands; no app runtime dependencies.
- .openai/hosting.json: existing Site identity and static hosting configuration. This does not contain a credential or grant deployment access.

## Verification and running

Baseline commit: 1333c6c5051a6c89e7b790f0b319faab8a99d628
The last development run passed 101 automated tests and syntax checks. Actual phone/browser QA remains unverified. This export preserves those source files; exporting it does not constitute a fresh test run.

Run npm run check and npm test from the extracted project directory. Serve dist/ as static files using a workflow appropriate to your environment; JavaScript ES modules should be opened through an HTTP server rather than by double-clicking the HTML file. Follow hosting/tool instructions for the environment you are using.

Private deployed baseline: https://scratch-decision-lab.tsouthcott.chatgpt.site

This archive excludes Git history, credentials, runtime state, and user browser settings. Obtain authenticated source/deployment access separately if continuing the original hosted Site. Do not assume the original workspace path exists on your computer.
