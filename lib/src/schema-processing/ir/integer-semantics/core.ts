export type IRIntegerSemantics = 'int64' | 'bigint';

export const INTEGER_SCHEMA_TYPE = 'integer';
export const INTEGER_SEMANTICS_INT64: IRIntegerSemantics = 'int64';
export const INTEGER_SEMANTICS_BIGINT: IRIntegerSemantics = 'bigint';

export function isIRIntegerSemantics(value: unknown): value is IRIntegerSemantics {
  return value === INTEGER_SEMANTICS_INT64 || value === INTEGER_SEMANTICS_BIGINT;
}
