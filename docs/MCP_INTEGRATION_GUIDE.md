# MCP Integration Guide

Current MCP guidance for `@engraph/castr`.

This page is intentionally narrow and honest about the live surface on Sunday, 22 March 2026.

## Current Contract

- the CLI can emit an MCP manifest sidecar with `--emit-mcp-manifest`
- the CLI still always generates a TypeScript output file as well; there is no manifest-only mode
- `generateZodClientFromOpenAPI()` does not return `mcpTools` or a manifest payload
- the programmatic MCP surface is `getZodClientTemplateContext()` or `buildIR()` plus `buildMcpToolsFromIR()`
- manifest entries are JSON arrays of `{ tool, httpOperation, security }`

Pack 6 of the architecture review sweep closed `red` on this surface. The current implementation is useful, but it does not yet prove a fully governed Draft 07 contract end to end. In particular, the review found that MCP schema generation can still copy raw IR keys into JSON-Schema-shaped output. Treat that as a known limitation until the remediation slice lands.

## CLI Usage

Generate TypeScript plus an MCP manifest sidecar:

```bash
castr ./petstore.yaml -o ./src/api.ts --emit-mcp-manifest ./src/api.mcp.json
```

The manifest file is a JSON array. Each element contains:

- `tool`: the MCP `Tool` object
- `httpOperation`: method/path metadata for the upstream HTTP operation
- `security`: resolved upstream API security metadata

## Programmatic Usage

### From An OpenAPI Document

```typescript
import { getZodClientTemplateContext } from '@engraph/castr';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

const doc: OpenAPIObject = {
  openapi: '3.1.0',
  info: { title: 'Pets', version: '1.0.0' },
  paths: {},
};

const context = getZodClientTemplateContext(doc, {
  shouldExportAllSchemas: true,
});

const manifest = context.mcpTools.map(({ tool, httpOperation, security }) => ({
  tool,
  httpOperation,
  security,
}));
```

### From IR

```typescript
import { buildIR, buildMcpToolsFromIR } from '@engraph/castr';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

const doc: OpenAPIObject = {
  openapi: '3.1.0',
  info: { title: 'Pets', version: '1.0.0' },
  paths: {},
};

const ir = buildIR(doc);
const tools = buildMcpToolsFromIR(ir);
```

Use the IR path when you already have a canonical `CastrDocument`. Use the template-context path when you are already generating the downstream TypeScript context from OpenAPI input.

## Manifest Shape

Current CLI and template-context manifests look like this:

```json
[
  {
    "tool": {
      "name": "get_pet_by_id",
      "description": "GET /pets/{id}",
      "inputSchema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              }
            },
            "required": ["id"]
          }
        },
        "required": ["path"]
      },
      "outputSchema": {
        "type": "object"
      },
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "idempotentHint": false
      }
    },
    "httpOperation": {
      "method": "get",
      "path": "/pets/{id}",
      "originalPath": "/pets/{id}",
      "operationId": "getPetById"
    },
    "security": {
      "isPublic": true,
      "usesGlobalSecurity": false,
      "requirementSets": []
    }
  }
]
```

Security metadata is not stored under `tool.annotations.security`. It lives beside the tool on each manifest entry.

## Runtime Validation

Validate loaded tool definitions and payloads with the root-package helpers:

```typescript
import { isMcpTool, isMcpToolInput, isMcpToolOutput } from '@engraph/castr';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

function assertTool(value: unknown): Tool {
  if (!isMcpTool(value)) {
    throw new Error('Invalid MCP tool definition');
  }

  return value;
}

function validateInput(tool: Tool, payload: unknown): void {
  if (!isMcpToolInput(payload, tool)) {
    throw new Error(`Invalid input for ${tool.name}`);
  }
}

function validateOutput(tool: Tool, payload: unknown): void {
  if (!isMcpToolOutput(payload, tool)) {
    throw new Error(`Invalid output for ${tool.name}`);
  }
}
```

`isMcpToolInput()` and `isMcpToolOutput()` compile Draft 07 validators with AJV under the hood. They validate against the schemas on the `Tool` object you pass in.

## Formatting Validation Errors

Use `formatMcpValidationError()` when you already have a `ZodError` and need JSON-RPC-friendly error payloads:

```typescript
import { formatMcpValidationError } from '@engraph/castr';
import { z } from 'zod';

const schema = z.object({
  path: z.object({
    id: z.string(),
  }),
});

try {
  schema.parse({ path: { id: 123 } });
} catch (error) {
  if (error instanceof z.ZodError) {
    const formatted = formatMcpValidationError(error, {
      toolName: 'get_pet_by_id',
      direction: 'input',
    });

    console.error(formatted);
  }
}
```

## Server Integration Sketch

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { isMcpToolInput, isMcpToolOutput } from '@engraph/castr';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('./src/api.mcp.json', 'utf8'));
const tools = manifest.map((entry: { tool: unknown }) => entry.tool);

const server = new Server(
  { name: 'petstore-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools.find((candidate: { name?: string }) => candidate.name === request.params.name);

  if (!tool) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  if (!isMcpToolInput(request.params.arguments, tool)) {
    throw new Error(`Invalid input for ${tool.name}`);
  }

  const result = await executeUpstreamApi(tool, request.params.arguments);

  if (!isMcpToolOutput(result, tool)) {
    throw new Error(`Invalid output for ${tool.name}`);
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
});

await server.connect(new StdioServerTransport());
```

## Security Metadata

Each manifest entry carries resolved upstream API security information:

- `isPublic`
- `usesGlobalSecurity`
- `requirementSets`

The `requirementSets` array models the resolved OpenAPI security requirement sets that apply to the operation. Keep in mind that Pack 6 found this surface is directionally useful but not yet fully proven against every edge case.

## Known Limitations

- `schemas-only` and custom-template entrypoints are separate Pack 6 findings and do not change MCP manifest generation into a separate renderer path
- the CLI has no manifest-only mode; you must still provide `-o`
- `generateZodClientFromOpenAPI()` does not return manifest data
- Pack 6 found Draft 07 normalisation gaps in MCP schema generation, so do not over-claim standards completeness from the current helper surface alone

## Related Docs

- [README.md](../README.md)
- [USAGE.md](./USAGE.md)
- [API-REFERENCE.md](./API-REFERENCE.md)
- [pack-6-context-mcp-rendering-and-generated-surface.md](../.agent/research/architecture-review-packs/pack-6-context-mcp-rendering-and-generated-surface.md)
