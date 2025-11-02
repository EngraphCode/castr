/**
 * Zod validation chain builders
 * Extracted from openApiToZod.chain.ts to reduce file size
 *
 * These functions build type-specific validation chains for Zod schemas.
 */

import type { SchemaObject } from 'openapi3-ts/oas30';

import { match } from 'ts-pattern';

import { escapeControlCharacters } from '../../shared/utils/index.js';

/**
 * Format pattern string for regex
 */
export function formatPatternIfNeeded(pattern: string): string {
  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    pattern = pattern.slice(1, -1);
  }

  pattern = escapeControlCharacters(pattern);

  return pattern.includes(String.raw`\u`) || pattern.includes(String.raw`\p`)
    ? `/${pattern}/u`
    : `/${pattern}/`;
}

/**
 * Build length validation chain parts
 * @internal
 */
function buildLengthValidations(schema: SchemaObject): string[] {
  const validations: string[] = [];
  if (schema.minLength !== undefined) {
    validations.push(`min(${schema.minLength})`);
  }
  if (schema.maxLength !== undefined) {
    validations.push(`max(${schema.maxLength})`);
  }
  return validations;
}

/**
 * Build pattern validation chain part
 * @internal
 */
function buildPatternValidation(schema: SchemaObject): string[] {
  if (schema.pattern) {
    return [`regex(${formatPatternIfNeeded(schema.pattern)})`];
  }
  return [];
}

/**
 * Build format validation chain part
 * @internal
 */
function buildFormatValidation(schema: SchemaObject): string[] {
  if (schema.format) {
    const chain = getFormatChain(schema.format);
    if (chain) {
      return [chain];
    }
  }
  return [];
}

/**
 * Get format-specific chain
 */
function getFormatChain(format: string): string {
  return match(format)
    .with('email', () => 'email()')
    .with('hostname', () => 'url()')
    .with('uri', () => 'url()')
    .with('uuid', () => 'uuid()')
    .with('date-time', () => 'datetime({ offset: true })')
    .otherwise(() => '');
}

/**
 * Get string validation chains
 */
export function getZodChainableStringValidations(schema: SchemaObject): string {
  const validations: string[] = [];

  // Skip length validations for enums, but still allow pattern and format
  if (!schema.enum) {
    validations.push(...buildLengthValidations(schema));
  }

  validations.push(...buildPatternValidation(schema));
  validations.push(...buildFormatValidation(schema));

  return validations.join('.');
}

/**
 * Add minimum validation chain
 */
function addMinimumValidation(schema: SchemaObject, validations: string[]): void {
  if (schema.minimum !== undefined) {
    if (schema.exclusiveMinimum === true) {
      validations.push(`gt(${schema.minimum})`);
    } else {
      validations.push(`gte(${schema.minimum})`);
    }
  } else if (typeof schema.exclusiveMinimum === 'number') {
    validations.push(`gt(${schema.exclusiveMinimum})`);
  }
}

/**
 * Add maximum validation chain
 */
function addMaximumValidation(schema: SchemaObject, validations: string[]): void {
  if (schema.maximum !== undefined) {
    if (schema.exclusiveMaximum === true) {
      validations.push(`lt(${schema.maximum})`);
    } else {
      validations.push(`lte(${schema.maximum})`);
    }
  } else if (typeof schema.exclusiveMaximum === 'number') {
    validations.push(`lt(${schema.exclusiveMaximum})`);
  }
}

/**
 * Get number validation chains
 */
export function getZodChainableNumberValidations(schema: SchemaObject): string {
  // none of the chains are valid for enums
  if (schema.enum) {
    return '';
  }

  const validations: string[] = [];

  if (schema.type === 'integer') {
    validations.push('int()');
  }

  addMinimumValidation(schema, validations);
  addMaximumValidation(schema, validations);

  if (schema.multipleOf) {
    validations.push(`multipleOf(${schema.multipleOf})`);
  }

  return validations.join('.');
}

/**
 * Get array validation chains
 */
export function getZodChainableArrayValidations(schema: SchemaObject): string {
  const validations: string[] = [];

  if (schema.minItems) {
    validations.push(`min(${schema.minItems})`);
  }

  if (schema.maxItems) {
    validations.push(`max(${schema.maxItems})`);
  }

  return validations.join('.');
}
