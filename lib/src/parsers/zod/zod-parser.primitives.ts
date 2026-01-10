/**
 * Zod Primitive Schema Parsing
 *
 * Parses primitive Zod types (z.string(), z.number(), z.boolean(), etc.)
 * into CastrSchema structures.
 *
 * @module parsers/zod/primitives
 *
 * @example
 * ```typescript
 * import { parsePrimitiveZod } from './zod-parser.primitives.js';
 *
 * const schema = parsePrimitiveZod('z.string()');
 * // { type: 'string', metadata: { ... } }
 * ```
 */

import type { CastrSchema, CastrSchemaNode } from '../../context/ir-schema.js';

/**
 * Mapping of Zod primitive method names to CastrSchema types.
 *
 * @internal
 */
const ZOD_PRIMITIVE_TYPES: ReadonlyMap<string, CastrSchema['type']> = new Map([
  ['string', 'string'],
  ['number', 'number'],
  ['boolean', 'boolean'],
  ['null', 'null'],
  ['undefined', undefined], // Special case - no direct JSON Schema equivalent
]);

/**
 * Regular expression to match Zod primitive method calls.
 *
 * Matches: z.string(), z.number(), z.boolean(), z.null(), z.undefined()
 *
 * @internal
 */
const ZOD_PRIMITIVE_PATTERN = /^z\.(string|number|boolean|null|undefined)\s*\(\s*\)/;

/**
 * Create default metadata for a schema node.
 *
 * @param options - Optional overrides for metadata fields
 * @returns Complete CastrSchemaNode with sensible defaults
 *
 * @internal
 */
function createDefaultMetadata(
  options: {
    nullable?: boolean;
    required?: boolean;
  } = {},
): CastrSchemaNode {
  const { nullable = false, required = true } = options;

  return {
    required,
    nullable,
    zodChain: {
      presence: '',
      validations: [],
      defaults: [],
    },
    dependencyGraph: {
      references: [],
      referencedBy: [],
      depth: 0,
    },
    circularReferences: [],
  };
}

/**
 * Parse a primitive Zod expression into a CastrSchema.
 *
 * Handles the basic Zod primitive types:
 * - `z.string()` → `{ type: 'string', ... }`
 * - `z.number()` → `{ type: 'number', ... }`
 * - `z.boolean()` → `{ type: 'boolean', ... }`
 * - `z.null()` → `{ type: 'null', ... }`
 * - `z.undefined()` → `{ type: undefined, ... }` (special case)
 *
 * @param expression - A Zod expression string (e.g., 'z.string()')
 * @returns CastrSchema if this is a recognized primitive, undefined otherwise
 *
 * @example
 * ```typescript
 * const schema = parsePrimitiveZod('z.string()');
 * console.log(schema?.type); // 'string'
 *
 * const notPrimitive = parsePrimitiveZod('z.object({})');
 * console.log(notPrimitive); // undefined
 * ```
 *
 * @public
 */
export function parsePrimitiveZod(expression: string): CastrSchema | undefined {
  const match = ZOD_PRIMITIVE_PATTERN.exec(expression.trim());

  if (!match) {
    return undefined;
  }

  const zodMethod = match[1];
  if (zodMethod === undefined) {
    return undefined;
  }

  const schemaType = ZOD_PRIMITIVE_TYPES.get(zodMethod);

  // Handle special case of z.undefined() which has no JSON Schema type
  if (zodMethod === 'undefined') {
    return {
      type: undefined,
      metadata: createDefaultMetadata({ required: false }),
    };
  }

  // Null is inherently nullable
  const isNull = zodMethod === 'null';

  return {
    type: schemaType,
    metadata: createDefaultMetadata({ nullable: isNull }),
  };
}
