# E2E Test Scenario Matrix for Phase 1

**Date:** October 26, 2025  
**Purpose:** Define acceptance criteria for Phase 1 rewrite  
**Status:** Planning - tests to be written before implementation

---

## Quality Gate Baseline (Phase 0 Working State)

```
✅ format:      PASSING
✅ build:       PASSING
❌ type-check:  FAILING (expected - component-access.ts doesn't exist yet)
✅ unit tests:  227/227 PASSING (1 test file failing as expected)
✅ char tests:  88/88 PASSING (all passing!)
❌ lint:        143 problems (133 errors, 10 warnings) - expected
```

**Key insight:** We're starting from a WORKING state (Phase 0 complete).

---

## E2E Test Categories

These are **acceptance criteria** - they define what should work.  
Unit tests (TDD) define **how** to build it.

### Category 1: Programmatic Usage - Internal Refs Only

**Scenario 1.1: Spec with internal component schema refs**

```typescript
describe('Programmatic: Internal refs only', () => {
  it('should generate named schemas from components.schemas', async () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('export const User');
    expect(result).toContain('z.object');
    expect(result).not.toContain('as unknown as');
    expect(result).not.toContain(' as '); // except 'as const'
  });
});
```

**Scenario 1.2: Spec with nested component refs (dependency tracking)**

```typescript
it('should handle schema dependencies correctly', async () => {
  const spec = {
    openapi: '3.0.0',
    components: {
      schemas: {
        Address: {
          type: 'object',
          properties: { street: { type: 'string' } },
        },
        User: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: { $ref: '#/components/schemas/Address' },
          },
        },
      },
    },
    paths: {},
  };

  const result = await generateZodClientFromOpenAPI({
    openApiDoc: spec,
    disableWriteToFile: true,
  });

  // Acceptance criteria:
  // Address must be defined before User
  const addressPos = result.indexOf('export const Address');
  const userPos = result.indexOf('export const User');
  expect(addressPos).toBeGreaterThan(0);
  expect(userPos).toBeGreaterThan(addressPos);
});
```

**Scenario 1.3: Spec with circular refs**

```typescript
it('should handle circular references with z.lazy()', async () => {
  const spec = {
    openapi: '3.0.0',
    components: {
      schemas: {
        Node: {
          type: 'object',
          properties: {
            value: { type: 'string' },
            children: {
              type: 'array',
              items: { $ref: '#/components/schemas/Node' },
            },
          },
        },
      },
    },
    paths: {},
  };

  const result = await generateZodClientFromOpenAPI({
    openApiDoc: spec,
    disableWriteToFile: true,
  });

  // Acceptance criteria:
  expect(result).toContain('z.lazy(');
  expect(result).toContain('export const Node');
});
```

### Category 2: Programmatic Usage - After Dereferencing

**Scenario 2.1: Caller dereferences spec before passing**

```typescript
describe('Programmatic: After SwaggerParser.dereference()', () => {
  it('should still extract named schemas from components', async () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    };

    // User dereferences before calling our API
    const dereferenced = await SwaggerParser.dereference(spec);

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: dereferenced,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    // Even after dereference, component schemas should be extracted as named exports
    expect(result).toContain('export const User');
    expect(result).toContain('z.object');
  });
});
```

**Scenario 2.2: Spec with external refs (requires dereferencing)**

```typescript
it('should work with external refs after dereferencing', async () => {
  // This test uses actual files with external $refs
  const spec = await SwaggerParser.dereference('./samples/v3.0/petstore.yaml');

  const result = await generateZodClientFromOpenAPI({
    openApiDoc: spec,
    disableWriteToFile: true,
  });

  // Acceptance criteria:
  expect(result).toContain('export const');
  expect(result).not.toContain('$ref');
  expect(result).not.toContain('as unknown as');
});
```

### Category 3: CLI Usage

**Scenario 3.1: CLI with file containing external refs**

```typescript
describe('CLI Usage', () => {
  it('should handle external refs via CLI', async () => {
    // CLI automatically calls SwaggerParser.dereference()
    const output = execSync(
      'pnpx openapi-zod-client ./samples/v3.0/petstore.yaml -o /tmp/cli-test.ts',
      { encoding: 'utf-8' },
    );

    const result = fs.readFileSync('/tmp/cli-test.ts', 'utf-8');

    // Acceptance criteria:
    expect(result).toContain('export const');
    expect(result).not.toContain('as unknown as');
  });
});
```

**Scenario 3.2: CLI with inline spec (no external refs)**

```typescript
it('should work with inline specs via CLI', async () => {
  // Write a spec with only internal refs
  fs.writeFileSync(
    '/tmp/inline-spec.yaml',
    `
openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
components:
  schemas:
    User:
      type: object
      properties:
        name:
          type: string
paths:
  /users:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
`,
  );

  execSync('pnpx openapi-zod-client /tmp/inline-spec.yaml -o /tmp/cli-inline-test.ts');

  const result = fs.readFileSync('/tmp/cli-inline-test.ts', 'utf-8');

  // Acceptance criteria:
  expect(result).toContain('export const User');
});
```

### Category 4: Operation-Level Refs

**Scenario 4.1: Refs in operation.parameters**

```typescript
describe('Operation-level refs', () => {
  it('should handle $refs in operation.parameters', async () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        parameters: {
          PageParam: {
            name: 'page',
            in: 'query',
            schema: { type: 'integer' },
          },
        },
      },
      paths: {
        '/users': {
          get: {
            parameters: [{ $ref: '#/components/parameters/PageParam' }],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const dereferenced = await SwaggerParser.dereference(spec);
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: dereferenced,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    // After dereference, operation.parameters should NOT have $refs
    expect(result).toContain('page');
    expect(result).not.toContain('as unknown as');
  });
});
```

**Scenario 4.2: Refs in operation.requestBody**

```typescript
it('should handle $refs in operation.requestBody', async () => {
  const spec = {
    openapi: '3.0.0',
    components: {
      requestBodies: {
        UserBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' } },
              },
            },
          },
        },
      },
    },
    paths: {
      '/users': {
        post: {
          requestBody: { $ref: '#/components/requestBodies/UserBody' },
          responses: {
            '201': { description: 'Created' },
          },
        },
      },
    },
  };

  const dereferenced = await SwaggerParser.dereference(spec);
  const result = await generateZodClientFromOpenAPI({
    openApiDoc: dereferenced,
    disableWriteToFile: true,
  });

  // Acceptance criteria:
  expect(result).toContain('name');
  expect(result).not.toContain('as unknown as');
});
```

**Scenario 4.3: Refs in operation.responses**

```typescript
it('should handle $refs in operation.responses', async () => {
  const spec = {
    openapi: '3.0.0',
    components: {
      responses: {
        UserResponse: {
          description: 'User response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { id: { type: 'string' } },
              },
            },
          },
        },
      },
    },
    paths: {
      '/users/{id}': {
        get: {
          responses: {
            '200': { $ref: '#/components/responses/UserResponse' },
          },
        },
      },
    },
  };

  const dereferenced = await SwaggerParser.dereference(spec);
  const result = await generateZodClientFromOpenAPI({
    openApiDoc: dereferenced,
    disableWriteToFile: true,
  });

  // Acceptance criteria:
  expect(result).toContain('id');
  expect(result).not.toContain('as unknown as');
});
```

### Category 5: Special Characters and Edge Cases

**Scenario 5.1: Schema names with special characters**

```typescript
describe('Edge cases', () => {
  it('should handle schema names with special characters', async () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        schemas: {
          SpecialProps: {
            type: 'object',
            properties: {
              'kebab-case': { type: 'string' },
              'dot.notation': { type: 'number' },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SpecialProps' },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('export const SpecialProps');
    expect(result).toContain('kebab-case');
    expect(result).toContain('dot.notation');
  });
});
```

### Category 6: Templates and Options

**Scenario 6.1: schemas-with-metadata template preserves schema names**

```typescript
describe('Templates', () => {
  it('should preserve schema names in schemas-with-metadata template', async () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      },
      paths: {},
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      template: 'schemas-with-metadata',
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('export const User');
    expect(result).not.toContain('@zodios');
    expect(result).not.toContain('as unknown as');
  });
});
```

---

## Test Matrix Summary

| Category | Scenario                   | Internal Refs | External Refs | Dereference | Named Schemas | Priority |
| -------- | -------------------------- | ------------- | ------------- | ----------- | ------------- | -------- |
| 1.1      | Programmatic internal refs | ✅            | ❌            | ❌          | ✅            | P0       |
| 1.2      | Schema dependencies        | ✅            | ❌            | ❌          | ✅            | P0       |
| 1.3      | Circular refs              | ✅            | ❌            | ❌          | ✅            | P1       |
| 2.1      | After dereference          | ✅            | ❌            | ✅          | ✅            | P0       |
| 2.2      | External refs              | ✅            | ✅            | ✅          | ✅            | P0       |
| 3.1      | CLI external refs          | ✅            | ✅            | ✅ (auto)   | ✅            | P0       |
| 3.2      | CLI inline                 | ✅            | ❌            | ✅ (auto)   | ✅            | P1       |
| 4.1      | Operation parameters       | ✅            | ❌            | ✅          | N/A           | P0       |
| 4.2      | Operation requestBody      | ✅            | ❌            | ✅          | N/A           | P0       |
| 4.3      | Operation responses        | ✅            | ❌            | ✅          | N/A           | P0       |
| 5.1      | Special characters         | ✅            | ❌            | ❌          | ✅            | P1       |
| 6.1      | schemas-with-metadata      | ✅            | ❌            | ❌          | ✅            | P1       |

**Total:** 12 scenarios  
**P0 (Must pass):** 8 scenarios  
**P1 (Should pass):** 4 scenarios

---

## Dereferencing Strategy (Task 1.2 Findings)

### CLI Behavior

- ✅ CLI uses **`SwaggerParser.bundle()`** (NOT dereference!)
- ✅ Resolves external refs (files merged into one)
- ✅ Preserves internal refs (including component schema refs)
- ✅ This is KEY - allows semantic naming from refs

### Programmatic Usage

- ❌ `generateZodClientFromOpenAPI()` does NOT call bundle/dereference
- ✅ Caller controls dereferencing strategy
- ✅ Supports both bundled AND dereferenced specs
- ✅ This flexibility is intentional design

### Why Component Schema Refs Must Be Preserved

1. **Semantic naming** - `#/components/schemas/User` extracts "User" as export name
2. **Dependency tracking** - Refs enable topological sorting
3. **Type extraction** - Without refs, schemas are inline/anonymous

---

## Implementation Approach

### Phase 1: E2E Tests (Acceptance Criteria)

1. ✅ Create `lib/src/characterisation/programmatic-usage.char.test.ts`
2. ✅ Write all 12 scenarios
3. ✅ Run against current working code (Phase 0)
4. ✅ Document which pass/fail (baseline - 5/12 passing)

### Phase 2: Unit Tests (TDD)

1. Use existing `component-access.test.ts` (19 tests)
2. Create minimal `component-access.ts` implementation
3. Follow RED -> GREEN -> REFACTOR
4. Use `ComponentsObject` types properly
5. NO internal dereferencing

### Phase 3: Integration

1. Update files to use `component-access` functions
2. Remove `makeSchemaResolver`
3. Ensure all e2e tests pass
4. Ensure all characterisation tests pass (88/88)
5. Zero type assertions

---

## Success Criteria

- ✅ All 8 P0 scenarios passing
- ✅ At least 3 of 4 P1 scenarios passing
- ✅ All 88 characterisation tests passing
- ✅ All 227 unit tests passing
- ✅ Zero type assertions in new code
- ✅ Using `ComponentsObject` types properly
- ✅ NO internal dereferencing

---

## Key Architectural Decisions

1. **E2E tests are acceptance criteria** - they define WHAT should work
2. **Unit tests are TDD tests** - they define HOW to build it
3. **Start with working foundation** - Phase 0 complete (88/88 char tests)
4. **Preserve component schema $refs** - for named type extraction
5. **Let callers control dereferencing** - CLI does it, programmers can choose
6. **Use ComponentsObject properly** - don't create ad-hoc types
