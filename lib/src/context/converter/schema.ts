import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import type { CastrSchema, CastrSchemaProperties } from '../ir-schema.js';

// Remove and import the shared UnknownRecord type and UnknownRecord type predicate

export function convertSchema(irSchema: CastrSchema): SchemaObject | ReferenceObject {
  const {
    // metadata is unused in SchemaObject
    // metadata is unused in SchemaObject
    properties,
    items,
    additionalProperties,
    allOf,
    oneOf,
    anyOf,
    not,
    required,
    discriminator,
    ...rest
  } = irSchema;

  const schema: SchemaObject = {};

  copyPrimitives(schema, rest);

  if (discriminator) {
    schema.discriminator = discriminator;
  }

  if (properties) {
    schema.properties = convertProperties(properties);
  }

  convertItems(schema, items);

  if (additionalProperties !== undefined) {
    schema.additionalProperties =
      typeof additionalProperties === 'object'
        ? convertSchema(additionalProperties)
        : additionalProperties;
  }

  convertComposition(schema, { allOf, oneOf, anyOf, not });

  if (required && required.length > 0) {
    schema.required = required;
  }

  return schema;
}

function copyPrimitives(schema: SchemaObject, rest: Partial<CastrSchema>): void {
  const keys: (keyof CastrSchema)[] = [
    'type',
    'format',
    'description',
    'default',
    'example',
    'examples',
    'enum',
    'const',
    'deprecated',
    'readOnly',
    'writeOnly',
    '$ref',
    'minItems',
    'maxItems',
    'uniqueItems',
    'minLength',
    'maxLength',
    'pattern',
    'minimum',
    'maximum',
    'exclusiveMinimum',
    'exclusiveMaximum',
    'multipleOf',
  ];
  const commonKeys = new Set<string>(keys);

  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) {
      continue;
    }

    if (commonKeys.has(key) || key.startsWith('x-')) {
      // SchemaObject allows string indexing for extensions
      Object.assign(schema, { [key]: value });
    }
  }
}

function convertItems(schema: SchemaObject, items: CastrSchema['items']): void {
  if (!items) {
    return;
  }
  if (Array.isArray(items)) {
    schema.prefixItems = items.map(convertSchema);
  } else {
    schema.items = convertSchema(items);
  }
}

function convertComposition(
  schema: SchemaObject,
  composition: {
    allOf?: CastrSchema[] | undefined;
    oneOf?: CastrSchema[] | undefined;
    anyOf?: CastrSchema[] | undefined;
    not?: CastrSchema | undefined;
  },
): void {
  if (composition.allOf) {
    schema.allOf = composition.allOf.map(convertSchema);
  }
  if (composition.oneOf) {
    schema.oneOf = composition.oneOf.map(convertSchema);
  }
  if (composition.anyOf) {
    schema.anyOf = composition.anyOf.map(convertSchema);
  }
  if (composition.not) {
    schema.not = convertSchema(composition.not);
  }
}

export function convertProperties(
  props: CastrSchemaProperties,
): Record<string, SchemaObject | ReferenceObject> {
  const result: Record<string, SchemaObject | ReferenceObject> = {};
  for (const [key, value] of props.entries()) {
    result[key] = convertSchema(value);
  }
  return result;
}
