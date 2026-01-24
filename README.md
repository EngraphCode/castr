# Castr

> Transform schemas between formats losslessly using a canonical internal representation.

**Castr** (pronounced "caster") generates SDK building blocks from OpenAPI specs:

- ✅ **Zod schemas** with full runtime validation
- ✅ **TypeScript types** inferred from schemas
- ✅ **MCP tools** for AI assistant integration
- ✅ **Endpoint metadata** for building SDKs

## Quick Start

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  openApiFilePath: './openapi.yaml',
  disableWriteToFile: true,
  options: {
    exportSchemas: true,
    exportTypes: true,
  },
});

console.log(result); // Generated Zod schemas + endpoint metadata
```

Install:

```bash
pnpm add @engraph/castr
```

## What Castr Does

**Provides:**

- Building blocks for SDK creation (schemas, validation, metadata)
- Runtime validation using Zod
- Flexible HTTP client integration — use fetch, axios, ky, or any client
- MCP-ready tool definitions for AI integration
- Lossless, deterministic transformations via the canonical IR

**Does NOT provide:**

- Complete HTTP client implementation (bring your own)
- Opinionated SDK structure (you control the architecture)

## Compatibility Goals

Castr is intended to replace schema tooling dependencies in production pipelines, including:

- **openapi-zod-client-style adapters** with native Zod v4 output
- **trpc-to-openapi** and **zod-openapi** for OpenAPI generation from code-first schemas
- **openapi-ts best practices** (plugin surface, DX) with ethical reuse and attribution when code is reused

## Programmatic API

### Basic Generation

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  openApiFilePath: './openapi.yaml',
  distPath: './generated/api.ts',
  options: {
    template: 'schemas-with-metadata',
    exportSchemas: true,
    exportTypes: true,
  },
});
```

### In-Memory Generation

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  openApiFilePath: './openapi.yaml',
  disableWriteToFile: true, // Returns string instead of writing
});

// Use result directly
eval(result); // Or process further
```

### Template Context Access

```typescript
import { getZodClientTemplateContext } from '@engraph/castr';

// Get full template context for custom rendering
const ctx = await getZodClientTemplateContext(openApiDoc, options);
```

### Options

| Option            | Type      | Description                     |
| ----------------- | --------- | ------------------------------- |
| `template`        | `string`  | Output template (see below)     |
| `exportSchemas`   | `boolean` | Export all #/components/schemas |
| `exportTypes`     | `boolean` | Generate TypeScript types       |
| `strictObjects`   | `boolean` | Disallow unknown keys           |
| `withDescription` | `boolean` | Add descriptions via .meta()    |
| `withDocs`        | `boolean` | Add JSDoc comments              |
| `allReadonly`     | `boolean` | Make objects/arrays readonly    |

## Templates

| Template                | Output                        | Use Case               |
| ----------------------- | ----------------------------- | ---------------------- |
| `schemas-with-metadata` | Schemas + endpoints (default) | Building SDKs, tooling |
| `schemas-only`          | Pure Zod schemas              | Validation only        |
| `schemas-with-client`   | Client with openapi-fetch     | Quick prototypes       |

## Zod → OpenAPI (Code-First)

Parse Zod schemas and generate OpenAPI specs:

```typescript
import { parseZodSource } from '@engraph/castr/parsers/zod';
import { writeOpenApi } from '@engraph/castr';

const zodSource = `
  export const UserSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    createdAt: z.iso.datetime(),
  }).meta({ description: 'A user in the system' });
`;

const { ir } = parseZodSource(zodSource);
const openApiDoc = writeOpenApi(ir);
```

**Requirements:**

- Zod 4 syntax only (Zod 3 is rejected with actionable errors)
- Static schemas (no dynamic/computed properties)
- Getter-based recursion (not `z.lazy()`)

See [ADR-032](./docs/architectural_decision_records/ADR-032-zod-input-strategy.md) for details.

## Example

**Input** (OpenAPI):

```yaml
paths:
  /pets/{petId}:
    get:
      operationId: getPetById
      parameters:
        - name: petId
          in: path
          schema: { type: string }
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
components:
  schemas:
    Pet:
      type: object
      required: [id, name]
      properties:
        id: { type: integer }
        name: { type: string }
```

**Output**:

```typescript
import { z } from 'zod';

export const Pet = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const endpoints = [
  {
    method: 'get',
    path: '/pets/:petId',
    operationId: 'getPetById',
    parameters: [{ name: 'petId', type: 'Path', schema: z.string() }],
    response: Pet,
  },
];
```

## CLI

For scripts and CI pipelines:

```bash
castr <input> -o <output> [options]

# Examples
castr ./openapi.yaml -o ./api.ts
castr ./openapi.yaml -o ./schemas.ts --template schemas-only
castr https://api.example.com/openapi.json -o ./api.ts
```

Run `castr --help` for all options.

## OpenAPI Support

- ✅ **OpenAPI 2.0 (Swagger)** — supported as input only (auto-upgraded to 3.1)
- ✅ **OpenAPI 3.0.x** (3.0.0–3.0.3)
- ✅ **OpenAPI 3.1.x** including type arrays, null types

## Architecture

Castr uses a **Caster Model architecture** where all inputs are parsed into a canonical representation:

```text
OpenAPI → CastrDocument → Zod, TypeScript, MCP tools
```

The canonical model (`CastrDocument`, `CastrSchema`) is the single source of truth. See [lib/README.md](./lib/README.md) for internals.

## Contributing

```bash
pnpm install
pnpm test
```

See `.agent/RULES.md` for engineering standards.

## License

MIT
