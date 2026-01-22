# Research Notes and Sources

## Local sources reviewed

- `.agent/research/oak-open-curriculum-sdk/castr-requests/README.md`
- `.agent/research/oak-open-curriculum-sdk/castr-requests/oak-principles.md`
- `.agent/research/oak-open-curriculum-sdk/castr-requests/expected-outputs.md`
- `.agent/research/openapi-ts/*`
- `tmp/oak-openapi` (OpenAPI generation and docs usage)
- `tmp/trpc-to-openapi` (features + usage)
- `tmp/zod-openapi` (schema annotations and OpenAPI generation)
- `lib/src/*` (IR, writers, MCP generation, JSON Schema converter)

## Web sources (for latest behavior / constraints)

- OpenAPI-TS docs (features and plugin ecosystem):
  - https://heyapi.dev/openapi-ts
  - https://heyapi.dev/openapi-ts/plugins
  - https://heyapi.dev/openapi-ts/configuration
- Zod-OpenAPI docs (schema metadata + createDocument):
  - https://zod-openapi.org/
  - https://www.npmjs.com/package/zod-openapi
- trpc-to-openapi (npm docs and API surface):
  - https://www.npmjs.com/package/trpc-to-openapi
- MCP specification (JSON Schema dialect expectations):
  - https://spec.modelcontextprotocol.io/specification/2025-03-26/basic/jsonrpc#inputschema

## Web-derived highlights (condensed)

- OpenAPI-TS emphasizes a plugin system and multiple output targets (SDKs, schemas, clients, frameworks) with extensibility via plugins and configuration.
- Zod-OpenAPI uses `zod` metadata (`.meta()` or `.openapi()` extension) to annotate schemas and generate OpenAPI documents via `createDocument`.
- trpc-to-openapi provides `generateOpenApiDocument` and HTTP adapters (including fetch handler) for tRPC routers, plus `OpenApiMeta` typing.
- MCP spec indicates JSON Schema default dialect is 2020-12 (not Draft-07), which affects tool schema generation and validation assumptions.
