import {
  CastrSchemaProperties,
  type CastrDocument,
  isCastrDocument,
  type CastrSchema,
} from './ir-schema.js';
import { isCastrSchema } from './ir-validators.js';

/**
 * Interface for a serialized Map.
 */
interface SerializedMap {
  dataType: 'Map';
  value: [unknown, unknown][];
}

import { type UnknownRecord, isRecord } from '../shared/types.js';

/**
 * Interface for a serialized CastrSchemaProperties.
 */
interface SerializedCastrSchemaProperties {
  dataType: 'CastrSchemaProperties';

  // We need to be more specific here, we know this is CastrSchema don't we?
  value: UnknownRecord;
}

/**
 * Type guard for SerializedMap.
 *
 * @param value - The value to check
 * @returns True if the value is a SerializedMap
 */
function isSerializedMap(value: unknown): value is SerializedMap {
  if (!isRecord(value)) {
    return false;
  }
  return (
    'dataType' in value &&
    value['dataType'] === 'Map' &&
    'value' in value &&
    Array.isArray(value['value'])
  );
}

/**
 * Type guard for SerializedCastrSchemaProperties.
 *
 * @param value - The value to check
 * @returns True if the value is a SerializedCastrSchemaProperties
 */
function isSerializedCastrSchemaProperties(
  value: unknown,
): value is SerializedCastrSchemaProperties {
  if (!isRecord(value)) {
    return false;
  }
  const record = value;
  return (
    'dataType' in record &&
    record['dataType'] === 'CastrSchemaProperties' &&
    'value' in record &&
    isRecord(record['value'])
  );
}

/**
 * Serializes an CastrDocument to a JSON string.
 * Uses pretty-printing (2 spaces) for readability in debug artifacts.
 *
 * @param ir - The CastrDocument to serialize
 * @returns JSON string representation of the IR
 */
export function serializeIR(ir: CastrDocument): string {
  return JSON.stringify(
    ir,
    (_key: string, value: unknown): unknown => {
      if (value instanceof Map) {
        const serialized: SerializedMap = {
          dataType: 'Map',
          value: Array.from(value.entries()),
        };
        return serialized;
      }
      return value;
    },
    2,
  );
}

/**
 * Deserializes a JSON string to an CastrDocument.
 *
 * @param json - The JSON string to deserialize
 * @returns The parsed CastrDocument
 * @throws SyntaxError if the JSON is invalid
 * @throws Error if the JSON is not a valid CastrDocument
 */
export function deserializeIR(json: string): CastrDocument {
  const parsed: unknown = JSON.parse(json, (_key: string, value: unknown): unknown => {
    if (isSerializedMap(value)) {
      return new Map(value.value);
    }
    if (isSerializedCastrSchemaProperties(value)) {
      const props: Record<string, CastrSchema> = {};
      for (const [k, v] of Object.entries(value.value)) {
        if (isCastrSchema(v)) {
          props[k] = v;
        }
      }
      return new CastrSchemaProperties(props);
    }
    return value;
  });

  if (!isCastrDocument(parsed)) {
    throw new Error('Invalid CastrDocument structure');
  }
  return parsed;
}
