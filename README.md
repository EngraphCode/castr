# Castr

> Transform schemas through a canonical IR with strict, closed-world semantics.

Castr is a schema compiler. Its public surface today focuses on:

- OpenAPI input to generated Zod schemas and endpoint metadata
- Zod source parsing to canonical IR
- IR utilities, validation helpers, MCP helpers, and OpenAPI writing

It does not ship a built-in HTTP client. The standard path is to generate schemas and metadata, then compose your own transport layer.

If typed transport or framework helpers are added later, they will ship as separate companion workspaces rather than inside core `@engraph/castr`.

## Install

```bash
pnpm add @engraph/castr zod
```

If you want to compose Castr output with `openapi-fetch` or another HTTP client, install that separately.

## CLI

After installation, use the published binary:

```bash
castr ./openapi.yaml -o ./src/api.ts
```

Two built-in template selectors are currently exposed:

| Template                | Output                              | Use case                           |
| ----------------------- | ----------------------------------- | ---------------------------------- |
| `schemas-with-metadata` | Zod schemas plus endpoint metadata  | Stable current generation path     |
| `schemas-only`          | Zod schemas and exported types only | Honest schema-only generation path |

Examples:

```bash
# Default: schemas + endpoint metadata
castr ./openapi.yaml -o ./src/api.ts

# `schemas-only` selector
castr ./openapi.yaml -o ./src/schemas.ts --template schemas-only

# Emit an MCP manifest alongside generated TypeScript
castr ./openapi.yaml -o ./src/api.ts --emit-mcp-manifest ./src/api.mcp.json
```

Current template truth:

- prefer `schemas-with-metadata` when you need endpoint metadata or MCP manifest data
- `schemas-only` now suppresses `endpoints`, `mcpTools`, and helper exports
- custom template paths are not a supported extension seam; the CLI accepts non-built-in `--template` values for compatibility, but the renderer ignores them

## Programmatic Generation

Use `input` for a file path or URL, or `openApiDoc` for an in-memory document.

```typescript
import { generateZodClientFromOpenAPI, isSingleFileResult } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  input: './openapi.yaml',
  disableWriteToFile: true,
  template: 'schemas-with-metadata',
  options: {
    withAlias: true,
    shouldExportAllSchemas: true,
    shouldExportAllTypes: true,
  },
});

if (isSingleFileResult(result)) {
  console.log(result.content);
}
```

`generateZodClientFromOpenAPI()` returns generated code only. It does not return an MCP manifest payload; use the template-context or IR APIs below for MCP tool data.

In-memory input works too:

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const openApiDoc = {
  openapi: '3.1.0',
  info: { title: 'Pets', version: '1.0.0' },
  paths: {},
};

await generateZodClientFromOpenAPI({
  openApiDoc,
  distPath: './src/api.ts',
});
```

Important current API truth:

- `openApiFilePath` is no longer a valid argument; use `input`
- `exportSchemas` / `exportTypes` are no longer the programmatic option names; use `shouldExportAllSchemas` / `shouldExportAllTypes`
- `schemas-with-client`, `createApiClient()`, and `validationMode` are not part of the current public surface

## Template Context And IR Access

If you want the structured metadata rather than rendered TypeScript, use the template-context and IR exports directly:

```typescript
import { getZodClientTemplateContext, buildIR, writeOpenApi } from '@engraph/castr';

const doc = {
  openapi: '3.1.0',
  info: { title: 'Pets', version: '1.0.0' },
  paths: {},
};

const context = getZodClientTemplateContext(doc, {
  withAlias: true,
  shouldExportAllSchemas: true,
});

const ir = buildIR(doc);
const roundTripped = writeOpenApi(ir);

console.log(context.endpoints);
console.log(context.mcpTools);
console.log(roundTripped.openapi);
```

## Zod To OpenAPI

The `./parsers/zod` subpath parses supported Zod 4 source into Castr's IR.

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
console.log(openApiDoc.openapi);
```

## Strictness

Castr is strict and closed-world by design:

- object schemas are emitted as strict / closed-world
- unsupported behaviour fails fast
- support claims are only honest when code, proofs, and docs agree

There is no public strictness toggle for object openness.

## Build Your Own Client

The supported pattern is:

1. generate `schemas-with-metadata`
2. use the generated schemas and endpoint metadata
3. compose transport with `fetch`, `openapi-fetch`, `axios`, `ky`, or your own wrapper

That boundary is deliberate: future fetch/runtime/framework helpers, if shipped, belong in companion workspaces rather than new core exports.

See [docs/USAGE.md](./docs/USAGE.md), [docs/API-REFERENCE.md](./docs/API-REFERENCE.md), and [docs/OPENAPI-FETCH-INTEGRATION.md](./docs/OPENAPI-FETCH-INTEGRATION.md) for current examples.
