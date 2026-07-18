/**
 * Shared JSON Schema core field writers.
 *
 * Format-agnostic functions that populate a {@link JsonSchemaObject} from
 * CastrSchema IR nodes.  Used by the OpenAPI writer and JSON Schema writer.
 *
 * JSON Schema 2020-12 extension keywords live in the companion module
 * `json-schema-2020-12-fields.ts`.
 *
 * @internal
 */

import type { CastrSchema } from '../../ir/index.js';
import { isObjectSchemaType } from '../../ir/index.js';
import type {
  JsonSchemaObject,
  WriteBooleanCapableSchemaFn,
  WriteSchemaFn,
} from './json-schema-object.js';
import { isSchemaObjectType } from './json-schema-object.js';
import { writeAccessMetadata, writeCoreMetadata } from './json-schema-fields.metadata.js';
import {
  writeJsonSchema2020SimpleFields,
  writeJsonSchema2020RecursiveFields,
} from './json-schema-2020-12-fields.js';

// Re-export for convenience
export type {
  JsonSchemaObject,
  WriteBooleanCapableSchemaFn,
  WriteSchemaFn,
} from './json-schema-object.js';
export { isSchemaObjectType } from './json-schema-object.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSortedPropertyEntries(schema: CastrSchema): [string, CastrSchema][] {
  if (schema.properties === undefined) {
    return [];
  }
  return [...schema.properties.entries()].sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey),
  );
}

// ---------------------------------------------------------------------------
// Core field writers
// ---------------------------------------------------------------------------

/**
 * Write the `type` field, folding nullable into a type array.
 * @internal
 */
export function writeTypeField(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.type === undefined) {
    return;
  }
  if (schema.metadata.nullable && isSchemaObjectType(schema.type)) {
    result.type = [schema.type, 'null'];
  } else {
    result.type = schema.type;
  }
}

/**
 * Write string-constraint fields (including contentEncoding/contentMediaType).
 * @internal
 */
export function writeStringFields(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.format !== undefined) {
    result.format = schema.format;
  }
  if (schema.minLength !== undefined) {
    result.minLength = schema.minLength;
  }
  if (schema.maxLength !== undefined) {
    result.maxLength = schema.maxLength;
  }
  if (schema.pattern !== undefined) {
    result.pattern = schema.pattern;
  }
  if (schema.contentEncoding !== undefined) {
    result.contentEncoding = schema.contentEncoding;
  }
  if (schema.contentMediaType !== undefined) {
    result.contentMediaType = schema.contentMediaType;
  }
}

/**
 * Write number-constraint fields.
 *
 * Boolean Draft-04-style `exclusiveMinimum`/`exclusiveMaximum` are
 * normalised to the numeric 2020-12 form using the companion
 * `minimum`/`maximum` (which is then suppressed), or rejected when no
 * companion bound exists — never silently dropped.
 *
 * @internal
 */
export function writeNumberFields(schema: CastrSchema, result: JsonSchemaObject): void {
  const exclusiveMinimum = normaliseExclusiveBound(
    schema.minimum,
    schema.exclusiveMinimum,
    'minimum',
    'exclusiveMinimum',
  );
  const exclusiveMaximum = normaliseExclusiveBound(
    schema.maximum,
    schema.exclusiveMaximum,
    'maximum',
    'exclusiveMaximum',
  );

  // Boolean exclusive:true consumes its companion bound during promotion.
  if (schema.minimum !== undefined && schema.exclusiveMinimum !== true) {
    result.minimum = schema.minimum;
  }
  if (schema.maximum !== undefined && schema.exclusiveMaximum !== true) {
    result.maximum = schema.maximum;
  }
  if (exclusiveMinimum !== undefined) {
    result.exclusiveMinimum = exclusiveMinimum;
  }
  if (exclusiveMaximum !== undefined) {
    result.exclusiveMaximum = exclusiveMaximum;
  }
  if (schema.multipleOf !== undefined) {
    result.multipleOf = schema.multipleOf;
  }
}

/**
 * Normalise one exclusive bound to its numeric 2020-12 form.
 *
 * - numeric: already 2020-12 — returned unchanged
 * - `true` with companion bound: promoted to that numeric value (Draft-04 form)
 * - `true` without companion bound: fail-fast — there is no numeric form
 * - `false` or absent: no exclusive bound (Draft-04 inclusive default)
 *
 * @internal
 */
function normaliseExclusiveBound(
  bound: number | undefined,
  exclusive: number | boolean | undefined,
  boundKey: 'minimum' | 'maximum',
  exclusiveKey: 'exclusiveMinimum' | 'exclusiveMaximum',
): number | undefined {
  if (typeof exclusive === 'number') {
    return exclusive;
  }
  if (exclusive === true) {
    if (bound === undefined) {
      throw new Error(
        `Cannot write boolean ${exclusiveKey}: true without a companion ${boundKey}: ` +
          'there is no numeric 2020-12 form to normalise it to. ' +
          `Provide a numeric ${boundKey}, or use the numeric ${exclusiveKey} form directly.`,
      );
    }
    return bound;
  }
  return undefined;
}

/**
 * Write the `additionalProperties` field.
 *
 * Under IDENTITY doctrine, all objects are closed-world with explicit
 * properties. Always emits `additionalProperties: false`.
 *
 * @internal
 */
function writeAdditionalProperties(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.additionalProperties === false) {
    result.additionalProperties = false;
    return;
  }

  // Closed-world default: all object schemas get additionalProperties: false
  if (schema.properties !== undefined || isObjectSchemaType(schema.type)) {
    result.additionalProperties = false;
  }
}

/**
 * Write object fields (properties, required, additionalProperties).
 * @internal
 */
export function writeObjectFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.properties !== undefined) {
    const props: Record<string, JsonSchemaObject> = {};
    for (const [key, propSchema] of getSortedPropertyEntries(schema)) {
      props[key] = writeSchema(propSchema);
    }
    result.properties = props;
  }
  if (schema.required !== undefined && schema.required.length > 0) {
    result.required = schema.required;
  }
  writeAdditionalProperties(schema, result);
}

/**
 * Write array fields (items, prefixItems, minItems, maxItems, uniqueItems).
 * @internal
 */
export function writeArrayFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.items !== undefined) {
    if (Array.isArray(schema.items)) {
      result.prefixItems = schema.items.map((item) => writeSchema(item));
    } else {
      result.items = writeSchema(schema.items);
    }
  }
  if (schema.minItems !== undefined) {
    result.minItems = schema.minItems;
  }
  if (schema.maxItems !== undefined) {
    result.maxItems = schema.maxItems;
  }
  if (schema.uniqueItems !== undefined) {
    result.uniqueItems = schema.uniqueItems;
  }
}

/**
 * Write composition fields (allOf, oneOf, anyOf, not).
 * NOTE: `discriminator` is OAS-only and not written here.
 * @internal
 */
export function writeCompositionFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
): void {
  if (schema.allOf !== undefined) {
    result.allOf = schema.allOf.map((s) => writeSchema(s));
  }
  if (schema.oneOf !== undefined) {
    result.oneOf = schema.oneOf.map((s) => writeSchema(s));
  }
  if (schema.anyOf !== undefined) {
    result.anyOf = schema.anyOf.map((s) => writeSchema(s));
  }
  if (schema.not !== undefined) {
    result.not = writeSchema(schema.not);
  }
}

/**
 * Write enum / const fields.
 * @internal
 */
export function writeEnumFields(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.enum !== undefined) {
    result.enum = schema.enum;
  }
  if (schema.const !== undefined) {
    result.const = schema.const;
  }
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

/**
 * Write ALL standard JSON Schema fields from an IR schema.
 *
 * Covers core fields + 2020-12 extension keywords.
 * Does NOT write OAS-only fields (xml, externalDocs, discriminator).
 *
 * `writeBooleanCapable` is used at boolean-capable keyword positions
 * (`if`/`then`/`else`, `contentSchema`); it defaults to `writeSchema`, so
 * writers whose recursion rejects `booleanSchema` nodes keep that policy.
 * `writeUnreachableBranch` is used at statically-unreachable `then`/`else`
 * positions (see `isThenBranchStaticallyUnreachable` and
 * `isElseBranchStaticallyUnreachable` in `json-schema-2020-12-fields.ts`);
 * it defaults to `writeBooleanCapable`, so writers that do not distinguish
 * unreachable branches keep their existing behaviour.
 * @internal
 */
export function writeAllJsonSchemaFields(
  schema: CastrSchema,
  result: JsonSchemaObject,
  writeSchema: WriteSchemaFn,
  writeBooleanCapable: WriteBooleanCapableSchemaFn = writeSchema,
  writeUnreachableBranch: WriteBooleanCapableSchemaFn = writeBooleanCapable,
): void {
  writeTypeField(schema, result);
  writeStringFields(schema, result);
  writeNumberFields(schema, result);
  writeEnumFields(schema, result);
  writeObjectFields(schema, result, writeSchema);
  writeArrayFields(schema, result, writeSchema);
  writeCompositionFields(schema, result, writeSchema);
  writeCoreMetadata(schema, result);
  writeAccessMetadata(schema, result);
  writeJsonSchema2020SimpleFields(schema, result);
  writeJsonSchema2020RecursiveFields(
    schema,
    result,
    writeSchema,
    writeBooleanCapable,
    writeUnreachableBranch,
  );
}
