# Fixtures and Validation Inventory

## Purpose

A single, actionable index of fixture sources and validation approaches across all `tmp/*` libraries.
This is intended to drive Castr's validation infrastructure and test design, not to decide feature adoption.

## Why this matters

Validation and fixtures are the backbone of lossless transforms, strictness, and transform-validation guarantees (including explicit round-trip/idempotence proofs).
If we can validate inputs, outputs, and conversion edges consistently, the rest of the system can evolve safely.

## What impact are we trying to create?

- Make validation a first-class, shared foundation across all transforms.
- Provide a clear, repeatable path to build test coverage from real-world specs and schema cases.
- Align internal correctness with external expectations (OpenAPI, Zod, JSON Schema, MCP).

---

## Fixture sources by repo

### [`tmp/openapi-ts`](../../../tmp/openapi-ts)

**Spec corpus**

- `specs/2.0.x`, `specs/3.0.x`, `specs/3.1.x`
  - Large, real-world and edge-case spec fixtures.
  - Should be treated as external sources; license/provenance must be verified before reuse.

**Tests and snapshots**

- `packages/openapi-ts-tests/main/test/*` (Vitest) with snapshots in `packages/openapi-ts-tests/main/test/__snapshots__`
- Parser validation tests per version:
  - `packages/openapi-ts/src/openApi/2.0.x/parser/__tests__`
  - `packages/openapi-ts/src/openApi/3.0.x/parser/__tests__`
  - `packages/openapi-ts/src/openApi/3.1.x/parser/__tests__`

**Validation approach**

- Validation is optional and scoped (unique operationId checks, server checks, etc.).
- Bundling uses `@hey-api/json-schema-ref-parser` before parse.

---

### [`tmp/zod`](../../../tmp/zod)

**Fixtures/tests**

- `packages/zod/src/v4/classic/tests/*`
- `packages/zod/src/v4/core/tests/*`
- `packages/zod/src/v4/mini/tests/*`
- Schema snapshots in `packages/zod/src/v4/classic/tests/to-json-schema.test.ts`

**Validation approach**

- Runtime validation via `parse` / `safeParse` (sync/async).
- JSON Schema generation via `toJSONSchema` (targets draft-04/07/2020-12 and OpenAPI-3.0).

---

### [`tmp/zod-openapi`](../../../tmp/zod-openapi)

**Fixtures/tests**

- `src/create/*.test.ts`
- `src/create/schema/tests/*`
- Override and rename tests: `src/create/schema/override.test.ts`, `src/create/schema/rename.test.ts`

**Validation approach**

- Uses Zod `toJSONSchema` + an override pipeline.
- `src/create/schema/override.ts` throws on unrepresentable constructs.

---

### [`tmp/zod-to-openapi`](../../../tmp/zod-to-openapi)

**Fixtures/tests**

- `spec/*` (Jest), including:
  - `spec/routes/*` (route + request/response validation)
  - `spec/types/*` (schema shape mapping)
  - `spec/modifiers/*` (modifier/metadata interactions)

**Validation approach**

- Explicit errors for missing parameter metadata, conflicts, and unknown types.
- Schema refs tracked with a `pending` sentinel for recursion.

---

### [`tmp/trpc-to-openapi`](../../../tmp/trpc-to-openapi)

**Fixtures/tests**

- `test/generator.test.ts`
- `test/adapters/*.test.ts` (Express/Fastify/Fetch/Next/Koa/Nuxt/Standalone)

**Validation approach**

- Strict metadata checks at generation time.
- Input/output parser must be Zod; invalid types throw.
- Runtime parse errors surface via TRPCError in adapters.

---

### [`tmp/hono-middleware`](../../../tmp/hono-middleware)

**Fixtures/tests**

- Many per-package tests in `packages/*/src/*.test.*` and `*.test-d.ts`.
- Example fixtures are scattered across packages (e.g., `packages/session/examples/*`, `packages/ua-blocker/src/data/*`).

**Validation approach**

- Multiple validator packages provide comparative validation strategies:
  - `packages/zod-validator`
  - `packages/valibot-validator`
  - `packages/arktype-validator`
  - `packages/typebox-validator`
  - `packages/typia-validator`
  - `packages/standard-validator`
  - `packages/ajv-validator`
  - `packages/conform-validator`

---

### [`tmp/oak-openapi`](../../../tmp/oak-openapi)

**Fixtures/tests**

- `__tests__/*.test.ts`
- `__tests__/load-tests.yml` (Artillery)
- Generated schemas: `src/lib/zod-openapi/generated/*`

**Validation approach**

- AJV + `ajv-formats` validates generated OpenAPI documents:
  - `__tests__/openapi-schema.test.ts`
  - `bin/openapi-schema-single.ts`

---

## Validation approaches (summary)

- **Schema representability checks**:
  - zod-openapi throws when schemas cannot be represented without manual metadata.
  - zod-to-openapi throws on unknown Zod types or missing parameter metadata.

- **Runtime validation**:
  - Zod parse/safeParse in Zod and trpc-to-openapi flows.
  - Hono validator middleware validates request parts with specific target coercions.

- **Spec validation**:
  - OpenAPI-TS has a limited optional validator in its parser layer.
  - oak-openapi uses AJV against generated OpenAPI documents.

- **Generation-time strictness**:
  - trpc-to-openapi enforces strict meta and type constraints.
  - zod-to-openapi checks for conflicts in parameter metadata.

---

## Candidate fixture sets for Castr

**High-value, low-risk**

- zod-openapi `src/create/schema/tests/*`: focused schema mapping cases.
- zod-to-openapi `spec/types/*`: clear mapping expectations for primitive and composite types.
- trpc-to-openapi `test/generator.test.ts`: OpenAPI generation with metadata constraints.

**High-value, license-sensitive**

- openapi-ts `specs/*`: large real-world corpus, but confirm licensing for each spec.
- openapi-ts `packages/openapi-ts-tests/*`: snapshot expectations for output structure.

**Product-aligned real-world**

- oak-openapi generated schemas and OpenAPI outputs for realistic API behavior.

---

## Recommended next actions (no adoption decisions yet)

1. Curate a minimal fixture set from each repo (copy or recreate) to cover:
   - object/array/tuple/union/intersection
   - nullable and optional behavior
   - refs and recursion
   - parameter + request/response mapping
2. Define a validation ladder in Castr:
   - input validation (parse + schema validation)
   - IR validation (structural + semantic)
   - output validation (OpenAPI/JSON Schema compliance)
3. Add a fixture provenance tracker (source repo, file path, license).

> Note: `example-oak-sdk-output-ts-metadata.ts` is a **single illustrative output** (metadata TS) among many expected outputs. It should not be treated as a fixture or a complete target; we will also need Zod, JSON Schema, OpenAPI, and other outputs as requirements clarify.
