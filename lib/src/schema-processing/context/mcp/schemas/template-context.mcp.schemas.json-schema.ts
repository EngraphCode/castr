import type { Schema as JsonSchema } from 'ajv';
import type { CastrSchema } from '../../../ir/index.js';
import type { MutableJsonSchema } from '../../../conversion/json-schema/index.js';
import type { CastrSchemaPropertiesLike } from '../../../../shared/type-utils/castr-schema-properties.js';
import { isCastrSchemaProperties } from '../../../../shared/type-utils/type-guards.js';
import { isRecord } from '../../../../shared/type-utils/types.js';

const SCHEMA_TYPE_OBJECT = 'object';
const SCHEMA_KEY_REF = '$ref';
const DRAFT_07_ALLOWLIST = new Set([
  'type',
  'format',
  'description',
  'title',
  'default',
  'example',
  'examples',
  'enum',
  'const',
  'properties',
  'required',
  'additionalProperties',
  'items',
  'minItems',
  'maxItems',
  'uniqueItems',
  'minLength',
  'maxLength',
  'pattern',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'allOf',
  'oneOf',
  'anyOf',
  'not',
  'discriminator',
  '$ref',
  'readOnly',
  'writeOnly',
  'deprecated',
]);

export function wrapSchemaFromIR(schema: MutableJsonSchema | undefined): MutableJsonSchema {
  if (schema === undefined) {
    return { type: SCHEMA_TYPE_OBJECT };
  }

  if (SCHEMA_KEY_REF in schema || isLikelyObjectSchema(schema)) {
    return schema;
  }

  return {
    type: SCHEMA_TYPE_OBJECT,
    properties: { value: schema },
  };
}

export function wrapJsonSchemaFromIR(schema: JsonSchema | undefined): MutableJsonSchema {
  if (schema === undefined) {
    return { type: SCHEMA_TYPE_OBJECT };
  }

  if (typeof schema === 'boolean') {
    return {
      type: SCHEMA_TYPE_OBJECT,
      properties: { value: schema },
    };
  }

  return wrapSchemaFromIR(schema);
}

export function castrSchemaToJsonSchemaForMcp(schema: CastrSchema): MutableJsonSchema {
  const result: MutableJsonSchema = {};

  for (const [key, value] of getRecordEntries(schema)) {
    if (DRAFT_07_ALLOWLIST.has(key) && value !== undefined) {
      result[key] = convertSchemaFieldValue(value);
    }
  }

  return result;
}

function isLikelyObjectSchema(schema: MutableJsonSchema): boolean {
  const schemaType: unknown = schema['type'];
  if (schemaType === SCHEMA_TYPE_OBJECT) {
    return true;
  }
  if (Array.isArray(schemaType)) {
    return new Set(schemaType).has(SCHEMA_TYPE_OBJECT);
  }

  return false;
}

function isCastrSchemaForMcp(value: unknown): value is CastrSchema {
  return typeof value === 'object' && value !== null && 'metadata' in value;
}

function convertPropertiesToJsonSchema(
  properties: CastrSchemaPropertiesLike,
): Record<string, MutableJsonSchema> {
  const result: Record<string, MutableJsonSchema> = {};
  for (const [propName, propSchema] of properties.entries()) {
    if (!isCastrSchemaForMcp(propSchema)) {
      throw new Error('[mcp-schemas-from-ir] Expected CastrSchema property value.');
    }
    result[propName] = castrSchemaToJsonSchemaForMcp(propSchema);
  }
  return result;
}

function convertArrayToJsonSchema(values: readonly unknown[]): unknown[] {
  return values.map((entry: unknown) =>
    isCastrSchemaForMcp(entry) ? castrSchemaToJsonSchemaForMcp(entry) : entry,
  );
}

function convertSchemaFieldValue(value: unknown): unknown {
  if (isCastrSchemaProperties(value)) {
    return convertPropertiesToJsonSchema(value);
  }
  if (isCastrSchemaForMcp(value)) {
    return castrSchemaToJsonSchemaForMcp(value);
  }
  if (Array.isArray(value)) {
    return convertArrayToJsonSchema(value);
  }
  return value;
}

function getRecordEntries(value: unknown): [string, unknown][] {
  return isRecord(value) ? Object.entries(value) : [];
}
