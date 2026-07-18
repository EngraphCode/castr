/**
 * Zod Constraint Parsing
 *
 * Handles extraction of constraints from Zod method chains.
 * Split from primitives for reduced file complexity.
 *
 * @internal
 */

import {
  requireNumericArgument,
  requireStringArgument,
  type ZodMethodCall,
} from '../ast/zod-ast.js';
import { escapeRegexLiteral } from '../../../../shared/utils/index.js';
import { ZOD_PRIMITIVE_TYPES } from './zod-parser.defaults.js';
import {
  ZOD_BASE_METHOD_NUMBER,
  ZOD_SCHEMA_TYPE_STRING,
  ZOD_METHOD_BASE64,
  ZOD_METHOD_INT,
  ZOD_METHOD_LENGTH,
  ZOD_METHOD_MAX,
  ZOD_METHOD_MIN,
  ZOD_METHOD_NULLABLE,
  ZOD_METHOD_NULLISH,
  ZOD_METHOD_OPTIONAL,
  ZOD_METHOD_REGEX,
} from '../zod-constants.js';

/**
 * Constraint values extracted from method chain.
 * @internal
 */
export interface ParsedConstraints {
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  pattern?: string;
  format?: string;
  contentEncoding?: string;
}

/**
 * Optionality state extracted from method chain.
 * @internal
 */
export interface ParsedOptionality {
  optional: boolean;
  nullable: boolean;
}

// ============================================================================
// String constraints
// ============================================================================

/** String length-constraint method names. @internal */
const STRING_LENGTH_METHODS: ReadonlySet<string> = new Set([
  ZOD_METHOD_MIN,
  ZOD_METHOD_MAX,
  ZOD_METHOD_LENGTH,
]);

function handleStringLengthConstraint(method: ZodMethodCall, constraints: ParsedConstraints): void {
  if (!STRING_LENGTH_METHODS.has(method.name)) {
    return;
  }
  const arg = requireNumericArgument(method);

  if (method.name === ZOD_METHOD_MIN || method.name === ZOD_METHOD_LENGTH) {
    constraints.minLength = arg;
  } else if (method.name === ZOD_METHOD_MAX) {
    constraints.maxLength = arg;
  }
}

/** Map of Zod method names to OpenAPI format strings. @internal */
const FORMAT_MAP: Record<string, string> = {
  email: 'email',
  url: 'uri',
  uuid: 'uuid',
  cuid: 'cuid',
  cuid2: 'cuid2',
  ulid: 'ulid',
  emoji: 'emoji',
  ip: 'ip',
  datetime: 'date-time',
};

/**
 * Pattern-producing string methods handled by {@link tryExtractPattern}.
 * @internal
 */
const PATTERN_METHODS = [ZOD_METHOD_REGEX, 'startsWith', 'endsWith', 'includes'] as const;

/**
 * Chained methods recognised on string-typed base methods.
 *
 * Derived from the handler tables in this module so the whitelist can
 * never drift from what the parser actually captures.
 *
 * @internal
 */
export const STRING_CHAIN_METHODS: ReadonlySet<string> = new Set([
  ZOD_METHOD_MIN,
  ZOD_METHOD_MAX,
  ZOD_METHOD_LENGTH,
  ZOD_METHOD_BASE64,
  ...PATTERN_METHODS,
  ...Object.keys(FORMAT_MAP),
]);

/**
 * Extract a regex pattern from a recognised pattern-producing method.
 *
 * startsWith/endsWith/includes literals are regex-escaped so
 * metacharacters (".", "$", "(", "\\", ...) match themselves.
 * Returns undefined for methods outside {@link PATTERN_METHODS}.
 *
 * @internal
 */
function tryExtractPattern(method: ZodMethodCall): string | undefined {
  switch (method.name) {
    case 'regex':
      return requireStringArgument(method);
    case 'startsWith':
      return `^${escapeRegexLiteral(requireStringArgument(method))}`;
    case 'endsWith':
      return `${escapeRegexLiteral(requireStringArgument(method))}$`;
    case 'includes':
      return escapeRegexLiteral(requireStringArgument(method));
    default:
      return undefined;
  }
}

function handleStringFormatOrPattern(method: ZodMethodCall, constraints: ParsedConstraints): void {
  // Try pattern extraction first
  const pattern = tryExtractPattern(method);
  if (pattern !== undefined) {
    constraints.pattern = pattern;
    return;
  }

  // Check for base64 encoding
  if (method.name === ZOD_METHOD_BASE64) {
    constraints.contentEncoding = 'base64';
    return;
  }

  // Check format map
  const format = FORMAT_MAP[method.name];
  if (format) {
    constraints.format = format;
  }
}

/**
 * Process string-specific method calls.
 * @internal
 */
export function processStringMethod(method: ZodMethodCall, constraints: ParsedConstraints): void {
  handleStringLengthConstraint(method, constraints);
  handleStringFormatOrPattern(method, constraints);
}

// ============================================================================
// Number constraints
// ============================================================================

/** Map of zero-boundary Zod number methods to constraint setters. @internal */
const NUMBER_ZERO_CONSTRAINT_SETTERS: Record<string, (c: ParsedConstraints) => void> = {
  positive: (c) => {
    c.exclusiveMinimum = 0;
  },
  negative: (c) => {
    c.exclusiveMaximum = 0;
  },
  nonnegative: (c) => {
    c.minimum = 0;
  },
  nonpositive: (c) => {
    c.maximum = 0;
  },
};

function handleNumberZeroConstraint(
  method: ZodMethodCall,
  constraints: ParsedConstraints,
): boolean {
  const setter = NUMBER_ZERO_CONSTRAINT_SETTERS[method.name];
  if (!setter) {
    return false;
  }
  setter(constraints);
  return true;
}

/** Setter function type for number constraints. @internal */
type NumberConstraintSetter = (c: ParsedConstraints, value: number) => void;

/** Map of Zod number methods to constraint setters. @internal */
const NUMBER_CONSTRAINT_SETTERS: Record<string, NumberConstraintSetter> = {
  min: (c, v) => {
    c.minimum = v;
  },
  gte: (c, v) => {
    c.minimum = v;
  },
  gt: (c, v) => {
    c.exclusiveMinimum = v;
  },
  max: (c, v) => {
    c.maximum = v;
  },
  lte: (c, v) => {
    c.maximum = v;
  },
  lt: (c, v) => {
    c.exclusiveMaximum = v;
  },
  multipleOf: (c, v) => {
    c.multipleOf = v;
  },
};

/**
 * Chained methods recognised on numeric base methods.
 *
 * Derived from the handler tables in this module so the whitelist can
 * never drift from what the parser actually captures.
 *
 * @internal
 */
export const NUMBER_CHAIN_METHODS: ReadonlySet<string> = new Set([
  ...Object.keys(NUMBER_ZERO_CONSTRAINT_SETTERS),
  ...Object.keys(NUMBER_CONSTRAINT_SETTERS),
  ZOD_METHOD_INT,
]);

function handleNumberArgConstraint(method: ZodMethodCall, constraints: ParsedConstraints): boolean {
  const setter = NUMBER_CONSTRAINT_SETTERS[method.name];
  if (!setter) {
    return false;
  }

  setter(constraints, requireNumericArgument(method));
  return true;
}

/**
 * Process number-specific method calls.
 * @internal
 */
export function processNumberMethod(method: ZodMethodCall, constraints: ParsedConstraints): void {
  if (handleNumberZeroConstraint(method, constraints)) {
    return;
  }
  if (handleNumberArgConstraint(method, constraints)) {
    return;
  }
  if (method.name === ZOD_METHOD_INT) {
    constraints.format = 'int32';
  }
}

// ============================================================================
// Optionality
// ============================================================================

/**
 * Process optionality method calls.
 * @internal
 */
export function processOptionalityMethod(
  method: ZodMethodCall,
  optionality: ParsedOptionality,
): void {
  if (method.name === ZOD_METHOD_OPTIONAL) {
    optionality.optional = true;
  } else if (method.name === ZOD_METHOD_NULLABLE) {
    optionality.nullable = true;
  } else if (method.name === ZOD_METHOD_NULLISH) {
    optionality.optional = true;
    optionality.nullable = true;
  }
}

/**
 * Numeric base methods that accept number constraints (min, max, multipleOf, etc.).
 *
 * Includes both `z.number()` and Zod 4 format functions that produce integer/number types.
 * These all support `.min()`, `.max()`, `.gte()`, `.gt()`, `.lt()`, `.lte()`, `.multipleOf()`.
 *
 * @internal
 */
export const NUMERIC_BASE_METHODS: ReadonlySet<string> = new Set([
  ZOD_BASE_METHOD_NUMBER,
  'int',
  'int32',
  'int64',
  'float32',
  'float64',
]);

function isStringConstraintBaseMethod(baseMethod: string): boolean {
  return ZOD_PRIMITIVE_TYPES.get(baseMethod) === ZOD_SCHEMA_TYPE_STRING;
}

/**
 * Handle type-based constraint methods.
 * @internal
 */
export function processTypeConstraints(
  baseMethod: string,
  method: ZodMethodCall,
  constraints: ParsedConstraints,
): void {
  if (isStringConstraintBaseMethod(baseMethod)) {
    processStringMethod(method, constraints);
  }
  if (NUMERIC_BASE_METHODS.has(baseMethod)) {
    processNumberMethod(method, constraints);
  }
}
