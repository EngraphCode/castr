import { isReferenceObject, type ReferenceObject, type SchemaObject } from 'openapi3-ts/oas31';

import {
  applyArrayKeywords,
  applyCompositionKeywords,
  applyNumericKeywords,
  applyObjectKeywords,
  applyStringKeywords,
  applyTypeInformation,
  type MutableJsonSchema,
} from './keyword-appliers.js';
import { assignIfDefined, readSchemaKeyword, setKeyword } from './keyword-helpers.js';
import { logger } from '../../../shared/utils/logger.js';
import { parseComponentRef } from '../../../shared/ref-resolution.js';

type OpenApiSchema = SchemaObject | ReferenceObject;
const SCHEMA_TYPE_NULL = 'null' as const;
const OPENAPI_COMPONENT_TYPE_SCHEMAS = 'schemas' as const;
const JSON_SCHEMA_DEFINITIONS_PREFIX = '#/definitions/' as const;

/**
 * Convert an OpenAPI 3.1 schema object (Scalar-upgraded) into a JSON Schema Draft 07 representation.
 * This initial implementation focuses on primitive schemas and shared metadata, expanding via TDD.
 */
export function convertOpenApiSchemaToJsonSchema(schema: OpenApiSchema): MutableJsonSchema {
  try {
    return convertSchemaInternal(schema);
  } catch (error) {
    logger.warn(createFallbackMessage(schema), error);
    return createPermissiveSchema();
  }
}

function convertSchemaInternal(schema: OpenApiSchema): MutableJsonSchema {
  let result: MutableJsonSchema;

  if (isReferenceObject(schema)) {
    result = createReferenceSchema(rewriteComponentRef(schema.$ref));
  } else {
    result = convertSchemaObject(schema);
  }

  return result;
}

function convertUnionSchema(schema: SchemaObject): MutableJsonSchema {
  const base = extractSharedKeywords(schema);
  const strippedSchema = cloneWithoutSharedKeywords(schema);

  const typeArray = Array.isArray(schema.type)
    ? schema.type.map((entry) => (entry == null ? SCHEMA_TYPE_NULL : entry))
    : [];

  const nonNullTypes = typeArray.filter((typeEntry) => typeEntry !== SCHEMA_TYPE_NULL);

  const anyOf = nonNullTypes.map((typeEntry) =>
    convertOpenApiSchemaToJsonSchema({
      ...strippedSchema,
      type: typeEntry,
    }),
  );

  if (typeArray.some((typeEntry) => typeEntry === SCHEMA_TYPE_NULL)) {
    anyOf.push({ type: SCHEMA_TYPE_NULL });
  }

  return {
    ...base,
    anyOf,
  };
}

function convertNonUnionSchema(schema: SchemaObject): MutableJsonSchema {
  const result = extractSharedKeywords(schema);

  applyTypeInformation(schema, result);
  applyStringKeywords(schema, result);
  applyNumericKeywords(schema, result);
  applyArrayKeywords(schema, result, convertOpenApiSchemaToJsonSchema);
  applyObjectKeywords(schema, result, convertOpenApiSchemaToJsonSchema);
  applyCompositionKeywords(schema, result, convertOpenApiSchemaToJsonSchema);

  const dynamicRef = getStringKeyword(schema, '$dynamicRef');
  if (dynamicRef) {
    result['$ref'] = rewriteComponentRef(dynamicRef);
  }

  return result;
}

function extractSharedKeywords(schema: SchemaObject): MutableJsonSchema {
  const shared: MutableJsonSchema = {};

  assignIfDefined(schema.description, (value) => {
    setKeyword(shared, 'description', value);
  });

  assignIfDefined(schema.default, (value) => {
    setKeyword(shared, 'default', value);
  });

  assignIfDefined(schema.readOnly, (value) => {
    setKeyword(shared, 'readOnly', value);
  });

  assignIfDefined(schema.writeOnly, (value) => {
    setKeyword(shared, 'writeOnly', value);
  });

  const examples = normaliseExamples(schema.examples);
  if (examples !== undefined) {
    setKeyword(shared, 'examples', examples);
  }

  return shared;
}

function normaliseExamples(examples: SchemaObject['examples']): unknown[] | undefined {
  if (!Array.isArray(examples)) {
    return undefined;
  }

  const values: unknown[] = [];
  for (const example of examples) {
    values.push(isExampleObject(example) ? example.value : example);
  }
  return values;
}

function cloneWithoutSharedKeywords(schema: SchemaObject): SchemaObject {
  const clone: SchemaObject = { ...schema };
  delete clone.description;
  delete clone.default;
  delete clone.readOnly;
  delete clone.writeOnly;
  delete clone.examples;
  delete clone.type;
  delete clone.$vocabulary;
  delete clone.$dynamicRef;
  delete clone.$dynamicAnchor;
  delete clone.prefixItems;
  delete clone.unevaluatedItems;
  delete clone.unevaluatedProperties;
  delete clone.dependentSchemas;
  return clone;
}

function isExampleObject(candidate: unknown): candidate is { value: unknown } {
  return typeof candidate === 'object' && candidate !== null && 'value' in candidate;
}

function rewriteComponentRef(ref: string): string {
  try {
    const parsedRef = parseComponentRef(ref);
    if (parsedRef.componentType === OPENAPI_COMPONENT_TYPE_SCHEMAS) {
      return `${JSON_SCHEMA_DEFINITIONS_PREFIX}${parsedRef.componentName}`;
    }
  } catch {
    return ref;
  }
  return ref;
}

function getStringKeyword(schema: SchemaObject, key: string): string | undefined {
  const value = readSchemaKeyword(schema, key);
  return typeof value === 'string' ? value : undefined;
}

function createReferenceSchema(ref: string): MutableJsonSchema {
  return { $ref: ref };
}

function convertSchemaObject(schema: SchemaObject): MutableJsonSchema {
  if (Array.isArray(schema.type)) {
    return convertUnionSchema(schema);
  }

  return convertNonUnionSchema(schema);
}

function createFallbackMessage(schema: OpenApiSchema): string {
  const prefix = '[json-schema] Failed to convert schema';
  const details = describeSchema(schema);
  if (details) {
    return `${prefix} (${details}); emitted permissive schema`;
  }
  return `${prefix}; emitted permissive schema`;
}

function describeSchema(schema: OpenApiSchema): string | undefined {
  if (isReferenceObject(schema)) {
    return `reference ${schema.$ref}`;
  }

  const fragments: string[] = [];

  if (schema.title) {
    fragments.push(`title "${schema.title}"`);
  }

  if (schema.type) {
    if (Array.isArray(schema.type)) {
      fragments.push(`types [${schema.type.join(', ')}]`);
    } else {
      fragments.push(`type ${schema.type}`);
    }
  }

  if (schema.description) {
    fragments.push('has description');
  }

  return fragments.length > 0 ? fragments.join(', ') : undefined;
}

function createPermissiveSchema(): MutableJsonSchema {
  return {};
}
