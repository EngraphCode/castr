import type { CastrSchema } from './models/schema.js';

const OBJECT_SCHEMA_TYPE = 'object';

export function isObjectSchemaType(type: CastrSchema['type'] | undefined): boolean {
  if (type === OBJECT_SCHEMA_TYPE) {
    return true;
  }

  if (Array.isArray(type)) {
    for (const item of type) {
      if (item === OBJECT_SCHEMA_TYPE) {
        return true;
      }
    }
  }

  return false;
}

export function ensureObjectTypeForObjectKeywords(
  type: CastrSchema['type'] | undefined,
  options: {
    hasProperties: boolean;
    hasRequired: boolean;
    hasAdditionalProperties: boolean;
  },
): CastrSchema['type'] | undefined {
  const resolvedType = usesObjectKeywords(options) ? resolveObjectKeywordSchemaType(type) : type;
  return resolvedType;
}

function usesObjectKeywords(options: {
  hasProperties: boolean;
  hasRequired: boolean;
  hasAdditionalProperties: boolean;
}): boolean {
  return options.hasProperties || options.hasRequired || options.hasAdditionalProperties;
}

function resolveObjectKeywordSchemaType(
  type: CastrSchema['type'] | undefined,
): CastrSchema['type'] | undefined {
  let resolvedType = type;

  if (type === undefined) {
    resolvedType = OBJECT_SCHEMA_TYPE;
  } else if (!isObjectSchemaType(type)) {
    throw new Error(
      'Object-only keywords properties, required, and additionalProperties require an object schema type.',
    );
  }

  return resolvedType;
}
