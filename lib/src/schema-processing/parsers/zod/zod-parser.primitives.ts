/**
 * Zod Primitive Schema Parsing
 *
 * Parses primitive Zod types with method chains into CastrSchema structures.
 * Uses ts-morph AST traversal (ADR-026 compliant - no regex).
 *
 * @module parsers/zod/primitives
 *
 * @example
 * ```typescript
 * import { parsePrimitiveZod } from './zod-parser.primitives.js';
 *
 * const schema = parsePrimitiveZod('z.string().min(1).max(100).email().optional()');
 * ```
 */

import type { CastrSchema, IRZodChainInfo } from '../../ir/schema.js';
import { Node } from 'ts-morph';
import {
  createZodProject,
  getZodMethodChain,
  type ZodMethodCall,
  type ZodMethodChainInfo,
  ZOD_PRIMITIVES,
} from './zod-ast.js';
import type { ZodImportResolver } from './zod-import-resolver.js';
import {
  createDefaultMetadata,
  ZOD_PRIMITIVE_TYPES,
  deriveLiteralType,
} from './zod-parser.defaults.js';
import { applyMetaAndReturn } from './zod-parser.meta.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import type { ZodSchemaParser } from './zod-parser.types.js';

import type { ParsedConstraints, ParsedOptionality } from './zod-parser.constraints.js';
import {
  processOptionalityMethod,
  processTypeConstraints,
  applyConstraints,
  applyOptionalFields,
} from './zod-parser.constraints.js';
import { applyZod4Formats } from './zod-parser.zod4-formats.js';
import { buildZodChainInfo } from './zod-parser.primitives.chain.js';
import {
  ZOD_BASE_METHOD_LITERAL,
  ZOD_BASE_METHOD_NULL,
  ZOD_BASE_METHOD_UNDEFINED,
  ZOD_METHOD_DEFAULT,
  ZOD_METHOD_DESCRIBE,
  ZOD_METHOD_META,
} from './zod-constants.js';

const ZOD_PRIMITIVES_SET = new Set<string>(ZOD_PRIMITIVES);

interface ProcessedChain {
  constraints: ParsedConstraints;
  optionality: ParsedOptionality;
  defaultValue: unknown;
  description: string | undefined;
}

/**
 * Process a single chain method, returning extracted info.
 * @internal
 */
function processChainMethod(
  baseMethod: string,
  method: ZodMethodCall,
  state: ProcessedChain,
): void {
  if (method.name === ZOD_METHOD_DEFAULT) {
    state.defaultValue = method.args[0];
    return;
  }
  if (method.name === ZOD_METHOD_DESCRIBE) {
    const arg = method.args[0];
    if (typeof arg === 'string') {
      state.description = arg;
    }
    return;
  }
  if (method.name === ZOD_METHOD_META) {
    return;
  }
  processOptionalityMethod(method, state.optionality);
  processTypeConstraints(baseMethod, method, state.constraints);
}

function processChainMethods(baseMethod: string, chainedMethods: ZodMethodCall[]): ProcessedChain {
  const state: ProcessedChain = {
    constraints: {},
    optionality: { optional: false, nullable: false },
    defaultValue: undefined,
    description: undefined,
  };

  for (const method of chainedMethods) {
    processChainMethod(baseMethod, method, state);
  }

  return state;
}

/**
 * Handle z.undefined() schema.
 * @internal
 */
function handleUndefinedSchema(zodChain: IRZodChainInfo): CastrSchema {
  return {
    type: undefined,
    metadata: createDefaultMetadata({ required: false, zodChain }),
  };
}

/**
 * Handle z.literal() schema.
 * @internal
 */
function handleLiteralSchema(
  chainInfo: ReturnType<typeof getZodMethodChain>,
  optionality: ParsedOptionality,
  zodChain: IRZodChainInfo,
  defaultValue: unknown,
): CastrSchema {
  const literalValue = chainInfo?.baseArgs[0];
  const derivedType = deriveLiteralType(literalValue);

  const schema: CastrSchema = {
    type: derivedType,
    enum: [literalValue],
    metadata: createDefaultMetadata({
      required: !optionality.optional,
      nullable: literalValue === null || optionality.nullable,
      zodChain,
      defaultValue,
    }),
  };

  applyOptionalFields(schema, defaultValue, undefined);
  return schema;
}

/**
 * Handle standard primitive schemas.
 * @internal
 */
function handleStandardPrimitive(
  baseMethod: string,
  schemaType: CastrSchema['type'],
  optionality: ParsedOptionality,
  constraints: ParsedConstraints,
  zodChain: IRZodChainInfo,
  defaultValue: unknown,
  description: string | undefined,
): CastrSchema {
  const schema: CastrSchema = {
    type: schemaType,
    metadata: createDefaultMetadata({
      nullable: baseMethod === ZOD_BASE_METHOD_NULL || optionality.nullable,
      required: !optionality.optional,
      zodChain,
      defaultValue,
    }),
  };

  applyConstraints(schema, constraints);
  applyOptionalFields(schema, defaultValue, description);
  applyZod4Formats(schema, baseMethod);

  return schema;
}

/**
 * Parse a primitive Zod expression from a ts-morph Node.
 * @internal
 */
function validateAndGetChainInfo(
  node: Node,
  resolver?: ZodImportResolver,
): ZodMethodChainInfo | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }
  if (!resolver) {
    return undefined;
  }
  const chainInfo = getZodMethodChain(node, resolver);
  if (!chainInfo || !ZOD_PRIMITIVES_SET.has(chainInfo.baseMethod)) {
    return undefined;
  }
  return chainInfo;
}

export function parsePrimitiveZodFromNode(
  node: Node,

  _parseSchema: ZodSchemaParser,
  resolver?: ZodImportResolver,
): CastrSchema | undefined {
  const chainInfo = validateAndGetChainInfo(node, resolver);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, chainedMethods } = chainInfo;
  const schemaType = ZOD_PRIMITIVE_TYPES.get(baseMethod);
  if (
    schemaType === undefined &&
    baseMethod !== ZOD_BASE_METHOD_UNDEFINED &&
    baseMethod !== ZOD_BASE_METHOD_LITERAL
  ) {
    return undefined;
  }

  const processed = processChainMethods(baseMethod, chainedMethods);
  const zodChain = buildZodChainInfo(chainedMethods, processed.optionality, processed.defaultValue);

  if (baseMethod === ZOD_BASE_METHOD_UNDEFINED) {
    return applyMetaAndReturn(handleUndefinedSchema(zodChain), chainedMethods);
  }

  if (baseMethod === ZOD_BASE_METHOD_LITERAL) {
    return applyMetaAndReturn(
      handleLiteralSchema(chainInfo, processed.optionality, zodChain, processed.defaultValue),
      chainedMethods,
    );
  }

  return applyMetaAndReturn(
    handleStandardPrimitive(
      baseMethod,
      schemaType,
      processed.optionality,
      processed.constraints,
      zodChain,
      processed.defaultValue,
      processed.description,
    ),
    chainedMethods,
  );
}

// Register this parser with the core dispatcher
registerParser('primitive', parsePrimitiveZodFromNode);

/**
 * Parse a primitive Zod expression into a CastrSchema using ts-morph AST.
 * @returns CastrSchema if this is a recognized primitive, undefined otherwise
 *
 * @public
 */
export function parsePrimitiveZod(expression: string): CastrSchema | undefined {
  const { sourceFile, resolver } = createZodProject(`const __schema = ${expression};`);

  const init = sourceFile.getVariableDeclarations()[0]?.getInitializer();
  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver);
  return parsePrimitiveZodFromNode(init, boundParseSchema, resolver);
}
