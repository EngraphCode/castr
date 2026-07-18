/**
 * Zod Union Parser
 *
 * Handles parsing of Zod union schemas: union, discriminatedUnion, xor.
 * Also handles chained .or() calls (Zod's union shorthand).
 */

import type { CastrSchema } from '../../../ir/index.js';
import { Node } from 'ts-morph';
import {
  createZodProject,
  extractLiteralValue,
  getZodMethodChain,
  splitChainAroundOperator,
  throwUnsupportedMemberSchema,
} from '../ast/zod-ast.js';
import type { ZodImportResolver } from '../registry/zod-import-resolver.js';
import type { ZodSchemaParser } from '../zod-parser.types.js';
import { registerParser, parseZodSchemaFromNode } from '../zod-parser.core.js';
import { createDefaultMetadata } from '../modifiers/zod-parser.defaults.js';
import {
  assertSupportedChainedMethods,
  buildCompositeChainMethods,
  finalizeCompositeSchema,
} from '../modifiers/zod-parser.chain-whitelist.js';
import {
  ZOD_METHOD_AND,
  ZOD_METHOD_DISCRIMINATED_UNION,
  ZOD_METHOD_OR,
  ZOD_METHOD_UNION,
  ZOD_METHOD_XOR,
} from '../zod-constants.js';

const UNION_OUTPUT_KEY_ANY_OF = 'anyOf';
const UNION_OUTPUT_KEY_ONE_OF = 'oneOf';

/**
 * Chained methods recognised on union base methods.
 * Anything outside this set fails fast as unsupported (finding C5).
 * @internal
 */
const UNION_CHAIN_METHODS: ReadonlySet<string> = buildCompositeChainMethods();

/**
 * Member-slot error context per union base method.
 * Doubles as the recogniser for union-family base methods.
 * @internal
 */
const UNION_MEMBER_CONTEXTS: Readonly<Record<string, string>> = {
  [ZOD_METHOD_UNION]: 'z.union member',
  [ZOD_METHOD_DISCRIMINATED_UNION]: 'z.discriminatedUnion member',
  [ZOD_METHOD_XOR]: 'z.xor member',
};

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Parse every member of a union-like array literal.
 * Fails fast on any member the parser cannot represent (finding C5).
 * @internal
 */
function parseUnionMembers(
  itemsArg: Node,
  parseSchema: ZodSchemaParser,
  memberContext: string,
): CastrSchema[] {
  const options: CastrSchema[] = [];
  if (!Node.isArrayLiteralExpression(itemsArg)) {
    return options;
  }
  for (const itemNode of itemsArg.getElements()) {
    const optionSchema = parseSchema(itemNode);
    if (!optionSchema) {
      throwUnsupportedMemberSchema(memberContext, itemNode);
    }
    options.push(optionSchema);
  }
  return options;
}

/**
 * Parse z.union([A, B])
 */
function parseUnion(
  args: Node[],
  parseSchema: ZodSchemaParser,
  memberContext: string,
  outputKey:
    typeof UNION_OUTPUT_KEY_ANY_OF | typeof UNION_OUTPUT_KEY_ONE_OF = UNION_OUTPUT_KEY_ANY_OF,
): CastrSchema | undefined {
  if (args.length === 0) {
    return undefined;
  }
  const itemsArg = args[0];

  if (!itemsArg || !Node.isArrayLiteralExpression(itemsArg)) {
    return undefined;
  }

  const options = parseUnionMembers(itemsArg, parseSchema, memberContext);

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

  if (!itemsArg || !Node.isArrayLiteralExpression(itemsArg)) {
    return undefined;
  }

  const options = parseUnionMembers(itemsArg, parseSchema, 'z.discriminatedUnion member');

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
  if (!Node.isCallExpression(node) || !resolver) {
    return undefined;
  }

  const chainInfo = getZodMethodChain(node, resolver);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, baseArgNodes, chainedMethods } = chainInfo;

  const memberContext = UNION_MEMBER_CONTEXTS[baseMethod];
  if (!memberContext) {
    return undefined;
  }

  assertSupportedChainedMethods(`z.${baseMethod}()`, chainedMethods, UNION_CHAIN_METHODS, node);

  const outputKey =
    baseMethod === ZOD_METHOD_XOR ? UNION_OUTPUT_KEY_ONE_OF : UNION_OUTPUT_KEY_ANY_OF;
  const schema =
    baseMethod === ZOD_METHOD_DISCRIMINATED_UNION
      ? parseDiscriminatedUnion(baseArgNodes, parseSchema)
      : parseUnion(baseArgNodes, parseSchema, memberContext, outputKey);

  return finalizeCompositeSchema(schema, chainedMethods);
}

const OR_MEMBER_CONTEXT = '.or() union member';

/**
 * Parse one .or() union member.
 * Fails fast on any member the parser cannot represent (finding C5).
 * @internal
 */
function parseOrMember(memberNode: Node, parseSchema: ZodSchemaParser): CastrSchema {
  const member = parseSchema(memberNode);
  if (!member) {
    throwUnsupportedMemberSchema(OR_MEMBER_CONTEXT, memberNode);
  }
  return member;
}

/**
 * Handle chained .or() calls — Zod's union shorthand — including trailing
 * chained modifiers: `A.or(B)` and `A.or(B).optional()` both parse into
 * the same `anyOf` IR as `z.union([A, B])`, with the trailing chain
 * enforced against the union whitelist and captured into metadata.
 *
 * Declines chains where an `.and()` link sits outermore than every
 * `.or()` link: the chained-intersection parser owns those.
 *
 * @internal
 */
export function parseChainedUnionFromNode(
  node: Node,
  parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const split = splitChainAroundOperator(node, ZOD_METHOD_OR, ZOD_METHOD_AND);
  if (!split) {
    return undefined;
  }

  const orExpr = split.operatorCall.getExpression();
  if (!Node.isPropertyAccessExpression(orExpr)) {
    return undefined;
  }

  const leftNode = orExpr.getExpression();
  const rightNode = split.operatorCall.getArguments()[0];

  if (!leftNode || !rightNode) {
    return undefined;
  }

  assertSupportedChainedMethods('.or() union', split.trailingMethods, UNION_CHAIN_METHODS, node);

  const schema: CastrSchema = {
    anyOf: [parseOrMember(leftNode, parseSchema), parseOrMember(rightNode, parseSchema)],
    metadata: createDefaultMetadata(),
  };

  return finalizeCompositeSchema(schema, split.trailingMethods);
}

// Register parsers with the core dispatcher
registerParser('union', parseUnionZodFromNode);
registerParser('chainedUnion', parseChainedUnionFromNode);

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
