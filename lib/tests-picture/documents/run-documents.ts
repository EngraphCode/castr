import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { createCastrConvert, type DocumentOutput } from '../cases/castr-convert.js';

import { counted, documentCell, statedVersion, type DocumentCell } from './document-cell.js';
import type { PictureDocument } from './documents.js';

const PACKAGE = fileURLToPath(new URL('../../', import.meta.url));

/**
 * One whole document, with the version it says it is written in and what Castr made of
 * it in each output.
 */
export interface DocumentLine {
  readonly name: string;
  readonly openapi: string;
  readonly zod: DocumentCell;
  readonly typescript: DocumentCell;
  readonly endpoints: DocumentCell;
}

function cellOf<Held>(
  output: DocumentOutput<Held>,
  describe: (held: Held) => string,
): DocumentCell {
  if (output.kind === 'held') {
    return documentCell({ kind: 'made', holds: describe(output.held) });
  }
  if (output.kind === 'nothing emitted') {
    return documentCell({ kind: 'made', holds: 'none' });
  }
  return documentCell(output);
}

/**
 * Runs Castr on every document, from the file a consumer would give it, and says what
 * each output came to. A document Castr converts is not thereby right: the cells of the
 * rows say that, construct by construct.
 */
export async function runDocuments(
  documents: readonly PictureDocument[],
): Promise<readonly DocumentLine[]> {
  const castr = await createCastrConvert();
  const lines: DocumentLine[] = [];
  try {
    for (const document of documents) {
      const file = `${PACKAGE}${document.file}`;
      const made = await castr.convertDocument(file);
      lines.push({
        name: document.name,
        openapi: statedVersion(await readFile(file, 'utf8')) ?? 'not stated',
        zod: cellOf(made.validators, (names) => counted(names.length, 'validator', 'validators')),
        typescript: cellOf(made.types, (names) => counted(names.length, 'type', 'types')),
        endpoints: cellOf(made.endpoints, (count) =>
          counted(count, 'endpoint definition', 'endpoint definitions'),
        ),
      });
    }
  } finally {
    await castr.dispose();
  }
  return lines;
}
