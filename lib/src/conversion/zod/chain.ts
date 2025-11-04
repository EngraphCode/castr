import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import { match } from 'ts-pattern';

import type { CodeMetaData } from '../../shared/code-meta.js';
import type { TemplateContext } from '../../context/template-context.js';
import {
  getZodChainableArrayValidations,
  getZodChainableNumberValidations,
  getZodChainableStringValidations,
} from './chain.validators.js';

interface ZodChainArgs {
  schema: SchemaObject | ReferenceObject;
  meta?: CodeMetaData;
  options?: TemplateContext['options'];
}

/**
 * Get presence chain (nullable/optional/nullish)
 */
export function getZodChainablePresence(schema: SchemaObject, meta?: CodeMetaData): string {
  // In OpenAPI 3.1, nullable types use type arrays: type: ['string', 'null']
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  const isNullable = types.includes('null');

  if (isNullable && !meta?.isRequired) {
    return 'nullish()';
  }

  if (isNullable) {
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
 *
 * @returns The unwrapped string value if it was quoted, otherwise the original value (string or number)
 */
export function unwrapQuotesIfNeeded(value: string | number): string | number {
  if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
    const unwrapped = value.slice(1, -1);
    // TypeScript infers unwrapped as string, but it's assignable to string | number
    const result: string | number = unwrapped;
    return result;
  }

  return value;
}

/**
 * Get default value chain
 */
export function getZodChainableDefault(schema: SchemaObject): string {
  if (schema.default !== undefined) {
    const defaultValue: unknown = schema.default;
    const value: string = match(schema.type)
      .with('number', 'integer', (): string => {
        if (typeof defaultValue === 'number') {
          return String(defaultValue);
        }
        if (typeof defaultValue === 'string') {
          const unwrapped = unwrapQuotesIfNeeded(defaultValue);
          return String(unwrapped);
        }
        return JSON.stringify(defaultValue);
      })
      .otherwise(() => JSON.stringify(defaultValue));
    return `default(${value})`;
  }

  return '';
}

// Re-export validation builders for backward compatibility
export {
  getZodChainableArrayValidations,
  getZodChainableNumberValidations,
  getZodChainableStringValidations,
} from './chain.validators.js';

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
