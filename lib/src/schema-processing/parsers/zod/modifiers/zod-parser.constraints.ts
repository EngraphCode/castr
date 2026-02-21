/**
 * Zod Constraint Parsing
 *
 * Handles extraction of constraints from Zod method chains.
 * Split from primitives for reduced file complexity.
 *
 * @module parsers/zod/constraints
 * @internal
 */

import type { ZodMethodCall } from '../ast/zod-ast.js';
import {
  ZOD_BASE_METHOD_NUMBER,
  ZOD_BASE_METHOD_STRING,
  ZOD_METHOD_BASE64,
  ZOD_METHOD_INT,
  ZOD_METHOD_LENGTH,
  ZOD_METHOD_MAX,
  ZOD_METHOD_MIN,
  ZOD_METHOD_NULLABLE,
  ZOD_METHOD_NULLISH,
  ZOD_METHOD_OPTIONAL,
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

function handleStringLengthConstraint(method: ZodMethodCall, constraints: ParsedConstraints): void {
  const arg = method.args[0];
  if (typeof arg !== 'number') {
    return;
  }

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
 * Try to extract a regex pattern from a string method call.
 * Returns the pattern string if successful, undefined otherwise.
 * @internal
 */
function tryExtractPattern(method: ZodMethodCall): string | undefined {
  const arg = method.args[0];
  if (typeof arg !== 'string') {
    return undefined;
  }

  switch (method.name) {
    case 'regex':
      return arg;
    case 'startsWith':
      return `^${arg}`;
    case 'endsWith':
      return `${arg}$`;
    case 'includes':
      return arg;
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

function handleNumberZeroConstraint(
  method: ZodMethodCall,
  constraints: ParsedConstraints,
): boolean {
  switch (method.name) {
    case 'positive':
      constraints.exclusiveMinimum = 0;
      return true;
    case 'negative':
      constraints.exclusiveMaximum = 0;
      return true;
    case 'nonnegative':
      constraints.minimum = 0;
      return true;
    case 'nonpositive':
      constraints.maximum = 0;
      return true;
    default:
      return false;
  }
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

function handleNumberArgConstraint(method: ZodMethodCall, constraints: ParsedConstraints): boolean {
  const arg = method.args[0];
  if (typeof arg !== 'number') {
    return false;
  }

  const setter = NUMBER_CONSTRAINT_SETTERS[method.name];
  if (setter) {
    setter(constraints, arg);
    return true;
  }

  return false;
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
 * Handle type-based constraint methods.
 * @internal
 */
export function processTypeConstraints(
  baseMethod: string,
  method: ZodMethodCall,
  constraints: ParsedConstraints,
): void {
  if (baseMethod === ZOD_BASE_METHOD_STRING) {
    processStringMethod(method, constraints);
  }
  if (baseMethod === ZOD_BASE_METHOD_NUMBER) {
    processNumberMethod(method, constraints);
  }
}
