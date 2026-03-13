import type { CastrSchema } from '../../../ir/index.js';

export const SCHEMA_TYPE_NULL = 'null';

function isNullSchemaType(
  typeEntry: NonNullable<Extract<CastrSchema['type'], unknown[]>>[number],
): boolean {
  return typeEntry === SCHEMA_TYPE_NULL;
}

export function getNormalizedNullableTypeEntries(
  type: CastrSchema['type'] | undefined,
  nullable: boolean,
): NonNullable<Extract<CastrSchema['type'], unknown[]>> | undefined {
  if (type === undefined) {
    return undefined;
  }

  if (!Array.isArray(type)) {
    return [type];
  }

  if (!nullable) {
    return type;
  }

  return type.filter((typeEntry) => !isNullSchemaType(typeEntry));
}
