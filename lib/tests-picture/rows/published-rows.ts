import type { Definition } from './definitions.js';
import {
  readInventory,
  readKeywords,
  type Correction,
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
 * Where the published OpenAPI 3.1 document schema differs from the specification's text.
 * The Link Object's field is `server`; revision 2022-10-07 of the schema spells it `body`.
 */
export const OPENAPI_31_CORRECTIONS: readonly Correction[] = [
  { object: 'link', published: 'body', specified: 'server', section: 'OpenAPI 3.1, 4.8.20' },
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
 * The objects and fields of an OpenAPI 3.1 document, outside the schema object.
 */
export function openApi31Objects(read: DefinitionReader): Inventory {
  return readInventory(read('oas-3.1-schema-2022-10-07.json').schema, {
    rootName: 'openapi',
    extensionRef: '#/$defs/specification-extensions',
    corrections: OPENAPI_31_CORRECTIONS,
  });
}

/**
 * The objects and fields of an OpenAPI 3.2 document, outside the schema object.
 */
export function openApi32Objects(read: DefinitionReader): Inventory {
  return readInventory(read('oas-3.2-schema-2025-09-17.json').schema, {
    rootName: 'openapi',
    extensionRef: '#/$defs/specification-extensions',
    corrections: [],
  });
}

/**
 * The keywords OpenAPI 3.1 adds to the schema object, with the fields of each.
 */
export function openApi31SchemaVocabulary(read: DefinitionReader): Inventory {
  return readInventory(read('oas-3.1-meta-base.json').schema, {
    rootName: 'schema',
    extensionRef: '#/$defs/extensible',
    corrections: [],
  });
}

/**
 * The keywords OpenAPI 3.2 adds to the schema object, with the fields of each.
 */
export function openApi32SchemaVocabulary(read: DefinitionReader): Inventory {
  return readInventory(read('oas-3.2-meta-2025-09-17.json').schema, {
    rootName: 'schema',
    extensionRef: '#/$defs/extensible',
    corrections: [],
  });
}
