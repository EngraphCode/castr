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
  ZOD_PRIMITIVES,
} from './zod-ast.js';
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

// ============================================================================
// Zod chain info building - split for reduced complexity
// ============================================================================

function computePresence(optionality: ParsedOptionality): string {
  if (optionality.optional && optionality.nullable) {
    return '.nullish()';
  }
  if (optionality.optional) {
    return '.optional()';
  }
  if (optionality.nullable) {
    return '.nullable()';
  }
  return '';
}

function collectValidations(methods: ZodMethodCall[]): string[] {
  const validations: string[] = [];
  const skipMethods = new Set(['optional', 'nullable', 'nullish', 'default', 'meta', 'describe']);

  for (const method of methods) {
    if (skipMethods.has(method.name)) {
      continue;
    }
    const argsStr = method.args.map((a) => JSON.stringify(a)).join(', ');
    validations.push(`.${method.name}(${argsStr})`);
  }
  return validations;
}

function collectDefaults(defaultValue: unknown): string[] {
  if (defaultValue === undefined) {
    return [];
  }
  const defaultStr = typeof defaultValue === 'string' ? `"${defaultValue}"` : String(defaultValue);
  return [`.default(${defaultStr})`];
}

/**
 * Build IRZodChainInfo from parsed data.
 * @internal
 */
function buildZodChainInfo(
  methods: ZodMethodCall[],
  optionality: ParsedOptionality,
  defaultValue: unknown,
): IRZodChainInfo {
  return {
    presence: computePresence(optionality),
    validations: collectValidations(methods),
    defaults: collectDefaults(defaultValue),
  };
}

// ============================================================================
// Schema parsing - split into smaller functions
// ============================================================================

const ZOD_PRIMITIVES_SET = new Set<string>(ZOD_PRIMITIVES);

function isPrimitive(baseMethod: string): boolean {
  return ZOD_PRIMITIVES_SET.has(baseMethod);
}

interface ProcessedChain {
  constraints: ParsedConstraints;
  optionality: ParsedOptionality;
  defaultValue: unknown;
}

function processChainMethods(baseMethod: string, chainedMethods: ZodMethodCall[]): ProcessedChain {
  const constraints: ParsedConstraints = {};
  const optionality: ParsedOptionality = { optional: false, nullable: false };
  let defaultValue: unknown;

  for (const method of chainedMethods) {
    if (method.name === 'default') {
      defaultValue = method.args[0];
    } else if (method.name === 'meta' || method.name === 'describe') {
      continue;
    } else {
      processOptionalityMethod(method, optionality);
      processTypeConstraints(baseMethod, method, constraints);
    }
  }

  return { constraints, optionality, defaultValue };
}

// ============================================================================
// Helper functions for specific primitive types
// ============================================================================

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
): CastrSchema {
  const schema: CastrSchema = {
    type: schemaType,
    metadata: createDefaultMetadata({
      nullable: baseMethod === 'null' || optionality.nullable,
      required: !optionality.optional,
      zodChain,
      defaultValue,
    }),
  };

  applyConstraints(schema, constraints);
  applyOptionalFields(schema, defaultValue, undefined);
  applyZod4Formats(schema, baseMethod);

  return schema;
}

/**
 * Parse a primitive Zod expression from a ts-morph Node.
 * @internal
 */
export function parsePrimitiveZodFromNode(
  node: Node,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const chainInfo = getZodMethodChain(node);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, chainedMethods } = chainInfo;
  if (!isPrimitive(baseMethod)) {
    return undefined;
  }

  const schemaType = ZOD_PRIMITIVE_TYPES.get(baseMethod);
  if (schemaType === undefined && baseMethod !== 'undefined' && baseMethod !== 'literal') {
    return undefined;
  }

  const { constraints, optionality, defaultValue } = processChainMethods(
    baseMethod,
    chainedMethods,
  );
  const zodChain = buildZodChainInfo(chainedMethods, optionality, defaultValue);

  if (baseMethod === 'undefined') {
    return applyMetaAndReturn(handleUndefinedSchema(zodChain), chainedMethods);
  }

  if (baseMethod === 'literal') {
    return applyMetaAndReturn(
      handleLiteralSchema(chainInfo, optionality, zodChain, defaultValue),
      chainedMethods,
    );
  }

  return applyMetaAndReturn(
    handleStandardPrimitive(
      baseMethod,
      schemaType,
      optionality,
      constraints,
      zodChain,
      defaultValue,
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

  return parsePrimitiveZodFromNode(init, parseZodSchemaFromNode);
}

/**
 * Apply inferred format/encoding from Zod 4 primitive name.
 * @internal
 */
function applyZod4Formats(schema: CastrSchema, baseMethod: string): void {
  const formatMap: Record<string, string> = {
    int32: 'int32',
    int64: 'int64',
    float32: 'float',
    float64: 'double',
    'iso.date': 'date',
    'iso.datetime': 'date-time',
    'iso.time': 'time',
    'iso.duration': 'duration',
    uuidv4: 'uuid',
    email: 'email',
    url: 'uri',
    uuid: 'uuid',
    ipv4: 'ipv4',
    ipv6: 'ipv6',
    hostname: 'hostname',
  };

  const encodingMap: Record<string, string> = {
    base64: 'base64',
    base64url: 'base64url',
  };

  if (baseMethod in formatMap) {
    const format = formatMap[baseMethod];
    if (format) {
      schema.format = format;
    }
  }

  if (baseMethod in encodingMap) {
    const encoding = encodingMap[baseMethod];
    if (encoding) {
      schema.contentEncoding = encoding;
    }
  }
}
