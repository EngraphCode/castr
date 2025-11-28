import { IRSchemaProperties, type IRDocument, isIRDocument, type IRSchema } from './ir-schema.js';

/**
 * Interface for a serialized Map.
 */
interface SerializedMap {
  dataType: 'Map';
  value: [unknown, unknown][];
}

/**
 * Interface for a serialized IRSchemaProperties.
 */
interface SerializedIRSchemaProperties {
  dataType: 'IRSchemaProperties';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Record<string, any>;
}

/**
 * Type guard for SerializedMap.
 *
 * @param value - The value to check
 * @returns True if the value is a SerializedMap
 */
function isSerializedMap(value: unknown): value is SerializedMap {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dataType' in value &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (value as SerializedMap).dataType === 'Map' &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    Array.isArray((value as SerializedMap).value)
  );
}

/**
 * Type guard for SerializedIRSchemaProperties.
 *
 * @param value - The value to check
 * @returns True if the value is a SerializedIRSchemaProperties
 */
function isSerializedIRSchemaProperties(value: unknown): value is SerializedIRSchemaProperties {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  const record = value as Record<string, any>;
  return (
    'dataType' in record &&
    record['dataType'] === 'IRSchemaProperties' &&
    'value' in record &&
    typeof record['value'] === 'object' &&
    record['value'] !== null
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
    (_key, value) => {
      if (value instanceof Map) {
        const serialized: SerializedMap = {
          dataType: 'Map',
          value: Array.from(value.entries()),
        };
        return serialized;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
  const parsed: unknown = JSON.parse(json, (_key, value) => {
    if (isSerializedMap(value)) {
      return new Map(value.value);
    }
    if (isSerializedIRSchemaProperties(value)) {
      // We need to cast the value to the expected constructor argument type
      // This is safe because we're reviving a trusted structure
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return new IRSchemaProperties(value.value as Record<string, IRSchema>);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  });

  if (!isIRDocument(parsed)) {
    throw new Error('Invalid IRDocument structure');
  }
  return parsed;
}
