# OpenAPI-Fetch Integration Guide

Deep dive into the `schemas-with-client` template and how it leverages `openapi-fetch` for type-safe, runtime-validated API clients.

## Table of Contents

- [Why openapi-fetch?](#why-openapi-fetch)
- [Architecture Overview](#architecture-overview)
- [How It Works](#how-it-works)
- [Validation Flow](#validation-flow)
- [Custom Fetch Options](#custom-fetch-options)
- [Accessing the Raw Client](#accessing-the-raw-client)
- [Migration from Zodios](#migration-from-zodios)

---

## Why openapi-fetch?

### The Problem

Building a custom HTTP client from scratch requires implementing:

- ❌ Path parameter substitution (`/pets/{id}` → `/pets/123`)
- ❌ Query string serialization (`{limit: 10}` → `?limit=10`)
- ❌ Request body encoding
- ❌ Header management
- ❌ Error handling
- ❌ Type inference from OpenAPI spec

This results in 500+ lines of generated code per endpoint and a maintenance burden.

### The Solution

`openapi-fetch` is a battle-tested HTTP client specifically designed for OpenAPI:

- ✅ **Type-safe** - Full TypeScript inference from OpenAPI specs
- ✅ **Zero runtime overhead** - Types are compile-time only
- ✅ **Standards-compliant** - Follows OpenAPI 3.x spec precisely
- ✅ **Actively maintained** - Part of the openapi-typescript ecosystem

By wrapping `openapi-fetch` with Zod validation, we get:

- ✅ Compile-time type safety (from openapi-typescript)
- ✅ Runtime validation (from Zod)
- ✅ Minimal generated code (~100 lines per endpoint vs 500+)
- ✅ We don't maintain HTTP logic - the openapi-ts team does

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Code                            │
│  const api = createApiClient({ baseUrl: '...' });          │
│  const pet = await api.getPet({ id: '123' });              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Generated Client (createApiClient)              │
│                                                               │
│  1. Validate request with Zod                                │
│     pathParams.parse({ id: '123' })                          │
│                                                               │
│  2. Call openapi-fetch (type-safe HTTP)                      │
│     client.get('/pets/{id}', { params: { path: {...} } })   │
│                                                               │
│  3. Validate response with Zod                               │
│     PetSchema.parse(data)                                    │
│                                                               │
│  4. Return validated data                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
┌───────────────────┐         ┌──────────────────┐
│   Zod Schemas     │         │  openapi-fetch   │
│   (Runtime)       │         │  (HTTP + Types)  │
│                   │         │                   │
│ - Validate input  │         │ - Path params    │
│ - Validate output │         │ - Query strings  │
│ - Type coercion   │         │ - Headers        │
│ - Error messages  │         │ - Request body   │
└───────────────────┘         └──────────────────┘
```

### Separation of Concerns

| Layer           | Responsibility               | Maintained By           |
| --------------- | ---------------------------- | ----------------------- |
| **Validation**  | Zod schemas + runtime checks | Us (openapi-zod-client) |
| **HTTP Client** | Fetch, headers, params       | openapi-ts team         |
| **Type Safety** | Compile-time types           | openapi-ts team         |

---

## How It Works

### Step 1: Generate OpenAPI TypeScript Types

```bash
npx openapi-typescript ./openapi.yaml -o ./src/schema.d.ts
```

This creates compile-time TypeScript types from your OpenAPI spec:

```typescript
// schema.d.ts
export interface paths {
  '/pets/{id}': {
    get: {
      parameters: {
        path: { id: string };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              id: string;
              name: string;
            };
          };
        };
      };
    };
  };
}
```

### Step 2: Generate Validated Client

```bash
npx openapi-zod-client ./openapi.yaml -o ./src/api-client.ts --template schemas-with-client
```

This generates:

1. **Zod Schemas** (for runtime validation)

```typescript
export const Pet = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .strict();
```

2. **Endpoint Metadata**

```typescript
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
    },
  },
] as const;
```

3. **Client Factory**

```typescript
export function createApiClient(config: ApiClientConfig) {
  const client = createClient<paths>({ baseUrl: config.baseUrl });

  return {
    async getPet(params: { id: string }) {
      // 1. Validate request
      const validated = validate(
        endpoints[0].request.pathParams,
        params,
        'getPet request params',
        config.validationMode,
      );

      // 2. Call openapi-fetch (type-safe!)
      const { data, error, response } = await client.get('/pets/{id}', {
        params: { path: validated },
      });

      if (error) throw new Error(`API error: ${response.statusText}`);

      // 3. Validate response
      return validate(
        endpoints[0].responses[200].schema,
        data,
        'getPet response',
        config.validationMode,
      );
    },

    _raw: client, // For advanced use
  };
}
```

### Step 3: Use the Client

```typescript
import { createApiClient } from './api-client';

const api = createApiClient({ baseUrl: 'https://api.example.com' });

// TypeScript knows the exact type!
const pet = await api.getPet({ id: '123' });
//    ^? { id: string; name: string }

// Runtime validation catches errors!
await api.getPet({ id: 123 }); // ❌ ZodError: Expected string, received number
```

---

## Validation Flow

### Request Validation

Before making the HTTP request, Zod validates all input:

```typescript
async getPet(params: { id: string }) {
  // Step 1: Validate path parameters
  const validatedPath = validate(
    z.object({ id: z.string() }),
    params,
    'getPet request params',
    validationMode
  );

  // Step 2: Make HTTP request with validated data
  const { data, error } = await client.get('/pets/{id}', {
    params: { path: validatedPath },
  });
}
```

**Benefits:**

- ✅ Catch bugs before making HTTP requests
- ✅ Better error messages (Zod validation errors)
- ✅ Type coercion (e.g., `"123"` → `123` if schema expects number)

### Response Validation

After receiving the HTTP response, Zod validates the data:

```typescript
async getPet(params: { id: string }) {
  // ... make request ...

  if (error) throw new Error(`API error: ${response.statusText}`);

  // Step 3: Validate response against expected schema
  return validate(
    PetSchema,
    data,
    'getPet response',
    validationMode
  );
}
```

**Benefits:**

- ✅ Catch API contract violations
- ✅ Protect against breaking API changes
- ✅ Type narrowing (TypeScript knows the exact shape)

### Validation Modes

#### Strict (default, recommended)

Throws `ZodError` on any validation failure:

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'strict', // default
});

try {
  const pet = await api.getPet({ id: '123' });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation failed:', error.issues);
  }
}
```

#### Loose

Logs warnings but continues with unvalidated data:

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'loose',
});

// Logs: "Validation failed for getPet response: ..."
// But still returns data
const pet = await api.getPet({ id: '123' });
```

**Use case:** Gradual migration or non-critical endpoints.

#### None

Skips validation entirely (maximum performance):

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'none',
});

// No validation overhead
const pet = await api.getPet({ id: '123' });
```

**Use case:** Production after thorough testing, or performance-critical paths.

---

## Custom Fetch Options

### Global Configuration

Set fetch options for all requests:

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-API-Version': '2024-01-01',
    },
    credentials: 'include', // Send cookies
  },
});
```

### Dynamic Headers

Update headers for each request:

```typescript
function createAuthenticatedClient(token: string) {
  return createApiClient({
    baseUrl: 'https://api.example.com',
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

// Refresh token and create new client
const api = createAuthenticatedClient(await getNewToken());
```

### Request Interceptors

Access the raw `openapi-fetch` client for advanced customization:

```typescript
const api = createApiClient({ baseUrl: 'https://api.example.com' });

// Add request interceptor
api._raw.use({
  onRequest({ request }) {
    console.log('Request:', request.method, request.url);
    return request;
  },
  onResponse({ response }) {
    console.log('Response:', response.status);
    return response;
  },
});

// Now all requests are logged
await api.getPet({ id: '123' });
```

---

## Accessing the Raw Client

The generated client exposes the underlying `openapi-fetch` client via `_raw`:

```typescript
const api = createApiClient({ baseUrl: 'https://api.example.com' });

// Use generated methods (with validation)
const pet = await api.getPet({ id: '123' }); // ✅ Validated

// Use raw client (no validation, but type-safe)
const { data } = await api._raw.get('/pets/{id}', {
  params: { path: { id: '123' } },
}); // ⚠️ No validation

// Use for operations not in the spec
const { data: custom } = await api._raw.get('/internal/debug');
```

**When to use `_raw`:**

- Custom endpoints not in the OpenAPI spec
- Streaming responses
- File downloads/uploads with progress
- Advanced openapi-fetch features

---

## Migration from Zodios

If you're migrating from Zodios (the previous approach), here's what changed:

### Before (Zodios)

```typescript
import { Zodios } from '@zodios/core';
import { endpoints } from './api';

const api = new Zodios('https://api.example.com', endpoints);

const pet = await api.getPet({ params: { id: '123' } });
```

**Issues:**

- ❌ Zod 4 incompatibility
- ❌ Tight coupling to Zodios API
- ❌ Zodios-specific terminology

### After (openapi-fetch + Zod)

```typescript
import { createApiClient } from './api-client';

const api = createApiClient({ baseUrl: 'https://api.example.com' });

const pet = await api.getPet({ id: '123' });
```

**Benefits:**

- ✅ Zod 4 compatible
- ✅ Industry-standard HTTP client
- ✅ Cleaner API surface
- ✅ Better TypeScript inference

### Breaking Changes

| Zodios                                 | openapi-fetch                  |
| -------------------------------------- | ------------------------------ |
| `new Zodios(url, endpoints)`           | `createApiClient({ baseUrl })` |
| `api.get('/pets', { params: { id } })` | `api.getPet({ id })`           |
| `api.use(plugin)`                      | `api._raw.use(middleware)`     |

### Migration Steps

1. **Update generation command:**

```bash
# Old
npx openapi-zod-client ./openapi.yaml -o ./src/api.ts

# New
npx openapi-typescript ./openapi.yaml -o ./src/schema.d.ts
npx openapi-zod-client ./openapi.yaml -o ./src/api.ts --template schemas-with-client
```

2. **Update imports:**

```typescript
// Old
import { Zodios } from '@zodios/core';
import { endpoints } from './api';

// New
import { createApiClient } from './api';
```

3. **Update instantiation:**

```typescript
// Old
const api = new Zodios('https://api.example.com', endpoints);

// New
const api = createApiClient({ baseUrl: 'https://api.example.com' });
```

4. **Update method calls:**

```typescript
// Old
await api.get('/pets/:id', { params: { id: '123' } });

// New
await api.getPet({ id: '123' }); // Uses operationId
```

---

## Next Steps

- [Usage Guide](./USAGE.md) - Complete usage documentation
- [Examples](./EXAMPLES.md) - Real-world examples
- [API Reference](./API-REFERENCE.md) - Complete API documentation

---

**Questions or issues?** Please [open an issue](https://github.com/astahmer/openapi-zod-client/issues) on GitHub.
