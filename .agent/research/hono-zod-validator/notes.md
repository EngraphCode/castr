# @hono/zod-validator - Research Notes

## Scope and sources

- Repo path: [tmp/hono-middleware/packages/zod-validator](../../../tmp/hono-middleware/packages/zod-validator)
- Key files:
  - `tmp/hono-middleware/packages/zod-validator/README.md`
  - `tmp/hono-middleware/packages/zod-validator/src/index.ts`
  - `tmp/hono-middleware/packages/zod-validator/src/utils.ts`
  - `tmp/hono-middleware/packages/zod-validator/src/v3.test.ts`
  - `tmp/hono-middleware/packages/zod-validator/src/v4.test.ts`

## What it is

- Hono middleware for request validation using Zod.
- Supports both Zod v3 and v4 in a single API surface.

## Core API surface

- `zValidator(target, schema, hook?, options?)`:
  - `target`: one of `json | form | query | param | header | cookie`.
  - `schema`: Zod schema.
  - `hook`: optional callback to customize error handling.
  - `options.validationFunction`: custom validation (defaults to `schema.safeParseAsync`).

## Validation behavior

- Validates the request part and returns typed data through `c.req.valid(target)`.
- On failure:
  - If hook returns a Response, it is used.
  - Otherwise, returns `400` with the Zod error payload.
- Header validation has special handling:
  - Hono lowercases headers; this middleware maps back to the original schema keys to avoid mismatches.

## Type system behavior

- `InferInput` maps Zod output to input types per target.
- Preserves literal unions for query parameters (e.g., `'asc' | 'desc'`).
- For targets like `query`, it converts scalar values to `string | string[]` unless literal union is detected.
- This is relevant for client-side SDKs and for schema conversion in Castr.

## Tests and fixtures

- Separate tests for Zod v3 and v4 confirm behavior in both versions.
- The tests cover input mapping and validation success/failure cases.

## Implications for Castr

- Provides a clear example of how Zod schemas are adapted for HTTP-layer input types.
- Shows a pragmatic approach for query param typing that preserves literal unions.
- Highlights runtime header normalization issues that affect schema validation.

## Gaps / open questions

- Only validates one target per middleware call; complex multi-part validation requires multiple middlewares.
- By default returns JSON error payload, which may not align with strict error models in all APIs.
