# @asteasolutions/zod-to-openapi - Research Notes

## Scope and sources

- Repo path: [tmp/zod-to-openapi](../../../tmp/zod-to-openapi)
- Key files:
  - `tmp/zod-to-openapi/README.md`
  - `tmp/zod-to-openapi/src/zod-extensions.ts`
  - `tmp/zod-to-openapi/src/metadata.ts`
  - `tmp/zod-to-openapi/src/openapi-registry.ts`
  - `tmp/zod-to-openapi/src/openapi-generator.ts`
  - `tmp/zod-to-openapi/src/v3.0/*` and `tmp/zod-to-openapi/src/v3.1/*`
  - `tmp/zod-to-openapi/src/transformers/*`
  - `tmp/zod-to-openapi/spec/**/*`

## What it is

- Generates OpenAPI v3.0/v3.1 documents from Zod schemas.
- Adds `.openapi()` method to Zod schemas and maintains a custom registry for metadata.
- Supports Zod v4 (and v3 via older versions).

## Metadata model

- Two metadata sources are merged:
  - Zod's native `.meta()` (for v4), using `id` as ref ID.
  - zod-to-openapi registry (`zodToOpenAPIRegistry`) storing `_internal` data and `.openapi()` metadata.
- `_internal` metadata fields include:
  - `refId` (component schema name)
  - `extendedFrom` (for `schema.extend()` to enable `allOf` links)
  - `unionPreferredType` (`anyOf` vs `oneOf`)
- `.openapi()` merges metadata and preserves it through modifiers (`optional`, `nullable`, `default`, `transform`, `refine`, etc.).
- For Zod object `.extend()`, the extension is tracked via `_internal.extendedFrom` so the generator can emit `allOf`.

## Registry and definitions

- `OpenAPIRegistry` collects definitions of:
  - schemas, parameters, routes, components, webhooks
- `registerParameter` creates a parameter schema and auto-sets `param.name` if missing.
- `registerComponent` allows raw OpenAPI components (non-Zod) to be injected directly.
- Definitions are sorted by type to ensure schema/parameter generation before routes.

## Generator architecture

- `OpenAPIGenerator` uses a `transformers/*` pipeline to convert Zod types to OpenAPI schemas.
- Two OpenAPI specifics layers handle version differences:
  - OAS 3.0: uses `nullable: true`, tuple mapped to `items` + `min/maxItems`, `exclusiveMinimum/Maximum` booleans.
  - OAS 3.1: uses type arrays with `null`, tuple mapped to `prefixItems`, `exclusiveMinimum/Maximum` as numbers.
- Handles recursion via `schemaRefs` with a `'pending'` sentinel.
- References use `$ref` and `allOf` when applying metadata overrides to refs.

## Parameter handling

- Parameters are derived from Zod objects in `request.query`, `request.params`, `request.cookies`, and `request.headers`.
- `MissingParameterDataError` is thrown if a parameter lacks required `name`/`in` metadata.
- `enhanceMissingParametersError` enriches error context with route or location details.
- Parameters can be auto-registered in `components/parameters` when schemas are registered.

## Content and responses

- Request bodies support multiple media types (`ZodContentObject`).
- Response objects support headers (as Zod objects) and multiple content types.
- Zod objects in headers are converted into parameter-like header objects.

## Transformer behavior (selected)

- `ObjectTransformer`:
  - Calculates required keys (non-optional).
  - Maps `catchall`:
    - `ZodNever` => `additionalProperties: false`
    - `ZodAny` => `additionalProperties` with schema.
  - `extend` uses `allOf` + parent `$ref` via `_internal.extendedFrom`.
- `UnionTransformer`:
  - Flattens nested unions.
  - Uses `anyOf` or `oneOf` depending on metadata/options.
  - Strips nested `nullable` to avoid duplicate nulls in union.
- `DiscriminatedUnionTransformer`:
  - Emits `discriminator` only if all options are registered with `refId`.
  - Builds mapping from discriminator values to schema refs.
- `TupleTransformer`:
  - OAS 3.0: `items` + `minItems` + `maxItems`.
  - OAS 3.1: `prefixItems`.
- `StringTransformer`:
  - Maps Zod string checks to `minLength`, `maxLength`, `pattern`, `format`.
  - Known formats include uuid/email/url/date/datetime/cuid/cuid2/ulid/ip/emoji.
- `NumberTransformer`:
  - Maps numeric checks via version specifics (inclusive/exclusive min/max).
  - Uses `integer` for `safeint` format.

## Test fixtures and validation signals

- `spec/` includes comprehensive Jest tests for:
  - metadata overrides
  - parameter derivation
  - response headers/content
  - schema extensions and `allOf`
  - component ordering and sorting
- These tests are a rich fixture set for validating Castr’s Zod → IR → OpenAPI behavior.

## Notable constraints / behaviors

- Metadata precedence:
  - `.openapi()` metadata overrides schema metadata, and can remove fields by setting them to `undefined`.
  - If `.openapi({ type })` is set, schema-derived overrides are suppressed for that ref.
- Parameter metadata conflicts raise `ConflictError` when `in`/`name` differ.
- Recursion is handled by returning refs when a schema is "pending".

## Implications for Castr

- zod-to-openapi is the primary reference implementation for:
  - `.openapi()` metadata semantics
  - parameter inference from Zod objects
  - OAS 3.0 vs 3.1 nullable mapping
  - `extend()` -> `allOf` modeling
- Castr’s Zod parser should understand both:
  - `.openapi()` metadata (zod-to-openapi style)
  - `.meta()` metadata (Zod native, used by zod-openapi)
- The fixture suite can be used to create Castr round-trip tests once IR coverage is complete.

## Gaps / open questions

- Transform effects (`ZodPipe`, preprocess/transform) are partially supported by unwrapping; detailed semantics are not preserved.
- Union handling relies on `anyOf` vs `oneOf` choice; no `allOf`-style intersections unless using `extend`.
- `zod-to-openapi` uses Zod's internal checks API which may differ from other schema libraries.
