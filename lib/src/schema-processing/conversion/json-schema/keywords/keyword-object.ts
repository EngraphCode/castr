import type { SchemaObject } from '../../../../shared/openapi-types.js';
import type { Schema as JsonSchema } from 'ajv';

import {
  assignIfDefined,
  isSchemaLikeRecord,
  readSchemaKeyword,
  setKeyword,
  toSchemaLike,
  type Converter,
  type MutableJsonSchema,
  type SchemaLike,
} from './keyword-helpers.js';
import { SCHEMA_TYPE_OBJECT } from '../json-schema-constants.js';

export function applyObjectKeywords(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  rejectUnevaluatedProperties(schema);

  if (!isObjectLikeSchema(schema)) {
    return;
  }

  setKeyword(target, 'type', SCHEMA_TYPE_OBJECT);

  applyPropertiesKeyword(schema, target, convert);
  applyRequiredKeyword(schema, target);
  applyAdditionalPropertiesKeyword(schema, target, convert);
  applyPropertyCountKeywords(schema, target);
  applyDependentSchemas(schema, target, convert);
}

function isObjectLikeSchema(schema: SchemaObject): boolean {
  return (
    schema.type === SCHEMA_TYPE_OBJECT ||
    schema.properties !== undefined ||
    schema.required !== undefined ||
    schema.additionalProperties !== undefined
  );
}

function applyPropertiesKeyword(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  const rawProperties = schema.properties;
  if (rawProperties === undefined) {
    return;
  }

  const properties: Record<string, JsonSchema> = {};
  let hasProperties = false;

  for (const key in rawProperties) {
    if (!Object.prototype.hasOwnProperty.call(rawProperties, key)) {
      continue;
    }

    const propertySchema = rawProperties[key];
    const resolvedSchema = toSchemaLike(propertySchema);
    if (resolvedSchema !== undefined) {
      properties[key] = convert(resolvedSchema);
      hasProperties = true;
    }
  }

  if (hasProperties) {
    setKeyword(target, 'properties', properties);
  }
}

function applyRequiredKeyword(schema: SchemaObject, target: MutableJsonSchema): void {
  assignIfDefined(schema.required, (value) => {
    setKeyword(target, 'required', value);
  });
}

function applyAdditionalPropertiesKeyword(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  const additionalProperties = schema.additionalProperties;
  if (additionalProperties === undefined) {
    return;
  }

  if (typeof additionalProperties === 'boolean') {
    setKeyword(target, 'additionalProperties', additionalProperties);
    return;
  }

  const additionalSchema = toSchemaLike(additionalProperties);
  if (additionalSchema !== undefined) {
    setKeyword(target, 'additionalProperties', convert(additionalSchema));
  }
}

function applyPropertyCountKeywords(schema: SchemaObject, target: MutableJsonSchema): void {
  assignIfDefined(schema.minProperties, (value) => {
    setKeyword(target, 'minProperties', value);
  });

  assignIfDefined(schema.maxProperties, (value) => {
    setKeyword(target, 'maxProperties', value);
  });
}

/**
 * Fail fast on `unevaluatedProperties` (L14).
 *
 * `unevaluatedProperties` is composition-aware (it sees properties
 * evaluated by `allOf`/`oneOf`/`anyOf` members); Draft 07's
 * `additionalProperties` is local-only. Remapping one to the other
 * silently changes validation semantics, so the downgrade is rejected
 * instead of applied.
 */
function rejectUnevaluatedProperties(schema: SchemaObject): void {
  if (readSchemaKeyword(schema, 'unevaluatedProperties') === undefined) {
    return;
  }

  throw new Error(
    'Cannot convert unevaluatedProperties to JSON Schema Draft 07: the target dialect has no ' +
      'composition-aware equivalent, and downgrading it to additionalProperties would change ' +
      'validation semantics. Remove the keyword or express the constraint with ' +
      'additionalProperties directly.',
  );
}

function applyDependentSchemas(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  const dependentSchemas = readDependentSchemas(schema);
  if (dependentSchemas === undefined) {
    return;
  }

  const dependencies: Record<string, JsonSchema> = {};
  let hasDependencies = false;

  for (const key in dependentSchemas) {
    if (!Object.prototype.hasOwnProperty.call(dependentSchemas, key)) {
      continue;
    }

    const schemaLike = dependentSchemas[key];
    if (schemaLike === undefined) {
      continue;
    }
    dependencies[key] = convert(schemaLike);
    hasDependencies = true;
  }

  if (hasDependencies) {
    setKeyword(target, 'dependencies', dependencies);
  }
}

function readDependentSchemas(schema: SchemaObject): Record<string, SchemaLike> | undefined {
  const candidate = readSchemaKeyword(schema, 'dependentSchemas');
  if (!isSchemaLikeRecord(candidate)) {
    return undefined;
  }

  return candidate;
}
