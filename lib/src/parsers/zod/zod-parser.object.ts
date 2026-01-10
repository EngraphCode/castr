/**
 * Zod Object Schema Parsing
 *
 * Parses z.object() schemas into CastrSchema structures with properties.
 *
 * @module parsers/zod/object
 *
 * @example
 * ```typescript
 * import { parseObjectZod } from './zod-parser.object.js';
 *
 * const schema = parseObjectZod('z.object({ name: z.string() })');
 * // { type: 'object', properties: Map { 'name' => { type: 'string' } }, ... }
 * ```
 */

import type { CastrSchema, CastrSchemaNode } from '../../context/ir-schema.js';
import { CastrSchemaProperties } from '../../context/ir-schema-properties.js';
import { parsePrimitiveZod } from './zod-parser.primitives.js';

/**
 * Regular expression to match z.object() calls.
 *
 * Captures the content inside the parentheses.
 *
 * @internal
 */
const ZOD_OBJECT_PATTERN = /^z\.object\s*\(\s*\{([\s\S]*)\}\s*\)$/;

/**
 * Regular expression to match property definitions inside z.object().
 *
 * Matches patterns like:
 * - `name: z.string()`
 * - `'my-prop': z.number()`
 * - `"quoted": z.boolean()`
 *
 * @internal
 */

const PROPERTY_PATTERN =
  // eslint-disable-next-line sonarjs/slow-regex -- Pattern is bounded by input length
  /(?:([a-zA-Z_$][a-zA-Z0-9_$]*)|'([^']+)'|"([^"]+)")\s*:\s*(z\.[a-zA-Z]+\s*\(\s*\))/g;

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
 * Parse a z.object() expression into a CastrSchema.
 *
 * Handles object schemas with properties:
 * - `z.object({})` → empty object
 * - `z.object({ name: z.string() })` → object with string property
 * - `z.object({ a: z.string(), b: z.number() })` → object with multiple properties
 *
 * All Zod properties are required by default (unlike TypeScript).
 *
 * @param expression - A Zod object expression string
 * @returns CastrSchema if this is a valid z.object(), undefined otherwise
 *
 * @example
 * ```typescript
 * const schema = parseObjectZod('z.object({ name: z.string() })');
 * console.log(schema?.type); // 'object'
 * console.log(schema?.properties?.get('name')?.type); // 'string'
/**
 * Parse a single property match result.
 *
 * @internal
 */
function parsePropertyMatch(
  propMatch: RegExpExecArray,
  propertiesRecord: Record<string, CastrSchema>,
  requiredFields: string[],
): void {
  // Group 1: unquoted identifier, Group 2: single-quoted, Group 3: double-quoted
  const propName = propMatch[1] ?? propMatch[2] ?? propMatch[3];
  // Group 4: the z.xxx() value
  const propValue = propMatch[4];

  if (propName === undefined || propValue === undefined) {
    return;
  }

  const propSchema = parsePrimitiveZod(propValue);
  if (propSchema) {
    propertiesRecord[propName] = propSchema;
    requiredFields.push(propName);
  }
}

/**
 * Parse a z.object() expression into a CastrSchema.
 *
 * Handles object schemas with properties:
 * - `z.object({})` → empty object
 * - `z.object({ name: z.string() })` → object with string property
 * - `z.object({ a: z.string(), b: z.number() })` → object with multiple properties
 *
 * All Zod properties are required by default (unlike TypeScript).
 *
 * @param expression - A Zod object expression string
 * @returns CastrSchema if this is a valid z.object(), undefined otherwise
 *
 * @example
 * ```typescript
 * const schema = parseObjectZod('z.object({ name: z.string() })');
 * console.log(schema?.type); // 'object'
 * console.log(schema?.properties?.get('name')?.type); // 'string'
 * ```
 *
 * @public
 */
export function parseObjectZod(expression: string): CastrSchema | undefined {
  const match = ZOD_OBJECT_PATTERN.exec(expression.trim());
  if (!match) {
    return undefined;
  }

  const objectContent = match[1] ?? '';
  const propertiesRecord: Record<string, CastrSchema> = {};
  const requiredFields: string[] = [];

  const propPattern = new RegExp(PROPERTY_PATTERN.source, 'g');
  let propMatch: RegExpExecArray | null;

  while ((propMatch = propPattern.exec(objectContent)) !== null) {
    parsePropertyMatch(propMatch, propertiesRecord, requiredFields);
  }

  return {
    type: 'object',
    properties: new CastrSchemaProperties(propertiesRecord),
    required: requiredFields,
    metadata: createDefaultMetadata(),
  };
}
