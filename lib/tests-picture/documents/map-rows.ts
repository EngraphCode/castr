import { isJsonObject, type JsonObject } from '../rows/json.js';

/** The row of a map's `additionalProperties`, from the specification's Appendix B.2. */
const MAP_VALUES_ROW = 'text:a map: `additionalProperties` with a schema';

/** The row of a map's `propertyNames` that refuses no name, from the same appendix. */
const MAP_NAMES_ROW = 'text:a map: a `propertyNames` that refuses no name';

/**
 * The keywords the appendix names: a schema that holds one of them is in neither row.
 * This list is written from the specification's text and not taken from Castr, so that
 * the picture's reading of a row is not Castr's own.
 */
const OUTSIDE_THE_ROWS: readonly string[] = [
  'properties',
  'required',
  'patternProperties',
  'unevaluatedProperties',
  '$ref',
  '$dynamicRef',
  'allOf',
  'anyOf',
  'oneOf',
  'not',
  'if',
  'dependentSchemas',
];

function isAMap(schema: JsonObject): boolean {
  return schema['type'] === 'object' && !OUTSIDE_THE_ROWS.some((keyword) => keyword in schema);
}

function refusesNoName(names: unknown): boolean {
  if (names === true) {
    return true;
  }
  if (!isJsonObject(names)) {
    return false;
  }
  const keywords = Object.keys(names);
  return keywords.length === 0 || (keywords.length === 1 && names['type'] === 'string');
}

/** The row of an object closed by `additionalProperties: false`. */
const CLOSED_ROW = 'text:`additionalProperties: false`';

/**
 * The row narrower than its keyword's that a keyword of a schema is in, where it is in
 * one: `additionalProperties: false`, or a row of Appendix B.2. Such a keyword is named by
 * that row and not by the row of the keyword, whose case is a schema none of them covers.
 */
export function narrowerRowOf(schema: JsonObject, keyword: string): string | undefined {
  if (keyword === 'additionalProperties' && schema[keyword] === false) {
    return CLOSED_ROW;
  }
  if (!isAMap(schema)) {
    return undefined;
  }
  const value = schema[keyword];
  if (keyword === 'additionalProperties') {
    return isJsonObject(value) && Object.keys(value).length > 0 ? MAP_VALUES_ROW : undefined;
  }
  if (keyword === 'propertyNames') {
    return refusesNoName(value) ? MAP_NAMES_ROW : undefined;
  }
  return undefined;
}
