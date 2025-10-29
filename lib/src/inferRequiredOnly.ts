import {
  type OpenAPIObject,
  type SchemaObject,
  type ReferenceObject,
  isReferenceObject,
} from 'openapi3-ts/oas30';
import { getSchemaFromComponents } from './component-access.js';

/**
 * Extract schema name from a component schema $ref
 */
const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    throw new Error(`Invalid schema $ref: ${ref}`);
  }
  return name;
};

/**
 * Check if a schema object has no actual schema properties (type, properties, composition keywords)
 */
const hasNoSchemaProperties = (item: SchemaObject): boolean => {
  return !item.type && !item.properties && !item?.allOf && !item?.anyOf && !item.oneOf;
};

/**
 * Detect "broken" allOf items that only have `required` but no schema definition
 */
const isBrokenAllOfItem = (item: SchemaObject | ReferenceObject): item is SchemaObject => {
  return !isReferenceObject(item) && !!item.required && hasNoSchemaProperties(item);
};

/**
 * Separate allOf items into broken (required-only) and valid schema items
 */
const separateBrokenAllOfItems = (
  allOfItems: (SchemaObject | ReferenceObject)[],
): [string[], (SchemaObject | ReferenceObject)[]] => {
  const accumulator: [string[], (SchemaObject | ReferenceObject)[]] = [[], []];
  return allOfItems.reduce((acc, cur) => {
    if (isBrokenAllOfItem(cur)) {
      const required = cur.required;
      acc[0].push(...(required ?? []));
    } else {
      acc[1].push(cur);
    }
    return acc;
  }, accumulator);
};

/**
 * Create a composed required schema from standalone required property names
 */
const createComposedRequiredSchema = (standaloneRequisites: string[]) => {
  return {
    properties: standaloneRequisites.reduce<Record<string, SchemaObject | ReferenceObject>>(
      (acc, cur) => {
        acc[cur] = {};
        return acc;
      },
      {},
    ),
    type: 'object' as const,
    required: standaloneRequisites,
  };
};

/**
 * Patch properties from a reference or schema object into the composed required schema
 */
const patchPropertiesFromRef = (
  composedRequiredSchema: ReturnType<typeof createComposedRequiredSchema>,
  prop: SchemaObject | ReferenceObject,
  doc: OpenAPIObject,
): void => {
  if (isReferenceObject(prop)) {
    const schemaName = getSchemaNameFromRef(prop.$ref);
    const refType = getSchemaFromComponents(doc, schemaName);
    if (refType && !isReferenceObject(refType)) {
      composedRequiredSchema.required.forEach((required) => {
        composedRequiredSchema.properties[required] = refType.properties?.[required] ?? {};
      });
    }
  } else {
    const properties = prop['properties'] ?? {};
    composedRequiredSchema.required.forEach((required) => {
      if (properties[required]) {
        composedRequiredSchema.properties[required] = properties[required] ?? {};
      }
    });
  }
};

export function inferRequiredSchema(schema: SchemaObject): {
  noRequiredOnlyAllof: (SchemaObject | ReferenceObject)[];
  composedRequiredSchema: {
    properties: Record<string, SchemaObject | ReferenceObject>;
    type: 'object';
    required: string[];
  };
  patchRequiredSchemaInLoop: (prop: SchemaObject | ReferenceObject, doc: OpenAPIObject) => void;
} {
  if (!schema.allOf) {
    throw new Error(
      'function inferRequiredSchema is specialized to handle item with required only in an allOf array.',
    );
  }

  const [standaloneRequisites, noRequiredOnlyAllof] = separateBrokenAllOfItems(schema.allOf);
  const composedRequiredSchema = createComposedRequiredSchema(standaloneRequisites);

  return {
    noRequiredOnlyAllof,
    composedRequiredSchema,
    patchRequiredSchemaInLoop: (prop: SchemaObject | ReferenceObject, doc: OpenAPIObject) => {
      patchPropertiesFromRef(composedRequiredSchema, prop, doc);
    },
  };
}
