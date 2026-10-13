# Custom flight editor

Menu → Create your custom shot opens the only custom-profile menu destination. Save and Reset are on this page. Leaving through the menu discards unsaved changes.

The main editor uses one golfer/flight illustration and two drag handles. The red apex adjusts start and bend horizontally while holding the mean endpoint fixed; vertically it adjusts illustrative height. The blue finish adjusts the endpoint while holding the start angle fixed. Arrow keys offer the same changes. Bounds are ±10° start, ±50 yd curve and 5–50 yd illustrative height. At a bound the opposite anchor can move.

For carry d, initial lateral tangent S = d tan(start), and C = curve + usual bias, the mean lateral path is x(t) = S t + C t². Midpoint M = S/2 + C/4 and endpoint E = S + C, so moving the apex solves S = 4M − E. Moving the finish solves curve = E − S − bias. The preview includes usual bias to match the model's mean endpoint. The illustration looks directly down the launch-to-target line; two smooth cubic segments meet at the draggable apex. Its perspective and height are illustrative; height does not change carry, wind or scoring physics.

“Use this shape across my clubs” is selected initially. Start angle is shared; curve and bias scale with each club's carry relative to the edited club, and height scales with the square root of that ratio, within bounds. Club distances, rollout, dispersion and occasional-miss settings are preserved. Opening detailed settings or selecting a club turns off shared editing. Reset shot shape clears start, curve and bias and restores default illustrative height; it preserves the other settings.

Save & play cleans and stores the bag and activates custom practice. Cancel discards the draft. The selected mode and saved library survive reload in browser local storage. New learning rounds, assessments and courses snapshot the selected bag. Resuming a paused round uses its snapshot without overwriting the latest saved library. Old standard-profile saves remain supported. Round scoring continues to use the shared historical Tour distance/lie cost reference; a custom flight is not a personal short-game prediction.

This is a private preview. It has no account sync, billing or paid entitlement enforcement.
