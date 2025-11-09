# MCP Integration Guide

This guide provides comprehensive instructions for integrating `openapi-zod-client` with the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), enabling AI models to interact with OpenAPI-defined APIs through structured tool definitions.

## Table of Contents

- [Overview](#overview)
- [MCP Tool Generation](#mcp-tool-generation)
- [Runtime Validation](#runtime-validation)
- [Error Handling](#error-handling)
- [Security Metadata](#security-metadata)
- [Server Integration Examples](#server-integration-examples)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

The Model Context Protocol (MCP) provides a standardized way for AI models to discover and invoke external tools. `openapi-zod-client` automatically converts OpenAPI operations into MCP-compatible tool definitions with:

- **JSON Schema Draft 07** input/output schemas (MCP requirement)
- **Runtime type guards** for validating tool inputs and outputs
- **Structured error formatting** compatible with JSON-RPC 2.0
- **Security metadata extraction** for authentication documentation
- **Annotation hints** (`readOnlyHint`, `destructiveHint`, `idempotentHint`)

### Key Features

1. **Direct JSON Schema Generation**: Converts OpenAPI schemas to JSON Schema Draft 07 without intermediate Zod-to-JSON-Schema conversion
2. **OpenAPI 3.1 First**: All specs are normalized to OpenAPI 3.1 internally via the [Scalar pipeline](https://github.com/scalar/scalar)
3. **Type-Safe Validation**: Runtime guards using [Ajv](https://ajv.js.org/) with comprehensive error reporting
4. **Security Documentation**: Extracts upstream API authentication requirements for each operation

## MCP Tool Generation

### CLI Usage

Generate an MCP tool manifest alongside your Zod client:

```bash
# Generate both Zod client and MCP manifest
openapi-zod-client ./petstore.yaml -o ./src/api-client.ts --emit-mcp-manifest ./mcp-tools.json

# Manifest only (no client generation)
openapi-zod-client ./petstore.yaml --emit-mcp-manifest ./mcp-tools.json
```

### Programmatic Usage

```typescript
import { generateZodClientFromOpenAPI } from 'openapi-zod-client';
import { writeFile } from 'node:fs/promises';

const result = await generateZodClientFromOpenAPI({
  openApiDoc: './petstore.yaml',
  distPath: './src/api-client.ts',
});

if (result.mcpTools) {
  await writeFile('./mcp-tools.json', JSON.stringify(result.mcpTools, null, 2));
}
```

### Generated Manifest Structure

```json
{
  "tools": [
    {
      "name": "findPetsByStatus",
      "description": "Multiple status values can be provided with comma separated strings",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "object",
            "properties": {
              "status": {
                "type": "string",
                "enum": ["available", "pending", "sold"]
              }
            }
          }
        },
        "required": ["query"]
      },
      "outputSchema": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "integer" },
            "name": { "type": "string" },
            "status": { "type": "string" }
          },
          "required": ["name"]
        }
      },
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "idempotentHint": false
      }
    }
  ]
}
```

## Runtime Validation

### Type Guards

Validate MCP tool structures and payloads at runtime:

```typescript
import { isMcpTool, isMcpToolInput, isMcpToolOutput } from 'openapi-zod-client';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

// Validate tool definition structure
function validateToolDefinition(data: unknown): Tool {
  if (!isMcpTool(data)) {
    throw new Error('Invalid MCP tool definition');
  }
  return data;
}

// Validate input payload before tool execution
function handleToolCall(tool: Tool, payload: unknown) {
  if (!isMcpToolInput(payload, tool)) {
    throw new Error('Invalid input for tool');
  }
  // Safe to execute tool with validated payload
  return executeTool(tool, payload);
}

// Validate output payload after tool execution
function validateToolOutput(tool: Tool, result: unknown) {
  if (!isMcpToolOutput(result, tool)) {
    throw new Error('Tool produced invalid output');
  }
  return result;
}
```

### Integration with Zod

While MCP requires JSON Schema Draft 07, you can still leverage Zod for additional validation:

```typescript
import { z } from 'zod';
import { isMcpToolInput, formatMcpValidationError } from 'openapi-zod-client';

// Define your Zod schema
const petSchema = z.object({
  query: z.object({
    status: z.enum(['available', 'pending', 'sold']),
    limit: z.number().int().positive().optional(),
  }),
});

// Validate with Zod first, then check MCP compatibility
function validateAndExecute(tool: Tool, payload: unknown) {
  try {
    // Zod validation (stricter, more helpful errors during development)
    const validatedPayload = petSchema.parse(payload);

    // MCP validation (ensures JSON Schema Draft 07 compliance)
    if (!isMcpToolInput(validatedPayload, tool)) {
      throw new Error('Payload failed MCP schema validation');
    }

    return executeTool(tool, validatedPayload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors for MCP
      const mcpError = formatMcpValidationError(error, {
        toolName: tool.name,
        direction: 'input',
      });
      throw mcpError;
    }
    throw error;
  }
}
```

## Error Handling

### Formatting Validation Errors

Convert Zod validation errors into MCP-compatible JSON-RPC 2.0 error responses:

```typescript
import { formatMcpValidationError } from 'openapi-zod-client';
import { z } from 'zod';

try {
  const schema = z.object({
    query: z.object({
      tag: z.string(),
      limit: z.number().int().positive(),
    }),
  });

  schema.parse({ query: { tag: 123, limit: -5 } });
} catch (error) {
  if (error instanceof z.ZodError) {
    const formatted = formatMcpValidationError(error, {
      toolName: 'findPetsByTag',
      direction: 'input',
    });

    console.error(formatted);
    // {
    //   code: -32602,
    //   message: "MCP tool 'findPetsByTag' input validation failed",
    //   data: {
    //     issues: [
    //       {
    //         path: ['query', 'tag'],
    //         message: 'Expected string, received number'
    //       },
    //       {
    //         path: ['query', 'limit'],
    //         message: 'Number must be greater than 0'
    //       }
    //     ],
    //     pointer: '/query/tag'
    //   }
    // }
  }
}
```

### Error Codes

The formatter uses JSON-RPC 2.0 standard error codes:

- `-32602` (Invalid params): Schema validation failure
- `-32603` (Internal error): Unexpected validation errors

### Path Tracking

Validation errors include both:

- **JSON path arrays**: `['user', 'profile', 'age']` for nested errors
- **JSON Pointer**: `/user/profile/age` (first error only, MCP convention)

## Security Metadata

`openapi-zod-client` extracts authentication requirements from OpenAPI security definitions and associates them with each operation.

### Security Architecture

**Two-Layer Authentication Model**:

1. **Layer 1 - MCP Protocol Security** (not handled by this library):
   - Transport-level security (stdio, SSE, WebSocket)
   - MCP server authentication
   - Handled by MCP client/server implementations

2. **Layer 2 - Upstream API Security** (documented by this library):
   - API key, OAuth, Bearer token requirements
   - Per-operation security schemes
   - Extracted from OpenAPI `security` and `securitySchemes`

### Security Metadata Structure

Each MCP tool includes security metadata in `annotations.security`:

```json
{
  "name": "updatePet",
  "annotations": {
    "security": [
      {
        "scheme": "petstore_auth",
        "type": "oauth2",
        "flows": {
          "implicit": {
            "authorizationUrl": "https://petstore.swagger.io/oauth/authorize",
            "scopes": {
              "write:pets": "modify pets in your account",
              "read:pets": "read your pets"
            }
          }
        },
        "requiredScopes": ["write:pets"]
      }
    ],
    "readOnlyHint": false,
    "destructiveHint": true
  }
}
```

### Using Security Metadata

```typescript
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

function getAuthenticationRequirements(tool: Tool): string[] {
  const security = tool.annotations?.security;
  if (!security || security.length === 0) {
    return ['No authentication required'];
  }

  return security.map((scheme) => {
    switch (scheme.type) {
      case 'apiKey':
        return `API Key in ${scheme.in}: ${scheme.name}`;
      case 'http':
        return `HTTP ${scheme.scheme} authentication`;
      case 'oauth2':
        const scopes = scheme.requiredScopes?.join(', ') || 'none';
        return `OAuth 2.0 (scopes: ${scopes})`;
      case 'openIdConnect':
        return `OpenID Connect: ${scheme.openIdConnectUrl}`;
      default:
        return 'Unknown authentication type';
    }
  });
}

// Example usage
const requirements = getAuthenticationRequirements(tool);
console.log(`This tool requires: ${requirements.join(' OR ')}`);
```

### Important: Authentication Implementation

**This library does NOT implement authentication**. It only extracts and documents requirements. Your MCP server must:

1. Securely store credentials (API keys, OAuth tokens, etc.)
2. Attach credentials to upstream API requests
3. Handle token refresh/expiration
4. Respect security best practices (e.g., never log tokens)

## Server Integration Examples

### Basic MCP Server

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { isMcpToolInput, formatMcpValidationError } from 'openapi-zod-client';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';

// Load generated MCP tools
const toolsManifest = JSON.parse(await readFile('./mcp-tools.json', 'utf-8'));
const tools = toolsManifest.tools;

const server = new Server(
  {
    name: 'petstore-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  // Validate input
  if (!isMcpToolInput(args, tool)) {
    const error = new z.ZodError([
      {
        code: 'custom',
        path: [],
        message: 'Input does not match tool schema',
      },
    ]);
    throw formatMcpValidationError(error, {
      toolName: tool.name,
      direction: 'input',
    });
  }

  // Execute tool (call upstream API)
  const result = await executeUpstreamApi(tool, args);

  // Validate output
  if (!isMcpToolOutput(result, tool)) {
    const error = new z.ZodError([
      {
        code: 'custom',
        path: [],
        message: 'Output does not match tool schema',
      },
    ]);
    throw formatMcpValidationError(error, {
      toolName: tool.name,
      direction: 'output',
    });
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Advanced: Dynamic Tool Registration

```typescript
import { generateZodClientFromOpenAPI } from 'openapi-zod-client';

async function registerToolsFromSpec(server: Server, specPath: string) {
  const result = await generateZodClientFromOpenAPI({
    openApiDoc: specPath,
  });

  if (!result.mcpTools) {
    throw new Error('Failed to generate MCP tools');
  }

  const tools = result.mcpTools.tools;

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Register handlers for each tool
  tools.forEach((tool) => {
    registerToolHandler(server, tool);
  });
}

function registerToolHandler(server: Server, tool: Tool) {
  // Tool-specific logic here
  // This allows per-tool validation, caching, rate limiting, etc.
}
```

## Troubleshooting

### Common Issues

#### 1. **Input Validation Failures**

**Problem**: `isMcpToolInput` returns `false` for seemingly valid input.

**Solution**: Check JSON Schema Draft 07 compliance. MCP requires strict Draft 07, which differs from OpenAPI 3.1 in some cases:

- Ensure `type` is always present (no implicit types)
- Use `nullable: true` instead of `type: ["string", "null"]` for OpenAPI 3.0
- Check for unsupported OpenAPI extensions

#### 2. **Missing Security Metadata**

**Problem**: `annotations.security` is empty for operations that require authentication.

**Solution**:

- Verify OpenAPI spec includes `security` at operation or global level
- Ensure `securitySchemes` are defined in `components`
- Check that scheme names match between `security` and `securitySchemes`

#### 3. **Output Schema Validation**

**Problem**: `isMcpToolOutput` fails for valid API responses.

**Solution**:

- Check for response status codes: By default, only 2xx success responses are used for output schema
- Verify the API response matches the OpenAPI spec (content-type, structure)
- Use network inspection to compare actual response with expected schema

#### 4. **Tool Names Not Resolving**

**Problem**: Generated tool names don't match expected values.

**Solution**:

- Use `operationId` in your OpenAPI spec for predictable tool names
- Without `operationId`, names are derived from `{method}_{path}` (e.g., `get_pets_by_status`)
- Check for name collisions in the generated manifest

### Debugging Tips

#### Enable Detailed Logging

```typescript
import { logger } from 'openapi-zod-client';

logger.setLevel('debug');
```

#### Inspect Validation Errors

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validate = ajv.compile(tool.inputSchema);
const valid = validate(payload);

if (!valid) {
  console.error('Detailed validation errors:', validate.errors);
}
```

#### Compare Generated vs. Original Schema

```typescript
import { readFile } from 'node:fs/promises';
import { generateZodClientFromOpenAPI } from 'openapi-zod-client';

const result = await generateZodClientFromOpenAPI({
  openApiDoc: './petstore.yaml',
});

// Compare original OpenAPI operation
const originalSpec = JSON.parse(await readFile('./petstore.yaml', 'utf-8'));
const operation = originalSpec.paths['/pets/{id}'].get;

// Compare with generated MCP tool
const tool = result.mcpTools.tools.find((t) => t.name === 'getPetById');

console.log('Original:', JSON.stringify(operation, null, 2));
console.log('Generated:', JSON.stringify(tool, null, 2));
```

## Best Practices

### 1. **Validate Early, Fail Fast**

```typescript
// Validate input before expensive operations
if (!isMcpToolInput(args, tool)) {
  throw new Error('Invalid input'); // Fast failure
}

// Then perform expensive operations
const result = await callUpstreamApi(args);
```

### 2. **Cache Tool Definitions**

```typescript
// Load once at startup
const tools = JSON.parse(await readFile('./mcp-tools.json', 'utf-8')).tools;

// Create lookup map for O(1) access
const toolMap = new Map(tools.map((t) => [t.name, t]));

// Use in handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = toolMap.get(request.params.name);
  // ...
});
```

### 3. **Combine Zod and MCP Validation**

Use Zod during development for better error messages, MCP validation in production for spec compliance:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

function validate(payload: unknown, tool: Tool) {
  if (isDevelopment) {
    // Zod validation: more helpful errors
    return zodSchema.parse(payload);
  } else {
    // MCP validation: spec compliance
    if (!isMcpToolInput(payload, tool)) {
      throw new Error('Invalid input');
    }
    return payload;
  }
}
```

### 4. **Handle Partial Failures Gracefully**

```typescript
async function executeTool(tool: Tool, args: unknown) {
  try {
    const result = await callUpstreamApi(args);
    return result;
  } catch (error) {
    if (error instanceof NetworkError) {
      // Retryable error
      return { error: 'Temporary failure, please retry' };
    }
    // Non-retryable error
    throw error;
  }
}
```

### 5. **Document Authentication Requirements**

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Augment tools with human-readable auth requirements
  const toolsWithDocs = tools.map((tool) => ({
    ...tool,
    description: `${tool.description}\n\nAuthentication: ${getAuthenticationRequirements(tool).join(' OR ')}`,
  }));

  return { tools: toolsWithDocs };
});
```

### 6. **Version Your Tools**

```typescript
// Include API version in tool names
const result = await generateZodClientFromOpenAPI({
  openApiDoc: './petstore-v2.yaml',
  // Tool names will be prefixed if you update the spec
});

// Or use versioned manifests
await writeFile('./mcp-tools-v2.json', JSON.stringify(result.mcpTools));
```

### 7. **Test Tool Validation**

```typescript
import { describe, it, expect } from 'vitest';
import { isMcpToolInput, isMcpToolOutput } from 'openapi-zod-client';

describe('MCP tool validation', () => {
  it('accepts valid input for findPets', () => {
    const payload = { query: { status: 'available' } };
    expect(isMcpToolInput(payload, findPetsTool)).toBe(true);
  });

  it('rejects invalid input for findPets', () => {
    const payload = { query: { status: 123 } };
    expect(isMcpToolInput(payload, findPetsTool)).toBe(false);
  });

  it('validates output schema', () => {
    const result = [{ id: 1, name: 'Fluffy' }];
    expect(isMcpToolOutput(result, findPetsTool)).toBe(true);
  });
});
```

---

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP SDK TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [JSON Schema Draft 07 Specification](https://json-schema.org/draft-07/json-schema-release-notes.html)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [Scalar OpenAPI Parser](https://github.com/scalar/scalar/tree/main/packages/openapi-parser)

---

**Need Help?**

- Report issues: [GitHub Issues](https://github.com/astahmer/openapi-zod-client/issues)
- Ask questions: [GitHub Discussions](https://github.com/astahmer/openapi-zod-client/discussions)
- Security concerns: See [SECURITY.md](../SECURITY.md)
