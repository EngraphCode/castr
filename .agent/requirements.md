# Requirements

1. We must be able to generate Zod schemas from OpenAPI specifications.
2. We assume the OpenAPI specification will be used to create an SDK.
3. We must be able to generate validation helpers for the SDK request parameters (input) and response bodies (output).
4. We assume consumers will build SDKs using the generated schemas and helpers, and those SDKs will be used to create MCP tools.
5. Not all MCP tools will be defined from the SDK, but all of our validation helpers will be derived from the SDK, therefore detailed validation must happen at the SDK level.
6. The generated validation helpers must be able to be used to validate the input and output of the MCP tools derived from the SDK. MCP tool definitions _require_ a JSON schema for the input and output. Therefore, although the detailed validation happens at the SDK level, we still need to provide MCP tool definition specific JSON schemas for the input and output.
7. We must be able to generate JSON schemas from OpenAPI specifications.
8. We must be able to generate OpenAPI specifications from Zod schemas.
9. This library must be usable as a programmatic API.
10. This library must be usable as a CLI.
11. When consumed as either a programmatic API or a CLI, the user MUST be able to pass an OpenAPI specification to the library.
12. Invalid OpenAPI specification documents must be rejected with helpful error messages.
13. Valid OpenAPI specification documents may contain references.
14. If required, the library must be able to dereference the OpenAPI specification document.
15. When consumed as either a programmatic API or a CLI, the user MUST be able to pass a Zod schema to the library.
16. We will ONLY support Zod 4, not Zod 3.
17. Invalid Zod schemas must be rejected with helpful error messages.
18. No defensive programming, we fail fast, we fail loud, and we do it with helpful error messages.
19. The library must be built to the highest standards of quality, security, and reliability, and the behaviour of the library must be completely defined by the unit test suite.
20. This library provides **building blocks** (schemas, validation helpers, endpoint metadata, MCP tools) that enable consumers to build type-safe SDKs with their HTTP client of choice. It does NOT generate complete HTTP client implementations.
21. Consumers are free to choose their HTTP client (fetch, axios, ky, openapi-fetch, etc.) and wire it with the generated schemas and validation helpers. The library MAY provide optional integration examples but MUST NOT require any specific HTTP client as a hard dependency.
22. A separate workspace will be created that consumes this library to construct a full, strictly type-safe SDK with an opinionated HTTP client integration. This demonstrates how to build complete SDKs using the building blocks provided by this library.
