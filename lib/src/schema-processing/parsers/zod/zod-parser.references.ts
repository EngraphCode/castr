/**
 * Zod Reference Parser
 *
 * Handles parsing of references (Identifiers) and recursion (z.lazy).
 *
 * @module parsers/zod/references
 */

import type { CastrSchema } from '../../ir/schema.js';
import { Node } from 'ts-morph';
import { createZodProject, getZodMethodChain } from './zod-ast.js';
import type { ZodSchemaParser } from './zod-parser.types.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import { createDefaultMetadata } from './zod-parser.defaults.js';

// ============================================================================
// Helper functions - extracted to reduce complexity and nesting
// ============================================================================

/**
 * Handle identifier references to other schemas.
 * @internal
 */
function handleIdentifier(node: Node): CastrSchema {
  const name = node.getText();
  return {
    $ref: `#/components/schemas/${name}`,
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

/**
 * Handle z.lazy(() => Schema) calls.
 * @internal
 */
function handleLazy(node: Node, parseSchema: ZodSchemaParser): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const chainInfo = getZodMethodChain(node);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, baseArgNodes } = chainInfo;

  if (baseMethod !== 'lazy') {
    return undefined;
  }

  if (baseArgNodes.length === 0) {
    return undefined;
  }

  const fnArg = baseArgNodes[0];
  if (!Node.isArrowFunction(fnArg) && !Node.isFunctionExpression(fnArg)) {
    return undefined;
  }

  const body = fnArg.getBody();

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
): CastrSchema | undefined {
  // Handle Identifiers (References to other schemas)
  if (Node.isIdentifier(node)) {
    return handleIdentifier(node);
  }

  // Handle z.lazy(() => Schema)
  return handleLazy(node, parseSchema);
}

// Register this parser with the core dispatcher
registerParser('reference', parseReferenceZodFromNode);
registerParser('identifier', parseReferenceZodFromNode);

/**
 * Parse a Zod reference expression string.
 * @internal
 */
export function parseReferenceZod(expression: string): CastrSchema | undefined {
  const project = createZodProject(`const __schema = ${expression};`);
  const sourceFile = project.getSourceFiles()[0];
  if (!sourceFile) {
    return undefined;
  }

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init) {
    return undefined;
  }

  return parseReferenceZodFromNode(init, parseZodSchemaFromNode);
}
