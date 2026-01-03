# API Reference

Complete API documentation for `@engraph/castr`

## Architecture

This library uses an **Information Retrieval (IR) architecture** where all input formats (OpenAPI, Zod, JSON Schema) are parsed into a canonical internal representation, and all outputs are transforms from that representation. See `.agent/VISION.md` for the strategic vision.

## Table of Contents

- [CLI Commands](#cli-commands)
- [Generated Exports](#generated-exports)
- [Configuration Types](#configuration-types)
- [Validation Modes](#validation-modes)
- [Error Types](#error-types)
- [Programmatic API](#programmatic-api)

---

## CLI Commands

### `@engraph/castr`

Generate TypeScript code from OpenAPI specifications.

```bash
@engraph/castr [input] [options]
```

#### Arguments

| Argument | Description                                | Required |
| -------- | ------------------------------------------ | -------- |
| `input`  | Path to OpenAPI spec (YAML or JSON) or URL | Yes      |

#### Options

| Option             | Alias | Type      | Default                 | Description                                                                      |
| ------------------ | ----- | --------- | ----------------------- | -------------------------------------------------------------------------------- |
| `--output`         | `-o`  | `string`  | stdout                  | Output file path                                                                 |
| `--template`       |       | `string`  | `schemas-with-metadata` | Template to use (`schemas-only`, `schemas-with-metadata`, `schemas-with-client`) |
| `--base-url`       |       | `string`  | `''`                    | Base URL for API requests                                                        |
| `--with-alias`     |       | `boolean` | `false`                 | Include operationId as alias                                                     |
| `--no-with-alias`  |       | `boolean` |                         | Disable operationId aliases                                                      |
| `--strict-objects` |       | `boolean` | `false`                 | Use `.strict()` on all object schemas                                            |
| `--export-schemas` |       | `boolean` | `false`                 | Export all schemas (not just referenced)                                         |
| `--help`           | `-h`  |           |                         | Show help                                                                        |
| `--version`        | `-v`  |           |                         | Show version                                                                     |

#### Examples

```bash
# Generate from local file
@engraph/castr ./openapi.yaml -o ./src/api.ts

# Generate from URL
@engraph/castr https://petstore.swagger.io/v2/swagger.json -o ./src/api.ts

# Use specific template
@engraph/castr ./openapi.yaml -o ./src/api.ts --template schemas-with-client

# Include operationIds
@engraph/castr ./openapi.yaml -o ./src/api.ts --with-alias

# Strict object schemas
@engraph/castr ./openapi.yaml -o ./src/api.ts --strict-objects
```

---

## Generated Exports

### `schemas-only` Template

#### Zod Schemas

```typescript
export const SchemaName = z
  .object({
    // ... properties
  })
  .strict();
```

Exported for every schema in `components/schemas`.

---

### `schemas-with-metadata` Template

#### Zod Schemas

Same as `schemas-only`.

#### `endpoints`

```typescript
export const endpoints: readonly [
  {
    method: "get" | "post" | "put" | "patch" | "delete";
    path: string;
    operationId?: string; // If --with-alias is enabled
    description?: string;
    request: {
      pathParams?: z.ZodObject<...>;
      queryParams?: z.ZodObject<...>;
      headerParams?: z.ZodObject<...>;
      body?: z.ZodType<...>;
    };
    responses: {
      [statusCode: string]: {
        schema: z.ZodType<...>;
        description?: string;
      };
    };
  },
  // ... more endpoints
] as const;
```

---

### `schemas-with-client` Template

#### Zod Schemas

Same as above.

#### `endpoints`

Same as above.

#### `ApiClientConfig`

```typescript
export type ApiClientConfig = {
  /** Base URL for all API requests */
  baseUrl: string;

  /** Optional fetch configuration (headers, credentials, etc.) */
  fetchOptions?: RequestInit;

  /**
   * Validation mode:
   * - 'strict': Throw ZodError on validation failures (default)
   * - 'loose': Log validation errors but continue
   * - 'none': Skip validation entirely
   * @default 'strict'
   */
  validationMode?: 'strict' | 'loose' | 'none';
};
```

#### `createApiClient()`

```typescript
export function createApiClient(config: ApiClientConfig): ApiClient;
```

Factory function that creates a type-safe, runtime-validated API client.

**Parameters:**

- `config`: `ApiClientConfig` - Client configuration

**Returns:**

- `ApiClient` - API client instance with methods for each endpoint

**Example:**

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'strict',
  fetchOptions: {
    headers: {
      Authorization: 'Bearer token',
    },
  },
});
```

#### `ApiClient`

```typescript
export type ApiClient = ReturnType<typeof createApiClient>;
```

The return type of `createApiClient()`. Contains:

- One async method for each operation (named after `operationId` if available)
- `_raw`: Direct access to the underlying `openapi-fetch` client

**Methods:**

Each method corresponds to an operation in the OpenAPI spec:

```typescript
async operationName(params?: {
  [paramName: string]: any; // Path, query, or header params
  body?: any; // Request body (for POST/PUT/PATCH)
}): Promise<ResponseType>;
```

**Example:**

```typescript
// GET /pets/{id}
// operationId: getPet
const pet = await api.getPet({ id: '123' });

// POST /pets
// operationId: createPet
const newPet = await api.createPet({
  name: 'Fluffy',
  species: 'cat',
  age: 3,
});
```

#### `_raw`

Direct access to the underlying `openapi-fetch` client:

```typescript
const api = createApiClient({ baseUrl: 'https://api.example.com' });

// Access raw client
const { data, error, response } = await api._raw.get('/custom-endpoint');
```

**Use cases:**

- Custom endpoints not in the OpenAPI spec
- Streaming responses
- File downloads with progress
- Advanced `openapi-fetch` features (middleware, interceptors)

---

## Configuration Types

### `GenerateZodClientFromOpenApiArgs`

```typescript
export type GenerateZodClientFromOpenApiArgs<TOptions = TemplateContext['options']> = {
  /** OpenAPI document (object or JSON string) */
  openApiDoc: OpenAPIObject | string;

  /** Template name to use for generation */
  template?: 'schemas-only' | 'schemas-with-metadata' | 'schemas-with-client';

  /** Disable writing to file (return string instead) */
  disableWriteToFile?: boolean;

  /** Output file path (if not disableWriteToFile) */
  distPath?: string;

  /** Custom Handlebars instance */
  handlebars?: typeof Handlebars;

  /** Custom template path (overrides 'template' option) */
  templatePath?: string;

  /** Additional template options */
  options?: TOptions;
};
```

### `TemplateContextOptions`

```typescript
export type TemplateContextOptions = {
  /**
   * Include operationId for each endpoint
   * @default false
   */
  withAlias?: boolean | ((path: string, method: string, operation: OperationObject) => string);

  /**
   * Base URL for the API
   * @default ''
   */
  baseUrl?: string;

  /**
   * Use `.strict()` on all object schemas
   * @default false
   */
  strictObjects?: boolean;

  /**
   * Export all schemas (not just referenced ones)
   * @default false
   */
  exportSchemas?: boolean;

  /**
   * Additional properties behavior
   * - `true`: Allow any additional properties
   * - `false`: Disallow additional properties
   * - `'strip'`: Strip additional properties
   * - `'passthrough'`: Allow but don't validate
   * @default 'passthrough'
   */
  additionalPropertiesDefaultValue?: boolean | 'strip' | 'passthrough';

  /**
   * Validation mode for generated client
   * @default 'strict'
   */
  validationMode?: 'strict' | 'loose' | 'none';

  /**
   * Whether to use implicit required (mark as optional only if explicitly optional)
   * @default false
   */
  withImplicitRequired?: boolean;

  /**
   * Whether to include deprecated endpoints
   * @default true
   */
  withDeprecated?: boolean;

  /**
   * Whether to include description in JSDoc
   * @default true
   */
  withDocs?: boolean;

  /**
   * How to handle default status in responses
   * - `'auto-correct'`: Add default status where needed
   * - `'spec-compliant'`: Follow spec exactly
   * @default 'spec-compliant'
   */
  defaultStatusBehavior?: 'auto-correct' | 'spec-compliant';
};
```

---

## Validation Modes

### `strict` (default, recommended)

**Behavior:**

- Validates all request parameters before making HTTP requests
- Validates all response data after receiving HTTP responses
- Throws `ZodError` on any validation failure

**Use cases:**

- Development
- Production (when you want guaranteed type safety)
- Critical operations

**Example:**

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'strict',
});

try {
  const pet = await api.getPet({ id: '123' });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation failed:', error.issues);
  }
}
```

### `loose`

**Behavior:**

- Validates all requests and responses
- Logs warnings to console on validation failures
- Returns unvalidated data (doesn't throw)

**Use cases:**

- Gradual migration from unvalidated to validated code
- Non-critical operations
- Debugging API changes

**Example:**

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'loose',
});

// Logs warning but doesn't throw
const pet = await api.getPet({ id: '123' });
// Warning: Validation failed for getPet response: ...
```

### `none`

**Behavior:**

- Skips all validation
- Maximum performance
- No type guarantees at runtime

**Use cases:**

- Production after thorough testing
- Performance-critical paths
- When you trust the API 100%

**Example:**

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'none',
});

// No validation overhead
const pet = await api.getPet({ id: '123' });
```

---

## Error Types

### `ZodError`

Thrown by Zod when validation fails (in `strict` mode).

```typescript
import { z } from 'zod';

try {
  const pet = await api.createPet({ name: 123 }); // Invalid
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation errors:');
    error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
      // code: 'invalid_type' | 'custom' | ...
      // expected: 'string'
      // received: 'number'
    });
  }
}
```

**Properties:**

- `issues`: Array of validation issues
  - `path`: Path to the invalid field (e.g., `['body', 'name']`)
  - `message`: Human-readable error message
  - `code`: Error code (e.g., `'invalid_type'`, `'too_small'`)

### API Errors

Thrown when HTTP requests fail (non-2xx status codes).

```typescript
try {
  const pet = await api.getPet({ id: 'nonexistent' });
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // "API error (get /pets/{id}): 404 Not Found"
  }
}
```

**Properties:**

- `message`: Formatted error message with method, path, status, and status text

---

## Programmatic API

### `generateZodClientFromOpenAPI()`

```typescript
export async function generateZodClientFromOpenAPI<TOptions = TemplateContext['options']>(
  args: GenerateZodClientFromOpenApiArgs<TOptions>,
): Promise<string | Record<string, string>>;
```

Generate TypeScript code from an OpenAPI specification.

**Parameters:**

- `args`: `GenerateZodClientFromOpenApiArgs` - Generation options

**Returns:**

- `Promise<string>` - Generated TypeScript code (if `disableWriteToFile` is `true`)
- `Promise<Record<string, string>>` - Map of file paths to contents (for grouped templates)

**Example:**

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';
import { readFileSync, writeFileSync } from 'fs';

const openApiDoc = JSON.parse(readFileSync('./openapi.json', 'utf8'));

const result = await generateZodClientFromOpenAPI({
  openApiDoc,
  template: 'schemas-with-client',
  disableWriteToFile: true,
  options: {
    withAlias: true,
    strictObjects: true,
  },
});

writeFileSync('./src/api-client.ts', result);
```

---

## Type Utilities

### Extract Types from Zod Schemas

```typescript
import { z } from 'zod';
import { Pet, CreatePetRequest } from './api-client';

// Extract TypeScript type from Zod schema
type PetType = z.infer<typeof Pet>;
// { id: string; name: string; species: string; age: number }

type CreatePetRequestType = z.infer<typeof CreatePetRequest>;
// { name: string; species: string; age: number }
```

### Extract Endpoint Types

```typescript
import type { endpoints } from './api-client';

// Get type of a specific endpoint
type GetPetEndpoint = (typeof endpoints)[0];
// {
//   method: "get";
//   path: "/pets/{id}";
//   operationId: "getPet";
//   request: { ... };
//   responses: { ... };
// }

// Extract request params type
type GetPetParams = z.infer<(typeof endpoints)[0]['request']['pathParams']>;
// { id: string }

// Extract response type
type GetPetResponse = z.infer<(typeof endpoints)[0]['responses'][200]['schema']>;
// { id: string; name: string; ... }
```

---

## Next Steps

- [Usage Guide](./USAGE.md) - Complete usage documentation
- [OpenAPI-Fetch Integration](./OPENAPI-FETCH-INTEGRATION.md) - Deep dive into the client template
- [Examples](./EXAMPLES.md) - Real-world examples

---

**Architecture:** See `.agent/VISION.md` for the Caster Model-based conversion architecture.

**Questions or issues?** Please [open an issue](https://github.com/jimcresswell/openapi-zod-validation/issues) on GitHub.

**Last Updated:** January 2026
