# Thread: remediation-parallel-program — next-session record

**Thread slug:** `remediation-parallel-program`
**Created:** 2026-07-18 (Highland Spiralling Summit, session prefix `5fb0b5`)
**Controlling record:** [`../../../plans/remediation/00-parallel-execution-program.md`](../../../plans/remediation/00-parallel-execution-program.md)
(lane contracts, merge-wave edges, 46-finding disposition — authoritative). This record is the
live-state pointer per the Continuation Pointer Contract: **pointer and hypothesis, never the
source of volatile truth. Recompute every live fact below from `git`/`gh` before acting.**

## Participating agent identities (PDR-027)

| agent_name                 | platform    | model          | session_id_prefix | role                                           | first_session | last_session |
| -------------------------- | ----------- | -------------- | ----------------- | ---------------------------------------------- | ------------- | ------------ |
| Highland Spiralling Summit | claude-code | claude-fable-5 | 5fb0b5            | orchestrator/closeout                          | 2026-07-17    | 2026-07-18   |
| Stormbound Circling Kite   | claude-code | claude-fable-5 | 62f93c            | orchestrator (handed off, Moment 2 `c3807e39`) | 2026-07-18    | 2026-07-18   |
| Sylvan Flowering Branch    | claude-code | claude-fable-5 | e6488b            | orchestrator (active)                          | 2026-07-18    | 2026-07-18   |

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

**Open PRs**: NEVER enumerated here — derive the live set with `gh pr list` + the reviewThreads
query in Next safe steps (hand-enumeration retired across all continuity surfaces, PR #10
rounds 9/13). Merge order (edges normative — program record §Merge waves, which is the SOLE
authority for waves and gates): L-A → L-E → L-I → micros (L-K6 alone: lockfile) → L-H → L-D →
**feature slice** → L-C → L-F; wave 2: L-B (after L-A + feature), L-K8 (after L-D), L-K9 (after
L-KBATCH + L-D), L-K10 (after L-E + L-D); wave 3: L-J.

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

## ORCHESTRATOR LIVE STATE (2026-07-18 ~08:55 UTC, Stormbound Circling Kite — supersedes the manifest below on current facts; RECOMPUTE before acting)

Successor designation (owner, 2026-07-18): **Sylvan Flowering Branch** is the eventual
successor-orchestrator. PDR-064 two-moments governs the transfer; this record is the
authoritative transfer artifact if the session ends before Moment 2. Danger List unchanged.

**SAFE-PAUSE WIND-DOWN (2026-07-18 ~10:45Z, owner-directed):** no new subagents; statusline
landed first. State at pause: **statusline + subagent statusline MERGED (#24 → `b62d73ab`) and
IN USE in the primary** (in-use merge `165c9502` + dist rebuild; render probe green;
cross-verified by the successor seat). **PR #22 reconciled with #24** (merge `1d7cdf4a`, zero
source fixes — the features compose at the `Segments` seam; every render pin conserved; live
composed render proven) **+ the final thread's fixer-ignore fix (`9c1a71d1`)** — pushed, last
thread resolve + owner merge-ask pending CI on the reconciled tip. All lane rounds this session
pushed + threads resolved (rounds detailed below); every commit is committed+pushed+in-a-PR per
the owner's safety rule, EXCEPT the standing feature-slice exception (owner decision pending).
Wind-down routings: PR #16's last two findings joined the registered positions (the `$ref`-
siblings class now covers the TS writer's `writeRefType` short-circuit too; the
`cloneWithoutSharedKeywords` stripping is upgraded to guard-bypassing with a concrete instance —
`{type:[object,null], unevaluatedProperties:false}` bypasses the new Draft-07 fail-fast).

**TRANSFER COMPLETE (2026-07-18 ~09:01Z):** Moment-2 acknowledgement `c3807e39` landed — Sylvan
Flowering Branch (e6488b) is the active orchestrator; Stormbound retains PR #22 + ARC closeout
in the overlap window. Fresh bot wave recomputed 09:00Z (unresolved: #10:3, #12:1, #13:1, #15:1,
#16:1, #17:1, #18:5, #20:3, #21:4); #19 fix `a62b8bfc` pushed + both threads resolved — #19
joins #11/#14 as clean, early merge ask per the blocking chain. First lane-agent wave dispatched
into the L-D/L-E/L-I worktrees 09:04Z.

Since Highland's manifest: **#11 pushed + 3/3 threads resolved** (64feef9e); **#13 R99n6
resolved** (fix at head 5a2a14af) — #13 fully clear; **#16 pushed + ALL 10 threads resolved**
(the nine-round against 64ad35dc + a new Codex P2 fixed root-cause in 912644d4, pushed);
**#20 opened, NOT draft, gate-verified green** (check:ci exit 0 in its worktree) — merge slot 2
ready; **#21 opened + undrafted, gate-verified** — ready; **#19 reconciliation RESOLVED with
probe evidence** (below) and its two Copilot threads are being fixed NOW (owner-flagged BLOCKING:
Midnight Watching Night's resonance-imports push waits on #19's content reaching main; their
4 commits hold ready; the citations-rule follow-up queues behind their merge); **#22 opened**
(feat/arc-rapid-comms-bring — the ARC estate; four-reviewer panel folded; check:ci green).
**Merge-ready is a RECOMPUTED fact, never a snapshot list** (hand-enumeration retired, PR #10
round 9 — the earlier list here omitted cleared PRs #11/#16 and could make a successor skip the
first required merge): derive it live as open PRs with zero unresolved review threads + green
required checks (`gh pr list` + the reviewThreads GraphQL query in Next safe steps). Merge ORDER
stays normative per program record §Merge waves: L-A #11 first, then L-E #20, L-I #21, micros,
L-H #17, L-D #18, feature slice, L-C #13, L-F #16; #19 merges early by the resolved
reconciliation (RAISED PRIORITY per the blocking chain — MERGED 09:10Z). The comms/claims
substrate is LIVE (seeded this session); two ARC channels run (castr liaison + a Resonance guest
window for back-flow). Bot-watch persistent on all PRs.

## FINAL WORK-LOCATION MANIFEST (2026-07-18 08:15 UTC — session end of Highland Spiralling Summit)

**Owner safety bar met for every LANE: every lane commit is pushed AND in an open or draft PR.**
**EXCEPTION (by design — truthed in PR #10 round 9):** the feature slice exists ONLY as local
branches in the primary checkout — `feat/explicit-additional-properties-rebased` @ `a48eced8`
and its pre-rebase twin `feat/explicit-additional-properties-2026-04` @ `e150a0e8`. They are
unpushable while their gate-level C3 reproduction is red (Danger List item 2; pre-push runs
`check:ci`). If this machine is lost before L-D (#18) merges, that work is unrecoverable from
origin. Preservation-ref decision is surfaced to the owner: authorise an out-of-band
preservation push, or accept the bounded risk until the L-D merge unblocks the normal push.

| PR  | Lane      | Branch tip (pushed)                     | State                                                                                                                              |
| --- | --------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| #10 | bootstrap | docs/remediation-program-record         | 8 review rounds resolved; ready to merge                                                                                           |
| #11 | L-A       | 64feef9e (harness + revalidation round) | 3 threads need reply/resolve against 64feef9e                                                                                      |
| #12 | L-K1      | 30b30d43                                | all rounds resolved                                                                                                                |
| #13 | L-C       | 5a2a14af                                | 8 threads resolved; NEW thread R99n6 fixed in 5a2a14af — reply/resolve owed; napkin commit 1815bc7e carries 4 follow-up candidates |
| #14 | L-K6      | 0bb4529                                 | resolved                                                                                                                           |
| #15 | L-KBATCH  | 72939c9a                                | 5 threads resolved                                                                                                                 |
| #16 | L-F       | 64ad35dc (nine-thread round committed)  | 9 threads need reply/resolve against 64ad35dc                                                                                      |
| #17 | L-H       | 3c3c2e93                                | 4 threads resolved                                                                                                                 |
| #18 | L-D       | 89035ac2                                | fresh; C3 fix — the feature-slice trigger                                                                                          |
| #19 | samples   | ee419ae8                                | fresh; generator-escape probe owed before L-D reconciliation ruling                                                                |
| #20 | L-E       | 881f6fb2 (draft, opened by SCK)         | orchestrator gate-verify owed, then ready (merge slot 2)                                                                           |
| #21 | L-I       | 9c6a9906 (draft)                        | orchestrator gate-verify owed, then ready                                                                                          |

Worktrees: ALL CLEAN (napkin residues committed on their lane branches). Local-only branches:
only the feature slice (`feat/explicit-additional-properties-rebased` + its 2026-04 twin) — by
design, unpushable until #18 merges (Danger List item 2).

Not-yet-dispatched work (successor's, per program record): wave 2 (L-B incl. the enums.ts
lockstep addition, L-K8, L-K9), wave 3 (L-J), feature-slice integration, reconciliation slice
remainder, program-end verification; plus the follow-up candidates named on PR #13/#15 threads
and Q-016 (owner ruling).

## Pending decisions (orchestrator-level)

1. **samples.test.ts reconciliation — RESOLVED (2026-07-18, orchestrator; probe evidence
   re-derived after the seat's transcript died):** the generator-escape probe (four-cwd empirical
   run against built dist + static trace) proved a SPLIT verdict — the library emission core is
   deterministic (explicit config injection, `maybePretty` never touches disk), but the CLI entry
   (`lib/src/cli/index.ts:122`) resolves prettier config cwd-dependently (three distinct output
   shapes by invocation directory, ancestor-decoy config wins) AND silently ignores `--prettier`.
   PR #19 is therefore a RUNTIME CLI fix, not a test-environment patch: its
   `resolvePrettierConfigForOutput` (anchor on the emitted file's path; explicit `--prettier` via
   prettier's `config` option) must survive the reconciliation. Disposition: PR #19 merges early
   as planned; L-D's rebase drops only its duplicate TEST-side anchoring hunk. Probe evidence:
   session scratchpad `generator-escape-probe/` (sha256 table in the orchestrator's session log).
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
   `docs/DEFAULT-RESPONSE-BEHAVIOR.md`); L-C seat-close batch (2026-07-18, named positions, not
   taken): `.meta()` silently drops unrecognised keys (representability boundary, already listed);
   `z.string().length(n)` sets only minLength not maxLength (C5-family, small); the fixture
   runner's `toMatchObject` subset-matching makes expected.json a weak lock (H7-family);
   `.regex(/x/i)` drops regex flags (C5-family, small); L-F round-2 out-of-lane finding
   (2026-07-18, ROUTED TO L-B — its owned surface): the Zod writer still drops carried `$ref`
   siblings (`writers/zod/index.ts` `writeSchemaType`; PR #16 thread 8's honest disposition —
   L-F's lane contract forbids `writers/zod/**`, L-B lands it with C6/M7). Registered
   2026-07-18: the PR #20 MCP-nullability class defect (three ad-hoc converters drop
   `metadata.nullable`; probe-verified) → **micro-lane L-K10** in the program record
   (§Micro-lanes; **starts after L-E AND L-D merge** — L-D's prototype-safety addendum touches
   one of L-K10's converters, so both edges gate dispatch, per PR #10 rounds 12/13), and the
   disposition table gained a routed-findings row pointing at this section for the remaining
   named positions.

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

## Handoff completion (2026-07-18, session close of Highland Spiralling Summit)

**The handoff is COMPLETE at this session's end** (owner directive 2026-07-18): coordinator
pre-positioning was broadcast on the comms stream (PDR-064 Moment 1); authority transfers to
Stormbound Circling Kite at their active acknowledgement or at this session's end, whichever
first. **This record is the authoritative transfer artifact; where the ARC/comms stream and this
record disagree, this record wins.**

**Dispatch freeze (owner, 2026-07-18):** no new subagents were started after the freeze. Seven
in-flight worktree agents were completing at close — L-H r3, L-F/PR#16 round, L-E (commit
881f6fb2 landed), L-A, L-C batch, L-I, samples (ee419ae8, already PR #19). Whatever they
committed sits in their worktrees per the lane table: push serially + reply/resolve per the
protocol above. Any findings they surfaced that would have needed a new dispatch are successor
work — route as named positions here and in the program record.

**Also landed at close:** L-K1 round 3 (30b30d43 — then/else gated on `if` per 2020-12 §10.2.2,
BOTH walkers, pushed, PR #12 thread resolved); PR #18 (L-D) and PR #19 (samples) opened;
delivery-ledger round 8 (global convention superseded; PR list defers to recomputation);
Q-016 (enum:[null] nullable inference) captured in the open-questions register — owner ruling
pending, do not decide unilaterally.

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
