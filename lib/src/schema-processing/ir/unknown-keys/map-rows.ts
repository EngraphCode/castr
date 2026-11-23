/**
 * The two rows of the specification's Appendix B.2, as predicates.
 *
 * Both a source schema and a model schema use JSON Schema's keyword names, so one reading
 * serves the reader and every writer. A schema outside a row is not classed by it: the
 * caller refuses it or leaves it to its own row.
 *
 * @see docs/SPECIFICATION.md Appendix B.2
 */

import type { UnknownRecord } from '../../../shared/type-utils/types.js';

/**
 * Keywords that change which properties `additionalProperties` applies to, or apply
 * another schema in place. A schema that holds one of them is in neither row.
 */
const KEYWORDS_OUTSIDE_THE_ROWS = [
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
] as const;

/** The model keeps what it computed about a schema beside the schema's own keywords. */
const MODEL_METADATA_KEY = 'metadata';

/** The model writes the schemas `true` and `false` as a node that holds this key. */
const BOOLEAN_SCHEMA_KEY = 'booleanSchema';

const OBJECT_TYPE = 'object';
const STRING_TYPE = 'string';
const TYPE_KEYWORD = 'type';
const ADDITIONAL_PROPERTIES_KEYWORD = 'additionalProperties';

/** A schema that is not a boolean. The shared `isRecord` refuses `{}`, which is one. */
function isSchemaRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The keywords a schema holds: its keys with a value, the model's metadata apart. */
function keywordsOf(schema: UnknownRecord): string[] {
  return Object.keys(schema).filter(
    (key) => key !== MODEL_METADATA_KEY && schema[key] !== undefined,
  );
}

const PROPERTY_NAMES_KEYWORD = 'propertyNames';

/** Whether a schema is one the rows are for: an object that holds no keyword outside them. */
function isInTheRows(schema: unknown): schema is UnknownRecord {
  return (
    isSchemaRecord(schema) &&
    schema[TYPE_KEYWORD] === OBJECT_TYPE &&
    !KEYWORDS_OUTSIDE_THE_ROWS.some((keyword) => schema[keyword] !== undefined)
  );
}

/**
 * Whether a schema is a constrained map: `type` is `object`, it holds none of the keywords
 * outside the rows, and its `additionalProperties` is a schema other than `true`, `{}`
 * and `false`, in the source's form or the model's.
 */
export function isConstrainedMap(schema: unknown): boolean {
  if (!isInTheRows(schema)) {
    return false;
  }
  const additionalProperties = schema[ADDITIONAL_PROPERTIES_KEYWORD];
  return (
    isSchemaRecord(additionalProperties) &&
    additionalProperties[BOOLEAN_SCHEMA_KEY] === undefined &&
    keywordsOf(additionalProperties).length > 0
  );
}

/**
 * Whether a value of `propertyNames` refuses no name: `true` (in the source's form or the
 * model's), `{}`, or `{type: string}` with no other keyword. A property name is always a string (JSON Schema Core 10.3.2.4).
 */
export function refusesNoPropertyName(propertyNames: unknown): boolean {
  if (propertyNames === true) {
    return true;
  }
  if (!isSchemaRecord(propertyNames)) {
    return false;
  }
  const keywords = keywordsOf(propertyNames);
  if (keywords.length === 0) {
    return true;
  }
  if (propertyNames[BOOLEAN_SCHEMA_KEY] !== undefined) {
    return keywords.length === 1 && propertyNames[BOOLEAN_SCHEMA_KEY] === true;
  }
  return (
    keywords.length === 1 &&
    keywords[0] === TYPE_KEYWORD &&
    propertyNames[TYPE_KEYWORD] === STRING_TYPE
  );
}

/**
 * Whether a schema's `propertyNames` is in the second row: the schema is one the rows are
 * for, and its `propertyNames` refuses no name. Nothing is written for such a keyword.
 */
export function holdsPropertyNamesThatRefuseNoName(schema: unknown): boolean {
  return (
    isInTheRows(schema) &&
    schema[PROPERTY_NAMES_KEYWORD] !== undefined &&
    refusesNoPropertyName(schema[PROPERTY_NAMES_KEYWORD])
  );
}
