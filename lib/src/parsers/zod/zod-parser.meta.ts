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

export interface ParsedZodMeta {
  title?: string;
  description?: string;
  deprecated?: boolean;
  example?: unknown;
  examples?: unknown[];
  externalDocs?: { url: string; description?: string };
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- XML metadata is arbitrary key-value pairs from OpenAPI spec
  xml?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-restricted-types -- AST parsing requires arbitrary object representation
type JsonObject = Record<string, unknown>;

/**
 * Extract metadata from chained `.meta()` calls.
 * @internal
 */
export function extractMetaFromChain(chainedMethods: ZodMethodCall[]): ParsedZodMeta | undefined {
  let meta: ParsedZodMeta | undefined;

  for (const method of chainedMethods) {
    if (method.name !== 'meta') {
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
 * Apply parsed metadata fields to a schema.
 * @internal
 */
export function applyMetaToSchema(schema: CastrSchema, meta: ParsedZodMeta | undefined): void {
  if (!meta) {
    return;
  }

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

  const extDocsResult = parseExternalDocsField(raw);
  if (extDocsResult === false) {
    return undefined;
  }
  if (extDocsResult) {
    meta.externalDocs = extDocsResult;
  }

  const xmlResult = parseXmlField(raw);
  if (xmlResult === false) {
    return undefined;
  }
  if (xmlResult) {
    meta.xml = xmlResult;
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

// eslint-disable-next-line sonarjs/function-return-type -- Returns union type by design for validation result
function parseExternalDocsField(
  raw: JsonObject,
): { url: string; description?: string } | false | undefined {
  if (raw['externalDocs'] === undefined) {
    return undefined;
  }
  const result = parseExternalDocs(raw['externalDocs']);
  return result === undefined ? false : result;
}

// eslint-disable-next-line sonarjs/function-return-type -- Returns union type by design for validation result
function parseXmlField(raw: JsonObject): JsonObject | false | undefined {
  if (raw['xml'] === undefined) {
    return undefined;
  }
  if (!isPlainObject(raw['xml'])) {
    return false;
  }
  return raw['xml'];
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

function parseGenericObject(node: Node): JsonObject | undefined {
  if (!Node.isObjectLiteralExpression(node)) {
    return undefined;
  }

  const result: JsonObject = {};

  for (const prop of node.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) {
      return undefined;
    }

    const name = getStaticPropertyName(prop.getNameNode());
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

    result[name] = value;
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

function getStaticPropertyName(node: Node): string | undefined {
  if (Node.isIdentifier(node)) {
    return node.getText();
  }

  if (Node.isStringLiteral(node)) {
    return node.getLiteralValue();
  }

  if (Node.isNumericLiteral(node)) {
    return node.getLiteralValue().toString();
  }

  return undefined;
}

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
