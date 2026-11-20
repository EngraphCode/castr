import { OBJECT_PROPOSALS, SCHEMA_VOCABULARY_PROPOSALS } from './object-proposals.js';
import {
  openApi31Objects,
  openApi31SchemaVocabulary,
  openApi32Objects,
  openApi32SchemaVocabulary,
  schemaKeywords,
  schemaTypeValues,
  type DefinitionReader,
} from './published-rows.js';
import {
  FORMAT_ROWS,
  KEYWORD_PROPOSALS,
  OTHER_SCHEMA_ROWS,
  TYPE_VALUE_PROPOSALS,
} from './schema-proposals.js';
import {
  combine,
  keywordRows,
  objectRows,
  textRows,
  typeValueRows,
  type RowsResult,
} from './table.js';

/**
 * Every row of the picture: the construct kinds of an OpenAPI 3.1 or 3.2 document, each
 * with its proposed outcome for the Zod output, the TypeScript output and the endpoint
 * definitions.
 */
export function pictureRows(read: DefinitionReader): RowsResult {
  return combine([
    keywordRows(schemaKeywords(read), KEYWORD_PROPOSALS),
    typeValueRows(schemaTypeValues(read), TYPE_VALUE_PROPOSALS),
    textRows('format value', FORMAT_ROWS),
    textRows('schema construct', OTHER_SCHEMA_ROWS),
    objectRows(
      'schema vocabulary',
      [
        { version: '3.1', inventory: openApi31SchemaVocabulary(read) },
        { version: '3.2', inventory: openApi32SchemaVocabulary(read) },
      ],
      SCHEMA_VOCABULARY_PROPOSALS,
    ),
    objectRows(
      'document',
      [
        { version: '3.1', inventory: openApi31Objects(read) },
        { version: '3.2', inventory: openApi32Objects(read) },
      ],
      OBJECT_PROPOSALS,
    ),
  ]);
}
