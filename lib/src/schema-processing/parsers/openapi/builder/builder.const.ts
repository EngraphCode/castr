/**
 * IR Builder - `const`
 *
 * Reads a `const` that decides alone. The writers write a `const` as a literal and
 * nothing beside it, so a `const` is read only where that literal says everything the
 * schema decides. Every other `const` is refused: none is ever read with a keyword left
 * behind.
 *
 * @internal
 */

import { isOpenApiExtensionKey } from '../../../../shared/openapi/access/schema-shape-guards.js';
import type { SchemaObject } from '../../../../shared/openapi-types.js';
import type { CastrSchema } from '../../../ir/index.js';

/**
 * The keywords that may stand beside a `const`. `type` is checked against the value;
 * the others say something about the schema and decide nothing.
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
  '$comment',
]);

type Primitive = string | number | boolean | null;

function isPrimitive(value: unknown): value is Primitive {
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

function refuse(reason: string): never {
  throw new Error(`A const ${reason} is rejected: Castr writes a const as a literal alone.`);
}

/** @internal */
export function addConst(schema: SchemaObject, irSchema: CastrSchema): void {
  // A boolean schema reaches here too, and holds no keyword.
  if (typeof schema !== 'object' || schema.const === undefined) {
    return;
  }
  const value: unknown = schema.const;
  if (!isPrimitive(value)) {
    refuse('whose value is an object or an array');
  }
  if (schema.type !== undefined && !typeAdmits(schema.type, value)) {
    refuse(
      `beside a type that is a list or does not admit its value (${JSON.stringify(schema.type)})`,
    );
  }
  const beside = Object.keys(schema).find(
    (keyword) => !KEYWORDS_BESIDE_A_CONST.has(keyword) && !isOpenApiExtensionKey(keyword),
  );
  if (beside !== undefined) {
    refuse(`beside ${beside}`);
  }
  irSchema.const = value;
}
