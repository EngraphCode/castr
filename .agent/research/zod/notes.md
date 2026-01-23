# Zod v4 - Research Notes

## Scope and sources

- Repo path: [tmp/zod](../../../tmp/zod)
- Key files:
  - `tmp/zod/packages/zod/src/v4/classic/schemas.ts`
  - `tmp/zod/packages/zod/src/v4/core/registries.ts`
  - `tmp/zod/packages/zod/src/v4/core/to-json-schema.ts`
  - `tmp/zod/packages/zod/src/v4/core/json-schema-*.ts` (processor pipeline; inspected via to-json-schema entry point)
  - `tmp/zod/packages/zod/src/v4/classic/tests/to-json-schema.test.ts` (fixtures for JSON Schema output)

## What it is

- Zod v4 is a TypeScript-first schema library with a new core/"classic" split.
- The canonical schema representation is the core `$ZodType` with `_zod.def.type` discriminants.
- The classic API provides ergonomics (`z.object`, `z.string`, etc.) while delegating to core.

## Architectural model

- Core schema node: `$ZodType` with `_zod` internal object containing:
  - `def` (type descriptor, checks, shape, etc.)
  - `parent` (for metadata inheritance)
  - `toJSONSchema` / `processJSONSchema` hooks (optional)
- Classic `ZodType` interface exposes:
  - `.meta()` to read/write metadata
  - `.toJSONSchema()` to emit JSON Schema payloads
  - `~standard` support for Standard Schema compatibility
- Composition happens by wrapping/transforming the `_zod.def` and by tracking parents.

## Metadata and registry behavior

- Metadata is stored in a registry (WeakMap from schema instance to metadata object).
- `globalRegistry` is a singleton attached to `globalThis` to avoid dual package hazards (CJS vs ESM).
- `GlobalMeta` extends `JSONSchemaMeta` with common JSON Schema fields (`id`, `title`, `description`, `deprecated`).
- Metadata inheritance:
  - When retrieving meta, Zod walks `parent` and merges metadata.
  - `id` is not inherited (explicitly deleted to avoid ID collisions).
- This design is the main path used by tools (zod-openapi, zod-to-json-schema) to extract $refs and component IDs.

## JSON Schema generation (toJSONSchema)

- `toJSONSchema` is a processor pipeline with a configurable context:
  - `target`: `draft-2020-12` (default), `draft-07`, `draft-04`, `openapi-3.0`
  - `io`: `input` or `output`
  - `unrepresentable`: `throw` (default) or `any` (fallback to `{}`)
  - `cycles`: `ref` (default) or `throw`
  - `reused`: `ref` or `inline`
  - `override`: hook to mutate JSON schema per node
  - `metadata`: registry (default: `globalRegistry`)
- Behavior highlights:
  - The pipeline collects schemas in a `seen` map to resolve cycles and reuse.
  - Cycles can be emitted as `$ref`s or rejected.
  - Input vs output types influence defaults/examples and handling of transforms.
  - When `io = input`, Zod removes output-only data (like examples/defaults on pipes) and can set `prefault` values as defaults.
- Tests in `classic/tests/to-json-schema.test.ts` show behavior for:
  - tuples, unions, intersections, defaults, lazy schemas
  - `target: openapi-3.0` handling for nullable/tuples
  - cycles, $defs, $ref paths and deduped components

## Validation model

- Runtime validation uses `parse` / `safeParse` (sync or async).
- Transformations, preprocessing, and coercion are encoded in `_zod.def` and impact IO typing.
- Zod allows coercion (`z.coerce`) and transformations (`z.transform`, `z.pipe`) which complicate schema conversion.

## Fixtures and tests (inputs/outputs)

- Extensive JSON Schema snapshots exist in `tmp/zod/packages/zod/src/v4/classic/tests/to-json-schema.test.ts`.
- These tests are a practical reference for edge cases in schema conversion (tuples, unions, cycles, metadata, defaults, IO differences).

## Implications for Castr

- Zod metadata and global registry are the primary integration surface for any Zod -> IR parser.
- Conversion logic should:
  - Read `schema._zod.def.type` and all wrapper types (optional, nullable, default, lazy, pipe, union, intersection, etc.).
  - Respect `meta()` on schemas and handle `id` for component extraction.
  - Decide how to encode `io: input/output` distinctions in the IR (especially for object schemas and transforms).
- Zod's JSON Schema generator supports `openapi-3.0` target directly. This provides a baseline for expected output behavior even if Castr emits 3.1.

## Gaps / open questions

- How to represent Zod transforms and preprocess in Castr IR without losing semantics.
- How to reconcile Zod output strictness vs input permissiveness in a canonical IR.
- Whether to model Zod `globalRegistry` explicitly vs accepting metadata as inlined annotations.
