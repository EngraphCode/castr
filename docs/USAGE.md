# Usage Guide

Complete guide to using `@engraph/castr` for generating type-safe API clients with runtime validation.

This library uses an **Intermediate Representation (IR) architecture** - all input formats are parsed into a canonical internal representation, enabling N×M format conversion. See `.agent/VISION.md` for details.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Template Options](#template-options)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Advanced Use Cases](#advanced-use-cases)

---

## Installation

### Core Package

```bash
npm install @engraph/castr
# or
pnpm add @engraph/castr
# or
yarn add @engraph/castr
```

### Peer Dependencies

Depending on which template you use, you'll need different peer dependencies:

#### For `schemas-only` or `schemas-with-metadata` templates

```bash
npm install zod
```

#### For `schemas-with-client` template

```bash
npm install zod openapi-fetch openapi-typescript
```

---

## Quick Start

### CLI Usage

Generate schemas and endpoint metadata:

```bash
npx @engraph/castr ./openapi.yaml -o ./src/api-client.ts
```

Generate a full client with openapi-fetch:

```bash
npx @engraph/castr ./openapi.yaml -o ./src/api-client.ts --template schemas-with-client
```

### Programmatic Usage

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';
import { readFileSync } from 'fs';

const openApiDoc = JSON.parse(readFileSync('./openapi.json', 'utf8'));

const result = await generateZodClientFromOpenAPI({
  openApiDoc,
  disableWriteToFile: true,
  options: {
    withAlias: true,
  },
});

console.log(result); // Generated TypeScript code
```

---

## Template Options

`@engraph/castr` offers three templates for different use cases:

### 1. `schemas-only` - Pure Zod Schemas

**Use when:** You only need validation schemas without endpoint metadata.

**Output:**

- Zod schemas for all OpenAPI components
- No endpoint metadata
- No client generation

**Example:**

```bash
npx @engraph/castr ./openapi.yaml -o ./src/schemas.ts --template schemas-only
```

**Generated code:**

```typescript
import { z } from 'zod';

export const Pet = z
  .object({
    id: z.number().int(),
    name: z.string(),
    status: z.enum(['available', 'pending', 'sold']),
  })
  .strict();

export const CreatePetRequest = z
  .object({
    name: z.string(),
    status: z.enum(['available', 'pending', 'sold']).optional(),
  })
  .strict();
```

### 2. `schemas-with-metadata` - Schemas + Endpoint Metadata (Default)

**Use when:** You want validation schemas AND endpoint metadata for custom client implementations.

**Output:**

- Zod schemas for all components
- Endpoint metadata array with request/response schemas
- No client (bring your own HTTP library)

**Example:**

```bash
npx @engraph/castr ./openapi.yaml -o ./src/api.ts
# or explicitly:
npx @engraph/castr ./openapi.yaml -o ./src/api.ts --template schemas-with-metadata
```

**Generated code:**

```typescript
import { z } from 'zod';

// Schemas
export const Pet = z
  .object({
    id: z.number().int(),
    name: z.string(),
  })
  .strict();

// Endpoint metadata
export const endpoints = [
  {
    method: 'get' as const,
    path: '/pets/{id}',
    operationId: 'getPet',
    request: {
      pathParams: z.object({ id: z.string() }),
    },
    responses: {
      200: { schema: Pet, description: 'Success' },
      404: { schema: z.void(), description: 'Not found' },
    },
  },
] as const;
```

### 3. `schemas-with-client` - Full Client with openapi-fetch

**Use when:** You want a ready-to-use, type-safe client with runtime validation.

**Output:**

- Zod schemas
- Endpoint metadata
- `createApiClient()` factory function
- Runtime validation wrapper around openapi-fetch

**Prerequisites:**

- `openapi-fetch`: ^0.10.0
- `openapi-typescript`: ^7.0.0

**Example:**

```bash
# Step 1: Generate OpenAPI TypeScript types
npx openapi-typescript ./openapi.yaml -o ./src/schema.d.ts

# Step 2: Generate validated client
npx @engraph/castr ./openapi.yaml -o ./src/api-client.ts --template schemas-with-client
```

**Generated code:**

```typescript
import { z } from 'zod';
import createClient from 'openapi-fetch';
import type { paths } from './schema.js';

// ... schemas ...
// ... endpoint metadata ...

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, fetchOptions, validationMode = 'strict' } = config;

  const client = createClient<paths>({ baseUrl, ...fetchOptions });

  return {
    async getPet(params: { id: string }) {
      // Validate request
      const validated = validate(pathParamsSchema, params, 'getPet request params', validationMode);

      // Call openapi-fetch (type-safe!)
      const { data, error, response } = await client.get('/pets/{id}', {
        params: { path: validated },
      });

      if (error) throw new Error(`API error: ${response.statusText}`);

      // Validate response
      return validate(PetSchema, data, 'getPet response', validationMode);
    },

    // ... more methods ...

    _raw: client, // Access raw client for advanced use
  };
}
```

**Usage:**

```typescript
import { createApiClient } from './api-client';

const api = createApiClient({
  baseUrl: 'https://api.example.com',
});

// Type-safe + runtime validated!
const pet = await api.getPet({ id: '123' });
console.log(pet.name); // Fully typed
```

---

## Configuration

### CLI Options

| Option             | Description                                                                      | Default                 |
| ------------------ | -------------------------------------------------------------------------------- | ----------------------- |
| `--output`, `-o`   | Output file path                                                                 | `stdout`                |
| `--template`       | Template to use (`schemas-only`, `schemas-with-metadata`, `schemas-with-client`) | `schemas-with-metadata` |
| `--base-url`       | Base URL for API requests                                                        | `''`                    |
| `--with-alias`     | Include operationId as alias                                                     | `false`                 |
| `--strict-objects` | Use `.strict()` on all object schemas                                            | `false`                 |
| `--export-schemas` | Export all schemas (not just referenced ones)                                    | `false`                 |

### Programmatic Options

```typescript
export type GenerateZodClientFromOpenApiArgs = {
  /** OpenAPI document (object or JSON string) */
  openApiDoc: OpenAPIObject | string;

  /** Template name */
  template?: 'schemas-only' | 'schemas-with-metadata' | 'schemas-with-client';

  /** Disable writing to file (return string instead) */
  disableWriteToFile?: boolean;

  /** Output file path (if not disableWriteToFile) */
  distPath?: string;

  /** Additional options */
  options?: {
    /** Include operationId for each endpoint */
    withAlias?: boolean | ((path: string, method: string, operation: OperationObject) => string);

    /** Base URL for the API */
    baseUrl?: string;

    /** Use `.strict()` on all object schemas */
    strictObjects?: boolean;

    /** Export all schemas */
    exportSchemas?: boolean;

    /** Additional properties behavior */
    additionalPropertiesDefaultValue?: boolean | 'strip' | 'passthrough';

    /** Validation mode for generated client */
    validationMode?: 'strict' | 'loose' | 'none';

    // ... more options
  };
};
```

---

## Error Handling

### Validation Errors (Zod)

When using `schemas-with-client` template, validation errors throw `ZodError`:

```typescript
import { z } from 'zod';
import { createApiClient } from './api-client';

const api = createApiClient({ baseUrl: 'https://api.example.com' });

try {
  const pet = await api.createPet({ name: 123 }); // Invalid type
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation failed:', error.issues);
    // [
    //   {
    //     path: ['name'],
    //     message: 'Expected string, received number',
    //     code: 'invalid_type',
    //     ...
    //   }
    // ]
  }
}
```

### API Errors (HTTP)

API errors (non-2xx status codes) throw standard errors:

```typescript
try {
  const pet = await api.getPet({ id: 'nonexistent' });
} catch (error) {
  if (error instanceof Error) {
    console.error('API error:', error.message);
    // "API error (get /pets/{id}): 404 Not Found"
  }
}
```

### Validation Modes

Control validation behavior with `validationMode`:

#### Strict Mode (default)

Throws on any validation failure:

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'strict', // default
});

await api.getPet({ id: '123' }); // Throws if response doesn't match schema
```

#### Loose Mode

Logs warnings but continues:

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'loose',
});

await api.getPet({ id: '123' }); // Logs warning if invalid, returns data anyway
```

#### None Mode

Skips validation entirely (for performance):

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'none',
});

await api.getPet({ id: '123' }); // No validation, maximum performance
```

---

## Advanced Use Cases

### Custom Fetch Configuration

Add headers, credentials, and other fetch options:

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Custom-Header': 'value',
    },
    credentials: 'include',
  },
});
```

### Accessing Raw Client

For operations not covered by generated methods:

```typescript
const api = createApiClient({ baseUrl: 'https://api.example.com' });

// Use raw openapi-fetch client
const { data, error } = await api._raw.get('/custom-endpoint');
```

### Per-Request Configuration

Override fetch options for specific requests:

```typescript
// With schemas-with-metadata template, build your own wrapper:
import { endpoints } from './api';

async function getPetWithCustomAuth(id: string, token: string) {
  const endpoint = endpoints.find((e) => e.operationId === 'getPet');

  const response = await fetch(`https://api.example.com/pets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  // Validate with Zod
  return endpoint.responses[200].schema.parse(data);
}
```

### Using with React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { createApiClient } from './api-client';

const api = createApiClient({ baseUrl: 'https://api.example.com' });

function usePet(id: string) {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: () => api.getPet({ id }),
  });
}

// In component:
const { data: pet, error, isLoading } = usePet('123');
```

### TypeScript Type Extraction

Extract types from Zod schemas:

```typescript
import { z } from 'zod';
import { Pet, CreatePetRequest } from './api-client';

type PetType = z.infer<typeof Pet>;
// { id: number; name: string; status: "available" | "pending" | "sold" }

type CreatePetRequestType = z.infer<typeof CreatePetRequest>;
// { name: string; status?: "available" | "pending" | "sold" }
```

### Multiple API Clients

Generate separate clients for different services:

```bash
# Generate client for users service
npx @engraph/castr ./users-api.yaml -o ./src/users-client.ts --template schemas-with-client

# Generate client for orders service
npx @engraph/castr ./orders-api.yaml -o ./src/orders-client.ts --template schemas-with-client
```

```typescript
import { createApiClient as createUsersClient } from './users-client';
import { createApiClient as createOrdersClient } from './orders-client';

const users = createUsersClient({ baseUrl: 'https://users.example.com' });
const orders = createOrdersClient({ baseUrl: 'https://orders.example.com' });

const user = await users.getUser({ id: '123' });
const order = await orders.getOrder({ id: '456' });
```

---

## Next Steps

- [OpenAPI-Fetch Integration Guide](./OPENAPI-FETCH-INTEGRATION.md) - Deep dive into the `schemas-with-client` template
- [Examples](./EXAMPLES.md) - Extensive real-world examples
- [API Reference](./API-REFERENCE.md) - Complete API documentation

---

**Architecture:** See `.agent/VISION.md` for the Caster Model-based conversion architecture.

**Questions or issues?** Please [open an issue](https://github.com/jimcresswell/openapi-zod-validation/issues) on GitHub.

**Last Updated:** January 2026
