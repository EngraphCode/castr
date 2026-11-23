import type { ReferenceObject, SchemaObject } from '../../../../shared/openapi-types.js';
import { type CastrSchema, isConstrainedMap, isObjectSchemaType } from '../../../ir/index.js';
import type { IRBuildContext } from '../builder.types.js';
import {
  buildNonStrictObjectRejectionMessage,
  describePortableNonStrictObjectInput,
} from '../../../object-semantics.js';

function isObjectKeywordCandidate(schema: SchemaObject, irSchema: CastrSchema): boolean {
  return (
    isObjectSchemaType(irSchema.type) ||
    schema.properties !== undefined ||
    (Array.isArray(schema.required) && schema.required.length > 0) ||
    schema.additionalProperties !== undefined
  );
}

type BuildSchema = (schema: SchemaObject | ReferenceObject, context: IRBuildContext) => CastrSchema;

/**
 * Read an object's unknown-key policy into the model.
 *
 * An object that states no policy is read as closed (SPEC-P-1). A constrained map, the
 * first row of the specification's Appendix B.2, is read with the schema its keys must
 * satisfy. Every other stated policy has no row yet and is refused.
 */
export function addAdditionalProperties(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
  buildSchema: BuildSchema,
): void {
  if (!isObjectKeywordCandidate(schema, irSchema)) {
    return;
  }

  const { additionalProperties } = schema;
  if (additionalProperties === false || additionalProperties === undefined) {
    irSchema.additionalProperties = false;
    return;
  }

  if (additionalProperties !== true && isConstrainedMap(schema)) {
    irSchema.additionalProperties = buildSchema(additionalProperties, {
      ...context,
      path: [...context.path, 'additionalProperties'],
    });
    return;
  }

  const inputDescription = describePortableNonStrictObjectInput({ additionalProperties });
  if (inputDescription === undefined) {
    return;
  }

  throw new Error(buildNonStrictObjectRejectionMessage(inputDescription));
}
