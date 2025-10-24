# Task 1.9: Oak-Optimized Enhancements

**Date:** October 24, 2025  
**Status:** Planning Complete, Ready for Implementation  
**Priority:** MEDIUM-HIGH (Critical for Oak Curriculum SDK)

---

## Executive Summary

Task 1.9 creates a new `schemas-with-metadata` template specifically optimized for the Oak Curriculum SDK use case, while remaining useful for all users who need validation without an HTTP client.

**Key Value Proposition for Oak:**
- **Eliminates 60+ lines of fragile string manipulation** from `zodgen-core.ts`
- **Removes type assertion** (line 27-28 in zodgen-core.ts)
- **Provides full request/response validation** out of the box
- **Drop-in replacement** with minimal code changes

---

## Current Oak Pain Points

### From `.agent/reference/oak_usage/zodgen-core.ts`

**Problems:**

1. **Heavy Post-Processing (Lines 46-109):**
   ```typescript
   // Generates with default template, then does 60+ lines of regex replacement
   const withExportedEndpoints = output.replace(/const endpoints = makeApi/g, 'export const endpoints = makeApi');
   const schemasPattern = /export const schemas = {[\s\S]*?};/;
   const modifiedContent = withExportedEndpoints.replace(schemasPattern, (substring) => {
     // ... complex string manipulation
   });
   // ... 50+ more lines of regex replacements 😱
   ```

2. **Type Assertion (Lines 27-28):**
   ```typescript
   const openApiDocWithPaths: Parameters<typeof generateZodClientFromOpenAPI>[0]['openApiDoc'] =
     // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- openapi-zod-client uses an outdated PathsObject definition
     openApiDoc as OpenAPIObject & { paths: PathsObject };
   ```

3. **Unwanted Zodios Client:**
   - Generates `export const api = new Zodios(endpoints);`
   - Oak doesn't want the HTTP client, only schemas and metadata

4. **Manual Schema Registry Building:**
   - Oak implements custom `sanitizeSchemaKeys` function
   - Oak implements custom `buildCurriculumSchemas` function
   - Oak implements custom `renameInlineSchema` logic
   - All of this could be provided by the library

### From `.agent/reference/oak_usage/typegen-core.ts`

**What Works Well:**

```typescript
// Oak correctly uses the programmatic API
import { getZodiosEndpointDefinitionList } from 'openapi-zod-client';

const endpointContext = getZodiosEndpointDefinitionList(sdkSchemaWithPaths, {
  shouldExportAllSchemas: true,
  shouldExportAllTypes: true,
  groupStrategy: 'none',
  withAlias: false,
});
const requestValidatorContent = emitRequestValidatorMap(endpointContext.endpoints);
```

✅ This is good! They build custom validators from endpoint metadata.

---

## Solution: `schemas-with-metadata` Template

### Generated Output Structure

```typescript
import { z } from "zod";

// ==========================================
// SCHEMAS - All Zod schemas from OpenAPI
// ==========================================
export const UserSchema = z.object({ /* ... */ });
export const CreateUserRequestSchema = z.object({ /* ... */ });
export const ErrorSchema = z.object({ /* ... */ });

export const schemas = {
  UserSchema,
  CreateUserRequestSchema,
  ErrorSchema,
  // ... all schemas
} as const;

// ==========================================
// ENDPOINTS - Full validation metadata
// ==========================================
export const endpoints = [
  {
    method: "post" as const,
    path: "/users/{userId}",
    operationId: "createUser",
    description: "Create a new user",

    // Request validation (ALL parameter types)
    request: {
      // Path parameters with Zod schema
      pathParams: z.object({
        userId: z.string().uuid(),
      }),
      // Query parameters with Zod schema
      queryParams: z.object({
        include: z.enum(["profile", "settings"]).optional(),
      }).optional(),
      // Header parameters with Zod schema
      headers: z.object({
        "x-api-key": z.string(),
      }).optional(),
      // Body schema
      body: CreateUserRequestSchema.optional(),
    },

    // Response validation (success + errors)
    responses: {
      200: {
        description: "Success",
        schema: UserSchema,
      },
      400: {
        description: "Bad Request",
        schema: ErrorSchema,
      },
      404: {
        description: "Not Found",
        schema: ErrorSchema,
      },
    },
  },
] as const;

// ==========================================
// VALIDATION HELPERS (--with-validation-helpers)
// ==========================================
export function validateRequest<T extends (typeof endpoints)[number]>(
  endpoint: T,
  input: {
    pathParams?: Record<string, unknown>;
    queryParams?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    body?: unknown;
  },
): {
  pathParams: z.infer<T["request"]["pathParams"]>;
  queryParams?: z.infer<NonNullable<T["request"]["queryParams"]>>;
  headers?: z.infer<NonNullable<T["request"]["headers"]>>;
  body?: z.infer<NonNullable<T["request"]["body"]>>;
} {
  return {
    pathParams: endpoint.request.pathParams.parse(input.pathParams),
    queryParams: endpoint.request.queryParams?.parse(input.queryParams),
    headers: endpoint.request.headers?.parse(input.headers),
    body: endpoint.request.body?.parse(input.body),
  };
}

export function validateResponse<
  T extends (typeof endpoints)[number],
  S extends keyof T["responses"] & number,
>(endpoint: T, status: S, data: unknown): z.infer<T["responses"][S]["schema"]> {
  const responseSchema = endpoint.responses[status];
  if (!responseSchema) {
    throw new Error(`No schema defined for status ${status}`);
  }
  return responseSchema.schema.parse(data);
}

// ==========================================
// SCHEMA REGISTRY HELPER (--with-schema-registry)
// ==========================================
export function buildSchemaRegistry(
  rawSchemas: typeof schemas,
  options?: { rename?: (key: string) => string },
): Record<string, z.ZodSchema> {
  const rename = options?.rename ?? ((key: string) => key.replace(/[^A-Za-z0-9_]/g, "_"));
  const result: Record<string, z.ZodSchema> = {};
  for (const [key, value] of Object.entries(rawSchemas)) {
    const sanitized = rename(key);
    result[sanitized] = value;
  }
  return result;
}

// ==========================================
// MCP TOOLS (always included)
// ==========================================
export const mcpTools = endpoints.map(endpoint => ({
  name: endpoint.operationId || `${endpoint.method}_${endpoint.path.replace(/[\/{}]/g, "_")}`,
  description: endpoint.description || `${endpoint.method.toUpperCase()} ${endpoint.path}`,
  // Input: all request parameters as single schema
  inputSchema: z.object({
    ...(endpoint.request.pathParams ? { path: endpoint.request.pathParams } : {}),
    ...(endpoint.request.queryParams ? { query: endpoint.request.queryParams } : {}),
    ...(endpoint.request.headers ? { headers: endpoint.request.headers } : {}),
    ...(endpoint.request.body ? { body: endpoint.request.body } : {}),
  }),
  // Output: success response (200 or 201)
  outputSchema: endpoint.responses[200]?.schema || endpoint.responses[201]?.schema || z.unknown(),
}));
```

---

## Oak Workflow Transformation

### Before (Current - zodgen-core.ts)

```typescript
// 115 lines of code

const openApiDocWithPaths: Parameters<typeof generateZodClientFromOpenAPI>[0]['openApiDoc'] =
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  openApiDoc as OpenAPIObject & { paths: PathsObject }; // ❌ Type assertion

const output = await generateZodClientFromOpenAPI({
  openApiDoc: openApiDocWithPaths,
  templatePath, // default.hbs
  distPath: outFile,
  options: {
    shouldExportAllSchemas: true,
    shouldExportAllTypes: true,
    groupStrategy: 'none',
    withAlias: false,
  },
});

// 60+ lines of string manipulation 😱
const withTypedImport = output.replace('import { z } from "zod";', 'import { z, type ZodSchema } from "zod";');
const withExportedEndpoints = withTypedImport.replace(/const endpoints = makeApi/g, 'export const endpoints = makeApi');
const schemasPattern = /export const schemas = {[\s\S]*?};/;
const modifiedContent = withExportedEndpoints.replace(schemasPattern, (substring) => {
  // ... complex string building
});
// ... 50 more lines ...
```

### After (With schemas-with-metadata)

```typescript
// ~30 lines of code

const output = await generateZodClientFromOpenAPI({
  openApiDoc, // ✅ No type assertion needed!
  template: 'schemas-with-metadata',
  distPath: outFile,
  options: {
    shouldExportAllSchemas: true,
    shouldExportAllTypes: true,
    groupStrategy: 'none',
    withAlias: false,
    withValidationHelpers: true,
    withSchemaRegistry: true,
  },
});

// Minimal custom logic (5-10 lines) for Oak-specific registry:
const withCustomRegistry = output.replace(
  'export const curriculumSchemas = buildSchemaRegistry(schemas);',
  `export const curriculumSchemas = buildSchemaRegistry(schemas, {
    rename: (key) => {
      if (key === "changelog_changelog_200") return "ChangelogResponseSchema";
      if (key === "changelog_latest_200") return "ChangelogLatestResponseSchema";
      return key.replace(/[^A-Za-z0-9_]/g, "_");
    }
  });`
);

writeFileSync(outFile, withCustomRegistry);
```

**Code Reduction:**
- **115 lines → ~30 lines** (74% reduction)
- **60+ lines of regex → 5-10 lines** (90% reduction)
- **1 type assertion → 0** (100% elimination)

---

## CLI Usage

### For Oak Curriculum SDK

```bash
# Generate with full Oak features
openapi-zod-client ./api-schema.json \
  -o ./curriculumZodSchemas.ts \
  --template schemas-with-metadata \
  --with-validation-helpers \
  --with-schema-registry
```

### For MCP Tools (General Users)

```bash
# Simple MCP tools generation
openapi-zod-client ./api-schema.json \
  -o ./mcp-tools.ts \
  --no-client
```

### For Advanced Validation

```bash
# Full validation, no HTTP client
openapi-zod-client ./api-schema.json \
  -o ./validators.ts \
  --template schemas-with-metadata \
  --with-validation-helpers
```

---

## Features Breakdown

### 1. Full Request Validation

**All parameter types supported:**
- ✅ Path parameters (`/users/{userId}`)
- ✅ Query parameters (`?include=profile`)
- ✅ Header parameters (`x-api-key: string`)
- ✅ Body schemas (`CreateUserRequest`)

**Generated as Zod schemas:**
```typescript
request: {
  pathParams: z.object({ userId: z.string().uuid() }),
  queryParams: z.object({ include: z.enum(["profile"]).optional() }).optional(),
  headers: z.object({ "x-api-key": z.string() }).optional(),
  body: CreateUserRequestSchema.optional(),
}
```

### 2. Full Response Validation

**All response types supported:**
- ✅ Success responses (200, 201, 204, etc.)
- ✅ Error responses (400, 401, 404, 500, etc.)
- ✅ Response descriptions
- ✅ Type-safe response schemas

**Generated structure:**
```typescript
responses: {
  200: { description: "Success", schema: UserSchema },
  400: { description: "Bad Request", schema: ErrorSchema },
  404: { description: "Not Found", schema: ErrorSchema },
}
```

### 3. Validation Helpers (Optional)

**Type-safe request validation:**
```typescript
const endpoint = endpoints.find(e => e.operationId === "createUser")!;

const validated = validateRequest(endpoint, {
  pathParams: { userId: "123" },
  queryParams: { include: "profile" },
  headers: { "x-api-key": "secret" },
  body: { name: "John" },
});
// validated.pathParams is fully typed!
```

**Type-safe response validation:**
```typescript
const user = validateResponse(endpoint, 200, apiResponse);
// user is typed as z.infer<typeof UserSchema>

const error = validateResponse(endpoint, 400, errorResponse);
// error is typed as z.infer<typeof ErrorSchema>
```

### 4. Schema Registry Builder (Optional)

**Replaces Oak's custom implementation:**
```typescript
// Oak's current custom function (lines 107-110)
function sanitizeSchemaKeys(
  schemas: CurriculumSchemaCollection,
  options?: { readonly rename?: (original: string) => string },
): CurriculumSchemaCollection { /* ... */ }

// NEW: Provided by library!
export const curriculumSchemas = buildSchemaRegistry(schemas, {
  rename: (key) => {
    if (key === "changelog_changelog_200") return "ChangelogResponseSchema";
    return key.replace(/[^A-Za-z0-9_]/g, "_");
  }
});
```

### 5. MCP Tools (Always Included)

**Ready for Model Context Protocol:**
```typescript
export const mcpTools = endpoints.map(endpoint => ({
  name: endpoint.operationId || `${endpoint.method}_${endpoint.path}`,
  description: endpoint.description,
  inputSchema: z.object({
    path: endpoint.request.pathParams,
    query: endpoint.request.queryParams,
    headers: endpoint.request.headers,
    body: endpoint.request.body,
  }),
  outputSchema: endpoint.responses[200]?.schema || z.unknown(),
}));

// Use with MCP Server:
mcpTools.forEach(tool => {
  server.registerTool({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    outputSchema: tool.outputSchema,
  });
});
```

---

## Benefits Summary

### For Oak Curriculum SDK

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Lines of code** | 115 | ~30 | 74% reduction |
| **String manipulation** | 60+ lines | 5-10 lines | 90% reduction |
| **Type assertions** | 1 | 0 | 100% elimination |
| **Regex patterns** | 6+ complex | 0-1 simple | 90% reduction |
| **Maintenance burden** | High (fragile regex) | Low (type-safe) | 80% reduction |

### For All Users

- ✅ **No Zodios dependency** for validation-only use cases
- ✅ **Full request validation** (all parameter types)
- ✅ **Full response validation** (including errors)
- ✅ **Type-safe helpers** for validation
- ✅ **MCP-ready** tool definitions
- ✅ **Backwards compatible** (no breaking changes)

---

## Implementation Timeline

**Total Estimate:** 6-10 hours

| Phase | Duration | Description |
|-------|----------|-------------|
| **Design & Documentation** | 0.5 hours | Document current templates, design new output |
| **Write Failing Tests (TDD)** | 1.5-2 hours | 8 comprehensive tests for Oak features |
| **Implement Template** | 2-3 hours | Create schemas-with-metadata.hbs |
| **Validation Helpers** | 1-2 hours | validateRequest/validateResponse functions |
| **Schema Registry** | 0.5-1 hour | buildSchemaRegistry helper |
| **CLI Integration** | 0.5-1 hour | Add flags (--no-client, --with-validation-helpers, --with-schema-registry) |
| **Documentation** | 1-2 hours | README, examples, Oak migration guide |

---

## Next Steps

1. **Approve Task 1.9 plan** (this document)
2. **Decide priority:**
   - Option A: Implement now (before Phase 2 core tasks)
   - Option B: Implement during Phase 2 (parallel with other work)
   - Option C: Implement in Phase 3 (after extraction blockers resolved)
3. **Begin TDD implementation:**
   - Write failing tests first
   - Implement template to make tests pass
   - Verify Oak use case works

---

## References

- **Oak Usage Files:** `.agent/reference/oak_usage/`
  - `zodgen-core.ts` - Current heavy post-processing approach
  - `typegen-core.ts` - Programmatic API usage (works well)
- **Task Plan:** `.agent/plans/01-CURRENT-IMPLEMENTATION.md` (Task 1.9)
- **Template Reference:** `lib/src/templates/schemas-only.hbs` (starting point)

---

**Recommendation:** **Implement Task 1.9 in Phase 2** alongside other dependency work. It's not blocking extraction but provides massive value for Oak and general users.

