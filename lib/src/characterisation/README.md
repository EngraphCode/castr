# Characterisation Tests

## Purpose

These tests capture the **PUBLIC API behavior** of `@engraph/castr` to protect against regressions during architectural refactoring and the current review-first remediation cycle.

## Running Tests

```bash
# Run characterisation tests only
pnpm character

# Run characterisation tests in watch mode
pnpm character:watch

# Run regular tests (excludes characterisation tests)
pnpm test
```

## Directory Structure

```
characterisation/
├── README.md                           # This file
├── generation.char.test.ts             # Core generation pipeline tests (15 tests)
├── schema-dependencies.char.test.ts    # Schema dependency ordering tests (10 tests)
├── options.char.test.ts                # Options & configuration tests (20 tests)
├── cli.char.test.ts                    # CLI behavior tests (15 tests)
├── error-handling.char.test.ts         # Error handling tests (10 tests)
├── edge-cases.char.test.ts             # Edge cases tests (10 tests)
├── input-format.char.test.ts           # JSON vs YAML input tests (9 tests)
├── bundled-spec-assumptions.char.test.ts # Scalar bundling behavior and legacy $ref assumptions (6 tests)
├── programmatic-usage.char.test.ts     # Programmatic API surface (12 tests)
└── test-output/                        # Generated test output (git-ignored)
```

## Current Coverage

This suite captures a broad cross-section of current public behaviour:

- core generation paths from OpenAPI input to generated TypeScript
- schema dependency ordering and circular-reference handling
- CLI and programmatic option plumbing
- boundary error handling and common malformed-input failures
- representative edge cases such as nullable fields, special characters, and large schema sets

It is useful protection against regressions, but it is not the whole proof story for the repo.

## Important Limits

- template-selection checks cover the honest `schemas-only` boundary, but they are still not a complete generated-surface proof
- generated-output proof remains broader than these characterisation tests alone
  - grouped output, manifest emission, and runtime-execution claims depend on other suites and are still under architecture-review scrutiny
- support claims must still be checked against transform, generated-code, unit, and review-pack evidence
  - a green characterisation suite does not by itself prove semantic parity or a fully honest public contract

## Input Pipeline Note

- the live OpenAPI loading path is Scalar-first (`@scalar/json-magic` + `@scalar/openapi-parser`)
- `bundled-spec-assumptions.char.test.ts` exists to document current Scalar bundling behaviour and the legacy `$ref` assumptions that older SwaggerParser-oriented terminology used to imply
- treat remaining SwaggerParser references in nearby tests or comments as historical comparison context rather than live architecture ownership

## Current Interpretation

- use this suite to characterise and preserve visible behaviour
- do not treat it as exhaustive proof of every public support claim
- keep the architecture-review pack notes and durable docs in sync when they discover proof gaps that this suite does not cover directly
