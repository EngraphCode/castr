import type { SchemaObject } from 'openapi3-ts/oas31';
import type { CastrSchema, PortableUnknownKeyBehaviorMode } from '../../ir/index.js';
import { UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY, isObjectSchemaType } from '../../ir/index.js';
import type { IRBuildContext } from './builder.types.js';
import {
  buildNonStrictObjectRejectionMessage,
  describePortableNonStrictObjectInput,
  normalizeObjectSchemaToStrip,
  shouldNormalizeNonStrictObjectInput,
} from '../../non-strict-object-policy.js';

type OpenApiSchemaWithUnknownKeyBehavior = SchemaObject & {
  [UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY]?: PortableUnknownKeyBehaviorMode;
};

export function applyOpenApiNonStrictObjectPolicy(
  schema: OpenApiSchemaWithUnknownKeyBehavior,
  context: IRBuildContext,
  irSchema: CastrSchema,
): void {
  if (!isObjectSchemaType(irSchema.type)) {
    return;
  }

  const inputDescription = describePortableNonStrictObjectInput({
    additionalProperties: schema.additionalProperties,
    [UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY]: schema[UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY],
  });

  if (inputDescription === undefined) {
    return;
  }

  if (shouldNormalizeNonStrictObjectInput(context)) {
    normalizeObjectSchemaToStrip(irSchema);
    return;
  }

  throw new Error(buildNonStrictObjectRejectionMessage(inputDescription));
}
