import type { CastrSchema } from '../models/schema.js';
import {
  INTEGER_SCHEMA_TYPE,
  INTEGER_SEMANTICS_BIGINT,
  INTEGER_SEMANTICS_INT64,
  type IRIntegerSemantics,
  isIRIntegerSemantics,
} from './core.js';

function isIntegerSchemaTypeEntry(value: CastrSchema['type']): value is typeof INTEGER_SCHEMA_TYPE {
  return value === INTEGER_SCHEMA_TYPE;
}

export function schemaTypeIncludesInteger(type: CastrSchema['type'] | undefined): boolean {
  if (isIntegerSchemaTypeEntry(type)) {
    return true;
  }

  if (!Array.isArray(type)) {
    return false;
  }

  return type.some((typeEntry) => typeEntry === INTEGER_SCHEMA_TYPE);
}

function assertIntegerCarrier(schema: CastrSchema, sourceDescription: string): void {
  if (!schemaTypeIncludesInteger(schema.type)) {
    throw new Error(`${sourceDescription} requires an integer schema.`);
  }
}

export function getIntegerSemantics(schema: CastrSchema): IRIntegerSemantics | undefined {
  if (!schemaTypeIncludesInteger(schema.type)) {
    return undefined;
  }

  if (schema.integerSemantics !== undefined) {
    return schema.integerSemantics;
  }

  if (schema.format === INTEGER_SEMANTICS_INT64) {
    return INTEGER_SEMANTICS_INT64;
  }

  if (schema.format === INTEGER_SEMANTICS_BIGINT) {
    return INTEGER_SEMANTICS_BIGINT;
  }

  return undefined;
}

function assertCompatibleExistingSemantics(
  existingSemantics: IRIntegerSemantics | undefined,
  semantics: IRIntegerSemantics,
): void {
  if (existingSemantics !== undefined && existingSemantics !== semantics) {
    throw new Error(
      `Explicit ${semantics} conflicts with existing ${existingSemantics} semantics.`,
    );
  }
}

function applyInt64Semantics(schema: CastrSchema): void {
  if (schema.format !== undefined && schema.format !== INTEGER_SEMANTICS_INT64) {
    throw new Error(
      `Explicit int64 conflicts with explicit non-int64 integer format "${schema.format}".`,
    );
  }

  schema.format = INTEGER_SEMANTICS_INT64;
}

function applyBigIntSemantics(schema: CastrSchema): void {
  if (schema.format !== undefined && schema.format !== INTEGER_SEMANTICS_BIGINT) {
    throw new Error(
      `Explicit bigint conflicts with explicit non-bigint integer format "${schema.format}".`,
    );
  }

  if (schema.format === INTEGER_SEMANTICS_BIGINT) {
    delete schema.format;
  }
}

export function applyExplicitIntegerSemantics(
  schema: CastrSchema,
  semantics: IRIntegerSemantics,
): void {
  assertIntegerCarrier(schema, `Explicit ${semantics}`);

  assertCompatibleExistingSemantics(getIntegerSemantics(schema), semantics);

  if (semantics === INTEGER_SEMANTICS_INT64) {
    applyInt64Semantics(schema);
  } else if (semantics === INTEGER_SEMANTICS_BIGINT) {
    applyBigIntSemantics(schema);
  } else if (!isIRIntegerSemantics(semantics)) {
    throw new Error(`Unsupported integer semantics "${String(semantics)}".`);
  }

  schema.integerSemantics = semantics;
}

export {
  INTEGER_SCHEMA_TYPE,
  INTEGER_SEMANTICS_BIGINT,
  INTEGER_SEMANTICS_INT64,
  type IRIntegerSemantics,
  isIRIntegerSemantics,
};
