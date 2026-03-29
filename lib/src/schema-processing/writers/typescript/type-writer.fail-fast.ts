/**
 * TypeScript Writer - Genuinely Impossible Keyword Guards.
 *
 * Fail-fast rejection for IR keywords that CANNOT be represented
 * in TypeScript output. These are genuine impossibilities — the
 * TypeScript type system has no mechanism for these semantics.
 *
 * Per the Input-Output Pair Compatibility Model: fail-fast is
 * reserved for genuinely impossible output mappings only.
 *
 * @module type-writer.fail-fast
 * @internal
 */

import type { CastrSchema } from '../../ir/index.js';
import { getIntegerSemantics } from '../../ir/index.js';
import { parseComponentRef } from '../../../shared/ref-resolution.js';

/**
 * Reject genuinely impossible 2020-12 object keywords.
 *
 * Called before writing an object type to ensure no IR keywords
 * are silently dropped from the output.
 *
 * @internal
 */
export function rejectUnsupportedObjectKeywords(schema: CastrSchema): void {
  rejectConditionalApplicators(schema);
  if (schema.patternProperties !== undefined) {
    throw new Error(
      'Genuinely impossible: patternProperties cannot be represented in TypeScript. ' +
        'TypeScript has no regex-keyed index signatures — property names are ' +
        'statically declared, not dynamically matched by pattern.',
    );
  }
  if (schema.propertyNames !== undefined) {
    throw new Error(
      'Genuinely impossible: propertyNames cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for constraining property name values ' +
        '(e.g., minLength, pattern, enum) at the type level.',
    );
  }
  if (schema.dependentSchemas !== undefined) {
    throw new Error(
      'Genuinely impossible: dependentSchemas cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "when property X is present, apply schema Y" ' +
        'conditional validation at the type level.',
    );
  }
  if (schema.dependentRequired !== undefined) {
    throw new Error(
      'Genuinely impossible: dependentRequired cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "when property X is present, properties [Y, Z] ' +
        'become required" conditional requirements at the type level.',
    );
  }
  if (
    schema.unevaluatedProperties !== undefined &&
    typeof schema.unevaluatedProperties !== 'boolean'
  ) {
    throw new Error(
      'Genuinely impossible: schema-valued unevaluatedProperties cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for tracking which properties were "evaluated" by ' +
        'composition keywords and validating the remainder against a schema.',
    );
  }
}

function rejectConditionalApplicators(schema: CastrSchema): void {
  if (schema.if !== undefined || schema.then !== undefined || schema.else !== undefined) {
    throw new Error(
      'Genuinely impossible: if/then/else conditional applicators cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "validate against sub-schema A; if it passes apply B, ' +
        'otherwise apply C" runtime conditional logic at the type level.',
    );
  }
}

/**
 * Reject genuinely impossible 2020-12 array keywords.
 *
 * Called before writing an array type to ensure no IR keywords
 * are silently dropped from the output.
 *
 * @internal
 */
export function rejectUnsupportedArrayKeywords(schema: CastrSchema): void {
  if (schema.unevaluatedItems !== undefined) {
    throw new Error(
      'Genuinely impossible: unevaluatedItems cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for tracking which array items were "evaluated" by ' +
        'prefixItems/items and validating the remainder.',
    );
  }
  if (schema.minContains !== undefined) {
    throw new Error(
      'Genuinely impossible: minContains cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "at least N items must match schema X" ' +
        'count-based array validation at the type level.',
    );
  }
  if (schema.maxContains !== undefined) {
    throw new Error(
      'Genuinely impossible: maxContains cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "at most N items must match schema X" ' +
        'count-based array validation at the type level.',
    );
  }
  if (schema.contains !== undefined) {
    throw new Error(
      'Genuinely impossible: contains cannot be represented in TypeScript. ' +
        'TypeScript has no mechanism for "at least one array element must match schema X" ' +
        'existential validation at the type level.',
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
