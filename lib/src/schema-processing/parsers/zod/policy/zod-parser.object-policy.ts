import type { CastrSchema } from '../../../ir/index.js';
import {
  ZOD_OBJECT_METHOD,
  ZOD_STRICT_OBJECT_METHOD,
  ZOD_LOOSE_OBJECT_METHOD,
} from '../zod-constants.js';
import { buildNonStrictObjectRejectionMessage } from '../../../object-semantics.js';

function getObjectPolicyDescriptor(baseMethod: string): string {
  if (baseMethod === ZOD_STRICT_OBJECT_METHOD) {
    return 'z.strictObject() with non-strict chained modifier';
  }
  if (baseMethod === ZOD_LOOSE_OBJECT_METHOD) {
    return 'z.looseObject()';
  }
  return `${baseMethod}()`;
}

/**
 * Enforce strict-only object policy for Zod-parsed schemas.
 *
 * Under IDENTITY doctrine, all objects must use `z.strictObject()`.
 * Non-strict constructs (`z.object()`, `.passthrough()`, `.catchall()`, `z.looseObject()`)
 * are rejected at ingest.
 *
 * @internal
 */
export function enforceObjectPolicy(
  _schema: CastrSchema,
  baseMethod: string,
  isStrict: boolean,
  hasCatchall: boolean,
  hasWideningModifier: boolean,
): void {
  if (isStrict) {
    return;
  }

  if (hasCatchall && baseMethod === ZOD_OBJECT_METHOD && !hasWideningModifier) {
    return;
  }

  throw new Error(buildNonStrictObjectRejectionMessage(getObjectPolicyDescriptor(baseMethod)));
}
