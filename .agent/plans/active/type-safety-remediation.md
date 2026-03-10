# Plan (Active): Type-Safety Remediation

**Status:** Active  
**Created:** 2026-03-09  
**Last Updated:** 2026-03-10  
**Predecessor:** [3.3a-07-remove-escape-hatches.md](../current/complete/3.3a-07-remove-escape-hatches.md)  
**Related:** `../../directives/principles.md`, `../../directives/testing-strategy.md`, `../../directives/requirements.md`, `../../directives/DEFINITION_OF_DONE.md`, `../current/paused/zod-limitations-architecture-investigation.md`, `../current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md`

---

## Summary

This plan is now the **primary active atomic slice**.

Its job is to restore and enforce the repo's actual type-safety doctrine after the current session drifted into an incorrect premise.

The doctrinal correction is locked in:

1. `as const` is **allowed** and is treated as governed compile-time literal-preservation infrastructure.
2. Non-const type assertions remain forbidden:
   - `value as SomeType`
   - `<SomeType>value`
   - chained casts such as `as unknown as`
3. `unknown` is allowed only at external system boundaries and must be validated immediately.
4. After validation, types must remain precise. Do not widen, degrade, or recover meaning later with casts.

The doctrinal and lint-policy repair work is now complete. The remaining active work is the residual test, fixture, and harness remediation captured in [type-safety-remediation-follow-up.md](./type-safety-remediation-follow-up.md).

Paused Zod investigation context remains important, but it is **not** the next atomic slice. Resume that work only after this remediation establishes a trustworthy type-safety baseline again.

---

## User Impact To Optimize For

Give contributors a strict type-safety contract that is:

- correct
- mechanically enforced
- aligned across prompts, plans, and lint rules
- narrow enough to preserve legitimate infrastructure like `as const`
- strong enough to ban real type-information loss and escape-hatch behavior

The repo should stop producing contradictory guidance such as "ban all `as`" in one place and "allow `as const`" in another.

---

## Scope

In scope:

- re-aligning planning and prompt artifacts with the true doctrine
- restoring lint enforcement so `as const` is allowed but non-const assertions are rejected
- repo-wide inventory of real type-safety violations once the lint rule is corrected
- remediation planning and execution ordering for illegal assertions and post-boundary type information loss
- strict replacement patterns:
  - typed constructors
  - explicit annotations
  - user-defined type guards
  - immediate boundary validation
  - `satisfies`
  - precise helper abstractions
- review cadence for type-heavy work

Out of scope:

- banning `as const`
- compatibility layers or permissive fallback typing
- resuming paused Zod limitation implementation before this plan stabilizes enforcement
- treating generated fixture output as justification for weakening doctrine

---

## Non-Negotiable Rules

1. `as const` remains allowed.
2. Other type assertions remain banned in product code and should be removed from tests unless a boundary-focused test genuinely requires invalid external input; even then, prefer `unknown`-typed variables plus validation or `@ts-expect-error` at the call site over assertions.
3. `any`, non-null assertions, and rule-disabling workarounds remain banned in product code.
4. `unknown` may only appear at ingress boundaries to external systems and must be validated immediately.
5. No type information may be discarded and recovered later by casting.
6. Fix architecture, helper APIs, or boundary validation. Do not patch over type mismatches with assertions.

---

## Reviewer And Specialist Invocation

Read and apply `.agent/rules/invoke-reviewers.md`.

Required cadence:

- after each non-trivial tranche, invoke `code-reviewer` first
- invoke `type-reviewer` for every tranche in this plan
- invoke `test-reviewer` whenever tests, fixtures, lint assertions, or boundary-harness proofs change
- invoke `zod-expert`, `openapi-expert`, or `json-schema-expert` only if a remediation tranche touches their semantic surfaces

---

## Working Assumptions To Validate First

1. The current repo doctrine already intended the `as const` exception; the drift happened in session guidance and lint expansion, not in the underlying architecture values.
2. The largest remaining violation class is test-fixture and harness code, not core product code.
3. A meaningful subset of current violations can be removed by better typed construction and boundary validation, not by introducing new helper indirection everywhere.
4. The repo needs a governed distinction between:
   - literal-preservation infrastructure (`as const`)
   - forbidden type reinterpretation (`as SomeType`)

## Progress Update (2026-03-10)

- Tranche 0 is complete: doctrinal wording is aligned across prompt, roadmap, lint guidance, and durable docs.
- Tranche 1 is complete: ESLint enforcement now allows `as const` while rejecting non-const assertions, and the config-proof test exists in `lib/eslint-rules/type-assertion-policy.test.ts`.
- Tranche 2 is complete by proof: product-code remediation is no longer the blocker, and `pnpm type-check` is green.
- Tranche 3 is partially complete: the Characterisation boundary and MCP from-IR clusters landed cleanly, and `49` residual non-const assertion sites remain in tests, fixtures, and harness code.
- The type-assertion policy is temporarily surfaced as warnings while that residual backlog is being removed.
- The downstream full-gate recovery slice is complete: `pnpm test` and `pnpm check:ci` are green again after repairing the JSON Schema normalization cycle, Knip truth, and the default-suite runtime hotspots.
- The next execution slice inside Tranche 3 is the Shared loader and utility cluster recorded in [type-safety-remediation-follow-up.md](./type-safety-remediation-follow-up.md).
- The current execution handoff and cluster order live in [type-safety-remediation-follow-up.md](./type-safety-remediation-follow-up.md).

---

## Tranche Plan

### Tranche 0 — Doctrinal Realignment (Complete)

1. Correct all active-session guidance so it matches the true rule:
   - `as const` allowed
   - non-const assertions banned
2. Ensure roadmap, active plan stack, and session-entry prompt agree on the same primary plan and doctrine.
3. Confirm that paused Zod workstreams are clearly labeled as paused rather than implicitly active.

Review checkpoint:

- `code-reviewer`
- `type-reviewer`

### Tranche 1 — Lint Rule Repair (Complete)

1. Write failing lint-focused proofs first:
   - `as const` accepted
   - `as Type` rejected
   - `as unknown as` rejected
2. Repair ESLint enforcement so it encodes the real doctrine and does not over-ban literal infrastructure.
3. Remove any compensating prompt or local-rule workarounds created by the incorrect blanket ban.

Review checkpoint:

- `code-reviewer`
- `type-reviewer`
- `test-reviewer`

### Tranche 2 — Product-Code Type-Safety Remediation (Complete)

1. Inventory illegal product-code assertion sites after Tranche 1.
2. Group them by replacement family:
   - boundary validation missing
   - helper return typing missing
   - generic constraint too weak
   - typed constant/union modeling missing
   - wrong intermediate representation shape
3. Remediate highest-signal product-code clusters first.

Review checkpoint:

- `code-reviewer`
- `type-reviewer`

### Tranche 3 — Test And Harness Remediation (Active)

1. Remove non-const assertions from tests, harnesses, fixtures, and characterization coverage where practical.
2. Preserve behavior-focused testing:
   - invalid external inputs should be represented as `unknown` boundary data
   - call sites may use `@ts-expect-error` when the proof requires intentionally invalid external input
   - do not add assertion-heavy test scaffolding
3. Keep `as const` where literal preservation is genuinely part of the test subject or fixture infrastructure.

Review checkpoint:

- `code-reviewer`
- `type-reviewer`
- `test-reviewer`

### Tranche 4 — Durable Documentation And Handoff (In Progress)

1. Update any doctrine-bearing durable docs that still blur `as const` and real type assertions.
2. Record the final allowed-vs-banned matrix in the durable location that future sessions actually read.
3. Re-point the next session either back to paused Zod work or to a follow-on type-safety tranche, whichever remains primary.

Review checkpoint:

- `code-reviewer`
- `type-reviewer`

---

## TDD Order

1. Failing lint / enforcement proof
2. Minimal lint-rule correction
3. Failing product-code type-safety proof for the current cluster
4. Minimal strict remediation
5. Refactor into shared typed helpers only after the behavior and enforcement are proven

---

## Documentation Outputs

Required:

- `.agent/prompts/session-entry.prompt.md`
- `.agent/plans/roadmap.md`
- this plan

Conditional, if doctrine wording is still ambiguous after implementation:

- `.agent/directives/principles.md`
- `.agent/prompts/start-right.prompt.md`
- any durable architecture doc that incorrectly says "ban all `as`"

---

## Success Criteria

1. The active planning stack names this plan as the sole primary active plan.
2. Session-entry guidance clearly states that `as const` is allowed and real type assertions are not.
3. ESLint enforcement allows `as const` while rejecting non-const assertions.
4. The repo has a clear, ordered inventory of remaining true type-safety violations after lint repair.
5. Each remediation tranche replaces illegal assertions with typed construction or boundary validation rather than new escape hatches.
6. Paused Zod workstreams remain linked and resumable, but no longer dilute the next-session entrypoint.

---

## Completion Criteria

This plan is complete when:

1. doctrinal alignment is restored across prompt, roadmap, lint, and plan artifacts
2. the first meaningful illegal-assertion remediation tranche is completed and reviewed
3. the next session has one obvious primary entrypoint with no ambiguity about `as const`

If repo-wide remediation remains, create a successor active plan rather than leaving the remaining work implicit.
