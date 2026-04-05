# ADR-045: Strict Re-export Module for OpenAPI Types

**Date:** 2026-04-03  
**Status:** Accepted  
**Related:** [ADR-044](./ADR-044-drop-openapi3-ts-adopt-scalar-types.md) (Drop openapi3-ts)

---

## Context

`@scalar/openapi-types` makes all fields optional across all interfaces. This is a deliberate design choice: Scalar's types are intended for user-input tolerance (partially constructed documents being edited, validated, or upgraded).

However, the OAS specification explicitly REQUIRES certain fields on 6 interfaces:

| Type                          | Required Fields                            | OAS Spec Reference   |
| ----------------------------- | ------------------------------------------ | -------------------- |
| `ParameterObject`             | `name: string`, `in: ParameterLocation`    | §4.8.12 Fixed Fields |
| `RequestBodyObject`           | `content: Record<string, MediaTypeObject>` | §4.8.13 Fixed Fields |
| `ResponseObject`              | `description: string`                      | §4.8.17 Fixed Fields |
| `ExternalDocumentationObject` | `url: string`                              | §4.8.11 Fixed Fields |
| `TagObject`                   | `name: string`                             | §4.8.22 Fixed Fields |
| `DiscriminatorObject`         | `propertyName: string`                     | §4.8.25 Fixed Fields |

After parsing and validation, Castr operates on documents that have already been validated. Allowing these fields to remain optional in our type system would silently widen the contract and require defensive null checks everywhere — violating the fail-fast and strict-by-default principles.

## Decision

Create a single re-export module at `lib/src/shared/openapi-types.ts` that:

1. Imports from `@scalar/openapi-types` `OpenAPIV3_2` (and `OpenAPIV3_1` where needed for inherited types)
2. Re-exports all commonly used types as convenient aliases
3. Applies TypeScript intersection narrowing on the 6 types above to restore spec-required fields
4. Provides a local `isReferenceObject` runtime guard (replacing the one previously imported from `openapi3-ts`)

All codebase imports of OpenAPI types MUST route through this module. Direct imports from `@scalar/openapi-types` are forbidden in product code.

## Consequences

### Positive

- Spec-required fields are enforced at compile time — no defensive null checks needed downstream
- Single file to update if `@scalar/openapi-types` API changes
- Covariant compatibility: our stricter types are structurally assignable to Scalar's looser types, so passing our objects to Scalar APIs (e.g., `@scalar/openapi-parser`) works without assertion
- Clean migration path: consumers just change their import path

### Negative

- One additional layer of indirection between product code and the type source
- The intersection narrowing list must be maintained manually if the OAS spec adds required fields to more types in future versions

### Risks

- If Scalar renames or restructures its `OpenAPIV3_2` namespace, the re-export module absorbs the blast radius. This is a feature, not a risk.
