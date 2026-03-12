# Plan (Complete): Type-Safety Remediation

**Status:** Complete  
**Created:** 2026-03-09  
**Last Updated:** 2026-03-10  
**Predecessor:** [3.3a-07-remove-escape-hatches.md](./3.3a-07-remove-escape-hatches.md)  
**Successor:** [strict-object-semantics-enforcement.md](./strict-object-semantics-enforcement.md)  
**Related:** `../../../directives/principles.md`, `../../../directives/testing-strategy.md`, `../../../directives/requirements.md`, `../../../directives/DEFINITION_OF_DONE.md`, `../paused/transform-proof-budgeting-and-runtime-architecture-investigation.md`, `./type-safety-remediation-follow-up.md`

---

## Summary

This workstream is complete.

It restored the repo's actual type-safety doctrine and then cleared the remaining test, fixture, and harness assertion backlog without weakening behavior proofs or widening types.

The final doctrinal state is:

1. `as const` is allowed and remains governed literal-preservation infrastructure.
2. Non-const type assertions remain forbidden:
   - `value as SomeType`
   - `<SomeType>value`
   - chained casts such as `as unknown as`
3. `unknown` is allowed only at incoming external boundaries and must be validated immediately.
4. After validation, types stay strict and we never throw away type information for any reason.

The completed residual execution handoff is captured in [type-safety-remediation-follow-up.md](./type-safety-remediation-follow-up.md).

---

## User Impact Delivered

Contributors now have a strict type-safety contract that is:

- correct
- mechanically enforced
- aligned across prompts, plans, and lint rules
- explicit about `as const` versus real type reinterpretation
- hostile to type-information loss, loose post-boundary typing, and cast-based recovery

---

## Completion Outcome

- doctrinal wording is aligned across prompt, roadmap, lint guidance, and complete-plan records
- ESLint enforcement allows `as const` while rejecting non-const assertions
- product-code, test, fixture, and harness remediation tranches are complete
- repo-root `pnpm lint` is fully clean again
- `@typescript-eslint/consistent-type-assertions` is restored to `error`
- the next session has one obvious primary entrypoint: the active Zod limitations architecture investigation

---

## Final Tranche Status

### Tranche 0 — Doctrinal Realignment

Complete.

### Tranche 1 — Lint Rule Repair

Complete.

### Tranche 2 — Product-Code Type-Safety Remediation

Complete.

### Tranche 3 — Test And Harness Remediation

Complete.

Completed clusters:

- Characterisation boundary
- MCP from-IR
- Shared loader and utility
- Snapshot regression
- Remaining parser/writer low-count cluster

### Tranche 4 — Durable Documentation And Handoff

Complete.

Delivered outputs:

- session entrypoint repointed to the successor workstream
- roadmap repointed to the successor workstream
- completed type-safety plans moved out of `active/`

---

## Verification Summary

- `pnpm type-check` green
- `pnpm format:check` green
- `pnpm lint` fully clean
- `pnpm test` green
- `pnpm check:ci` green
- targeted default-suite proof for the closing parser/writer cluster green
- transforms-suite proof for `scenario-1-openapi-roundtrip.integration.test.ts` green
- `eslint-rules/type-assertion-policy.test.ts` green after restoring rule severity

---

## Successor Note

This plan is complete and no longer belongs in `active/`.

The next primary workstream after this slice was [strict-object-semantics-enforcement.md](./strict-object-semantics-enforcement.md), with [recursive-unknown-key-preserving-zod-emission-investigation.md](../paused/recursive-unknown-key-preserving-zod-emission-investigation.md), [zod-limitations-architecture-investigation.md](../paused/zod-limitations-architecture-investigation.md), and [transform-proof-budgeting-and-runtime-architecture-investigation.md](../paused/transform-proof-budgeting-and-runtime-architecture-investigation.md) remaining supporting context.
