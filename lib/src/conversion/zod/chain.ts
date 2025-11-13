import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import { match } from 'ts-pattern';

import type { TemplateContext } from '../../context/template-context.js';
import type { IRSchemaNode } from '../../context/ir-schema.js';
import {
  getZodChainableArrayValidations,
  getZodChainableNumberValidations,
  getZodChainableStringValidations,
} from './chain.validators.js';
import type { CodeMetaData } from './index.js';
import { getPresenceChainFromIR } from './ir-metadata-adapter.js';

interface ZodChainArgs {
  schema: SchemaObject | ReferenceObject;
  meta?: CodeMetaData;
  /**
   * IR schema node with rich metadata.
   * When present, prefer irNode over meta for metadata extraction.
   * @since Phase 3 Session 2
   */
  irNode?: IRSchemaNode;
  options?: TemplateContext['options'];
}

/**
 * Normalize schema type to array format
 */
function normalizeSchemaTypes(schema: SchemaObject): string[] {
  if (Array.isArray(schema.type)) {
    return schema.type;
  }
  if (schema.type) {
    return [schema.type];
  }
  return [];
}

/**
 * Get presence chain (nullable/optional/nullish)
 *
 * @param schema - OpenAPI schema object
 * @param meta - Legacy CodeMetaData (deprecated, use irNode instead)
 * @param irNode - IR schema node with rich metadata (preferred)
 * @returns Zod presence chain string (e.g., 'optional()', 'nullable()', 'nullish()', or '')
 */
export function getZodChainablePresence(
  schema: SchemaObject,
  meta?: CodeMetaData,
  irNode?: IRSchemaNode,
): string {
  // Prefer IRSchemaNode when available (migration path)
  if (irNode) {
    return getPresenceChainFromIR(irNode);
  }

  // Legacy code path using CodeMetaData (will be removed in C6)
  // In OpenAPI 3.1, nullable types use type arrays: type: ['string', 'null']
  const types = normalizeSchemaTypes(schema);
  const isNullable = types.includes('null');
  const isRequired = meta?.isRequired ?? false;

  if (isNullable && !isRequired) {
    return 'nullish()';
  }
  if (isNullable) {
    return 'nullable()';
  }
  if (!isRequired) {
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
export function getZodChain({ schema, meta, irNode, options }: ZodChainArgs): string {
  // ReferenceObjects don't have chainable properties, return empty
  if (isReferenceObject(schema)) {
    return '';
  }

  const chains: string[] = [];
  addTypeSpecificValidations(schema, chains);
  addDescriptionIfNeeded(schema, options, chains);
  const output = buildChainOutput(schema, meta, irNode, options, chains);
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
  irNode: IRSchemaNode | undefined,
  options: TemplateContext['options'] | undefined,
  chains: string[],
): string {
  return chains
    .concat(
      getZodChainablePresence(schema, meta, irNode),
      options?.withDefaultValues === false ? [] : getZodChainableDefault(schema),
    )
    .filter(Boolean)
    .join('.');
}
