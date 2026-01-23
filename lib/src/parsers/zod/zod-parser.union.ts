/**
 * Zod Union Parser
 *
 * Handles parsing of Zod union schemas: union, discriminatedUnion, xor.
 *
 * @module parsers/zod/union
 */

import type { CastrSchema } from '../../ir/schema.js';
import { Node } from 'ts-morph';
import { createZodProject, getZodMethodChain, extractLiteralValue } from './zod-ast.js';
import type { ZodSchemaParser } from './zod-parser.types.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import { createDefaultMetadata } from './zod-parser.defaults.js';
import { applyMetaAndReturn } from './zod-parser.meta.js';

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Parse z.union([A, B])
 */
function parseUnion(
  args: Node[],
  parseSchema: ZodSchemaParser,
  outputKey: 'anyOf' | 'oneOf' = 'anyOf',
): CastrSchema | undefined {
  if (args.length === 0) {
    return undefined;
  }
  const itemsArg = args[0];

  if (!Node.isArrayLiteralExpression(itemsArg)) {
    return undefined;
  }

  const options: CastrSchema[] = [];
  for (const itemNode of itemsArg.getElements()) {
    const optionSchema = parseSchema(itemNode);
    if (optionSchema) {
      options.push(optionSchema);
    }
  }

  const schema: CastrSchema = {
    metadata: createDefaultMetadata(),
  };

  if (outputKey === 'anyOf') {
    schema.anyOf = options;
  } else {
    schema.oneOf = options;
  }

  return schema;
}

/**
 * Parse z.discriminatedUnion(key, [A, B])
 */
function parseDiscriminatedUnion(
  args: Node[],
  parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (args.length < 2) {
    return undefined;
  }

  const keyArg = args[0];
  const itemsArg = args[1];

  if (!keyArg) {
    return undefined;
  }

  const discriminatorKey = extractLiteralValue(keyArg);
  if (typeof discriminatorKey !== 'string') {
    return undefined;
  }

  if (!Node.isArrayLiteralExpression(itemsArg)) {
    return undefined;
  }

  const options: CastrSchema[] = [];
  for (const itemNode of itemsArg.getElements()) {
    const optionSchema = parseSchema(itemNode);
    if (optionSchema) {
      options.push(optionSchema);
    }
  }

  return {
    oneOf: options,
    discriminator: {
      propertyName: discriminatorKey,
    },
    metadata: createDefaultMetadata(),
  };
}

// ============================================================================
// Main exports
// ============================================================================

/**
 * Parse a Zod union expression from a ts-morph Node.
 * @internal
 */
export function parseUnionZodFromNode(
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

  if (baseMethod === 'union') {
    return applyMetaAndReturn(parseUnion(baseArgNodes, parseSchema), chainedMethods);
  }

  if (baseMethod === 'discriminatedUnion') {
    return applyMetaAndReturn(parseDiscriminatedUnion(baseArgNodes, parseSchema), chainedMethods);
  }

  if (baseMethod === 'xor') {
    return applyMetaAndReturn(parseUnion(baseArgNodes, parseSchema, 'oneOf'), chainedMethods);
  }

  return undefined;
}

// Register this parser with the core dispatcher
registerParser('union', parseUnionZodFromNode);

/**
 * Parse a Zod union expression string.
 * @internal
 */
export function parseUnionZod(expression: string): CastrSchema | undefined {
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

  return parseUnionZodFromNode(init, parseZodSchemaFromNode);
}
