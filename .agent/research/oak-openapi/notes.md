# oak-openapi (consumer repo) - Research Notes

## Scope and sources

- Repo path: [tmp/oak-openapi](../../../tmp/oak-openapi)
- Key files:
  - `tmp/oak-openapi/README.md`
  - `tmp/oak-openapi/package.json`
  - `tmp/oak-openapi/src/lib/zod-openapi/schema/generateDocument.ts`
  - `tmp/oak-openapi/src/lib/endpoint-docs/getEndpointDocs.ts`
  - `tmp/oak-openapi/src/lib/zod-openapi/generated/*`
  - `tmp/oak-openapi/src/app/api/v0/swagger.json/route.ts`
  - `tmp/oak-openapi/src/app/api/v0/[...trpc]/route.ts`

## What it is

- A Next.js app that exposes a public OpenAPI spec for Oak APIs and renders documentation pages.
- Uses tRPC internally and generates OpenAPI via `trpc-to-openapi`.
- Uses zod-openapi types for introspecting the generated document to build docs UI.

## OpenAPI generation pipeline

- `generateOpenApiDocument(router, options)` is used to produce the OpenAPI object.
- `generateDocument.ts` sets:
  - title, version (with optional commit SHA), base URL, docs URL
  - security scheme (bearer auth)
  - tags for grouping
- The spec is served from `/swagger.json` (via Next route) for consumption and UI rendering.

## Zod/OpenAPI schema usage

- Generated Zod schemas live under `src/lib/zod-openapi/generated/*` and are imported by handlers.
- Handlers use generated Zod schemas to validate/shape responses and request parameters.
- The `endpoint-docs` module uses the generated OpenAPI document to:
  - group endpoints by tags
  - resolve `$ref` schemas in `components.schemas`
  - extract field descriptions and example values for documentation UI

## Validation and fixtures

- Validation is implicitly tied to Zod schemas used in tRPC procedures.
- The OpenAPI document is derived from the tRPC router + Zod schemas, so output fixtures include:
  - JSON schema refs in `components.schemas`
  - `application/json` response content
  - tags per operation
- The generated schema files in `src/lib/zod-openapi/generated/` are a concrete fixture set for OpenAPI -> Zod or Zod -> OpenAPI compatibility tests.

## Ecosystem dependencies

- Uses `trpc-to-openapi` and `zod-openapi` directly.
- Uses `openapi3-ts` types to parse/inspect schemas in the docs UI.

## Implications for Castr

- Provides a real-world integration target that expects:
  - consistent `components.schemas` refs
  - `application/json` response schemas
  - tag-driven endpoint grouping
- The generated Zod schemas under `src/lib/zod-openapi/generated` are useful fixture inputs for Castr's Zod parser.
- Shows that consumers expect to inspect the produced OpenAPI document (not just use it for generation), so stability of component names and refs matters.

## Gaps / open questions

- The build pipeline for generating `src/lib/zod-openapi/generated` is not documented here; it may rely on internal scripts.
- The docs UI assumes the OpenAPI output structure from trpc-to-openapi; changes in generation strategy could break docs without tests.
