# Castr Strict Test Plan (Oak + OpenAPI-TS Fixture Matrix)

## Purpose

Define a strict-only, fail-fast test plan that ties Oak’s harness expectations to a curated fixture matrix inspired by OpenAPI-TS, without accepting non-compliant inputs.

## Non-Negotiables

- Strict-by-default and fail-fast at all times.
- Deterministic output (byte-for-byte identical on identical input).
- No invented optionality or type widening.
- Oak provides SDK-decorated input; Castr treats it as standard OpenAPI (no Oak-specific parsing).
- `castr-bundle` is a temporary communication artifact, not a permanent contract.
- Oak requirements are flexible; prioritize IR-first architecture and avoid string-first public APIs.

## Sources (Authoritative)

- `.agent/directives/requirements.md` for strict validation and OpenAPI 3.0/3.1 rules.
- `.agent/directives/RULES.md` for strictness, fail-fast, and TDD discipline.
- `.agent/research/oak-open-curriculum-sdk/castr-requests/README.md` for Oak contract shape.
- `.agent/research/oak-open-curriculum-sdk/castr-requests/oak-principles.md` for type discipline.
- `.agent/research/oak-open-curriculum-sdk/castr-requests/expected-outputs.md` for output examples.
- `.agent/research/feature-parity/*` for parity gaps and integration targets.
- `.agent/research/openapi-ts/openapi-ts-comparison.md` for fixture categories and edge cases.
- `.agent/research/openapi-ts/openapi-ts-reuse-plan.md` for licensing and synthetic fixtures guidance.

## Fixture Sources

- Oak SDK-decorated fixtures (ground truth input + expected outputs).
- Existing Castr normalized fixtures (round-trip IR artifacts).
- Synthetic OpenAPI-TS-inspired fixtures (edge cases recreated in-house, not copied).

## Test Layers

### 1) Strict Spec Validation (Input Gate)

- Reject invalid version syntax and wrong-version fields (3.0-only vs 3.1-only).
- Reject unresolved `$ref`, invalid HTTP methods, missing required fields.
- Reject 3.1 disallowed constructs (e.g., `nullable`) and 3.0 disallowed constructs (e.g., `jsonSchemaDialect`).

### 2) IR Completeness and Fidelity

- Verify every required OpenAPI 3.0/3.1 field is represented in IR.
- Assert lossless round-trip for supported fields (no omissions or merges).
- Validate IR schema metadata supports strict Zod output (required, nullable, dependency graph).

### 3) Round-Trip OpenAPI

- OpenAPI input → IR → OpenAPI output matches normalized 3.1 expectations.
- Validate that upgrades (3.0 → 3.1) are strictly standards-compliant.

### 4) Writer Outputs (Zod + Metadata)

- Zod schemas use `.strict()` for all object schemas.
- Required vs optional properties exactly match the spec.
- Literal types preserved in metadata maps and endpoint definitions.
- No `as`, `any`, `!`, or other type escape hatches.

### 5) Determinism

- Run generation twice per fixture and assert byte-for-byte equality.
- Ensure stable ordering in components, endpoints, and metadata maps.

### 6) Oak Harness Integration

- Validate against `verify-castr-fixtures.ts` outputs.
- Run the Oak adapter replacement scenario (no changes beyond import paths).
- Use `castr-bundle` only if required by the harness; verify shape strictly.

## Fixture Matrix (Strict-Only)

| Category                                        | Source                     | Primary Checks                                       |
| ----------------------------------------------- | -------------------------- | ---------------------------------------------------- |
| Oak SDK-decorated core                          | Oak fixtures               | Full output equivalence, strictness, determinism     |
| OpenAPI 3.0 → 3.1 upgrades                      | Synthetic                  | Correct upgrades, strict rejection of invalid syntax |
| Composition (allOf/oneOf/anyOf, discriminators) | Synthetic                  | IR fidelity, Zod output shape                        |
| Nullable and unions                             | Synthetic                  | Type array handling, no `nullable` in 3.1            |
| Callbacks and webhooks                          | Synthetic + Castr fixtures | IR coverage, OpenAPI writer                          |
| Headers, links, examples, pathItems             | Synthetic                  | IR completeness and writer preservation              |
| Security schemes (oauth2, mutualTLS, etc.)      | Synthetic                  | Strict validation + output mapping                   |
| External refs and bundling                      | Synthetic                  | Ref resolution and cycle handling                    |

## Success Metrics (Measurable)

- 100% of Oak fixtures pass strict validation and output checks.
- 0 tolerance paths: invalid inputs fail with explicit errors.
- Determinism: 0 diff across repeated runs for all fixtures.
- IR coverage: all 3.0/3.1 fields from `.agent/directives/requirements.md` represented in IR.

## Execution Checklist

1. Re-read `.agent/directives/requirements.md`, `.agent/directives/RULES.md`, `.agent/directives/testing-strategy.md`, and `.agent/directives/DEFINITION_OF_DONE.md`.
2. Write failing tests first (TDD) for each new fixture category.
3. Run gates one at a time (strict order in `.agent/directives/DEFINITION_OF_DONE.md`).
4. Record fixture provenance (synthetic vs first-party) in test metadata.

## Licensing and Provenance

- Do not copy third-party specs from OpenAPI-TS; recreate synthetic equivalents.
- If we reuse any MIT-licensed OpenAPI-TS content, first confirm the license for the specific files and then add `docs/THIRD_PARTY_NOTICES.md` with attribution and the MIT license text.
- Keep fixture provenance notes for every added test input. (Not legal advice.)
