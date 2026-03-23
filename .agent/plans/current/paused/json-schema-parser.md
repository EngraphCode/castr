# Plan (Paused): JSON Schema Architecture Remediation (Post-Pack 4)

**Status:** Paused — rewritten after Pack 4 `red` verdict on 2026-03-22
**Created:** 2026-03-21
**Last Updated:** 2026-03-22
**Predecessor:** [pack-4-json-schema-architecture.md](../../research/architecture-review-packs/pack-4-json-schema-architecture.md)
**Related:** [architecture-review-packs.md](../../active/architecture-review-packs.md), [phase-4-json-schema-and-parity.md](../complete/phase-4-json-schema-and-parity.md), [json-schema-and-parity-acceptance-criteria.md](../../acceptance-criteria/json-schema-and-parity-acceptance-criteria.md), [ADR-035](../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md), [ADR-041](../../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md)

---

This file keeps the historical `json-schema-parser.md` path for continuity, but it no longer describes a future parser-build slice. Pack 4 established that JSON Schema parser, writer, and proof code already exist on disk, and that the honest next work is remediation of the JSON Schema architecture contract rather than resuming a stale implementation plan.

Activation remains intentionally paused until the post-IDENTITY architecture review-pack sweep chooses JSON Schema remediation as the next implementation slice. Pack 4 did not revalidate the old plan; it rewrote it.

Reactivation requires a strict-and-complete path: parser contract, IR fit, runtime validation, writer behavior, proofs, and docs must all agree on one explicit JSON Schema support surface before any new code work resumes.

## Current Pause Truth

- Pack 4 completed on Sunday, 22 March 2026 with a `red` verdict. See [pack-4-json-schema-architecture.md](../../research/architecture-review-packs/pack-4-json-schema-architecture.md).
- JSON Schema parser, writer, and transform-proof code already exist in `lib/src/schema-processing/parsers/json-schema/`, `lib/src/schema-processing/writers/json-schema/`, and `lib/tests-transforms/__tests__/scenario-{5,6,7}-*.test.ts`.
- The next honest work is not "build the parser". It is to remediate the public contract and proof gaps Pack 4 identified.
- Pack 2's live philosophy still governs this paused workstream explicitly: strict and complete everywhere, all the time.

## Pack 4 Review Truth

### Supported And Proven

- Draft 07 constructs are currently normalized at the public entrypoint rather than rejected.
  - `definitions` -> `$defs`
  - `dependencies` -> `dependentRequired` / `dependentSchemas`
  - tuple `items` -> `prefixItems`
  - boolean `exclusiveMinimum` / `exclusiveMaximum` -> numeric form
  - local `#/definitions/<name>` references -> `#/$defs/<name>`
- Non-strict object input is explicitly rejected through `additionalProperties: true` or schema-valued `additionalProperties`.
- JSON Schema bundle writing through `$defs` and early `int64` / `bigint` rejection are proven by the current Scenario 5, Scenario 6, and Scenario 7 targeted tests.

### Implemented But Under-Proven

- `writeJsonSchemaDocument()` exists, but Pack 4 found no equivalent standalone-document round-trip proof.
- Parser and writer support for `unevaluatedProperties`, `unevaluatedItems`, `dependentSchemas`, `dependentRequired`, `minContains`, and `maxContains` exists, but the proof matrix does not yet prove that surface as a complete public contract.

### Silently Ignored Or Unclear

- The public contract of `parseJsonSchemaDocument()` is unclear: it currently behaves as a `$defs` extractor, not an honest standalone document parser.
- Unsupported-keyword, dialect, and external-reference policy is unclear at the parser boundary.
  - `if` / `then` / `else`
  - `$dynamicRef` / `$dynamicAnchor`
  - external `$ref`
  - boolean schemas
  - unknown keywords outside the declared typed subset
- Canonical JSON-Schema-shaped egress normal form is unclear across writer and neighbouring conversion surfaces.
  - nullability form
  - `$ref` sibling policy
  - `contains` versus `minContains` / `maxContains`
  - `example` / `examples` in the pure JSON Schema path

### Unsupported And Explicitly Rejected

- JSON Schema-native carriage of `int64` and `bigint` semantics
- Non-strict object semantics at ingest

## Scope

**In scope:**

- define one honest JSON Schema document-parser contract
- define explicit fail-fast rejection boundaries for unsupported JSON Schema input
- align writer output, neighbouring JSON-Schema-shaped surfaces, and proof artefacts around one canonical egress contract
- update acceptance criteria, handoff docs, and this paused plan so they match the reviewed architecture

**Out of scope:**

- restarting the stale parser-build tranche as if parser code were absent
- opportunistic expansion of the supported JSON Schema surface before the contract is made explicit
- custom portable fallback paths without a separate ADR

## Locked Constraints

1. Code on disk and Pack 4 findings are authoritative over the superseded parser-build story.
2. No JSON Schema surface may be called supported unless parser, writer, proofs, and docs agree on it.
3. Unsupported JSON Schema behavior must fail fast with helpful errors at the earliest honest boundary.
4. No custom portable rescue paths or metadata-directed fallbacks are allowed without a separate ADR.
5. No escape hatches in product code.
6. All quality gates must be green when implementation resumes.

## Primary Code Surfaces

- `lib/src/schema-processing/parsers/json-schema/`
- `lib/src/schema-processing/writers/json-schema/`
- `lib/src/schema-processing/writers/shared/json-schema-fields.ts`
- `lib/src/schema-processing/writers/shared/json-schema-2020-12-fields.ts`
- `lib/src/schema-processing/ir/models/schema.ts`
- `lib/src/characterisation/json-schema.char.test.ts`
- `lib/tests-transforms/__tests__/scenario-5-json-schema-roundtrip.integration.test.ts`
- `lib/tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts`
- `lib/tests-transforms/__tests__/scenario-7-multi-cast.integration.test.ts`
- `.agent/acceptance-criteria/json-schema-and-parity-acceptance-criteria.md`

## TDD Order

1. Characterise the exact JSON Schema contract already implied by the current parser, writer, and proofs.
2. Add failing unit and integration proofs for whichever Pack 4 remediation slice is chosen first:
   - honest document-parser contract
   - explicit unsupported-surface rejection
   - canonical egress normal form
3. Implement the smallest remediation that makes the new proof honest.
4. Re-run the targeted JSON Schema proofs.
5. Re-run the full quality-gate chain when code changes land.

## Success Metrics

1. `parseJsonSchema()` and `parseJsonSchemaDocument()` have one explicit, documented contract that matches code and proofs.
2. Unsupported JSON Schema semantics are rejected explicitly rather than remaining silent or ambiguous.
3. The JSON Schema writer and neighbouring conversion surfaces share one documented normal form for the supported surface.
4. Scenario 5, Scenario 6, Scenario 7, and the JSON Schema characterisation surface prove the architecture the repo claims.
5. Acceptance criteria, roadmap, session-entry, and this paused plan all match the reviewed architecture.
6. All quality gates pass when implementation resumes.

## Activation Trigger

This paused workstream may reactivate only when:

- the remaining review-pack sweep says JSON Schema remediation is the next implementation slice, and
- the implementation slice starts from the Pack 4 findings rather than from the superseded parser-build story.

## Quality Gates

From repo root, one command at a time:

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
