# Plan: Recursive Unknown-Key Semantics Remediation

**Status:** ✅ Implemented  
**Priority:** High  
**Created:** 2026-03-09  
**Last Updated:** 2026-03-09  
**Parent:** [zod-limitations-architecture-investigation.md](../paused/zod-limitations-architecture-investigation.md)
**Successor Active Slice:** [strict-object-semantics-enforcement.md](./strict-object-semantics-enforcement.md)

---

## Goal

Remediate object unknown-key semantics so Zod-origin `strict`, `strip`, `passthrough`, and `catchall` behavior is preserved in IR and cross-format artifacts without silent loss.

This slice does **not** solve safe recursive passthrough / catchall Zod emission. Instead, it must make unsupported recursive output fail fast rather than silently degrading to strip-mode behavior.

This plan stays in `active/` intentionally as the completed execution record for this limitation slice while the remaining Zod limitation set is still being mapped and ordered.

## Implementation Outcome

Completed on 2026-03-09 with the following delivered:

- `unknownKeyBehavior` added to IR object schemas and validated
- Zod parser support for `strict`, `strip`, `passthrough`, and `catchall`
- OpenAPI / JSON Schema preservation via `x-castr-unknownKeyBehavior`
- Zod writer honesty for all four modes, including fail-fast recursive passthrough / catchall
- recursive strip output kept safe via bare `z.object({...})`
- new unknown-key fixture coverage plus parsed-output parity in Scenario 2 / 4 / 6

## Intent + Scope Lock

1. **User impact to optimize:** preserve legitimate Zod object semantics, including parsed-output behavior, through Castr's internal and cross-format pipeline.
2. **Right problem/right layer:** parser, IR, OpenAPI / JSON Schema preservation policy, Zod writer honesty, and transform proof architecture.
3. **Validated assumptions:** parser collapse is the first loss point; writer-only workarounds are not a full answer; parsed-output parity is required; governed extension plus fail-fast is the current architectural contract.

## Before You Start (Required)

1. Re-read:
   - `.agent/directives/principles.md`
   - `.agent/directives/testing-strategy.md`
   - `.agent/directives/requirements.md`
   - `.agent/directives/DEFINITION_OF_DONE.md`
2. Re-read:
   - `docs/architecture/recursive-unknown-key-semantics.md`
   - `docs/architecture/zod-round-trip-limitations.md`
   - `docs/architectural_decision_records/ADR-031-zod-output-strategy.md`
   - `docs/architectural_decision_records/ADR-032-zod-input-strategy.md`
   - `docs/architectural_decision_records/ADR-035-transform-validation-parity.md`
   - `docs/architectural_decision_records/ADR-038-object-unknown-key-semantics.md`

## Responsibility Boundary

This plan owns:

- `unknownKeyBehavior` introduction in IR object schemas
- Zod parser support for `strip`, `passthrough`, and `catchall`
- OpenAPI / JSON Schema governed extension preservation
- parsed-output parity proof harness and fixtures
- fail-fast Zod writer behavior for unsupported recursive passthrough / catchall emission

This plan does **not** own:

- true safe recursive passthrough / catchall Zod emission
- UUID v4 specificity
- `int64` / `bigint`

## Implementation Contract

### 1. IR shape

Add `unknownKeyBehavior` to object schemas with the exact union:

```ts
type IRUnknownKeyBehavior =
  | { mode: 'strict' }
  | { mode: 'strip' }
  | { mode: 'passthrough' }
  | { mode: 'catchall'; schema: CastrSchema };
```

Rules:

- valid only on object schemas
- `additionalProperties` remains in place for portable validation semantics
- object validation logic must reject impossible combinations deterministically

### 2. Zod parser mapping

Implement exact mappings:

- default `z.object()` -> `strip`
- `.strip()` -> `strip`
- `.strict()` -> `strict`
- `.passthrough()` -> `passthrough`
- `.catchall(schema)` -> `catchall`

No silent downgrade to `additionalProperties: true`.

### 3. OpenAPI / JSON Schema preservation

Implement the governed extension:

- key: `x-castr-unknownKeyBehavior`
- allowed values: `strip`, `passthrough`

Rules:

- do not emit the extension for `strict`
- do not emit the extension for `catchall`; standard `additionalProperties: <schema>` already carries the typed unknown-key rule
- reject unsupported extension values during parsing
- keep parsing and writing centralized; no ad-hoc keyword handling

### 4. Zod writer behavior

Non-recursive object output must emit:

- `strict` -> `.strict()`
- `strip` -> `.strip()`
- `passthrough` -> `.passthrough()`
- `catchall` -> `.catchall(schema)`

Recursive object output must behave as follows:

- `strict` and recursive getter output continue to work
- `strip` and recursive getter output continue to work
- recursive `passthrough` throws a clear fail-fast generation error
- recursive `catchall` throws a clear fail-fast generation error

Silent fallback to strip-mode output is forbidden.

### 5. Transform proof architecture

Keep validation parity and add parsed-output parity.

Add helper coverage that compares:

- `originalSchema.parse(payload)`
- `transformedSchema.parse(payload)`

for successful payloads in object unknown-key fixtures.

## Required Fixture Changes

1. Add a new happy-path fixture file:
   - `lib/tests-fixtures/zod-parser/happy-path/unknown-key-semantics.zod4.ts`
2. Add the matching expected IR file:
   - `lib/tests-fixtures/zod-parser/happy-path/unknown-key-semantics.expected.json`
3. Include at least these schemas:
   - `StripObjectSchema`
   - `PassthroughObjectSchema`
   - `CatchallObjectSchema`
   - `RecursiveStripCategorySchema`
   - `RecursivePassthroughCategorySchema`
   - `RecursiveCatchallCategorySchema`
4. Extend fixture registration in `lib/tests-transforms/utils/transform-helpers.ts`
5. Extend payload definitions in `lib/tests-fixtures/zod-parser/happy-path/payloads.ts` with:
   - validation payloads
   - parsed-output parity payloads for successful parses

## TDD Execution Plan (Red -> Green -> Refactor)

### Red

1. Add failing parser unit tests for `unknownKeyBehavior` mapping, including `.catchall(schema)`.
2. Add failing IR validation / serialization tests for the new field.
3. Add failing OpenAPI writer/parser and JSON Schema writer/parser tests for `x-castr-unknownKeyBehavior`.
4. Add failing Zod writer tests for non-recursive `.strip()`, `.passthrough()`, and `.catchall()`.
5. Add failing Zod writer tests proving recursive `passthrough` and recursive `catchall` now throw explicit errors instead of degrading silently.
6. Add failing Scenario 2 / 4 / 6 parsed-output parity tests for the new fixture.

### Green

1. Implement parser support for `unknownKeyBehavior`.
2. Implement IR model and validation support.
3. Implement centralized OpenAPI / JSON Schema governed extension handling.
4. Implement non-recursive Zod writer emission for all four modes.
5. Replace recursive writer suppression with explicit fail-fast errors for unsupported preserving modes.
6. Implement parsed-output parity helpers and make the new scenario proofs green.

### Refactor

1. Centralize unknown-key mode mapping helpers so parser and writers share one contract vocabulary.
2. Remove duplicated object unknown-key logic from parser/writer call sites.
3. Tighten docs and test naming so all four modes are referred to consistently.

## Acceptance Criteria

- Zod parser preserves `strict`, `strip`, `passthrough`, and `catchall` distinctly in IR.
- `.catchall(schema)` no longer degrades to plain `additionalProperties: true`.
- OpenAPI / JSON Schema round-trips preserve strip vs passthrough via `x-castr-unknownKeyBehavior`.
- Non-recursive Zod output emits the correct unknown-key method for all four modes.
- Recursive `passthrough` and recursive `catchall` generation fail fast with deterministic, documented errors.
- Scenario 2 / 4 / 6 prove both validation parity and parsed-output parity for the unknown-key fixture.
- No silent unknown-key semantic loss remains in the covered paths.

## Verification Protocol (One Gate At A Time)

Run from repo root in canonical order:

```bash
pnpm clean
pnpm install --frozen-lockfile
pnpm build
pnpm format:check
pnpm type-check
pnpm lint
pnpm madge:circular
pnpm madge:orphans
pnpm depcruise
pnpm knip
pnpm test
pnpm character
pnpm test:snapshot
pnpm test:gen
pnpm test:transforms
```

Analyze failures only after the full sequence completes.

## References

- `docs/architecture/recursive-unknown-key-semantics.md`
- `docs/architectural_decision_records/ADR-038-object-unknown-key-semantics.md`
