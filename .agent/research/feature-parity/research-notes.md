# Research Notes and Sources

## Local sources reviewed

- `.agent/research/oak-open-curriculum-sdk/castr-requests/README.md`
- `.agent/research/oak-open-curriculum-sdk/castr-requests/oak-principles.md`
- `.agent/research/oak-open-curriculum-sdk/castr-requests/expected-outputs.md`
- `.agent/research/oak-open-curriculum-sdk/example-oak-sdk-output-ts-metadata.ts`
- `.agent/research/openapi-ts/*`
- `.agent/research/zod/notes.md`
- `.agent/research/zod-openapi/notes.md`
- `.agent/research/zod-to-openapi/notes.md`
- `.agent/research/trpc-to-openapi/notes.md`
- `.agent/research/hono-zod-openapi/notes.md`
- `.agent/research/hono-zod-validator/notes.md`
- `.agent/research/oak-openapi/notes.md`
- [`tmp/openapi-ts`](../../../tmp/openapi-ts) (OpenAPI-TS source + fixtures)
- [`tmp/oak-openapi`](../../../tmp/oak-openapi) (OpenAPI generation and docs usage)
- [`tmp/trpc-to-openapi`](../../../tmp/trpc-to-openapi) (features + usage)
- [`tmp/zod`](../../../tmp/zod) (Zod v4 core schema + toJSONSchema pipeline)
- [`tmp/zod-openapi`](../../../tmp/zod-openapi) (schema annotations and OpenAPI generation)
- [`tmp/zod-to-openapi`](../../../tmp/zod-to-openapi) (Zod -> OpenAPI generator and registry)
- [`tmp/hono-middleware`](../../../tmp/hono-middleware) (Hono middleware monorepo)
- [`tmp/hono-middleware/packages/zod-openapi`](../../../tmp/hono-middleware/packages/zod-openapi) (Hono OpenAPI integration)
- [`tmp/hono-middleware/packages/zod-validator`](../../../tmp/hono-middleware/packages/zod-validator) (Hono Zod validator)
- `lib/src/*` (IR, writers, MCP generation, JSON Schema converter)

## Web sources (for latest behavior / constraints)

- OpenAPI-TS docs (features and plugin ecosystem):
  - <https://heyapi.dev/openapi-ts>
  - <https://heyapi.dev/openapi-ts/plugins>
  - <https://heyapi.dev/openapi-ts/configuration>
- Zod-OpenAPI docs (schema metadata + createDocument):
  - <https://zod-openapi.org/>
  - <https://www.npmjs.com/package/zod-openapi>
- trpc-to-openapi (npm docs and API surface):
  - <https://www.npmjs.com/package/trpc-to-openapi>
- MCP specification (JSON Schema dialect expectations):
  - <https://spec.modelcontextprotocol.io/specification/2025-03-26/basic/jsonrpc#inputschema>

## Web-derived highlights (condensed)

- OpenAPI-TS emphasizes a plugin system and multiple output targets (SDKs, schemas, clients, frameworks) with extensibility via plugins and configuration.
- Zod-OpenAPI uses `zod` metadata (`.meta()` or `.openapi()` extension) to annotate schemas and generate OpenAPI documents via `createDocument`.
- trpc-to-openapi provides `generateOpenApiDocument` and HTTP adapters (including fetch handler) for tRPC routers, plus `OpenApiMeta` typing.
- MCP spec indicates JSON Schema default dialect is 2020-12 (not Draft-07), which affects tool schema generation and validation assumptions.

## Additional local-only highlights (new)

- Zod v4 stores metadata in a global registry and inherits it via parent chains; `id` is not inherited to avoid collisions. This is the backbone for component extraction in zod-openapi.
- zod-openapi v5 uses Zod's native `toJSONSchema` and creates distinct input vs output components for object schemas, which changes `additionalProperties` defaults and can split refs.
- trpc-to-openapi is strict on input shapes (ZodObject required unless void-like, path params non-optional) and restricts query param types to string-like or coercible primitives.
- Hono's zod-openapi uses `zod-to-openapi` (not zod-openapi) and gates body validation by `Content-Type`, defaulting to `{}` for missing headers unless required.
- Hono's zod-validator preserves literal union types for query params while mapping other values to target-specific string-like inputs.
- oak-openapi consumes OpenAPI docs by resolving `$ref` components and expects `components.schemas` to be stable for documentation UI.
- zod-to-openapi uses `.openapi()` metadata and a custom registry to drive schema refs, param inference, and OAS 3.0 vs 3.1 nullable mappings; its `spec/` tests are a strong fixture suite for schema conversion edge cases.

## Tmp library fixtures, tests, and validation approaches

- `tmp/openapi-ts`:
  - Tests: `packages/openapi-ts/src/__tests__`, `packages/openapi-ts/src/openApi/*/parser/__tests__`, `packages/openapi-ts-tests/*/test` with snapshots in `packages/openapi-ts-tests/main/test/__snapshots__`.
  - Fixtures: `specs/2.0.x`, `specs/3.0.x`, `specs/3.1.x` (large spec corpus used in tests).
  - Validation: parser `validate` tests per OAS version; optional `validate_EXPERIMENTAL` (code) and validator plugins documented (Zod/Valibot; Ajv planned); bundling via `@hey-api/json-schema-ref-parser`.
- `tmp/hono-middleware`:
  - Tests: extensive package-level Vitest suites in `packages/*/src/*.test.*` and type tests.
  - Validation approaches: multiple validator packages (`zod-validator`, `valibot-validator`, `arktype-validator`, `typebox-validator`, `typia-validator`, `standard-validator`, `ajv-validator`, `conform-validator`).
  - Fixtures/examples: scattered across packages (e.g., `packages/session/examples/*`, `packages/ua-blocker/src/data/*`).
- `tmp/oak-openapi`:
  - Tests: `__tests__/*.test.ts` plus `__tests__/load-tests.yml` (Artillery).
  - Validation: AJV + ajv-formats in `__tests__/openapi-schema.test.ts` and `bin/openapi-schema-single.ts` to validate generated OpenAPI docs.
  - Fixtures: generated Zod schemas under `src/lib/zod-openapi/generated/*` used by handlers.
- `tmp/trpc-to-openapi`:
  - Tests: `test/generator.test.ts` and `test/adapters/*.test.ts` (Jest).
  - Validation: strict metadata checks (throws on invalid params or unsupported methods); uses Zod for input/output schema validation; TRPCError for runtime parse failures.
- `tmp/zod`:
  - Tests: extensive suites in `packages/zod/src/v4/classic/tests/*`, `core/tests/*`, `mini/tests/*`.
  - Fixtures: JSON Schema snapshots in `classic/tests/to-json-schema.test.ts` and related schema conversion tests.
  - Validation: runtime `parse`/`safeParse`; JSON Schema generation via `toJSONSchema`.
- `tmp/zod-openapi`:
  - Tests: `src/create/*.test.ts` and `src/create/schema/tests/*` (Vitest), plus rename/override tests.
  - Validation: `create/schema/override.ts` enforces representable schemas and throws on unsupported constructs; uses Zod `toJSONSchema` with override hooks.
- `tmp/zod-to-openapi`:
  - Tests: `spec/*` (Jest) covering routes, parameters, metadata overrides, type mappings, and generators.
  - Validation: explicit errors for missing parameter metadata, conflicting names/locations, and unknown Zod types; schema refs tracked with `pending` to resolve cycles.
