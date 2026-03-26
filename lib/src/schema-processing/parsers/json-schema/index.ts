/**
 * JSON Schema parser module — parses JSON Schema (Draft 07 + 2020-12) into IR.
 *
 * `parseJsonSchemaDocument()` parses both root-level schemas and `$defs`
 * bundles. Documents may contain a root schema, `$defs`, or both.
 * `propertyNames`, `contains`) are rejected with an actionable error.
 * `patternProperties` and `propertyNames` are supported.
 *
 * @example
 * ```typescript
 * import { parseJsonSchema, parseJsonSchemaDocument } from '@engraph/castr';
 *
 * const irSchema = parseJsonSchema({ type: 'object', properties: { ... } });
 *
 * // Standalone schema, $defs bundle, or both:
 * const components = parseJsonSchemaDocument({
 *   title: 'Order',
 *   type: 'object',
 *   properties: { item: { $ref: '#/$defs/Item' } },
 *   $defs: { Item: { type: 'object', ... } },
 * });
 * ```
 *
 * @module parsers/json-schema
 */

export type { JsonSchema2020 } from './json-schema-parser.core.js';
export { parseJsonSchemaObject } from './json-schema-parser.core.js';
export { normalizeDraft07 } from './normalization/index.js';
export type { Draft07Input } from './normalization/index.js';

import type { CastrSchema, CastrSchemaComponent } from '../../ir/index.js';
import { isReferenceObject } from 'openapi3-ts/oas31';
import type { JsonSchema2020 } from './json-schema-parser.core.js';
import { parseJsonSchemaObject, createDefaultMetadata } from './json-schema-parser.core.js';
import { normalizeDraft07 } from './normalization/index.js';
import type { Draft07Input } from './normalization/index.js';

/**
 * Parse a JSON Schema (Draft 07 or 2020-12) into CastrSchema IR.
 *
 * Automatically normalizes Draft 07 constructs to 2020-12 before parsing.
 *
 * @param input - A JSON Schema 2020-12 object (possibly with Draft 07 constructs)
 * @returns CastrSchema IR node
 * @public
 */
export function parseJsonSchema(input: Draft07Input): CastrSchema {
  const normalized = normalizeDraft07(input);
  return parseJsonSchemaObject(normalized);
}

/**
 * Parse a JSON Schema document into IR components.
 *
 * Supports standalone schemas, `$defs` bundles, and mixed documents.
 * Root schema naming: `title` > `$id` > `"Root"`.
 * Unsupported keywords are rejected with an actionable error.
 *
 * @param input - A JSON Schema document (Draft 07 or 2020-12)
 * @returns Array of IR schema components (root first if present, then `$defs`)
 * @throws {UnsupportedJsonSchemaKeywordError} if unsupported top-level keywords are present
 * @public
 */
export function parseJsonSchemaDocument(input: Draft07Input): CastrSchemaComponent[] {
  const normalized = normalizeDraft07(input);
  rejectUnsupportedDocumentKeywords(normalized);

  const components: CastrSchemaComponent[] = [];

  const rootSchema = extractRootSchema(normalized);
  if (rootSchema !== undefined) {
    const name = deriveRootName(normalized);
    const schema = parseJsonSchemaObject(rootSchema);
    components.push(buildComponent(name, schema));
  }

  components.push(...extractDefsAsComponents(normalized));
  return components;
}

function extractDefsAsComponents(normalized: JsonSchema2020): CastrSchemaComponent[] {
  const components: CastrSchemaComponent[] = [];
  const defs = normalized.$defs;
  if (defs === undefined) {
    return components;
  }

  for (const [name, defSchema] of Object.entries(defs)) {
    if (isReferenceObject(defSchema)) {
      continue;
    }
    const schema = parseJsonSchemaObject(defSchema);
    components.push(buildComponent(name, schema));
  }

  return components;
}

function buildComponent(name: string, schema: CastrSchema): CastrSchemaComponent {
  return {
    type: 'schema',
    name,
    schema,
    metadata: createDefaultMetadata(),
    description: schema.description ?? '',
  };
}

// ---------------------------------------------------------------------------
// Root schema extraction
// ---------------------------------------------------------------------------

/**
 * Keywords that indicate the document contains a root-level schema
 * (beyond just `$defs` and meta keywords).
 *
 * @internal
 */
const ROOT_SCHEMA_KEYWORDS = new Set([
  // Type and structure
  'type',
  'properties',
  'required',
  'additionalProperties',
  '$ref',

  // Array
  'items',
  'prefixItems',
  'minItems',
  'maxItems',
  'uniqueItems',

  // Composition
  'allOf',
  'oneOf',
  'anyOf',
  'not',

  // Validation constraints
  'enum',
  'const',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'minLength',
  'maxLength',
  'pattern',
  'contentEncoding',
  'format',
  'default',

  // Metadata (as schema content, not just document meta)
  'example',
  'examples',
  'deprecated',
  'readOnly',
  'writeOnly',

  // 2020-12 keywords
  'unevaluatedProperties',
  'unevaluatedItems',
  'dependentSchemas',
  'dependentRequired',
  'minContains',
  'maxContains',
  'patternProperties',
  'propertyNames',
]);

/**
 * If the document has any root-level schema keywords, build a schema
 * object from the non-meta, non-`$defs` keywords and return it for parsing.
 * Returns `undefined` if the document is `$defs`-only.
 *
 * @internal
 */
function extractRootSchema(doc: JsonSchema2020): JsonSchema2020 | undefined {
  const hasRootKeyword = Object.keys(doc).some((k) => ROOT_SCHEMA_KEYWORDS.has(k));
  if (!hasRootKeyword) {
    return undefined;
  }

  // The input document IS the root schema — parseJsonSchemaObject will
  // consume only the keywords it recognises and ignore meta/$defs.
  return doc;
}

/**
 * Derive a component name for the root schema.
 * Priority: `title` > `$id` basename > `"Root"`.
 *
 * @internal
 */
function deriveRootName(doc: JsonSchema2020): string {
  if (typeof doc.title === 'string' && doc.title.length > 0) {
    return doc.title;
  }

  if (typeof doc.$id === 'string' && doc.$id.length > 0) {
    return doc.$id;
  }

  return 'Root';
}

// ---------------------------------------------------------------------------
// Unsupported keyword rejection
// ---------------------------------------------------------------------------

/**
 * Keywords that are explicitly unsupported at the document level.
 * Documents containing these keywords are rejected with an actionable error.
 *
 * @internal
 */
const UNSUPPORTED_DOCUMENT_KEYWORDS = new Set([
  // Conditional applicators
  'if',
  'then',
  'else',

  // Dynamic references
  '$dynamicRef',
  '$dynamicAnchor',
  '$anchor',
]);

/**
 * Error thrown when `parseJsonSchemaDocument()` encounters top-level keywords
 * outside the governed allowlist.
 *
 * @public
 */
export class UnsupportedJsonSchemaKeywordError extends Error {
  readonly unsupportedKeywords: string[];

  constructor(keywords: string[]) {
    const list = keywords.map((k) => `"${k}"`).join(', ');
    super(
      `parseJsonSchemaDocument() encountered unsupported top-level keywords: ${list}. ` +
        'These keywords are not yet supported. See the JSON Schema parser module docs for the current supported surface.',
    );
    this.name = 'UnsupportedJsonSchemaKeywordError';
    this.unsupportedKeywords = keywords;
  }
}

function rejectUnsupportedDocumentKeywords(schema: JsonSchema2020): void {
  const unsupported: string[] = [];
  for (const key of Object.keys(schema)) {
    if (UNSUPPORTED_DOCUMENT_KEYWORDS.has(key)) {
      unsupported.push(key);
    }
  }
  if (unsupported.length > 0) {
    throw new UnsupportedJsonSchemaKeywordError(unsupported);
  }
}
