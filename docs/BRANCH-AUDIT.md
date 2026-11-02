# Branch consolidation audit

## Outcome

The fetched snapshot contains **71 GitHub branches**, all fully included by ancestry in candidate `aed5fcfe07c2ea8a770d3fe2b4e3be2d1181e866` on `docs/consolidation-and-hole-variety`. No remote branch has commits outside that candidate. This is a cumulative development history, not 71 independent versions requiring separate merges.

The candidate contains app **17.18.4**, the reconciled hosted source, later UI fixes, the two read-only model examples and the newest planning decisions. This report is added on that same planning branch to avoid creating another audit-only branch. The report's own commit will be a descendant of the pinned candidate; snapshot hashes intentionally remain unchanged for reproducibility.

`main` is still `2460ecf1501aaa45a548ebc2a9f04fd2850655e9`, the initial v12 import. It is **79 commits behind** the candidate, with **255 changed file paths** between their trees. The remote advertises `main` as its default branch. New default checkouts/ZIPs can therefore retrieve the older app. Since main is an ancestor, promotion can be a fast-forward with no history conflict; it is not necessary to merge each feature branch separately.

## Classification

| Group | Count | Recommendation |
| --- | --- | --- |
| `main` | 1 | Keep. Prepare promotion to the verified cumulative version after the gates below. |
| Active cumulative planning/source branch | 1 | Keep through promotion and verify the report commit is also retained. |
| Other remote branches | 69 | All tips are ancestors. Potential retirement candidates after main promotion, backups, active-use review and explicit authorization—not an immediate deletion list. |
| Remote branches with commits outside the candidate | 0 | No unique remote commit integration is needed in this snapshot. |

The local-only branch name `work` points to exactly the same initial-import commit as remote main. It has no unique commits. No local branch has commits outside the candidate, and the working tree was clean before report creation. Other chat/Work workspaces and their uncommitted changes are outside this audit's visibility.

No Git tags were present at the audit snapshot. Before cleanup, create approved named backup/release tags for the old main and chosen baseline, rather than treating dozens of branch names as the release-backup system. No tags were created by this audit.

## Proposed consolidation sequence

1. **Confirm the deployed source.** The last supplied hosted export was 17.18.1; Work has been asked to publish later branches, but the current live version was not independently verified here. Confirm any additional Work edits and reconcile them before promotion. Keep app version, source commit and prepared asset release recorded together.
2. **Freeze the candidate and backup references.** Recheck all remote tips just before action. Confirm no open PR/active task depends on a branch selected for retirement. Record old-main and baseline backup tags with the owner's authorization.
3. **Prepare promotion into main.** Use the final planning branch tip, including these audit documents, not an earlier pinned snapshot accidentally omitting later planning. Review the 255-path difference, run the agreed checks and confirm assets can be prepared on a fresh checkout. Tests previously passed during hosted reconciliation; that historical evidence is not a fresh full-suite run at this audit tip.
4. **Owner approves the concrete main update.** Fast-forward main (or use the repository's required PR workflow) to the verified candidate. Do not squash the entire history away if branch-retirement safety is being judged by ancestry. Check default checkout/download version afterward.
5. **Owner approves a specific retirement list.** Recheck each listed remote branch is still included in the promoted main. Delete only approved redundant refs in batches; retain any active branch. Old commits remain reachable through main/history and the retained tags.
6. **Simplify future work.** Start from current main, use one short-lived branch per actual task, review/test, merge back, and retire its branch. Keep hosted exports/source synchronized. Normal code merges must not automatically publish or change audience/billing.

## Limits and safety

- Reachability proves the commits are preserved. It does not prove that every old feature remains enabled: later commits may intentionally replace earlier behavior. App acceptance and hosted-source comparison remain separate checks.
- This audit does not inspect GitHub branch-protection rules, open PRs, other workspaces' uncommitted changes, or the live Site's exact code/access.
- Historical generated asset releases are deployment artifacts, not alternative branch source versions. Preserve the hosting workspace's old release directories for cached pages and follow DEPLOYMENT.md.
- The audit fetched refs and wrote documentation only. It did not merge main, delete branches, create tags, deploy or change app code.

## Evidence

[Full inventory CSV](BRANCH-AUDIT.csv) is suitable for Excel. [JSON snapshot](BRANCH-AUDIT.json) records every branch tip, commit counts, local branches and tags. Compare exact commit IDs rather than branch-name impressions.

Reproduce after a read-only fetch:

```sh
git ls-remote --heads origin > /tmp/target-practice-remote-heads.txt
git fetch origin '+refs/heads/*:refs/remotes/origin/*'
node scripts/audit-branches.mjs /tmp/target-practice-remote-heads.txt origin/docs/consolidation-and-hole-variety
```

`git ls-remote --symref origin HEAD` independently confirmed default branch main. The repository is not shallow, so ancestry checks use the available complete history. No application tests were needed for documentation-only audit outputs; main promotion will have its own review/validation gate.

Execution note: the Node child-process wrapper was blocked by this session’s sandbox on the first attempt; rerunning the same read-only audit through the supported permission check succeeded. The earlier independent Python/Git inventory produced identical branch counts and baseline ancestry results.
