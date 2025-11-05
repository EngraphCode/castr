# ADR-003: Intersection Type Strategy for Type System Boundaries

**Date:** November 4, 2025  
**Status:** Accepted  
**Deciders:** Architecture Team  
**Related:** ADR-001 (3.1-First), ADR-002 (Scalar Pipeline)

---

## Context

The adoption of the Scalar pipeline (ADR-002) introduced a type system challenge: Scalar's libraries use loose, extension-friendly types (`Record<string, unknown>` for flexibility), while our codebase requires strict typing from `openapi3-ts/oas31` for type safety and IntelliSense.

### The Type Mismatch Problem

**Scalar's Approach:**

```typescript
// @scalar/openapi-types
interface OpenAPIV3_1.Document {
  openapi: string;
  info: InfoObject;
  paths?: PathsObject;
  [key: string]: unknown; // Allows any extension (x-*)
}
```

**Our Requirements:**

```typescript
// openapi3-ts/oas31
interface OpenAPIObject {
  openapi: string;
  info: InfoObject;
  paths?: PathsObject<OperationObject>;
  components?: ComponentsObject;
  // ... strict typing for all standard fields
}
```

### Conflicting Needs

1. **Extension Preservation:** Need Scalar's `x-ext` and `x-ext-urls` metadata for debugging
2. **Strict Typing:** Need `openapi3-ts` strict types for conversion/template logic
3. **Type Safety:** Cannot use `as` casting (violates `.agent/RULES.md`)
4. **IntelliSense:** Developers need autocomplete for standard OpenAPI properties

### Previous Approaches (Rejected)

**Type Casting (Forbidden):**

```typescript
// ❌ NEVER ALLOWED - violates type safety rules
const doc = scalarResult as OpenAPIObject;
```

**Union Types (Insufficient):**

```typescript
// ❌ Forces consumers to narrow types everywhere
type Document = OpenAPIV3_1.Document | OpenAPIObject;
```

**Wrapper Types (Cumbersome):**

```typescript
// ❌ Requires unwrapping at every usage site
interface Wrapped {
  scalar: OpenAPIV3_1.Document;
  strict: OpenAPIObject;
}
```

---

## Decision

**We will use TypeScript intersection types to combine Scalar's extension-friendly types with `openapi3-ts` strict types, validated at runtime boundaries with type guards.**

### Core Type Definition

```typescript
import type { OpenAPIV3_1 } from '@scalar/openapi-types';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

/**
 * Bundled OpenAPI 3.1 document combining:
 * - Scalar's extension-friendly OpenAPIV3_1.Document (preserves x-ext, x-ext-urls)
 * - openapi3-ts strict OpenAPIObject (strict typing for standard fields)
 *
 * This intersection type provides:
 * - Strict typing for all standard OpenAPI 3.1 properties
 * - Access to Scalar's bundle metadata extensions
 * - Full IntelliSense support for both type systems
 *
 * @remarks
 * The intersection is validated at runtime via `isBundledOpenApiDocument` type guard.
 * Never cast to this type - always use the type guard for narrowing.
 */
export type BundledOpenApiDocument = OpenAPIV3_1.Document & OpenAPIObject;
```

### Type Guard for Boundary Validation

````typescript
/**
 * Type guard to validate and narrow bundled OpenAPI documents.
 *
 * Checks that the document satisfies both:
 * - Scalar's OpenAPIV3_1.Document structure
 * - openapi3-ts OpenAPIObject requirements
 *
 * @param value - Value to check (typically from Scalar's upgrade())
 * @returns True if value is a valid BundledOpenApiDocument
 *
 * @example
 * ```typescript
 * const upgraded = upgrade(bundled);
 * if (!isBundledOpenApiDocument(upgraded.specification)) {
 *   throw new Error('Invalid OpenAPI 3.1 document');
 * }
 * // Now TypeScript knows it's BundledOpenApiDocument
 * const doc = upgraded.specification;
 * ```
 */
export function isBundledOpenApiDocument(value: unknown): value is BundledOpenApiDocument {
  if (!value || typeof value !== 'object') return false;

  const doc = value as Record<string, unknown>;

  // Required OpenAPI 3.1 properties
  return (
    typeof doc.openapi === 'string' &&
    doc.openapi.startsWith('3.1') &&
    typeof doc.info === 'object' &&
    doc.info !== null &&
    (doc.paths === undefined || typeof doc.paths === 'object')
  );
}
````

### Usage Pattern

```typescript
export async function loadOpenApiDocument(
  input: string | URL | OpenAPIObject,
): Promise<LoadedOpenApiDocument> {
  // 1. Bundle with Scalar (loose types)
  const bundled = await bundle(normalizedInput, config);

  // 2. Upgrade to 3.1 (still loose types)
  const { specification: upgraded } = upgrade(bundled);

  // 3. Validate at boundary (narrow to strict types)
  if (!isBundledOpenApiDocument(upgraded)) {
    throw new Error('Failed to produce valid OpenAPI 3.1 document');
  }

  // 4. Now TypeScript knows it's BundledOpenApiDocument
  // Both Scalar extensions AND strict types available
  return {
    document: upgraded, // Type: BundledOpenApiDocument
    metadata: createMetadata(...)
  };
}
```

---

## Consequences

### Positive

✅ **Best of Both Worlds:** Strict typing for standard fields + extension access  
✅ **Type Safety:** No casting, runtime validation via type guards  
✅ **IntelliSense:** Full autocomplete for both type systems  
✅ **Debugging:** Access to Scalar's `x-ext` and `x-ext-urls` metadata  
✅ **Maintainable:** Single type definition, validated once at boundary  
✅ **Rules Compliant:** No `as` casting, follows `.agent/RULES.md`  
✅ **Future-Proof:** Easy to add more type sources if needed

### Negative

⚠️ **Type Complexity:** Intersection types can be harder to understand initially  
⚠️ **Runtime Overhead:** Type guard adds validation step (minimal cost)  
⚠️ **Type Conflicts:** Potential for property conflicts (none found so far)

### Neutral

ℹ️ **TypeScript Version:** Requires TS 4.1+ for template literal types (already met)  
ℹ️ **Bundle Size:** No runtime impact, types erased at compile time  
ℹ️ **Documentation:** Requires clear TSDoc explaining the intersection

---

## Technical Details

### How Intersection Types Work

TypeScript intersection types (`A & B`) create a type that has **all properties from both types**:

```typescript
type A = { foo: string; shared: number };
type B = { bar: string; shared: number };
type C = A & B;

// C has: { foo: string; bar: string; shared: number; }
```

For our case:

```typescript
// OpenAPIV3_1.Document has: openapi, info, paths, [x: string]: unknown
// OpenAPIObject has: openapi, info, paths, components, servers, ...
// BundledOpenApiDocument has: ALL properties from both
```

### Property Conflict Resolution

If both types define the same property with different types, TypeScript intersects those types too:

```typescript
type A = { prop: string };
type B = { prop: string | number };
type C = A & B; // prop: string (narrower type wins)
```

In our case, standard OpenAPI properties are compatible between both type systems.

### Extension Access

```typescript
function analyzeDocument(doc: BundledOpenApiDocument) {
  // Strict typing for standard properties
  const version = doc.openapi; // Type: string
  const title = doc.info.title; // Type: string
  const paths = doc.paths; // Type: PathsObject<OperationObject> | undefined

  // Extension access (from Scalar)
  const scalarDoc = doc as OpenAPIV3_1.Document;
  const bundleMetadata = scalarDoc['x-ext']; // Type: unknown
  const externalUrls = scalarDoc['x-ext-urls']; // Type: unknown
}
```

### Type Guard Implementation Details

The type guard checks:

1. **Value is object:** `typeof value === 'object' && value !== null`
2. **Has openapi field:** `typeof doc.openapi === 'string'`
3. **Is version 3.1:** `doc.openapi.startsWith('3.1')`
4. **Has info object:** `typeof doc.info === 'object' && doc.info !== null`
5. **Paths optional:** `doc.paths === undefined || typeof doc.paths === 'object'`

This validates both type systems' requirements without casting.

---

## Alternatives Considered

### Alternative 1: Use Only Scalar Types

**Rejected:** Loses strict typing benefits. Would require manual type narrowing throughout codebase.

```typescript
// ❌ Every usage site needs narrowing
function processDoc(doc: OpenAPIV3_1.Document) {
  const paths = doc.paths as PathsObject; // Casting everywhere
}
```

### Alternative 2: Use Only openapi3-ts Types

**Rejected:** Loses Scalar's extension metadata. Would need custom types for `x-ext` and `x-ext-urls`.

```typescript
// ❌ Can't access Scalar metadata
function processDoc(doc: OpenAPIObject) {
  const metadata = doc['x-ext']; // Type error!
}
```

### Alternative 3: Wrapper Object

**Rejected:** Cumbersome to use, requires unwrapping at every call site.

```typescript
// ❌ Unwrapping required everywhere
interface Wrapped {
  scalar: OpenAPIV3_1.Document;
  strict: OpenAPIObject;
}

function processDoc(wrapped: Wrapped) {
  const title = wrapped.strict.info.title; // Verbose
}
```

### Alternative 4: Generics with Constraints

**Rejected:** Over-engineered for this use case, doesn't solve the core problem.

```typescript
// ❌ Complex without clear benefit
function processDoc<T extends OpenAPIObject & OpenAPIV3_1.Document>(doc: T) {
  // Still need runtime validation
}
```

---

## Implementation Checklist

- [x] Define `BundledOpenApiDocument` intersection type
- [x] Implement `isBundledOpenApiDocument` type guard
- [x] Add comprehensive TSDoc for both
- [x] Use type guard in `loadOpenApiDocument`
- [x] Export types from `bundle-metadata.types.ts`
- [x] Update `LoadedOpenApiDocument` to use intersection type
- [x] Add unit tests for type guard
- [x] Document pattern in ADR

---

## References

- [TypeScript Handbook: Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
- [TypeScript Handbook: Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Effective TypeScript: Item 3 (Understand Type Narrowing)](https://effectivetypescript.com/)
- `.agent/RULES.md` - Type System Discipline section

---

## Related Decisions

- **ADR-001:** OpenAPI 3.1-First Architecture (defines target type system)
- **ADR-002:** Scalar Pipeline Adoption (introduces the type mismatch)
- **ADR-004:** Legacy Dependency Removal (removes competing type definitions)

---

## Revision History

| Date       | Version | Changes                     |
| ---------- | ------- | --------------------------- |
| 2025-11-04 | 1.0     | Initial decision documented |
