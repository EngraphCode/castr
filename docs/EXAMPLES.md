# Examples

Current examples for `@engraph/castr`.

## 1. Generate Schemas And Metadata From OpenAPI

```bash
castr ./openapi.yaml -o ./src/api.ts
```

## 2. Select The `schemas-only` Defaults

```bash
castr ./openapi.yaml -o ./src/schemas.ts --template schemas-only
```

Current truth: this selector suppresses endpoint metadata, MCP tool exports, and helper exports. Use the default template when you need manifest data or endpoint metadata.

## 3. Emit An MCP Manifest

```bash
castr ./openapi.yaml -o ./src/api.ts --emit-mcp-manifest ./src/api.mcp.json
```

## 4. Generate In Memory

```typescript
import { generateZodClientFromOpenAPI, isSingleFileResult } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  input: './openapi.yaml',
  disableWriteToFile: true,
  options: {
    withAlias: true,
    shouldExportAllSchemas: true,
  },
});

if (isSingleFileResult(result)) {
  console.log(result.content);
}
```

## 5. Generate From An In-Memory OpenAPI Object

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const doc = {
  openapi: '3.1.0',
  info: { title: 'Pets', version: '1.0.0' },
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        responses: {
          '200': {
            description: 'Success',
          },
        },
      },
    },
  },
};

await generateZodClientFromOpenAPI({
  openApiDoc: doc,
  distPath: './src/api.ts',
});
```

## 6. Access Template Context Directly

```typescript
import { getZodClientTemplateContext } from '@engraph/castr';

const doc = {
  openapi: '3.1.0',
  info: { title: 'Pets', version: '1.0.0' },
  paths: {},
};

const context = getZodClientTemplateContext(doc, {
  withAlias: true,
  shouldExportAllSchemas: true,
});

console.log(context.sortedSchemaNames);
console.log(context.endpoints);
console.log(context.mcpTools);
console.log(context._ir);
```

This is the current programmatic path for MCP manifest data. `generateZodClientFromOpenAPI()` does not expose `result.mcpTools`.

## 7. Build IR And Write OpenAPI

```typescript
import { buildIR, writeOpenApi } from '@engraph/castr';

const doc = {
  openapi: '3.1.0',
  info: { title: 'Pets', version: '1.0.0' },
  paths: {},
};

const ir = buildIR(doc);
const openApi = writeOpenApi(ir);

console.log(openApi.openapi);
```

## 8. Parse Zod Source

```typescript
import { parseZodSource } from '@engraph/castr/parsers/zod';

const result = await parseZodSource(`
  import { z } from 'zod';

  export const UserSchema = z.strictObject({
    id: z.uuid(),
    email: z.email(),
  });
`);

console.log(result.ir.components);
```

## 9. Compose Your Own HTTP Client

This is a composition example, not a hidden core-client surface. If first-party transport helpers are added later, they should live in separate companion workspaces rather than inside core `@engraph/castr`.

```typescript
import createClient from 'openapi-fetch';
import type { paths } from './schema.js';
import { Pet, validateResponse } from './api.js';

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
```

## 10. Current Non-Examples

These belong to older docs, not the current public surface:

- `schemas-with-client`
- `createApiClient()`
- `validationMode`
- `openApiFilePath`
- custom template paths
