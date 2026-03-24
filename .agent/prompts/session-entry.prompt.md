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
3. Strict and complete everywhere, all the time: partial support, partial validation, partial docs, or partial proofs do not count as done.
4. Unsupported or invalid behaviour must fail fast with a helpful error.
5. Output must be deterministic.
6. Parsers and writers must stay in lockstep around canonical supported patterns.
7. No escape hatches in product code: no non-const assertions, `any`, `!`, or lint-disables to hide architecture problems.
8. TDD at all levels.
9. All quality-gate failures are blocking.

---

## Current State: Proof-System Remediation Complete — RC-3/RC-4 Next

### Completed Predecessor Plans

- [proof-system-and-doctrine-remediation.md](../plans/current/complete/proof-system-and-doctrine-remediation.md) — RC-1/RC-2 closed on Monday, 23 March 2026
- [architecture-review-packs.md](../plans/active/architecture-review-packs.md) — seven-pack sweep record

### Cross-Pack Triage (Start Here)

- [cross-pack-triage.md](../research/architecture-review-packs/cross-pack-triage.md) — root-cause clusters, dependency graph, and the slice ordering

### Next Honest Slice

- Proof-system and durable-doctrine remediation (RC-1 / RC-2) is complete.
- **RC-3 (IR and runtime validator gaps)** has a proposed plan at [ir-and-runtime-validator-remediation.md](../plans/active/ir-and-runtime-validator-remediation.md) — review and confirm before execution.
- The paused JSON Schema parser plan remains paused.

### Canonical Identity

- [IDENTITY.md](../IDENTITY.md)

### Immediate Predecessor

- [identity-doctrine-alignment.md](../plans/current/complete/identity-doctrine-alignment.md)

### Paused Successor

- [json-schema-parser.md](../plans/current/paused/json-schema-parser.md)

### Pack Notes (Reference)

- [pack-2-canonical-ir-truth-and-runtime-validation.md](../research/architecture-review-packs/pack-2-canonical-ir-truth-and-runtime-validation.md) — primary source for RC-3
- [pack-3-openapi-architecture.md](../research/architecture-review-packs/pack-3-openapi-architecture.md)
- [pack-4-json-schema-architecture.md](../research/architecture-review-packs/pack-4-json-schema-architecture.md)
- [pack-5-zod-architecture.md](../research/architecture-review-packs/pack-5-zod-architecture.md) — primary source for RC-4
- [pack-6-context-mcp-rendering-and-generated-surface.md](../research/architecture-review-packs/pack-6-context-mcp-rendering-and-generated-surface.md) — primary source for RC-5

## Current Repo Truth (Monday, 23 March 2026)

IDENTITY doctrine alignment is complete:

- `unknownKeyBehavior` is removed from IR, parsers, and writers
- parser honesty is restored: non-object IR schemas no longer get `additionalProperties: false`
- public strictness/compatibility knobs are removed (`nonStrictObjectPolicy`, `strictObjects`, `additionalPropertiesDefaultValue`)
- non-strict object input is rejected at parser boundaries
- writers emit strict-only object output (`additionalProperties: false`, `z.strictObject()`)
- `CastrSchemaProperties` detection is now brand-based and cross-realm safe
- the full repo-root Definition of Done chain was rerun green on Monday, 23 March 2026

Proof-system and durable-doctrine remediation (Slice 1) is complete:

- `vitest.e2e` is fixed and promoted to the canonical gate chain (`pnpm test:e2e`)
- `ir-fidelity.test.ts` now asserts IR structural equality (the correct property), not code-gen identity
- `openapi-fidelity.test.ts` moved from `src/tests-e2e/` to `tests-e2e/`
- `test:scalar-guard` documented as off-chain development aid
- CLI identity changed from `data-descriptions-tooling` to `castr`
- acceptance criteria, ADR-035, and transform README already had current-state caveats from prior sessions
- `pnpm qg` is green with the new `test:e2e` gate

Pack verdicts from the architecture review sweep:

- Pack 1 (`yellow`): package entrypoints and dependency boundaries are disciplined; CLI identity drift fixed (now `castr`); public docs may still drift on some claims
- Pack 2 (`red`): runtime IR validation still accepts malformed schema shapes, object-closure doctrine is not enforced consistently, and the runtime validator rejects supported `trace` operations
- Pack 3 (`red`): reusable `components.requestBodies` are parsed into IR, dropped on OpenAPI egress, and not asserted by the output-coverage proof suite
- Pack 4 (`red`): JSON Schema parser/writer/proof code exists, but `parseJsonSchemaDocument()` is only a `$defs` extractor, unsupported surfaces are not rejected explicitly enough, and the proof/doc story over-claims the supported contract
- Pack 5 (`red`): contradictory strict-object chains are still accepted, unsupported nested Zod members can be silently dropped, helper-format support is wider than the writer/proof lockstep, and the proof/docs story still over-claims semantic parity
- Pack 6 (`red`): `schemas-only` and custom-template entrypoints are not honest public surfaces, MCP schemas bypass the governed Draft 07 contract, and the generated-output proof story still over-claims runtime coverage
- Pack 7 (`red` → partially remediated): proof gate-chain honesty restored; remaining doc/proof over-claims in Packs 2–6 are tracked by RC-3/RC-4/RC-5

Recent completed slices (all gates green, all reviews closed):

- Proof-system and durable-doctrine remediation RC-1/RC-2 (2026-03-23): `test:e2e` promoted to canonical chain, CLI identity fixed, proof-suite naming and doc-scope honesty restored
- IDENTITY doctrine alignment (2026-03-21): parser honesty restored, dead strictness surfaces removed, cross-realm-safe runtime detection hardened
- Doctor rescue-loop redesign (2026-03-20): `rescueRetryCount` 1,159 → 1, `nonStandardRescue` 20,770ms → 31ms, `pnpm test:transforms` 25.88s → 6.92s
- Doctor runtime characterisation (2026-03-13): identified rescue loop as the cost centre
- int64/bigint semantics remediation (2026-03-13): first-class `integerSemantics` in IR

User-reported issue rule:

- if the user says there are gate or runtime issues, treat that as active session truth that must be reproduced immediately
- do not use an earlier local green run to dismiss a user-reported failure
- record the difference honestly as "last reproduced locally" versus "currently user-reported"

## Immediate Priority

RC-1/RC-2 (proof-system and durable-doctrine remediation) is complete. A proposed RC-3 plan exists at [ir-and-runtime-validator-remediation.md](../plans/active/ir-and-runtime-validator-remediation.md).

1. **If the user reports a fresh gate or runtime issue, reproduce it first.**
2. **Otherwise, review the proposed RC-3 plan** — it targets schema type validation, object-ontology closure, and `trace` HTTP method support.
3. **Confirm or revise the plan scope** before starting TDD execution.
4. **Execute only the confirmed slice** — do not jump to new feature work or reactivate the paused JSON Schema parser plan.
5. **Update handoff docs when truth changes** — roadmap, session-entry, and napkin must stay honest.

## What This Session Should Do

1. Read:
   - [ir-and-runtime-validator-remediation.md](../plans/active/ir-and-runtime-validator-remediation.md) — proposed RC-3 plan
   - [cross-pack-triage.md](../research/architecture-review-packs/cross-pack-triage.md) — root-cause context
   - [architecture-review-packs.md](../plans/active/architecture-review-packs.md) — sweep record
   - [Pack 2 Note](../research/architecture-review-packs/pack-2-canonical-ir-truth-and-runtime-validation.md) — primary RC-3 source
   - [roadmap.md](../plans/roadmap.md)
   - [IDENTITY.md](../IDENTITY.md)
   - [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)
   - [testing-strategy.md](../directives/testing-strategy.md)
2. If the user reports a fresh gate or runtime issue, reproduce it first.
3. Otherwise, review and confirm the proposed RC-3 plan scope.
4. Execute the confirmed slice with TDD and honest scope.
5. Record handoff and consolidation outcomes in `.agent/memory/napkin.md`.

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
- `pnpm test:e2e`

Quick alias: `pnpm qg` (runs the full canonical chain via turbo).

For review-only changes to plans, prompts, and notes:

- `pnpm format:check`
- `pnpm portability:check`

Treat every failure as blocking.

## Review State

Current honest state:

- `pnpm qg` was green on Monday, 23 March 2026 (including `test:e2e`)
- RC-1/RC-2 (proof-system and durable-doctrine remediation) completed on Monday, 23 March 2026
- the cross-pack triage is done and lives at [cross-pack-triage.md](../research/architecture-review-packs/cross-pack-triage.md)
- **RC-3 (IR and runtime validator gaps)** has a proposed plan at [ir-and-runtime-validator-remediation.md](../plans/active/ir-and-runtime-validator-remediation.md) — review and confirm before execution
- RC-5 (downstream surface drift) depends on RC-4 and is Slice 3 or later
- the paused `json-schema-parser.md` holds paused remediation context; it must not reactivate unchanged

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
