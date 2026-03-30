/**
 * IR Builder - JSON Schema 2020-12 Keywords
 *
 * Extracts JSON Schema 2020-12 keywords that are valid in OpenAPI 3.1
 * but not yet included in openapi3-ts types.
 *
 * @module ir-builder.json-schema-2020-12
 * @internal
 */

import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import type { CastrSchema } from '../../../ir/index.js';
import type { IRBuildContext } from '../builder.types.js';

/**
 * Extended SchemaObject with JSON Schema 2020-12 keywords.
 *
 * The openapi3-ts/oas31 types don't include all JSON Schema 2020-12 keywords
 * that are valid in OpenAPI 3.1. This type extends SchemaObject with the
 * missing keywords for runtime extraction.
 *
 * @internal
 */
export type ExtendedSchemaObject = SchemaObject & {
  dependentRequired?: Record<string, string[]>;
  dependentSchemas?: Record<string, SchemaObject | ReferenceObject>;
  minContains?: number;
  maxContains?: number;
  patternProperties?: Record<string, SchemaObject | ReferenceObject>;
  propertyNames?: SchemaObject | ReferenceObject;
  contains?: SchemaObject | ReferenceObject;
  $anchor?: string;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
};

/**
 * Build function type for recursive schema building.
 * @internal
 */
export type BuildCastrSchemaFn = (
  schema: SchemaObject | ReferenceObject,
  context: IRBuildContext,
) => CastrSchema;

/**
 * Add OpenAPI extensions and JSON Schema 2020-12 keywords.
 *
 * Extracts fields not handled by other add* functions:
 * - xml, externalDocs (OAS extensions)
 * - prefixItems, unevaluatedProperties, unevaluatedItems (JSON Schema 2020-12)
 * - dependentSchemas, dependentRequired, minContains, maxContains (JSON Schema 2020-12)
 *
 * @internal
 */
export function addOpenAPIExtensions(
  schema: ExtendedSchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildFn: BuildCastrSchemaFn,
): void {
  // Simple fields (no recursion needed)
  if (schema.xml) {
    irSchema.xml = schema.xml;
  }
  if (schema.externalDocs) {
    irSchema.externalDocs = schema.externalDocs;
  }
  if (schema.dependentRequired) {
    irSchema.dependentRequired = schema.dependentRequired;
  }
  if (schema.minContains !== undefined) {
    irSchema.minContains = schema.minContains;
  }
  if (schema.maxContains !== undefined) {
    irSchema.maxContains = schema.maxContains;
  }

  // Recursive fields (require buildCastrSchema calls)
  addPrefixItems(schema, context, irSchema, buildFn);
  addUnevaluatedProperties(schema, context, irSchema, buildFn);
  addUnevaluatedItems(schema, context, irSchema, buildFn);
  addDependentSchemas(schema, context, irSchema, buildFn);
  addPatternProperties(schema, context, irSchema, buildFn);
  addPropertyNames(schema, context, irSchema, buildFn);
  addContains(schema, context, irSchema, buildFn);

  // Anchor/dynamic reference keywords (simple string pass-through)
  addAnchorKeywords(schema, irSchema);
}

/**
 * Add $anchor, $dynamicRef, $dynamicAnchor (JSON Schema 2020-12).
 * Simple string pass-through — no recursion needed.
 * @internal
 */
function addAnchorKeywords(schema: ExtendedSchemaObject, irSchema: CastrSchema): void {
  if (schema.$anchor !== undefined) {
    irSchema.$anchor = schema.$anchor;
  }
  if (schema.$dynamicRef !== undefined) {
    irSchema.$dynamicRef = schema.$dynamicRef;
  }
  if (schema.$dynamicAnchor !== undefined) {
    irSchema.$dynamicAnchor = schema.$dynamicAnchor;
  }
}

/**
 * Add prefixItems (JSON Schema 2020-12 tuple validation).
 * @internal
 */
function addPrefixItems(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildFn: BuildCastrSchemaFn,
): void {
  if (!schema.prefixItems) {
    return;
  }

  irSchema.prefixItems = schema.prefixItems.map((itemSchema, index) => {
    const itemContext: IRBuildContext = {
      ...context,
      path: [...context.path, 'prefixItems', String(index)],
      required: false,
    };
    return buildFn(itemSchema, itemContext);
  });
}

/**
 * Add unevaluatedProperties (JSON Schema 2020-12).
 * @internal
 */
function addUnevaluatedProperties(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildFn: BuildCastrSchemaFn,
): void {
  if (schema.unevaluatedProperties === undefined) {
    return;
  }

  if (typeof schema.unevaluatedProperties === 'boolean') {
    irSchema.unevaluatedProperties = schema.unevaluatedProperties;
  } else {
    const unevalContext: IRBuildContext = {
      ...context,
      path: [...context.path, 'unevaluatedProperties'],
      required: false,
    };
    irSchema.unevaluatedProperties = buildFn(schema.unevaluatedProperties, unevalContext);
  }
}

/**
 * Add unevaluatedItems (JSON Schema 2020-12).
 * @internal
 */
function addUnevaluatedItems(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildFn: BuildCastrSchemaFn,
): void {
  if (schema.unevaluatedItems === undefined) {
    return;
  }

  if (typeof schema.unevaluatedItems === 'boolean') {
    irSchema.unevaluatedItems = schema.unevaluatedItems;
  } else {
    const unevalContext: IRBuildContext = {
      ...context,
      path: [...context.path, 'unevaluatedItems'],
      required: false,
    };
    irSchema.unevaluatedItems = buildFn(schema.unevaluatedItems, unevalContext);
  }
}

/**
 * Add dependentSchemas (JSON Schema 2020-12).
 * @internal
 */
function addDependentSchemas(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildFn: BuildCastrSchemaFn,
): void {
  if (!schema.dependentSchemas) {
    return;
  }

  const result: Record<string, CastrSchema> = {};

  for (const [propName, depSchema] of Object.entries(schema.dependentSchemas)) {
    const depContext: IRBuildContext = {
      ...context,
      path: [...context.path, 'dependentSchemas', propName],
      required: true,
    };
    result[propName] = buildFn(depSchema, depContext);
  }

  irSchema.dependentSchemas = result;
}

/**
 * Add patternProperties (JSON Schema 2020-12).
 * @internal
 */
function addPatternProperties(
  schema: ExtendedSchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildFn: BuildCastrSchemaFn,
): void {
  if (!schema.patternProperties) {
    return;
  }

  const result: Record<string, CastrSchema> = {};

  for (const [pattern, patternSchema] of Object.entries(schema.patternProperties)) {
    const patternContext: IRBuildContext = {
      ...context,
      path: [...context.path, 'patternProperties', pattern],
      required: false,
    };
    result[pattern] = buildFn(patternSchema, patternContext);
  }

  irSchema.patternProperties = result;
}

/**
 * Add propertyNames (JSON Schema 2020-12).
 * @internal
 */
function addPropertyNames(
  schema: ExtendedSchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildFn: BuildCastrSchemaFn,
): void {
  if (schema.propertyNames === undefined) {
    return;
  }

  const propNamesContext: IRBuildContext = {
    ...context,
    path: [...context.path, 'propertyNames'],
    required: false,
  };
  irSchema.propertyNames = buildFn(schema.propertyNames, propNamesContext);
}

/**
 * Add contains (JSON Schema 2020-12).
 * @internal
 */
function addContains(
  schema: ExtendedSchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildFn: BuildCastrSchemaFn,
): void {
  if (schema.contains === undefined) {
    return;
  }

  const containsContext: IRBuildContext = {
    ...context,
    path: [...context.path, 'contains'],
    required: false,
  };
  irSchema.contains = buildFn(schema.contains, containsContext);
}
