# Migration Guide

This guide covers the main public-surface shifts in current Castr.

## High-Level Changes

Current Castr is centred on:

- canonical IR as the source of truth
- strict, closed-world object semantics
- generated schemas and metadata rather than a built-in HTTP client
- a narrow core package, with any future transport/runtime/framework helpers living in separate companion workspaces

## Public API Renames And Removals

### Programmatic Generation

| Older docs / older examples          | Current API                                   |
| ------------------------------------ | --------------------------------------------- |
| `openApiFilePath`                    | `input`                                       |
| `openApiDoc` only for prepared input | still supported for in-memory OpenAPI objects |
| `exportSchemas` in `options`         | `shouldExportAllSchemas`                      |
| `exportTypes` in `options`           | `shouldExportAllTypes`                        |
| `template: 'schemas-with-client'`    | removed                                       |
| `validationMode`                     | removed                                       |
| `templatePath`                       | removed                                       |
| custom CLI `--template` path         | accepted for compatibility, but ignored       |

Current shape:

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

await generateZodClientFromOpenAPI({
  input: './openapi.yaml',
  distPath: './src/api.ts',
  template: 'schemas-with-metadata',
  options: {
    shouldExportAllSchemas: true,
    shouldExportAllTypes: true,
    withAlias: true,
  },
});
```

### CLI

Use the published binary:

```bash
castr ./openapi.yaml -o ./src/api.ts
```

Supported built-in templates:

- `schemas-with-metadata`
- `schemas-only`

Current notes:

- `schemas-only` genuinely suppresses endpoints, MCP, and helpers
- custom template paths are not a supported extension seam; non-built-in CLI `--template` values are accepted for compatibility but ignored

## If You Previously Used The Client Template

Older material may refer to:

- `schemas-with-client`
- `createApiClient()`
- `validationMode`

Those are not part of the current public surface.

Migrate to:

1. `schemas-with-metadata`
2. generated Zod schemas and endpoint metadata
3. your own transport wrapper

If first-party transport helpers are added later, expect them in companion workspaces rather than new core `@engraph/castr` exports.

See [OPENAPI-FETCH-INTEGRATION.md](./OPENAPI-FETCH-INTEGRATION.md) for a current composition pattern.

## Strictness Changes

There is no current public toggle for non-strict object behaviour.

Older knobs such as:

- `strictObjects`
- `nonStrictObjectPolicy`
- `additionalPropertiesDefaultValue`

should be treated as removed from the current public path.

## Zod Code-First Workflows

If you previously treated Castr only as an OpenAPI-to-Zod generator, note that the current public surface also includes:

```typescript
import { parseZodSource } from '@engraph/castr/parsers/zod';
import { writeOpenApi } from '@engraph/castr';
```

Use that for Zod 4 source parsing and OpenAPI writing.

## When In Doubt

Use these as the current sources of truth:

- [README.md](../README.md)
- [USAGE.md](./USAGE.md)
- [API-REFERENCE.md](./API-REFERENCE.md)
