/**
 * TypeScript Writer - Unsupported Keyword Guards.
 *
 * Fail-fast rejection for IR keywords that cannot be represented
 * in TypeScript output. Silent omission is a doctrine violation.
 *
 * @module type-writer.fail-fast
 * @internal
 */

import type { CastrSchema } from '../../ir/index.js';
import { getIntegerSemantics } from '../../ir/index.js';
import { parseComponentRef } from '../../../shared/ref-resolution.js';

/**
 * Reject unsupported 2020-12 object keywords.
 *
 * Called before writing an object type to ensure no IR keywords
 * are silently dropped from the output.
 *
 * @internal
 */
export function rejectUnsupportedObjectKeywords(schema: CastrSchema): void {
  if (schema.patternProperties !== undefined) {
    throw new Error(
      'Unsupported IR pattern: patternProperties cannot be represented in TypeScript. ' +
        'TypeScript has no equivalent for regex-keyed property schemas.',
    );
  }
  if (schema.propertyNames !== undefined) {
    throw new Error(
      'Unsupported IR pattern: propertyNames cannot be represented in TypeScript. ' +
        'TypeScript has no equivalent for property name validation schemas.',
    );
  }
  if (schema.dependentSchemas !== undefined) {
    throw new Error(
      'Unsupported IR pattern: dependentSchemas cannot be represented in TypeScript. ' +
        'TypeScript has no equivalent for conditional schema requirements.',
    );
  }
  if (schema.dependentRequired !== undefined) {
    throw new Error(
      'Unsupported IR pattern: dependentRequired cannot be represented in TypeScript. ' +
        'TypeScript has no equivalent for conditional required properties.',
    );
  }
  if (
    schema.unevaluatedProperties !== undefined &&
    typeof schema.unevaluatedProperties !== 'boolean'
  ) {
    throw new Error(
      'Unsupported IR pattern: schema-valued unevaluatedProperties cannot be represented in TypeScript. ' +
        'Only boolean unevaluatedProperties is supported.',
    );
  }
}

/**
 * Reject unsupported 2020-12 array keywords.
 *
 * Called before writing an array type to ensure no IR keywords
 * are silently dropped from the output.
 *
 * @internal
 */
export function rejectUnsupportedArrayKeywords(schema: CastrSchema): void {
  if (schema.unevaluatedItems !== undefined) {
    throw new Error(
      'Unsupported IR pattern: unevaluatedItems cannot be represented in TypeScript. ' +
        'TypeScript has no equivalent for unevaluated item validation.',
    );
  }
  if (schema.minContains !== undefined) {
    throw new Error(
      'Unsupported IR pattern: minContains cannot be represented in TypeScript. ' +
        'TypeScript has no equivalent for contains-based validation.',
    );
  }
  if (schema.maxContains !== undefined) {
    throw new Error(
      'Unsupported IR pattern: maxContains cannot be represented in TypeScript. ' +
        'TypeScript has no equivalent for contains-based validation.',
    );
  }
  if (schema.contains !== undefined) {
    throw new Error(
      'Unsupported IR pattern: contains cannot be represented in TypeScript. ' +
        'TypeScript has no equivalent for contains-based validation.',
    );
  }
}

// ---------------------------------------------------------------------------
// Union Deduplication — type string resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a schema to its TypeScript type string for deduplication.
 *
 * Lightweight string representation used to detect and remove duplicate
 * types in unions (e.g., `number | number | number` → `number`).
 *
 * @internal
 */
export function resolveSchemaTypeString(schema: CastrSchema): string {
  return (
    resolveRefTypeString(schema) ??
    resolveCompositionTypeString(schema) ??
    resolvePrimitiveTypeString(schema)
  );
}

function resolveRefTypeString(schema: CastrSchema): string | undefined {
  if (!schema.$ref) {
    return undefined;
  }
  const { componentName } = parseComponentRef(schema.$ref);
  return componentName;
}

function resolveCompositionTypeString(schema: CastrSchema): string | undefined {
  if (schema.allOf) {
    return schema.allOf.map((s) => resolveSchemaTypeString(s)).join(' & ');
  }
  const unionMembers = schema.oneOf ?? schema.anyOf;
  if (unionMembers) {
    return unionMembers.map((s) => resolveSchemaTypeString(s)).join(' | ');
  }
  return undefined;
}

function resolveScalarTypeToken(schema: CastrSchema): string | undefined {
  if (getIntegerSemantics(schema) !== undefined) {
    return 'bigint';
  }
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    default:
      return undefined;
  }
}

function resolvePrimitiveTypeString(schema: CastrSchema): string {
  const scalarTypeToken = resolveScalarTypeToken(schema);
  if (scalarTypeToken !== undefined) {
    return scalarTypeToken;
  }
  switch (schema.type) {
    case 'array':
      return resolveArrayTypeString(schema);
    case 'object':
      return resolveObjectTypeString(schema);
    default:
      return 'unknown';
  }
}

function resolveObjectTypeString(schema: CastrSchema): string {
  if (!schema.properties) {
    return 'object';
  }
  const keys = [...schema.properties.keys()].sort((a, b) => a.localeCompare(b));
  return `{${keys.join(',')}}`;
}

function resolveArrayTypeString(schema: CastrSchema): string {
  if (schema.prefixItems !== undefined) {
    return `[${schema.prefixItems.map((s) => resolveSchemaTypeString(s)).join(', ')}]`;
  }
  if (schema.items && !Array.isArray(schema.items)) {
    return `${resolveSchemaTypeString(schema.items)}[]`;
  }
  return 'unknown[]';
}
