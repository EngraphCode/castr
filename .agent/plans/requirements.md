# Requirements

1. We must be able to generate Zod schemas from OpenAPI specifications.
2. We assume the OpenAPI specification will be used to create an SDK.
3. We must be able to generate validation helpers for the SDK request parameters (input) and response bodies (output).
4. We assume the SDK will be used to create a suite of MCP tools.
5. Input and output validation must not be needlessly repeated. Not all MCP tools will be defined from the SDK, but all of our validation helpers will be derived from the SDK, therefore detailed validation must happen at the SDK level.
6. The generated validation helpers must be able to be used to validate the input and output of the MCP tools derived from the SDK. MCP tool definitions _require_ a JSON schema for the input and output. Therefore, although the detailed validation happens at the SDK level, we still need to provide MCP tool definition specific JSON schemas for the input and output.
7. No defensive programming, we fail fast, we fail loud, and we do it with helpful error messages.
8. The library must be built to the highest standards of quality, security, and reliability, and the behaviour of the library must be completely defined by the unit test suite.
9. We must preserve the original public API of openapi-zod-client. We can add additional API surface.
