import type { CastrSchema, IRUnknownKeyBehavior } from './models/schema.js';

export const UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY = 'x-castr-unknownKeyBehavior';
export const UNKNOWN_KEY_MODE_STRICT = 'strict';
export const UNKNOWN_KEY_MODE_STRIP = 'strip';
export const UNKNOWN_KEY_MODE_PASSTHROUGH = 'passthrough';
export const UNKNOWN_KEY_MODE_CATCHALL = 'catchall';

export type PortableUnknownKeyBehaviorMode =
  | typeof UNKNOWN_KEY_MODE_STRIP
  | typeof UNKNOWN_KEY_MODE_PASSTHROUGH;

const OBJECT_SCHEMA_TYPE = 'object';
const PORTABLE_UNKNOWN_KEY_BEHAVIOR_MODES: readonly PortableUnknownKeyBehaviorMode[] = [
  UNKNOWN_KEY_MODE_STRIP,
  UNKNOWN_KEY_MODE_PASSTHROUGH,
];

function isPortableUnknownKeyBehaviorMode(value: unknown): value is PortableUnknownKeyBehaviorMode {
  for (const mode of PORTABLE_UNKNOWN_KEY_BEHAVIOR_MODES) {
    if (value === mode) {
      return true;
    }
  }

  return false;
}

function isSchemaAdditionalProperties(
  additionalProperties: boolean | CastrSchema | undefined,
): additionalProperties is CastrSchema {
  return additionalProperties !== undefined && typeof additionalProperties !== 'boolean';
}

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

// eslint-disable-next-line sonarjs/function-return-type -- jc: legitimate return union
export function ensureObjectTypeForObjectKeywords(
  type: CastrSchema['type'] | undefined,
  options: {
    hasProperties: boolean;
    hasRequired: boolean;
    hasAdditionalProperties: boolean;
    hasUnknownKeyBehaviorExtension: boolean;
  },
): CastrSchema['type'] | undefined {
  const resolvedType = usesObjectKeywords(options) ? resolveObjectKeywordSchemaType(type) : type;
  return resolvedType;
}

function usesObjectKeywords(options: {
  hasProperties: boolean;
  hasRequired: boolean;
  hasAdditionalProperties: boolean;
  hasUnknownKeyBehaviorExtension: boolean;
}): boolean {
  return (
    options.hasProperties ||
    options.hasRequired ||
    options.hasAdditionalProperties ||
    options.hasUnknownKeyBehaviorExtension
  );
}

// eslint-disable-next-line sonarjs/function-return-type -- jc: legitimate return union
function resolveObjectKeywordSchemaType(
  type: CastrSchema['type'] | undefined,
): CastrSchema['type'] | undefined {
  let resolvedType = type;

  if (type === undefined) {
    resolvedType = OBJECT_SCHEMA_TYPE;
  } else if (!isObjectSchemaType(type)) {
    throw new Error(
      'Object-only keywords properties, required, additionalProperties, and x-castr-unknownKeyBehavior require an object schema type.',
    );
  }

  return resolvedType;
}

export function resolvePortableUnknownKeyBehavior(
  additionalProperties: boolean | CastrSchema | undefined,
  extensionValue: unknown,
): IRUnknownKeyBehavior | undefined {
  if (extensionValue !== undefined) {
    if (!isPortableUnknownKeyBehaviorMode(extensionValue)) {
      throw new Error(
        `Invalid ${UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY} value "${String(extensionValue)}". Expected one of: strip, passthrough.`,
      );
    }

    if (additionalProperties !== true) {
      throw new Error(`${UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY} requires additionalProperties: true.`);
    }

    return { mode: extensionValue };
  }

  if (additionalProperties === false) {
    return { mode: UNKNOWN_KEY_MODE_STRICT };
  }

  if (isSchemaAdditionalProperties(additionalProperties)) {
    return { mode: UNKNOWN_KEY_MODE_CATCHALL, schema: additionalProperties };
  }

  return undefined;
}

export function getPortableUnknownKeyBehaviorExtension(
  unknownKeyBehavior: IRUnknownKeyBehavior | undefined,
): PortableUnknownKeyBehaviorMode | undefined {
  if (unknownKeyBehavior?.mode === UNKNOWN_KEY_MODE_STRIP) {
    return UNKNOWN_KEY_MODE_STRIP;
  }

  if (unknownKeyBehavior?.mode === UNKNOWN_KEY_MODE_PASSTHROUGH) {
    return UNKNOWN_KEY_MODE_PASSTHROUGH;
  }

  return undefined;
}
