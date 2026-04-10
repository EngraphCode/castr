import type { SchemaObject } from '../../../../shared/openapi-types.js';
import { type CastrSchema, isObjectSchemaType } from '../../../ir/index.js';
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

export function addAdditionalProperties(schema: SchemaObject, irSchema: CastrSchema): void {
  if (!isObjectKeywordCandidate(schema, irSchema)) {
    return;
  }

  if (schema.additionalProperties === false || schema.additionalProperties === undefined) {
    irSchema.additionalProperties = false;
    return;
  }

  const inputDescription = describePortableNonStrictObjectInput({
    additionalProperties: schema.additionalProperties,
  });
  if (inputDescription === undefined) {
    return;
  }

  throw new Error(buildNonStrictObjectRejectionMessage(inputDescription));
}
