import type { SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import {
  buildNonStrictObjectRejectionMessage,
  describePortableNonStrictObjectInput,
  normalizePortableObjectInputToStrip,
  shouldNormalizeNonStrictObjectInput,
  type NonStrictObjectPolicyOptions,
} from '../../non-strict-object-policy.js';
import {
  UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY,
  isObjectSchemaType,
  type PortableUnknownKeyBehaviorMode,
} from '../../ir/index.js';
import { isRecord } from '../../../shared/type-utils/types.js';

const SINGLE_SCHEMA_KEYWORDS = [
  'items',
  'not',
  'if',
  'then',
  'else',
  'contains',
  'propertyNames',
  'unevaluatedItems',
  'unevaluatedProperties',
] as const;

const ARRAY_SCHEMA_KEYWORDS = ['prefixItems', 'allOf', 'anyOf', 'oneOf'] as const;
const MAP_SCHEMA_KEYWORDS = ['patternProperties', 'dependentSchemas'] as const;

type OpenApiSchemaWithUnknownKeyBehavior = SchemaObject & {
  [UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY]?: PortableUnknownKeyBehaviorMode | undefined;
};

function hasObjectType(type: SchemaObject['type']): boolean {
  return isObjectSchemaType(type);
}

function isObjectKeywordCandidate(schema: OpenApiSchemaWithUnknownKeyBehavior): boolean {
  if (hasObjectType(schema.type)) {
    return true;
  }
  if (schema.properties !== undefined) {
    return true;
  }
  if (schema.additionalProperties !== undefined) {
    return true;
  }
  if (Array.isArray(schema.required) && schema.required.length > 0) {
    return true;
  }

  return schema[UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY] !== undefined;
}

function applySchemaObjectPolicy(
  schema: OpenApiSchemaWithUnknownKeyBehavior,
  options: NonStrictObjectPolicyOptions | undefined,
): void {
  if (!isObjectKeywordCandidate(schema)) {
    return;
  }

  const inputDescription = describePortableNonStrictObjectInput({
    additionalProperties: schema.additionalProperties,
    [UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY]: schema[UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY],
  });
  if (inputDescription === undefined) {
    return;
  }

  if (shouldNormalizeNonStrictObjectInput(options)) {
    normalizePortableObjectInputToStrip(schema);
    return;
  }

  throw new Error(buildNonStrictObjectRejectionMessage(inputDescription));
}

function getUnknownField(source: object, key: string): unknown {
  return Reflect.get(source, key);
}

function visitSchemaArray(
  values: unknown,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!Array.isArray(values)) {
    return;
  }

  for (const value of values) {
    visitSchemaNode(value, options, seen);
  }
}

function visitSchemaMap(
  values: unknown,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!isRecord(values)) {
    return;
  }

  for (const value of Object.values(values)) {
    visitSchemaNode(value, options, seen);
  }
}

function visitSchemaObject(
  schema: OpenApiSchemaWithUnknownKeyBehavior,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (seen.has(schema)) {
    return;
  }

  seen.add(schema);
  applySchemaObjectPolicy(schema, options);
  visitSchemaMap(schema.properties, options, seen);
  visitSchemaNode(schema.additionalProperties, options, seen);

  for (const key of SINGLE_SCHEMA_KEYWORDS) {
    visitSchemaNode(getUnknownField(schema, key), options, seen);
  }
  for (const key of ARRAY_SCHEMA_KEYWORDS) {
    visitSchemaArray(getUnknownField(schema, key), options, seen);
  }
  for (const key of MAP_SCHEMA_KEYWORDS) {
    visitSchemaMap(getUnknownField(schema, key), options, seen);
  }
}

export function visitSchemaNode(
  value: unknown,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!isRecord(value) || isReferenceObject(value)) {
    return;
  }

  visitSchemaObject(value, options, seen);
}
