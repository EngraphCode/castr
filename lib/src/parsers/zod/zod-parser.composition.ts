/**
 * Zod Composition Type Parsing
 *
 * Handles parsing of Zod composition types (arrays, enums, unions, intersections)
 * into CastrSchema structures using ts-morph AST (ADR-026 compliant).
 *
 * @module parsers/zod/composition
 * @internal
 */

import { Node } from 'ts-morph';
import type { CastrSchema } from '../../context/ir-schema.js';
import {
  createZodProject,
  getZodMethodChain,
  type ZodMethodCall,
  type ZodMethodChainInfo,
} from './zod-ast.js';
import { parsePrimitiveZod } from './zod-parser.primitives.js';

// ============================================================================
// Common parsing helper
// ============================================================================

/**
 * Parse a Zod expression string into method chain info.
 * @internal
 */
function parseZodExpression(expression: string): ZodMethodChainInfo | undefined {
  const project = createZodProject(`const __schema = ${expression};`);
  const sourceFile = project.getSourceFiles()[0];
  if (!sourceFile) {
    return undefined;
  }

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();
  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  return getZodMethodChain(init);
}

// ============================================================================
// Shared helpers
// ============================================================================

/**
 * Create default metadata for composition schemas.
 * @internal
 */
function createCompositionMetadata(): CastrSchema['metadata'] {
  return {
    required: true,
    nullable: false,
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

// ============================================================================
// Array parsing
// ============================================================================

/**
 * Array constraints extracted from method chain.
 * @internal
 */
interface ArrayConstraints {
  minItems?: number;
  maxItems?: number;
}

/**
 * Process array-specific method calls.
 * @internal
 */
function processArrayMethod(method: ZodMethodCall, constraints: ArrayConstraints): void {
  const arg = method.args[0];

  switch (method.name) {
    case 'min':
      if (typeof arg === 'number') {
        constraints.minItems = arg;
      }
      break;
    case 'max':
      if (typeof arg === 'number') {
        constraints.maxItems = arg;
      }
      break;
    case 'length':
      if (typeof arg === 'number') {
        constraints.minItems = arg;
        constraints.maxItems = arg;
      }
      break;
    case 'nonempty':
      constraints.minItems = 1;
      break;
  }
}

/**
 * Parse z.array() item expression.
 * @internal
 */
function parseArrayItems(itemExpression: string): CastrSchema | undefined {
  // Try parsing as primitive first
  const primitive = parsePrimitiveZod(itemExpression);
  if (primitive) {
    return primitive;
  }

  // Try parsing as nested array
  const nestedArray = parseArrayZod(itemExpression);
  if (nestedArray) {
    return nestedArray;
  }

  // More composition types will be added here
  return undefined;
}

/**
 * Parse a Zod array expression into a CastrSchema.
 *
 * @param expression - A Zod array expression string (e.g., 'z.array(z.string())')
 * @returns CastrSchema with type 'array', or undefined if not an array expression
 *
 * @example
 * ```typescript
 * parseArrayZod('z.array(z.string())');
 * // => { type: 'array', items: { type: 'string', ... }, ... }
 *
 * parseArrayZod('z.array(z.number()).min(1).max(10)');
 * // => { type: 'array', items: { type: 'number', ... }, minItems: 1, maxItems: 10, ... }
 * ```
 *
 * @public
 */
export function parseArrayZod(expression: string): CastrSchema | undefined {
  const parsed = parseZodExpression(expression);
  if (!parsed) {
    return undefined;
  }

  const { baseMethod, chainedMethods, baseArgs } = parsed;
  if (baseMethod !== 'array') {
    return undefined;
  }

  // First argument is the item type expression
  const itemExpression = baseArgs[0];
  if (!itemExpression || typeof itemExpression !== 'string') {
    return undefined;
  }

  const items = parseArrayItems(itemExpression);
  if (!items) {
    return undefined;
  }

  return buildArraySchema(items, chainedMethods);
}

/**
 * Build array schema with constraints.
 * @internal
 */
function buildArraySchema(items: CastrSchema, chainedMethods: ZodMethodCall[]): CastrSchema {
  const constraints: ArrayConstraints = {};
  for (const method of chainedMethods) {
    processArrayMethod(method, constraints);
  }

  const schema: CastrSchema = {
    type: 'array',
    items,
    metadata: createCompositionMetadata(),
  };

  if (constraints.minItems !== undefined) {
    schema.minItems = constraints.minItems;
  }
  if (constraints.maxItems !== undefined) {
    schema.maxItems = constraints.maxItems;
  }

  return schema;
}

// ============================================================================
// Enum parsing
// ============================================================================

/**
 * Parse a Zod enum expression into a CastrSchema.
 *
 * @param expression - A Zod enum expression string (e.g., 'z.enum(["A", "B"])')
 * @returns CastrSchema with type 'string' and enum values, or undefined if not an enum
 *
 * @example
 * ```typescript
 * parseEnumZod('z.enum(["admin", "user"])');
 * // => { type: 'string', enum: ['admin', 'user'], ... }
 * ```
 *
 * @public
 */
export function parseEnumZod(expression: string): CastrSchema | undefined {
  const parsed = parseZodExpression(expression);
  if (!parsed) {
    return undefined;
  }

  const { baseMethod, baseArgs } = parsed;
  if (baseMethod !== 'enum') {
    return undefined;
  }

  // First argument should be array of string values
  const enumValues = baseArgs[0];
  if (!Array.isArray(enumValues)) {
    return undefined;
  }

  // Validate all values are strings
  const stringValues = enumValues.filter((v): v is string => typeof v === 'string');
  if (stringValues.length !== enumValues.length) {
    return undefined;
  }

  return {
    type: 'string',
    enum: stringValues,
    metadata: createCompositionMetadata(),
  };
}
