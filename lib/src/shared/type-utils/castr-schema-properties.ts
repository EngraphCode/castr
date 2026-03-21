export const CASTR_SCHEMA_PROPERTIES_BRAND = Symbol.for('@engraph/castr/CastrSchemaProperties');
export const SERIALIZED_DATA_TYPE_SCHEMA_PROPERTIES = 'CastrSchemaProperties';

export interface CastrSchemaLike {
  metadata: unknown;
  [key: string]: unknown;
}

export interface CastrSchemaPropertiesLike<TValue = unknown> {
  get(name: string): TValue | undefined;
  has(name: string): boolean;
  entries(): IterableIterator<[string, TValue]>;
}

export function brandCastrSchemaProperties(target: object): void {
  Object.defineProperty(target, CASTR_SCHEMA_PROPERTIES_BRAND, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

export function hasCastrSchemaPropertiesBrand(value: unknown): value is CastrSchemaPropertiesLike {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (
    'dataType' in value &&
    Reflect.get(value, 'dataType') === SERIALIZED_DATA_TYPE_SCHEMA_PROPERTIES
  ) {
    return false;
  }

  return (
    Reflect.get(value, CASTR_SCHEMA_PROPERTIES_BRAND) === true &&
    typeof Reflect.get(value, 'get') === 'function' &&
    typeof Reflect.get(value, 'has') === 'function' &&
    typeof Reflect.get(value, 'entries') === 'function'
  );
}
