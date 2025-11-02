import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';

import type { PrimitiveSchemaType } from './utils.js';
import { isPrimitiveSchemaType } from './utils.js';
import {
  calculateCompositionComplexity,
  calculatePropertiesComplexity,
} from './schema-complexity.helpers.js';

type CompositeType =
  | 'oneOf'
  | 'anyOf'
  | 'allOf'
  | 'enum'
  | 'array'
  | 'empty-object'
  | 'object'
  | 'record';

export type ComplexityFn = (args: {
  current: number;
  schema: SchemaObject | ReferenceObject | undefined;
}) => number;

const complexityByType = (type: PrimitiveSchemaType): number => {
  return type === 'string' ||
    type === 'number' ||
    type === 'integer' ||
    type === 'boolean' ||
    type === 'null'
    ? 1
    : 0;
};

/**
 * Complexity values for composite schema types
 */
const COMPOSITE_COMPLEXITY_MAP: Record<CompositeType, number> = {
  oneOf: 2,
  anyOf: 3,
  allOf: 2,
  enum: 1,
  array: 1,
  record: 1,
  'empty-object': 1,
  object: 2,
};

export function complexityByComposite(from?: CompositeType): number {
  if (!from) {
    return 0;
  }
  return COMPOSITE_COMPLEXITY_MAP[from] ?? 0;
}

/**
 * Handle reference object schema - adds fixed complexity for references
 */
export function handleReferenceSchema(current: number): number {
  return current + 2;
}

/**
 * Handle null type schema - adds type complexity
 */
export function handleNullTypeSchema(current: number): number {
  return current + complexityByType('null');
}

/**
 * Handle composition schema (oneOf, anyOf, allOf)
 */
export function handleCompositionSchema(
  schema: SchemaObject,
  compositionType: 'oneOf' | 'anyOf' | 'allOf',
  current: number,
  getSchemaComplexity: ComplexityFn,
): number {
  const schemas = schema[compositionType];
  if (!schemas) {
    return current;
  }

  return calculateCompositionComplexity(
    schemas,
    compositionType,
    current,
    complexityByComposite,
    getSchemaComplexity,
  );
}

/**
 * Handle enum without explicit type (e.g., { enum: ["a", "b"] })
 */
export function handleEnumWithoutType(current: number): number {
  return current + complexityByComposite('enum') + 1;
}

/**
 * Handle primitive schema type with optional enum
 */
export function handlePrimitiveSchema(schema: SchemaObject, current: number): number {
  if (!isPrimitiveSchemaType(schema.type)) {
    return current;
  }

  const baseComplexity = complexityByType(schema.type);
  if (schema.enum) {
    return current + baseComplexity + complexityByComposite('enum');
  }

  return current + baseComplexity;
}

/**
 * Handle array schema type
 */
export function handleArraySchema(
  schema: SchemaObject,
  current: number,
  getSchemaComplexity: ComplexityFn,
): number {
  if (schema.type !== 'array') {
    return current;
  }

  const arrayComplexity = complexityByComposite('array');
  if (schema.items) {
    return arrayComplexity + getSchemaComplexity({ current, schema: schema.items });
  }

  return arrayComplexity + getSchemaComplexity({ current, schema: undefined });
}

/**
 * Handle object schema type (properties, additionalProperties, empty)
 */
export function handleObjectSchema(
  schema: SchemaObject,
  current: number,
  getSchemaComplexity: ComplexityFn,
): number {
  const isObjectType = schema.type === 'object' || schema.properties || schema.additionalProperties;
  if (!isObjectType) {
    return current;
  }

  if (schema.additionalProperties) {
    if (schema.additionalProperties === true) {
      return complexityByComposite('record') + getSchemaComplexity({ current, schema: undefined });
    }

    return (
      complexityByComposite('record') +
      getSchemaComplexity({ current, schema: schema.additionalProperties })
    );
  }

  if (schema.properties) {
    return calculatePropertiesComplexity(
      schema.properties,
      current,
      complexityByComposite,
      getSchemaComplexity,
    );
  }

  return (
    complexityByComposite('empty-object') + getSchemaComplexity({ current, schema: undefined })
  );
}

/**
 * Try composition handlers in order (oneOf, anyOf, allOf)
 * Returns the first non-default result, or current if none match
 */
export function tryCompositionHandlers(
  schema: SchemaObject,
  current: number,
  getSchemaComplexity: ComplexityFn,
): number {
  for (const compositionType of ['oneOf', 'anyOf', 'allOf'] as const) {
    const result = handleCompositionSchema(schema, compositionType, current, getSchemaComplexity);
    if (result !== current) {
      return result;
    }
  }
  return current;
}

/**
 * Try all schema type handlers in sequence
 * Returns the first non-default result, or current if none match
 */
export function trySchemaTypeHandlers(
  schema: SchemaObject,
  current: number,
  getSchemaComplexity: ComplexityFn,
): number {
  // Handle null type
  if (schema.type === 'null') {
    return handleNullTypeSchema(current);
  }

  // Handle composition types (oneOf, anyOf, allOf)
  const compositionResult = tryCompositionHandlers(schema, current, getSchemaComplexity);
  if (compositionResult !== current) {
    return compositionResult;
  }

  // Handle enum without explicit type BEFORE early return
  if (schema.enum && !schema.type) {
    return handleEnumWithoutType(current);
  }

  // Early return if no type
  if (!schema.type) {
    return current;
  }

  // Handle primitive types (with optional enum)
  const primitiveResult = handlePrimitiveSchema(schema, current);
  if (primitiveResult !== current) {
    return primitiveResult;
  }

  // Handle array type
  const arrayResult = handleArraySchema(schema, current, getSchemaComplexity);
  if (arrayResult !== current) {
    return arrayResult;
  }

  // Handle object type (properties, additionalProperties, empty)
  return handleObjectSchema(schema, current, getSchemaComplexity);
}
