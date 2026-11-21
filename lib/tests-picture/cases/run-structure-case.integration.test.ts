/**
 * How one structure case is run: Castr, replaced by a simple stand-in passed as an
 * argument, is given the document and its control, and what it made of them is judged.
 * No file is read or written.
 */

import { describe, it, expect } from 'vitest';

import { runStructureCase } from './run-structure-case.js';
import type { StructureCase } from './structure-case.js';

const summary: StructureCase = {
  rowId: 'operation.summary',
  document: { paths: { '/things': { get: { summary: 'kestrel' } } } },
  control: { paths: { '/things': { get: {} } } },
  expects: { kind: 'value', value: 'kestrel' },
};

describe('runStructureCase', () => {
  it('gives Castr the document and then its control', async () => {
    const given: unknown[] = [];
    await runStructureCase(summary, (document) => {
      given.push(document);
      return Promise.resolve({ kind: 'nothing emitted' });
    });

    expect(given).toEqual([summary.document, summary.control]);
  });

  it('judges what Castr made of the two', async () => {
    const cell = await runStructureCase(summary, () =>
      Promise.resolve({ kind: 'endpoints', projection: [{ method: 'get' }] }),
    );

    expect(cell).toEqual({
      verdict: 'missing',
      detail: 'the endpoint definitions are the same without it',
    });
  });

  it('rejects, and gives no cell, where the harness itself fails', async () => {
    await expect(
      runStructureCase(summary, () => Promise.reject(new Error('ENOSPC: no space left'))),
    ).rejects.toThrow('ENOSPC');
  });
});
