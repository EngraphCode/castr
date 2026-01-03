# OpenAPI 3.1 Type System Migration Guide

**Status:** Implemented ✅  
**Date:** November 2025  
**Related ADRs:** [ADR-018: OpenAPI 3.1-First Architecture](../../docs/architectural_decision_records/ADR-018-openapi-3.1-first-architecture.md)

---

## Overview

This document explains the type system differences between OpenAPI 3.0 and OpenAPI 3.1, and how `@engraph/castr` handles them internally. It provides guidance for contributors and users who need to understand nullable types, exclusive bounds, and type array handling in the context of OpenAPI 3.1.

**Key Changes:**

- **Nullable Types:** `nullable: true` → `type: [..., 'null']`
- **Exclusive Bounds:** Boolean flags → Numeric values
- **Type Arrays:** Single types can be arrays
- **JSON Schema 2020-12:** Full JSON Schema compatibility

---

## Table of Contents

1. [Nullable Types](#nullable-types)
2. [Exclusive Bounds](#exclusive-bounds)
3. [Type Arrays](#type-arrays)
4. [Implementation Helpers](#implementation-helpers)
5. [Migration Patterns](#migration-patterns)
6. [Testing Strategies](#testing-strategies)
7. [References](#references)

---

## Nullable Types

### The Problem: OpenAPI 3.0 Nullable Property

In OpenAPI 3.0, nullable types were expressed using a `nullable` property:

```yaml
# OpenAPI 3.0
type: string
nullable: true
```

This was **not** valid JSON Schema and required special handling.

### The Solution: OpenAPI 3.1 Type Arrays

OpenAPI 3.1 aligns with JSON Schema 2020-12, where nullable types are expressed as **type arrays**:

```yaml
# OpenAPI 3.1
type: [string, 'null']
```

This is **valid JSON Schema** and requires no special handling.

### Migration Mapping

| OpenAPI 3.0                                 | OpenAPI 3.1                           |
| ------------------------------------------- | ------------------------------------- |
| `type: string, nullable: true`              | `type: [string, 'null']`              |
| `type: number, nullable: true`              | `type: [number, 'null']`              |
| `type: boolean, nullable: false`            | `type: boolean`                       |
| `type: object, nullable: true`              | `type: [object, 'null']`              |
| `type: array, items: {...}, nullable: true` | `type: [array, 'null'], items: {...}` |

### Composition Schema Nullability

In OpenAPI 3.0, composition schemas (oneOf, anyOf, allOf) could have a top-level `nullable` property:

```yaml
# OpenAPI 3.0
nullable: true
oneOf:
  - type: string
  - type: number
```

In OpenAPI 3.1, the `null` type is added as an additional option:

```yaml
# OpenAPI 3.1
oneOf:
  - type: string
  - type: number
  - type: 'null'
```

### Enum Nullability

Enums with null values no longer need a separate `nullable` property:

```yaml
# OpenAPI 3.0
type: string
enum: [success, error, null]
nullable: true

# OpenAPI 3.1
enum: [success, error, null]
```

---

## Exclusive Bounds

### The Problem: OpenAPI 3.0 Boolean Flags

In OpenAPI 3.0, exclusive bounds were expressed using **boolean flags**:

```yaml
# OpenAPI 3.0
minimum: 0
exclusiveMinimum: true # Means > 0, not >= 0

maximum: 100
exclusiveMaximum: false # Means <= 100
```

This was confusing and error-prone.

### The Solution: OpenAPI 3.1 Numeric Values

OpenAPI 3.1 aligns with JSON Schema, where exclusive bounds are **numeric values**:

```yaml
# OpenAPI 3.1
exclusiveMinimum: 0 # Means > 0
maximum: 100 # Means <= 100
```

### Migration Mapping

| OpenAPI 3.0                             | OpenAPI 3.1             |
| --------------------------------------- | ----------------------- |
| `minimum: 0, exclusiveMinimum: true`    | `exclusiveMinimum: 0`   |
| `minimum: 0, exclusiveMinimum: false`   | `minimum: 0`            |
| `maximum: 100, exclusiveMaximum: true`  | `exclusiveMaximum: 100` |
| `maximum: 100, exclusiveMaximum: false` | `maximum: 100`          |

### Code Pattern

```typescript
// Checking for exclusive minimum (OpenAPI 3.1)
if (schema.minimum !== undefined) {
  validations.push(`gte(${schema.minimum})`);
} else if (typeof schema.exclusiveMinimum === 'number') {
  validations.push(`gt(${schema.exclusiveMinimum})`);
}

// Checking for exclusive maximum (OpenAPI 3.1)
if (schema.maximum !== undefined) {
  validations.push(`lte(${schema.maximum})`);
} else if (typeof schema.exclusiveMaximum === 'number') {
  validations.push(`lt(${schema.exclusiveMaximum})`);
}
```

---

## Type Arrays

### Single Type vs. Type Array

In OpenAPI 3.0, the `type` field was always a **single string**:

```yaml
# OpenAPI 3.0
type: string
```

In OpenAPI 3.1, the `type` field can be a **string or an array of strings**:

```yaml
# OpenAPI 3.1 - Single type
type: string

# OpenAPI 3.1 - Multiple types
type: [string, number]

# OpenAPI 3.1 - Nullable
type: [string, 'null']
```

### Handling in TypeScript

```typescript
import type { SchemaObject } from 'openapi3-ts/oas31';

// Normalize to array
const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];

// Check for null
const isNullable = types.includes('null');

// Get non-null types
const nonNullTypes = types.filter((t) => t !== 'null');
```

---

## Implementation Helpers

### `isNullableType()` Helper

We provide a centralized helper function to check if a schema allows null values:

````typescript
/**
 * Checks if a schema allows null values (OpenAPI 3.1 style).
 *
 * In OpenAPI 3.1, nullable is expressed as `type: ['string', 'null']`
 * rather than the OpenAPI 3.0 `nullable: true` property.
 *
 * Note: This function supports BOTH OpenAPI 3.0 and 3.1 syntax
 * during the transition period, but the codebase is moving towards
 * 3.1-only support (see ADR-018).
 *
 * @param schema - The schema object to check
 * @returns true if the schema's type array includes 'null'
 *
 * @example
 * ```typescript
 * isNullableType({ type: ['string', 'null'] }) // true
 * isNullableType({ type: 'string' }) // false
 * isNullableType({ type: ['number', 'null'] }) // true
 * isNullableType({ type: 'null' }) // true
 * ```
 *
 * @public
 */
export function isNullableType(schema: SchemaObject): boolean {
  if (Array.isArray(schema.type)) {
    return schema.type.includes('null');
  }
  return schema.type === 'null';
}
````

**Location:** `lib/src/conversion/typescript/helpers.primitives.ts`

**Usage:**

```typescript
// TypeScript conversion
if (isNullableType(schema)) {
  tsType += ' | null';
}

// Zod conversion
if (isNullableType(schema)) {
  zodChain += '.nullable()';
}
```

### Why Not Check `schema.nullable`?

The `nullable` property is **OpenAPI 3.0 only** and is not valid in OpenAPI 3.1. Since our codebase is 3.1-first (ADR-018), we:

1. **Auto-upgrade** all 3.0 specs to 3.1 via Scalar pipeline
2. **Only check** `type` arrays for null inclusion
3. **Do not check** the legacy `nullable` property

This ensures consistency and future-proofs the codebase.

---

## Migration Patterns

### Pattern 1: Nullable Primitive

```typescript
// ❌ OpenAPI 3.0 (old)
const schema = {
  type: 'string',
  nullable: true,
};

if (schema.nullable) {
  tsType += ' | null';
}

// ✅ OpenAPI 3.1 (new)
const schema = {
  type: ['string', 'null'],
};

if (isNullableType(schema)) {
  tsType += ' | null';
}
```

### Pattern 2: Nullable Object

```typescript
// ❌ OpenAPI 3.0 (old)
const schema = {
  type: 'object',
  properties: { name: { type: 'string' } },
  nullable: true,
};

// ✅ OpenAPI 3.1 (new)
const schema = {
  anyOf: [
    {
      type: 'object',
      properties: { name: { type: 'string' } },
    },
    { type: 'null' },
  ],
};

// Or, if the object structure is simple:
const schema = {
  type: ['object', 'null'],
  properties: { name: { type: 'string' } },
};
```

### Pattern 3: Nullable Composition

```typescript
// ❌ OpenAPI 3.0 (old)
const schema = {
  nullable: true,
  oneOf: [{ type: 'string' }, { type: 'number' }],
};

// ✅ OpenAPI 3.1 (new)
const schema = {
  oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }],
};
```

### Pattern 4: Exclusive Bounds

```typescript
// ❌ OpenAPI 3.0 (old)
const schema = {
  type: 'number',
  minimum: 0,
  exclusiveMinimum: true,
};

if (schema.exclusiveMinimum === true && schema.minimum !== undefined) {
  validations.push(`gt(${schema.minimum})`);
}

// ✅ OpenAPI 3.1 (new)
const schema = {
  type: 'number',
  exclusiveMinimum: 0,
};

if (typeof schema.exclusiveMinimum === 'number') {
  validations.push(`gt(${schema.exclusiveMinimum})`);
}
```

---

## Testing Strategies

### Test Fixture Modernization

All test fixtures in this codebase have been modernized to OpenAPI 3.1 syntax:

**Files Updated:**

- `lib/tests-snapshot/utilities/openApiToTypescript.test.ts`
- `lib/tests-snapshot/utilities/openApiToZod.test.ts`
- `lib/tests-snapshot/options/validation/validations.test.ts`
- `lib/tests-snapshot/options/validation/enum-null.test.ts`
- `lib/tests-snapshot/edge-cases/missing-zod-chains.test.ts`
- `lib/src/conversion/typescript/helpers.test.ts`
- `lib/src/characterisation/edge-cases.char.test.ts`
- `lib/tests-snapshot/schemas/references/schema-refiner.test.ts`

### Before/After Examples

```typescript
// ❌ Before (OpenAPI 3.0)
it('should handle nullable string', () => {
  const schema: SchemaObject = {
    type: 'string',
    nullable: true,
  };
  expect(toTypescript(schema)).toBe('string | null');
});

// ✅ After (OpenAPI 3.1)
it('should handle nullable string', () => {
  const schema: SchemaObject = {
    type: ['string', 'null'],
  };
  expect(toTypescript(schema)).toBe('string | null');
});
```

### Characterisation Tests

The characterisation test suite verifies that:

1. **Scalar auto-upgrades** 3.0 specs to 3.1
2. **Type conversions** handle nullable types correctly
3. **Validation chains** handle exclusive bounds correctly
4. **Composition schemas** handle null types correctly

See `lib/src/characterisation/` for examples.

---

## References

### Official Specifications

- [OpenAPI 3.1.0 Specification](https://spec.openapis.org/oas/v3.1.0)
- [OpenAPI 3.0.3 Specification](https://spec.openapis.org/oas/v3.0.3)
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html)

### Migration Guides

- [Migrating from OpenAPI 3.0 to 3.1](https://www.openapis.org/blog/2021/02/16/migrating-from-openapi-3-0-to-3-1-0)
- [JSON Schema and OpenAPI](https://json-schema.org/blog/posts/openapi-3-1-and-json-schema-2020-12)

### Related Documentation

- [ADR-018: OpenAPI 3.1-First Architecture](../../docs/architectural_decision_records/ADR-018-openapi-3.1-first-architecture.md)
- [ADR-019: Scalar Pipeline Adoption](../../docs/architectural_decision_records/ADR-019-scalar-pipeline-adoption.md)
- [Scalar Pipeline Architecture](./.agent/architecture/SCALAR-PIPELINE.md)

### Implementation Files

- **Helper Function:** `lib/src/conversion/typescript/helpers.primitives.ts` (line 41)
- **TypeScript Conversion:** `lib/src/conversion/typescript/core.converters.ts`
- **Zod Conversion:** `lib/src/conversion/zod/`
- **Tests:** `lib/tests-snapshot/utilities/`, `lib/src/characterisation/`

---

## Summary

OpenAPI 3.1 brings significant improvements to type system consistency by aligning with JSON Schema 2020-12:

1. **Nullable types** are now expressed as type arrays (`type: [..., 'null']`) instead of a boolean property
2. **Exclusive bounds** are now numeric values instead of boolean flags
3. **Type arrays** enable richer type expressions

Our implementation:

- **Auto-upgrades** all 3.0 specs to 3.1 via Scalar
- **Centralizes** nullable checking in `isNullableType()`
- **Validates** at type boundaries with guards
- **Tests** extensively with modernized fixtures

This ensures a consistent, maintainable, and future-proof codebase.

---

**Last Updated:** January 2026  
**Maintainer:** See `.agent/context/context.md`
