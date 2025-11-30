# openapi-zod-validation

This repo originally started as a fork of [openapi-zod-client](https://github.com/astahmer/openapi-zod-client), but has since been completely rewritten to support two-way conversion between OpenAPI and Zod schemas, and to support automatic generation of MCP tools from OpenAPI specs.

**What this library provides:**

- **Building blocks for SDK creation** - schemas, validation helpers, endpoint metadata, and MCP tools
- **Runtime validation** using Zod schemas
- **Flexible HTTP client integration** - use with fetch, axios, ky, openapi-fetch, or any HTTP client
- **Programmatic API** and **CLI** for code generation
- **MCP-ready** - generates Model Context Protocol tool definitions for AI integration

**What this library does NOT provide:**

- ❌ Complete HTTP client implementation (bring your own)
- ❌ Opinionated SDK structure (you control the architecture)
- ❌ HTTP client configuration (you choose the defaults)

**Use this library to:**

- Generate type-safe Zod schemas from OpenAPI specs
- Build your own SDKs with your preferred HTTP client
- Create MCP tools for AI assistant integration
- Validate requests and responses at runtime

Tested (using [vitest](https://vitest.dev/)) against official [OpenAPI specs samples](https://github.com/OAI/OpenAPI-Specification/tree/main/schemas).

# Why this exists

Sometimes you don't have control on your API, maybe you need to consume APIs from other teams (who might each use a different language/framework), you only have their Open API spec as source of truth. This library helps by generating the **building blocks** you need to create type-safe SDK integrations.

You could use `openapi-zod-validation` to automate generating schemas, validation helpers, and MCP tools on your CI pipeline, then build your SDK integration on top of those building blocks using whatever HTTP client fits your needs (fetch, axios, ky, openapi-fetch, etc.).

**This library is designed for flexibility** - it generates what you need to build SDKs, not complete SDKs themselves. This means you maintain full control over HTTP client choice, error handling strategies, retry logic, and SDK architecture.

## Comparison vs tRPC ts-rest etc

If you do have control on your API/back-end, you should probably use a RPC-like solution like [tRPC](https://github.com/trpc/trpc) or [ts-rest](https://ts-rest.com/) instead of this.

# OpenAPI Input Pipeline

`openapi-zod-validation` uses a **unified OpenAPI input pipeline** that ensures consistent, deterministic behavior across all entry points (CLI and programmatic API).

## Architecture

All OpenAPI documents—whether from file paths, URLs, or in-memory objects—flow through a single preparation pipeline:

1. **Input Normalization**: Accepts file paths, URLs, or pre-parsed OpenAPI objects
2. **Validation & Bundling**: Uses `@apidevtools/swagger-parser` to validate and bundle the spec
3. **Type Safety**: Bridges between SwaggerParser's types and our internal types
4. **Deterministic Output**: Ensures identical processing for identical inputs

## Key Features

- **Single SwaggerParser Usage Point**: All OpenAPI processing happens in one place (`prepareOpenApiDocument`), ensuring consistent behavior
- **Bundle Mode**: Uses SwaggerParser's `bundle()` mode which:
  - Resolves external `$ref`s (file references, URLs)
  - Preserves internal `$ref`s (essential for circular references and dependency tracking)
  - Validates the document structure
- **Circular Reference Handling**: Properly handles schemas that reference themselves (directly or indirectly) using Zod's `z.lazy()` mechanism
- **OpenAPI 3.0.x & 3.1.x Support**: Fully supports both OpenAPI 3.0.x (3.0.0-3.0.3) and 3.1.x specifications

## Why Bundle Mode?

We use `bundle()` mode (not `dereference()`) because:

1. **Circular References**: Dereferencing creates circular JavaScript object references that cause stack overflows during Zod schema generation. Bundle mode preserves `$ref` strings, allowing us to detect cycles and use `z.lazy()` appropriately.
2. **Dependency Tracking**: Our dependency graph relies on `$ref` strings to determine schema ordering. After dereferencing, these `$ref`s are gone, making it impossible to determine which schemas depend on which.
3. **Code Generation**: The Zod conversion code expects `$ref`s, not inlined schemas. It handles `$ref`s by generating references to other schema constants, maintaining clean, readable generated code.

## OpenAPI Version Support

- ✅ **OpenAPI 3.0.x**: Fully supported (3.0.0, 3.0.1, 3.0.2, 3.0.3)
- ✅ **OpenAPI 3.1.x**: Fully supported (3.1.0+) including:
  - Type arrays (e.g., `type: ['string', 'null']`)
  - Standalone `type: 'null'`
  - `exclusiveMinimum`/`exclusiveMaximum` as numbers (not just booleans)
  - Mixed 3.0/3.1 features in the same spec
- ❌ **OpenAPI 2.x (Swagger)**: Not supported—please migrate to OpenAPI 3.0+ using the [official Swagger Editor](https://editor.swagger.io/)

# Usage

with local install:

- `pnpm i -D openapi-zod-validation`
- `pnpm openapi-zod-validation "./input/file.json" -o "./output/client.ts"`

or directly (no install)

- `pnpx openapi-zod-validation "./input/file.yaml" -o "./output/client.ts"`

# auto-generated doc

<https://paka.dev/npm/openapi-zod-validation>

## CLI

```sh
openapi-zod-validation/1.15.0

Usage:
  $ openapi-zod-validation <input>

Commands:
  <input>  path/url to OpenAPI/Swagger document as json/yaml

For more info, run any command with the `--help` flag:
  $ openapi-zod-validation --help

Options:
  -o, --output <path>               Output path for the generated client ts file (defaults to `<input>.client.ts`)
  -t, --template <path>             Template path for the handlebars template that will be used to generate the output
  -p, --prettier <path>             Prettier config path that will be used to format the output client file
  -b, --base-url <url>              Base url for the api
  --no-with-alias                   With alias as api client methods (default: true)
  -a, --with-alias                  With alias as api client methods (default: true)
  --api-client-name <name>          when using the default `template.hbs`, allow customizing the `export const {apiClientName}`
  --error-expr <expr>               Pass an expression to determine if a response status is an error
  --success-expr <expr>             Pass an expression to determine which response status is the main success status
  --media-type-expr <expr>          Pass an expression to determine which response content should be allowed
  --export-schemas                  When true, will export all `#/components/schemas`
  --implicit-required               When true, will make all properties of an object required by default (rather than the current opposite), unless an explicitly `required` array is set
  --with-deprecated                 when true, will keep deprecated endpoints in the api output
  --with-description                when true, will add z.describe(xxx)
  --with-docs                       when true, will add jsdoc comments to generated types
  --group-strategy                  groups endpoints by a given strategy, possible values are: 'none' | 'tag' | 'method' | 'tag-file' | 'method-file'
  --complexity-threshold            schema complexity threshold to determine which one (using less than `<` operator) should be assigned to a variable
  --default-status                  when defined as `auto-correct`, will automatically use `default` as fallback for `response` when no status code was declared
  --all-readonly                    when true, all generated objects and arrays will be readonly
  --export-types                    When true, will defined types for all object schemas in `#/components/schemas`
  --additional-props-default-value  Set default value when additionalProperties is not provided. Default to true. (default: true)
  --strict-objects                  Use strict validation for objects so we don't allow unknown keys. Defaults to false. (default: false)
  -v, --version                     Display version number
  -h, --help                        Display this message
```

## Templates

`openapi-zod-validation` supports multiple output templates to suit different use cases:

### Available Templates

#### 1. **`schemas-with-metadata`** - Schemas + Metadata (default) ⭐

Generates Zod schemas and endpoint metadata without HTTP client dependencies.

**Use when**: You want schemas and metadata to build your own client, or for SDK/tooling generation.

```bash
pnpx openapi-zod-validation ./petstore.yaml -o ./client.ts
# or explicitly:
pnpx openapi-zod-validation ./petstore.yaml -o ./client.ts --template schemas-with-metadata
```

#### 2. **`schemas-only`** - Pure Zod Schemas

Generates only the Zod schemas without any HTTP client code.

**Use when**: You only need the validation schemas, not the HTTP client.

```bash
pnpx openapi-zod-validation ./petstore.yaml -o ./schemas.ts --template schemas-only
```

Example output in [./examples/schemas-only/petstore-schemas.ts](./examples/schemas-only/petstore-schemas.ts)

#### 3. **`schemas-with-client`** - Full Client with openapi-fetch

Generates a complete HTTP client using openapi-fetch with Zod validation.

**Use when**:

- You want to use your own HTTP client (fetch, axios, ky, etc.)
- You need full request/response validation but not the client
- You're building SDK tooling or code generators
- You need MCP (Model Context Protocol) tool definitions

**Features**:

- ✅ All Zod schemas exported
- ✅ Endpoint metadata (method, path, operationId, description)
- ✅ Full request validation (path params, query params, headers, body)
- ✅ Full response validation (all status codes with descriptions)
- ✅ Optional validation helper functions
- ✅ Optional schema registry builder (with key sanitization)
- ✅ MCP-compatible tool definitions

```bash
# Basic usage
pnpx openapi-zod-validation ./petstore.yaml -o ./api-schemas.ts --no-client

# With validation helpers
pnpx openapi-zod-validation ./petstore.yaml -o ./api.ts --no-client --with-validation-helpers

# With schema registry
pnpx openapi-zod-validation ./petstore.yaml -o ./api.ts --no-client --with-schema-registry

# All features
pnpx openapi-zod-validation ./petstore.yaml -o ./api.ts \
  --no-client \
  --with-validation-helpers \
  --with-schema-registry
```

**Example output**:

```typescript
import { z } from 'zod';

// Zod schemas
const Pet = z.object({ id: z.number(), name: z.string() }).strict();
const Error = z.object({ code: z.number(), message: z.string() }).strict();

export const schemas = {
  Pet,
  Error,
} as const;

// Endpoint metadata with full validation schemas
export const endpoints = [
  {
    method: 'get' as const,
    path: '/pets/:petId',
    operationId: 'getPetById',
    description: 'Get a pet by ID',
    request: {
      pathParams: z.object({ petId: z.string() }),
      queryParams: z.object({ include: z.string().optional() }).optional(),
      headers: z.object({ 'x-api-key': z.string() }).optional(),
    },
    responses: {
      200: { description: 'Success', schema: Pet },
      404: { description: 'Not Found', schema: Error },
    },
  },
] as const;

// MCP-compatible tool definitions
export const mcpTools = endpoints.map((endpoint) => ({
  name: endpoint.operationId,
  description: endpoint.description,
  inputSchema: z.object({
    path: endpoint.request.pathParams,
    query: endpoint.request.queryParams,
  }),
  outputSchema: endpoint.responses[200]?.schema || z.unknown(),
})) as const;

// Optional: Validation helpers (--with-validation-helpers)
export function validateRequest(endpoint, input) {
  // Validates path, query, headers, body against endpoint schema
  // Uses .parse() for fail-fast validation (throws on error)
}

export function validateResponse(endpoint, status, data) {
  // Validates response data against endpoint response schema
  // Uses .parse() for fail-fast validation (throws on error)
}

// Optional: Schema registry (--with-schema-registry)
export function buildSchemaRegistry(options?: { rename?: (key: string) => string }) {
  // Builds a sanitized registry of all schemas
  // Useful for dynamic schema lookup by name
}
```

**Options**:

- `--no-client`: Automatically use `schemas-with-metadata` template
- `--with-validation-helpers`: Generate `validateRequest` and `validateResponse` functions
- `--with-schema-registry`: Generate `buildSchemaRegistry` function for dynamic schema access

**Benefits**:

- 🚀 Bring your own HTTP client (any library)
- 🔒 Full type safety with runtime validation
- 📦 Smaller bundle size (no unnecessary HTTP client dependencies)
- 🛠️ Perfect for SDK generation or code tooling
- 🤖 MCP-ready for AI assistant integrations

### Custom Templates

You can also pass a custom [handlebars](https://handlebarsjs.com/) template and/or a [custom prettier config](https://prettier.io/docs/en/configuration.html) with something like:

`pnpm openapi-zod-validation ./example/petstore.yaml -o ./example/petstore-schemas.ts -t ./example/schemas-only.hbs -p ./example/prettier-custom.json --export-schemas`

### MCP (Model Context Protocol) Integration

The `schemas-with-metadata` template includes **MCP-compatible tool definitions** out of the box.

#### What is MCP?

**MCP (Model Context Protocol)** is a standardized protocol developed by Anthropic for enabling AI assistants (like Claude) to interact with external tools, APIs, and data sources. It defines a consistent interface for:

- **Tool Discovery**: How AI systems discover available tools
- **Tool Invocation**: How tools are called with parameters
- **Input/Output Validation**: How parameters and results are validated

#### MCP Tool Schema

The MCP protocol requires tools to follow this structure:

```typescript
{
  name: string;           // Unique identifier (typically operationId from OpenAPI)
  description?: string;   // Human-readable description of what the tool does
  inputSchema: z.ZodType; // Zod schema defining all input parameters
  outputSchema?: z.ZodType; // Zod schema defining the expected response
}
```

#### What Makes `mcpTools` MCP-Specific?

The generated `mcpTools` array transforms OpenAPI endpoints into MCP-compatible tool definitions:

```typescript
export const mcpTools = endpoints.map((endpoint) => {
  // Build a consolidated params object from all request parameter types
  const params: Record<string, z.ZodTypeAny> = {};
  if (endpoint.request?.pathParams) params.path = endpoint.request.pathParams;
  if (endpoint.request?.queryParams) params.query = endpoint.request.queryParams;
  if (endpoint.request?.headers) params.headers = endpoint.request.headers;
  if (endpoint.request?.body) params.body = endpoint.request.body;

  return {
    name: endpoint.operationId || `${endpoint.method}_${endpoint.path}`,
    description: endpoint.description || `${endpoint.method.toUpperCase()} ${endpoint.path}`,
    inputSchema: Object.keys(params).length > 0 ? z.object(params) : z.object({}),
    outputSchema: endpoint.responses[200]?.schema || endpoint.responses[201]?.schema || z.unknown(),
  };
}) as const;
```

#### Key MCP-Specific Design Decisions

1. **Consolidated Input Schema**: Unlike `endpoints` (which separates path, query, headers, body), MCP tools use a **single `inputSchema`** that nests all parameter types:

   ```typescript
   inputSchema: z.object({
     path: z.object({ userId: z.string() }),
     query: z.object({ include: z.string().optional() }),
     headers: z.object({ authorization: z.string() }),
     body: CreateUserPayload,
   });
   ```

2. **Success-Focused Output**: MCP tools use the **primary success response** (200 or 201) as `outputSchema`, not all possible responses. This is because:
   - MCP focuses on the "happy path" for tool execution
   - Error handling is typically done at the protocol level (HTTP status, exceptions)
   - AI assistants need clear expectations of successful tool output

3. **Fallback to `z.unknown()`**: If no 200/201 response is defined, `outputSchema` defaults to `z.unknown()` to maintain type safety while allowing any valid JSON.

4. **Name from `operationId`**: MCP tools use OpenAPI's `operationId` as the tool name (with fallback to auto-generated name), ensuring:
   - Human-readable tool identifiers
   - Consistency with API documentation
   - Uniqueness across the API surface

#### Why Not Just Use `endpoints`?

While `endpoints` provides **full validation** for all request/response scenarios, `mcpTools` is optimized for **AI tool integration**:

| Feature                | `endpoints`                                      | `mcpTools`                               |
| ---------------------- | ------------------------------------------------ | ---------------------------------------- |
| **Request Structure**  | Separated (path, query, headers, body)           | Consolidated (single inputSchema)        |
| **Response Structure** | All status codes (200, 201, 400, 404, 500, etc.) | Primary success only (200/201)           |
| **Use Case**           | HTTP client implementation, full validation      | AI assistant tool discovery & invocation |
| **Validation**         | Comprehensive (all edge cases)                   | Success-focused (happy path)             |
| **TypeScript Types**   | Detailed per-parameter types                     | Simplified input/output types            |

#### Real-World Example

Given this OpenAPI endpoint:

```yaml
paths:
  /users/{userId}:
    get:
      operationId: getUserById
      description: Retrieve a user by their ID
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
        - name: include
          in: query
          schema:
            type: string
      responses:
        200:
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        404:
          description: User not found
```

The generated `mcpTools` entry looks like:

```typescript
{
  name: "getUserById",
  description: "Retrieve a user by their ID",
  inputSchema: z.object({
    path: z.object({ userId: z.string() }),
    query: z.object({ include: z.string().optional() }).optional(),
  }),
  outputSchema: User, // The User Zod schema
}
```

An AI assistant can now:

1. **Discover** this tool from the `mcpTools` array
2. **Validate** user input against `inputSchema` before making the API call
3. **Parse** the API response using `outputSchema`
4. **Handle** the validated result in a type-safe manner

#### Using MCP Tools in Practice

```typescript
import { mcpTools, endpoints } from './api.ts';

// AI assistant discovers available tools
const tool = mcpTools.find((t) => t.name === 'getUserById');

// Validate user request
const input = tool.inputSchema.parse({
  path: { userId: '123' },
  query: { include: 'profile' },
});

// Make API call (using your own HTTP client)
const response = await fetch(`https://api.example.com/users/${input.path.userId}`, {
  headers: { 'Content-Type': 'application/json' },
});

// Validate response
const data = tool.outputSchema.parse(await response.json());
```

This structure aligns perfectly with how MCP servers expose tools to AI assistants, making `openapi-zod-validation` a powerful bridge between OpenAPI specs and AI tool integration.

## When using the CLI

- `--success-expr` is bound to [`isMainResponseStatus`](https://github.com/astahmer/openapi-zod-validation/blob/b7717b53023728d077ceb2f451e4787f32945b3d/src/generateZodClientFromOpenAPI.ts#L234-L244)
- `--error-expr` is bound to [`isErrorStatus`](https://github.com/astahmer/openapi-zod-validation/blob/b7717b53023728d077ceb2f451e4787f32945b3d/src/generateZodClientFromOpenAPI.ts#L245-L256)

You can pass an expression that will be safely evaluated (thanks to [whence](https://github.com/jonschlinkert/whence/)) to determine which OpenAPI `ResponseItem` should be picked as the main success response and which ones should be treated as errors.

Example: `--success-expr "status >= 200 && status < 300"`

## Tips

- You can omit the `-o` (output path) argument if you want and it will default to the input path with a `.ts` extension: `pnpm openapi-zod-validation ./input.yaml` will generate a `./input.yaml.ts` file
- **URLs as Input**: The unified pipeline accepts URLs directly. The pipeline automatically downloads and validates the spec:

  ```bash
  pnpx openapi-zod-validation https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml -o ./petstore.ts
  ```

- **Multi-file Documents**: The pipeline automatically resolves external `$ref`s (file references, URLs) via SwaggerParser's bundle mode. Your multi-file OpenAPI specs should work out-of-the-box without manual dereferencing.

- **Circular References**: The pipeline properly handles schemas that reference themselves (e.g., a `Node` schema with a `next: Node` property). These are automatically converted to Zod's `z.lazy()` for correct runtime behavior.
- If you only need a few portions of your OpenAPI spec (i.e. only using a few endpoints from the [GitHub REST API OpenAPI Spec](https://github.com/OAI/OpenAPI-Specification)), consider using [openapi-endpoint-trimmer](https://github.com/aacitelli/openapi-endpoint-trimmer) to trim unneeded paths from your spec first. It supports prefix-based omitting of paths, helping significantly cut down on the length of your output types file, which generally improves editor speed and compilation times.

## Example

- You can check an example [input](./examples/petstore.yaml) (the petstore example when you open/reset [editor.swagger.io](https://editor.swagger.io/)) and [output](./examples/basic/petstore-client.ts)
- there's also [an example of a programmatic usage](./examples/basic/petstore-generator.ts)
- or you can check the tests in the `src` folder which are mostly just inline snapshots of the outputs

# tl;dr

[input](./samples/v3.0/petstore.yaml):

```yaml
openapi: '3.0.0'
info:
  version: 1.0.0
  title: Swagger Petstore
  license:
    name: MIT
servers:
  - url: http://petstore.swagger.io/v1
paths:
  /pets:
    get:
      summary: List all pets
      operationId: listPets
      tags:
        - pets
      parameters:
        - name: limit
          in: query
          description: How many items to return at one time (max 100)
          required: false
          schema:
            type: integer
            format: int32
      responses:
        '200':
          description: A paged array of pets
          headers:
            x-next:
              description: A link to the next page of responses
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pets'
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    post:
      summary: Create a pet
      operationId: createPets
      tags:
        - pets
      responses:
        '201':
          description: Null response
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  /pets/{petId}:
    get:
      summary: Info for a specific pet
      operationId: showPetById
      tags:
        - pets
      parameters:
        - name: petId
          in: path
          required: true
          description: The id of the pet to retrieve
          schema:
            type: string
      responses:
        '200':
          description: Expected response to a valid request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    Pet:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        tag:
          type: string
    Pets:
      type: array
      items:
        $ref: '#/components/schemas/Pet'
    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: integer
          format: int32
        message:
          type: string
```

output:

```ts
import { z } from 'zod';

const Pet = z.object({ id: z.number().int(), name: z.string(), tag: z.string().optional() });
const Pets = z.array(Pet);
const Error = z.object({ code: z.number().int(), message: z.string() });

export const schemas = {
  Pet,
  Pets,
  Error,
};

const endpoints = makeApi([
  {
    method: 'get',
    path: '/pets',
    requestFormat: 'json',
    parameters: [
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.array(Pet),
  },
  {
    method: 'post',
    path: '/pets',
    requestFormat: 'json',
    response: z.void(),
  },
  {
    method: 'get',
    path: '/pets/:petId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'petId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Pet,
  },
]);
```

# TODO

- handle OA `prefixItems` -> output `z.tuple`
- rm unused (=never referenced) variables from output

# Caveats

**OpenAPI Version Support:**

- ✅ **OpenAPI 3.0.x and 3.1.x**: Fully supported and tested
- ❌ **OpenAPI 2.x (Swagger)**: Not supported—please migrate to OpenAPI 3.0+

You can migrate Swagger 2.0 specs to OpenAPI 3.0+ using the [official Swagger Editor](https://editor.swagger.io/) using the Edit -> Convert to OpenAPI 3.0 menu.

## Contributing

- A `.node-version` file has been provided in the repository root, use your preferred Node.js manager which [supports](https://github.com/shadowspawn/node-version-usage#supporting-products) the standard to manage the development Node.js environment
- The monorepo supports [corepack](https://nodejs.org/api/corepack.html), follow the linked instructions to locally install the development package manager (i.e. [pnpm](https://pnpm.io/))

```bash
> pnpm install
> pnpm test
```

Assuming no issue were raised by the tests, you may use `pnpm dev` to watch for code changes during development.

If you fix an edge case please make a dedicated minimal reproduction test in the [`tests`](./tests) folder so that it doesn't break in future versions

Make sure to generate a [changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md) before submitting your PR.
