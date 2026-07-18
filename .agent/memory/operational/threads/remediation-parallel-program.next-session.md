# Thread: remediation-parallel-program — next-session record

**Thread slug:** `remediation-parallel-program`
**Created:** 2026-07-18 (Highland Spiralling Summit, session prefix `5fb0b5`)
**Controlling record:** [`../../../plans/remediation/00-parallel-execution-program.md`](../../../plans/remediation/00-parallel-execution-program.md)
(lane contracts, merge-wave edges, 46-finding disposition — authoritative). This record is the
live-state pointer per the Continuation Pointer Contract: **pointer and hypothesis, never the
source of volatile truth. Recompute every live fact below from `git`/`gh` before acting.**

## Participating agent identities (PDR-027)

| agent_name                 | platform    | model          | session_id_prefix | role                   | first_session | last_session |
| -------------------------- | ----------- | -------------- | ----------------- | ---------------------- | ------------- | ------------ |
| Highland Spiralling Summit | claude-code | claude-fable-5 | 5fb0b5            | orchestrator/closeout  | 2026-07-17    | 2026-07-18   |
| Stormbound Circling Kite   | claude-code | (successor)    | (on join)         | successor-orchestrator | (on join)     | (on join)    |

## Current objective

Complete wave 1 of the owner-approved parallel remediation program (all lane PRs merged in the
edge-respecting order), integrate the explicit-`additionalProperties` feature slice after L-D
merges, then waves 2–3. The owner merges every PR; the orchestrator never merges.

## ⚠️ DANGER LIST — read before ANY action

1. **Never clean, reset, or remove the lane worktrees** (enumerate them with `git worktree list`;
   they live under the primary repo's `.claude/worktrees/` plus one samples-fix worktree in the
   machine temp dir). Dirty files there are PRESERVED, VERIFIED, UNCOMMITTED lane work (see the
   lane table), not junk. A prior session's agents died mid-commit at a usage-limit boundary; the
   file state IS the work.
2. **`feat/explicit-additional-properties-rebased` (local branch) CANNOT be pushed** until the C3
   fix (lane L-D) merges — its own Oak round-trip test is red by design (the gate-level C3
   reproduction). Do not "fix" that red test; do not delete the branch. Its twin
   `feat/explicit-additional-properties-2026-04` is the pre-rebase preservation copy.
3. **Pushes from the primary checkout must SERIALIZE** — two concurrent pre-push `check:ci` hooks
   in one working tree collide and fail with a bare "failed to push some refs". Never pipe a
   hook-bearing git command through `tail -1` (it blinds you to the cause).
4. **The "pre-attributed samples exception"**: exactly one failure is expected in NESTED
   worktrees — `tests-snapshot/integration/samples.test.ts` (prettier `resolveConfig` escapes the
   repo root; environment bug with two candidate fixes, see Pending decisions). Any OTHER failure
   is real. `test:all` is an `&&`-chain: after that failure, run `test:gen`, `test:transforms`,
   `test:e2e` directly to un-mask them.
5. **Mechanics:** dangerous-git substrings are denied anywhere in a command (write commit messages
   to a file, `git commit -F`); stage by explicit pathspec only; commitlint ≤100-char lines;
   `pnpm check` local / `pnpm check:ci` non-mutating; never `pnpm qg`.

## Live state snapshot (2026-07-18 — RECOMPUTE before acting)

**Branch of record:** `docs/remediation-program-record` (primary checkout) = **PR #10**
(program record + gate-footprint fixes + continuity supersessions; 7 bot-review rounds resolved —
the authority-ring lesson is in `.agent/memory/active/napkin.md`).

**Open PRs** (recompute with `gh pr list`): #10 bootstrap · #11 L-A · #12 L-K1 · #13 L-C ·
#14 L-K6 (threads clean) · #15 L-KBATCH · #16 L-F · #17 L-H. Merge order (edges normative — program record
§Merge waves): L-A → L-E → L-I → micros (L-K6 alone: lockfile) → L-H → L-D → **feature slice** →
L-C → L-F; wave 2: L-B (after L-A + feature), L-K8 (after L-D), L-K9 (after L-KBATCH); wave 3:
L-J.

**Per-lane state** (worktree names as listed by `git worktree list`):

| Lane     | Worktree suffix      | Branch/commit state                                                                           | Remaining to do                                                        |
| -------- | -------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| L-A      | `wf_718f6e9b-a35-1`  | 169131e pushed (PR #11, 3 threads); harness-validation fix verified, UNCOMMITTED              | commit → push → reply/resolve 3 threads                                |
| L-C      | `wf_718f6e9b-a35-2`  | 0203296+6d6485b pushed (PR #13); 8f91b25 committed UNPUSHED; 6-thread batch fix was in flight | finish batch → commit → push (8f91b25 rides) → reply/resolve 7 threads |
| L-D      | `wf_6f9f06c9-91e-1`  | 2631981 + follow-up (sanitiser seam + security proofs) — follow-up commit was landing         | verify commit landed → push → open PR (slot before feature)            |
| L-E      | `wf_718f6e9b-a35-4`  | 31-file guard set + fixture verdict; commit ceremony was running                              | verify commit(s) → full gate → push → PR (**merge slot 2**)            |
| L-F      | `wf_6f9f06c9-91e-2`  | 1bfbdd9+45d209f pushed (PR #16, 9 threads); harvest-and-fix round was in flight               | finish round → commit → push → reply/resolve                           |
| L-H      | `wf_6f9f06c9-91e-3`  | bfdbd18+20cc130 pushed (**PR #17**)                                                           | done pending bot rounds                                                |
| L-I      | `wf_6f9f06c9-91e-4`  | 8ac4845 + guard-gap bundle; gate log at machine-temp `castr-li-checkci.log`                   | verify gate → commit → push → PR (merges before L-C rebase)            |
| L-K1     | `wf_718f6e9b-a35-8`  | caf1d6d+1d9778b+99fe165 pushed (PR #12, thread resolved)                                      | done pending bot rounds                                                |
| L-K2     | `wf_718f6e9b-a35-9`  | NO commits; maybePretty fail-fast work blocked on latent producer bug                         | UNBLOCK gated on L-E prettier evidence (Pending decisions)             |
| L-K6     | `wf_718f6e9b-a35-11` | 6572ed4+0bb4529 pushed (PR #14, thread resolved)                                              | done pending any new bot round                                         |
| L-KBATCH | `wf_718f6e9b-a35-10` | 4 commits pushed (PR #15, 5 threads); harvest-and-fix round was in flight                     | finish round → commit → push → reply/resolve                           |
| samples  | (machine temp)       | `fix/remediation-samples-config-escape`, fix + regression test UNCOMMITTED                    | see Pending decisions (reconcile vs L-D)                               |

**Rapid tier (same-machine):** an ARC comms event ("ARC open: Highland Spiralling Summit ->
Stormbound Circling Kite") is on the instance-tier comms stream
(`.agent/state/collaboration/comms/`, git-ignored by two-tier design) with an ops crib and ack
protocol; on a fresh machine this record alone suffices. The concept-exploration provenance is
homed at
[`../../../research/remediation-program-concept-exploration-2026-07-17.md`](../../../research/remediation-program-concept-exploration-2026-07-17.md).

Saved PR-thread JSON harvests live in the session job's temp dir (session-mortal) — regenerate
with the GraphQL query in Next safe steps rather than hunting for them.

## Pending decisions (orchestrator-level)

1. **samples.test.ts reconciliation:** TWO fixes exist — L-D's in-lane edit (anchors prettier
   `resolveConfig` on `lib/package.json`; already in L-D's tree; enabled L-D's snapshot
   regeneration) and the standalone lane `fix/remediation-samples-config-escape` (adds a
   regression test + checks whether the GENERATOR shares the escape). Intended resolution: the
   standalone lane merges early (it makes nested-worktree gates honest for every lane); L-D
   rebases over it, keeping whichever anchoring is stricter and dropping the duplicate hunk.
   Decide on the standalone agent's generator-escape evidence when it reports.
2. **L-K2 unblock:** its maybePretty fail-fast exposed a latent producer bug that is very likely
   the SAME defect L-E's diagnostic found (multi-auth sample output arrives unprettified —
   maybePretty may be swallowing a prettier failure on output generated from the spec-invalid
   fixture). When L-E lands, re-run L-K2's suite in its worktree: green → commit as-is; still
   red → a genuine producer bug becomes a named micro-lane.
3. **New findings awaiting disposition-table entries** (program record §Disposition): L-F's
   union-conversion `cloneWithoutSharedKeywords` keyword-stripping (in 45d209f's commit body +
   napkin); L-C's primitive-parser silent drop of non-literal `.describe()` args (in the 8f91b25
   round report); L-H's flagged follow-ups (auto-correct `outputSchema` derivation gap;
   endpoint-vs-MCP primary-success selection difference — documented in
   `docs/DEFAULT-RESPONSE-BEHAVIOR.md`).

## Next safe steps (in order)

1. Run start-right; add/refresh your identity row above (additive, PDR-027).
2. Recompute live state: `gh pr list`; per-PR unresolved threads via
   `gh api graphql` on `pullRequest(number: N) { reviewThreads(first: 100) { nodes { id
isResolved path line comments(first: 3) { nodes { author { login } body } } } } }`;
   `git worktree list`; per-worktree `git status` + `git log --oneline -3`. The table above is
   the hypothesis those commands verify.
3. Work the "Remaining to do" column worktree by worktree, honoring the Danger List. Dispatch
   fresh sub-agents INTO existing worktrees (never fresh branches for existing lanes). Thread
   replies use the GraphQL mutations `addPullRequestReviewThreadReply` then
   `resolveReviewThread` — reply with commit-referenced evidence, then resolve.
4. Re-arm a bot watch after every push (persistent monitor polling unresolved-thread counts over
   `gh pr list`; bot reviews arrive up to ~10 min after a push). Triage every new thread
   root-cause-first; rebut with evidence when a bot is factually wrong. **Owner standing
   directive (2026-07-17/18, twice-stated): fix the UNDERLYING issue, and when a deeper
   class-eliminating fix exists, do that instead of the symptom fix — the deeper fix both cures
   the finding and prevents the repeated-symptom rounds** (worked instances: tracked-files-only
   validator scanning vs per-directory exclusions; exhaustive ring sweeps vs per-comment patches;
   consolidating three duplicated ref-parse copies into one helper).
5. When L-D merges: execute the program record's §Feature-slice integration — rebase
   `feat/explicit-additional-properties-rebased`, full gate (its Oak test expected green),
   seven-reviewer loop, PR, owner merge; then L-C/L-F final rebases.
6. Wave-2/3 dispatches per the trigger map; program-end verification per the program record.

## Blockers / low-confidence areas

- Bot-review rounds continue on every push (seven rounds on PR #10 alone); budget for them.
- L-I's uncommitted bundle is the least verified of the remaining states.
- Owner merge cadence is the wall-clock bottleneck; PRs review independently but merge in edge
  order.

## Promotion watchlist

- The authority-ring pattern (five rings closed on PR #10) → pattern/PDR candidate (napkin
  carries the observation).
- Tracked-files-only scanning as the structural cure for machine-local gate pollution → pattern
  candidate (landed in the fitness-vocabulary validator).
