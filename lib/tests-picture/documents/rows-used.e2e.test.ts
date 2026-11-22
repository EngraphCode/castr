/**
 * The walk of a document, held against every document the picture has.
 *
 * This test reads the pinned definitions and the documents in the repository, so it is
 * an end-to-end test. Castr is not run.
 */

import { describe, it, expect } from 'vitest';

import { documentFor } from '../cases/schema-case.js';
import { SCHEMA_CASES } from '../cases/schema-cases.js';
import { SCHEMA_STRUCTURE_CASES } from '../cases/schema-structure-cases.js';
import { NAMED_SCHEMA_CASE, STRUCTURE_CASES } from '../cases/structure-cases.js';
import { loadDefinition } from '../rows/definitions.js';
import { pictureRows } from '../rows/picture-rows.js';

import { DOCUMENTS } from './documents.js';
import { rowsUsedBy } from './rows-used.js';
import { readDocument } from './run-documents.js';

describe('the rows a document uses', () => {
  const rowIds = new Set(pictureRows(loadDefinition).rows.map((row) => row.id));

  it('include, for every case, the row the case was written for', () => {
    const cases = [
      ...[...STRUCTURE_CASES, NAMED_SCHEMA_CASE, ...SCHEMA_STRUCTURE_CASES].map(
        ({ rowId, document }) => ({ rowId, document }),
      ),
      ...SCHEMA_CASES.map((schemaCase) => ({
        rowId: schemaCase.rowId,
        document: documentFor(schemaCase),
      })),
    ];
    const notNamed = cases
      .filter(({ rowId, document }) => !rowsUsedBy(document, rowIds).used.has(rowId))
      .map(({ rowId }) => rowId);

    expect(cases).toHaveLength(208);
    expect(notNamed).toEqual([]);
  });

  it('leave nothing a whole document states without a row', () => {
    const unrecognised = DOCUMENTS.map(
      (document) => rowsUsedBy(readDocument(document), rowIds).unrecognised,
    );

    expect(unrecognised.flat()).toEqual([]);
  });

  it("are 74 for Oak's document", () => {
    const [oak] = DOCUMENTS;
    if (oak === undefined) {
      throw new Error('no document');
    }

    expect(rowsUsedBy(readDocument(oak), rowIds).used.size).toBe(74);
  });
});
