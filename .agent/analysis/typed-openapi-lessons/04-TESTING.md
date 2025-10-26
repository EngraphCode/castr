# 04: Testing & Quality Assurance

**Domain**: Testing Strategies, Quality Assurance  
**Impact**: 🔴 High (prevents regressions)  
**Effort**: 🟡 Medium  
**Priority**: P2 (medium-term)

---

## 📋 Quick Summary

typed-openapi's testing approach combines:

1. **Type-Level Testing** - Test types, not just runtime behavior
2. **Integration Testing with MSW** - Test generated clients against mocked APIs
3. **Multi-Runtime Snapshots** - Test all output formats
4. **Property-Based Testing** - Generate test cases from OpenAPI spec

**Key insight**: Test the generated code, not just the generator

---

## 1. Type-Level Testing with tstyche

### 1.1 Why Test Types?

**Problem**: Runtime tests don't catch type regressions

```typescript
// This change might break users but passes runtime tests
- export type Pet = { id: number; name: string };
+ export type Pet = { id: string; name: string }; // Breaking change!

// Runtime test still passes
test('getPet works', async () => {
  const pet = await api.getPetById({ id: '123' });
  expect(pet.name).toBe('Fluffy'); // ✅ Passes
});
```

**Solution**: Test the types themselves

### 1.2 tstyche Introduction

[tstyche](https://github.com/tstyche/tstyche) - Type testing for TypeScript

```bash
pnpm add -D tstyche
```

**Features**:

- Test type assignments
- Test type inference
- Test type errors
- Inline type snapshots

### 1.3 typed-openapi's Usage

```typescript
// tests/integration.types.tstyche.ts
import { expect, test } from 'tstyche';
import type { Schemas, Endpoints } from '../tmp/generated-client';

test('Pet schema has correct structure', () => {
  const pet: Schemas.Pet = {} as any;

  expect(pet).type.toHaveProperty('id');
  expect(pet).type.toHaveProperty('name');
  expect(pet).type.toHaveProperty('photoUrls');

  expect(pet.id).type.toBe<number>();
  expect(pet.name).type.toBe<string>();
  expect(pet.photoUrls).type.toBe<Array<string>>();
  expect(pet.status).type.toBe<'available' | 'pending' | 'sold' | undefined>();
});

test('getPetById endpoint types are correct', () => {
  const endpoint: Endpoints.get_GetPetById = {} as any;

  expect(endpoint.method).type.toBe<'GET'>();
  expect(endpoint.path).type.toBe<'/pet/{petId}'>();

  expect(endpoint.parameters).type.toMatchInlineSnapshot(`
    {
      path: { petId: number };
    }
  `);

  expect(endpoint.responses['200']).type.toBe<Schemas.Pet>();
  expect(endpoint.responses['404']).type.toBe<unknown>();
});

test('API client methods are typed correctly', () => {
  declare const api: ReturnType<typeof createClient>;

  // getPetById accepts correct params
  expect(api.get).type.toBeCallableWith('/pet/{petId}', {
    path: { petId: 123 },
  });

  // getPetById rejects incorrect params
  expect(api.get).type.not.toBeCallableWith('/pet/{petId}', {
    path: { petId: 'string' }, // Wrong type
  });

  // Return type is correct
  const pet = api.get('/pet/{petId}', { path: { petId: 123 } });
  expect(pet).type.resolves.toBe<Schemas.Pet>();
});

test('discriminated unions work correctly', () => {
  declare const result: Awaited<ReturnType<typeof api.get>>;

  if (result.ok) {
    expect(result.status).type.toBe<200 | 201>();
    expect(result.data).type.toBe<Schemas.Pet>();
  } else {
    expect(result.status).type.toBe<400 | 404 | 500>();

    // Type narrows based on status
    if (result.status === 404) {
      expect(result.data).type.toBe<Schemas.NotFoundError>();
    }
  }
});
```

**See full examples**: [examples/24-type-testing.ts](./examples/24-type-testing.ts)

### 1.4 Applying to openapi-zod-client

#### Current Testing

```typescript
// Mostly runtime tests
test('generates correct schema', () => {
  const code = getZodSchema({ schema, ctx });
  expect(code.toString()).toBe('z.object({ id: z.number() })');
});
```

**Problems**:

- Tests string output, not actual types
- Doesn't catch type regressions
- Doesn't test TypeScript inference

#### Proposed Enhancement

**1. Add tstyche**:

```bash
pnpm add -D tstyche
```

**2. Create type tests**:

```typescript
// tests/types/generated-schemas.types.test.ts
import { expect, test } from 'tstyche';
import { schemas } from '../fixtures/petstore-client';

test('Pet schema structure', () => {
  const Pet = schemas.Pet;

  // Test that schema accepts correct input
  expect(Pet.parse).type.toBeCallableWith({
    id: 123,
    name: 'Fluffy',
    photoUrls: [],
  });

  // Test that schema rejects incorrect input (compile error)
  expect(Pet.parse).type.not.toBeCallableWith({
    id: 'string', // Wrong type
    name: 'Fluffy',
  });

  // Test inferred type
  type InferredPet = z.infer<typeof Pet>;
  expect<InferredPet>().type.toMatchInlineSnapshot(`
    {
      id: number;
      name: string;
      photoUrls: string[];
      status?: "available" | "pending" | "sold";
    }
  `);
});

test('Endpoint parameter types', () => {
  declare const api: ReturnType<typeof createApiClient>;

  // Test method signatures
  expect(api.getPetById).type.toBeCallableWith({
    params: { petId: '123' },
  });

  expect(api.getPetById).type.not.toBeCallableWith({
    params: { wrongParam: '123' },
  });
});

test('Breaking changes are caught', () => {
  // If we accidentally change id from number to string,
  // this test will fail at type-check time
  const pet: z.infer<typeof schemas.Pet> = {
    id: 123, // If schema changed to string, this errors
    name: 'Fluffy',
    photoUrls: [],
  };

  expect(pet.id).type.toBe<number>(); // Not string!
});
```

**3. CI Integration**:

```json
{
  "scripts": {
    "test": "vitest",
    "test:types": "tstyche",
    "test:all": "pnpm test && pnpm test:types"
  }
}
```

**See implementation guide**: [examples/25-tstyche-setup.md](./examples/25-tstyche-setup.md)

---

## 2. Integration Testing with MSW

### 2.1 Why MSW?

[MSW (Mock Service Worker)](https://mswjs.io/) - API mocking library

**Benefits**:

- Intercepts actual HTTP requests
- Works in Node and browser
- Same mocks for tests and development
- Type-safe with TypeScript

### 2.2 typed-openapi's Integration Tests

```typescript
// tests/integration-runtime-msw.test.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { createClient } from '../tmp/generated-client';

// Setup MSW server
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('API client with successful response', async () => {
  // Mock the endpoint
  server.use(
    http.get('/pet/:petId', ({ params }) => {
      return HttpResponse.json({
        id: parseInt(params.petId as string),
        name: 'Fluffy',
        photoUrls: [],
      });
    }),
  );

  // Create client
  const api = createClient('http://localhost', fetch);

  // Make request
  const pet = await api.get('/pet/{petId}', {
    path: { petId: 123 },
  });

  // Assertions
  expect(pet.id).toBe(123);
  expect(pet.name).toBe('Fluffy');
});

test('API client with error response', async () => {
  server.use(
    http.get('/pet/:petId', () => {
      return HttpResponse.json({ code: 404, message: 'Pet not found' }, { status: 404 });
    }),
  );

  const api = createClient('http://localhost', fetch);

  await expect(api.get('/pet/{petId}', { path: { petId: 999 } })).rejects.toThrow('Pet not found');
});

test('API client validates response with Zod', async () => {
  server.use(
    http.get('/pet/:petId', () => {
      return HttpResponse.json({
        invalid: 'data', // Missing required fields
      });
    }),
  );

  const api = createClient('http://localhost', fetch, {
    validateResponse: true,
  });

  await expect(api.get('/pet/{petId}', { path: { petId: 123 } })).rejects.toThrow(ZodError);
});
```

**See full test suite**: [examples/26-msw-integration-tests.ts](./examples/26-msw-integration-tests.ts)

### 2.3 Applying to openapi-zod-client

#### Current Testing

Mostly inline snapshots:

```typescript
test('petstore', async () => {
  const result = await generateZodClientFromOpenAPI({
    openApiDoc,
    disableWriteToFile: true,
  });
  expect(result).toMatchInlineSnapshot(`...`);
});
```

**Problems**:

- Doesn't test actual usage
- Doesn't test HTTP interactions
- Doesn't test validation behavior

#### Proposed Enhancement

**1. Add MSW**:

```bash
pnpm add -D msw
```

**2. Create integration tests**:

```typescript
// tests/integration/zodios-runtime.test.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { createApiClient } from '../generated/petstore-client';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Zodios client integration', () => {
  test('successful request', async () => {
    server.use(
      http.get('http://localhost/pets/:petId', ({ params }) => {
        return HttpResponse.json({
          id: parseInt(params.petId),
          name: 'Fluffy',
          photoUrls: [],
        });
      }),
    );

    const api = createApiClient('http://localhost');
    const pet = await api.getPetById({ params: { petId: '123' } });

    expect(pet).toMatchObject({
      id: 123,
      name: 'Fluffy',
    });
  });

  test('validates response schema', async () => {
    server.use(
      http.get('http://localhost/pets/:petId', () => {
        return HttpResponse.json({
          // Missing required fields
          invalid: 'data',
        });
      }),
    );

    const api = createApiClient('http://localhost');

    await expect(api.getPetById({ params: { petId: '123' } })).rejects.toThrow(); // Zod validation error
  });

  test('handles error responses', async () => {
    server.use(
      http.get('http://localhost/pets/:petId', () => {
        return HttpResponse.json({ code: 404, message: 'Not found' }, { status: 404 });
      }),
    );

    const api = createApiClient('http://localhost');

    await expect(api.getPetById({ params: { petId: '999' } })).rejects.toThrow('Not found');
  });
});
```

**3. Test different templates**:

```typescript
describe('schemas-with-metadata template', () => {
  test('validates requests', async () => {
    const { endpoints, validateRequest } = require('../generated/api');

    const endpoint = endpoints.find((e) => e.operationId === 'getPetById');

    expect(() => {
      validateRequest(endpoint, {
        pathParams: { petId: '123' },
      });
    }).not.toThrow();

    expect(() => {
      validateRequest(endpoint, {
        pathParams: { wrongParam: '123' },
      });
    }).toThrow(ZodError);
  });
});
```

**See implementation guide**: [examples/27-msw-setup.md](./examples/27-msw-setup.md)

---

## 3. Multi-Runtime Snapshot Testing

### 3.1 typed-openapi's Approach

Tests generation for all runtimes:

```typescript
// tests/snapshots/
//   petstore.client.ts       (type-only)
//   petstore.zod.ts          (zod)
//   petstore.typebox.ts      (typebox)
//   petstore.valibot.ts      (valibot)
//   petstore.arktype.ts      (arktype)

describe.each(['none', 'zod', 'typebox', 'valibot', 'arktype', 'io-ts', 'yup'])(
  'generates %s runtime correctly',
  async (runtime) => {
    test('petstore', async () => {
      const output = await generateFile({
        ...options,
        runtime,
      });

      expect(output).toMatchFileSnapshot(`./snapshots/petstore.${runtime}.ts`);
    });

    test('docker', async () => {
      const output = await generateFile({
        ...options,
        input: './samples/docker.openapi.yaml',
        runtime,
      });

      expect(output).toMatchFileSnapshot(`./snapshots/docker.${runtime}.ts`);
    });
  },
);
```

### 3.2 Applying to openapi-zod-client

#### Current Testing

Single runtime (Zod):

```typescript
test('petstore', async () => {
  const result = await generateZodClientFromOpenAPI({
    /* ... */
  });
  expect(result).toMatchInlineSnapshot(`...`);
});
```

#### Proposed Enhancement

Test all templates and options:

```typescript
// tests/snapshots.test.ts
describe.each([
  { template: 'default', name: 'zodios-client' },
  { template: 'schemas-only', name: 'schemas-only' },
  { template: 'schemas-with-metadata', name: 'schemas-metadata' },
  { template: 'types-only', name: 'types-only' }, // Future
])('$name template', ({ template, name }) => {
  test.each(['petstore', 'petstore-expanded', 'uspto', 'docker'])('%s spec', async (specName) => {
    const openApiDoc = await loadSpec(`./samples/${specName}.yaml`);

    const output = await generateZodClientFromOpenAPI({
      openApiDoc,
      template,
      disableWriteToFile: true,
      options: {
        strictObjects: true,
        exportSchemas: true,
      },
    });

    expect(output).toMatchFileSnapshot(`./snapshots/${specName}.${name}.ts`);
  });
});

// Test with different options
describe.each([
  { strictObjects: true, name: 'strict' },
  { strictObjects: false, name: 'loose' },
  { withDescription: true, name: 'with-descriptions' },
  { allReadonly: true, name: 'readonly' },
])('with $name options', ({ name, ...options }) => {
  test('petstore', async () => {
    const output = await generateZodClientFromOpenAPI({
      openApiDoc: petstoreSpec,
      disableWriteToFile: true,
      options,
    });

    expect(output).toMatchFileSnapshot(`./snapshots/petstore.${name}.ts`);
  });
});
```

**See implementation**: [examples/28-snapshot-testing.ts](./examples/28-snapshot-testing.ts)

---

## 4. Property-Based Testing

### 4.1 Concept

Generate test cases from OpenAPI spec:

```typescript
import fc from 'fast-check';

test('all schemas are valid Zod schemas', () => {
  fc.assert(
    fc.property(fc.jsonObject(), (data) => {
      // For each schema in spec
      for (const [name, schema] of Object.entries(schemas)) {
        const zodSchema = generateZodSchema(schema);

        // Should either parse or throw ZodError
        try {
          zodSchema.parse(data);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
        }
      }
    }),
  );
});
```

**See examples**: [examples/29-property-testing.ts](./examples/29-property-testing.ts)

---

## 5. Quality Metrics

### 5.1 Test Coverage

typed-openapi tracks:

- Line coverage: 85%+
- Branch coverage: 80%+
- Type coverage: Manual (via tstyche)

### 5.2 Applying to openapi-zod-client

**Add coverage tracking**:

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:types": "tstyche"
  }
}
```

**Coverage goals**:

- Core generation logic: 90%+
- Template rendering: 80%+
- CLI: 70%+
- Type tests: All public APIs

---

## 6. Testing Checklist

- [ ] Unit tests for core functions
- [ ] Integration tests with MSW
- [ ] Type-level tests with tstyche
- [ ] Snapshot tests for all templates
- [ ] Snapshot tests for all options
- [ ] Property-based tests
- [ ] Coverage tracking (>80%)
- [ ] CI/CD integration
- [ ] Performance benchmarks
- [ ] Regression tests for bug fixes

---

## 7. References

### Code Examples

- [24-type-testing.ts](./examples/24-type-testing.ts)
- [25-tstyche-setup.md](./examples/25-tstyche-setup.md)
- [26-msw-integration-tests.ts](./examples/26-msw-integration-tests.ts)
- [27-msw-setup.md](./examples/27-msw-setup.md)
- [28-snapshot-testing.ts](./examples/28-snapshot-testing.ts)
- [29-property-testing.ts](./examples/29-property-testing.ts)

### External Resources

- [tstyche documentation](https://tstyche.org/)
- [MSW documentation](https://mswjs.io/)
- [fast-check for property testing](https://fast-check.dev/)

---

**Next**: Read [05-TOOLING.md](./05-TOOLING.md) for CLI and tooling improvements.
