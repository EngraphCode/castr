# OAS 3.2 Type Migration (Phase A₂)

This plan defines the type migration strategy to replace `openapi3-ts` with `@scalar/openapi-types` via a strict re-export module, fulfilling Phase A₂ of the OAS 3.2 Full Feature Support workstream.

**ADRs:** [ADR-044](../../docs/architectural_decision_records/ADR-044-drop-openapi3-ts-adopt-scalar-types.md), [ADR-045](../../docs/architectural_decision_records/ADR-045-strict-reexport-module-openapi-types.md)

## Goal

- Drop the `openapi3-ts` dependency.
- Create a strict re-export module using `@scalar/openapi-types` `OpenAPIV3_2` types.
- Ensure the 6 logically required fields according to the OAS spec remain strictly required via TypeScript intersection narrowing, overcoming Scalar's fully-optional types constraint.

## User Review Required

> [!CAUTION]
> Breaking Change: This migration changes the core types yielded by our public APIs (e.g. `CastrSchema.metadata`). If downstream systems relied on our exports being strictly `openapi3-ts` instances, they'll now receive structural equivalents based on `@scalar/openapi-types`. Note that we have no external users, only internal dependencies within the repo.

> [!WARNING]
> Does the removal of `openapi-schema-extensions.d.ts` impact any dependent workspaces running in a unified monorepo context?

## Proposed Changes

### 1. New File: Re-export Module

#### [NEW] `lib/src/shared/openapi-types.ts`

We will create this module to provide the core types for the codebase. It does the following:

- Imports `OpenAPIV3_2`, `OpenAPIV3_1` from `@scalar/openapi-types`.
- Exports all commonly used types like `SchemaObject`, `OperationObject`, `PathItemObject`, `ReferenceObject`, `MediaTypeObject`, `XMLObject`.
- Maps and aliases specific differences:
  - `export type OpenAPIDocument = OpenAPIV3_2.Document;`
  - `export type SchemaObjectType = OpenAPIV3_2.NonArraySchemaObjectType | OpenAPIV3_2.ArraySchemaObjectType;`
- Restores specification strictness on the 6 key interfaces using intersections:

  ```typescript
  export type ParameterObject = OpenAPIV3_2.ParameterObject & {
    name: string;
    in: OpenAPIV3_2.ParameterLocation;
  };
  export type RequestBodyObject = OpenAPIV3_2.RequestBodyObject & {
    content: Record<string, OpenAPIV3_2.MediaTypeObject>;
  };
  export type ResponseObject = OpenAPIV3_2.ResponseObject & { description: string };
  export type TagObject = OpenAPIV3_2.TagObject & { name: string };
  export type DiscriminatorObject = OpenAPIV3_2.DiscriminatorObject & { propertyName: string };
  export type ExternalDocumentationObject = OpenAPIV3_1.ExternalDocumentationObject & {
    url: string;
  };
  ```

- Implements and exports a compatible runtime guard:

  ```typescript
  export function isReferenceObject(obj: unknown): obj is OpenAPIV3_2.ReferenceObject {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      '$ref' in obj &&
      typeof (obj as Record<string, unknown>).$ref === 'string'
    );
  }
  ```

---

### 2. File Removals

#### [DELETE] `lib/src/schema-processing/conversion/json-schema/openapi-schema-extensions.d.ts`

- Removes the local module augmentation for `openapi3-ts`, as Scalar's schemas already include `$vocabulary`, `$dynamicRef`, `$dynamicAnchor`, `unevaluatedItems`, `unevaluatedProperties`, and `dependentSchemas` via the `BaseSchemaObject`.

#### [MODIFY] `lib/package.json`

- Removes `openapi3-ts` from `dependencies`.

---

### 3. Global Import Migration

#### [MODIFY] `lib/src/**/*.ts` (Approx. 50 files)

- Replace all `import { ... } from 'openapi3-ts/oas31'` with relative imports to `src/shared/openapi-types.js`.
- Replace instances of `OpenAPIObject` with `OpenAPIDocument`.
- Replace instances of `XmlObject` with `XMLObject`.

---

### 4. Doctrine Update

#### [MODIFY] `.agent/directives/principles.md` (requires explicit user approval)

- Replace 6 references to `openapi3-ts/oas31` with the new canonical import path (`src/shared/openapi-types.js`)
- Update ADR-002 references to note supersession by ADR-044
- Update code examples that import from `openapi3-ts`

---

## Pitfalls & Edge Cases Explored

1. **Covariant Compatibility in Builder/Parser boundaries**: Since Scalar allows all properties to be optional, passing our strictly-narrowed types back into external tools (like `@scalar/openapi-parser`) should be type-safe (TypeScript structural typing accepts properties that are stricter than required). So `CastrParameter` generating a `ParameterObject` with a strictly required `name` will smoothly flow into Scalar logic.
2. **Missing `ExternalDocumentationObject` in `OpenAPIV3_2`**: Scalar defines `ExternalDocumentationObject` in `OpenAPIV3` and doesn't explicitly repeat it continuously. We must bridge it carefully using `OpenAPIV3_1.ExternalDocumentationObject` (inherited in the Scalar module).
3. **Array Parsing logic**: `openapi3-ts`'s `SchemaObjectType` allowed us to do simple enum switching. The new alias `SchemaObjectType` will behave identically as it unifies Scalar's Array and NonArray targets.
4. **`isReferenceObject` Validation**: Our manual `isReferenceObject` function needs to cover all the exact edge-cases that the library provided version did to prevent failing tests.

## Verification Plan

### Automated Tests

- Run `pnpm qg` which involves:
  - `pnpm type-check`: Will strictly assert that our interface narrowings haven't broken TS validation on boundary values.
  - `pnpm test`: Ensures parsing engines retain structural parity and the `isReferenceObject` function is sound.
  - `pnpm knip`: Asserts `openapi3-ts` is entirely unreferenced and ready for eviction.
  - Snapshot + e2e tests ensure generated artifact integrity isn't impaired by the new internal representation logic.

### Manual Verification

- We don't perform actual code generation modifications in Phase A₂, so ensuring a clean zero-error exit from `pnpm qg` covers the exact specification requirement.
