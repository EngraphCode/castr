# API Reference

Current public API reference for `@engraph/castr`.

This page documents the public surface that exists today. If a symbol or template is not listed here, treat it as unsupported or historical rather than assumed current.

Where a public type is currently wider than the honest supported contract, this page says so explicitly.

## Package Exports

The package currently publishes:

- `@engraph/castr`
- `@engraph/castr/cli`
- `@engraph/castr/parsers/zod`

## CLI

Published binary:

```bash
castr <input> -o <output> [options]
```

`<input>` may be a local OpenAPI/Swagger file path or a URL.

### Core Options

| Option                       | Meaning                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `-o, --output <path>`        | Output file path                                                                |
| `-t, --template <name        | path>`                                                                          | Built-in template selector; non-built-in values are currently parsed then ignored |
| `-p, --prettier <path>`      | Prettier config path                                                            |
| `-a, --with-alias`           | Include operation aliases derived from `operationId`                            |
| `--no-with-alias`            | Disable alias generation                                                        |
| `--export-schemas`           | Export all component schemas                                                    |
| `--export-types`             | Export all object-derived TypeScript types                                      |
| `--with-docs`                | Emit JSDoc comments                                                             |
| `--with-description`         | Emit description metadata                                                       |
| `--all-readonly`             | Emit readonly objects/arrays                                                    |
| `--with-validation-helpers`  | Emit `validateRequest()` / `validateResponse()` helpers                         |
| `--with-schema-registry`     | Emit schema registry helpers                                                    |
| `--emit-mcp-manifest <path>` | Emit an MCP manifest sidecar JSON array alongside the generated TypeScript file |

### Advanced Options

| Option                            | Meaning                                                             |
| --------------------------------- | ------------------------------------------------------------------- |
| `--group-strategy <strategy>`     | `none`, `tag`, `method`, `tag-file`, or `method-file`               |
| `--complexity-threshold <number>` | Controls schema hoisting thresholds during generation               |
| `--default-status <behavior>`     | Status handling behaviour for default-only responses                |
| `--implicit-required`             | Treat properties as required by default unless `required` overrides |
| `--with-deprecated`               | Keep deprecated endpoints in generated output                       |
| `--base-url <url>`                | Advanced template-context metadata field                            |
| `--api-client-name <name>`        | Advanced naming option retained for template compatibility          |
| `--error-expr <expr>`             | Custom error-status expression                                      |
| `--success-expr <expr>`           | Custom primary-success-status expression                            |
| `--media-type-expr <expr>`        | Custom media-type filter expression                                 |
| `--no-client`                     | Convenience flag that selects the metadata-focused generation path  |

### Templates

| Template                | Honest current status                                              |
| ----------------------- | ------------------------------------------------------------------ |
| `schemas-with-metadata` | Stable current generation path: Zod schemas plus endpoint metadata |
| `schemas-only`          | Accepted selector, but it does not yet suppress metadata exports   |

`schemas-with-client` is not part of the current public surface.
Custom template paths are also not part of the honest supported surface even though CLI/programmatic plumbing still exposes a compatibility field for them.

## Programmatic Generation

### `generateZodClientFromOpenAPI()`

```typescript
generateZodClientFromOpenAPI(args): Promise<GenerationResult>
```

Accepted input modes:

- `input: string | URL`
- `openApiDoc: OpenAPIObject`

Output modes:

- `disableWriteToFile: true` for in-memory generation
- `distPath: string` for file output

### Top-Level Arguments

| Field                   | Meaning                                                                        |
| ----------------------- | ------------------------------------------------------------------------------ |
| `input`                 | File path or URL to an OpenAPI document                                        |
| `openApiDoc`            | In-memory OpenAPI object                                                       |
| `distPath`              | Output path when writing files                                                 |
| `disableWriteToFile`    | Return generated output instead of writing it                                  |
| `template`              | `schemas-only` or `schemas-with-metadata`; `schemas-only` still emits metadata |
| `templatePath`          | Compatibility field only; currently ignored by the renderer                    |
| `noClient`              | Convenience selector for `schemas-with-metadata`                               |
| `withValidationHelpers` | Emit `validateRequest()` / `validateResponse()`                                |
| `withSchemaRegistry`    | Emit schema registry helpers                                                   |
| `debugIR`               | Emit serialised IR alongside output when writing files                         |
| `prettierConfig`        | Optional Prettier config object                                                |
| `options`               | `TemplateContextOptions`                                                       |

Important current truth:

- use `input`, not `openApiFilePath`
- use `shouldExportAllSchemas`, not `exportSchemas`, in `options`
- use `shouldExportAllTypes`, not `exportTypes`, in `options`
- `generateZodClientFromOpenAPI()` returns `GenerationResult` only; it does not return `mcpTools`
- `templatePath` remains in the type for compatibility, but current rendering ignores it

### `TemplateContextOptions`

Common options:

| Field                     | Meaning                                          |
| ------------------------- | ------------------------------------------------ |
| `withAlias`               | Include operation aliases                        |
| `shouldExportAllSchemas`  | Export all component schemas                     |
| `shouldExportAllTypes`    | Export all object-derived types                  |
| `withDocs`                | Emit JSDoc comments                              |
| `withDescription`         | Emit description metadata                        |
| `allReadonly`             | Emit readonly objects/arrays                     |
| `groupStrategy`           | Grouping strategy                                |
| `complexityThreshold`     | Complexity threshold for extraction/hoisting     |
| `defaultStatusBehavior`   | Behaviour for default-only responses             |
| `withDeprecatedEndpoints` | Keep deprecated endpoints                        |
| `baseUrl`                 | Advanced template-context metadata field         |
| `apiClientName`           | Advanced naming field retained for compatibility |

## Generation Results

### `GenerationResult`

Discriminated union:

```typescript
type GenerationResult =
  | { type: 'single'; content: string; path?: string }
  | { type: 'grouped'; files: Record<string, string>; paths: string[] };
```

Type guards:

- `isSingleFileResult(result)`
- `isGroupedFileResult(result)`

## Context And IR APIs

### `getZodClientTemplateContext()`

Builds the structured generation context from an OpenAPI document.

Useful when you want:

- endpoint metadata
- ordered schema names
- MCP tool metadata
- the canonical IR document attached as `_ir`

This is the current programmatic source for MCP manifest data from an OpenAPI document.

### `buildIR()`

Builds a canonical `CastrDocument` from an OpenAPI input document.

### `writeOpenApi()`

Writes an OpenAPI document from IR.

### IR Serialisation And Validation

Available from the root package:

- `serializeIR()`
- `deserializeIR()`
- `isCastrDocument()`
- `isIRComponent()`
- `isCastrOperation()`
- `isCastrSchema()`
- `isCastrSchemaNode()`

### MCP Helpers

Available from the root package:

- `buildMcpToolsFromIR()`
- `getMcpToolName()`
- `getMcpToolHints()`
- `buildInputSchemaObject()`
- `buildOutputSchemaObject()`

`buildMcpToolsFromIR()` returns `TemplateContextMcpTool[]`, where manifest security metadata lives alongside `tool` on each entry rather than under `tool.annotations.security`.

## Endpoint Types

Available from the root package:

- `EndpointDefinition`
- `EndpointParameter`
- `EndpointResponse`
- `EndpointError`
- `HttpMethod`
- `RequestFormat`
- `ParameterType`
- `SchemaConstraints`
- `extractParameterMetadata()`
- `extractSchemaConstraints()`

## Zod Parser Subpath

### `@engraph/castr/parsers/zod`

Primary exports:

- `parseZodSource()`
- `extractSchemaName()`
- Zod parse result/error types
- AST helpers and supported parser utilities

Typical usage:

```typescript
import { parseZodSource } from '@engraph/castr/parsers/zod';

const result = await parseZodSource(`
  import { z } from 'zod';
  export const UserSchema = z.strictObject({ id: z.uuid() });
`);

console.log(result.ir.components);
```

## Not Current Public Surface

The following are not current public APIs and should not be documented as supported:

- `schemas-with-client`
- `createApiClient()`
- `validationMode`
- `openApiFilePath`
- programmatic `exportSchemas` / `exportTypes`

## Related Docs

- [Usage Guide](./USAGE.md)
- [Examples](./EXAMPLES.md)
- [Using Castr With openapi-fetch](./OPENAPI-FETCH-INTEGRATION.md)
- [Migration Guide](./MIGRATION.md)
