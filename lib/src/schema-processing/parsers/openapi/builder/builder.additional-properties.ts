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

/** Keywords that count an object's properties. The model has no place for them. */
const PROPERTY_COUNT_KEYWORDS = ['minProperties', 'maxProperties'] as const;

/**
 * A constrained map is read only whole. Before maps were read, a map with a property
 * count was refused with every other schema-valued `additionalProperties`; reading the
 * map and leaving the count behind would drop a constraint without a word.
 */
function rejectPropertyCountBesideMap(schema: SchemaObject): void {
  const held = PROPERTY_COUNT_KEYWORDS.find((keyword) => schema[keyword] !== undefined);
  if (held !== undefined) {
    throw new Error(
      `A constrained map that also holds ${held} is rejected: ` +
        `Castr's model does not carry ${held}, so the constraint would be dropped.`,
    );
  }
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
    rejectPropertyCountBesideMap(schema);
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
