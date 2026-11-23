/**
 * What Castr makes of each whole document today: Oak's, and the examples in the
 * repository.
 *
 * This test runs Castr in this process on files in the repository, writes the modules it
 * generates and loads them, as the generated-code suite does
 * (`tests-generated/*.gen.test.ts`), and takes that suite's name.
 */

import { describe, it, expect } from 'vitest';

import { runSchemaCases, runStructureCases } from '../cases/run-schema-cases.js';
import { SCHEMA_CASES } from '../cases/schema-cases.js';
import { SCHEMA_STRUCTURE_CASES } from '../cases/schema-structure-cases.js';
import { loadDefinition } from '../rows/definitions.js';
import { pictureRows } from '../rows/picture-rows.js';

import { DOCUMENTS } from './documents.js';
import { rowsUsedBy } from './rows-used.js';
import { readDocument, runDocuments, type DocumentLine } from './run-documents.js';
import { stops, usageOf } from './usage.js';

function outcomes(line: DocumentLine): string {
  return [line.zod, line.typescript, line.endpoints].map((found) => found.outcome).join(', ');
}

describe('the whole documents', () => {
  it('are converted in every output that the module holds, and Castr refuses none', async () => {
    const lines = await runDocuments(DOCUMENTS);
    const notConverted = lines.filter(
      (line) => outcomes(line) !== 'converted, converted, converted',
    );

    expect(notConverted.map((line) => [line.name, outcomes(line)])).toEqual([
      // A document of webhooks only: no endpoint definition is made from a webhook.
      ['webhook-example', 'converted, converted, nothing'],
      // Documents with no named schema: every schema is written in place.
      ['non-oauth-scopes', 'nothing, nothing, converted'],
      ['api-with-examples', 'nothing, nothing, converted'],
      ['callback-example', 'nothing, nothing, converted'],
    ]);
    // Oak's document is the corpus the specification names. Converted is not right:
    // the rows it uses that are not right are counted by the test below.
    expect(lines[0]?.name).toBe("Oak's curriculum API, v1 (1.1.1)");
    expect(lines[0] === undefined ? '' : outcomes(lines[0])).toBe(
      'converted, converted, converted',
    );
    expect(lines.map((line) => line.openapi)).not.toContain('not stated');
  }, 120_000);

  it("has, for Oak's document, a refused row for each construct that stops it", async () => {
    const { rows } = pictureRows(loadDefinition);
    const [oak] = DOCUMENTS;
    if (oak === undefined) {
      throw new Error('no document');
    }
    const zod = new Map([
      ...(await runSchemaCases(SCHEMA_CASES)),
      ...(await runStructureCases(SCHEMA_STRUCTURE_CASES, 'Zod validators')),
    ]);
    const { used } = rowsUsedBy(readDocument(oak), new Set(rows.map((row) => row.id)));
    const usage = usageOf(used, rows, { zod, typescript: new Map(), endpoints: new Map() });

    // The document is refused at the first of these. The second would stop it next.
    expect(stops(usage).map((usedRow) => usedRow.row.id)).toEqual([
      'keyword:additionalProperties',
      'keyword:propertyNames',
    ]);
  }, 120_000);
});
