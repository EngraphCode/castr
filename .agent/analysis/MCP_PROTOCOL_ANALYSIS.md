# MCP Protocol Analysis

**Created:** November 5, 2025  
**Target Version:** MCP 2025-06-18  
**Purpose:** Document MCP tool structure, constraints, and requirements for code generation

---

## Overview

This document analyzes the Model Context Protocol (MCP) specification version 2025-06-18 to inform implementation of MCP tool generation from OpenAPI specifications.

**Key Reference:** [MCP Specification Repository](https://github.com/modelcontextprotocol/specification)  
**Schema Location:** `schema/2025-06-18/schema.json`

---

## JSON Schema Version

**Critical Finding:** MCP uses **JSON Schema Draft 07**, not Draft 2020-12.

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#"
}
```

**Source:** `.agent/reference/reference-repos/modelcontextprotocol/schema/2025-06-18/schema.json:2`

**Implications:**
- All generated JSON Schemas must conform to Draft 07
- No Draft 2020-12 features (dynamic refs, `$anchor`, etc.)
- Use Draft 07 validation keywords only
- Configure `zod-to-json-schema` (if used) for Draft 07 target

---

## MCP Tool Structure

### Core Definition

MCP tools are defined by the `Tool` type in the schema:

```typescript
{
  "name": string,              // REQUIRED - Unique identifier
  "title"?: string,            // Optional human-readable name
  "description"?: string,      // Human-readable functionality description
  "inputSchema": {             // REQUIRED - JSON Schema Draft 07
    "type": "object",          // MUST be "object" at root
    "properties": {...},
    "required": [...]
  },
  "outputSchema"?: {           // Optional output validation schema
    "type": "object",          // MUST be "object" at root
    "properties": {...},
    "required": [...]
  },
  "annotations"?: ToolAnnotations,  // Optional behavior hints
  "_meta"?: Record<string, unknown> // Optional metadata (implementation-specific)
}
```

### Required Fields

1. **`name`** (string, required)
   - Unique identifier for the tool
   - Used programmatically by LLMs and clients
   - Convention: `snake_case` (observed in MCP examples)
   - Example: `"get_weather_data"`, `"create_user"`

2. **`inputSchema`** (object, required)
   - JSON Schema Draft 07 object
   - **MUST** have `"type": "object"` at root level
   - Defines expected parameters for tool invocation
   - If operation has no parameters, use empty object schema:
     ```json
     {
       "type": "object",
       "properties": {},
       "required": []
     }
     ```

### Optional Fields

3. **`title`** (string, optional)
   - Human-readable name for UI display
   - Optimized for end-users (not developers)
   - Example: `"Weather Information Provider"`

4. **`description`** (string, optional)
   - Human-readable description of functionality
   - Used by LLMs to understand tool purpose
   - Should be clear, concise, and actionable
   - Example: `"Get current weather information for a location"`

5. **`outputSchema`** (object, optional)
   - JSON Schema Draft 07 object
   - **MUST** have `"type": "object"` at root level
   - Defines structure of `structuredContent` in `CallToolResult`
   - When provided:
     - Servers **MUST** provide conforming structured results
     - Clients **SHOULD** validate results against this schema

6. **`annotations`** (ToolAnnotations, optional)
   - Behavior hints for clients (see next section)
   - **IMPORTANT:** These are untrusted hints, not guarantees
   - Clients **MUST** treat as untrusted unless from trusted servers

---

## Tool Annotations

### Definition

`ToolAnnotations` provide optional behavioral hints about tools:

```typescript
{
  "title"?: string,           // Human-readable title
  "readOnlyHint"?: boolean,   // Tool doesn't modify environment
  "destructiveHint"?: boolean, // Tool may perform destructive updates
  "idempotentHint"?: boolean, // Repeated calls have no additional effect
  "openWorldHint"?: boolean   // Tool interacts with open world entities
}
```

### Security Warning

**From MCP Specification:**
> All properties in ToolAnnotations are **hints**. They are not guaranteed to provide a faithful description of tool behavior (including descriptive properties like `title`).
>
> Clients should never make tool use decisions based on ToolAnnotations received from untrusted servers.

### Annotation Meanings

#### `readOnlyHint` (default: false)
- **True:** Tool does not modify its environment
- **False:** Tool may modify state
- **Use case:** Help clients understand side effects
- **OpenAPI mapping:** `GET`, `HEAD`, `OPTIONS` operations → `true`

#### `destructiveHint` (default: true)
- **True:** Tool may perform destructive updates (deletes, overwrites)
- **False:** Tool performs only additive updates
- **Meaningful only when:** `readOnlyHint == false`
- **OpenAPI mapping:** `DELETE` operations → `true`

#### `idempotentHint` (default: false)
- **True:** Repeated calls with same arguments have no additional effect
- **False:** Each call may have different effects
- **Meaningful only when:** `readOnlyHint == false`
- **OpenAPI mapping:** `PUT` operations → `true` (HTTP idempotency)

#### `openWorldHint` (default: true)
- **True:** Tool interacts with "open world" external entities
- **False:** Tool's domain of interaction is closed
- **Examples:**
  - Open world: web search, external API calls, public databases
  - Closed world: in-memory store, local file operations, session data

### Title Display Precedence

**Display name resolution order:**
1. `title` field (top-level)
2. `annotations.title` field
3. `name` field (fallback)

**From MCP Specification:**
> For Tool, `annotations.title` should be given precedence over using `name`, if present.

---

## Tool Naming Conventions

### Recommended Format

Based on MCP examples and protocol conventions:

```typescript
// OpenAPI operationId → MCP tool name
operationId: "getWeatherData"   → name: "get_weather_data"
operationId: "createUser"       → name: "create_user"
operationId: "listItems"        → name: "list_items"
operationId: "deleteResource"   → name: "delete_resource"
```

**Convention:** `snake_case` with lowercase letters

### Uniqueness Requirement

- Tool names **MUST** be unique within a server
- No two tools can share the same `name`
- If OpenAPI has duplicate operationIds, must disambiguate:
  - Append HTTP method: `"create_user_post"`
  - Append path hint: `"get_user_by_id"`, `"get_user_by_email"`

---

## Input/Output Schema Constraints

### Root Type Requirement

**Critical Constraint:** Both `inputSchema` and `outputSchema` **MUST** have `"type": "object"` at root.

```json
{
  "inputSchema": {
    "type": "object",  // ← REQUIRED
    "properties": {
      "location": { "type": "string" }
    }
  }
}
```

### Why This Matters

1. **Validation:** MCP schema validator enforces this constraint
2. **Client expectations:** Clients expect object-shaped arguments
3. **JSON-RPC alignment:** Matches JSON-RPC 2.0 params structure

### Handling Edge Cases

#### Operation with no parameters
```json
{
  "inputSchema": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

#### Operation with single primitive parameter
Transform from:
```yaml
# OpenAPI
parameters:
  - name: id
    in: path
    schema:
      type: string
```

To:
```json
{
  "inputSchema": {
    "type": "object",
    "properties": {
      "id": { "type": "string" }
    },
    "required": ["id"]
  }
}
```

---

## Tool Results

### Result Structure

Tool invocation returns `CallToolResult`:

```typescript
{
  "content": Content[],        // Array of content items
  "structuredContent"?: object, // Optional structured output
  "isError": boolean           // True if execution failed
}
```

### Content Types

Tools can return multiple content types:

1. **Text Content**
   ```json
   { "type": "text", "text": "Result text" }
   ```

2. **Image Content**
   ```json
   {
     "type": "image",
     "data": "base64-encoded-data",
     "mimeType": "image/png"
   }
   ```

3. **Audio Content**
   ```json
   {
     "type": "audio",
     "data": "base64-encoded-audio",
     "mimeType": "audio/wav"
   }
   ```

4. **Resource Links**
   ```json
   {
     "type": "resource_link",
     "uri": "file:///path/to/resource",
     "name": "resource.txt"
   }
   ```

### Structured Content

When `outputSchema` is provided:
- Structured results in `structuredContent` field
- **MUST** conform to the `outputSchema`
- For backward compatibility, **SHOULD** also provide equivalent unstructured content

---

## Error Handling

### Two Error Mechanisms

#### 1. Protocol Errors (JSON-RPC)

Standard JSON-RPC errors for:
- Unknown tool names
- Invalid arguments
- Server errors
- Invalid request structure

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32602,
    "message": "Unknown tool: invalid_tool_name"
  }
}
```

#### 2. Tool Execution Errors

Reported in tool results with `isError: true`:
- API failures
- Invalid input data
- Business logic errors
- Timeout/network issues

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Failed to fetch weather data: API rate limit exceeded"
      }
    ],
    "isError": true
  }
}
```

### Error Code Guidelines

**JSON-RPC Error Codes:**
- `-32700`: Parse error
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32000 to -32099`: Server-defined errors

---

## Protocol Messages

### Tools List Request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {
    "cursor": "optional-cursor-value"
  }
}
```

### Tools List Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get_weather",
        "title": "Weather Information Provider",
        "description": "Get current weather information for a location",
        "inputSchema": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City name or zip code"
            }
          },
          "required": ["location"]
        }
      }
    ],
    "nextCursor": "next-page-cursor"
  }
}
```

### Tool Call Request

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "location": "New York"
    }
  }
}
```

---

## Security Considerations

### User Consent Model

**From MCP Specification:**
> For trust & safety and security, there **SHOULD** always be a human in the loop with the ability to deny tool invocations.

**Requirements for MCP clients:**
- Provide UI showing which tools are exposed
- Visual indicators when tools are invoked
- Confirmation prompts for operations
- Clear understanding of tool behavior before authorization

### Server Requirements

MCP servers **MUST**:
- Validate all tool inputs
- Implement proper access controls
- Rate limit tool invocations
- Sanitize tool outputs

### Client Requirements

MCP clients **SHOULD**:
- Prompt for user confirmation on sensitive operations
- Show tool inputs before calling server (prevent data exfiltration)
- Validate tool results before passing to LLM
- Implement timeouts for tool calls
- Log tool usage for audit purposes

### Untrusted Annotations

**Critical Security Note:**
> Tool annotations (including descriptive properties like `title`) are **untrusted hints** unless obtained from a trusted server.

Clients must not make security decisions based on annotations from untrusted servers.

---

## Pagination Support

The `tools/list` operation supports pagination:

```json
{
  "method": "tools/list",
  "params": {
    "cursor": "optional-cursor-value"
  }
}
```

Response includes `nextCursor` for fetching additional pages:

```json
{
  "result": {
    "tools": [...],
    "nextCursor": "next-page-cursor"
  }
}
```

---

## List Changed Notifications

Servers that declare `listChanged` capability can notify clients when tool lists change:

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/tools/list_changed"
}
```

**Capability Declaration:**
```json
{
  "capabilities": {
    "tools": {
      "listChanged": true
    }
  }
}
```

---

## Implementation Checklist

### For OpenAPI → MCP Tool Generation

- [ ] Extract operationId and convert to snake_case for `name`
- [ ] Generate human-readable `title` from summary or operationId
- [ ] Use operation description for tool `description`
- [ ] Convert parameters to `inputSchema` (always `type: "object"`)
- [ ] Convert response schemas to `outputSchema` (if applicable)
- [ ] Map HTTP methods to `annotations`:
  - GET/HEAD/OPTIONS → `readOnlyHint: true`
  - DELETE → `destructiveHint: true`
  - PUT → `idempotentHint: true`
- [ ] Ensure all JSON Schemas are Draft 07 compliant
- [ ] Handle operations with no parameters (empty object schema)
- [ ] Ensure tool name uniqueness within spec
- [ ] Generate comprehensive tool descriptions for LLMs

---

## References

- [MCP Specification 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/)
- [MCP Tools Documentation](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [JSON Schema Draft 07](http://json-schema.org/draft-07/schema)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol/specification)

---

**Last Updated:** November 5, 2025  
**Status:** Complete - Ready for implementation

