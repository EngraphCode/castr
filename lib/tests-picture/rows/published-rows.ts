import type { Definition } from './definitions.js';
import {
  readInventory,
  readKeywords,
  readTypeValues,
  type Inventory,
  type KeywordKind,
} from './inventory.js';

/**
 * The seven vocabularies of JSON Schema 2020-12 an OpenAPI 3.1 or 3.2 schema may use,
 * each with the pinned file that defines it.
 */
const VOCABULARIES: readonly (readonly [string, string])[] = [
  ['core', 'jsonschema-2020-12-core.json'],
  ['applicator', 'jsonschema-2020-12-applicator.json'],
  ['unevaluated', 'jsonschema-2020-12-unevaluated.json'],
  ['validation', 'jsonschema-2020-12-validation.json'],
  ['format', 'jsonschema-2020-12-format-annotation.json'],
  ['content', 'jsonschema-2020-12-content.json'],
  ['meta-data', 'jsonschema-2020-12-meta-data.json'],
];

/**
 * Supplies a pinned definition by file name. The picture passes the reader that verifies
 * the repository's pinned files.
 */
export type DefinitionReader = (file: string) => Definition;

/**
 * The keywords of the seven JSON Schema 2020-12 vocabularies.
 */
export function schemaKeywords(read: DefinitionReader): readonly KeywordKind[] {
  return VOCABULARIES.flatMap(([vocabulary, file]) => readKeywords(vocabulary, read(file).schema));
}

/**
 * The seven values `type` may take. Each is a construct of its own.
 */
export function schemaTypeValues(read: DefinitionReader): readonly string[] {
  return readTypeValues(read('jsonschema-2020-12-validation.json').schema, '$defs');
}

/**
 * The keywords of JSON Schema Draft-07. Its one meta-schema defines them all; the draft
 * has no vocabularies.
 */
export function draft07Keywords(read: DefinitionReader): readonly KeywordKind[] {
  return readKeywords('draft-07', read('jsonschema-draft-07-schema.json').schema);
}

/**
 * The values `type` may take in JSON Schema Draft-07.
 */
export function draft07TypeValues(read: DefinitionReader): readonly string[] {
  return readTypeValues(read('jsonschema-draft-07-schema.json').schema, 'definitions');
}

/**
 * The objects and fields of an OpenAPI 3.1 document, outside the schema object. Revision
 * 2022-10-07 of this schema spelt the Link Object's `server` field as `body` and was read
 * with a correction; from 2026-11-05 the schema and the specification's text agree.
 */
export function openApi31Objects(read: DefinitionReader): Inventory {
  return readInventory(read('oas-3.1-schema-2026-11-05.json').schema, {
    rootName: 'openapi',
    extensionRef: '#/$defs/specification-extensions',
    corrections: [],
  });
}

/**
 * The objects and fields of an OpenAPI 3.2 document, outside the schema object.
 */
export function openApi32Objects(read: DefinitionReader): Inventory {
  return readInventory(read('oas-3.2-schema-2026-11-12.json').schema, {
    rootName: 'openapi',
    extensionRef: '#/$defs/specification-extensions',
    corrections: [],
  });
}

/**
 * The keywords OpenAPI 3.1 adds to the schema object, with the fields of each.
 */
export function openApi31SchemaVocabulary(read: DefinitionReader): Inventory {
  return readInventory(read('oas-3.1-meta-2024-11-10.json').schema, {
    rootName: 'schema',
    extensionRef: '#/$defs/extensible',
    corrections: [],
  });
}

/**
 * The keywords OpenAPI 3.2 adds to the schema object, with the fields of each.
 */
export function openApi32SchemaVocabulary(read: DefinitionReader): Inventory {
  return readInventory(read('oas-3.2-meta-2026-02-26.json').schema, {
    rootName: 'schema',
    extensionRef: '#/$defs/extensible',
    corrections: [],
  });
}
