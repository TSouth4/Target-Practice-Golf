# Beginner feedback, round 2 — version 17.10

Practice results now lead with What → Why → How: the existing target-quality verdict, a short explanation, a reusable course-management principle, and an experiment to try. The direction/carry label describes how the sampled comparison differs, rather than claiming to prove a single cause. When both change, users are encouraged to test one at a time.

“See the details” retains the decision score, expected strokes, estimated strokes lost per 100 similar decisions, outcome percentages, next-shot/recovery accounting, club information, conditions, and model limitations. Repeated introductory advice is removed from the numerical section. The blue comparison remains a sampled alternative, not the only acceptable target.

Retry feedback states whether the adjustment helped, cost more, or performed similarly. Where accounting is available it identifies the largest component change, without treating that component as an isolated causal experiment. All-OB cases receive an honest nonnumeric explanation. The first decision and progress record remain unchanged; the retry snapshot retains counts and accounting, not another full shot bank.

Par-3 finish cards show target quality and a short reason alongside the simulated finish and remaining distance. The decision score and deeper finish/coaching explanation are expandable. On phones the main explanation can scroll while the details control and Next hole remain accessible. Each new review starts collapsed. New concise reasons use the existing saved string fields; old saved reviews remain readable without recalculation.

Assessment answers still hide individual feedback and overhead comparison controls until the final report. Scoring, shot physics, sampling, optimization, course-selected ball, progress schema, and storage versions are unchanged. This release includes the new dist/decision-coaching.js module and must be transferred as the complete app folder. The owner's separate wording-review documents remain untouched.

Validation:

- Syntax checks passed; all 220 native tests passed.
- Browser checks passed at desktop, 390px and 320px widths for the result narrative, collapsed evidence, retry preservation and full-screen results.
- Assessment browser checks confirmed answers are recorded while individual coaching remains hidden.
- Normal-motion desktop and phone checks passed for tracers, fade, selected ball, camera transition, remaining distance and the visible target-quality card.
- Desktop and phone checks confirmed the detailed next-shot, bunker, water and OB accounting and per-100 figure remain available.

Round 3 (later): recommendations after learning rounds and the reassessment journey. This release does not implement that work or deploy the public site.
