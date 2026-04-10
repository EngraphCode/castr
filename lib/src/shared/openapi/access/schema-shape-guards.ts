import { type ReferenceObject, type SchemaObject, isReferenceObject } from '../../openapi-types.js';
import { isRecord } from '../../type-utils/types.js';

const OPENAPI_EXTENSION_KEY_LEADER = 'x';
const OPENAPI_EXTENSION_KEY_SEPARATOR = '-';
const SCHEMA_OBJECT_KEYS = new Set([
  '$anchor',
  '$comment',
  '$defs',
  '$dynamicAnchor',
  '$dynamicRef',
  '$id',
  '$ref',
  '$schema',
  '$vocabulary',
  'additionalProperties',
  'allOf',
  'anyOf',
  'const',
  'contains',
  'contentEncoding',
  'contentMediaType',
  'default',
  'dependentRequired',
  'dependentSchemas',
  'deprecated',
  'description',
  'discriminator',
  'else',
  'enum',
  'example',
  'examples',
  'exclusiveMaximum',
  'exclusiveMinimum',
  'externalDocs',
  'format',
  'if',
  'items',
  'maxContains',
  'maxItems',
  'maxLength',
  'maxProperties',
  'maximum',
  'minContains',
  'minItems',
  'minLength',
  'minProperties',
  'minimum',
  'multipleOf',
  'not',
  'nullable',
  'oneOf',
  'pattern',
  'patternProperties',
  'prefixItems',
  'properties',
  'propertyNames',
  'readOnly',
  'required',
  'then',
  'title',
  'type',
  'unevaluatedItems',
  'unevaluatedProperties',
  'uniqueItems',
  'writeOnly',
  'xml',
]);

export function isSchemaLikeRecord(value: unknown): value is SchemaObject {
  if (!isRecord(value)) {
    return false;
  }

  return Object.keys(value).every(
    (key) =>
      (key[0] === OPENAPI_EXTENSION_KEY_LEADER && key[1] === OPENAPI_EXTENSION_KEY_SEPARATOR) ||
      SCHEMA_OBJECT_KEYS.has(key),
  );
}

export function isSchemaObjectOrRef(value: unknown): value is SchemaObject | ReferenceObject {
  return isReferenceObject(value) || isSchemaLikeRecord(value);
}
