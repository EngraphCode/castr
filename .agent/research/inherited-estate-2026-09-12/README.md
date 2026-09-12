# Inherited-estate measurement, 12 September 2026

Tracked home for the commands and outputs behind the measured-state facts in the
[delivery ledger](../../plans/delivery-ledger.md#measured-state-of-the-inherited-estate-12-september-2026)
and the container map in the
[value-proof sequence](../../plans/active/castr-documentation-and-fidelity-correction.md#12-september-value-proof-sequence).
Base: `origin/main` at `21e232295426ac104dc1ff47b2d7543858abf4bf`.

These outputs establish self-consistency of each container on that main, never the
existence of a doctrine gap or the correctness of a cure. Only a failing test on
unpatched main does that.

## Scripts

All scripts resolve the repository from `git rev-parse --show-toplevel` and write to
`$SCRATCH`, defaulting to a fresh `mktemp -d`. None writes to the repository.

- `pr-evidence.sh`: for each open source PR head, the merge-base, commit list,
  `git cherry` patch-id matches, per-file fate on main (`D` absent, `U` unchanged
  since base, `C` changed since base, `=` head identical to main) and the
  `git merge-tree --write-tree` conflict list.
- `wt-evidence.sh <worktree-path>...`: for each dirty worktree, every dirty path with
  whether its content already equals `origin/main` and whether main changed the path
  since the worktree's base.
- `verify-pr.sh <label> <base> <branch>`: adds a disposable detached worktree at
  `origin/main`, installs offline from the store, applies the branch's `lib/` diff
  with `git apply --3way` excluding integration snapshots, runs the branch's own test
  files under the matching vitest config, then `tsc --noEmit`. The worktree is left
  for inspection; remove it with `git worktree remove --force`.

## Results

`results/` holds the outputs as produced, with machine-local prefixes replaced by
`<scratch>`, `<repo>` and `<worktrees>` and ANSI codes stripped:

- `pr-evidence.txt`, `wt-evidence.txt`: the mechanical evidence for all 13 PRs and
  11 worktrees.
- `verify-<label>.log`: one per probed PR (11, 12, 13, 15, 16, 17, 18, 20, 26, 27).
  A label's log records the patch file count, apply result and conflicted files, the
  test files run with their pass and fail counts, and the type-check result.

Two later probes are not scripted: the PR #18 identity-slice subset (an 18-file
pathspec of the same diff) and the manual resolution of PR #20's and PR #27's single
conflicts, both recorded in the napkin entry for the day.
