/**
 * The Zod documents of the cases, run as they stand.
 *
 * A Zod document of the cases note is a few statements that build schemas and state what
 * they do, each statement of fact a call `check(actual, expected)`. This module runs a
 * document, as a module of its own, with `z` and `check` given to it, and reports every
 * check that does not hold. So
 * what the note says a Zod schema does is proved on the note's own text, and a change to
 * that text is a change to what is run.
 *
 * The text run is the repository's own, read from a tracked file. Nothing here runs text
 * from anywhere else.
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import * as z from 'zod';

import type { CaseDocuments } from './case-documents.js';

/** What running one document found. */
export interface ZodRun {
  /** How many checks the document made. */
  readonly checks: number;
  /** Each check that did not hold, and an error if the document threw. */
  readonly failures: readonly string[];
}

type Check = (actual: unknown, expected: unknown) => void;
type Document = (zod: typeof z, check: Check) => void;

function isDocument(value: unknown): value is Document {
  return typeof value === 'function';
}

/** Writes a document as a module of its own and loads it. */
async function load(source: string, directory: string): Promise<Document> {
  const file = join(directory, 'document.mjs');
  writeFileSync(file, `export default function (z, check) {\n${source}\n}\n`);
  const loaded: { readonly default?: unknown } = await import(pathToFileURL(file).href);
  if (!isDocument(loaded.default)) {
    throw new TypeError('the document is not statements');
  }
  return loaded.default;
}

/**
 * Runs one Zod document.
 */
export async function runZodDocument(source: string): Promise<ZodRun> {
  let checks = 0;
  const failures: string[] = [];
  const check: Check = (actual, expected) => {
    checks += 1;
    if (!isDeepStrictEqual(actual, expected)) {
      failures.push(`check ${String(checks)}: got ${JSON.stringify(actual)}`);
    }
  };
  const directory = mkdtempSync(join(tmpdir(), 'castr-case-'));
  try {
    const document = await load(source, directory);
    document(z, check);
  } catch (error) {
    failures.push(`threw: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  return { checks, failures };
}

/**
 * Runs every Zod document of the cases, and names each that fails a check, throws, or
 * makes no check at all.
 */
export async function zodDocumentsThatFail(
  cases: readonly CaseDocuments[],
): Promise<readonly string[]> {
  const found: string[] = [];
  for (const entry of cases) {
    for (const [index, source] of entry.zod.entries()) {
      const { checks, failures } = await runZodDocument(source);
      const all = checks === 0 ? ['makes no check', ...failures] : failures;
      found.push(...all.map((failure) => `${entry.id} document ${String(index)}: ${failure}`));
    }
  }
  return found;
}
