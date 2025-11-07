import type { SchemaObject } from 'openapi3-ts/oas31';
import type { Schema as JsonSchema } from 'ajv';

import {
  assignIfDefined,
  hasJsonSchemaKeyword,
  isSchemaLikeRecord,
  readSchemaKeyword,
  setKeyword,
  toSchemaLike,
  type Converter,
  type MutableJsonSchema,
  type SchemaLike,
} from './keyword-helpers.js';

type UnevaluatedPropertiesResult =
  | { kind: 'boolean'; value: boolean }
  | { kind: 'schema'; value: SchemaLike }
  | undefined;

export function applyObjectKeywords(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  if (!isObjectLikeSchema(schema)) {
    return;
  }

  setKeyword(target, 'type', 'object');

  applyPropertiesKeyword(schema, target, convert);
  applyRequiredKeyword(schema, target);
  applyAdditionalPropertiesKeyword(schema, target, convert);
  applyPropertyCountKeywords(schema, target);
  applyUnevaluatedProperties(schema, target, convert);
  applyDependentSchemas(schema, target, convert);
}

function isObjectLikeSchema(schema: SchemaObject): boolean {
  return (
    schema.type === 'object' ||
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

function applyUnevaluatedProperties(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  if (hasJsonSchemaKeyword(target, 'additionalProperties')) {
    return;
  }

  const unevaluated = readUnevaluatedProperties(schema);
  if (unevaluated === undefined) {
    return;
  }

  if (unevaluated.kind === 'boolean') {
    setKeyword(target, 'additionalProperties', unevaluated.value);
  } else {
    setKeyword(target, 'additionalProperties', convert(unevaluated.value));
  }
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

function readUnevaluatedProperties(schema: SchemaObject): UnevaluatedPropertiesResult {
  const candidate = readSchemaKeyword(schema, 'unevaluatedProperties');
  if (candidate === undefined) {
    return undefined;
  }

  if (typeof candidate === 'boolean') {
    return { kind: 'boolean', value: candidate };
  }

  const schemaLike = toSchemaLike(candidate);
  return schemaLike === undefined ? undefined : { kind: 'schema', value: schemaLike };
}

function readDependentSchemas(schema: SchemaObject): Record<string, SchemaLike> | undefined {
  const candidate = readSchemaKeyword(schema, 'dependentSchemas');
  if (!isSchemaLikeRecord(candidate)) {
    return undefined;
  }

  return candidate;
}
