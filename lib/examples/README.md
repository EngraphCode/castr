# Examples Directory

This directory contains OpenAPI and Swagger specification examples used for integration testing.

## Directory Structure

```text
lib/examples/
├── openapi/          # OpenAPI Initiative examples, and three files that are not theirs
│   ├── v3.0/        # OpenAPI 3.0.x examples
│   ├── v3.1/        # OpenAPI 3.1.x examples
│   ├── v3.2/        # One OpenAPI 3.2.0 example
│   └── multi-file/  # A document split across two files
├── custom/           # Examples written for Castr
└── swagger/
    └── petstore.yaml # Swagger Petstore, an OpenAPI 3.0.3 document
```

The third-party files here are attributed in [ATTRIBUTION.md](../../ATTRIBUTION.md).
[docs/THIRD_PARTY_NOTICES.md](../../docs/THIRD_PARTY_NOTICES.md) gives their licences and,
where it is known, the source commit each file matches and how Castr has changed it; it
says plainly where an origin is not recorded. `custom/` was written for Castr and is under
Castr's own licence.

## OpenAPI Examples (`openapi/`)

Most of these are the OpenAPI Initiative's examples; the notices file is their record and
lists the three files that are not. The v3.0 and v3.1 examples are held as YAML and as
JSON, each with the source's Markdown page.

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

### Changing an example

These files are pinned: the notices file names the source commit each one matches. A newer
copy of an example is a new pin, with its source commit recorded in the notices file in the
same change. The directory is never re-fetched as a whole.

Castr reads both JSON and YAML. That is verified in
`src/characterisation/input-format.char.test.ts`.

## Swagger Examples (`swagger/`)

- `petstore.yaml` - The Swagger Petstore OpenAPI 3.0.3 document, modified in Castr (the
  notices file is its record)
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
