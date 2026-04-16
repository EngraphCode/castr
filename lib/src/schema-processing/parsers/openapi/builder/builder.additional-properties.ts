import type { ReferenceObject, SchemaObject } from '../../../../shared/openapi-types.js';
import { type CastrSchema, isObjectSchemaType } from '../../../ir/index.js';
import type { IRBuildContext } from '../builder.types.js';

function isObjectKeywordCandidate(schema: SchemaObject, irSchema: CastrSchema): boolean {
  return (
    isObjectSchemaType(irSchema.type) ||
    schema.properties !== undefined ||
    (Array.isArray(schema.required) && schema.required.length > 0) ||
    schema.additionalProperties !== undefined
  );
}

export function addAdditionalProperties(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildSchema: (schema: SchemaObject | ReferenceObject, context: IRBuildContext) => CastrSchema,
): void {
  if (!isObjectKeywordCandidate(schema, irSchema)) {
    return;
  }

  if (schema.additionalProperties === undefined) {
    return;
  }

  if (typeof schema.additionalProperties === 'boolean') {
    irSchema.additionalProperties = schema.additionalProperties;
    return;
  }

  irSchema.additionalProperties = buildSchema(schema.additionalProperties, {
    ...context,
    path: [...context.path, 'additionalProperties'],
    required: true,
  });
}
