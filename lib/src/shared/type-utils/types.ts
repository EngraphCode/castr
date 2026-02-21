/**
 * Shared type definitions and type guards.
 */

// eslint-disable-next-line @typescript-eslint/no-restricted-types -- JC: Sometimes we really do need to deal with unknown records at incoming system boundaries
export type UnknownRecord = Record<string, unknown>;
const EMPTY_STRING = '' as const;

/**
 * Type guard to check if a value is a non-null object (UnknownRecord).
 *
 * @param value - The value to check
 * @returns True if the value is a non-null, non-array object with at least one key-value pair where the key is a string and the value is not undefined
 */
export function isRecord(value: unknown): value is UnknownRecord {
  const isProbablyObject = typeof value === 'object' && value !== null && !Array.isArray(value);
  if (!isProbablyObject) {
    return false;
  }
  const hasKeys = Object.keys(value).length > 0;
  const hasValues = Object.values(value).length > 0;
  const firstKey = Object.keys(value)[0];
  const hasStringKey = typeof firstKey === 'string' && firstKey !== EMPTY_STRING;
  return isProbablyObject && hasKeys && hasValues && hasStringKey;
}
