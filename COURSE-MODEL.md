# Three-hole par-3 pilot

Menu → Par-3 course starts a seeded three-hole round. Menu → Resume par-3 course returns to an unfinished saved course even after switching to practice, assessment or lessons. The current course, last outcome and scorecard are local to this browser; there are no accounts, competitive leaderboards or long-term course history. Starting a new course replaces that course save.

## Layout and player

The course uses three seeded approach families (tucked flag, front water and split bunkers), displayed as par 3s with flag distances up to 175 yd. Their scoring geometry and club/dispersion rules are unchanged. The selected standard handicap profile or custom club-bag snapshot, and driver-distance setting, are fixed throughout the round. Editing the saved custom profile later affects new games, not this paused round. Custom flight settings affect the tee shot; the simulated short game still uses the same historical Tour reference rather than a personal handicap model. One environment is kept for all holes, selected from woodland, Pacific Coast, desert and mountain. These mixed families do not all support side water, so lakeside/oceanfront are not offered for this pilot. Rounds can now use Easy, Medium or Hard wind/firmness conditions, saved per hole. See CONDITIONS-MODEL.md. The short-game finishing reference is unchanged.

## One selected shot

Target grading still evaluates 4,000 shots and compares the best sampled target. A separate deterministic random stream chooses one of those 4,000 outcomes uniformly; it is not a quota or a fresh ball drawn from different assumptions. The selected outcome is included among the example flights. The full patterns then appear, the chosen flight/ball is highlighted, the other patterns fade, and the camera frames that ball and the green from above. Only the selected endpoint remains. Normal target feedback and simulated hole score are separate: luck does not change the target grade.

The course result is recorded before the reveal animation. Reload returns to the saved endpoint and score rather than drawing again. OB tee attempts use a different selection seed each time; changing a target changes its actual shot distribution. Completed-hole scorecard target grades refer to the first tee decision, including when later re-tees use a better target.

## Illustrative finishing model

This is **not a measured score-frequency model**, a handicap-specific short-game prediction, or an official PGA TOUR simulator. We use the historical distance/lie mean documented in STROKES-BASELINE.md, plus explicit authored distribution shapes to obtain whole-number finishes. This avoids rounding an expected value into an actual score.

For remaining putting strokes, support is 1–4 with starting weights `[0.15, 0.75, 0.095, 0.005]`. For an off-green finish, support is 1–8 with starting weights `[holeout, 0.22, 0.50, 0.20, 0.06, 0.015, 0.004, 0.001]`. The off-green hole-out weight declines with distance and is zero for recovery lies. These shapes are design assumptions, not published frequencies. We exponentially tilt and normalize them so the weighted mean matches the reference remaining-strokes cost at the actual finishing position and lie. Forest severity uses the same recovery multiplier as normal target scoring. The source's existing distance clamps remain in effect.

A deterministic draw samples that distribution. Green finishes are reported as putting only. Off-green totals are divided into simulated recovery/bunker/approach/chip/pitch shots and putts, with all displayed components summing exactly to the sampled remaining strokes. This partition is illustrative; we do not generate the actual positions, trajectories, slopes, spin, successive hazard encounters or short-sided recovery geometry for those later shots. The supplied handicap changes tee dispersion; finishing probabilities still share the Tour reference rather than measured personal short-game skill.

A selected green endpoint within 0.059 yd of the flag is treated as holed (zero remaining strokes), allowing a rare hole in one. This is an endpoint cup approximation, not a simulation of speed, lip-outs or ball entry. The normal reference grader retains its putting-table minimum.

## Penalties and totals

- Normal completed hole: prior OB strokes/penalties + this tee stroke + simulated remaining strokes.
- Water: add this tee stroke and one penalty; use the existing authored drop and the model's assumed rough lie for the simulated remaining finish. No new relief rule is introduced.
- OB: add one tee stroke and one penalty, leave the hole unfinished, and require another target choice from the original tee. The next stroke is 3 after the first OB. There is no fabricated chip-and-putt finish from OB and no arbitrary automatic replay cap that awards a finite hole score.

Running score uses completed holes only. The current hole's pending OB strokes remain saved and are clearly shown before the re-tee. Every completed score reconciles tee shots + penalties + simulated finishing strokes. Corrupt or inconsistent course saves are rejected rather than used to render or score a hole. If saving fails, the course banner reports it.

## Before expansion/public use

Test the three-hole experience with golfers before expanding to 18. Independently verify the benchmark transcription and review/tune the authored outcome shapes with a golf coach. A personal finishing model needs real short-game/putting data. Later full-length courses need actual second-shot geometry/state and additional hazard rules; this pilot does not imply those features are ready.

## Round display and ending a round

The displayed running total is completed-hole strokes minus completed-hole par (3 per hole), formatted as Even par or a signed difference. An unfinished hole and its pending re-tee do not count until its finish is recorded. The hole result and scorecard use the same relative-to-par format. Raw stroke totals remain in saved data for reconciliation.

Quit clears the saved course and active round and returns to practice. Restart generates a new randomized course using the currently selected profile and starts at hole 1. These controls are available while playing and from the scorecard. Navigation to another mode continues to preserve the course for resumption.
