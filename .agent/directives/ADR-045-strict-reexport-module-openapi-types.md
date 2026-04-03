# ADR-045: Strict Re-export Module for OpenAPI Types

**Status:** Accepted  
**Date:** 2026-04-03  
**Context:** OAS 3.2 Full Feature Support arc — companion to ADR-044

---

## Decision

All OpenAPI type imports throughout the codebase MUST use a single local re-export module (`lib/src/shared/openapi-types.ts`), never importing from `@scalar/openapi-types` or `openapi3-ts/oas31` directly. This module re-exports Scalar's `OpenAPIV3_2` types with strictness narrowings on spec-required fields.

## Context

`@scalar/openapi-types` is designed for tolerant user-input handling: all fields are optional because Scalar's parser and UI must gracefully handle malformed documents. This is the correct design for a parser/UI library.

Castr's doctrine requires the opposite: strict type enforcement for spec-mandated fields. The OpenAPI 3.1/3.2 specification (using RFC 2119 language) explicitly REQUIRES the following fields:

| Type                          | Field          | OAS Spec Requirement                       |
| ----------------------------- | -------------- | ------------------------------------------ |
| `ParameterObject`             | `name`         | **REQUIRED** — identifies the parameter    |
| `ParameterObject`             | `in`           | **REQUIRED** — locates the parameter       |
| `RequestBodyObject`           | `content`      | **REQUIRED** — defines media type mappings |
| `ResponseObject`              | `description`  | **REQUIRED** — describes the response      |
| `ExternalDocumentationObject` | `url`          | **REQUIRED** — target documentation URL    |
| `TagObject`                   | `name`         | **REQUIRED** — unique tag identifier       |
| `DiscriminatorObject`         | `propertyName` | **REQUIRED** — discriminating property     |
| `SecuritySchemeObject`        | `type`         | **REQUIRED** — scheme category             |

These fields being required is not `openapi3-ts` inventing strictness — it is faithful representation of the OpenAPI specification. A document missing any of these fields is invalid per the spec, and our library must not silently tolerate that.

## Implementation

The re-export module uses TypeScript intersection narrowing (`& { field: Type }`) to restore required-ness on the ~8 fields where it matters. For all other types, it directly re-exports the Scalar types without modification.

```typescript
// Example: ParameterObject with strict required fields
export type ParameterObject = OpenAPIV3_2.ParameterObject & {
  name: string;
  in: ParameterLocation;
};
```

The intersection approach is strictly safe:

- Our strict type is a **subtype** of Scalar's permissive type — any value of our type is assignable to Scalar's type
- Existing code that accesses `.name` without undefined checks continues to compile
- Code that passes a Scalar `ParameterObject` (optional `name`) to our strict `ParameterObject` gets a type error — which is the safety we want

## Consequences

### Positive

- **Preserves compile-time strictness** — spec-required fields cannot be accessed without existence guarantee
- **Single import source** — all codebase files import from one central module; import path changes are one-time and mechanical
- **Minimal maintenance** — only ~8 narrowings, not a full type redefinition; all other types pass through unchanged
- **Spec-correct** — narrowings match exactly what the OAS specification mandates

### Negative

- **Not protocol-level enforcement** — this is compile-time only; runtime validation of incoming documents is a separate concern (handled by Scalar's parser and our IR validators)
- **Coupling to Scalar's structure** — if Scalar significantly restructures their type namespaces, we'd need to update the re-export module

## Alternatives Considered

1. **Use Scalar types directly everywhere** — loses all compile-time strictness for spec-required fields
2. **Build complete strict type definitions from scratch** — enormous maintenance burden; redefining ~40+ interfaces for no gain over intersection narrowing
3. **Use TypeScript `Required<Pick<>>` utility types** — more verbose, less readable, same effect as intersection narrowing
