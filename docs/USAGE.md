# Usage Guide

Practical usage for `@engraph/castr` as it exists today.

## Install

```bash
pnpm add @engraph/castr zod
```

If you want to compose the generated output with `openapi-fetch`, `axios`, or another HTTP client, install that separately.

## Quick Start

### CLI

Generate schemas and endpoint metadata:

```bash
castr ./openapi.yaml -o ./src/api.ts
```

Generate schemas only:

```bash
castr ./openapi.yaml -o ./src/schemas.ts --template schemas-only
```

Emit an MCP manifest:

```bash
castr ./openapi.yaml -o ./src/api.ts --emit-mcp-manifest ./src/api.mcp.json
```

### Programmatic

```typescript
import { generateZodClientFromOpenAPI, isSingleFileResult } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  input: './openapi.yaml',
  disableWriteToFile: true,
  template: 'schemas-with-metadata',
  options: {
    withAlias: true,
    shouldExportAllSchemas: true,
  },
});

if (isSingleFileResult(result)) {
  console.log(result.content);
}
```

You can also pass an in-memory OpenAPI document:

```typescript
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const doc: OpenAPIObject = {
  openapi: '3.1.0',
  info: { title: 'Pets', version: '1.0.0' },
  paths: {},
};

await generateZodClientFromOpenAPI({
  openApiDoc: doc,
  distPath: './src/api.ts',
});
```

## Templates

Two built-in templates are supported:

### `schemas-with-metadata`

Default template.

Use it when you want:

- generated Zod schemas
- endpoint metadata
- optional validation helper functions
- optional schema registry helpers

```bash
castr ./openapi.yaml -o ./src/api.ts --with-validation-helpers --with-schema-registry
```

### `schemas-only`

Use it when you only need generated Zod schemas:

```bash
castr ./openapi.yaml -o ./src/schemas.ts --template schemas-only
```

## Build Your Own HTTP Client

Castr does not generate a built-in client factory.

The intended workflow is:

1. generate `schemas-with-metadata`
2. use the exported schemas and endpoint metadata
3. compose transport yourself

That transport can be:

- native `fetch`
- `openapi-fetch`
- `axios`
- `ky`
- a repo-specific wrapper

See [OPENAPI-FETCH-INTEGRATION.md](./OPENAPI-FETCH-INTEGRATION.md) for a current composition pattern.

## Template Context Access

If you want metadata rather than rendered TypeScript, use the template-context API:

```typescript
import { getZodClientTemplateContext } from '@engraph/castr';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

const doc: OpenAPIObject = {
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

## Zod To OpenAPI

Use the Zod parser subpath for code-first workflows:

```typescript
import { parseZodSource } from '@engraph/castr/parsers/zod';
import { writeOpenApi } from '@engraph/castr';

const { ir } = await parseZodSource(`
  import { z } from 'zod';

  export const UserSchema = z.strictObject({
    id: z.uuid(),
    email: z.email(),
  });
`);

const openApiDoc = writeOpenApi(ir);
console.log(openApiDoc.paths);
```

## Strictness And Object Semantics

Castr is strict by design:

- object schemas are treated as closed-world
- unsupported or ambiguous behaviour fails fast
- there is no public strictness toggle for object openness

Support claims are also expected to be complete: if a surface is not implemented and proven end to end, the honest state is unsupported or paused rather than “partially supported”.

## Common Current Migrations

If you are coming from older docs or older generated examples:

| Old surface                             | Current surface                                           |
| --------------------------------------- | --------------------------------------------------------- |
| `openApiFilePath`                       | `input`                                                   |
| `exportSchemas` in programmatic options | `shouldExportAllSchemas`                                  |
| `exportTypes` in programmatic options   | `shouldExportAllTypes`                                    |
| `schemas-with-client`                   | removed; use `schemas-with-metadata` plus your own client |
| `createApiClient()`                     | removed from current public surface                       |
| `validationMode`                        | removed from current public surface                       |

## Related Docs

- [API Reference](./API-REFERENCE.md)
- [Examples](./EXAMPLES.md)
- [Migration Guide](./MIGRATION.md)
