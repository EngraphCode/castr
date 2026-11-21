/**
 * What Castr makes of each whole document today: Oak's, and the examples in the
 * repository.
 *
 * This test runs Castr in this process on files in the repository, writes the modules it
 * generates and loads them, as the generated-code suite does
 * (`tests-generated/*.gen.test.ts`), and takes that suite's name.
 */

import { describe, it, expect } from 'vitest';

import { DOCUMENTS } from './documents.js';
import { runDocuments, type DocumentLine } from './run-documents.js';

function outcomes(line: DocumentLine): string {
  return [line.zod, line.typescript, line.endpoints].map((found) => found.outcome).join(', ');
}

describe('the whole documents', () => {
  it('are converted in every output, all but the one Castr refuses', async () => {
    const lines = await runDocuments(DOCUMENTS);
    const notConverted = lines.filter(
      (line) => outcomes(line) !== 'converted, converted, converted',
    );

    // Oak's document is the corpus the specification names. Castr refuses it today.
    expect(notConverted.map((line) => [line.name, outcomes(line), line.zod.detail])).toEqual([
      [
        "Oak's curriculum API, v1 (1.1.1)",
        'refused, refused, refused',
        'Non-strict object input "schema-valued additionalProperties" is rejected. Castr requires closed-world object semantics (additionalProperties: false).',
      ],
    ]);
    expect(lines.map((line) => line.openapi)).not.toContain('not stated');
  }, 120_000);
});
