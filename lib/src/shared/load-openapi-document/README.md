# OpenAPI Document Loading

This module provides the `loadOpenApiDocument()` function — the entry point for loading, bundling, validating, and upgrading OpenAPI specifications.

---

## Pipeline

```
Input → bundle() → validate() → upgrade() → Output
```

1. **Bundle** — Resolves `$ref` references, flattens external files
2. **Validate** — Enforces OpenAPI schema compliance (version-specific)
3. **Upgrade** — Converts 3.0.x to 3.1.0 for consistent internal representation

---

## Files

| File                       | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `index.ts`                 | Public API exports                          |
| `orchestrator.ts`          | Main pipeline orchestration                 |
| `bundle-config.ts`         | Scalar bundler configuration                |
| `bundle-document.ts`       | Bundle wrapper with metadata                |
| `bundle-infrastructure.ts` | Plugin infrastructure                       |
| `normalize-input.ts`       | Input normalization (string/URL/object)     |
| `metadata.ts`              | Metadata extraction (files, URLs, warnings) |
| `upgrade-validate.ts`      | Upgrade and validation logic                |
| `validation-errors.ts`     | User-friendly error formatting              |

---

## Validation Error Formatting

The `validation-errors.ts` module provides user-friendly error messages with contextual hints.

### Functions

| Function                         | Purpose                                     |
| -------------------------------- | ------------------------------------------- |
| `formatValidationPath()`         | Converts JSON pointers to readable paths    |
| `getValidationHint()`            | Provides context-specific hints             |
| `formatValidationError()`        | Formats single error with location and hint |
| `createValidationErrorMessage()` | Builds complete error message               |

### Example Output

```
Invalid OpenAPI 3.0.3 document:

❌ Error 1:
  Location: paths → /test → get → responses → 200
  Issue: must have required property
  Hint: Response objects require a 'description' field (OpenAPI 3.0.x and 3.1.x)
```

### Contextual Hints

The module provides hints for common errors:

| Error Pattern                   | Hint                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------ |
| Missing description in response | "Response objects require a 'description' field"                               |
| Missing info fields             | "The 'info' object requires 'title' and 'version'"                             |
| Invalid type value              | "In 3.0.x, 'type' must be: array, boolean, integer, number, object, or string" |
| 3.1.x-only fields in 3.0.x      | Specific hint about version compatibility                                      |

---

## Tests

- `validation-errors.unit.test.ts` — 13 unit tests for formatting
- `validation-errors.integration.test.ts` — 4 integration tests for full pipeline

---

## Usage

```typescript
import { loadOpenApiDocument } from './shared/load-openapi-document/index.js';

// From file path
const result = await loadOpenApiDocument('./spec.yaml');

// From URL
const result = await loadOpenApiDocument(new URL('https://api.example.com/openapi.yaml'));

// From object
const result = await loadOpenApiDocument({
  openapi: '3.0.3',
  info: { title: 'API', version: '1.0.0' },
  paths: {},
});

// Result includes document and metadata
const { document, metadata } = result;
```
