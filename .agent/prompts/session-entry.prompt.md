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

## This Session: Architecture Review Packs — Post-IDENTITY Audit

### Active Plan

- [architecture-review-packs.md](../plans/active/architecture-review-packs.md)

### Dedicated Review Prompt

- [architecture-review-packs.prompt.md](./architecture-review-packs.prompt.md)

### Canonical Identity

- [IDENTITY.md](../IDENTITY.md)

### Immediate Predecessor

- [identity-doctrine-alignment.md](../plans/current/complete/identity-doctrine-alignment.md)

### Paused Successor

- [json-schema-parser.md](../plans/current/paused/json-schema-parser.md)

### Durable Doctrine Sources To Re-Read First

- [native-capability-matrix.md](../../docs/architecture/native-capability-matrix.md)
- [zod-round-trip-limitations.md](../../docs/architecture/zod-round-trip-limitations.md)
- [ADR-035](../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)
- [ADR-040](../../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)
- [ADR-041](../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md)

## Current Repo Truth (Saturday, 21 March 2026)

IDENTITY doctrine alignment is complete:

- `unknownKeyBehavior` is removed from IR, parsers, and writers
- parser honesty is restored: non-object IR schemas no longer get `additionalProperties: false`
- public strictness/compatibility knobs are removed (`nonStrictObjectPolicy`, `strictObjects`, `additionalPropertiesDefaultValue`)
- non-strict object input is rejected at parser boundaries
- writers emit strict-only object output (`additionalProperties: false`, `z.strictObject()`)
- `CastrSchemaProperties` detection is now brand-based and cross-realm safe
- the full repo-root Definition of Done chain was green on Saturday, 21 March 2026

The next honest work is not new implementation. It is a bounded architecture review sweep:

- the review packs must validate the repo's actual direction against code, not assumption
- the paused JSON Schema parser plan must not reactivate until the review packs say it is architecturally fit
- one review note per pack should be written under `.agent/research/architecture-review-packs/`

Recent completed slices (all gates green, all reviews closed):

- IDENTITY doctrine alignment (2026-03-21): parser honesty restored, dead strictness surfaces removed, cross-realm-safe runtime detection hardened
- Doctor rescue-loop redesign (2026-03-20): `rescueRetryCount` 1,159 → 1, `nonStandardRescue` 20,770ms → 31ms, `pnpm test:transforms` 25.88s → 6.92s
- Doctor runtime characterisation (2026-03-13): identified rescue loop as the cost centre
- int64/bigint semantics remediation (2026-03-13): first-class `integerSemantics` in IR

User-reported issue rule:

- if the user says there are gate or runtime issues, treat that as active session truth that must be reproduced immediately
- do not use an earlier local green run to dismiss a user-reported failure
- record the difference honestly as "last reproduced locally" versus "currently user-reported"

## Immediate Priority

Execute the architecture review packs in order. Start with Pack 1 and do not blend packs.

1. **Read the active plan and dedicated review prompt** — this sweep is review-first, not implementation-first.
2. **Write one note per completed pack** — use `.agent/research/architecture-review-packs/pack-<n>-<slug>.md`.
3. **Keep the JSON Schema parser paused** — Pack 4 must explicitly decide whether that plan is still architecturally sound.
4. **Update handoff docs when review truth changes** — roadmap, session-entry, and the active plan must stay honest.

## What This Session Should Do

1. Read:
   - `.agent/plans/active/architecture-review-packs.md`
   - `.agent/prompts/architecture-review-packs.prompt.md`
   - `.agent/IDENTITY.md`
   - `.agent/plans/current/paused/json-schema-parser.md`
2. If the user reports a fresh gate or runtime issue, reproduce it first.
3. Otherwise, start with Pack 1 and complete one pack note before moving to the next.
4. Keep findings evidence-backed and file-referenced; do not fix product code mid-sweep unless the user redirects.
5. Record review-state and consolidation outcomes in `.agent/memory/napkin.md`.

## Quality Gates

Canonical definition: [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)

Canonical full chain, when code changes are made:

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

For review-only changes to plans, prompts, and notes:

- `pnpm format:check`
- `pnpm portability:check`

Treat every failure as blocking.

## Review State

Current honest state:

- the full repo-root Definition of Done chain was green on Saturday, 21 March 2026
- the architecture review-pack sweep has not started yet
- the paused JSON Schema parser plan remains blocked on Pack 4's verdict
- the next implementation slice must come from review findings rather than assumption

## Closed-Out Context

All three Zod/transform investigations are now closed:

- [zod-limitations-architecture-investigation.md](../plans/current/complete/zod-limitations-architecture-investigation.md)
- [recursive-unknown-key-preserving-zod-emission-investigation.md](../plans/current/complete/recursive-unknown-key-preserving-zod-emission-investigation.md)
- [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/current/complete/transform-proof-budgeting-and-runtime-architecture-investigation.md)

Residual future threads consolidated in:

- [zod-and-transform-future-investigations.md](../plans/future/zod-and-transform-future-investigations.md)

## Follow-On Work, Not A Blocker Here

- [temporal-first-js-ts-date-time-doctrine.md](../plans/future/temporal-first-js-ts-date-time-doctrine.md)
- [zod-and-transform-future-investigations.md](../plans/future/zod-and-transform-future-investigations.md)

Custom portable types remain deliberately unsupported for now and are not a planned workstream.

## Essential Reading

1. [roadmap.md](../plans/roadmap.md)
2. [requirements.md](../directives/requirements.md)
3. [principles.md](../directives/principles.md)
4. [testing-strategy.md](../directives/testing-strategy.md)
5. [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)
