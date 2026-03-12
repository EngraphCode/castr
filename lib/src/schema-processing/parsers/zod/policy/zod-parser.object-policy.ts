import type { CastrSchema, IRUnknownKeyBehavior } from '../../../ir/index.js';
import {
  UNKNOWN_KEY_MODE_CATCHALL,
  UNKNOWN_KEY_MODE_PASSTHROUGH,
  UNKNOWN_KEY_MODE_STRICT,
  UNKNOWN_KEY_MODE_STRIP,
} from '../../../ir/index.js';
import { ZOD_LOOSE_OBJECT_METHOD, ZOD_OBJECT_METHOD } from '../zod-constants.js';
import type { ZodParseOptions } from '../zod-parser.types.js';
import {
  buildNonStrictObjectRejectionMessage,
  normalizeObjectSchemaToStrip,
  shouldNormalizeNonStrictObjectInput,
} from '../../../non-strict-object-policy.js';

function describeNonStrictObjectInput(
  baseMethod: string,
  unknownKeyBehavior: IRUnknownKeyBehavior,
): string {
  if (baseMethod === ZOD_LOOSE_OBJECT_METHOD) {
    return 'z.looseObject()';
  }

  switch (unknownKeyBehavior.mode) {
    case UNKNOWN_KEY_MODE_PASSTHROUGH:
      return '.passthrough()';
    case UNKNOWN_KEY_MODE_CATCHALL:
      return '.catchall()';
    case UNKNOWN_KEY_MODE_STRIP:
      return baseMethod === ZOD_OBJECT_METHOD ? 'z.object()' : '.strip()';
    default:
      return 'z.object()';
  }
}

export function enforceObjectPolicy(
  schema: CastrSchema,
  baseMethod: string,
  options?: ZodParseOptions,
): void {
  if (schema.unknownKeyBehavior?.mode === UNKNOWN_KEY_MODE_STRICT) {
    return;
  }

  if (shouldNormalizeNonStrictObjectInput(options)) {
    normalizeObjectSchemaToStrip(schema);
    return;
  }

  throw new Error(
    buildNonStrictObjectRejectionMessage(
      describeNonStrictObjectInput(
        baseMethod,
        schema.unknownKeyBehavior ?? { mode: UNKNOWN_KEY_MODE_STRIP },
      ),
    ),
  );
}
