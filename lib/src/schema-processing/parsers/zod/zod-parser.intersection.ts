/**
 * Zod Intersection Parser
 *
 * Handles parsing of Zod intersection schemas: z.intersection(A, B).
 * Also handles chained .and() calls.
 *
 * @module parsers/zod/intersection
 */

import type { CastrSchema } from '../../ir/schema.js';
import { Node } from 'ts-morph';
import { createZodProject, getZodMethodChain } from './zod-ast.js';
import type { ZodSchemaParser } from './zod-parser.types.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import { createDefaultMetadata } from './zod-parser.defaults.js';
import { applyMetaAndReturn } from './zod-parser.meta.js';

/**
 * Validate and extract left/right schemas from intersection arguments.
 * @internal
 */
function parseIntersectionArgs(
  baseArgNodes: Node[],
  parseSchema: ZodSchemaParser,
): { left: CastrSchema; right: CastrSchema } | undefined {
  if (baseArgNodes.length < 2) {
    return undefined;
  }

  const leftNode = baseArgNodes[0];
  const rightNode = baseArgNodes[1];

  if (!leftNode || !rightNode) {
    return undefined;
  }

  const left = parseSchema(leftNode);
  const right = parseSchema(rightNode);

  if (!left || !right) {
    return undefined;
  }

  return { left, right };
}

/**
 * Parse a Zod intersection expression from a ts-morph Node.
 * Handles `z.intersection(A, B)`.
 * @internal
 */
export function parseIntersectionZodFromNode(
  node: Node,
  parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const chainInfo = getZodMethodChain(node);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, baseArgNodes, chainedMethods } = chainInfo;

  if (baseMethod !== 'intersection') {
    return undefined;
  }

  const args = parseIntersectionArgs(baseArgNodes, parseSchema);
  if (!args) {
    return undefined;
  }

  const schema: CastrSchema = {
    allOf: [args.left, args.right],
    metadata: createDefaultMetadata(),
  };

  return applyMetaAndReturn(schema, chainedMethods);
}

/**
 * Handle chained .and() calls: A.and(B)
 * @internal
 */
export function parseChainedIntersectionFromNode(
  node: Node,
  parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const expr = node.getExpression();
  if (!Node.isPropertyAccessExpression(expr)) {
    return undefined;
  }

  if (expr.getName() !== 'and') {
    return undefined;
  }

  const leftNode = expr.getExpression();
  const rightNode = node.getArguments()[0];

  if (!leftNode || !rightNode) {
    return undefined;
  }

  const left = parseSchema(leftNode);
  const right = parseSchema(rightNode);

  if (!left || !right) {
    return undefined;
  }

  return {
    allOf: [left, right],
    metadata: createDefaultMetadata(),
  };
}

// Register parsers with the core dispatcher
registerParser('intersection', parseIntersectionZodFromNode);
registerParser('chainedIntersection', parseChainedIntersectionFromNode);

/**
 * Parse a Zod intersection expression string.
 * @internal
 */
export function parseIntersectionZod(expression: string): CastrSchema | undefined {
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

  return parseIntersectionZodFromNode(init, parseZodSchemaFromNode);
}
