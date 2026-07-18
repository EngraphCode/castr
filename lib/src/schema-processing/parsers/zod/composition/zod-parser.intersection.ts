/**
 * Zod Intersection Parser
 *
 * Handles parsing of Zod intersection schemas: z.intersection(A, B).
 * Also handles chained .and() calls.
 */

import type { CastrSchema } from '../../../ir/index.js';
import { Node } from 'ts-morph';
import {
  createZodProject,
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
  ZOD_CHAIN_COMPOSITION_OPERATORS,
  ZOD_METHOD_AND,
  ZOD_METHOD_INTERSECTION,
} from '../zod-constants.js';

/**
 * Chained methods recognised on z.intersection().
 * Anything outside this set fails fast as unsupported (finding C5).
 * @internal
 */
const INTERSECTION_CHAIN_METHODS: ReadonlySet<string> = buildCompositeChainMethods();

const INTERSECTION_MEMBER_CONTEXT = 'z.intersection member';
const AND_MEMBER_CONTEXT = '.and() intersection member';

/**
 * Parse one intersection member.
 * Fails fast on any member the parser cannot represent (finding C5).
 * @internal
 */
function parseIntersectionMember(
  memberNode: Node,
  parseSchema: ZodSchemaParser,
  memberContext: string,
): CastrSchema {
  const member = parseSchema(memberNode);
  if (!member) {
    throwUnsupportedMemberSchema(memberContext, memberNode);
  }
  return member;
}

/**
 * Validate and extract left/right schemas from intersection arguments.
 * Fails fast on members the parser cannot represent (finding C5).
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

  return {
    left: parseIntersectionMember(leftNode, parseSchema, INTERSECTION_MEMBER_CONTEXT),
    right: parseIntersectionMember(rightNode, parseSchema, INTERSECTION_MEMBER_CONTEXT),
  };
}

/**
 * Parse a Zod intersection expression from a ts-morph Node.
 * Handles `z.intersection(A, B)`.
 * @internal
 */
export function parseIntersectionZodFromNode(
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

  if (baseMethod !== ZOD_METHOD_INTERSECTION) {
    return undefined;
  }

  // z.intersection(A, B).and(C) / .or(C) / .array(): decline so the
  // chained-.and() / chained-.or() / chained-.array() parser — which owns
  // that composition operator and its trailing modifiers — claims the
  // whole chain. Whitelisting the method here instead would accept the
  // name while dropping its composition semantics (the silent no-op
  // class this module exists to prevent).
  if (chainedMethods.some((method) => ZOD_CHAIN_COMPOSITION_OPERATORS.has(method.name))) {
    return undefined;
  }

  assertSupportedChainedMethods(
    `z.${baseMethod}()`,
    chainedMethods,
    INTERSECTION_CHAIN_METHODS,
    node,
  );

  const args = parseIntersectionArgs(baseArgNodes, parseSchema);
  if (!args) {
    return undefined;
  }

  const schema: CastrSchema = {
    allOf: [args.left, args.right],
    metadata: createDefaultMetadata(),
  };

  return finalizeCompositeSchema(schema, chainedMethods);
}

/**
 * Handle chained .and() calls, including trailing chained modifiers the
 * writer emits (ADR-032 parser/writer lockstep): `A.and(B)` and
 * `A.and(B).optional()` both parse, with the trailing chain enforced
 * against the intersection whitelist and captured into metadata.
 *
 * Declines chains where an `.or()` or `.array()` link sits outermore
 * than every `.and()` link: the chained-union / chained-array parser
 * owns those.
 *
 * @internal
 */
export function parseChainedIntersectionFromNode(
  node: Node,
  parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const split = splitChainAroundOperator(node, ZOD_METHOD_AND, ZOD_CHAIN_COMPOSITION_OPERATORS);
  if (!split) {
    return undefined;
  }

  const andExpr = split.operatorCall.getExpression();
  if (!Node.isPropertyAccessExpression(andExpr)) {
    return undefined;
  }

  const leftNode = andExpr.getExpression();
  const rightNode = split.operatorCall.getArguments()[0];

  if (!leftNode || !rightNode) {
    return undefined;
  }

  assertSupportedChainedMethods(
    '.and() intersection',
    split.trailingMethods,
    INTERSECTION_CHAIN_METHODS,
    node,
  );

  const schema: CastrSchema = {
    allOf: [
      parseIntersectionMember(leftNode, parseSchema, AND_MEMBER_CONTEXT),
      parseIntersectionMember(rightNode, parseSchema, AND_MEMBER_CONTEXT),
    ],
    metadata: createDefaultMetadata(),
  };

  return finalizeCompositeSchema(schema, split.trailingMethods);
}

// Register parsers with the core dispatcher
registerParser('intersection', parseIntersectionZodFromNode);
registerParser('chainedIntersection', parseChainedIntersectionFromNode);

/**
 * Parse a Zod intersection expression string.
 * @internal
 */
export function parseIntersectionZod(expression: string): CastrSchema | undefined {
  const { sourceFile, resolver } = createZodProject(`const __schema = ${expression};`);

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver);
  return parseIntersectionZodFromNode(init, boundParseSchema, resolver);
}
