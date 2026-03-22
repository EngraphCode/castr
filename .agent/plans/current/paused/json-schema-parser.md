# Plan (Paused): JSON Schema 2020-12 Parser (Phase 4, Component 3)

**Status:** Paused — queued behind [architecture-review-packs.md](../../active/architecture-review-packs.md)
**Created:** 2026-03-21
**Last Updated:** 2026-03-22
**Predecessor:** [identity-doctrine-alignment.md](../complete/identity-doctrine-alignment.md)
**Related:** [phase-4-json-schema-and-parity.md](../complete/phase-4-json-schema-and-parity.md), [ADR-035](../../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)

---

This plan implements the JSON Schema 2020-12 parser, completing bidirectional JSON Schema ↔ IR capability (Phase 4, Component 3).

Activation is intentionally paused until the post-IDENTITY architecture review-pack sweep completes. Pack 4 of that sweep must explicitly decide whether this plan is still architecturally sound as written or needs to be rewritten before reactivation.

Reactivation requires a strict-and-complete path, not a partially aligned one: parser shape, IR fit, runtime validation, proofs, and docs must all agree on the supported JSON Schema surface.

## Current Pause Truth

- The IDENTITY doctrine-alignment slice is complete and the full repo-root Definition of Done chain was green on 2026-03-21.
- The next honest work is a bounded architecture review sweep, not immediate parser implementation.
- This plan remains the queued implementation context, but it is not the active session entrypoint.
- Pack 2 established the live philosophy explicitly: strict and complete everywhere, all the time. This plan must be revalidated against that bar before any code resumes.

## Scope

**In scope:**

- Parse standalone JSON Schema 2020-12 documents (single schema, bundled `$defs`) into IR (`CastrDocument`)
- Map supported vocabulary: `type`, `properties`, `required`, `items`, `prefixItems`, `$ref`, `$defs`, `anyOf`, `oneOf`, `allOf`, `not`, `enum`, `const`, `format`, `pattern`, `minimum`/`maximum` family, `minLength`/`maxLength`, `minItems`/`maxItems`, `additionalProperties`, `description`, `title`, `default`, `examples`, `deprecated`, `readOnly`, `writeOnly`
- JSON Schema `$ref` resolution (internal document references)
- Reject unsupported features with fail-fast errors (`if`/`then`/`else`, `$dynamicRef`, Draft-07)
- Reuse existing shared JSON Schema field logic from `writers/shared/` where applicable
- Scenario 5 transform proof: JSON Schema → IR → JSON Schema (round-trip)
- Scenario 6 wiring: replace any JSON Schema parsing stubs with the real parser

**Out of scope:**

- JSON Schema Draft-07 or earlier (reject with helpful error)
- External `$ref` resolution (reject with helpful error)
- `if`/`then`/`else` conditional schemas (reject with helpful error)
- `$dynamicRef` / `$dynamicAnchor` (reject with helpful error)
- OpenAPI-specific fields (`discriminator`, `xml`, etc.)
- Changes to the IR model
- Changes to other parsers or writers

## Locked Constraints

1. No changes to the IR model.
2. The parser must accept all output from the existing JSON Schema writer (writer/parser lockstep).
3. Fail-fast with helpful errors for unsupported features.
4. No escape hatches in product code.
5. All quality gates green.
6. No partially supported JSON Schema surface may be treated as complete; parser, writer, runtime validation, proof, and docs must stay aligned.

## Primary Code Surfaces

Follow the existing parser pattern (see `parsers/openapi/`, `parsers/zod/`):

- **[NEW]** `lib/src/schema-processing/parsers/json-schema/` — parser module directory
- **[NEW]** `lib/src/schema-processing/parsers/json-schema/json-schema-parser.ts` — main entry point
- **[NEW]** `lib/src/schema-processing/parsers/json-schema/json-schema-parser.unit.test.ts` — unit tests
- **[NEW]** `lib/src/schema-processing/parsers/json-schema/schema-normalisation.ts` — normalise input to consistent internal form
- **[NEW]** `lib/src/schema-processing/parsers/json-schema/reference-resolution.ts` — `$ref` / `$defs` resolution
- **[NEW]** `lib/tests-transforms/__tests__/scenario-5-json-schema-roundtrip.integration.test.ts` — round-trip proof
- **[MODIFY]** `lib/src/schema-processing/parsers/index.ts` — barrel export
- **[MODIFY]** Scenario 6 test wiring to use the real parser

## TDD Order

1. **Characterise**: inventory the JSON Schema writer's output patterns → these become the parser's acceptance contract
2. **Unit tests first**: `json-schema-parser.unit.test.ts` — test parse of each supported schema keyword in isolation (primitives, objects, arrays, composition, refs, formats, constraints, metadata)
3. **Reference resolution tests**: internal `$ref` / `$defs` resolution, fail-fast for external refs
4. **Rejection tests**: unsupported keywords, wrong draft version
5. **Integration — Scenario 5**: JSON Schema → IR → JSON Schema round-trip
6. **Integration — Scenario 6 wiring**: replace any JSON Schema parsing stubs with the real parser
7. **Full gate chain**: all gates green

## Success Metrics

1. `parseJsonSchema()` / `parseJsonSchemaDocument()` produce correct IR for all supported JSON Schema 2020-12 vocabulary.
2. Scenario 5 (JSON Schema → IR → JSON Schema) round-trip proof is green for all supported patterns.
3. Scenario 6 (Zod → IR → JSON Schema → IR → Zod) uses the real parser and remains green.
4. Unsupported features (`if`/`then`/`else`, `$dynamicRef`, Draft-07) fail fast with helpful errors.
5. Claimed supported JSON Schema features are complete end to end across parser, IR, runtime validation, proofs, and docs.
6. All quality gates pass.

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
