# Zod 4 Advanced Features Research Plan

## Purpose

Investigate advanced Zod 4 features for potential future adoption in Castr. These features could improve schema management, developer experience, and round-trip capabilities.

**Reference:** https://zod.dev/v4

---

## Features to Research

### 1. `z.globalRegistry` - Centralized Schema Metadata

**Description:** A global registry that stores schema metadata externally, enabling schema lookup by ID and centralized metadata management.

**Research Questions:**

- [ ] How does registration work across module boundaries?
- [ ] Can it replace our current `.meta()` approach?
- [ ] How does it interact with circular references?
- [ ] Performance implications for large schemas?

**Potential Use Cases:**

- Schema lookup by component name
- Centralized OpenAPI metadata storage
- Runtime schema introspection

---

### 2. Native Recursive Objects

**Description:** Zod 4 supports recursive schemas using getter syntax instead of `z.lazy()`.

```typescript
// New Zod 4 syntax
const Category = z.object({
  name: z.string(),
  get subcategories() { return z.array(Category) }
});

// Old syntax (still works)
const Category = z.lazy(() => z.object(...));
```

**Research Questions:**

- [ ] Does getter syntax work with our AST generation approach?
- [ ] How does it affect TypeScript type inference?
- [ ] Migration path from `z.lazy()`?
- [ ] Compatibility with `z.toJSONSchema()`?

---

### 3. `z.toJSONSchema()` - First-Party JSON Schema Conversion

**Description:** Built-in conversion from Zod schemas to JSON Schema.

**Research Questions:**

- [ ] What JSON Schema dialect does it output (Draft-07, 2020-12)?
- [ ] Does it preserve `.meta()` fields in output?
- [ ] How does it handle Zod-specific features (refinements, transforms)?
- [ ] Can we use it for IR → OpenAPI round-trip validation?

**Potential Use Cases:**

- Validate generated Zod schemas produce correct JSON Schema
- Alternative round-trip path: OpenAPI → IR → Zod → JSON Schema → compare
- API documentation generation

---

### 4. `z.file()` - File Schema Validation

**Description:** Native schema for validating `File` instances with size and MIME type constraints.

```typescript
z.file().min(10_000).max(1_000_000).mime(['image/png']);
```

**Research Questions:**

- [ ] How does this map to OpenAPI binary/file formats?
- [ ] Multipart form data handling?

---

### 5. Internationalization (`z.locales`)

**Description:** Built-in locale support for translating error messages.

**Research Questions:**

- [ ] Is this relevant for Castr's code generation use case?
- [ ] Should we expose locale configuration in generated code?

---

## Expected Outcomes

| Feature            | Expected Decision                                   |
| ------------------ | --------------------------------------------------- |
| `z.globalRegistry` | Defer - current `.meta()` approach is sufficient    |
| Native recursion   | Evaluate - may simplify circular reference handling |
| `z.toJSONSchema()` | Priority - enables round-trip validation            |
| `z.file()`         | Defer - low priority unless file uploads needed     |
| i18n               | Defer - not relevant for code generation            |

---

## Timeline

This research is **non-blocking** for current Castr development. Recommended to schedule as a future session (2.10+) after current roadmap items are complete.
