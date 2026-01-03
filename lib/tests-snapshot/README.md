# Snapshot Tests

Snapshot tests validate generated output against saved snapshots. These tests verify the complete code generation pipeline from OpenAPI specs to TypeScript/Zod code.

**Run with:** `pnpm test:snapshot`

## Directory Structure

```
tests-snapshot/
├── integration/          # E2E / Full pipeline tests (4 files)
├── schemas/              # Schema handling tests
│   ├── composition/      # allOf, anyOf, oneOf (8 files)
│   ├── references/       # $ref handling (7 files)
│   ├── types/            # Schema types & inference (4 files)
│   └── complexity/       # Recursive/complex schemas (4 files)
├── options/              # Code generation configuration
│   ├── generation/       # Export, group, inline options (12 files)
│   └── validation/       # Validation, regex, enums (9 files)
├── endpoints/            # Endpoint & parameter handling (5 files)
├── spec-compliance/      # OpenAPI spec compliance (4 files)
├── naming/               # Name sanitization & special chars (5 files)
├── edge-cases/           # Edge cases & misc (10 files)
└── utilities/            # Helper functions & conversions (3 files)
```

## Test Categories

### Integration (4 files)

End-to-end tests that exercise the complete generation pipeline:

- **`generateZodClientFromOpenAPI.test.ts`** - Full pipeline with petstore spec
- **`getEndpointDefinitionList.test.ts`** - Endpoint list generation
- **`getOpenApiDependencyGraph.test.ts`** - Dependency graph generation
- **`samples.test.ts`** - Official OpenAPI examples (8 specs from OAI)

### Schemas (23 files)

#### Composition (8 files)

Tests for schema composition keywords:

- `allOf-*` - Schema composition with `allOf`
- `anyOf-behavior` - `anyOf` unions
- `array-oneOf-discriminated-union` - Discriminated unions

#### References (7 files)

Tests for `$ref` handling:

- `ref-in-another-file` - External references
- `request-body-ref`, `resolve-ref-responses` - Reference resolution
- `handle-refs-with-dots-in-name`, `handle-refs-without-var-name` - Edge cases
- `missing-zod-chains-on-z-object-with-refs-props` - Zod chain generation

#### Types (4 files)

Schema type inference and conversion:

- `schema-type-*` - Type handling (wrong case, 3.1 lists)
- `infer-as-object-when-only-properties-set` - Type inference
- `use-union-only-when-multiple-choices` - Union generation

#### Complexity (4 files)

Complex schema scenarios:

- `recursive-schema` - Self-referencing schemas
- `schema-complexity` - Complexity tracking
- `schema-name-already-used`, `same-schema-different-name` - Name conflicts

### Options (21 files)

#### Generation (12 files)

Code generation configuration:

- `export-*` - Export options (all types, named schemas, schemas only)
- `group-strategy*` - File organization strategies
- `additionalProperties-*` - Additional properties handling
- `strictObjects-option`, `withImplicitRequired-option` - Type strictness
- `with-deprecated`, `inline-simple-schemas` - Generation tweaks

#### Validation (9 files)

Validation and constraint handling:

- `*regex*` - Regular expression handling (escapes, unicode, invalid)
- `enum-*` - Enum handling (null, min/max, numerical)
- `min-with-max`, `validations` - Constraint handling

### Endpoints (5 files)

Endpoint and parameter processing:

- `common-parameters` - Shared parameters
- `param-*` - Parameter handling (invalid spec, with content)
- `errors-responses` - Error response handling
- `missing-operationId-variables-undefined_Body` - Missing IDs

### Spec Compliance (4 files)

OpenAPI specification compliance:

- `openapi-spec-compliance`, `spec-compliance` - Spec validation
- `oas-3.0-vs-3.1-feature-parity` - Version differences
- `defaut-status-behavior` - Default status handling

### Naming (5 files)

Name sanitization and special character handling:

- `name-*` - Special characters, starting with numbers
- `handle-props-with-special-characters` - Property name sanitization
- `hyphenated-parameters`, `kebab-case-in-props` - Case handling

### Edge Cases (10 files)

Miscellaneous edge cases:

- `*-default-values` - Default value handling (array, object, number)
- `is-*` - Helper checks (main response, media type allowed)
- `missing-zod-chains` - Chain generation edge cases
- `jsdoc`, `description-in-zod` - Documentation handling
- `main-description-as-fallback`, `required-additional-props-not-in-properties` - Fallbacks

### Utilities (3 files)

Helper function tests:

- `utils` - General utilities
- `openApiToTypescript`, `openApiToZod` - Core conversion functions

## Running Tests

```bash
# Run all snapshot tests
pnpm test:snapshot

# Run tests from specific category
pnpm test:snapshot tests-snapshot/integration

# Run specific test file
pnpm test:snapshot tests-snapshot/schemas/composition/allOf-infer-required-only-item.test.ts

# Update snapshots
pnpm test:snapshot -- -u
```

## Adding New Tests

1. **Choose the right category** based on what you're testing
2. **Create test file** in appropriate subdirectory
3. **Import from correct depth**:
   - One level deep: `from '../../src/...'`
   - Two levels deep: `from '../../../src/...'`
4. **Use toMatchInlineSnapshot()** for snapshot assertions
5. **Run tests** to generate initial snapshot

## Test Principles

- **Snapshot tests verify OUTPUT**, not implementation
- **Tests should be independent** (no shared state)
- **Use real OpenAPI specs** where possible
- **Keep tests focused** - one concern per file
- **Name files descriptively** - name should explain what's being tested

## Examples

See `/Users/jim/code/personal/@engraph/castr/lib/examples/` for:

- **`openapi/`** - Official OpenAPI 3.x examples
- **`swagger/`** - Comprehensive Swagger petstore spec
