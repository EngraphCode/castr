# trpc-to-openapi - Research Notes

## Scope and sources

- Repo path: [tmp/trpc-to-openapi](../../../tmp/trpc-to-openapi)
- Key files:
  - `tmp/trpc-to-openapi/README.md`
  - `tmp/trpc-to-openapi/src/types.ts`
  - `tmp/trpc-to-openapi/src/generator/index.ts`
  - `tmp/trpc-to-openapi/src/generator/paths.ts`
  - `tmp/trpc-to-openapi/src/generator/schema.ts`
  - `tmp/trpc-to-openapi/src/utils/zod.ts`
  - `tmp/trpc-to-openapi/src/adapters/*`

## What it is

- Generates OpenAPI documents from tRPC routers and provides HTTP adapters for serving those routes.
- Requires Zod v4 and zod-openapi; relies on Zod to define input/output schemas.

## Core API surface

- `generateOpenApiDocument(router, options)`:
  - Builds an OpenAPI document using `zod-openapi`'s `createDocument`.
  - Combines router metadata, request/response schemas, security schemes, and tags.
- Adapter helpers for frameworks: Express, Fastify, Next.js, Koa, Fetch, Node HTTP, Nuxt, etc.
- Meta typing via `OpenApiMeta` for per-procedure OpenAPI configuration.

## Metadata and routing

- Procedures opt into OpenAPI via `meta.openapi`:
  - `method`, `path`, optional `operationId`, `summary`, `description`, `tags`, `contentTypes`.
  - `requestHeaders` and `responseHeaders` can be provided as Zod schemas.
  - `protect` flag toggles security requirement inclusion.
- `meta.openapi.enabled` exists but the path generator also checks for meta in `forEachOpenApiProcedure`.

## Schema generation model

- Uses zod-openapi to map Zod schemas into OpenAPI requests/responses.
- Request handling:
  - Determines path params from `openapi.path` and ensures they exist in input schema.
  - For body methods (POST/PUT/PATCH), splits path params from body schema; query params are separate.
  - For non-body methods, all input is mapped to query + path params.
- Input schema restrictions:
  - Input parser must be Zod and generally a ZodObject (unless void-like).
  - Path params must be non-optional.
  - Query params must be string-like or coercible primitives (string/number/boolean/bigint/date); arrays are not supported.

## Validation and error behavior

- Strict validation of OpenAPI metadata at generation time:
  - Subscriptions are rejected (OpenAPI not supported).
  - Unsupported HTTP method values throw with context.
  - Missing/invalid Zod parsers throw.
- Error response scaffolding:
  - Default error responses include 401/403 for protected endpoints, plus 400/404/500 where applicable.
  - Can be overridden via `errorResponses` and `successDescription`.
- Uses Zod meta for title/description/examples in schemas.

## Adapters (runtime behavior)

- Fetch adapter wraps a node HTTP handler and adds body parsing:
  - Parses JSON strictly using `JSON.parse` to throw on invalid JSON.
  - Supports `application/x-www-form-urlencoded` via URLSearchParams.
  - Returns parse errors as TRPCError PARSE_ERROR.
- Node HTTP adapter is the core runtime entry point.

## Fixtures and tests

- This repo is mostly runtime and generator code, with tests in `test/` (Jest based).
- Primary fixtures are tRPC procedure examples and OpenAPI snapshot expectations.

## Implications for Castr

- trpc-to-openapi demonstrates a real-world conversion pipeline where:
  - Zod schemas are primary and OpenAPI is derived.
  - Content types are explicitly controlled per-procedure.
  - Validation constraints are enforced early (fail-fast).
- The approach to path params and input schema enforcement is a useful baseline for strict behavior in Castr.
- Error response defaults reflect common API practices; could be offered as optional templates in Castr.

## Gaps / open questions

- Strong constraints on query param types and arrays are a limitation for some APIs.
- No formal round-trip guarantees: OpenAPI output is a view of tRPC, not an IR.
- Error scaffolding is fixed unless overridden, which might not align with all APIs.
