/**
 * Zod Parser Defaults
 *
 * Shared default values and helpers for Zod parsing.
 *
 * @module parsers/zod/defaults
 */

import type { CastrSchema, CastrSchemaNode, IRZodChainInfo } from '../../ir/schema.js';

/**
 * Options for creating default metadata.
 * @internal
 */
export interface CreateDefaultMetadataOptions {
  nullable?: boolean;
  required?: boolean;
  zodChain?: IRZodChainInfo;
  defaultValue?: unknown;
}

/**
 * Create default metadata for a schema node.
 *
 * @param options - Optional configuration for metadata fields
 * @returns CastrSchemaNode with defaults applied
 *
 * @public
 */
export function createDefaultMetadata(options: CreateDefaultMetadataOptions = {}): CastrSchemaNode {
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
 * Mapping of Zod primitive types to CastrSchema types.
 * @internal
 */
export const ZOD_PRIMITIVE_TYPES: ReadonlyMap<string, CastrSchema['type']> = new Map([
  ['string', 'string'],
  ['number', 'number'],
  ['boolean', 'boolean'],
  ['null', 'null'],
  ['undefined', undefined],
  // Zod 4 Integers -> integer
  ['int', 'integer'],
  ['int32', 'integer'],
  ['int64', 'integer'],
  // Zod 4 Floats -> number
  ['float32', 'number'],
  ['float64', 'number'],
  // Zod 4 Formats -> string
  ['iso.date', 'string'],
  ['iso.datetime', 'string'],
  ['iso.time', 'string'],
  ['iso.duration', 'string'],
  ['uuidv4', 'string'],
  ['base64', 'string'],
  ['base64url', 'string'],
  ['email', 'string'],
  ['url', 'string'],
  ['uuid', 'string'],
  ['ipv4', 'string'],
  ['ipv6', 'string'],
  ['hostname', 'string'],
  // No standard mappings for these, treat as string
  ['cidrv4', 'string'],
  ['cidrv6', 'string'],
  ['jwt', 'string'],
  ['e164', 'string'],
]);

/**
 * Derive type from literal value.
 * @internal
 */

// eslint-disable-next-line sonarjs/function-return-type -- Returns union type by design for literal type inference
export function deriveLiteralType(literalValue: unknown): CastrSchema['type'] {
  if (typeof literalValue === 'number') {
    return 'number';
  }
  if (typeof literalValue === 'boolean') {
    return 'boolean';
  }
  if (literalValue === null) {
    return 'null';
  }
  return 'string';
}
