/**
 * Zod Union Type Parsing
 *
 * Handles parsing of Zod union types (z.union, z.discriminatedUnion)
 * into CastrSchema structures using ts-morph AST (ADR-026 compliant).
 *
 * @module parsers/zod/union
 * @internal
 */

import { Node } from 'ts-morph';
import type { CastrSchema } from '../../context/ir-schema.js';
import { createZodProject, getZodMethodChain, type ZodMethodChainInfo } from './zod-ast.js';
import { parsePrimitiveZod } from './zod-parser.primitives.js';
import { parseArrayZod, parseEnumZod } from './zod-parser.composition.js';
import { parseObjectZod } from './zod-parser.object.js';

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
 * Create default metadata for union schemas.
 * @internal
 */
function createUnionMetadata(): CastrSchema['metadata'] {
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

/**
 * Parse a single union member expression into a CastrSchema.
 * Tries primitives, literals, arrays, enums, and objects.
 * @internal
 */
function parseUnionMember(expression: string): CastrSchema | undefined {
  // Try literal first (z.literal(...))
  const literal = parseLiteralZod(expression);
  if (literal) {
    return literal;
  }

  // Try primitive
  const primitive = parsePrimitiveZod(expression);
  if (primitive) {
    return primitive;
  }

  // Try array
  const array = parseArrayZod(expression);
  if (array) {
    return array;
  }

  // Try enum
  const enumSchema = parseEnumZod(expression);
  if (enumSchema) {
    return enumSchema;
  }

  // Try object
  const object = parseObjectZod(expression);
  if (object) {
    return object;
  }

  return undefined;
}

/**
 * Parse z.literal(...) expressions.
 * @internal
 */
function parseLiteralZod(expression: string): CastrSchema | undefined {
  const parsed = parseZodExpression(expression);
  if (!parsed) {
    return undefined;
  }

  const { baseMethod, baseArgs } = parsed;
  if (baseMethod !== 'literal') {
    return undefined;
  }

  const value = baseArgs[0];
  if (value === undefined) {
    return undefined;
  }

  return {
    const: value,
    metadata: createUnionMetadata(),
  };
}

// ============================================================================
// Union parsing
// ============================================================================

/**
 * Parse a Zod union expression into a CastrSchema with oneOf.
 *
 * @param expression - A Zod union expression string (e.g., 'z.union([z.string(), z.number()])')
 * @returns CastrSchema with oneOf array, or undefined if not a union expression
 *
 * @example
 * ```typescript
 * parseUnionZod('z.union([z.string(), z.number()])');
 * // => { oneOf: [{ type: 'string', ... }, { type: 'number', ... }], metadata: { ... } }
 *
 * parseUnionZod('z.union([z.literal("a"), z.literal("b")])');
 * // => { oneOf: [{ const: 'a', ... }, { const: 'b', ... }], metadata: { ... } }
 * ```
 *
 * @public
 */
export function parseUnionZod(expression: string): CastrSchema | undefined {
  const parsed = parseZodExpression(expression);
  if (!parsed) {
    return undefined;
  }

  const { baseMethod, baseArgs } = parsed;
  if (baseMethod !== 'union') {
    return undefined;
  }

  // First argument should be array of union members
  const memberExpressions = baseArgs[0];
  if (!Array.isArray(memberExpressions)) {
    return undefined;
  }

  const oneOf: CastrSchema[] = [];
  for (const memberExpr of memberExpressions) {
    if (typeof memberExpr !== 'string') {
      continue;
    }
    const memberSchema = parseUnionMember(memberExpr);
    if (memberSchema) {
      oneOf.push(memberSchema);
    }
  }

  if (oneOf.length === 0) {
    return undefined;
  }

  return {
    oneOf,
    metadata: createUnionMetadata(),
  };
}

// ============================================================================
// Discriminated union parsing
// ============================================================================

/**
 * Parse discriminated union variant expressions into schemas.
 * @internal
 */
function parseDiscriminatedUnionVariants(variantExpressions: unknown[]): CastrSchema[] {
  const oneOf: CastrSchema[] = [];
  for (const variantExpr of variantExpressions) {
    if (typeof variantExpr !== 'string') {
      continue;
    }
    const variantSchema = parseObjectZod(variantExpr);
    if (variantSchema) {
      oneOf.push(variantSchema);
    }
  }
  return oneOf;
}

/**
 * Parse a Zod discriminated union expression into a CastrSchema with oneOf and discriminator.
 *
 * @param expression - A Zod discriminated union expression string
 * @returns CastrSchema with oneOf and discriminator, or undefined if not a discriminated union
 *
 * @example
 * ```typescript
 * parseDiscriminatedUnionZod(`z.discriminatedUnion('type', [
 *   z.object({ type: z.literal('click'), x: z.number() }),
 *   z.object({ type: z.literal('scroll'), offset: z.number() }),
 * ])`);
 * // => { oneOf: [...], discriminator: { propertyName: 'type' }, metadata: { ... } }
 * ```
 *
 * @public
 */
export function parseDiscriminatedUnionZod(expression: string): CastrSchema | undefined {
  const parsed = parseZodExpression(expression);
  if (!parsed) {
    return undefined;
  }

  const { baseMethod, baseArgs } = parsed;
  if (baseMethod !== 'discriminatedUnion') {
    return undefined;
  }

  // First argument is the discriminator property name
  const discriminatorProperty = baseArgs[0];
  if (typeof discriminatorProperty !== 'string') {
    return undefined;
  }

  // Second argument should be array of object schemas
  const variantExpressions = baseArgs[1];
  if (!Array.isArray(variantExpressions)) {
    return undefined;
  }

  const oneOf = parseDiscriminatedUnionVariants(variantExpressions);
  if (oneOf.length === 0) {
    return undefined;
  }

  return {
    oneOf,
    discriminator: { propertyName: discriminatorProperty },
    metadata: createUnionMetadata(),
  };
}
