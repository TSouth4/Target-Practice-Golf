"""Analytic illustrations, not fitted golf distributions. No runtime imports/edits."""
import json,statistics
from pathlib import Path
normal=statistics.NormalDist()
anchor=170
rows=[]
for label,sd,percentile in [('Symmetric at stated carry',16.2587,.5),('Same width; stated carry at P70',16.2587,.7),('Hypothetical 150–180 central80',30/(2*normal.inv_cdf(.9)),None)]:
 mean=anchor-normal.inv_cdf(percentile)*sd if percentile else 165
 d=statistics.NormalDist(mean,sd)
 rows.append({'label':label,'statedCarry':anchor,'mean':mean,'sd':sd,'stockPercentile':d.cdf(anchor),'central80':[d.inv_cdf(.1),d.inv_cdf(.9)],'over20LongProbability':1-d.cdf(anchor+20),'over40LongProbability':1-d.cdf(anchor+40)})
result={'scope':'Mathematical examples only. 16.2587yd is the current owner-example model SD, not empirical calibration. All rows are normal; no mishit mixture or hard limits.','rows':rows}
assert abs(rows[0]['central80'][1]-rows[0]['central80'][0]-(rows[1]['central80'][1]-rows[1]['central80'][0]))<1e-9
assert abs(rows[1]['stockPercentile']-.7)<1e-12
Path(__file__).resolve().parents[1].joinpath('docs/CARRY-ANCHOR-ILLUSTRATIONS.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
