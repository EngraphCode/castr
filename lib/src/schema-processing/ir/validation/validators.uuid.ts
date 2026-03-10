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
