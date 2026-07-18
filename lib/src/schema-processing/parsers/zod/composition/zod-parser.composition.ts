/**
 * Zod Composition Parser
 *
 * Handles parsing of Zod composition schemas: array, tuple, enum.
 */

import type { CastrSchema } from '../../../ir/index.js';
import { Node } from 'ts-morph';
import {
  createZodProject,
  getZodMethodChain,
  isZodOrZodNamespace,
  requireNumericArgument,
  splitChainAroundOperator,
  throwUnsupportedMemberSchema,
  type ZodMethodCall,
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
import { parseEnum } from './zod-parser.enum.js';
import {
  ZOD_CHAIN_COMPOSITION_OPERATORS,
  ZOD_METHOD_ARRAY,
  ZOD_METHOD_ENUM,
  ZOD_METHOD_NATIVE_ENUM,
  ZOD_METHOD_REST,
  ZOD_METHOD_TUPLE,
  ZOD_SCHEMA_TYPE_ARRAY,
} from '../zod-constants.js';

// ============================================================================
// Helper functions - extracted to reduce complexity
// ============================================================================

/**
 * Parse z.array(T)
 */
function parseArray(
  args: Node[],
  chainedMethods: ZodMethodCall[],
  parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (args.length === 0) {
    return undefined;
  }

  const itemArg = args[0];
  if (!itemArg) {
    return undefined;
  }

  const itemSchema = parseSchema(itemArg);
  if (!itemSchema) {
    throwUnsupportedMemberSchema('z.array item', itemArg);
  }

  const schema: CastrSchema = {
    type: ZOD_SCHEMA_TYPE_ARRAY,
    items: itemSchema,
    metadata: createDefaultMetadata(),
  };

  applyArrayConstraints(schema, chainedMethods);
  return schema;
}

/**
 * Dispatch table for array constraint methods.
 * Each handler requires a statically extractable argument and fails
 * fast otherwise, so a recognised constraint can never no-op silently.
 * @internal
 */
const ARRAY_CONSTRAINT_HANDLERS: Readonly<
  Record<string, (schema: CastrSchema, method: ZodMethodCall) => void>
> = {
  min: (schema, method) => {
    schema.minItems = requireNumericArgument(method);
  },
  max: (schema, method) => {
    schema.maxItems = requireNumericArgument(method);
  },
  length: (schema, method) => {
    const arg = requireNumericArgument(method);
    schema.minItems = arg;
    schema.maxItems = arg;
  },
  nonempty: (schema) => {
    schema.minItems = 1;
  },
};

/**
 * Apply array constraints from method chain.
 */
function applyArrayConstraints(schema: CastrSchema, methods: ZodMethodCall[]): void {
  for (const method of methods) {
    const handler = ARRAY_CONSTRAINT_HANDLERS[method.name];
    if (handler) {
      handler(schema, method);
    }
  }
}

/**
 * Strict chain whitelists per composition kind (finding C5): the shared
 * composite modifiers plus each kind's specific constraint methods.
 * @internal
 */
const ARRAY_CHAIN_METHODS = buildCompositeChainMethods(...Object.keys(ARRAY_CONSTRAINT_HANDLERS));
const TUPLE_CHAIN_METHODS = buildCompositeChainMethods(ZOD_METHOD_REST);
const ENUM_CHAIN_METHODS = buildCompositeChainMethods();

/**
 * Handle the `.array()` schema-method shorthand — `z.string().array()` is
 * equivalent to `z.array(z.string())` (verified against zod 4.4.3).
 * Trailing chained methods apply to the ARRAY
 * (`z.string().array().optional()` is an optional array), while methods
 * before `.array()` stay with the ELEMENT and are parsed recursively
 * (`z.string().optional().array()` is an array of optional strings).
 *
 * Claims a chain only when `.array()` is the outermost composition link:
 * declines when an `.or()` / `.and()` link sits outermore (the chained
 * union/intersection parsers own those), and declines the base-call form
 * `z.array(T)` — receiver is the zod namespace and the element travels as
 * an argument — so the standard composition parser owns it.
 *
 * @internal
 */
export function parseChainedArrayFromNode(
  node: Node,
  parseSchema: ZodSchemaParser,
  resolver?: ZodImportResolver,
): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const split = splitChainAroundOperator(node, ZOD_METHOD_ARRAY, ZOD_CHAIN_COMPOSITION_OPERATORS);
  if (!split || split.operatorCall.getArguments().length > 0) {
    return undefined;
  }

  const arrayExpr = split.operatorCall.getExpression();
  if (!Node.isPropertyAccessExpression(arrayExpr)) {
    return undefined;
  }

  const elementNode = arrayExpr.getExpression();
  if (resolver && isZodOrZodNamespace(elementNode, resolver)) {
    return undefined;
  }

  assertSupportedChainedMethods('.array()', split.trailingMethods, ARRAY_CHAIN_METHODS, node);

  const itemSchema = parseSchema(elementNode);
  if (!itemSchema) {
    throwUnsupportedMemberSchema('.array() element', elementNode);
  }

  const schema: CastrSchema = {
    type: ZOD_SCHEMA_TYPE_ARRAY,
    items: itemSchema,
    metadata: createDefaultMetadata(),
  };

  applyArrayConstraints(schema, split.trailingMethods);
  return finalizeCompositeSchema(schema, split.trailingMethods);
}

/**
 * Process rest method for tuple.
 * Fails fast when the .rest() argument is missing or unrecognised (finding C5).
 */
function processRestMethod(
  schema: CastrSchema,
  method: ZodMethodCall,
  parseSchema: ZodSchemaParser,
): void {
  const restArg = method.argNodes[0];
  if (!restArg) {
    throw new Error(
      'Unsupported z.tuple() .rest() call without an argument. ' +
        'The Zod parser fails fast on unrecognised constructs instead of silently dropping them.',
    );
  }
  const restSchema = parseSchema(restArg);
  if (!restSchema) {
    throwUnsupportedMemberSchema('z.tuple() .rest() argument', restArg);
  }
  schema.items = restSchema;
  delete schema.maxItems;
}

/**
 * Parse z.tuple([...])
 */
function parseTuple(
  args: Node[],
  chainedMethods: ZodMethodCall[],
  parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (args.length === 0) {
    return undefined;
  }
  const itemsArg = args[0];

  if (!itemsArg || !Node.isArrayLiteralExpression(itemsArg)) {
    return undefined;
  }

  const prefixItems: CastrSchema[] = [];
  for (const itemNode of itemsArg.getElements()) {
    const itemSchema = parseSchema(itemNode);
    if (!itemSchema) {
      throwUnsupportedMemberSchema('z.tuple member', itemNode);
    }
    prefixItems.push(itemSchema);
  }

  const schema: CastrSchema = {
    type: ZOD_SCHEMA_TYPE_ARRAY,
    prefixItems,
    minItems: prefixItems.length,
    maxItems: prefixItems.length,
    metadata: createDefaultMetadata(),
  };

  for (const method of chainedMethods) {
    if (method.name === ZOD_METHOD_REST) {
      processRestMethod(schema, method, parseSchema);
    }
  }

  return schema;
}

// ============================================================================
// Main exports
// ============================================================================

/**
 * Parse a Zod composition expression from a ts-morph Node.
 * @internal
 */
function parseCompositionByKind(
  chainInfo: NonNullable<ReturnType<typeof getZodMethodChain>>,
  parseSchema: ZodSchemaParser,
  node: Node,
): CastrSchema | undefined {
  const { baseMethod, chainedMethods, baseArgNodes } = chainInfo;

  if (baseMethod === ZOD_METHOD_ARRAY) {
    assertSupportedChainedMethods(`z.${baseMethod}()`, chainedMethods, ARRAY_CHAIN_METHODS, node);
    return parseArray(baseArgNodes, chainedMethods, parseSchema);
  }
  if (baseMethod === ZOD_METHOD_TUPLE) {
    assertSupportedChainedMethods(`z.${baseMethod}()`, chainedMethods, TUPLE_CHAIN_METHODS, node);
    return parseTuple(baseArgNodes, chainedMethods, parseSchema);
  }
  if (baseMethod === ZOD_METHOD_ENUM || baseMethod === ZOD_METHOD_NATIVE_ENUM) {
    assertSupportedChainedMethods(`z.${baseMethod}()`, chainedMethods, ENUM_CHAIN_METHODS, node);
    return parseEnum(baseArgNodes, baseMethod);
  }
  return undefined;
}

export function parseCompositionZodFromNode(
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

  const schema = parseCompositionByKind(chainInfo, parseSchema, node);
  return finalizeCompositeSchema(schema, chainInfo.chainedMethods);
}

// Register parsers with the core dispatcher
registerParser('composition', parseCompositionZodFromNode);
registerParser('chainedArray', parseChainedArrayFromNode);

/**
 * Parse a Zod composition expression string.
 * @internal
 */
export function parseCompositionZod(expression: string): CastrSchema | undefined {
  const { sourceFile, resolver } = createZodProject(`const __schema = ${expression};`);

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver);
  return parseCompositionZodFromNode(init, boundParseSchema, resolver);
}
