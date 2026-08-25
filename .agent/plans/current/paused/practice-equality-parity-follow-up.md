---
title: Practice equality instalment 2 — cross-estate parity follow-up (handoff)
status: paused
lane: current/paused
sequence_position: >-
  Named paused-sequence position (active/README no-parking rule): next equality
  instalment, picked up when the owner directs the next equality slice or a session
  claims the PB batch; it becomes primary only then. Not a third entry point beside
  the primary active plan.
created: 2026-08-25
last_updated: 2026-08-25
owner_directive: >-
  Standing equality directive (owner, 2026-08-24, verbatim): "piece by piece, I want the
  Practice in Castr and OCE to take the best of each other, until they are Equal in
  capability." Plus the owner's 2026-08-25 safe-stop instruction: record all context and
  code in pushed PRs so a different agent on a different account can pick the work up from
  the repo alone. This plan is that handoff record.
evidence: >-
  Instalment 1 (current/complete/practice-equality-identity-and-cognition.md) landed and
  merged in castr PR #54 (merge commit 54a7099) and is mid-flight in OCE PR #18
  (https://github.com/EngraphCode/oak-open-curriculum-ecosystem/pull/18, branch
  claude/cloud-seat-identity-seed -> engraph, head 4ccf72a39). OCE #18 went through nine
  Codex review rounds; rounds 1-8 were fixed with validated pushes, round 9 was declined
  with a reasoned reply (PR comment 5403841079) because it re-litigated the ratified
  derive-from-live-seed doctrine. The fixes OCE gained in those rounds are the parity gap
  this plan closes in castr. At handoff (2026-08-25 ~01:45 UTC) OCE #18 was open, all code
  pushed, CI in progress on head 4ccf72a39, awaiting green to merge.
todos:
  - id: HO-1
    content: >-
      Merge OCE PR #18 (owner authorization standing: "Yes please drive both PRs to
      merge"). DONE 2026-08-25: merged as merge commit 42d6a6bf after all 19 review
      threads were dispositioned with verified evidence (18 cured in rounds 1-8, 1
      rejected with the round-9 reasoned reply, PR comment 5403841079) and
      mergeable_state read clean. Historical execution notes kept for the next
      cross-estate drive — known false signal: OCE's run-quality-gates rollup counts
      auto-cancelled gates on superseded heads as failure; verify via job logs before
      treating any red as real. Verified default-container environment cures for OCE's
      local gate (container-only, no repo changes; the Practice Repos cloud environment
      provides these via its setup script): NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt;
      COREPACK_DEFAULT_TO_LATEST=0 with corepack prepare of the repo's pinned pnpm;
      PNPM_HOME set to the directory holding the pnpm binary (repo-check spawns pnpm
      from trusted locations only); TURBO_CONCURRENCY=3 (avoids OOM exit 137 in lint);
      gitleaks installed per castr's .claude/hooks/ensure-gitleaks.sh pin; git >= 2.45
      (the agent-tools e2e smokes pass --no-lazy-fetch; the PPA is proxy-blocked in
      default containers — build from a github.com clone of git/git); git fetch
      --unshallow (the MCP current-source validator git-shows a baseline commit outside
      the shallow clone); Playwright browsers linked from /opt/pw-browsers into
      ~/.cache/ms-playwright with the pinned revision's directory names, including an
      inner chrome-headless-shell-linux64/chrome-headless-shell link to
      chromium_headless_shell-*/chrome-linux/headless_shell (turbo strict envMode strips
      PLAYWRIGHT_BROWSERS_PATH, so the default cache path is the one that binds). Review
      rounds triage per ADR-051 clause 4 as amended 2026-08-24: two fix rounds per PR
      for automated-reviewer findings; after the cap, blocking correctness/security/
      data-loss defects are still fixed or escalated, while non-blocking refinements
      take a per-finding demonstrated carry-forward disposition (never a category
      grant); consecutive rounds narrowing one concern trigger the clause-4(c)
      structural step-back.
    status: done
    depends_on: []
  - id: PB-1
    content: >-
      Explicit-seed precedence at castr's Claude SessionStart hook (parity with OCE #18
      round 8): in agent-tools/src/claude/session-identity-hook.ts, resolveSeed currently
      prefers the stripped CLAUDE_CODE_REMOTE_SESSION_ID over stdin session_id but does NOT
      consult PRACTICE_AGENT_SESSION_ID_CLAUDE. PDR-027 requires every explicit
      PRACTICE_AGENT_SESSION_ID_* seed to outrank the ambient platform id at EVERY
      seed-consuming seam. Bring the precedence to explicit -> stripped remote -> stdin,
      add PRACTICE_AGENT_SESSION_ID_CLAUDE to ClaudeSessionIdentityHookEnvironment and to
      claudeSessionIdentityHookEnvironmentFromProcessEnv, red-first tests mirroring OCE's
      (agent-tools/tests/claude/session-identity-hook.unit.test.ts in OCE commit
      4ccf72a39 is the reference).
    status: pending
    depends_on: []
  - id: PB-2
    content: >-
      Explicit-seed precedence at castr's statusline composed path (parity with OCE #18
      rounds 4/8): VERIFIED 2026-08-25 — the precedence does NOT currently hold. Castr's
      statusline-identity.ts forwards only CLAUDE_CODE_REMOTE_SESSION_ID into the planner
      (lines 76-78) and StatuslineEnvironment in statusline-identity-input.ts declares no
      PRACTICE_AGENT_SESSION_ID_CLAUDE field, so an explicit Practice seed cannot win on
      the composed path. The deliverable is the wiring: add
      PRACTICE_AGENT_SESSION_ID_CLAUDE to StatuslineEnvironment, forward it at the caller,
      resolve explicit -> stripped remote -> stdin (OCE's statusline-emit.ts and
      statusline-identity-input.ts at 4ccf72a39 are the reference), plus a red-first
      composed-path test proving the explicit seed outranks the remote id.
    status: pending
    depends_on: []
  - id: PB-3
    content: >-
      Cursor bin env selector (parity with OCE #18 round 6): OCE exports
      cursorSessionIdentityHookEnvironmentFromProcessEnv forwarding all consumed vars
      including the operator override, and the bin uses it (hand-picked-bin-env defect
      class: hand-picking at the bin boundary is how CLAUDE_CODE_REMOTE_SESSION_ID was
      silently dropped once). Mirror in castr's cursor hook bin: exported selector
      forwarding ENGRAPH_AGENT_IDENTITY_OVERRIDE alongside the rest, bin builds its
      planner environment through it, with a selector unit test.
    status: pending
    depends_on: []
  - id: PB-4
    content: >-
      register-identity-on-thread-join rule wording (parity with OCE #18 round 7):
      .agent/rules/register-identity-on-thread-join.md (and its generated adapters) says
      the prefix is the "first 6 of harness session ID"; PDR-027 now seeds from the
      platform session id on cloud seats. Reword to name the PDR-027 seed, regenerate
      adapters (pnpm agents:adapter-generate). OCE commit acbc8d638 is the reference text.
    status: pending
    depends_on: []
  - id: PB-5
    content: >-
      Session-cache test negative pin (parity with OCE #18 round 3): VERIFIED 2026-08-25 —
      both conditions hold, so the task is unconditional. Castr's
      agent-tools/tests/agent-identity/session-cache.integration.test.ts carries the
      negative assertion (expect(plan.output.env).not.toHaveProperty(
      'ENGRAPH_AGENT_IDENTITY_OVERRIDE'), line 23) and castr's testing-strategy.md
      "Prove behaviour, never config or content" clause (lines 41-49) forbids exactly
      that shape. Remove the negative pin, citing the testing-strategy warrant in the
      commit body; the subsequent CLI-composition assertion in the same test already
      proves seed-only coherence behaviourally.
    status: pending
    depends_on: []
  - id: HO-2
    content: >-
      Not-applicable ledger (verified 2026-08-25, do not re-derive): OCE rounds 4-5 shim
      fixes do not transfer — castr's .claude/hooks identity shim is a passthrough with no
      raw-source import of TypeScript modules, and castr's statusline emit caller was
      already correct. Castr has no spawn/ module (OCE's spawn brief fix has no castr
      counterpart). OCE's naming schemas needed no castr-direction change (v2 was already
      OCE's active schema and is now castr's). Close this todo by confirming the ledger
      still holds at execution time.
    status: pending
    depends_on: []
---

# Practice equality instalment 2 — cross-estate parity follow-up (handoff)

Instalment 1 unified the identity seed rule and transplanted the cognition skill tree
(castr PR #54, merged; OCE PR #18, open at handoff). Driving OCE #18 through review
hardened the OCE landing beyond the castr one: eight review rounds produced fixes in OCE
that castr does not yet mirror. This plan is the self-contained handoff for closing that
gap, written so an agent with no session context can execute it from this file plus the
referenced commits.

## How to pick this up cold

1. Read this file's todos and
   `../complete/practice-equality-identity-and-cognition.md` (instalment 1)
   for the doctrine background; PDR-027's 2026-08-24 amendment is the governing rule.
2. HO-1 is DONE: OCE PR #18 merged 2026-08-25 (merge commit 42d6a6bf). The remaining
   work is the castr PB batch plus the HO-2 confirmation.
3. The OCE branch `claude/cloud-seat-identity-seed` (head `4ccf72a39`, now merged into
   `engraph`) is the reference implementation for every PB todo; each todo names its
   reference commit or file.
4. Work on castr's designated branch conventions (fresh branch off `main`), red-first per
   the TDD rules, full local gate before push, one PR for the batch.

## End goal

Every fix a review round produced in one estate exists in the other (or is recorded here
as verified not-applicable), so the two Practice cores remain equal in capability — the
equality directive's definition of done for this instalment.

## Non-goals

- Any new identity or naming behaviour beyond what OCE #18 already landed.
- Retroactive changes to registered identities or historical collaboration rows.
- OCE-side changes (OCE #18 already carries the full set; only HO-1 touches OCE).

## Acceptance criteria (proof contract)

- PB-1/PB-2/PB-3 (`unit`): red-first tests green in agent-tools proving explicit-seed
  precedence at hook and statusline seams and total env forwarding at the cursor bin;
  proven by `pnpm --filter @engraph/agent-tools test`.
- PB-4 (`non-code`): rule text names the PDR-027 seed; adapters regenerated in lockstep;
  proven by `pnpm agents:adapter-generate` producing no further diff plus
  `pnpm portability:check` green, and
  `grep -L "harness session ID" .agent/rules/register-identity-on-thread-join.md`
  listing the file (the stale phrase gone).
- PB-5 (`unit`): the negative pin removed with the testing-strategy warrant cited in the
  commit body; proven by
  `grep -c "not.toHaveProperty" agent-tools/tests/agent-identity/session-cache.integration.test.ts`
  returning 0 and `pnpm --filter @engraph/agent-tools test` green.
- HO-1 (`value-proxy`): OCE #18 MERGED — the merge is the only completion signal; a
  recorded blocking state keeps HO-1 pending (continuity evidence, never completion).
  MET 2026-08-25: merge commit 42d6a6bf on `engraph`.
- HO-2 (`non-code`): the not-applicable ledger re-confirmed at execution time; proven by
  a dated confirmation note in the executing session's commit body (or a corrected
  ledger entry if any row no longer holds).
- Every cycle: `pnpm check` (the canonical aggregate gate) green before its commit; no
  skipped tests.

## Prerequisite classification

- OCE #18 merged (HO-1) — **blocking** for the equality claim, and MET (2026-08-25,
  merge commit 42d6a6bf): the PB batch mirrors fixes that exist on `engraph` only via
  that merge.
- Instalment 1 merged in castr (PR #54) — **blocking**, met before authoring.
- The Practice Repos cloud environment — **beneficial**: the PB batch runs in any
  container that can run `pnpm check`; without the managed environment, apply the
  default-container cures recorded in HO-1. Minimum shippable shape without it: the
  cures applied by hand.

## Foundation alignment

- `principles.md` — strict and complete at every boundary; the PB batch adds no
  escape hatches, only precedence wiring and its proofs.
- `testing-strategy.md` — red-first TDD for PB-1/PB-2/PB-3; PB-5 executes the
  "prove behaviour, never config or content" clause (lines 41-49) directly.
- PDR-027 (2026-08-24 amendment) — the governing identity doctrine every todo serves.

## Plan-body first-principles check

Fires before executing any PB todo: the shape clause (each todo is a single-seam
change with its paired test — reject any drift toward a combined refactor); the
landing-path clause (one PR for the batch, `pnpm check` before push); the
vendor-literal clause (OCE reference file paths and commit `4ccf72a39` are read at
execution time, never trusted from this plan's prose if the tree has moved).

## Readiness reviewers

This is a handoff record born from an executed review arc, not a
DECISION-COMPLETE claim. Before the executing session starts the PB batch it invokes
`code-reviewer` on the diff as usual; `assumptions-expert` review is owed only if the
executor widens scope beyond the five PB todos. The plan itself was hardened by two
automated review rounds on PR #57 (Codex + Copilot, all findings dispositioned).

## Learning Loop

On completion of the PB batch: run the consolidation workflow (`consolidate-docs`)
over the napkin entries the batch produces, and record the instalment's close in
`repo-continuity.md` and this file's status before moving it to
`current/complete/`.

## Lifecycle triggers

Per `templates/components/lifecycle-triggers.md`: session close during the batch
runs `session-handoff`; plan completion moves this file to `current/complete/` and
updates the equality-directive thread in `repo-continuity.md`; the paused state
carries the named sequence position in the frontmatter (no undefined "later").

## Risks

- **Assumed symmetry** (PB-2, PB-5): castr and OCE differ in module layout (statusline
  caller, shim shape). PB-2 and PB-5 are now verified-stated (2026-08-25) rather than
  conditional; the not-applicable ledger (HO-2) records what was already checked so it
  is not re-derived wrongly from memory.
- **Convergence pressure on cross-estate PRs** (HO-1, historical): review bots may keep
  producing rounds. ADR-051 clause 4 (as amended 2026-08-24) is the stop rule —
  blocking defects fixed or escalated after the cap, non-blocking refinements
  carry-forward-dispositioned per finding, clause-4(c) structural step-back on
  consecutive same-concern narrowing.
