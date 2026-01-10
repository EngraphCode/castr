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
import type { CallExpression } from 'ts-morph';
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

/**
 * Process string-specific method calls.
 * @internal
 */
function processStringMethod(method: ZodMethodCall, constraints: ParsedConstraints): void {
  const arg = method.args[0];

  switch (method.name) {
    case 'min':
    case 'length':
      if (typeof arg === 'number') {
        constraints.minLength = arg;
      }
      break;
    case 'max':
      if (typeof arg === 'number') {
        constraints.maxLength = arg;
      }
      break;
    case 'regex':
      if (typeof arg === 'string') {
        constraints.pattern = arg;
      }
      break;
    case 'email':
      constraints.format = 'email';
      break;
    case 'url':
      constraints.format = 'uri';
      break;
    case 'uuid':
      constraints.format = 'uuid';
      break;
    case 'datetime':
      constraints.format = 'date-time';
      break;
  }
}

/**
 * Process number-specific method calls.
 * @internal
 */
function processNumberMethod(method: ZodMethodCall, constraints: ParsedConstraints): void {
  const arg = method.args[0];

  switch (method.name) {
    case 'min':
    case 'gte':
      if (typeof arg === 'number') {
        constraints.minimum = arg;
      }
      break;
    case 'max':
    case 'lte':
      if (typeof arg === 'number') {
        constraints.maximum = arg;
      }
      break;
    case 'int':
      constraints.format = 'int32';
      break;
  }
}

/**
 * Process optionality method calls.
 * @internal
 */
function processOptionalityMethod(method: ZodMethodCall, optionality: ParsedOptionality): void {
  switch (method.name) {
    case 'optional':
      optionality.optional = true;
      break;
    case 'nullable':
      optionality.nullable = true;
      break;
    case 'nullish':
      optionality.optional = true;
      optionality.nullable = true;
      break;
  }
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
  const validations: string[] = [];
  let presence = '';

  for (const method of methods) {
    if (['optional', 'nullable', 'nullish'].includes(method.name)) {
      if (method.name === 'nullish') {
        presence = '.nullish()';
      } else if (method.name === 'optional') {
        presence = '.optional()';
      } else if (method.name === 'nullable') {
        presence = '.nullable()';
      }
    } else if (method.name !== 'default') {
      const argsStr = method.args.map((a) => JSON.stringify(a)).join(', ');
      validations.push(`.${method.name}(${argsStr})`);
    }
  }

  if (optionality.optional && optionality.nullable) {
    presence = '.nullish()';
  } else if (optionality.optional) {
    presence = '.optional()';
  } else if (optionality.nullable) {
    presence = '.nullable()';
  }

  const defaults: string[] = [];
  if (defaultValue !== undefined) {
    const defaultStr =
      typeof defaultValue === 'string' ? `"${defaultValue}"` : String(defaultValue);
    defaults.push(`.default(${defaultStr})`);
  }

  return { presence, validations, defaults };
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
  // Parse with ts-morph
  const project = createZodProject(`const __schema = ${expression};`);
  const sourceFile = project.getSourceFiles()[0];
  if (!sourceFile) {
    return undefined;
  }

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init) {
    return undefined;
  }

  // Get method chain info
  const chainInfo = getZodMethodChain(init as CallExpression);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, chainedMethods } = chainInfo;

  // Check if this is a primitive type
  if (!ZOD_PRIMITIVES.includes(baseMethod as (typeof ZOD_PRIMITIVES)[number])) {
    return undefined;
  }

  const schemaType = ZOD_PRIMITIVE_TYPES.get(baseMethod);
  if (schemaType === undefined && baseMethod !== 'undefined') {
    return undefined;
  }

  // Process chain methods
  const constraints: ParsedConstraints = {};
  const optionality: ParsedOptionality = { optional: false, nullable: false };
  let defaultValue: unknown;

  for (const method of chainedMethods) {
    // Handle default
    if (method.name === 'default') {
      defaultValue = method.args[0];
      continue;
    }

    // Handle optionality
    processOptionalityMethod(method, optionality);

    // Handle type-specific constraints
    if (baseMethod === 'string') {
      processStringMethod(method, constraints);
    } else if (baseMethod === 'number') {
      processNumberMethod(method, constraints);
    }
  }

  // Build zodChain for round-trip
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

  // Apply constraints
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
  if (defaultValue !== undefined) {
    schema.default = defaultValue;
  }

  return schema;
}
