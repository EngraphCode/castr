# Next-Session Record — Practice transplant + deep enhancement

The continuity record for the single deep-enhancement thread (owner: bring the
full Practice / agentic framework / agent-tools over **and** fix castr's known
issues — one goal, not competing priorities). Indexed by
[`../repo-continuity.md § Active Threads`](../repo-continuity.md#active-threads),
which stays the source of truth for thread status; this record carries identity
history and lane state per [`README.md`](README.md) +
[PDR-027](../../../practice-core/decision-records/PDR-027-threads-sessions-and-agent-identity.md).

**Activated 2026-06-20** (Phase 8 task 5): per-thread records went live the moment
the collaboration framework that makes a second stream safe landed — task 3b
demonstrated 10 concurrent sessions are collision-safe, so the enabling trigger
fired (not speculative scaffolding; owner-directed activation). The repo ran
single-stream as a _constraint_ of the unbuilt framework, not a fit; that
constraint is now lifted, so the thread is recorded as a multi-lane container.

## Participating agent identities

Additive per PDR-027 — joining adds an identity; a matching platform/model/agent_name
updates `last_session` rather than adding a row.

| platform    | model              | session_id_prefix | agent_name            | role     | first_session | last_session |
| ----------- | ------------------ | ----------------- | --------------------- | -------- | ------------- | ------------ |
| claude-code | claude-opus-4-8-1m | 10bc66            | Ethereal Weaving Star | executor | 2026-06-20    | 2026-06-20   |

## Lanes

A lane is an independently pickup-able arc — its own state, branch, and pickup
trigger, active OR deferred. There is no single thread-level "next safe step";
several lanes can be "next" at once. Branch is `feat/transplant-engraph-practice`
for every lane (single-branch invariant) until the split-PR delivery (D3-gated).

### Lane: Phase 8 close — active (trigger: now)

- Controlling plan: [`../../../plans/transplant/08-collaboration-active.md`](../../../plans/transplant/08-collaboration-active.md) §As-built.
- Next safe step: tasks 3a/3b/4a/4b ✅ + task 6 triaged clean ✅ + task 5 records
  activated (this file). The `transplant/phase-8` tag is cuttable once a genuinely
  concurrent stream has exercised these records/lanes end-to-end (the acceptance
  bar names "records carry a genuinely concurrent stream") and `pnpm check` is
  green + reference-closure-clean at the tag.
- Acceptance bar: `pnpm check` green (all gates); reference-closure clean; tag cut.

### Lane: transplant Phase 9 — deferred (trigger: transplant phases complete)

- Controlling plan: [transplant tracker](../../../plans/transplant/README.md) + [`reference-closure.md §back-flow items`](../../../plans/transplant/reference-closure.md).
- Next safe step: Oak back-flow to a **fresh branch off Oak `main`** (destination
  owner-resolved 2026-06-19); PDR-currency sync (adopt Oak amendments).
- Acceptance bar: back-flow PR raised to Oak; castr-side closure recorded.

### Lane: D4 generic-surface back-brings — deferred (trigger: D4 / owner direction)

- Controlling plan: [`reference-closure.md`](../../../plans/transplant/reference-closure.md) (recorded by Phase 8 task 6 triage).
- Next safe step: bring the two genuinely-new Oak-pin collaboration subsystems
  task 6 found out of phase-8 scope — `archive/` (comms-archive rotation:
  `archive-move`, `disposition-policy`, `event-classification`, `event-projection`,
  `manifest`) and `provenance/` (`cited-event-provenance`, `provenance-scan`).
  castr's `.agent/state/README.md` already classifies archive-rotation as a
  forward Phase-8/D4 capability.
- Acceptance bar: each subsystem brought with TDD + wiring, or explicitly
  owner-classified DON'T-BRING.

### Lane: arc D2 / D3 — deferred (trigger: before the transplant merge, per Q-001)

- Controlling plan: transplant tracker §Deep-enhancement arc + [`delivery-ledger.md`](../../../plans/delivery-ledger.md).
- Next safe step: D2 (Node-version single-source); D3 (CI runs the full `check:ci`
  chain, SHA-pinned actions) — **D3 lands before the transplant merge** (owner,
  Q-001 resolved), enabling safe split-PR delivery.
- Acceptance bar: CI enforces `check:ci` per branch; actions SHA-pinned.

### Lane: remediation 02–07 — deferred (trigger: owner names it after the transplant)

- Controlling plan: [`../../../plans/active/02-ir-fidelity-proof-harness.md`](../../../plans/active/02-ir-fidelity-proof-harness.md) (02 active-next; 03–07 follow).
- Next safe step: the deep-review backlog (5 of 6 reproduced Criticals still
  unfixed) takes a **named position after** the full transplant (owner steer
  2026-06-19); not parked — `no-manufactured-permission` holds.
- Acceptance bar: each Critical reproduced-then-fixed with a regression test.

### Lane: explicit additional-properties feature — deferred (trigger: after positions 1–2)

- Controlling plan: [`../../../plans/current/paused/explicit-additional-properties-support.md`](../../../plans/current/paused/explicit-additional-properties-support.md).
- Next safe step: sequenced product-feature slice (a required component of the one
  deep enhancement, named position — not a paused continuity thread).
- Acceptance bar: feature lands with parser/writer lockstep + tests.

## Standing decisions this thread carries

- Single branch `feat/transplant-engraph-practice`; roll-forward only; each
  transplant phase = one atomic commit + `transplant/phase-N` tag, green-gated at
  the tag. (Full invariant set: [`../repo-continuity.md §Repo-Wide Invariants`](../repo-continuity.md#repo-wide-invariants--non-goals).)
- Delivery: D3 before merge + split reviewable PRs (owner, Q-001). Delivery
  deprioritised ("not in a rush to merge") — commits land locally, push at the
  owner's call.
- Oak pinned at `main` `ad359a4f` for Phases 6–9.
