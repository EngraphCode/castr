/**
 * Zod Primitive Schema Parsing
 *
 * Parses primitive Zod types with method chains into CastrSchema structures.
 * Uses ts-morph AST traversal (ADR-026 compliant - no regex).
 *
 *
 * @example
 * ```typescript
 * import { parsePrimitiveZod } from './zod-parser.primitives.js';
 *
 * const schema = parsePrimitiveZod('z.string().min(1).max(100).email().optional()');
 * ```
 */

import type { CastrSchema, IRZodChainInfo } from '../../../ir/index.js';
import { Node } from 'ts-morph';
import {
  createZodProject,
  describeNodeLocation,
  getZodMethodChain,
  type ZodMethodCall,
  type ZodMethodChainInfo,
  ZOD_PRIMITIVES,
} from '../ast/zod-ast.js';
import type { ZodImportResolver } from '../registry/zod-import-resolver.js';
import {
  createDefaultMetadata,
  ZOD_PRIMITIVE_TYPES,
  deriveHomogeneousLiteralType,
  isSupportedLiteralValue,
} from '../modifiers/zod-parser.defaults.js';
import { applyMetaAndReturn } from '../modifiers/zod-parser.meta.js';
import { registerParser, parseZodSchemaFromNode } from '../zod-parser.core.js';
import type { ZodSchemaParser } from '../zod-parser.types.js';

import type { ParsedConstraints, ParsedOptionality } from '../modifiers/zod-parser.constraints.js';
import {
  processOptionalityMethod,
  processTypeConstraints,
} from '../modifiers/zod-parser.constraints.js';
import {
  assertSupportedPrimitiveChain,
  extractDefaultArgumentValue,
  extractDescribeArgumentValue,
} from '../modifiers/zod-parser.chain-whitelist.js';
import {
  applyConstraints,
  applyOptionalFields,
} from '../modifiers/zod-parser.constraints.apply.js';
import { applyZod4Formats } from './zod-parser.zod4-formats.js';
import { buildZodChainInfo } from './zod-parser.primitives.chain.js';
import { applyUuidSemanticsFromZodChain } from './zod-parser.primitives.uuid.js';
import {
  ZOD_BASE_METHOD_LITERAL,
  ZOD_BASE_METHOD_NULL,
  ZOD_BASE_METHOD_UNDEFINED,
  ZOD_METHOD_DEFAULT,
  ZOD_METHOD_DESCRIBE,
  ZOD_METHOD_META,
} from '../zod-constants.js';

const ZOD_PRIMITIVES_SET = new Set<string>(ZOD_PRIMITIVES);

interface ProcessedChain {
  constraints: ParsedConstraints;
  optionality: ParsedOptionality;
  defaultValue: unknown;
  description: string | undefined;
}

const UNSUPPORTED_ZOD_UNDEFINED_MESSAGE =
  'z.undefined() is not representable in OpenAPI/JSON Schema. Use .optional() on the parent field or parameter instead of a standalone undefined schema.';

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
    state.defaultValue = extractDefaultArgumentValue(method);
    return;
  }
  if (method.name === ZOD_METHOD_DESCRIBE) {
    state.description = extractDescribeArgumentValue(method);
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
 * Handle z.literal() schema.
 *
 * Supports both single values (`z.literal('hello')`) and Zod 4 multi-value
 * literal syntax (`z.literal(['red', 'green', 'blue'])`).
 *
 * Every member must be a supported literal value (string, number,
 * boolean, null); anything else fails fast. A heterogeneous literal set
 * carries no single `type` — the `enum` values alone constrain it —
 * instead of deriving a contradictory type from the first member.
 *
 * @internal
 */
function handleLiteralSchema(
  chainInfo: ZodMethodChainInfo,
  processed: ProcessedChain,
  zodChain: IRZodChainInfo,
): CastrSchema {
  const { optionality, defaultValue, description } = processed;
  const literalValue = chainInfo.baseArgs[0];
  const literalArgNode = chainInfo.baseArgNodes[0];

  // Zod 4 multi-value literal: z.literal(['red', 'green', 'blue'])
  // The value is already an array of literals — spread into enum directly
  const enumValues: unknown[] = Array.isArray(literalValue) ? literalValue : [literalValue];
  if (enumValues.length === 0 || !enumValues.every(isSupportedLiteralValue)) {
    throw new Error(
      `Unsupported z.literal() member value${describeNodeLocation(literalArgNode)}: only ` +
        'statically extractable literal values (string, number, boolean, null) are ' +
        'supported. The Zod parser fails fast on unrecognised constructs instead of ' +
        'silently corrupting the literal value.',
    );
  }
  const derivedType = deriveHomogeneousLiteralType(enumValues);

  const schema: CastrSchema = {
    ...(derivedType === undefined ? {} : { type: derivedType }),
    enum: enumValues,
    metadata: createDefaultMetadata({
      required: !optionality.optional,
      nullable: enumValues.some((value) => value === null) || optionality.nullable,
      zodChain,
      defaultValue,
    }),
  };

  applyOptionalFields(schema, defaultValue, description);
  return schema;
}

/**
 * Handle standard primitive schemas.
 * @internal
 */
function handleStandardPrimitive(
  baseMethod: string,
  schemaType: CastrSchema['type'],
  processed: ProcessedChain,
  zodChain: IRZodChainInfo,
  chainedMethods: ZodMethodCall[],
): CastrSchema {
  const { optionality, constraints, defaultValue, description } = processed;
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
  applyUuidSemanticsFromZodChain(schema, baseMethod, chainedMethods);

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

  assertSupportedPrimitiveChain(baseMethod, schemaType, chainedMethods, node);

  const processed = processChainMethods(baseMethod, chainedMethods);
  const zodChain = buildZodChainInfo(chainedMethods, processed.optionality, processed.defaultValue);

  if (baseMethod === ZOD_BASE_METHOD_UNDEFINED) {
    throw new Error(UNSUPPORTED_ZOD_UNDEFINED_MESSAGE);
  }

  if (baseMethod === ZOD_BASE_METHOD_LITERAL) {
    return applyMetaAndReturn(handleLiteralSchema(chainInfo, processed, zodChain), chainedMethods);
  }

  return applyMetaAndReturn(
    handleStandardPrimitive(baseMethod, schemaType, processed, zodChain, chainedMethods),
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
