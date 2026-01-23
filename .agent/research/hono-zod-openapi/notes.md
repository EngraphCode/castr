# @hono/zod-openapi - Research Notes

## Scope and sources

- Repo path: [tmp/hono-middleware/packages/zod-openapi](../../../tmp/hono-middleware/packages/zod-openapi)
- Key files:
  - `tmp/hono-middleware/packages/zod-openapi/README.md`
  - `tmp/hono-middleware/packages/zod-openapi/src/index.ts`
  - `tmp/hono-middleware/packages/zod-openapi/src/zod-typeguard.ts`
  - `tmp/hono-middleware/packages/zod-openapi/src/*.test.ts`
  - Dependencies: `@asteasolutions/zod-to-openapi`, `@hono/zod-validator`

## What it is

- A wrapper around Hono (`OpenAPIHono`) that:
  - Validates requests with Zod schemas.
  - Registers OpenAPI metadata and generates an OpenAPI document.
- Uses `@asteasolutions/zod-to-openapi` (not zod-openapi) for OpenAPI generation.

## Core API surface

- `OpenAPIHono` class extends `Hono` and adds:
  - `openapi(route, handler, hook?)` to register a route and its schemas.
  - `doc()` for OpenAPI 3.0 and `doc31()` for OpenAPI 3.1.
  - `getOpenAPIDocument` / `getOpenAPI31Document` for direct generation.
- `createRoute()` helper creates a route definition and adds a non-enumerable `getRoutingPath()` method.
- `$()` helper restores OpenAPIHono typing after chaining Hono methods.

## Schema and metadata model

- Zod schemas are extended with `.openapi()` via `extendZodWithOpenApi(z)` from `zod-to-openapi`.
- `createRoute` expects a `RouteConfig` that includes:
  - `request` (params, query, headers, cookies, body)
  - `responses` with `content` schemas
- `hide` flag prevents a route from being added to OpenAPI registry.

## Validation behavior

- Uses `@hono/zod-validator` for request validation.
- For each request part:
  - Query/params/headers/cookies: validation middleware always added if schema exists.
  - Body: selects validators by content type and only validates if content-type header matches.
- If body is not required and content-type is missing, validated data defaults to `{}`.
- If `request.body.required` is true, validation runs even when content-type is missing.

## OpenAPI generation

- Uses `OpenAPIRegistry` + `OpenApiGeneratorV3`/`V31` from `zod-to-openapi`.
- Registry stores routes, components, webhooks, and schema/parameter registrations.
- `route()` merges child OpenAPIHono registries and normalizes path params (`:id` -> `{id}`).

## Type-level behavior

- Rich request/response typing:
  - Infers input and output types from Zod schemas.
  - Returns typed Hono `TypedResponse` when responses define `content` schemas.
- Uses advanced conditional types to map content type to `json` or `text` outputs.

## Fixtures and tests

- Strong type-tests (`*.test-d.ts`) and unit tests for `createRoute` and OpenAPI generation.
- These tests can serve as examples for supported schema shapes and request parts.

## Implications for Castr

- Demonstrates an integrated "runtime validation + OpenAPI doc" model.
- Shows how content-type driven validation can be handled in middleware (useful for Castr-generated SDKs).
- Highlights alternate metadata pathways (.openapi vs .meta) that Castr should parse if it targets Hono ecosystems.

## Gaps / open questions

- Uses zod-to-openapi rather than zod-openapi, so metadata shape and behavior differ.
- Defaults to permissive behavior when content-type is missing; may conflict with strict-by-default guidance.
- OpenAPI generation occurs at runtime, not via an IR; limited ability to guarantee round-trip fidelity.
