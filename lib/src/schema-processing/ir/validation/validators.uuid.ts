import type { UnknownRecord } from '../../../shared/type-utils/types.js';
import { isIRUuidVersion, UUID_SCHEMA_FORMAT, UUID_SCHEMA_TYPE } from '../uuid-version.js';

export function hasValidSchemaUuidVersion(value: UnknownRecord): boolean {
  if (!('uuidVersion' in value) || value['uuidVersion'] === undefined) {
    return true;
  }

  return isValidUuidVersion(value, value['uuidVersion']);
}

function isValidUuidVersion(schema: UnknownRecord, value: unknown): boolean {
  return (
    schema['type'] === UUID_SCHEMA_TYPE &&
    schema['format'] === UUID_SCHEMA_FORMAT &&
    isIRUuidVersion(value)
  );
}

// ── $anchor / $dynamicRef / $dynamicAnchor (optional strings) ──

function hasOptionalStringField(value: UnknownRecord, key: string): boolean {
  return !(key in value && value[key] !== undefined && typeof value[key] !== 'string');
}

export function hasValidSchemaAnchorKeywords(value: UnknownRecord): boolean {
  return (
    hasOptionalStringField(value, '$anchor') &&
    hasOptionalStringField(value, '$dynamicRef') &&
    hasOptionalStringField(value, '$dynamicAnchor')
  );
}
