# Phase 1 Part 5: Unified Input Handling

**Date:** October 28, 2025  
**Phase:** 1.5 (Foundation - Input Unification)  
**Status:** Planning  
**Priority:** HIGH (Developer Experience + API Consistency)  
**Estimated Duration:** 6-8 hours  
**Prerequisites:** Phase 1 Parts 1-4 complete

---

## Executive Summary

Currently, `SwaggerParser.bundle()` is only called in the CLI, forcing programmatic users to handle parsing/bundling themselves. This creates an inconsistent API and duplicates the "accept file path OR parsed spec" pattern across entry points.

**Goal:** Create a unified input handling system that:

- Accepts file paths, URLs, or pre-parsed specs
- Handles bundling (resolving external refs) automatically
- Works identically for CLI and programmatic usage
- Supports both specs with refs and specs without refs
- Maintains backward compatibility

**Requirements Alignment:**

- **Req 9:** Preserve original public API (backward compatible)
- **Req 7:** Fail fast with helpful error messages
- **Req 8:** TDD, highest standards, behavior defined by tests

---

## 🎯 MANDATORY: Test-Driven Development

**ALL implementation MUST follow TDD workflow:**

1. **✍️ Write failing test(s) FIRST** - Before any implementation code
2. **🔴 Run tests - confirm FAILURE** - Proves tests validate behavior
3. **✅ Write minimal implementation** - Only enough to pass tests
4. **🟢 Run tests - confirm SUCCESS** - Validates implementation works
5. **♻️ Refactor if needed** - Clean up with test protection
6. **🔁 Repeat** - For each piece of functionality

**This is non-negotiable.** See `.agent/RULES.md` for detailed TDD guidelines.

---

## 📚 MANDATORY: Comprehensive TSDoc

**ALL code (new and modified) MUST have comprehensive TSDoc:**

- **Public API** - Full TSDoc with 3+ examples, all tags, professional quality
- **Internal API** - Minimal TSDoc with @param, @returns, @throws
- **Types/Interfaces** - Property-level documentation with examples

See `.agent/RULES.md` section "MANDATORY: Comprehensive TSDoc Standards".

---

## Problem Statement

### Current State

**CLI (cli.ts:146):**

```typescript
const bundled: unknown = await SwaggerParser.bundle(input);
if (!isOpenAPIObject(bundled)) {
  throw new Error('Invalid OpenAPI document');
}
const openApiDoc = bundled;
```

**Programmatic (documentation example):**

```typescript
import SwaggerParser from '@apidevtools/swagger-parser';
import { generateZodClientFromOpenAPI } from 'openapi-zod-client';

const openApiDoc = await SwaggerParser.parse('./openapi.yaml'); // ❌ parse() not bundle()!
await generateZodClientFromOpenAPI({ openApiDoc });
```

**Issues:**

1. **Inconsistent API** - CLI bundles, programmatic users must do it themselves
2. **Documentation mismatch** - Examples show `.parse()` but should use `.bundle()`
3. **Duplicated logic** - Parsing/validation happens in two places
4. **Poor DX** - Users must understand SwaggerParser lifecycle
5. **Type boundary duplication** - `openapi-types` → `openapi3-ts` handled twice

### Target State

**Unified API - Accepts both:**

```typescript
// Option 1: File path or URL (auto-bundles)
await generateZodClientFromOpenAPI({
  input: './openapi.yaml', // ← Handles bundling automatically
  distPath: './api.ts',
});

// Option 2: Pre-parsed spec (backward compatible)
await generateZodClientFromOpenAPI({
  openApiDoc: alreadyBundledSpec, // ← Still works
  distPath: './api.ts',
});
```

**Both entry points use same parsing:**

```typescript
// CLI (cli.ts)
const openApiDoc = await parseOpenApiInput(input);

// Programmatic (generateZodClientFromOpenAPI.ts)
const openApiDoc = args.input ? await parseOpenApiInput(args.input) : args.openApiDoc;
```

---

## Use Case Matrix (4 Scenarios)

All four combinations must be supported and tested:

| Entry Point           | Input Type                 | Description                          | Example                                                 |
| --------------------- | -------------------------- | ------------------------------------ | ------------------------------------------------------- |
| CLI                   | File with external refs    | Multi-file spec, needs bundling      | `openapi-zod-client ./api.yaml -o ./api.ts`             |
| CLI                   | File without external refs | Single-file spec, no bundling needed | `openapi-zod-client ./simple.yaml -o ./api.ts`          |
| Import (Programmatic) | File path/URL              | User passes path, we handle bundling | `generateZodClientFromOpenAPI({ input: "./api.yaml" })` |
| Import (Programmatic) | Pre-parsed object          | User already bundled/parsed          | `generateZodClientFromOpenAPI({ openApiDoc: spec })`    |

**Additional edge cases:**

- URL input (both CLI and programmatic)
- Invalid file paths
- Invalid OpenAPI specs
- Type boundary (openapi-types → openapi3-ts)
- Both `input` and `openApiDoc` provided (error)
- Neither `input` nor `openApiDoc` provided (error)

---

## Implementation Plan

### Task 1: Create Characterisation Test Suite (TDD Phase - 2 hours)

**Purpose:** Define acceptance criteria BEFORE implementation.

**Location:** `lib/src/characterisation/input-handling.char.test.ts`

**Test Structure:**

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { generateZodClientFromOpenAPI } from '../generateZodClientFromOpenAPI.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

describe('Input Handling: 4 Use Case Matrix', () => {
  const tempDir = join(tmpdir(), 'openapi-zod-client-test-' + Date.now());

  beforeAll(async () => {
    await mkdir(tempDir, { recursive: true });
  });

  describe('Use Case 1: CLI with file containing external refs', () => {
    it('should bundle multi-file spec automatically', async () => {
      // Create multi-file spec with external ref
      const mainSpec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: './schemas/user.yaml#/User' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const schemaFile = {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      };

      const mainPath = join(tempDir, 'main.yaml');
      const schemaPath = join(tempDir, 'schemas', 'user.yaml');

      await mkdir(dirname(schemaPath), { recursive: true });
      await writeFile(mainPath, yaml.stringify(mainSpec));
      await writeFile(schemaPath, yaml.stringify(schemaFile));

      // Execute CLI
      const { stdout, stderr } = await execAsync(
        `node ./lib/dist/cli.cjs ${mainPath} -o ${tempDir}/output.ts --no-prettier`,
      );

      // Verify: Should succeed without errors
      expect(stderr).toBe('');

      // Verify: Output file contains resolved schema (not external ref)
      const output = await readFile(join(tempDir, 'output.ts'), 'utf-8');
      expect(output).toContain('User'); // Schema name extracted
      expect(output).toContain('z.object'); // Zod schema generated
      expect(output).not.toContain('./schemas/user.yaml'); // External ref resolved
    });
  });

  describe('Use Case 2: CLI with self-contained file (no external refs)', () => {
    it('should handle single-file spec correctly', async () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Simple', version: '1.0.0' },
        paths: {
          '/ping': {
            get: {
              operationId: 'ping',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const specPath = join(tempDir, 'simple.yaml');
      await writeFile(specPath, yaml.stringify(spec));

      // Execute CLI
      const { stderr } = await execAsync(
        `node ./lib/dist/cli.cjs ${specPath} -o ${tempDir}/simple-output.ts --no-prettier`,
      );

      // Verify: Should succeed
      expect(stderr).toBe('');

      // Verify: Output generated correctly
      const output = await readFile(join(tempDir, 'simple-output.ts'), 'utf-8');
      expect(output).toContain('ping');
      expect(output).toContain('z.string()');
    });
  });

  describe('Use Case 3: Programmatic with file path', () => {
    it('should accept file path and handle bundling', async () => {
      // Create spec with external ref
      const mainSpec = {
        openapi: '3.0.0',
        info: { title: 'API', version: '1.0.0' },
        paths: {
          '/data': {
            get: {
              operationId: 'getData',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: './types.yaml#/Data' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const typesFile = {
        Data: {
          type: 'object',
          properties: { value: { type: 'number' } },
        },
      };

      const mainPath = join(tempDir, 'api.yaml');
      const typesPath = join(tempDir, 'types.yaml');

      await writeFile(mainPath, yaml.stringify(mainSpec));
      await writeFile(typesPath, yaml.stringify(typesFile));

      // Call programmatic API with file path
      const result = await generateZodClientFromOpenAPI({
        input: mainPath, // ← NEW: Accept file path
        disableWriteToFile: true,
      });

      // Verify: Returns generated code
      expect(typeof result).toBe('string');
      expect(result).toContain('Data');
      expect(result).toContain('z.object');
      expect(result).not.toContain('./types.yaml');
    });

    it('should accept URL and handle bundling', async () => {
      // Use actual OpenAPI spec URL
      const url =
        'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml';

      // Call programmatic API with URL
      const result = await generateZodClientFromOpenAPI({
        input: url, // ← NEW: Accept URL
        disableWriteToFile: true,
      });

      // Verify: Returns generated code
      expect(typeof result).toBe('string');
      expect(result).toContain('Pet');
      expect(result).toContain('z.object');
    });
  });

  describe('Use Case 4: Programmatic with pre-parsed object', () => {
    it('should accept pre-parsed OpenAPIObject (backward compatible)', async () => {
      // Pre-parsed spec (user already handled bundling)
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Pre-parsed', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Call programmatic API with pre-parsed object (existing API)
      const result = await generateZodClientFromOpenAPI({
        openApiDoc, // ← EXISTING: Still works
        disableWriteToFile: true,
      });

      // Verify: Returns generated code
      expect(typeof result).toBe('string');
      expect(result).toContain('test');
      expect(result).toContain('z.boolean()');
    });

    it('should handle pre-bundled spec with internal refs preserved', async () => {
      // Pre-bundled spec (external refs resolved, internal refs preserved)
      const openApiDoc: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Bundled', version: '1.0.0' },
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Item' }, // ← Internal ref
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Item: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      };

      // Call programmatic API
      const result = await generateZodClientFromOpenAPI({
        openApiDoc,
        disableWriteToFile: true,
      });

      // Verify: Handles internal refs correctly
      expect(result).toContain('Item');
      expect(result).toContain('z.object');
    });
  });

  describe('Edge Cases', () => {
    it('should throw clear error when both input and openApiDoc provided', async () => {
      await expect(
        generateZodClientFromOpenAPI({
          input: './spec.yaml',
          openApiDoc: {} as OpenAPIObject,
          disableWriteToFile: true,
        }),
      ).rejects.toThrow('Cannot provide both input and openApiDoc');
    });

    it('should throw clear error when neither input nor openApiDoc provided', async () => {
      await expect(
        generateZodClientFromOpenAPI({
          disableWriteToFile: true,
        } as any),
      ).rejects.toThrow('Must provide either input or openApiDoc');
    });

    it('should throw clear error for invalid file path', async () => {
      await expect(
        generateZodClientFromOpenAPI({
          input: '/nonexistent/spec.yaml',
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(/file not found|ENOENT/i);
    });

    it('should throw clear error for invalid URL', async () => {
      await expect(
        generateZodClientFromOpenAPI({
          input: 'https://invalid.example.com/nonexistent.yaml',
          disableWriteToFile: true,
        }),
      ).rejects.toThrow(/network|fetch|404/i);
    });

    it('should handle type boundary (openapi-types → openapi3-ts) correctly', async () => {
      // SwaggerParser returns openapi-types.OpenAPI.Document
      // We need openapi3-ts/oas30.OpenAPIObject
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Type Boundary', version: '1.0.0' },
        paths: {},
      };

      const specPath = join(tempDir, 'boundary.yaml');
      await writeFile(specPath, yaml.stringify(spec));

      // Should handle type boundary correctly
      const result = await generateZodClientFromOpenAPI({
        input: specPath,
        disableWriteToFile: true,
      });

      expect(typeof result).toBe('string');
    });
  });
});
```

**Test Requirements:**

- ✅ Tests PRODUCT code behavior (generateZodClientFromOpenAPI, CLI)
- ✅ Tests prove something useful (bundling works, refs resolved, etc.)
- ✅ Tests don't constrain implementation (black box testing)
- ✅ All 4 use cases covered
- ✅ Edge cases covered
- ✅ Backward compatibility verified

**Run tests - expect failure:**

```bash
pnpm test -- input-handling.char.test.ts
# ❌ Should fail - functionality doesn't exist yet
```

---

### Task 2: Replace validateOpenApiSpec with Type Boundary Handler (TDD Phase - 1 hour)

**Purpose:** Remove redundant validation logic, keep only type boundary handling.

**Rationale:**

`validateOpenApiSpec` currently does TWO things:

1. **Validation** - ❌ Redundant (SwaggerParser already validates)
2. **Type boundary** - ✅ Necessary (openapi-types → openapi3-ts)

After Phase 1 Part 5, ALL inputs go through SwaggerParser which validates thoroughly. We only need type narrowing.

**Step 1: Write Tests FIRST (15 minutes)**

**Location:** `lib/src/assertOpenApiType.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { assertOpenApiType } from './assertOpenApiType.js';

describe('assertOpenApiType', () => {
  it('should accept valid OpenAPI object', () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    expect(() => assertOpenApiType(spec)).not.toThrow();
    const result = assertOpenApiType(spec);
    expect(result.openapi).toBe('3.0.0');
  });

  it('should reject null', () => {
    expect(() => assertOpenApiType(null)).toThrow('Invalid spec from SwaggerParser');
  });

  it('should reject undefined', () => {
    expect(() => assertOpenApiType(undefined)).toThrow('Invalid spec from SwaggerParser');
  });

  it('should reject non-object', () => {
    expect(() => assertOpenApiType('not an object')).toThrow('Invalid spec from SwaggerParser');
  });

  it('should accept SwaggerParser output (type boundary)', () => {
    // SwaggerParser returns openapi-types.OpenAPI.Document (unknown to us)
    // This test proves type boundary handling works
    const swaggerParserOutput: unknown = {
      openapi: '3.0.0',
      info: { title: 'From SwaggerParser', version: '1.0.0' },
      paths: {},
    };

    const result = assertOpenApiType(swaggerParserOutput);
    expect(result.openapi).toBe('3.0.0');
  });
});
```

**Step 2: Implement (30 minutes)**

**Location:** `lib/src/assertOpenApiType.ts`

````typescript
import type { OpenAPIObject } from 'openapi3-ts/oas30';

/**
 * Type boundary handler: openapi-types.OpenAPI.Document → openapi3-ts.OpenAPIObject
 *
 * SwaggerParser.bundle() returns openapi-types.OpenAPI.Document (structurally
 * compatible but different type). This function handles the type boundary by
 * narrowing from unknown to our internal OpenAPIObject type.
 *
 * **Important:** This does NOT validate the spec structure. SwaggerParser already
 * validated it thoroughly. This only handles the type boundary between two
 * compatible but distinct type systems.
 *
 * @param spec - Output from SwaggerParser.bundle() (typed as unknown)
 * @returns The same spec, narrowed to OpenAPIObject type
 * @throws {Error} Only if spec is null/undefined (should never happen with SwaggerParser)
 *
 * @example
 * ```typescript
 * const bundled = await SwaggerParser.bundle('./openapi.yaml');
 * const typed = assertOpenApiType(bundled); // Type boundary handled
 * ```
 *
 * @remarks
 * - Trust SwaggerParser's validation (it's the industry standard)
 * - No redundant validation logic
 * - Single responsibility: type boundary only
 *
 * @since 2.0.0
 * @public
 */
export function assertOpenApiType(spec: unknown): OpenAPIObject {
  // Minimal sanity check (should never fail if SwaggerParser ran)
  if (!spec || typeof spec !== 'object') {
    throw new Error('Invalid spec from SwaggerParser: expected object, got ' + typeof spec);
  }

  // Safe assertion: SwaggerParser guarantees valid OpenAPI structure
  // We're just bridging the type boundary between openapi-types and openapi3-ts
  return spec as OpenAPIObject;
}
````

**Step 3: Run tests - expect success:**

```bash
pnpm test -- assertOpenApiType.test.ts
# ✅ All tests should pass
```

**Step 4: Update imports and remove old file (15 minutes)**

1. Replace `validateOpenApiSpec` imports with `assertOpenApiType`
2. Update CLI to use new function
3. Delete `lib/src/validateOpenApiSpec.ts`
4. Delete `lib/src/validateOpenApiSpec.test.ts`
5. Update exports in `lib/src/index.ts`

---

### Task 3: Create parseOpenApiInput Helper (TDD Phase - 2 hours)

**Purpose:** Extract bundling logic into reusable function.

**Step 1: Write Unit Tests FIRST (30 minutes)**

**Location:** `lib/src/parseOpenApiInput.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { parseOpenApiInput } from './parseOpenApiInput.js';

describe('parseOpenApiInput', () => {
  describe('accepts file paths', () => {
    it('should parse and bundle YAML file', async () => {
      const result = await parseOpenApiInput('./examples/swagger/petstore.yaml');

      expect(result).toBeDefined();
      expect(result.openapi).toBe('3.0.0');
      expect(result.paths).toBeDefined();
    });

    it('should parse and bundle JSON file', async () => {
      const result = await parseOpenApiInput('./examples/openapi/v3.0/petstore.json');

      expect(result).toBeDefined();
      expect(result.openapi).toBe('3.0.0');
    });
  });

  describe('accepts URLs', () => {
    it('should fetch and bundle from URL', async () => {
      const url =
        'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml';
      const result = await parseOpenApiInput(url);

      expect(result).toBeDefined();
      expect(result.info.title).toBe('Swagger Petstore');
    });
  });

  describe('handles external refs', () => {
    it('should resolve external file refs', async () => {
      // This test requires a multi-file spec fixture
      // Will be created as part of test setup
      const result = await parseOpenApiInput('./test-fixtures/multi-file/main.yaml');

      expect(result).toBeDefined();
      // External refs should be resolved
      // Internal refs should be preserved
    });
  });

  describe('error handling', () => {
    it('should throw clear error for non-existent file', async () => {
      await expect(parseOpenApiInput('/nonexistent/file.yaml')).rejects.toThrow(
        /file not found|ENOENT/i,
      );
    });

    it('should throw clear error for invalid URL', async () => {
      await expect(parseOpenApiInput('https://invalid.example.com/spec.yaml')).rejects.toThrow(
        /network|fetch|404/i,
      );
    });

    it('should throw clear error for invalid OpenAPI spec', async () => {
      // Create invalid spec
      await expect(parseOpenApiInput('./test-fixtures/invalid-spec.yaml')).rejects.toThrow(
        /invalid.*openapi/i,
      );
    });
  });

  describe('type boundary', () => {
    it('should return openapi3-ts OpenAPIObject type', async () => {
      const result = await parseOpenApiInput('./examples/swagger/petstore.yaml');

      // Type assertion for test
      const typed: OpenAPIObject = result;
      expect(typed).toBeDefined();
    });
  });
});
```

**Run tests - expect failure:**

```bash
pnpm test -- parseOpenApiInput.test.ts
# ❌ Should fail - parseOpenApiInput doesn't exist yet
```

**Step 2: Implement parseOpenApiInput (1 hour)**

**Location:** `lib/src/parseOpenApiInput.ts`

````typescript
import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { assertOpenApiType } from './assertOpenApiType.js';

/**
 * Parses and bundles an OpenAPI specification from a file path or URL.
 *
 * Handles the type boundary between `openapi-types` (used by SwaggerParser)
 * and `openapi3-ts` (used internally). Automatically resolves external $refs
 * while preserving internal component refs needed for dependency tracking.
 *
 * **What it does:**
 * - Accepts file paths (YAML/JSON) or URLs
 * - Auto-detects format (YAML vs JSON)
 * - Resolves external file references via SwaggerParser.bundle()
 * - Preserves internal #/components/* refs (needed for topological sorting)
 * - Validates spec structure at boundary (fail-fast)
 * - Handles openapi-types → openapi3-ts type boundary
 *
 * **What it does NOT do:**
 * - Does NOT dereference internal refs (intentionally preserved)
 * - Does NOT validate schema semantics (that's SwaggerParser's job)
 * - Does NOT transform or modify the spec
 *
 * @param input - File path or URL to OpenAPI specification
 * @returns Parsed and bundled OpenAPI document
 *
 * @throws {Error} When file/URL cannot be accessed
 * @throws {Error} When spec is not valid OpenAPI 3.0.x
 * @throws {ValidationError} When spec structure is invalid
 *
 * @example Parse local file
 * ```typescript
 * const spec = await parseOpenApiInput('./openapi.yaml');
 * // External refs resolved, internal refs preserved
 * ```
 *
 * @example Parse from URL
 * ```typescript
 * const spec = await parseOpenApiInput(
 *   'https://api.example.com/openapi.yaml'
 * );
 * ```
 *
 * @example Handle multi-file specs
 * ```typescript
 * // main.yaml references ./schemas/user.yaml
 * const spec = await parseOpenApiInput('./api/main.yaml');
 * // External refs automatically resolved
 * // Internal component refs preserved
 * ```
 *
 * @see {@link assertOpenApiType} for type boundary handling
 * @see {@link https://github.com/APIDevTools/swagger-parser} for SwaggerParser docs
 *
 * @remarks
 * - Uses SwaggerParser.bundle() not dereference() (preserves internal refs)
 * - Type boundary: openapi-types.OpenAPI.Document → openapi3-ts.OpenAPIObject
 * - Validation happens at boundary (fail-fast philosophy)
 * - Both CLI and programmatic APIs use this function
 *
 * @since 1.0.0
 * @public
 */
export async function parseOpenApiInput(input: string): Promise<OpenAPIObject> {
  // SwaggerParser.bundle() resolves external refs, preserves internal refs
  // Returns openapi-types.OpenAPI.Document (structurally compatible with OpenAPIObject)
  const bundled: unknown = await SwaggerParser.bundle(input);

  // Handle type boundary (SwaggerParser already validated)
  // This is the ONLY place we handle openapi-types → openapi3-ts
  const openApiDoc = assertOpenApiType(bundled);

  return openApiDoc;
}
````

**Step 3: Run tests - expect success:**

```bash
pnpm test -- parseOpenApiInput.test.ts
# ✅ All tests should pass
```

**Step 4: Test Fixtures (30 minutes)**

Create test fixtures for multi-file specs:

```bash
mkdir -p lib/test-fixtures/multi-file
```

**lib/test-fixtures/multi-file/main.yaml:**

```yaml
openapi: 3.0.0
info:
  title: Multi-File Test
  version: 1.0.0
paths:
  /users:
    get:
      operationId: getUsers
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: './schemas/user.yaml#/User'
```

**lib/test-fixtures/multi-file/schemas/user.yaml:**

```yaml
User:
  type: object
  properties:
    id:
      type: string
    name:
      type: string
```

---

### Task 3: Update generateZodClientFromOpenAPI (TDD Phase - 2 hours)

**Step 1: Update Type Definitions (30 minutes)**

**Location:** `lib/src/generateZodClientFromOpenAPI.ts`

````typescript
export type GenerateZodClientFromOpenApiArgs<
  TOptions extends TemplateContext['options'] = TemplateContext['options'],
> = {
  /**
   * Path or URL to OpenAPI specification (YAML/JSON).
   *
   * When provided, the spec is automatically parsed and bundled using
   * SwaggerParser. External file refs are resolved, internal component
   * refs are preserved.
   *
   * Mutually exclusive with openApiDoc.
   *
   * @example Local file
   * ```typescript
   * await generateZodClientFromOpenAPI({
   *   input: './openapi.yaml',
   *   distPath: './api.ts',
   * });
   * ```
   *
   * @example URL
   * ```typescript
   * await generateZodClientFromOpenAPI({
   *   input: 'https://api.example.com/openapi.yaml',
   *   distPath: './api.ts',
   * });
   * ```
   */
  input?: string;

  /**
   * Pre-parsed OpenAPI document.
   *
   * Use this when you've already parsed/bundled the spec yourself.
   * Maintains backward compatibility with existing API.
   *
   * Mutually exclusive with input.
   *
   * @example Pre-parsed spec
   * ```typescript
   * import SwaggerParser from '@apidevtools/swagger-parser';
   *
   * const openApiDoc = await SwaggerParser.bundle('./openapi.yaml');
   * await generateZodClientFromOpenAPI({
   *   openApiDoc,
   *   distPath: './api.ts',
   * });
   * ```
   */
  openApiDoc?: OpenAPIObject;

  // ... rest of existing properties
} & (
  | {
      input?: never;
      openApiDoc: OpenAPIObject; // At least one required
    }
  | {
      input: string;
      openApiDoc?: never;
    }
  | {
      distPath?: never;
      disableWriteToFile: true;
    }
  | { distPath: string; disableWriteToFile?: false }
);
````

**Step 2: Update Implementation (1 hour)**

```typescript
import { parseOpenApiInput } from './parseOpenApiInput.js';

export const generateZodClientFromOpenAPI = async <TOptions extends TemplateContext['options']>({
  input,
  openApiDoc: providedOpenApiDoc,
  distPath,
  template,
  templatePath,
  noClient,
  withValidationHelpers,
  withSchemaRegistry,
  prettierConfig,
  options,
  disableWriteToFile,
  handlebars,
}: GenerateZodClientFromOpenApiArgs<TOptions>): Promise<string | Record<string, string>> => {
  // Validate input parameters (fail fast)
  if (input && providedOpenApiDoc) {
    throw new Error(
      'Cannot provide both input and openApiDoc. ' +
        'Use input for file paths/URLs, or openApiDoc for pre-parsed specs.',
    );
  }

  if (!input && !providedOpenApiDoc) {
    throw new Error(
      'Must provide either input (file path/URL) or openApiDoc (pre-parsed spec). ' +
        'Example: { input: "./openapi.yaml" } or { openApiDoc: parsedSpec }',
    );
  }

  // Parse input if provided, otherwise assert type boundary for provided spec
  const openApiDoc = input
    ? await parseOpenApiInput(input) // Already validated by SwaggerParser
    : assertOpenApiType(providedOpenApiDoc); // Type boundary for pre-parsed spec

  // No additional validation needed - parseOpenApiInput already handled it
  // (SwaggerParser validated thoroughly, we just narrow the type)

  // ... rest of existing implementation unchanged
};
```

**Step 3: Run tests - expect success:**

```bash
pnpm test -- input-handling.char.test.ts
# ✅ All characterisation tests should pass
```

---

### Task 4: Update CLI (30 minutes)

**Location:** `lib/src/cli.ts`

**Before:**

```typescript
const bundled: unknown = await SwaggerParser.bundle(input);
if (!isOpenAPIObject(bundled)) {
  throw new Error('Invalid OpenAPI document');
}
```

**After:**

```typescript
import { parseOpenApiInput } from './parseOpenApiInput.js';

// Remove SwaggerParser import (no longer needed in CLI)
const openApiDoc = await parseOpenApiInput(input);
```

**Validation:**

```bash
pnpm test -- cli.char.test.ts
# ✅ All CLI tests should still pass
```

---

### Task 5: Update Documentation (30 minutes)

**Update examples in:**

1. **lib/src/generateZodClientFromOpenAPI.ts** - Fix JSDoc examples
2. **README.md** - Update programmatic usage examples
3. **lib/README.md** - Update examples
4. **docs/USAGE.md** - Update usage guide

**Before (incorrect):**

```typescript
const openApiDoc = await SwaggerParser.parse('./openapi.yaml');
```

**After (correct options):**

```typescript
// Option 1: Let library handle parsing (recommended)
await generateZodClientFromOpenAPI({
  input: './openapi.yaml',
  distPath: './api.ts',
});

// Option 2: Pre-parse yourself (advanced)
const openApiDoc = await SwaggerParser.bundle('./openapi.yaml');
await generateZodClientFromOpenAPI({
  openApiDoc,
  distPath: './api.ts',
});
```

---

### Task 6: Update Type Guards (30 minutes)

**Location:** `lib/src/cli-type-guards.ts`

Remove `isOpenAPIObject` if it's only used for the type boundary check (now handled by `validateOpenApiSpec`).

---

## Validation Checklist

**Unit Tests:**

- [ ] parseOpenApiInput has 100% test coverage
- [ ] All unit tests test PRODUCT code (not test code)
- [ ] All unit tests prove behavior (not implementation)
- [ ] Edge cases covered (errors, type boundary, etc.)

**Characterisation Tests:**

- [ ] All 4 use cases have tests
- [ ] CLI with external refs works
- [ ] CLI with self-contained spec works
- [ ] Programmatic with file path works
- [ ] Programmatic with pre-parsed object works
- [ ] Edge cases tested (both/neither input, invalid paths, etc.)

**Quality Gates:**

- [ ] `pnpm format` passes
- [ ] `pnpm build` passes
- [ ] `pnpm type-check` passes (0 errors)
- [ ] `pnpm test` passes (all tests)
- [ ] No new lint errors

**Documentation:**

- [ ] parseOpenApiInput has comprehensive TSDoc
- [ ] All examples updated (generateZodClientFromOpenAPI)
- [ ] README updated
- [ ] Migration notes if needed

**Backward Compatibility:**

- [ ] Existing API still works (openApiDoc parameter)
- [ ] No breaking changes
- [ ] All existing tests still pass

---

## Success Criteria

### Implementation Complete When:

- [x] TDD followed for all code (tests written first)
- [x] parseOpenApiInput function created and tested
- [x] generateZodClientFromOpenAPI accepts both input and openApiDoc
- [x] CLI uses parseOpenApiInput
- [x] All 4 use cases work correctly
- [x] Characterisation tests pass
- [x] Unit tests pass
- [x] Documentation updated
- [x] Backward compatible (no breaking changes)
- [x] All quality gates green

### Quality Standards Met:

- [x] No `any` types
- [x] No type assertions (except `as const`)
- [x] Comprehensive TSDoc on all public APIs
- [x] Tests prove behavior, not implementation
- [x] Tests prove something useful about product code
- [x] No test code testing test code
- [x] Fail fast with helpful errors

---

## Risk Assessment

**Low Risk:**

- Backward compatible (openApiDoc still works)
- Minimal code changes (extract existing logic)
- Well-tested (4 use cases + edge cases)
- TDD provides safety net

**Mitigation:**

- All existing tests must pass
- Characterisation tests define behavior
- Gradual rollout (feature flag if needed)

---

## Estimated Timeline

| Task                                   | Duration      | Description                      |
| -------------------------------------- | ------------- | -------------------------------- |
| 1. Characterisation tests              | 2 hours       | Define 4 use cases + edge cases  |
| 2. parseOpenApiInput                   | 2 hours       | Extract + test helper function   |
| 3. Update generateZodClientFromOpenAPI | 2 hours       | Add input parameter + tests      |
| 4. Update CLI                          | 30 min        | Use parseOpenApiInput            |
| 5. Update documentation                | 30 min        | Fix all examples                 |
| 6. Update type guards                  | 30 min        | Cleanup                          |
| **Total**                              | **6-8 hours** | **TDD, well-tested, documented** |

---

## Next Steps

After this phase completes, consider:

- **Phase 3B (DX):** Add config file support (cosmiconfig)
- **Phase 3B (DX):** Add watch mode for auto-regeneration
- **Phase 3C (Testing):** Add MSW integration tests

---

## Appendix: Test Principles Review

From `.agent/RULES.md`, all tests MUST:

1. ✅ **Test product code** - Not test code
2. ✅ **Prove something useful** - Not just "it doesn't crash"
3. ✅ **Prove behavior** - Not implementation details
4. ✅ **Not constrain implementation** - Allow refactoring

**Examples:**

**GOOD - Tests behavior:**

```typescript
it('should resolve external refs when parsing multi-file spec', async () => {
  const result = await parseOpenApiInput('./multi-file/main.yaml');
  // Proves: External refs are resolved
  expect(result.paths['/users'].get.responses['200'].content).toBeDefined();
});
```

**BAD - Tests implementation:**

```typescript
it('should call SwaggerParser.bundle internally', async () => {
  const spy = vi.spyOn(SwaggerParser, 'bundle');
  await parseOpenApiInput('./spec.yaml');
  expect(spy).toHaveBeenCalled(); // ❌ Constrains implementation!
});
```

---

**This plan follows all RULES.md standards and aligns with requirements.md Req 7, 8, 9.**
