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

## Next Session: Plan The Next Atomic Zod Limitations Slice

### Plan Of Record

- [zod-limitations-next-atomic-slice-planning.md](../plans/active/zod-limitations-next-atomic-slice-planning.md)

### Immediate Predecessor

- [int64-bigint-semantics-investigation.md](../plans/current/complete/int64-bigint-semantics-investigation.md)

### Durable Doctrine Sources To Re-Read First

- [native-capability-matrix.md](../../docs/architecture/native-capability-matrix.md)
- [zod-round-trip-limitations.md](../../docs/architecture/zod-round-trip-limitations.md)
- [ADR-031](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-032](../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md)
- [ADR-035](../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)
- [ADR-039](../../docs/architectural_decision_records/ADR-039-uuid-subtype-semantics-and-native-only-emission.md)
- [ADR-041](../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md)

## Current Repo Truth (Friday, 13 March 2026)

The `int64` / `bigint` remediation slice is complete:

- IR keeps first-class `integerSemantics`
- `int64` and `bigint` remain distinct semantics
- valid serialised IR documents containing preserved raw OpenAPI components now deserialize cleanly
- raw OpenAPI `$ref` plus sibling integer-format schemas now fail fast for OpenAPI 3.1 capability checks
- JSON Schema `$ref` plus sibling `int64` / `bigint` schemas now reject before the plain-ref early return
- the full repo-root Definition of Done chain completed green on Friday, 13 March 2026
- closure review was completed manually in-session on Friday, 13 March 2026 using the local reviewer templates instead of nested reviewer runs

The current active entrypoint is now a planning stub rather than another already-decided implementation slice.

User-reported issue rule:

- if the user says there are gate or runtime issues, treat that as active session truth that must be reproduced immediately
- do not use an earlier local green run to dismiss a user-reported failure
- record the difference honestly as "last reproduced locally" versus "currently user-reported"

### Current planning context

The next slice has not been chosen yet.

The paused umbrella and supporting investigations still matter:

1. [zod-limitations-architecture-investigation.md](../plans/current/paused/zod-limitations-architecture-investigation.md)
2. [recursive-unknown-key-preserving-zod-emission-investigation.md](../plans/current/paused/recursive-unknown-key-preserving-zod-emission-investigation.md)
3. [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md)

## Immediate Priority

The immediate priority in the next session is choosing the next smallest honest atomic slice from the paused Zod limitations workstream.

Do this:

1. reproduce any fresh user-reported issue immediately
2. if no fresher issue supersedes planning, read the active planning stub and the paused umbrella
3. decide whether the next slice should be recursive unknown-key-preserving Zod emission, transform-proof budgeting/runtime architecture, or another newly justified seam
4. write a decision-complete active plan for that slice
5. replace the planning stub once the real next slice is chosen

## What The Next Session Should Do

1. Read the active planning stub and the paused umbrella context.
2. Re-read the durable doctrine sources named above.
3. Do not reopen the completed `int64` / `bigint` slice unless new evidence disproves the now-green closure state.
4. If the user reports a fresh gate or runtime issue, reproduce it first.
5. Otherwise:
   1. compare the remaining paused seams
   2. choose the next highest-leverage atomic slice
   3. write or refine the real active execution plan for that slice
   4. update this prompt and the roadmap to point at that new plan
6. Start from:
   - `.agent/plans/active/zod-limitations-next-atomic-slice-planning.md`
   - `.agent/plans/current/paused/zod-limitations-architecture-investigation.md`
   - `.agent/plans/current/paused/recursive-unknown-key-preserving-zod-emission-investigation.md`
   - `.agent/plans/current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md`
   - `.agent/plans/current/complete/int64-bigint-semantics-investigation.md`
   - `.agent/memory/napkin.md`
7. Keep the handoff accurate:
   - replace the planning stub once the next real slice is chosen
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

- the `int64` / `bigint` closure review is complete
- review was performed manually in-session on 2026-03-13 using the local reviewer templates instead of nested reviewer runs
- one extra discriminator-validator issue surfaced during that pass, was fixed immediately, and was re-verified
- the next session does not owe reviewer closure on the completed numeric slice

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
