import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import type { Schema as JsonSchema } from 'ajv';
import { SCHEMA_TYPE_INTEGER, SCHEMA_TYPE_NUMBER } from '../json-schema-constants.js';

export type SchemaLike = SchemaObject | ReferenceObject;
export type MutableJsonSchema = Extract<JsonSchema, object>;
export type Converter = (schema: SchemaLike) => JsonSchema;

export function assignIfDefined<T>(value: T | undefined, assign: (resolved: T) => void): void {
  if (value !== undefined) {
    assign(value);
  }
}

export function isNumericSchema(schema: SchemaObject): boolean {
  return schema.type === SCHEMA_TYPE_NUMBER || schema.type === SCHEMA_TYPE_INTEGER;
}

export function isLegacyExclusiveValue(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function setKeyword(target: MutableJsonSchema, key: string, value: unknown): void {
  target[key] = value;
}

export function hasJsonSchemaKeyword(target: MutableJsonSchema, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, key);
}

export function isSchemaLike(value: unknown): value is SchemaLike {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toSchemaLike(value: unknown): SchemaLike | undefined {
  return isSchemaLike(value) ? value : undefined;
}

export function toSchemaLikeArray(value: unknown): SchemaLike[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const result: SchemaLike[] = [];
  for (const item of value) {
    if (!isSchemaLike(item)) {
      return undefined;
    }
    result.push(item);
  }

  return result;
}

export function readSchemaKeyword(schema: SchemaObject, keyword: string): unknown {
  return Object.getOwnPropertyDescriptor(schema, keyword)?.value;
}

export function isSchemaLikeRecord(value: unknown): value is Record<string, SchemaLike> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  for (const [, candidate] of Object.entries(value)) {
    if (!isSchemaLike(candidate)) {
      return false;
    }
  }

  return true;
}
