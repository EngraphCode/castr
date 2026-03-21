# Session Entry Point: @engraph/castr

**Use this prompt to start a new work session.**

---

## What This Library Does

Transforms data definitions between supported formats via a canonical Intermediate Representation (IR):

```text
Any Input Format -> Parser -> IR (CastrDocument) -> Writers -> Any Output Format
```

Notes:

- TypeScript and Zod code generation use `ts-morph`
- OpenAPI output is produced as a typed object model
- JSON Schema output is produced as plain JSON Schema 2020-12 objects

---

## Critical Rules

1. After parsing, input is discarded. Only the IR matters.
2. No content loss by default. Lossy behaviour must be explicit and governed.
3. Unsupported or invalid behaviour must fail fast with a helpful error.
4. Output must be deterministic.
5. Parsers and writers must stay in lockstep around canonical supported patterns.
6. No escape hatches in product code: no non-const assertions, `any`, `!`, or lint-disables to hide architecture problems.
7. TDD at all levels.
8. All quality-gate failures are blocking.

---

## This Session: Post Rescue-Loop Redesign — Next Slice Selection

### Plan Of Record (Completed 2026-03-20)

- [zod-limitations-next-atomic-slice-planning.md](../plans/active/zod-limitations-next-atomic-slice-planning.md)

### Immediate Predecessor

- [doctor-runtime-characterisation-and-transform-proof-budget-decision.md](../plans/current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md)

### Durable Doctrine Sources To Re-Read First

- [native-capability-matrix.md](../../docs/architecture/native-capability-matrix.md)
- [zod-round-trip-limitations.md](../../docs/architecture/zod-round-trip-limitations.md)
- [ADR-031](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-032](../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md)
- [ADR-035](../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)
- [ADR-039](../../docs/architectural_decision_records/ADR-039-uuid-subtype-semantics-and-native-only-emission.md)
- [ADR-041](../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md)

## Current Repo Truth (Thursday, 20 March 2026)

Recent completed slices:

- the doctor runtime-characterisation slice is complete:
  - `repairOpenApiDocumentWithRuntimeDiagnostics()` now exposes clone / validate / rescue / upgrade timings without changing `repairOpenApiDocument()` behavior
  - `pnpm --dir lib doctor:profile` now provides a stable JSON runtime snapshot for the pathological fixture
  - the slice ended with one clear decision: doctor rescue-loop redesign is next; harness splitting is not
  - the full repo-root Definition of Done chain completed green during that slice on Friday, 13 March 2026
  - no repo changes have occurred between 13 March and 20 March 2026; working tree is clean
  - manual `code-reviewer`, `test-reviewer`, and `type-reviewer` coverage for that slice is complete
- the earlier `int64` / `bigint` remediation slice remains complete:
  - IR keeps first-class `integerSemantics`
  - `int64` and `bigint` remain distinct semantics
  - valid serialised IR documents containing preserved raw OpenAPI components now deserialize cleanly
  - raw OpenAPI `$ref` plus sibling integer-format schemas now fail fast for OpenAPI 3.1 capability checks
  - JSON Schema `$ref` plus sibling `int64` / `bigint` schemas now reject before the plain-ref early return
  - closure review for that slice was also completed manually in-session on Friday, 13 March 2026

The current active entrypoint is next-slice selection after the completed doctor rescue-loop runtime redesign. The plan was completed, implemented, and verified on 2026-03-20.

User-reported issue rule:

- if the user says there are gate or runtime issues, treat that as active session truth that must be reproduced immediately
- do not use an earlier local green run to dismiss a user-reported failure
- record the difference honestly as "last reproduced locally" versus "currently user-reported"

### Current runtime context

Doctor rescue-loop redesign was completed in-session on Thursday, 20 March 2026. The implementation used Family 1 (All-Errors Preflight Batch Rescue) with a repo-local AJV `allErrors: true` validator.

Post-implementation results:

- `pnpm --dir lib doctor:profile` now shows `31.79ms` nonStandardRescue (was `20,770ms`)
- `rescueRetryCount` is now `1` (was `1,159`)
- `warningCount` is now `1,954` (was `1,159`) because the preflight finds more properties
- refreshed timings now show:
  - isolated `doctor.integration.test.ts`: `0.53s real` (was `23.76s`)
  - full `pnpm test:transforms`: `6.92s real` (was `25.88s`)
- the doctor-proof timeout has been reduced from `60s` to `10s` (the proof runs in ~0.5s)
- harness splitting remains unnecessary
- recursive preserving-mode emission remains historical under ADR-040 and is not the active candidate

The paused umbrella and supporting investigations still matter:

1. [zod-limitations-architecture-investigation.md](../plans/current/paused/zod-limitations-architecture-investigation.md)
2. [recursive-unknown-key-preserving-zod-emission-investigation.md](../plans/current/paused/recursive-unknown-key-preserving-zod-emission-investigation.md)
3. [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md)

## Immediate Priority

The rescue-loop redesign is complete. The next session should select the next honest atomic slice from the paused investigations.

Do this:

1. reproduce any fresh user-reported issue immediately
2. if no fresher issue supersedes, review the paused investigations and select the next slice
3. the doctor-proof timeout has already been reduced from `60s` to `10s`
4. keep the transform harness unchanged unless new evidence disproves the current state

## What This Session Should Do

1. Read the completed plan and the paused context.
2. Re-read the durable doctrine sources named above.
3. Do not reopen the completed `int64` / `bigint` or rescue-loop slices unless new evidence disproves their green closure state.
4. If the user reports a fresh gate or runtime issue, reproduce it first.
5. Otherwise:
   1. review the paused investigations for the next honest atomic slice
   2. plan and propose the next concrete entrypoint
   3. keep this prompt and the roadmap aligned with the result
6. Start from:
   - `.agent/plans/active/zod-limitations-next-atomic-slice-planning.md` (completed 2026-03-20)
   - `.agent/plans/current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md`
   - `.agent/plans/current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md`
   - `.agent/plans/current/complete/int64-bigint-semantics-investigation.md`
   - `.agent/memory/napkin.md`
7. Keep the handoff accurate:
   - keep the active plan concrete and keep the completed predecessor chain explicit
   - record planning and review state in `.agent/memory/napkin.md`

## Quality Gates

Canonical definition: [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)

Run from repo root in strict order:

- `pnpm clean`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm format:check`
- `pnpm type-check`
- `pnpm lint`
- `pnpm madge:circular`
- `pnpm madge:orphans`
- `pnpm depcruise`
- `pnpm knip`
- `pnpm portability:check`
- `pnpm test`
- `pnpm character`
- `pnpm test:snapshot`
- `pnpm test:gen`
- `pnpm test:transforms`

Treat every failure as blocking.

## Review State

Current honest state:

- the doctor rescue-loop redesign slice is complete (implemented and verified 2026-03-20)
- the full repo-root Definition of Done chain was verified green on 2026-03-20
- the doctor runtime-characterisation slice review is complete
- the earlier `int64` / `bigint` closure review is also complete
- the next session does not owe reviewer closure before selecting the next slice

## Paused Context That Still Matters

- [recursive-unknown-key-preserving-zod-emission-investigation.md](../plans/current/paused/recursive-unknown-key-preserving-zod-emission-investigation.md)
- [zod-limitations-architecture-investigation.md](../plans/current/paused/zod-limitations-architecture-investigation.md)
- [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md)

## Follow-On Work, Not A Blocker Here

- [temporal-first-js-ts-date-time-doctrine.md](../plans/future/temporal-first-js-ts-date-time-doctrine.md)

Custom portable types remain deliberately unsupported for now and are not a planned workstream.

## Essential Reading

1. [roadmap.md](../plans/roadmap.md)
2. [requirements.md](../directives/requirements.md)
3. [principles.md](../directives/principles.md)
4. [testing-strategy.md](../directives/testing-strategy.md)
5. [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)
