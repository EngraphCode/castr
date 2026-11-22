/**
 * Runs Castr on each input of the reader's cases, from a file as a consumer would give
 * it, and decides the case for each outside Castr.
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { DocumentCell } from '../documents/document-cell.js';
import { runDocuments, type DocumentLine } from '../documents/run-documents.js';

import { caseThatHolds, type CastrDid, type ReaderCase, type ReaderLine } from './reader-cases.js';

const PACKAGE = fileURLToPath(new URL('../../', import.meta.url));
const TEMP_ROOT = fileURLToPath(new URL('../.tmp/', import.meta.url));

function outcomeOf(cells: readonly DocumentCell[]): CastrDid['outcome'] {
  const stopped = cells.filter((cell) => cell.outcome === 'refused' || cell.outcome === 'crashed');
  if (cells.some((cell) => cell.outcome === 'crashed')) {
    return 'crashed';
  }
  if (stopped.length === cells.length) {
    return 'refused';
  }
  if (stopped.length > 0) {
    return 'mixed';
  }
  return cells.some((cell) => cell.outcome === 'converted') ? 'read' : 'nothing';
}

/**
 * What Castr did with a whole input, from its three outputs. The words are those of
 * every output, or the one thing all three said.
 */
export function castrDid(line: Pick<DocumentLine, 'zod' | 'typescript' | 'endpoints'>): CastrDid {
  const cells: readonly DocumentCell[] = [line.zod, line.typescript, line.endpoints];
  const same = cells.every((cell) => cell.detail === line.zod.detail);
  return {
    outcome: outcomeOf(cells),
    detail: same
      ? line.zod.detail
      : `Zod: ${line.zod.detail}; TypeScript: ${line.typescript.detail}; endpoint definitions: ${line.endpoints.detail}`,
  };
}

/**
 * Writes each input to a file, runs Castr on it and decides its case.
 */
export async function runReaderCases(cases: readonly ReaderCase[]): Promise<readonly ReaderLine[]> {
  await mkdir(TEMP_ROOT, { recursive: true });
  const directory = await mkdtemp(join(TEMP_ROOT, 'reader-'));
  try {
    const names = cases.map(
      (readerCase, index) => `input-${String(index + 1)}.${readerCase.extension}`,
    );
    await Promise.all(
      cases.map(async (readerCase, index) =>
        writeFile(join(directory, names[index] ?? ''), readerCase.text, 'utf8'),
      ),
    );
    const lines = await runDocuments(
      cases.map((readerCase, index) => ({
        name: readerCase.name,
        file: relative(PACKAGE, join(directory, names[index] ?? '')),
      })),
    );
    return await Promise.all(
      cases.map(async (readerCase, index) => {
        const line = lines[index];
        if (line === undefined) {
          throw new Error(`no line for ${readerCase.name}`);
        }
        const did = castrDid(line);
        // The directory and the file's name are this run's and this list's; a cell must
        // hold neither.
        const detail = did.detail
          .replaceAll(directory + sep, '')
          .replaceAll(names[index] ?? '', 'the input');
        return {
          name: readerCase.name,
          holds: await caseThatHolds(readerCase.text),
          did: { ...did, detail },
        };
      }),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
