import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import type { IRSchema, IRSchemaProperties } from '../ir-schema.js';

export function convertSchema(irSchema: IRSchema): SchemaObject | ReferenceObject {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata,
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

function copyPrimitives(schema: SchemaObject, rest: Partial<IRSchema>): void {
  const commonKeys = new Set([
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
  ]);

  for (const key of Object.keys(rest)) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const value = (rest as any)[key];
    if (value === undefined) {
      continue;
    }

    if (commonKeys.has(key) || key.startsWith('x-')) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      (schema as any)[key] = value;
    }
  }
}

function convertItems(schema: SchemaObject, items: IRSchema['items']): void {
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
    allOf?: IRSchema[] | undefined;
    oneOf?: IRSchema[] | undefined;
    anyOf?: IRSchema[] | undefined;
    not?: IRSchema | undefined;
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
  props: IRSchemaProperties,
): Record<string, SchemaObject | ReferenceObject> {
  const result: Record<string, SchemaObject | ReferenceObject> = {};
  for (const [key, value] of props.entries()) {
    result[key] = convertSchema(value);
  }
  return result;
}
