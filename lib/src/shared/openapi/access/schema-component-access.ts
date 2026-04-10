import {
  type OpenAPIDocument,
  type ReferenceObject,
  type SchemaObject,
  isReferenceObject,
} from '../../openapi-types.js';
import { parseComponentRef } from '../../ref-resolution.js';
import { isRecord } from '../../type-utils/types.js';
import { isSchemaObjectOrRef } from './schema-shape-guards.js';

const OPENAPI_COMPONENT_TYPE_SCHEMAS = 'schemas';

function getSchemaFromXExt(
  doc: OpenAPIDocument,
  name: string,
  xExtKey: string,
): SchemaObject | ReferenceObject | undefined {
  const xExt: unknown = doc['x-ext'];
  if (!isRecord(xExt)) {
    return undefined;
  }

  const xExtEntry = xExt[xExtKey];
  if (!isRecord(xExtEntry)) {
    return undefined;
  }

  const components = xExtEntry['components'];
  if (!isRecord(components)) {
    return undefined;
  }

  const schemas = components['schemas'];
  if (!isRecord(schemas)) {
    return undefined;
  }

  const schema = schemas[name];
  return isSchemaObjectOrRef(schema) ? schema : undefined;
}

function formatSearchLocations(xExtKey?: string): string {
  return xExtKey
    ? `x-ext.${xExtKey}.components.schemas or components.schemas`
    : 'components.schemas';
}

function searchAllXExtLocations(
  doc: OpenAPIDocument,
  name: string,
): SchemaObject | ReferenceObject | undefined {
  const xExt: unknown = doc['x-ext'];
  if (!isRecord(xExt)) {
    return undefined;
  }

  for (const key of Object.keys(xExt)) {
    const schema = getSchemaFromXExt(doc, name, key);
    if (schema) {
      return schema;
    }
  }

  return undefined;
}

/**
 * Get a schema from components.schemas by name while preserving internal $refs.
 */
export function getSchemaFromComponents(
  doc: OpenAPIDocument,
  name: string,
  xExtKey?: string,
): SchemaObject | ReferenceObject {
  if (xExtKey) {
    const schema = getSchemaFromXExt(doc, name, xExtKey);
    if (schema) {
      return schema;
    }
  }

  const standardSchema = doc.components?.schemas?.[name];
  if (standardSchema) {
    return standardSchema;
  }

  if (!xExtKey) {
    const fallbackSchema = searchAllXExtLocations(doc, name);
    if (fallbackSchema) {
      return fallbackSchema;
    }
  }

  throw new Error(`Schema '${name}' not found in ${formatSearchLocations(xExtKey)}`);
}

/**
 * Resolve a schema $ref to its definition.
 */
export function resolveSchemaRef(
  doc: OpenAPIDocument,
  schema: SchemaObject | ReferenceObject,
): SchemaObject {
  if (!isReferenceObject(schema)) {
    return schema;
  }

  const ref = schema.$ref;
  const parsedRef = parseComponentRef(ref);
  if (parsedRef.componentType !== OPENAPI_COMPONENT_TYPE_SCHEMAS) {
    throw new Error(
      `Invalid schema $ref: ${ref}. Expected schema reference, got ${parsedRef.componentType}`,
    );
  }

  const resolvedSchema = getSchemaFromComponents(doc, parsedRef.componentName, parsedRef.xExtKey);
  if (isReferenceObject(resolvedSchema)) {
    throw new Error(
      `Nested $ref in schema: ${ref} -> ${resolvedSchema.$ref}. ` +
        `Use SwaggerParser.dereference() to fully dereference the spec`,
    );
  }

  return resolvedSchema;
}
