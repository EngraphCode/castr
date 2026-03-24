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

const ARRAY_SCHEMA_TYPE = 'array';

export function isCastrSchema(value: unknown): value is CastrSchema {
  if (!isRecord(value)) {
    return false;
  }

  return hasValidSchemaStructure(value) && hasValidSchemaSemantics(value);
}

function hasValidSchemaStructure(value: UnknownRecord): boolean {
  return (
    hasValidSchemaType(value) &&
    hasValidSchemaAdditionalProperties(value) &&
    hasValidSchemaUnevaluatedProperties(value) &&
    hasValidSchemaProperties(value) &&
    hasValidSchemaRequired(value) &&
    hasValidSchemaItems(value) &&
    hasValidSchemaComposition(value) &&
    hasValidSchemaMetadata(value)
  );
}

function hasValidSchemaSemantics(value: UnknownRecord): boolean {
  return hasValidSchemaIntegerSemantics(value) && hasValidSchemaUuidVersion(value);
}

// ── type ──────────────────────────────────────────────────────────────

function hasValidSchemaType(value: UnknownRecord): boolean {
  if (!('type' in value) || value['type'] === undefined) {
    return true;
  }

  return isSchemaTypeValue(value['type']);
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

function isSchemaTypeValue(value: unknown): value is CastrSchema['type'] {
  return isSchemaTypeEntry(value) || isSchemaTypeArray(value);
}

// ── additionalProperties (boolean-only per IDENTITY closed-world doctrine) ──

function hasValidSchemaAdditionalProperties(value: UnknownRecord): boolean {
  if (!('additionalProperties' in value) || value['additionalProperties'] === undefined) {
    return true;
  }

  if (!isObjectSchemaRecord(value)) {
    return false;
  }

  return typeof value['additionalProperties'] === 'boolean';
}

// ── unevaluatedProperties (boolean or valid CastrSchema) ──

function hasValidSchemaUnevaluatedProperties(value: UnknownRecord): boolean {
  if (!('unevaluatedProperties' in value) || value['unevaluatedProperties'] === undefined) {
    return true;
  }

  const unevaluated = value['unevaluatedProperties'];
  return typeof unevaluated === 'boolean' || isCastrSchema(unevaluated);
}

// ── properties ──

function hasValidSchemaProperties(value: UnknownRecord): boolean {
  if (!('properties' in value) || value['properties'] === undefined) {
    return true;
  }

  return isCastrSchemaProperties(value['properties']);
}

// ── required (string array, only on object schemas) ──

function hasValidSchemaRequired(value: UnknownRecord): boolean {
  if (!('required' in value) || value['required'] === undefined) {
    return true;
  }

  if (!isObjectSchemaRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value['required']) &&
    value['required'].every((entry: unknown) => typeof entry === 'string')
  );
}

// ── items (only on array schemas, must be valid CastrSchema) ──

function schemaTypeIncludesArray(value: UnknownRecord): boolean {
  const type = value['type'];
  if (type === ARRAY_SCHEMA_TYPE) {
    return true;
  }

  if (Array.isArray(type)) {
    return type.some((entry) => entry === ARRAY_SCHEMA_TYPE);
  }

  return false;
}

function hasValidSchemaItems(value: UnknownRecord): boolean {
  if (!('items' in value) || value['items'] === undefined) {
    return true;
  }

  if (!schemaTypeIncludesArray(value)) {
    return false;
  }

  const items = value['items'];
  if (Array.isArray(items)) {
    return items.every((item) => isCastrSchema(item));
  }

  return isCastrSchema(items);
}

// ── composition (allOf / oneOf / anyOf / not) ──

function hasValidDefinedSchemaArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((entry) => isCastrSchema(entry));
}

function hasValidSchemaComposition(value: UnknownRecord): boolean {
  const compositionKeys = ['allOf', 'oneOf', 'anyOf'] as const;
  for (const key of compositionKeys) {
    if (key in value && value[key] !== undefined && !hasValidDefinedSchemaArray(value[key])) {
      return false;
    }
  }
  return !('not' in value && value['not'] !== undefined && !isCastrSchema(value['not']));
}

// ── metadata (must be a valid CastrSchemaNode) ──

function hasValidSchemaMetadata(value: UnknownRecord): boolean {
  return isCastrSchemaNode(value['metadata']);
}

// ── object schema detection helper ──

function isObjectSchemaRecord(schema: UnknownRecord): boolean {
  const schemaType = schema['type'];
  if (schemaType !== undefined && isSchemaTypeValue(schemaType) && isObjectSchemaType(schemaType)) {
    return true;
  }

  return isCastrSchemaProperties(schema['properties']);
}

// ── CastrSchemaNode ──

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
