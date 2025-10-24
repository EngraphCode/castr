# Task 1.9: Zodios-Free Template Strategy (Engraph-Optimized)

**Prompt for fresh chat with no prior context**

---

## 🎯 Your Mission

Implement a new Handlebars template called `schemas-with-metadata.hbs` that generates Zod schemas and endpoint metadata **WITHOUT** the Zodios HTTP client library. This template is optimized for the Engraph SDK use case, which needs full request/response validation but doesn't want the HTTP client functionality.

**Key Requirement:** This MUST follow **Test-Driven Development (TDD)** - write ALL tests FIRST, see them fail, THEN implement.

---

## 📚 Required Reading (In Order)

**Start with these 4 documents to understand the project:**

1. **`.agent/context/context.md`** (12 min read)
   - Current project state
   - Quality gates status
   - TDD mandate (MANDATORY section at top)
   - Where Task 1.9 fits in priorities

2. **`.agent/plans/01-CURRENT-IMPLEMENTATION.md`** (search for "Task 1.9")
   - Complete task specification (lines 532-1450+)
   - Acceptance criteria
   - Implementation steps (TDD phases A-E)
   - All 12 test cases (write FIRST)
   - Validation steps

3. **`.agent/analysis/TASK_1.9_ENGRAPH_ENHANCEMENTS.md`** (30 min read)
   - **COMPLETE SPECIFICATION** (724 lines)
   - Problem analysis (Engraph's current pain points)
   - Solution design (full generated code examples)
   - Before/after comparison (60+ lines eliminated)
   - All features explained in detail

4. **`.agent/RULES.md`** (20 min read)
   - **TDD workflow** (MANDATORY section at top)
   - Coding standards
   - Type safety rules (no `any`, use `unknown`)
   - Testing principles

---

## 🎯 What You're Building

### The Problem (From Engraph's Perspective)

Engraph currently uses the `default.hbs` template which generates:
```typescript
import { Zodios, makeApi } from "@zodios/core";
// ... schemas ...
const api = new Zodios(endpoints); // ❌ Don't want this!
```

Then they do **60+ lines of string manipulation** to:
- Export the `endpoints` array
- Build a custom schema registry
- Remove the Zodios client

**This is fragile, error-prone, and has a type assertion.**

### The Solution

A new template `schemas-with-metadata.hbs` that generates:

```typescript
import { z } from "zod";

// ==========================================
// SCHEMAS - All Zod schemas from OpenAPI
// ==========================================
export const UserSchema = z.object({...}).strict();
export const schemas = { UserSchema, ... } as const;

// ==========================================
// ENDPOINTS - Full validation metadata
// ==========================================
export const endpoints = [
  {
    method: "post" as const,
    path: "/users/{userId}",
    operationId: "createUser",
    
    // ✅ Full request validation (ALL parameter types)
    request: {
      pathParams: z.object({ userId: z.string().uuid() }),
      queryParams: z.object({ ... }).optional(),
      headers: z.object({ ... }).optional(),
      body: CreateUserRequestSchema.optional(),
    },
    
    // ✅ Full response validation (including errors)
    responses: {
      200: { description: "Success", schema: UserSchema },
      400: { description: "Bad Request", schema: ErrorSchema },
      404: { description: "Not Found", schema: ErrorSchema },
    },
  },
] as const;

// ==========================================
// VALIDATION HELPERS (--with-validation-helpers)
// ==========================================
export function validateRequest<T extends (typeof endpoints)[number]>(
  endpoint: T,
  input: { pathParams?: unknown; queryParams?: unknown; headers?: unknown; body?: unknown }
): { ... } {
  // ✅ FAIL-FAST: .parse() throws on invalid input
  return {
    pathParams: endpoint.request.pathParams.parse(input.pathParams),
    queryParams: endpoint.request.queryParams?.parse(input.queryParams),
    headers: endpoint.request.headers?.parse(input.headers),
    body: endpoint.request.body?.parse(input.body),
  };
}

export function validateResponse<T, S>(endpoint: T, status: S, data: unknown): ValidatedResponse {
  // ✅ FAIL-FAST: .parse() throws on invalid input
  const responseSchema = endpoint.responses[status];
  if (!responseSchema) {
    throw new Error(`No schema defined for status ${status} on ${endpoint.method.toUpperCase()} ${endpoint.path}`);
  }
  return responseSchema.schema.parse(data);
}

// ==========================================
// SCHEMA REGISTRY HELPER (--with-schema-registry)
// ==========================================
export function buildSchemaRegistry<T extends Record<string, z.ZodSchema>>(
  rawSchemas: T,
  options?: { rename?: (key: string) => string }
): Record<string, z.ZodSchema> {
  // Sanitizes schema keys for safe usage
  const rename = options?.rename ?? ((key: string) => key.replace(/[^A-Za-z0-9_]/g, "_"));
  const result: Record<string, z.ZodSchema> = {};
  for (const [key, value] of Object.entries(rawSchemas)) {
    result[rename(key)] = value;
  }
  return result;
}

// ==========================================
// MCP TOOLS (always included)
// ==========================================
export const mcpTools = endpoints.map((endpoint) => ({
  name: endpoint.operationId || `${endpoint.method}_${endpoint.path}`,
  description: endpoint.description || `${endpoint.method.toUpperCase()} ${endpoint.path}`,
  inputSchema: z.object({
    ...(endpoint.request.pathParams ? { path: endpoint.request.pathParams } : {}),
    ...(endpoint.request.queryParams ? { query: endpoint.request.queryParams } : {}),
    ...(endpoint.request.headers ? { headers: endpoint.request.headers } : {}),
    ...(endpoint.request.body ? { body: endpoint.request.body } : {}),
  }),
  outputSchema: endpoint.responses[200]?.schema || endpoint.responses[201]?.schema || z.unknown(),
})) as const;
```

**Key Features:**
- ✅ NO Zodios import
- ✅ Full request validation (path, query, header, body)
- ✅ Full response validation (success + all error responses)
- ✅ Optional validation helpers (--with-validation-helpers)
- ✅ Optional schema registry builder (--with-schema-registry)
- ✅ MCP-ready tool definitions
- ✅ **STRICT TYPES:** No `any`, uses `unknown`, `.strict()` by default, `.parse()` for fail-fast

---

## 🚨 MANDATORY: Test-Driven Development (TDD)

**YOU MUST FOLLOW THIS WORKFLOW:**

### Step 1: Write Failing Tests FIRST (Phase B in plan)

**Location:** `lib/src/templates/schemas-with-metadata.test.ts`

**12 test cases to write (BEFORE any implementation):**

1. ✅ Should generate schemas without Zodios import
2. ✅ Should export schemas object
3. ✅ Should export endpoints array directly (no makeApi)
4. ✅ Should generate MCP tool definitions
5. ✅ Should support --no-client flag
6. ✅ Should generate full request validation schemas (Engraph use case)
7. ✅ Should generate full response validation including errors (Engraph use case)
8. ✅ Should generate validation helpers with --with-validation-helpers flag
9. ✅ Should generate schema registry with --with-schema-registry flag
10. ✅ Should generate STRICT types with NO 'any' in validation helpers
11. ✅ Should generate FAIL-FAST validation (uses .parse(), not .safeParse())
12. ✅ Should generate STRICT schemas with .strict() by default

**See `.agent/plans/01-CURRENT-IMPLEMENTATION.md` lines 720-1143 for complete test code.**

### Step 2: Run Tests - Expect FAILURES

```bash
cd lib
pnpm test -- --run schemas-with-metadata.test.ts
```

**ALL 12 TESTS MUST FAIL** (proves they're testing something).

### Step 3: Implement Template (Phase C in plan)

**Only after tests are written and failing:**

1. Create `lib/src/templates/schemas-with-metadata.hbs`
2. Update `lib/src/cli.ts` to add flags:
   - `--template schemas-with-metadata`
   - `--no-client`
   - `--with-validation-helpers`
   - `--with-schema-registry`
3. Update `lib/src/generateZodClientFromOpenAPI.ts` to handle new options

### Step 4: Run Tests - Expect SUCCESS

```bash
cd lib
pnpm test -- --run schemas-with-metadata.test.ts
```

**ALL 12 TESTS MUST PASS.**

### Step 5: Full Quality Gate

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
```

**ALL MUST PASS.**

---

## 📋 Acceptance Criteria (From Plan)

- [ ] Current template options documented clearly
- [ ] New "schemas-with-metadata" template created
- [ ] Template generates schemas + endpoint metadata WITHOUT Zodios
- [ ] **Full request validation schemas** (path, query, header, body parameters)
- [ ] **Full response validation schemas** (success + error responses)
- [ ] Template includes MCP-friendly tool definitions
- [ ] **Schema registry builder helper** (optional via flag)
- [ ] **Type-safe validation helpers** for request/response
- [ ] CLI supports `--no-client` flag to skip HTTP client generation
- [ ] CLI supports `--with-validation-helpers` flag for Engraph use case
- [ ] CLI supports `--with-schema-registry` flag for Engraph use case
- [ ] **STRICT TYPES:** No `any` in generated code (only `unknown` when necessary)
- [ ] **FAIL-FAST:** All validation uses `.parse()` (throws on invalid input)
- [ ] **STRICT SCHEMAS:** Generated schemas use `.strict()` by default (no `.passthrough()` unless spec requires)
- [ ] All tests written BEFORE implementation (TDD)
- [ ] All tests passing (including strict type validation tests)
- [ ] README updated with template comparison table
- [ ] Examples added for each template use case (including Engraph pattern)
- [ ] Programmatic API documented for advanced usage

---

## 🗂️ File Structure

**Files you'll create/modify:**

```
lib/src/
├── templates/
│   └── schemas-with-metadata.hbs          # NEW: Your template
│   └── schemas-with-metadata.test.ts      # NEW: Tests (write FIRST)
├── cli.ts                                  # MODIFY: Add flags
├── generateZodClientFromOpenAPI.ts         # MODIFY: Handle options
└── template-context.types.ts               # MODIFY: Add new option types
```

---

## 🎨 Implementation Phases (From Plan)

### Phase A: Document & Design (30 mins)

Read existing templates to understand structure:
- `lib/src/templates/default.hbs` (has Zodios)
- `lib/src/templates/schemas-only.hbs` (no client, but also no endpoints)
- `lib/src/templates/grouped.hbs` (grouped structure)

### Phase B: Write Failing Tests (TDD) (1.5-2 hours)

**THIS IS THE MOST IMPORTANT PHASE.**

Create `lib/src/templates/schemas-with-metadata.test.ts` with all 12 test cases.

Run tests - **THEY MUST ALL FAIL.**

### Phase C: Implement Template (2-3 hours)

Create the Handlebars template with:
- Schema generation (no Zodios)
- Endpoint metadata with full request/response validation
- Conditional sections for helpers (if withValidationHelpers)
- Conditional sections for schema registry (if withSchemaRegistry)
- MCP tools generation

### Phase D: Verify Tests Pass (30 mins)

Run tests again - **THEY MUST ALL PASS.**

### Phase E: Documentation (1-2 hours)

Update:
- `README.md` - Template comparison table
- `lib/examples/mcp-tools-usage.ts` - Usage examples
- `.agent/analysis/TEMPLATE_STRATEGY.md` - Document decision

---

## 📊 Expected Results

### For Engraph

**Before (current):**
```typescript
// 115 lines of code in zodgen-core.ts
// 60+ lines of string manipulation
// 1 type assertion
```

**After (with your template):**
```typescript
// ~30 lines of code
// 5-10 lines of custom logic
// 0 type assertions
```

**Code reduction:** 74% less code, 90% less regex, 100% elimination of type assertions

### For All Users

- Can generate validation schemas without Zodios dependency
- Full request/response validation out of the box
- Type-safe helpers for validation
- MCP-ready tool definitions

---

## 🚨 Critical Requirements

### STRICT TYPES (No Exceptions)

1. **NO `any` types** - Use `unknown` when input type truly unknown
2. **Use `.strict()` for objects** - Reject unknown properties by default
3. **Use `.parse()` for validation** - Fail-fast, throws on invalid input
4. **Const assertions** - Use `as const` for literal types
5. **JSDoc annotations** - Include `@throws` for functions that throw

### Example (GOOD):
```typescript
export function validateRequest<T extends (typeof endpoints)[number]>(
  endpoint: T,
  input: {
    pathParams?: unknown;  // ✅ STRICT: unknown, not any
    queryParams?: unknown;
    headers?: unknown;
    body?: unknown;
  }
): ValidatedRequest {
  return {
    pathParams: endpoint.request.pathParams.parse(input.pathParams), // ✅ FAIL-FAST: .parse()
    // ...
  };
}
```

### Example (BAD):
```typescript
export function validateRequest(
  endpoint: any,  // ❌ NO! Use proper generic
  input: Record<string, any>  // ❌ NO! Use unknown
): any {  // ❌ NO! Use proper return type
  return {
    pathParams: endpoint.request.pathParams.safeParse(input.pathParams), // ❌ NO! Use .parse()
    // ...
  };
}
```

---

## 🔍 Reference Files

### Current Templates (Study These)

- `lib/src/templates/default.hbs` - Has Zodios (what we're replacing functionality of)
- `lib/src/templates/schemas-only.hbs` - No client, but also no endpoints
- `lib/src/templates/grouped.hbs` - Grouped structure example
- `lib/src/templates/grouped-common.hbs` - Common schemas
- `lib/src/templates/grouped-index.hbs` - Index file

### Template Context

- `lib/src/template-context.ts` - How context is built
- `lib/src/template-context.types.ts` - TypeScript types for context
- `lib/src/getHandlebars.ts` - Handlebars setup

### CLI & Generation

- `lib/src/cli.ts` - CLI entry point (add flags here)
- `lib/src/generateZodClientFromOpenAPI.ts` - Main generation function
- `lib/src/getZodiosEndpointDefinitionList.ts` - Endpoint metadata builder

### Example Usage (From Engraph)

- `.agent/reference/engraph_usage/zodgen-core.ts` - Current approach (115 lines, lots of string manipulation)
- `.agent/reference/engraph_usage/typegen-core.ts` - Programmatic API usage (good pattern)

---

## ✅ Definition of Done

Before marking Task 1.9 complete, verify:

1. ✅ All 12 tests written FIRST and initially failed
2. ✅ All 12 tests now passing
3. ✅ Template generates code with NO Zodios import
4. ✅ Template generates full request validation (all parameter types)
5. ✅ Template generates full response validation (including errors)
6. ✅ CLI flags work (--no-client, --with-validation-helpers, --with-schema-registry)
7. ✅ Generated code has NO `any` types
8. ✅ Generated code uses `.strict()` by default
9. ✅ Generated code uses `.parse()` (fail-fast)
10. ✅ Full quality gate passes:
    ```bash
    pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
    ```
11. ✅ README updated with template comparison
12. ✅ Examples added

---

## 📝 Commit Message Template

When done:

```
feat: Add schemas-with-metadata template (Engraph-optimized)

Implements Task 1.9 - Zodios-free template with full validation.

✨ New Template: schemas-with-metadata.hbs
- Generates Zod schemas + endpoint metadata WITHOUT Zodios
- Full request validation (path, query, header, body)
- Full response validation (success + all error responses)
- Optional validation helpers (--with-validation-helpers)
- Optional schema registry builder (--with-schema-registry)
- MCP-ready tool definitions

🎯 Strict Types & Fail-Fast:
- NO 'any' types (uses 'unknown')
- Uses .strict() for objects (reject unknown keys)
- Uses .parse() for fail-fast validation
- Const assertions for literal types
- JSDoc with @throws annotations

🚀 CLI Flags Added:
- --template schemas-with-metadata
- --no-client (alias for schemas-with-metadata)
- --with-validation-helpers
- --with-schema-registry

✅ For Engraph:
- Eliminates 60+ lines of string manipulation (74% code reduction)
- Removes type assertion
- Type-safe validation out of the box

🧪 Tests: 12 comprehensive tests (TDD)
- Written FIRST, implementation SECOND
- All passing

📝 Documentation:
- README updated with template comparison
- Examples added
- Programmatic API documented

Closes Task 1.9
```

---

## 🎯 Start Here

1. **Read all 4 required documents** (~77 minutes)
2. **Verify quality gates pass** before starting:
   ```bash
   cd /Users/jim/code/personal/openapi-zod-client
   pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
   ```
3. **Create test file** `lib/src/templates/schemas-with-metadata.test.ts`
4. **Write all 12 tests** (copy from plan, understand each one)
5. **Run tests** - confirm they FAIL
6. **NOW implement** the template
7. **Run tests** - confirm they PASS
8. **Quality gate** - all must pass
9. **Commit** with proper message

---

## 💡 Tips

- **Don't skip TDD** - Tests first, always
- **Study existing templates** - Don't reinvent patterns
- **Check Engraph usage** - Understand their pain points
- **Keep it simple** - Minimal implementation to pass tests
- **Strict types** - No `any`, use `unknown`
- **Fail fast** - Use `.parse()`, not `.safeParse()`
- **Ask if stuck** - Reference documents have all answers

---

**Estimated Time:** 6-10 hours  
**Priority:** MEDIUM-HIGH (Engraph critical, not blocking extraction)  
**Dependencies:** None (can be done anytime)

**Good luck! Follow TDD, keep types strict, and the tests will guide you. 🚀**

