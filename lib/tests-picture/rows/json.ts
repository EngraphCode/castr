import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

/**
 * A parsed JSON object whose members are not yet known.
 */
export type JsonObject = Readonly<UnknownRecord>;

/**
 * Narrows a parsed JSON value to an object, excluding arrays and null.
 */
export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The own members of a JSON object, as pairs.
 */
export function membersOf(value: JsonObject): readonly (readonly [string, unknown])[] {
  return Object.entries(value);
}
