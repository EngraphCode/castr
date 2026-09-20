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

All scripts are Bash. They resolve the repository from `git rev-parse --show-toplevel`,
measure against `$BASE`, which defaults to the recorded main revision above, and write
to `$SCRATCH`, defaulting to a fresh `mktemp -d`. They do write shared Git state:
`verify-pr.sh` registers a worktree, its install writes the merge-driver path into the
shared `.git/config` (re-armed from the primary checkout on every exit path), and
`git merge-tree --write-tree` writes Git objects. Merge-conflict output can depend on
the merge-driver build as well as the pinned commits.

- `pr-evidence.sh`: for each open source PR, measured at the head SHA recorded on
  12 September and pinned in the script, the merge-base, commit list, `git cherry`
  patch-id matches, per-file fate on main (`D` absent, `U` unchanged since base, `C`
  changed since base, `=` head identical to main) and the `git merge-tree --write-tree`
  conflict list with the merge driver's messages. The local branch and the live GitHub
  head are printed beside the pinned head, with a `DRIFT` line when either differs.
  The merge result-tree OID is not printed: for containers touching memory files it
  depends on the semantic-merge driver build, so it is not evidence.
- `wt-evidence.sh <worktree-path>...`: for each dirty worktree, every dirty path,
  with untracked directories expanded to their files, with whether its content already
  equals the measured main and whether main changed the path since the worktree's base.
- `verify-pr.sh <label> <merge-base> <head-sha>`: adds a disposable detached worktree
  at the measured main, installs offline from the store, applies the head's `lib/`
  diff with `git apply --3way` excluding integration snapshots, runs the head's own
  test files under the matching vitest config, then `tsc --noEmit`. The vitest
  summary lines are kept whole for every run and the diagnostics are truncated
  separately. It exits with the number of failed steps (apply, each test run, the
  type-check), shown on 13 September by the pr16, pr18 and pr27 reruns exiting 4, 5
  and 5. The worktree is left for inspection; remove it with
  `git worktree remove --force`. Because the repository `postinstall` writes the
  semantic-merge driver path of whichever checkout ran it into the shared
  `.git/config`, the script re-arms the driver from the primary checkout after each run.

## Results

`results/` holds the outputs as produced, with machine-local prefixes replaced by
`<scratch>`, `<repo>` and `<worktrees>` and ANSI codes stripped:

- `pr-evidence.txt`: the mechanical evidence for all 13 PRs, regenerated on
  13 September by `pr-evidence.sh` at the pinned heads; no drift from the 12 September
  heads was reported, and the conflict lists match the 12 September run.
- `wt-evidence.txt`: the mechanical evidence for 10 worktrees, regenerated on
  20 September after the three inventory repairs (content equality for untracked files,
  rename records, counts against HEAD). The 12 September output for all 11, with the
  `castr-local-entry` `examples/` directory as one row, is in git history at
  `f8a744c2`. The eleventh worktree, `castr-q07-zod-fixture-runner`, was unreadable on
  20 September: it lived under the system temp directory, and the temp purge had removed its `.git`
  file and its six dirty files.
- `verify-<label>.txt`: one per probed PR (11, 12, 13, 15, 16, 17, 18, 20, 26, 27).
  `verify-pr16.txt`, `verify-pr18.txt` and `verify-pr27.txt` were regenerated on
  13 September by `verify-pr.sh` at the pinned heads; the other seven were produced by
  the 12 September zsh predecessor, whose output shape the Bash rewrite preserves.
  Each records the patch file count, apply result and conflicted files, the test files
  run with their vitest summary (pass and fail counts per run), and the type-check
  result.

Two later probes are not scripted: the PR #18 identity-slice subset (an 18-file
pathspec of the same diff) and the manual resolution of PR #20's and PR #27's single
conflicts, both recorded in the napkin entry for the day.
