---
title: Practice equality instalment 2 — cross-estate parity follow-up (handoff)
status: current
lane: current
created: 2026-08-25
last_updated: 2026-08-25
owner_directive: >-
  Standing equality directive (owner, 2026-08-24, verbatim): "piece by piece, I want the
  Practice in Castr and OCE to take the best of each other, until they are Equal in
  capability." Plus the owner's 2026-08-25 safe-stop instruction: record all context and
  code in pushed PRs so a different agent on a different account can pick the work up from
  the repo alone. This plan is that handoff record.
evidence: >-
  Instalment 1 (this directory, practice-equality-identity-and-cognition.md) landed and
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
      Merge OCE PR #18 once green and mergeable (owner authorization standing: "Yes please
      drive both PRs to merge"). Head at handoff: 4ccf72a39. Known false signal: OCE's
      run-quality-gates rollup counts auto-cancelled gates on superseded heads as failure —
      verify via job logs before treating any red as real. Local OCE gate environment cures
      (container-only, no repo changes): NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt,
      COREPACK_DEFAULT_TO_LATEST=0, corepack prepare pnpm@11.1.2 pre-cached,
      TURBO_CONCURRENCY=3 (avoids OOM exit 137 in lint tasks). If a new review round
      arrives, triage per ADR-051 clause-4 convergence discipline: fix genuinely novel
      findings with one validated push; reply-and-decline findings that re-litigate
      ratified doctrine.
    status: pending
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
      rounds 4/8): OCE threads the PRACTICE_* and CLAUDE_CODE_REMOTE_SESSION_ID env values
      through its statusline planner (statusline-emit.ts). Castr's caller is
      agent-tools/src/claude/statusline-identity.ts (verified: it passes env to
      statusline-identity-input.ts, which already consumes CLAUDE_CODE_REMOTE_SESSION_ID).
      Verify the explicit PRACTICE seeds outrank the remote id on that path too, and add a
      composed-path test proving it (OCE's statusline-emit tests are the reference). If the
      precedence already holds, the test is still the deliverable.
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
      Session-cache test negative pin (parity with OCE #18 round 3): OCE removed a
      config-property negative assertion from its session-cache integration test because
      its testing-strategy forbids asserting absence of unrelated properties. Check whether
      castr's identity/session tests carry the same negative pin AND whether castr's
      testing-strategy.md carries the same clause; remove the pin only if both hold,
      otherwise record why not in the commit body. Verify first — do not assume symmetry.
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

1. Read this file's todos and `practice-equality-identity-and-cognition.md` (instalment 1)
   for the doctrine background; PDR-027's 2026-08-24 amendment is the governing rule.
2. Check OCE PR #18 first (HO-1): if unmerged, drive it to merge before or alongside the
   castr batch — the owner's merge authorization is standing.
3. The OCE branch `claude/cloud-seat-identity-seed` (head `4ccf72a39`) is the reference
   implementation for every PB todo; each todo names its reference commit or file.
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
  `pnpm --filter @engraph/agent-tools test`.
- PB-4 (`non-code`): rule text names the PDR-027 seed; adapters regenerated in lockstep.
- PB-5 (`unit` or `non-code`): pin removed with the testing-strategy warrant, or the
  asymmetry recorded.
- HO-1 (`value-proxy`): OCE #18 merged, or its blocking state recorded on the PR itself.
- Every cycle: full aggregate gate green before its commit; no skipped tests.

## Risks

- **Assumed symmetry** (PB-2, PB-5): castr and OCE differ in module layout (statusline
  caller, shim shape). Each todo says verify-first; the not-applicable ledger (HO-2)
  records what was already checked so it is not re-derived wrongly from memory.
- **Convergence pressure on OCE #18** (HO-1): review bots may keep producing rounds.
  ADR-051 clause 4 is the stop rule — decline re-litigations with a reasoned reply.
