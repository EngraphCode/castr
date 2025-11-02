/**
 * Pure helper functions for converting OpenAPI schemas to TypeScript types
 * Extracted from openApiToTypescript.ts to reduce cognitive complexity
 *
 * Each function has a single responsibility and is < 50 lines
 */

import { type ReferenceObject, type SchemaObject } from 'openapi3-ts/oas30';

import type { TsConversionContext } from './openApiToTypescript.js';
import { getSchemaFromComponents } from './component-access.js';
import {
  handleBasicPrimitive,
  handlePrimitiveEnum,
  isPrimitiveSchemaType,
  type PrimitiveSchemaType,
} from './openApiToTypescript.helpers.primitives.js';

/**
 * Extract schema name from a component schema $ref
 */
const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    throw new Error(`Invalid schema $ref: ${ref}`);
  }
  return name;
};

// Re-export primitives for backward compatibility
export {
  handleBasicPrimitive,
  handlePrimitiveEnum,
  isPrimitiveSchemaType,
  type PrimitiveSchemaType,
};

/**
 * Resolve and validate schema from $ref
 * @internal
 */
function resolveSchemaFromRef(
  ref: string,
  schemaName: string,
  ctx: Required<Pick<TsConversionContext, 'doc' | 'visitedRefs'>>,
  resolveRecursively: (schema: SchemaObject) => unknown,
): void {
  const actualSchema = getSchemaFromComponents(ctx.doc, schemaName);
  if (!actualSchema) {
    throw new Error(`Schema ${ref} not found`);
  }

  // Nested $refs are VALID per OpenAPI spec, but we require preprocessing.
  // This is an intentional design choice: dereferencing is SwaggerParser's job,
  // code generation is our job. Fail fast with clear error directing users to
  // the correct preprocessing workflow. See: .agent/analysis/NESTED_REFS_ANALYSIS.md
  if ('$ref' in actualSchema) {
    throw new Error(
      `Nested $ref found: ${ref} -> ${actualSchema.$ref}. Use SwaggerParser.bundle() to dereference before passing the spec to this library.`,
    );
  }

  ctx.visitedRefs[ref] = true;
  resolveRecursively(actualSchema);
}

/**
 * Resolve reference: get schema name, check for circular refs, and resolve if needed
 * @internal
 */
function resolveReference(
  ref: string,
  ctx: Required<Pick<TsConversionContext, 'doc' | 'visitedRefs'>> & {
    nodeByRef: TsConversionContext['nodeByRef'];
  },
  resolveRecursively: (schema: SchemaObject) => unknown,
): string {
  const schemaName = getSchemaNameFromRef(ref);

  // Check if we're in a circular reference - return early if already visited
  if (ctx.visitedRefs[ref]) {
    return schemaName;
  }

  // Resolve the actual schema if not yet resolved
  const result = ctx.nodeByRef[ref];
  if (!result) {
    resolveSchemaFromRef(ref, schemaName, ctx, resolveRecursively);
  }

  return schemaName;
}

/**
 * Handles OpenAPI $ref objects, returning the referenced schema name
 * MIGRATED: Now returns string (schema name) instead of tanu reference node
 */
export function handleReferenceObject(
  schema: ReferenceObject,
  ctx: TsConversionContext | undefined,
  resolveRecursively: (schema: SchemaObject) => unknown,
): string {
  if (!ctx?.visitedRefs || !ctx?.doc) {
    throw new Error('Context is required for OpenAPI $ref');
  }

  // After the check, we know ctx.doc and ctx.visitedRefs are defined
  // Create a properly typed context object that satisfies resolveReference requirements
  const ctxWithRequired: Required<Pick<TsConversionContext, 'doc' | 'visitedRefs'>> & {
    nodeByRef: TsConversionContext['nodeByRef'];
  } = {
    doc: ctx.doc,
    visitedRefs: ctx.visitedRefs,
    nodeByRef: ctx.nodeByRef,
  };

  return resolveReference(schema.$ref, ctxWithRequired, resolveRecursively);
}

/**
 * Determines if a property is required in an object schema
 */
export function isPropertyRequired(
  propName: string,
  schema: SchemaObject,
  isPartial: boolean,
): boolean {
  return Boolean(isPartial ? true : schema.required?.includes(propName));
}

/**
 * Determines the type for additionalProperties
 * Returns string-based TypeScript type expression
 */
export function resolveAdditionalPropertiesType(
  additionalProperties: SchemaObject['additionalProperties'],
  convertSchema: (schema: SchemaObject | ReferenceObject) => string,
): string | undefined {
  if (!additionalProperties) {
    return undefined;
  }

  // Boolean true or empty object means any type
  if (
    (typeof additionalProperties === 'boolean' && additionalProperties) ||
    (typeof additionalProperties === 'object' && Object.keys(additionalProperties).length === 0)
  ) {
    return 'any';
  }

  // Specific schema for additional properties
  if (typeof additionalProperties === 'object') {
    return convertSchema(additionalProperties);
  }

  return undefined;
}

// Re-export composition helpers for backward compatibility
export {
  convertSchemasToTypes,
  handleAnyOf,
  handleArraySchema,
  handleOneOf,
} from './openApiToTypescript.helpers.composition.js';

// Re-export type array helpers for backward compatibility
export { handleTypeArray } from './openApiToTypescript.helpers.type-array.js';
