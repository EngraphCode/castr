import type { CastrSchema, CastrSchemaNode } from '../models/schema.js';
import { isCastrSchemaProperties } from '../../../shared/type-utils/type-guards.js';
import { type UnknownRecord, isRecord } from '../../../shared/type-utils/types.js';
import { isObjectSchemaType } from '../unknown-key-behavior.js';
import { hasValidSchemaIntegerSemantics } from './validators.integer.js';
import { hasValidSchemaUuidVersion } from './validators.uuid.js';

const VALID_SCHEMA_TYPES: readonly NonNullable<Extract<CastrSchema['type'], string>>[] = [
  'string',
  'number',
  'integer',
  'boolean',
  'array',
  'object',
  'null',
];

export function isCastrSchema(value: unknown): value is CastrSchema {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasValidSchemaAdditionalProperties(value) &&
    hasValidSchemaProperties(value) &&
    hasValidSchemaIntegerSemantics(value) &&
    hasValidSchemaUuidVersion(value) &&
    isRecord(value['metadata'])
  );
}

function hasValidSchemaAdditionalProperties(value: UnknownRecord): boolean {
  if (!('additionalProperties' in value) || value['additionalProperties'] === undefined) {
    return true;
  }

  return isValidAdditionalProperties(value, value['additionalProperties']);
}

function hasValidSchemaProperties(value: UnknownRecord): boolean {
  if (!('properties' in value) || value['properties'] === undefined) {
    return true;
  }

  return isCastrSchemaProperties(value['properties']);
}

function isValidAdditionalProperties(schema: UnknownRecord, value: unknown): boolean {
  if (!isObjectSchemaRecord(schema)) {
    return false;
  }

  return typeof value === 'boolean' || isCastrSchema(value);
}

function isSchemaTypeEntry(
  value: unknown,
): value is NonNullable<Extract<CastrSchema['type'], string>> {
  if (typeof value !== 'string') {
    return false;
  }

  for (const schemaType of VALID_SCHEMA_TYPES) {
    if (value === schemaType) {
      return true;
    }
  }

  return false;
}

function isSchemaTypeArray(
  value: unknown,
): value is NonNullable<Extract<CastrSchema['type'], unknown[]>> {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(isSchemaTypeEntry);
}

function isSchemaTypeValue(value: unknown): value is CastrSchema['type'] | undefined {
  return value === undefined || isSchemaTypeEntry(value) || isSchemaTypeArray(value);
}

function isObjectSchemaRecord(schema: UnknownRecord): boolean {
  const schemaType = schema['type'];
  if (isSchemaTypeValue(schemaType) && isObjectSchemaType(schemaType)) {
    return true;
  }

  return isCastrSchemaProperties(schema['properties']);
}

export function isCastrSchemaNode(value: unknown): value is CastrSchemaNode {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value['required'] !== 'boolean' || typeof value['nullable'] !== 'boolean') {
    return false;
  }

  return (
    isZodChain(value['zodChain']) &&
    isDependencyGraph(value['dependencyGraph']) &&
    Array.isArray(value['circularReferences'])
  );
}

function isZodChain(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value['presence'] === 'string' &&
    Array.isArray(value['validations']) &&
    Array.isArray(value['defaults'])
  );
}

function isDependencyGraph(value: unknown): boolean {
  return (
    isRecord(value) &&
    Array.isArray(value['references']) &&
    Array.isArray(value['referencedBy']) &&
    typeof value['depth'] === 'number'
  );
}
