/**
 * Whether a `const` decides alone.
 *
 * The writers write a `const` as a literal and nothing beside it. That literal says
 * everything the schema decides only where the value is a primitive, the `type` beside
 * it (if any) is one type that admits the value, and every other keyword says something
 * about the schema and decides nothing. A source schema and a model schema use the same
 * keyword names, so one reading serves the reader and the writers.
 */

import { isOpenApiExtensionKey } from '../../../shared/openapi/access/schema-shape-guards.js';

/**
 * The keywords that may stand beside a `const`. `type` is checked against the value;
 * the others say something about the schema and decide nothing. `metadata` is where the
 * model keeps what it computed.
 */
const KEYWORDS_BESIDE_A_CONST: ReadonlySet<string> = new Set([
  'const',
  'type',
  'title',
  'description',
  'default',
  'example',
  'examples',
  'deprecated',
  'readOnly',
  'writeOnly',
  'externalDocs',
  'xml',
  '$comment',
  'metadata',
]);

export type Primitive = string | number | boolean | null;

export function isPrimitive(value: unknown): value is Primitive {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

/** Whether a single `type` admits a primitive value. */
function typeAdmits(type: unknown, value: Primitive): boolean {
  switch (type) {
    case 'null':
      return value === null;
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'number':
      return typeof value === 'number';
    case 'string':
      return typeof value === 'string';
    case 'boolean':
      return typeof value === 'boolean';
    default:
      return false;
  }
}

/** Whether the model's metadata says the schema admits null beside its type. */
function marksNullable(metadata: unknown): boolean {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    new Map<string, unknown>(Object.entries(metadata)).get('nullable') === true
  );
}

/**
 * Why the `const` of a schema does not decide alone, in words that follow "A const";
 * `undefined` when it does. The schema is one that holds a `const`.
 */
export function whyConstDoesNotDecideAlone(schema: object): string | undefined {
  const keywords = new Map<string, unknown>(Object.entries(schema));
  const value = keywords.get('const');
  if (!isPrimitive(value)) {
    return 'whose value is an object or an array';
  }
  const type = keywords.get('type');
  if (type !== undefined && !typeAdmits(type, value)) {
    return `beside a type that is a list or does not admit its value (${JSON.stringify(type)})`;
  }
  if (value !== null && marksNullable(keywords.get('metadata'))) {
    return 'in a schema that also admits null';
  }
  const beside = [...keywords.keys()].find(
    (keyword) =>
      keywords.get(keyword) !== undefined &&
      !KEYWORDS_BESIDE_A_CONST.has(keyword) &&
      !isOpenApiExtensionKey(keyword),
  );
  return beside === undefined ? undefined : `beside ${beside}`;
}
