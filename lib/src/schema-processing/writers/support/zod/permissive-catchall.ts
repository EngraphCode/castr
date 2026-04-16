import type { CastrSchema } from '../../../ir/index.js';
import {
  ZOD_INTERNAL_PERMISSIVE_CATCHALL_ANY,
  ZOD_INTERNAL_PERMISSIVE_CATCHALL_UNKNOWN,
} from '../../../../shared/zod/permissive-catchall.constants.js';

export function getPermissiveCatchallBase(schema: CastrSchema): string | undefined {
  const validations = schema.metadata?.zodChain.validations ?? [];
  if (validations.some((validation) => validation === ZOD_INTERNAL_PERMISSIVE_CATCHALL_ANY)) {
    return 'z.any()';
  }
  if (validations.some((validation) => validation === ZOD_INTERNAL_PERMISSIVE_CATCHALL_UNKNOWN)) {
    return 'z.unknown()';
  }
  return undefined;
}

export function stripInternalPermissiveCatchallValidations(validations: string[]): string[] {
  return validations.filter(
    (validation) =>
      validation !== ZOD_INTERNAL_PERMISSIVE_CATCHALL_ANY &&
      validation !== ZOD_INTERNAL_PERMISSIVE_CATCHALL_UNKNOWN,
  );
}
