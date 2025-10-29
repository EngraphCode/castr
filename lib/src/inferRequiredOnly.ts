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

const isBrokenAllOfItem = (item: SchemaObject | ReferenceObject): item is SchemaObject => {
  return (
    !isReferenceObject(item) &&
    !!item.required &&
    !item.type &&
    !item.properties &&
    !item?.allOf &&
    !item?.anyOf &&
    !item.oneOf
  );
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
  const accumulator: [string[], (SchemaObject | ReferenceObject)[]] = [[], []];
  const [standaloneRequisites, noRequiredOnlyAllof]: [
    string[],
    (SchemaObject | ReferenceObject)[],
  ] = schema.allOf.reduce((acc, cur) => {
    if (isBrokenAllOfItem(cur)) {
      const required = cur.required;
      acc[0].push(...(required ?? []));
    } else {
      acc[1].push(cur);
    }
    return acc;
  }, accumulator);

  const composedRequiredSchema = {
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

  return {
    noRequiredOnlyAllof,
    composedRequiredSchema,
    patchRequiredSchemaInLoop: (prop: SchemaObject | ReferenceObject, doc: OpenAPIObject) => {
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
    },
  };
}
