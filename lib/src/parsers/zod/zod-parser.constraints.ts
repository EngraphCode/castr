/**
 * Zod Constraint Parsing
 *
 * Handles extraction of constraints from Zod method chains.
 * Split from primitives for reduced file complexity.
 *
 * @module parsers/zod/constraints
 * @internal
 */

import type { ZodMethodCall } from './zod-ast.js';
import type { CastrSchema } from '../../ir/schema.js';

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

  if (method.name === 'startsWith' && typeof method.args[0] === 'string') {
    constraints.pattern = `^${method.args[0]}`;
    return;
  }

  if (method.name === 'endsWith' && typeof method.args[0] === 'string') {
    constraints.pattern = `${method.args[0]}$`;
    return;
  }

  if (method.name === 'includes' && typeof method.args[0] === 'string') {
    constraints.pattern = method.args[0];
    return;
  }

  const formatMap: Record<string, string> = {
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

  if (method.name === 'base64') {
    constraints.contentEncoding = 'base64';
    return;
  }
  const format = formatMap[method.name];
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

function handleNumberArgConstraint(method: ZodMethodCall, constraints: ParsedConstraints): boolean {
  const arg = method.args[0];
  if (typeof arg !== 'number') {
    return false;
  }

  switch (method.name) {
    case 'min':
    case 'gte':
      constraints.minimum = arg;
      return true;
    case 'gt':
      constraints.exclusiveMinimum = arg;
      return true;
    case 'max':
    case 'lte':
      constraints.maximum = arg;
      return true;
    case 'lt':
      constraints.exclusiveMaximum = arg;
      return true;
    case 'multipleOf':
      constraints.multipleOf = arg;
      return true;
    default:
      return false;
  }
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
  if (method.name === 'int') {
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
  if (method.name === 'optional') {
    optionality.optional = true;
  } else if (method.name === 'nullable') {
    optionality.nullable = true;
  } else if (method.name === 'nullish') {
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
  if (baseMethod === 'string') {
    processStringMethod(method, constraints);
  }
  if (baseMethod === 'number') {
    processNumberMethod(method, constraints);
  }
}

/**
 * Apply constraints to schema.
 * @internal
 */
export function applyConstraints(schema: CastrSchema, constraints: ParsedConstraints): void {
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
  if (constraints.exclusiveMinimum !== undefined) {
    schema.exclusiveMinimum = constraints.exclusiveMinimum;
  }
  if (constraints.exclusiveMaximum !== undefined) {
    schema.exclusiveMaximum = constraints.exclusiveMaximum;
  }
  if (constraints.multipleOf !== undefined) {
    schema.multipleOf = constraints.multipleOf;
  }
  if (constraints.pattern !== undefined) {
    schema.pattern = constraints.pattern;
  }
  if (constraints.format !== undefined) {
    schema.format = constraints.format;
  }
  if (constraints.contentEncoding !== undefined) {
    schema.contentEncoding = constraints.contentEncoding;
  }
}

/**
 * Apply optional schema fields (default, description).
 * @internal
 */
export function applyOptionalFields(
  schema: CastrSchema,
  defaultValue: unknown,
  description: string | undefined,
): void {
  if (defaultValue !== undefined) {
    schema.default = defaultValue;
  }
  if (description !== undefined) {
    schema.description = description;
  }
}
