/**
 * Zod Reference Parser
 *
 * Handles parsing of references (Identifiers) and recursion (z.lazy).
 *
 * @module parsers/zod/references
 */

import type { CastrSchema } from '../../ir/schema.js';
import { type ArrowFunction, type FunctionExpression, type Identifier, Node } from 'ts-morph';
import { createZodProject, getZodMethodChain } from './zod-ast.js';
import type { ZodImportResolver } from './zod-import-resolver.js';
import type { ZodSchemaParser } from './zod-parser.types.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import { createDefaultMetadata } from './zod-parser.defaults.js';
import { ZOD_METHOD_LAZY } from './zod-constants.js';

const COMPONENT_SCHEMA_REF_PREFIX = '#/components/schemas/' as const;

// ============================================================================
// Helper functions - extracted to reduce complexity and nesting
// ============================================================================

/**
 * Handle identifier references to other schemas.
 * @internal
 */
function handleIdentifier(node: Identifier): CastrSchema | undefined {
  const symbolName = node.getSymbol()?.getName();
  if (!symbolName) {
    return undefined;
  }

  return {
    $ref: `${COMPONENT_SCHEMA_REF_PREFIX}${symbolName}`,
    metadata: createDefaultMetadata(),
  };
}

/**
 * Extract schema from arrow function concise body.
 * @internal
 */
function extractFromConciseBody(body: Node, parseSchema: ZodSchemaParser): CastrSchema | undefined {
  if (!Node.isExpression(body)) {
    return undefined;
  }
  return parseSchema(body);
}

/**
 * Extract schema from function block body.
 * @internal
 */
function extractFromBlockBody(body: Node, parseSchema: ZodSchemaParser): CastrSchema | undefined {
  if (!Node.isBlock(body)) {
    return undefined;
  }

  const returnStat = body.getStatement((s) => Node.isReturnStatement(s));
  if (!Node.isReturnStatement(returnStat)) {
    return undefined;
  }

  const expr = returnStat.getExpression();
  if (!expr) {
    return undefined;
  }

  return parseSchema(expr);
}

function extractLazyCallback(baseArgNodes: Node[]): ArrowFunction | FunctionExpression | undefined {
  const callback = baseArgNodes[0];
  if (!callback) {
    return undefined;
  }

  if (!Node.isArrowFunction(callback) && !Node.isFunctionExpression(callback)) {
    return undefined;
  }

  return callback;
}

/**
 * Handle z.lazy(() => Schema) calls.
 * @internal
 */
function handleLazy(
  node: Node,
  parseSchema: ZodSchemaParser,
  resolver?: ZodImportResolver,
): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }
  if (!resolver) {
    return undefined;
  }

  const chainInfo = getZodMethodChain(node, resolver);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, baseArgNodes } = chainInfo;

  if (baseMethod !== ZOD_METHOD_LAZY) {
    return undefined;
  }

  const callback = extractLazyCallback(baseArgNodes);
  if (!callback) {
    return undefined;
  }

  const body = callback.getBody();

  // Try concise body first, then block body
  return extractFromConciseBody(body, parseSchema) ?? extractFromBlockBody(body, parseSchema);
}

// ============================================================================
// Main exports
// ============================================================================

/**
 * Parse a Zod reference or lazy schema from a ts-morph Node.
 * @internal
 */
export function parseReferenceZodFromNode(
  node: Node,
  parseSchema: ZodSchemaParser,
  resolver?: ZodImportResolver,
): CastrSchema | undefined {
  // Handle Identifiers (References to other schemas)
  if (Node.isIdentifier(node)) {
    return handleIdentifier(node);
  }

  // Handle z.lazy(() => Schema)
  return handleLazy(node, parseSchema, resolver);
}

// Register this parser with the core dispatcher
registerParser('reference', parseReferenceZodFromNode);
registerParser('identifier', parseReferenceZodFromNode);

/**
 * Parse a Zod reference expression string.
 * @internal
 */
export function parseReferenceZod(expression: string): CastrSchema | undefined {
  const { sourceFile, resolver } = createZodProject(`const __schema = ${expression};`);

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init) {
    return undefined;
  }

  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver);
  return parseReferenceZodFromNode(init, boundParseSchema, resolver);
}
