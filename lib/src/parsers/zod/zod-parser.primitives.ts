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

import type { CastrSchema, CastrSchemaNode, IRZodChainInfo } from '../../context/ir-schema.js';
import { Node } from 'ts-morph';
import {
  createZodProject,
  getZodMethodChain,
  type ZodMethodCall,
  ZOD_PRIMITIVES,
} from './zod-ast.js';

/**
 * Mapping of Zod primitive types to CastrSchema types.
 * @internal
 */
const ZOD_PRIMITIVE_TYPES: ReadonlyMap<string, CastrSchema['type']> = new Map([
  ['string', 'string'],
  ['number', 'number'],
  ['boolean', 'boolean'],
  ['null', 'null'],
  ['undefined', undefined],
]);

/**
 * Create default metadata for a schema node.
 * @internal
 */
function createDefaultMetadata(
  options: {
    nullable?: boolean;
    required?: boolean;
    zodChain?: IRZodChainInfo;
    defaultValue?: unknown;
  } = {},
): CastrSchemaNode {
  const { nullable = false, required = true, zodChain, defaultValue } = options;

  return {
    required,
    nullable,
    default: defaultValue,
    zodChain: zodChain ?? {
      presence: '',
      validations: [],
      defaults: [],
    },
    dependencyGraph: {
      references: [],
      referencedBy: [],
      depth: 0,
    },
    circularReferences: [],
  };
}

/**
 * Constraint values extracted from method chain.
 * @internal
 */
interface ParsedConstraints {
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
}

/**
 * Optionality state extracted from method chain.
 * @internal
 */
interface ParsedOptionality {
  optional: boolean;
  nullable: boolean;
}

// ============================================================================
// String method handlers - split by purpose for reduced complexity
// ============================================================================

function handleStringLengthConstraint(method: ZodMethodCall, constraints: ParsedConstraints): void {
  const arg = method.args[0];
  if (typeof arg !== 'number') {
    return;
  }

  if (method.name === 'min' || method.name === 'length') {
    constraints.minLength = arg;
  } else if (method.name === 'max') {
    constraints.maxLength = arg;
  }
}

function handleStringFormatOrPattern(method: ZodMethodCall, constraints: ParsedConstraints): void {
  if (method.name === 'regex' && typeof method.args[0] === 'string') {
    constraints.pattern = method.args[0];
    return;
  }

  const formatMap: Record<string, string> = {
    email: 'email',
    url: 'uri',
    uuid: 'uuid',
    datetime: 'date-time',
  };
  const format = formatMap[method.name];
  if (format) {
    constraints.format = format;
  }
}

/**
 * Process string-specific method calls.
 * @internal
 */
function processStringMethod(method: ZodMethodCall, constraints: ParsedConstraints): void {
  handleStringLengthConstraint(method, constraints);
  handleStringFormatOrPattern(method, constraints);
}

// ============================================================================
// Number method handlers
// ============================================================================

/**
 * Process number-specific method calls.
 * @internal
 */
function processNumberMethod(method: ZodMethodCall, constraints: ParsedConstraints): void {
  const arg = method.args[0];

  if (method.name === 'min' || method.name === 'gte') {
    if (typeof arg === 'number') {
      constraints.minimum = arg;
    }
  } else if (method.name === 'max' || method.name === 'lte') {
    if (typeof arg === 'number') {
      constraints.maximum = arg;
    }
  } else if (method.name === 'int') {
    constraints.format = 'int32';
  }
}

// ============================================================================
// Optionality handling
// ============================================================================

/**
 * Process optionality method calls.
 * @internal
 */
function processOptionalityMethod(method: ZodMethodCall, optionality: ParsedOptionality): void {
  if (method.name === 'optional') {
    optionality.optional = true;
  } else if (method.name === 'nullable') {
    optionality.nullable = true;
  } else if (method.name === 'nullish') {
    optionality.optional = true;
    optionality.nullable = true;
  }
}

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
  const skipMethods = new Set(['optional', 'nullable', 'nullish', 'default']);

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

interface ParsedExpressionResult {
  baseMethod: string;
  chainedMethods: ZodMethodCall[];
}

function parseZodExpression(expression: string): ParsedExpressionResult | undefined {
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

  const chainInfo = getZodMethodChain(init);
  if (!chainInfo) {
    return undefined;
  }

  return chainInfo;
}

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
      continue;
    }
    processOptionalityMethod(method, optionality);
    if (baseMethod === 'string') {
      processStringMethod(method, constraints);
    }
    if (baseMethod === 'number') {
      processNumberMethod(method, constraints);
    }
  }

  return { constraints, optionality, defaultValue };
}

function applyConstraints(schema: CastrSchema, constraints: ParsedConstraints): void {
  if (constraints.minLength !== undefined) {
    schema.minLength = constraints.minLength;
  }
  if (constraints.maxLength !== undefined) {
    schema.maxLength = constraints.maxLength;
  }
  if (constraints.minimum !== undefined) {
    schema.minimum = constraints.minimum;
  }
  if (constraints.maximum !== undefined) {
    schema.maximum = constraints.maximum;
  }
  if (constraints.pattern !== undefined) {
    schema.pattern = constraints.pattern;
  }
  if (constraints.format !== undefined) {
    schema.format = constraints.format;
  }
}

/**
 * Parse a primitive Zod expression into a CastrSchema using ts-morph AST.
 *
 * @param expression - A Zod expression string
 * @returns CastrSchema if this is a recognized primitive, undefined otherwise
 *
 * @public
 */
export function parsePrimitiveZod(expression: string): CastrSchema | undefined {
  const parsed = parseZodExpression(expression);
  if (!parsed) {
    return undefined;
  }

  const { baseMethod, chainedMethods } = parsed;
  if (!isPrimitive(baseMethod)) {
    return undefined;
  }

  const schemaType = ZOD_PRIMITIVE_TYPES.get(baseMethod);
  if (schemaType === undefined && baseMethod !== 'undefined') {
    return undefined;
  }

  const { constraints, optionality, defaultValue } = processChainMethods(
    baseMethod,
    chainedMethods,
  );
  const zodChain = buildZodChainInfo(chainedMethods, optionality, defaultValue);

  // Handle z.undefined()
  if (baseMethod === 'undefined') {
    return {
      type: undefined,
      metadata: createDefaultMetadata({ required: false, zodChain }),
    };
  }

  // Handle z.null()
  const isNull = baseMethod === 'null';

  // Build schema
  const schema: CastrSchema = {
    type: schemaType,
    metadata: createDefaultMetadata({
      nullable: isNull || optionality.nullable,
      required: !optionality.optional,
      zodChain,
      defaultValue,
    }),
  };

  applyConstraints(schema, constraints);
  if (defaultValue !== undefined) {
    schema.default = defaultValue;
  }

  return schema;
}
