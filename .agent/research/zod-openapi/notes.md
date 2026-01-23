# zod-openapi (samchungy) - Research Notes

## Scope and sources

- Repo path: [tmp/zod-openapi](../../../tmp/zod-openapi)
- Key files:
  - `tmp/zod-openapi/README.md`
  - `tmp/zod-openapi/docs/v5.md`
  - `tmp/zod-openapi/docs/api.md`
  - `tmp/zod-openapi/src/create/document.ts`
  - `tmp/zod-openapi/src/create/components.ts`
  - `tmp/zod-openapi/src/create/schema/schema.ts`
  - `tmp/zod-openapi/src/types.ts`
  - `tmp/zod-openapi/packages/openapi3-ts/*`

## What it is

- Generates OpenAPI 3.x documents from Zod schemas.
- v5+ uses Zod v4's native `toJSONSchema()` instead of a custom walker.
- Zod schemas can be supplied directly in OpenAPI structures (request bodies, parameters, responses).

## Architectural model

- Registry-first generation:
  1. Create a registry (`createRegistry`).
  2. Add schema-like values to the registry and receive refs.
  3. Call `createComponents()` to resolve the registry into components.
- Document assembly (`createDocument`):
  - Input is a ZodOpenApiObject (OpenAPI-like structure with Zod schemas allowed).
  - Generates `paths`, `webhooks`, and `components` from registry.
- Maintains separate input and output schema registries to support different IO semantics.

## Metadata model

- Zod metadata is extended via module augmentation on `GlobalMeta`:
  - `param`, `header` (with optional component `id`)
  - `override` (schema object or function override)
  - `unusedIO` (input vs output if schema is only in components)
  - `outputId` (for input/output component naming)
  - `examples` (preferred), `example` (deprecated)
- Core JSON Schema metadata (`id`, `title`, `description`, `deprecated`) is inherited from Zod global registry.

## OpenAPI version handling

- Supports OpenAPI 3.0 and 3.1, with 3.1 as the v5+ default.
- Uses Zod `toJSONSchema` target `openapi-3.0` when emitting OAS 3.0.
- For OAS 3.1, leaves Zod's JSON Schema output as-is (2020-12 compatible).
- Strips invalid JSON Schema fields for OAS output (`$schema`, `$id`, `id`).

## Input vs output schema semantics

- Zod v4 `toJSONSchema` supports `io: input|output`.
- zod-openapi leverages this to generate:
  - Input schemas: permissive object handling (additional properties not forbidden).
  - Output schemas: stricter object handling (additionalProperties false).
- When a schema is used in both input and output contexts, zod-openapi can create two components:
  - `MySchema` and `MySchemaOutput` (or custom `outputId`).
- This is critical to reflect Zod behavior in OpenAPI output.

## Overrides and validation

- Three levels of schema override:
  - Global override function in `CreateDocumentOptions`.
  - Per-schema override function in `meta.override`.
  - Per-schema override object in `meta.override`.
- Overrides happen after JSON Schema generation and before validation.
- Options include:
  - `allowEmptySchema` to allow empty output for specific Zod types.
  - `reused` (`ref` vs `inline`) to control component reuse.
  - `cycles` (`ref` vs `throw`) for cyclic schemas.
  - `outputIdSuffix` for output schema naming.

## Component handling

- Component registry tracks:
  - schemas (input/output, manual, dynamic)
  - headers, parameters, requestBodies, responses, callbacks, pathItems, securitySchemes, links, examples
- Supports auto-registration via `id` fields on certain objects.
- Resolves `$defs` (or `definitions`) and remaps refs to `#/components/schemas`.
- Renames dynamic components (`schema1`, `schema2`, etc.) to stable names with counters.

## Fixtures and tests (inputs/outputs)

- `src/create/*` has test files per OpenAPI area (components, paths, responses, callbacks, etc.).
- These test fixtures are useful to validate edge cases (headers, links, parameters, callbacks, etc.).
- v5 migration docs provide a compatibility guide and examples for ref, override, and input/output differences.

## Implications for Castr

- zod-openapi is a strong reference for:
  - How Zod metadata maps to OpenAPI concepts.
  - How to handle dual input/output schemas for correctness.
  - Component registration and ref resolution strategies.
- The registry-first approach (register -> resolve components later) is a direct counterpart to an IR-driven pipeline.
- Castr can reuse the idea of validating and post-processing JSON Schema output to conform to OpenAPI version rules.

## Gaps / open questions

- zod-openapi uses Zod's `toJSONSchema` as a black box; it inherits Zod's limitations for transforms and complex effects.
- The output is biased toward JSON Schema semantics, which may differ from strict OpenAPI 3.0 requirements.
- How to map zod-openapi overrides to a canonical IR (vs treating them as opaque post-process hooks).
