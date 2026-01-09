/* eslint-disable max-lines -- Contains both legacy and IR-based implementations during transition */
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { convertOpenApiSchemaToJsonSchema } from '../conversion/json-schema/convert-schema.js';
import { setKeyword, type MutableJsonSchema } from '../conversion/json-schema/keyword-helpers.js';
import type { CastrDocument, CastrSchema, CastrSchemaComponent, IRComponent } from './ir-schema.js';
import { CastrSchemaProperties } from './ir-schema-properties.js';
import { sanitizeIdentifier } from '../shared/utils/string-utils.js';

const INLINE_REF_PREFIX = '#/definitions/';

interface InlineResolutionContext {
  document: OpenAPIObject;
  cache: Map<string, MutableJsonSchema>;
  stack: Set<string>;
}

const isJsonSchemaObject = (value: unknown): value is SchemaObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const inlineJsonSchemaValue = (value: unknown, context: InlineResolutionContext): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => inlineJsonSchemaValue(item, context));
  }

  if (isJsonSchemaObject(value)) {
    const reference = value['$ref'];
    if (typeof reference === 'string') {
      return resolveSchemaReference(reference, context);
    }

    return inlineJsonSchemaObject(value, context);
  }

  return value;
};

const inlineJsonSchemaObject = (
  schema: SchemaObject,
  context: InlineResolutionContext,
): MutableJsonSchema => {
  const result: MutableJsonSchema = {};

  for (const [key, entryValue] of Object.entries(schema)) {
    if (key === 'definitions') {
      continue;
    }
    setKeyword(result, key, inlineJsonSchemaValue(entryValue, context));
  }

  return result;
};

const resolveSchemaReference = (
  ref: string,
  context: InlineResolutionContext,
): MutableJsonSchema => {
  if (!ref.startsWith(INLINE_REF_PREFIX)) {
    return { $ref: ref };
  }

  const definitionName = ref.slice(INLINE_REF_PREFIX.length);
  const cached = context.cache.get(definitionName);
  if (cached !== undefined) {
    return cached;
  }

  if (context.stack.has(definitionName)) {
    return { $ref: ref };
  }

  const definition = context.document.components?.schemas?.[definitionName];
  if (!definition) {
    return { $ref: ref };
  }

  context.stack.add(definitionName);
  const inlined = inlineJsonSchema(convertOpenApiSchemaToJsonSchema(definition), context);
  context.stack.delete(definitionName);
  context.cache.set(definitionName, inlined);
  return inlined;
};

const inlineJsonSchema = (
  schema: MutableJsonSchema,
  context: InlineResolutionContext,
): MutableJsonSchema => {
  return inlineJsonSchemaObject(schema, context);
};

export const inlineJsonSchemaRefs = (
  schema: MutableJsonSchema,
  document: OpenAPIObject,
  cache = new Map<string, MutableJsonSchema>(),
  stack = new Set<string>(),
): MutableJsonSchema =>
  inlineJsonSchema(schema, {
    document,
    cache,
    stack,
  });

// ============================================================================
// IR-based functions (read from CastrDocument instead of OpenAPIObject)
// ============================================================================

/**
 * Context for IR-based schema ref resolution.
 */
interface IRInlineResolutionContext {
  ir: CastrDocument;
  cache: Map<string, MutableJsonSchema>;
  stack: Set<string>;
}

/**
 * Find a schema component by name in the IR components array.
 */
const findSchemaComponentByName = (
  components: IRComponent[],
  name: string,
): CastrSchemaComponent | undefined => {
  for (const component of components) {
    if (component.type === 'schema' && component.name === name) {
      return component;
    }
  }
  return undefined;
};

/**
 * Type guard for CastrSchema (has metadata property).
 */
const isCastrSchema = (value: unknown): value is CastrSchema =>
  typeof value === 'object' && value !== null && 'metadata' in value;

/**
 * Convert CastrSchemaProperties to plain object for JSON Schema.
 */
const convertPropertiesToJsonSchema = (
  properties: CastrSchemaProperties,
  converter: (schema: CastrSchema) => MutableJsonSchema,
): Record<string, MutableJsonSchema> => {
  const result: Record<string, MutableJsonSchema> = {};
  for (const [propName, propSchema] of properties.entries()) {
    result[propName] = converter(propSchema);
  }
  return result;
};

/**
 * Convert array values, recursively converting any CastrSchema items.
 */
const convertArrayValueToJsonSchema = (
  arr: unknown[],
  converter: (schema: CastrSchema) => MutableJsonSchema,
): unknown[] => {
  return arr.map((item) => (isCastrSchema(item) ? converter(item) : item));
};

/**
 * Process a single schema entry, returning the converted value.
 */
const processSchemaEntry = (value: unknown): MutableJsonSchema | unknown[] | unknown => {
  if (value instanceof CastrSchemaProperties) {
    return convertPropertiesToJsonSchema(value, castrSchemaToJsonSchema);
  }
  if (isCastrSchema(value)) {
    return castrSchemaToJsonSchema(value);
  }
  if (Array.isArray(value)) {
    return convertArrayValueToJsonSchema(value, castrSchemaToJsonSchema);
  }
  return value;
};

/**
 * Convert a CastrSchema to a plain object for JSON Schema processing.
 * Strips the metadata field which is IR-specific.
 */
const castrSchemaToJsonSchema = (schema: CastrSchema): MutableJsonSchema => {
  const result: MutableJsonSchema = {};

  for (const [key, value] of Object.entries(schema)) {
    if (key === 'metadata') {
      continue;
    }
    setKeyword(result, key, processSchemaEntry(value));
  }

  return result;
};

const inlineJsonSchemaValueFromIR = (
  value: unknown,
  context: IRInlineResolutionContext,
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => inlineJsonSchemaValueFromIR(item, context));
  }

  if (isJsonSchemaObject(value)) {
    const reference = value['$ref'];
    if (typeof reference === 'string') {
      return resolveSchemaReferenceFromIR(reference, context);
    }

    return inlineJsonSchemaObjectFromIR(value, context);
  }

  return value;
};

const inlineJsonSchemaObjectFromIR = (
  schema: MutableJsonSchema,
  context: IRInlineResolutionContext,
): MutableJsonSchema => {
  // Check if this schema is a reference object
  const reference: unknown = schema['$ref'];
  if (typeof reference === 'string') {
    return resolveSchemaReferenceFromIR(reference, context);
  }

  const result: MutableJsonSchema = {};

  for (const [key, entryValue] of Object.entries(schema)) {
    if (key === 'definitions') {
      continue;
    }
    setKeyword(result, key, inlineJsonSchemaValueFromIR(entryValue, context));
  }

  return result;
};

const COMPONENTS_SCHEMAS_PREFIX = '#/components/schemas/';

/**
 * Extract the schema name from a reference.
 * Handles both #/definitions/ and #/components/schemas/ prefixes.
 * Sanitizes the name to match how IR stores component names.
 */
const extractSchemaNameFromRef = (ref: string): string | undefined => {
  if (ref.startsWith(INLINE_REF_PREFIX)) {
    return sanitizeIdentifier(ref.slice(INLINE_REF_PREFIX.length));
  }
  if (ref.startsWith(COMPONENTS_SCHEMAS_PREFIX)) {
    return sanitizeIdentifier(ref.slice(COMPONENTS_SCHEMAS_PREFIX.length));
  }
  return undefined;
};

const resolveSchemaReferenceFromIR = (
  ref: string,
  context: IRInlineResolutionContext,
): MutableJsonSchema => {
  const definitionName = extractSchemaNameFromRef(ref);
  if (!definitionName) {
    // External reference or unsupported prefix - return as-is
    return { $ref: ref };
  }

  const cached = context.cache.get(definitionName);
  if (cached !== undefined) {
    return cached;
  }

  if (context.stack.has(definitionName)) {
    return { $ref: ref };
  }

  const component = findSchemaComponentByName(context.ir.components, definitionName);
  if (!component) {
    // Internal ref that can't be resolved - fail fast with helpful error
    throw new Error(
      `Unresolvable schema reference "${ref}". ` +
        `The schema "${definitionName}" does not exist in components.schemas.`,
    );
  }

  context.stack.add(definitionName);
  const asJsonSchema = castrSchemaToJsonSchema(component.schema);
  const inlined = inlineJsonSchemaFromIR(asJsonSchema, context);
  context.stack.delete(definitionName);
  context.cache.set(definitionName, inlined);
  return inlined;
};

const inlineJsonSchemaFromIR = (
  schema: MutableJsonSchema,
  context: IRInlineResolutionContext,
): MutableJsonSchema => {
  return inlineJsonSchemaObjectFromIR(schema, context);
};

/**
 * Inlines JSON Schema refs using the IR as the source of definitions.
 *
 * This function reads from `ir.components` (array of IRComponent) instead of
 * `document.components.schemas` (Record), eliminating the need to access raw OpenAPI.
 *
 * @param schema - JSON Schema with potential $refs
 * @param ir - CastrDocument containing component schemas
 * @param cache - Optional cache for resolved schemas
 * @param stack - Optional stack for circular reference detection
 * @returns JSON Schema with #/definitions/ refs inlined
 *
 * @example
 * ```typescript
 * const inlined = inlineJsonSchemaRefsFromIR(schema, irDocument);
 * ```
 */
export const inlineJsonSchemaRefsFromIR = (
  schema: MutableJsonSchema,
  ir: CastrDocument,
  cache = new Map<string, MutableJsonSchema>(),
  stack = new Set<string>(),
): MutableJsonSchema =>
  inlineJsonSchemaFromIR(schema, {
    ir,
    cache,
    stack,
  });
