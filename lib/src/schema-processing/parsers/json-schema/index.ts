/**
 * JSON Schema parser module — parses JSON Schema (Draft 07 + 2020-12) into IR.
 *
 * > [!IMPORTANT]
 * > `parseJsonSchemaDocument()` is a **`$defs`-focused extractor**. It extracts
 * > named component schemas from `$defs` / `definitions` but does not parse
 * > the root schema itself as a standalone document. Top-level keywords outside
 * > the governed allowlist are rejected with an actionable error. Full document
 * > ingestion is a planned future capability.
 *
 * @example
 * ```typescript
 * import { parseJsonSchema, parseJsonSchemaDocument } from '@engraph/castr';
 *
 * const irSchema = parseJsonSchema({ type: 'object', properties: { ... } });
 * const components = parseJsonSchemaDocument({
 *   $defs: { Address: { type: 'object', ... } },
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
 * Parse a JSON Schema document with `$defs` into IR components.
 *
 * This function is a `$defs`-focused extractor: it extracts named component
 * schemas from `$defs` (or Draft 07 `definitions`) but does not parse the
 * root schema as a standalone document. Top-level keywords outside the
 * governed allowlist are rejected with an actionable error.
 *
 * @param input - A JSON Schema document with $defs
 * @returns Array of IR schema components
 * @throws {UnsupportedJsonSchemaKeywordError} if unsupported top-level keywords are present
 * @public
 */
export function parseJsonSchemaDocument(input: Draft07Input): CastrSchemaComponent[] {
  const normalized = normalizeDraft07(input);
  rejectUnsupportedDocumentKeywords(normalized);
  return extractDefsAsComponents(normalized);
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
// Unsupported keyword rejection
// ---------------------------------------------------------------------------

/**
 * Keywords allowed at the top level of a JSON Schema document passed to
 * `parseJsonSchemaDocument()`. Any keyword not in this set triggers a
 * governed rejection with an actionable error message.
 *
 * @internal
 */
const SUPPORTED_DOCUMENT_KEYWORDS = new Set([
  // Document-level meta
  '$schema',
  '$id',
  '$comment',
  'title',
  'description',

  // Definition containers (the only actively ingested content)
  '$defs',
  'definitions', // Draft 07 — normalized to $defs by normalizeDraft07()
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
        'This function is a $defs-focused extractor and does not parse root-level schema content. ' +
        'Use parseJsonSchema() for individual schema objects, or remove the unsupported keywords.',
    );
    this.name = 'UnsupportedJsonSchemaKeywordError';
    this.unsupportedKeywords = keywords;
  }
}

function rejectUnsupportedDocumentKeywords(schema: JsonSchema2020): void {
  const unsupported: string[] = [];
  for (const key of Object.keys(schema)) {
    if (!SUPPORTED_DOCUMENT_KEYWORDS.has(key)) {
      unsupported.push(key);
    }
  }
  if (unsupported.length > 0) {
    throw new UnsupportedJsonSchemaKeywordError(unsupported);
  }
}
