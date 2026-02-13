import type { ReferenceObject } from 'openapi3-ts/oas31';

declare module 'openapi3-ts/oas31' {
  interface SchemaObject {
    $vocabulary?: Record<string, unknown>;
    $dynamicRef?: string;
    $dynamicAnchor?: string;
    unevaluatedItems?: SchemaObject | ReferenceObject | boolean;
    unevaluatedProperties?: SchemaObject | ReferenceObject | boolean;
    dependentSchemas?: Record<string, SchemaObject | ReferenceObject>;
  }
}
