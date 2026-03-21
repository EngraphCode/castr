import type { CastrSchema } from '../../../ir/index.js';
import { ZOD_STRICT_OBJECT_METHOD } from '../zod-constants.js';
import { buildNonStrictObjectRejectionMessage } from '../../../object-semantics.js';

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
): void {
  if (isStrict) {
    return;
  }

  const descriptor =
    baseMethod === ZOD_STRICT_OBJECT_METHOD
      ? 'z.strictObject() with non-strict chained modifier'
      : `${baseMethod}()`;

  throw new Error(buildNonStrictObjectRejectionMessage(descriptor));
}
