/**
 * Zod Intersection Type Parsing
 *
 * Handles parsing of Zod intersection types (z.intersection(), .and())
 * into CastrSchema structures using ts-morph AST (ADR-026 compliant).
 *
 * @module parsers/zod/intersection
 * @internal
 */

import { Node } from 'ts-morph';
import type { CastrSchema } from '../../ir/schema.js';
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
 * Create default metadata for intersection schemas.
 * @internal
 */
function createIntersectionMetadata(): CastrSchema['metadata'] {
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
 * Parse a single intersection member expression into a CastrSchema.
 * @internal
 */
function parseIntersectionMember(expression: string): CastrSchema | undefined {
  // Try primitive
  const primitive = parsePrimitiveZod(expression);
  if (primitive) {
    return primitive;
  }

  // Try object
  const object = parseObjectZod(expression);
  if (object) {
    return object;
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

  return undefined;
}

// ============================================================================
// Intersection parsing
// ============================================================================

/**
 * Parse a Zod intersection expression into a CastrSchema with allOf.
 *
 * @param expression - A Zod intersection expression string (e.g., 'z.intersection(A, B)')
 * @returns CastrSchema with allOf array, or undefined if not an intersection expression
 *
 * @example
 * ```typescript
 * parseIntersectionZod('z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() }))');
 * // => { allOf: [{ type: 'object', ... }, { type: 'object', ... }], metadata: { ... } }
 * ```
 *
 * @public
 */
export function parseIntersectionZod(expression: string): CastrSchema | undefined {
  const parsed = parseZodExpression(expression);
  if (!parsed) {
    return undefined;
  }

  const { baseMethod, baseArgs } = parsed;
  if (baseMethod !== 'intersection') {
    return undefined;
  }

  // Both arguments are the intersection members
  const allOf: CastrSchema[] = [];
  for (const memberExpr of baseArgs) {
    if (typeof memberExpr !== 'string') {
      continue;
    }
    const memberSchema = parseIntersectionMember(memberExpr);
    if (memberSchema) {
      allOf.push(memberSchema);
    }
  }

  if (allOf.length === 0) {
    return undefined;
  }

  return {
    allOf,
    metadata: createIntersectionMetadata(),
  };
}
