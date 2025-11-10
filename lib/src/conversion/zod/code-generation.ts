import type { SchemaObject } from 'openapi3-ts/oas31';

/**
 * Generate Zod code for primitive types (string, number, integer, boolean, null).
 *
 * @param schema - The OpenAPI schema object
 * @returns Zod code string (e.g., "z.string()")
 */
export function generatePrimitiveZod(schema: SchemaObject): string {
  if (schema.type === 'string') {
    return 'z.string()';
  }
  if (schema.type === 'number') {
    return 'z.number()';
  }
  if (schema.type === 'integer') {
    return 'z.number().int()';
  }
  if (schema.type === 'boolean') {
    return 'z.boolean()';
  }
  if (schema.type === 'null') {
    return 'z.null()';
  }

  throw new Error(`Unsupported primitive type: ${schema.type}`);
}

/**
 * Generate Zod code for array types.
 *
 * @param schema - The OpenAPI schema object with type: "array"
 * @returns Zod code string (e.g., "z.array(z.string())")
 */
export function generateArrayZod(schema: SchemaObject): string {
  if (!schema.items) {
    return 'z.array(z.unknown())';
  }

  const items = schema.items;
  if (typeof items !== 'object' || '$ref' in items) {
    return 'z.array(z.unknown())';
  }

  // Items is a SchemaObject (not ReferenceObject since we checked '$ref' in items)
  if ('type' in items && items.type === 'string') {
    return 'z.array(z.string())';
  }
  if ('type' in items && items.type === 'number') {
    return 'z.array(z.number())';
  }

  return 'z.array(z.unknown())';
}

/**
 * Generate Zod code for object types.
 *
 * @param schema - The OpenAPI schema object with type: "object"
 * @returns Zod code string (e.g., "z.object({ name: z.string() })")
 */
export function generateObjectZod(schema: SchemaObject): string {
  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return 'z.object({})';
  }

  const properties: string[] = [];
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    if (typeof propSchema === 'object' && 'type' in propSchema && propSchema.type === 'string') {
      properties.push(`${key}: z.string()`);
    } else if (typeof propSchema === 'object') {
      properties.push(`${key}: z.unknown()`);
    }
  }

  return `z.object({ ${properties.join(', ')} })`;
}

/**
 * Generate Zod code for enum types.
 *
 * @param schema - The OpenAPI schema object with enum property
 * @returns Zod code string (e.g., "z.enum(['foo', 'bar'])")
 */
export function generateEnumZod(schema: SchemaObject): string {
  if (!schema.enum) {
    throw new Error('Schema must have enum property');
  }

  const values = schema.enum.map((v) => JSON.stringify(v)).join(', ');
  return `z.enum([${values}])`;
}

/**
 * Generate Zod code for $ref references.
 *
 * @param ref - The $ref string (e.g., "#/components/schemas/Pet")
 * @returns Schema name (e.g., "Pet")
 */
export function generateReferenceZod(ref: string): string {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  return name || ref;
}

/**
 * Generate Zod code for composition types (anyOf, allOf, oneOf).
 *
 * @param _schema - The OpenAPI schema object with composition (not yet used in stub)
 * @param type - The composition type
 * @returns Zod code string (e.g., "z.union([z.string(), z.number()])")
 *
 * @internal This is a minimal stub implementation. Full implementation will use schema parameter.
 */
export function generateCompositionZod(
  _schema: SchemaObject,
  type: 'anyOf' | 'allOf' | 'oneOf',
): string {
  if (type === 'anyOf' || type === 'oneOf') {
    return 'z.union([z.unknown()])';
  }
  if (type === 'allOf') {
    return 'z.intersection(z.unknown(), z.unknown())';
  }

  throw new Error(`Unsupported composition type: ${type}`);
}
