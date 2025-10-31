import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

import { match } from 'ts-pattern';

import type { CodeMetaData } from './CodeMeta.js';
import type { TemplateContext } from './template-context.js';
import { escapeControlCharacters } from './utils.js';

interface ZodChainArgs {
  schema: SchemaObject | ReferenceObject;
  meta?: CodeMetaData;
  options?: TemplateContext['options'];
}

/**
 * Get presence chain (nullable/optional/nullish)
 */
export function getZodChainablePresence(schema: SchemaObject, meta?: CodeMetaData): string {
  if (schema.nullable && !meta?.isRequired) {
    return 'nullish()';
  }

  if (schema.nullable) {
    return 'nullable()';
  }

  if (!meta?.isRequired) {
    return 'optional()';
  }

  return '';
}

/**
 * Unwrap quotes from string value if needed
 * NOTE: OpenAPI prefixItems support (z.tuple) is not yet implemented
 */
export function unwrapQuotesIfNeeded(value: string | number): string | number {
  if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  return value;
}

/**
 * Get default value chain
 */
export function getZodChainableDefault(schema: SchemaObject): string {
  if (schema.default !== undefined) {
    const defaultValue: unknown = schema.default;
    const value: string | number = match(schema.type)
      .with('number', 'integer', (): string | number => {
        if (typeof defaultValue === 'number') {
          return defaultValue;
        }
        if (typeof defaultValue === 'string') {
          return unwrapQuotesIfNeeded(defaultValue);
        }
        return JSON.stringify(defaultValue);
      })
      .otherwise(() => JSON.stringify(defaultValue));
    return `default(${String(value)})`;
  }

  return '';
}

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
 * Get string validation chains
 */
export function getZodChainableStringValidations(schema: SchemaObject): string {
  const validations: string[] = [];

  if (!schema.enum) {
    if (schema.minLength !== undefined) {
      validations.push(`min(${schema.minLength})`);
    }

    if (schema.maxLength !== undefined) {
      validations.push(`max(${schema.maxLength})`);
    }
  }

  if (schema.pattern) {
    validations.push(`regex(${formatPatternIfNeeded(schema.pattern)})`);
  }

  if (schema.format) {
    const chain = getFormatChain(schema.format);
    if (chain) {
      validations.push(chain);
    }
  }

  return validations.join('.');
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

/**
 * Get Zod validation chain for a schema
 * Applies type-specific validations, descriptions, presence modifiers, and defaults
 */
export function getZodChain({ schema, meta, options }: ZodChainArgs): string {
  // ReferenceObjects don't have chainable properties, return empty
  if (isReferenceObject(schema)) {
    return '';
  }

  const chains: string[] = [];
  addTypeSpecificValidations(schema, chains);
  addDescriptionIfNeeded(schema, options, chains);
  const output = buildChainOutput(schema, meta, options, chains);
  return output ? `.${output}` : '';
}

/**
 * Add type-specific validation chains
 */
function addTypeSpecificValidations(schema: SchemaObject, chains: string[]): void {
  match(schema.type)
    .with('string', () => chains.push(getZodChainableStringValidations(schema)))
    .with('number', 'integer', () => chains.push(getZodChainableNumberValidations(schema)))
    .with('array', () => chains.push(getZodChainableArrayValidations(schema)))
    .otherwise(() => void 0);
}

/**
 * Add description chain if needed
 */
function addDescriptionIfNeeded(
  schema: SchemaObject,
  options: TemplateContext['options'] | undefined,
  chains: string[],
): void {
  if (
    typeof schema.description === 'string' &&
    schema.description !== '' &&
    options?.withDescription
  ) {
    const hasNewlines = ['\n', '\r', '\r\n'].some((c) =>
      String.prototype.includes.call(schema.description, c),
    );
    chains.push(
      hasNewlines ? `describe(\`${schema.description}\`)` : `describe("${schema.description}")`,
    );
  }
}

/**
 * Build final chain output
 */
function buildChainOutput(
  schema: SchemaObject,
  meta: CodeMetaData | undefined,
  options: TemplateContext['options'] | undefined,
  chains: string[],
): string {
  return chains
    .concat(
      getZodChainablePresence(schema, meta),
      options?.withDefaultValues === false ? [] : getZodChainableDefault(schema),
    )
    .filter(Boolean)
    .join('.');
}
