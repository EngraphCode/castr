import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { normalize } from '@scalar/openapi-parser';

import { createCastrConvert, type DocumentOutput } from '../cases/castr-convert.js';
import { isJsonObject, type JsonObject } from '../rows/json.js';

import { documentCell, statedVersion, type DocumentCell } from './document-cell.js';
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
  count: (held: Held) => number,
  one: string,
  many: string,
): DocumentCell {
  return documentCell(
    output.kind === 'held' ? { kind: 'made', count: count(output.held), one, many } : output,
  );
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
        zod: cellOf(made.validators, (names) => names.length, 'validator', 'validators'),
        typescript: cellOf(made.types, (names) => names.length, 'type', 'types'),
        endpoints: cellOf(
          made.endpoints,
          (count) => count,
          'endpoint definition',
          'endpoint definitions',
        ),
      });
    }
  } finally {
    await castr.dispose();
  }
  return lines;
}

/**
 * A document as plain values, parsed from its file as JSON or as YAML. The parser is the
 * one Castr depends on, used here only to parse: nothing is resolved, upgraded or
 * checked.
 */
export function readDocument(document: PictureDocument): JsonObject {
  const parsed: unknown = normalize(readFileSync(`${PACKAGE}${document.file}`, 'utf8'));
  if (!isJsonObject(parsed)) {
    throw new Error(`${document.file} does not hold an object`);
  }
  return parsed;
}
