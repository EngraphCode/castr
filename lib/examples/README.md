# Examples Directory

This directory contains OpenAPI and Swagger specification examples used for integration testing.

## Directory Structure

```
lib/examples/
├── openapi/          # Official OpenAPI 3.x examples (fetched)
│   ├── v3.0/        # OpenAPI 3.0.x examples
│   └── v3.1/        # OpenAPI 3.1.x examples
└── swagger/          # Legacy Swagger/OpenAPI examples (committed)
    └── petstore.yaml # Full Swagger Petstore 3.0.3 spec
```

## OpenAPI Examples (`openapi/`)

**Source:** Official examples from the OpenAPI Initiative

- Repository: https://github.com/OAI/learn.openapis.org/tree/main/examples
- Fetched via: `pnpm fetch:examples` (runs `lib/examples-fetcher.ts`)
- **These files are committed** to ensure tests work out of the box

### Included Examples

#### OpenAPI 3.0 (`v3.0/`)

- `petstore.yaml` - Simple petstore with basic CRUD operations
- `petstore-expanded.yaml` - Extended petstore with `allOf` composition
- `api-with-examples.yaml` - Demonstrates example values in responses
- `callback-example.yaml` - Shows callback patterns
- `link-example.yaml` - Demonstrates hypermedia links
- `uspto.yaml` - Real-world government API (US Patent Office)

#### OpenAPI 3.1 (`v3.1/`)

- `webhook-example.yaml` - OpenAPI 3.1 webhooks feature
- `non-oauth-scopes.yaml` - Non-OAuth security schemes

### Updating Examples

To fetch the latest examples from the OpenAPI Initiative:

```bash
pnpm fetch:examples
```

This will:

1. Clone the latest examples from GitHub
2. Remove Swagger v2.0 specs (we only test OpenAPI 3.x)
3. Remove JSON files (we only use YAML)
4. Place them in `lib/examples/openapi/`

## Swagger Examples (`swagger/`)

**Manually curated examples that don't fit the OpenAPI 3.x structure:**

- `petstore.yaml` - The comprehensive Swagger Petstore 3.0.3 specification
  - Used for extensive snapshot testing
  - More complete than the simple OpenAPI examples
  - Includes: tags, security schemes, full CRUD operations, etc.

## Usage in Tests

### Integration Tests (`tests-snapshot/samples.test.ts`)

Tests the entire code generation pipeline against official OpenAPI examples:

```typescript
// Finds all YAML files in openapi/v3.*/
const examplesPath = path.resolve(pkgRoot, String.raw`./examples/openapi/v3\.*/**/*.yaml`);
const list = fg.sync([examplesPath]);

for (const docPath of list) {
  // Parse OpenAPI spec
  const openApiDoc = await SwaggerParser.parse(docPath);

  // Generate Zod client code
  const data = getZodClientTemplateContext(openApiDoc);
  const output = template(data);

  // Validate and snapshot
  expect(prettyOutput).toMatchInlineSnapshot(...);
}
```

### Characterisation Tests

Various characterisation tests use these examples to validate:

- Schema dependency resolution
- Template rendering
- Edge cases handling
- Error handling

## Why Both OpenAPI and Swagger Examples?

1. **OpenAPI examples** - Official, canonical examples covering specific features
2. **Swagger petstore** - Comprehensive, real-world spec for extensive testing

Both are valuable for ensuring the code generator handles:

- Official specification examples (OpenAPI)
- Real-world, complex specifications (Swagger petstore)
