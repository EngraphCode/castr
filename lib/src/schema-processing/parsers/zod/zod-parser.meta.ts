/**
 * Zod Metadata Parsing
 *
 * Parses `.meta({...})` calls into IR metadata fields.
 *
 * @module parsers/zod/meta
 */

import type { CastrSchema } from '../../ir/schema.js';
import { Node } from 'ts-morph';
import { extractLiteralValue, type ZodMethodCall } from './zod-ast.js';
import { ZOD_METHOD_META } from './zod-constants.js';
import type { UnknownRecord } from '../../../shared/types.js';

export interface ParsedZodMeta {
  title?: string;
  description?: string;
  deprecated?: boolean;
  example?: unknown;
  examples?: unknown[];
  externalDocs?: { url: string; description?: string };
  xml?: UnknownRecord;
}

type JsonObject = UnknownRecord;

/**
 * Extract metadata from chained `.meta()` calls.
 * @internal
 */
export function extractMetaFromChain(chainedMethods: ZodMethodCall[]): ParsedZodMeta | undefined {
  let meta: ParsedZodMeta | undefined;

  for (const method of chainedMethods) {
    if (method.name !== ZOD_METHOD_META) {
      continue;
    }

    const parsed = parseMetaArgument(method.argNodes[0]);
    if (!parsed) {
      continue;
    }

    meta = { ...meta, ...parsed };
  }

  return meta;
}

/**
 * Apply core metadata fields (title, description, deprecated, example).
 * @internal
 */
function applyCoreMetaToSchema(schema: CastrSchema, meta: ParsedZodMeta): void {
  if (meta.title !== undefined) {
    schema.title = meta.title;
  }
  if (meta.description !== undefined) {
    schema.description = meta.description;
  }
  if (meta.deprecated !== undefined) {
    schema.deprecated = meta.deprecated;
  }
  if (meta.example !== undefined) {
    schema.example = meta.example;
  }
}

/**
 * Apply extended metadata fields (examples, externalDocs, xml).
 * @internal
 */
function applyExtendedMetaToSchema(schema: CastrSchema, meta: ParsedZodMeta): void {
  if (meta.examples !== undefined) {
    schema.examples = meta.examples;
  }
  if (meta.externalDocs !== undefined) {
    schema.externalDocs = meta.externalDocs;
  }
  if (meta.xml !== undefined) {
    schema.xml = meta.xml;
  }
}

/**
 * Apply parsed metadata fields to a schema.
 * @internal
 */
export function applyMetaToSchema(schema: CastrSchema, meta: ParsedZodMeta | undefined): void {
  if (!meta) {
    return;
  }

  applyCoreMetaToSchema(schema, meta);
  applyExtendedMetaToSchema(schema, meta);
}

/**
 * Apply metadata to a schema and return it.
 * Helper to reduce complexity in parser functions.
 * @internal
 */
export function applyMetaAndReturn<T extends CastrSchema>(
  schema: T | undefined,
  chainedMethods: ZodMethodCall[],
): T | undefined {
  if (!schema) {
    return undefined;
  }
  const meta = extractMetaFromChain(chainedMethods);
  applyMetaToSchema(schema, meta);
  return schema;
}

function parseMetaArgument(node: Node | undefined): ParsedZodMeta | undefined {
  if (!node || !Node.isObjectLiteralExpression(node)) {
    return undefined;
  }

  const raw = parseGenericObject(node);
  if (!raw) {
    return undefined;
  }

  return buildMetaFromRaw(raw);
}

function buildMetaFromRaw(raw: JsonObject): ParsedZodMeta | undefined {
  const meta: ParsedZodMeta = {};

  assignPrimitiveFields(meta, raw);

  if (!applyExternalDocsField(meta, raw)) {
    return undefined;
  }

  if (!applyXmlField(meta, raw)) {
    return undefined;
  }

  return meta;
}

function assignPrimitiveFields(meta: ParsedZodMeta, raw: JsonObject): void {
  if (typeof raw['title'] === 'string') {
    meta.title = raw['title'];
  }
  if (typeof raw['description'] === 'string') {
    meta.description = raw['description'];
  }
  if (typeof raw['deprecated'] === 'boolean') {
    meta.deprecated = raw['deprecated'];
  }
  if (Array.isArray(raw['examples'])) {
    meta.examples = raw['examples'];
  }
  if (raw['example'] !== undefined) {
    meta.example = raw['example'];
  }
}

function applyExternalDocsField(meta: ParsedZodMeta, raw: JsonObject): boolean {
  if (raw['externalDocs'] === undefined) {
    return true;
  }

  const result = parseExternalDocs(raw['externalDocs']);
  if (result === undefined) {
    return false;
  }

  meta.externalDocs = result;
  return true;
}

function applyXmlField(meta: ParsedZodMeta, raw: JsonObject): boolean {
  if (raw['xml'] === undefined) {
    return true;
  }

  if (!isPlainObject(raw['xml'])) {
    return false;
  }

  meta.xml = raw['xml'];
  return true;
}

function parseExternalDocs(value: unknown): { url: string; description?: string } | undefined {
  if (!isPlainObject(value)) {
    return undefined;
  }

  const urlValue = value['url'];
  if (typeof urlValue !== 'string') {
    return undefined;
  }

  const descriptionValue = value['description'];
  if (descriptionValue !== undefined && typeof descriptionValue !== 'string') {
    return undefined;
  }

  return {
    url: urlValue,
    ...(descriptionValue !== undefined ? { description: descriptionValue } : {}),
  };
}

/**
 * Parse a single property assignment from an object literal.
 * Returns [name, value] tuple or undefined if invalid.
 * @internal
 */
function parseObjectProperty(prop: Node): [string, unknown] | undefined {
  if (!Node.isPropertyAssignment(prop)) {
    return undefined;
  }

  const name = prop.getName();
  if (!name) {
    return undefined;
  }

  const initializer = prop.getInitializer();
  if (!initializer) {
    return undefined;
  }

  const value = parseMetaValue(initializer);
  if (value === undefined) {
    return undefined;
  }

  return [name, value];
}

function parseGenericObject(node: Node): JsonObject | undefined {
  if (!Node.isObjectLiteralExpression(node)) {
    return undefined;
  }

  const result: JsonObject = {};

  for (const prop of node.getProperties()) {
    const entry = parseObjectProperty(prop);
    if (!entry) {
      return undefined;
    }
    result[entry[0]] = entry[1];
  }

  return result;
}

function parseMetaValue(node: Node): unknown | undefined {
  if (Node.isArrayLiteralExpression(node)) {
    const values: unknown[] = [];
    for (const element of node.getElements()) {
      const parsed = parseMetaValue(element);
      if (parsed === undefined) {
        return undefined;
      }
      values.push(parsed);
    }
    return values;
  }

  if (Node.isObjectLiteralExpression(node)) {
    return parseGenericObject(node);
  }

  return extractLiteralValue(node);
}

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
