import {
  INTEGER_SCHEMA_TYPE,
  INTEGER_SEMANTICS_BIGINT,
  INTEGER_SEMANTICS_INT64,
  isIRIntegerSemantics,
} from '../integer-semantics/index.js';
import type { UnknownRecord } from '../../../shared/type-utils/types.js';

function schemaTypeIncludesInteger(value: unknown): boolean {
  if (value === INTEGER_SCHEMA_TYPE) {
    return true;
  }

  if (!Array.isArray(value)) {
    return false;
  }

  return value.some((entry) => entry === INTEGER_SCHEMA_TYPE);
}

function getDefinedIntegerSemantics(value: UnknownRecord): unknown {
  if (!('integerSemantics' in value)) {
    return undefined;
  }

  return value['integerSemantics'];
}

function hasIntegerCarrierAndSemantics(
  value: UnknownRecord,
  integerSemantics: unknown,
): integerSemantics is typeof INTEGER_SEMANTICS_INT64 | typeof INTEGER_SEMANTICS_BIGINT {
  return schemaTypeIncludesInteger(value['type']) && isIRIntegerSemantics(integerSemantics);
}

function hasCompatibleIntegerFormat(
  format: unknown,
  integerSemantics: typeof INTEGER_SEMANTICS_INT64 | typeof INTEGER_SEMANTICS_BIGINT,
): boolean {
  if (format !== undefined && typeof format !== 'string') {
    return false;
  }

  if (integerSemantics === INTEGER_SEMANTICS_INT64) {
    return format === INTEGER_SEMANTICS_INT64;
  }

  return format === undefined || format === INTEGER_SEMANTICS_BIGINT;
}

export function hasValidSchemaIntegerSemantics(value: UnknownRecord): boolean {
  const integerSemantics = getDefinedIntegerSemantics(value);
  if (integerSemantics === undefined) {
    return true;
  }

  if (!hasIntegerCarrierAndSemantics(value, integerSemantics)) {
    return false;
  }

  return hasCompatibleIntegerFormat(value['format'], integerSemantics);
}
