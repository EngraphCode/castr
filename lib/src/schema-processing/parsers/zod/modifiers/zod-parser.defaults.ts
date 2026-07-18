/**
 * Zod Parser Defaults
 *
 * Shared default values and helpers for Zod parsing.
 */

import type { CastrSchema, CastrSchemaNode, IRZodChainInfo } from '../../../ir/index.js';

type LiteralSchemaType = 'string' | 'number' | 'boolean' | 'null';

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
  ['bigint', 'integer'],
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
  ['uuidv7', 'string'],
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
export function deriveLiteralType(literalValue: unknown): LiteralSchemaType {
  let derivedType: LiteralSchemaType = 'string';
  if (typeof literalValue === 'number') {
    derivedType = 'number';
  } else if (typeof literalValue === 'boolean') {
    derivedType = 'boolean';
  } else if (literalValue === null) {
    derivedType = 'null';
  }
  return derivedType;
}

/**
 * A literal value the IR can carry in an enum: string, number, boolean,
 * or null.
 * @internal
 */
export function isSupportedLiteralValue(value: unknown): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

/**
 * Derive the single schema type shared by every literal value, or
 * undefined when the values span multiple literal types. A heterogeneous
 * set carries no `type` at all rather than a contradictory single type;
 * the `enum` values alone constrain it honestly.
 *
 * @internal
 */
export function deriveHomogeneousLiteralType(
  values: readonly unknown[],
): LiteralSchemaType | undefined {
  let sharedType: LiteralSchemaType | undefined;
  for (const value of values) {
    const valueType = deriveLiteralType(value);
    if (sharedType === undefined) {
      sharedType = valueType;
    } else if (sharedType !== valueType) {
      return undefined;
    }
  }
  return sharedType;
}
