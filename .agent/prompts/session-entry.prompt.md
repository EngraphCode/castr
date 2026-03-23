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

## Current State: Architecture Review Sweep Closed

### Current Sweep Record

- [architecture-review-packs.md](../plans/active/architecture-review-packs.md)

### Architecture Review Prompt

- [architecture-review-packs.prompt.md](./architecture-review-packs.prompt.md)

### Pack 7 Prompt

- [pack-7-proof-system-and-durable-doctrine.prompt.md](./pack-7-proof-system-and-durable-doctrine.prompt.md)

### Most Recent Review Note

- [pack-7-proof-system-and-durable-doctrine.md](../research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md)

### Next Honest Slice

- Proof-system and durable-doctrine remediation.
- Use [pack-7-proof-system-and-durable-doctrine.md](../research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md) and [architecture-review-packs.md](../plans/active/architecture-review-packs.md) to open the successor plan before any new feature or format implementation resumes.

### Canonical Identity

- [IDENTITY.md](../IDENTITY.md)

### Immediate Predecessor

- [identity-doctrine-alignment.md](../plans/current/complete/identity-doctrine-alignment.md)

### Paused Successor

- [json-schema-parser.md](../plans/current/paused/json-schema-parser.md)

### Durable Doctrine Sources To Re-Read First

- [pack-7-proof-system-and-durable-doctrine.md](../research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md)
- [testing-strategy.md](../directives/testing-strategy.md)
- [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)
- [pack-6-context-mcp-rendering-and-generated-surface.md](../research/architecture-review-packs/pack-6-context-mcp-rendering-and-generated-surface.md)
- [native-capability-matrix.md](../../docs/architecture/native-capability-matrix.md)
- [ADR-035](../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)

## Current Repo Truth (Monday, 23 March 2026)

IDENTITY doctrine alignment is complete:

- `unknownKeyBehavior` is removed from IR, parsers, and writers
- parser honesty is restored: non-object IR schemas no longer get `additionalProperties: false`
- public strictness/compatibility knobs are removed (`nonStrictObjectPolicy`, `strictObjects`, `additionalPropertiesDefaultValue`)
- non-strict object input is rejected at parser boundaries
- writers emit strict-only object output (`additionalProperties: false`, `z.strictObject()`)
- `CastrSchemaProperties` detection is now brand-based and cross-realm safe
- the full repo-root Definition of Done chain was rerun green on Monday, 23 March 2026
- off-chain proof status was also rechecked on Monday, 23 March 2026:
  - `pnpm --dir /Users/jim/code/personal/castr/lib exec vitest run --config vitest.e2e.config.ts` is still red in `ir-fidelity.test.ts`
  - `pnpm --dir /Users/jim/code/personal/castr/lib exec vitest run --config vitest.scalar-guard.config.ts` is green

The architecture review sweep is complete. Its closing truth is:

- strict and complete everywhere, all the time remains the live rule: if a claimed surface is only partially implemented, validated, proven, or documented, treat that as blocking drift
- the review packs must validate the repo's actual direction against code, not assumption
- Pack 1 is complete with a `yellow` verdict: package entrypoints and dependency boundaries are disciplined, but the CLI identity and public docs still drift from the implemented surface
- Pack 2 is complete with a `red` verdict: runtime IR validation still accepts malformed schema shapes, object-closure doctrine is not enforced consistently, and the runtime validator rejects supported `trace` operations
- Pack 3 is complete with a `red` verdict: the loader/doctor boundary is physically clean, but reusable `components.requestBodies` are parsed into IR, dropped on OpenAPI egress, and not asserted by the current output-coverage proof suite
- Pack 4 is complete with a `red` verdict: JSON Schema parser/writer/proof code exists, but `parseJsonSchemaDocument()` is only a `$defs` extractor, unsupported JSON Schema surfaces are not rejected explicitly enough, and the proof/doc story over-claims the supported contract
- Pack 5 is complete with a `red` verdict: contradictory strict-object chains are still accepted, unsupported nested Zod members can be silently dropped, helper-format support is wider than the writer/proof lockstep, and the proof/doc story still over-claims semantic parity
- Pack 6 is complete with a `red` verdict: `schemas-only` and custom-template entrypoints are not honest public surfaces, MCP schemas bypass the governed Draft 07 contract, and the generated-output proof story still over-claims runtime coverage
- Pack 7 is complete with a `red` verdict: the canonical gate chain can stay green while dedicated proof suites remain off-chain, generated-code and transform proofs still over-claim runtime and semantic breadth, and durable doctrine needed another honesty pass
- the seven-pack architecture review sweep is complete
- the next honest implementation slice is proof-system and durable-doctrine remediation before any new feature work resumes
- the paused `json-schema-parser.md` file has been rewritten as paused remediation context and must not reactivate unchanged
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

The review sweep is complete. Before any new feature implementation, convert the Pack 7 findings into the next honest remediation slice.

1. **Read the sweep record and Pack 7 note first** — the review matrix is finished, and the next slice must come from that evidence.
2. **If the user reports a fresh gate or runtime issue, reproduce it first.**
3. **Otherwise, open or execute the proof-system / doctrine remediation slice** — do not jump straight to new format or feature work.
4. **Keep the JSON Schema remediation context paused** — the sweep did not reopen the verdict that the old parser-build plan is stale.
5. **Update handoff docs when truth changes** — roadmap, session-entry, and napkin must stay honest.

## What This Session Should Do

1. Read:
   - `.agent/research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md`
   - `.agent/plans/active/architecture-review-packs.md`
   - `.agent/plans/roadmap.md`
   - `.agent/IDENTITY.md`
   - `.agent/directives/testing-strategy.md`
   - `.agent/directives/DEFINITION_OF_DONE.md`
2. If the user reports a fresh gate or runtime issue, reproduce it first.
3. Otherwise, open or execute the proof-system and durable-doctrine remediation slice named by Pack 7.
4. Keep findings evidence-backed and file-referenced; do not reopen general feature work until the proof/doctrine contract is honest.
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

For review-only changes to plans, prompts, and notes:

- `pnpm format:check`
- `pnpm portability:check`

Treat every failure as blocking.

## Review State

Current honest state:

- the full repo-root Definition of Done chain was rerun green on Monday, 23 March 2026
- Pack 1 (`boundary-integrity-and-public-surface`) completed on Saturday, 21 March 2026 with a `yellow` verdict; see `.agent/research/architecture-review-packs/pack-1-boundary-integrity-and-public-surface.md`
- Pack 2 (`canonical-ir-truth-and-runtime-validation`) completed on Saturday, 21 March 2026 with a `red` verdict; see `.agent/research/architecture-review-packs/pack-2-canonical-ir-truth-and-runtime-validation.md`
- Pack 3 (`openapi-architecture`) completed on Sunday, 22 March 2026 with a `red` verdict; see `.agent/research/architecture-review-packs/pack-3-openapi-architecture.md`
- Pack 4 (`json-schema-architecture`) completed on Sunday, 22 March 2026 with a `red` verdict; see `.agent/research/architecture-review-packs/pack-4-json-schema-architecture.md`
- Pack 5 (`zod-architecture`) completed on Sunday, 22 March 2026 with a `red` verdict; see `.agent/research/architecture-review-packs/pack-5-zod-architecture.md`
- Pack 6 (`context-mcp-rendering-and-generated-surface`) completed on Sunday, 22 March 2026 with a `red` verdict; see `.agent/research/architecture-review-packs/pack-6-context-mcp-rendering-and-generated-surface.md`
- Pack 7 (`proof-system-and-durable-doctrine`) completed on Sunday, 22 March 2026 with a `red` verdict; see `.agent/research/architecture-review-packs/pack-7-proof-system-and-durable-doctrine.md`
- the seven-pack architecture review sweep is complete
- the paused `json-schema-parser.md` file now holds paused remediation context rather than an untouched parser-build plan
- the next implementation slice must be proof-system and durable-doctrine remediation rather than assumption-driven product work

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
