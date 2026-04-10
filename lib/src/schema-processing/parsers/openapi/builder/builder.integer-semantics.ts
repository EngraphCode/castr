import type { SchemaObject } from '../../../../shared/openapi-types.js';
import type { CastrSchema } from '../../../ir/index.js';
import {
  applyExplicitIntegerSemantics,
  INTEGER_SCHEMA_TYPE,
  INTEGER_SEMANTICS_INT64,
} from '../../../ir/index.js';
import { assertPortableIntegerInputSemanticsSupported } from '../../../compatibility/integer-target-capabilities.js';
import { CANONICAL_OPENAPI_TARGET_LABEL } from '../../../../shared/openapi/version.js';

export function applyIntegerFormatSemantics(
  schema: SchemaObject,
  inferredType: CastrSchema['type'] | undefined,
  irSchema: CastrSchema,
): boolean {
  if (schema.format === undefined) {
    return false;
  }

  assertPortableIntegerInputSemanticsSupported(
    CANONICAL_OPENAPI_TARGET_LABEL,
    inferredType,
    schema.format,
  );

  if (inferredType === INTEGER_SCHEMA_TYPE && schema.format === INTEGER_SEMANTICS_INT64) {
    applyExplicitIntegerSemantics(irSchema, INTEGER_SEMANTICS_INT64);
    return true;
  }

  return false;
}

export function applySchemaFormat(
  schema: SchemaObject,
  inferredType: CastrSchema['type'] | undefined,
  irSchema: CastrSchema,
): void {
  if (schema.format === undefined) {
    return;
  }

  if (applyIntegerFormatSemantics(schema, inferredType, irSchema)) {
    return;
  }

  irSchema.format = schema.format;
}
