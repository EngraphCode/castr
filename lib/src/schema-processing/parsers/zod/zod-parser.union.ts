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
import type { ZodImportResolver } from './zod-import-resolver.js';
import type { ZodSchemaParser } from './zod-parser.types.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import { createDefaultMetadata } from './zod-parser.defaults.js';
import { applyMetaAndReturn } from './zod-parser.meta.js';
import {
  ZOD_METHOD_DISCRIMINATED_UNION,
  ZOD_METHOD_UNION,
  ZOD_METHOD_XOR,
} from './zod-constants.js';

const UNION_OUTPUT_KEY_ANY_OF = 'anyOf' as const;
const UNION_OUTPUT_KEY_ONE_OF = 'oneOf' as const;

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Parse z.union([A, B])
 */
function parseUnion(
  args: Node[],
  parseSchema: ZodSchemaParser,
  outputKey:
    | typeof UNION_OUTPUT_KEY_ANY_OF
    | typeof UNION_OUTPUT_KEY_ONE_OF = UNION_OUTPUT_KEY_ANY_OF,
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

  if (outputKey === UNION_OUTPUT_KEY_ANY_OF) {
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

  const { baseMethod, baseArgNodes, chainedMethods } = chainInfo;

  if (baseMethod === ZOD_METHOD_UNION) {
    return applyMetaAndReturn(parseUnion(baseArgNodes, parseSchema), chainedMethods);
  }

  if (baseMethod === ZOD_METHOD_DISCRIMINATED_UNION) {
    return applyMetaAndReturn(parseDiscriminatedUnion(baseArgNodes, parseSchema), chainedMethods);
  }

  if (baseMethod === ZOD_METHOD_XOR) {
    return applyMetaAndReturn(
      parseUnion(baseArgNodes, parseSchema, UNION_OUTPUT_KEY_ONE_OF),
      chainedMethods,
    );
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
  const { sourceFile, resolver } = createZodProject(`const __schema = ${expression};`);

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver);
  return parseUnionZodFromNode(init, boundParseSchema, resolver);
}
