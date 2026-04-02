# Using Castr With openapi-fetch

This guide documents the current supported pattern.

`@engraph/castr` does not ship a built-in `schemas-with-client` template or a generated `createApiClient()` helper. The supported approach is to compose `openapi-fetch` yourself around Castr's generated schemas and metadata.

That boundary is deliberate. If first-party transport or framework helpers are added later, they will ship as separate companion workspaces rather than inside core `@engraph/castr`.

## Recommended Flow

1. generate `schemas-with-metadata`
2. keep your transport separate from generation
3. use generated schemas or helper functions for request/response validation where needed

## Generate The Building Blocks

```bash
castr ./openapi.yaml -o ./src/api.ts --with-validation-helpers --with-schema-registry
```

That gives you:

- generated Zod schemas
- endpoint metadata
- optional `validateRequest()` / `validateResponse()`
- optional schema registry helpers

## Compose With `openapi-fetch`

Example shape:

```typescript
import createClient from 'openapi-fetch';
import type { paths } from './schema.js';
import { Pet, endpoints, validateResponse } from './api.js';

const client = createClient<paths>({
  baseUrl: 'https://api.example.com',
});

export async function getPet(id: string) {
  const { data, error } = await client.GET('/pets/{id}', {
    params: { path: { id } },
  });

  if (error) {
    throw error;
  }

  return validateResponse(Pet, data, 'getPet response');
}

export function getPetMetadata() {
  return endpoints.find((endpoint) => endpoint.alias === 'getPet');
}
```

## Why This Is The Supported Path

Keeping generation and transport separate means:

- Castr stays focused on canonical schema transformation
- transport choice remains yours
- strict validation stays explicit instead of being hidden in a generated client layer

Any future typed transport helpers would follow the same boundary: separate companion workspaces consuming Castr output, not new core exports.

## Historical Note

If you are looking for `schemas-with-client`, `createApiClient()`, or `validationMode`, you are reading older material. Those are not part of the current public surface.

Use [USAGE.md](./USAGE.md) and [API-REFERENCE.md](./API-REFERENCE.md) as the current source of truth.
