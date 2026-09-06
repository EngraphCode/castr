# Castr correction

## Current continuation

- Branch: `codex/castr-local-checkout` (refreshed onto main merge `SHA:3ad2ab5d`).
- Controlling queue: [parent plan](../../../plans/proof-programme/parent-plan.md#current-execution-state).
- Acceptance: [correction delivery plan](../../../plans/active/castr-documentation-and-fidelity-correction.md).
- PR custody: [delivery ledger](../../../plans/delivery-ledger.md).
- Landing target: C03a documents and demonstrates the local-checkout workflow, publication state and actual entry surface.
- Next safe step: validate and deliver C03a through the reviewed PR lifecycle; preserve C03b/c as distinct subsequent outcomes.
- Team: root coordinates foundation/integration/gates; delegated source mapping has one owned manifest; reviewers are read-only. Re-read actual claims before writing.
- Source: PR #81 at `SHA:33be633862864ce8efb22e70abbbe9bce863c510`, never rewritten.
- Scheduled execution remains paused; interactive implementation and merges are authorised.

C01R and Q-19 landed, and PR #82’s late findings are settled; the ledger carries exact proof. C05 owns the remaining opening
attribution cleanup in the PR skill. C10 owns the observed review-wave
supersession failure; batch any further fixes only after the current review and CI
wave completes. The local-checkout source draft and extracted C03a worktree remain
separate, with API/options and response/transport/MCP guides assigned to C03b/c.

## Preparation retained for later slices

C03a’s fresh worktree demonstrated build, CLI generation, strict compilation,
successful parsed values, distinguishing invalid witnesses, deterministic bytes
and actionable missing-input failure. An isolated local-pack rehearsal also passed
from the preserved draft; C10 still requires the final-main committed-fixture run.
C04a can consolidate three duplicate ADRs into their originals and repair three
exact ADR links without importing unrelated stale successor-plan wording.

C08/Q-016 preparation reproduced an additional enforcement gap on `SHA:e025d233`:
ESLint boundary folder patterns ending in `/**/*` leave direct children unknown.
Root-folder descriptors reveal parser dependencies from context and six writer
contract dependencies on context, alongside the known conversion edges. Its
closing proof must cover real resolver and element classification, type imports,
re-exports and production-to-test-helper dependencies. The correction plan retains
this discovery for the architectural repair; no implementation is claimed here.

## Participating agent identities

| Agent                 | Platform | Model       | Session prefix | Agent UUID                           | Role                        | First session | Last session |
| --------------------- | -------- | ----------- | -------------- | ------------------------------------ | --------------------------- | ------------- | ------------ |
| Bora seeks Turbulence | codex    | gpt-6-astra | 01a072         | 2b847d50-adfe-50d7-a93c-c5ac58ba45a2 | coordinator and PR shepherd | 2026-09-06    | 2026-09-06   |
