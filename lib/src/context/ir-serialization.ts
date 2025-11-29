import { IRSchemaProperties, type IRDocument, isIRDocument, type IRSchema } from './ir-schema.js';
import { isIRSchema } from './ir-validators.js';

/**
 * Interface for a serialized Map.
 */
interface SerializedMap {
  dataType: 'Map';
  value: [unknown, unknown][];
}

import { type UnknownRecord, isRecord } from '../shared/types.js';

/**
 * Interface for a serialized IRSchemaProperties.
 */
interface SerializedIRSchemaProperties {
  dataType: 'IRSchemaProperties';

  // We need to be more specific here, we know this is IRSchema don't we?
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
 * Type guard for SerializedIRSchemaProperties.
 *
 * @param value - The value to check
 * @returns True if the value is a SerializedIRSchemaProperties
 */
function isSerializedIRSchemaProperties(value: unknown): value is SerializedIRSchemaProperties {
  if (!isRecord(value)) {
    return false;
  }
  const record = value;
  return (
    'dataType' in record &&
    record['dataType'] === 'IRSchemaProperties' &&
    'value' in record &&
    isRecord(record['value'])
  );
}

/**
 * Serializes an IRDocument to a JSON string.
 * Uses pretty-printing (2 spaces) for readability in debug artifacts.
 *
 * @param ir - The IRDocument to serialize
 * @returns JSON string representation of the IR
 */
export function serializeIR(ir: IRDocument): string {
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
 * Deserializes a JSON string to an IRDocument.
 *
 * @param json - The JSON string to deserialize
 * @returns The parsed IRDocument
 * @throws SyntaxError if the JSON is invalid
 * @throws Error if the JSON is not a valid IRDocument
 */
export function deserializeIR(json: string): IRDocument {
  const parsed: unknown = JSON.parse(json, (_key: string, value: unknown): unknown => {
    if (isSerializedMap(value)) {
      return new Map(value.value);
    }
    if (isSerializedIRSchemaProperties(value)) {
      const props: Record<string, IRSchema> = {};
      for (const [k, v] of Object.entries(value.value)) {
        if (isIRSchema(v)) {
          props[k] = v;
        }
      }
      return new IRSchemaProperties(props);
    }
    return value;
  });

  if (!isIRDocument(parsed)) {
    throw new Error('Invalid IRDocument structure');
  }
  return parsed;
}
