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
  it('gives Castr the document, its control and each document with another value', async () => {
    const other = { paths: { '/things': { get: { summary: 'osprey' } } } };
    const given: unknown[] = [];
    await runStructureCase(
      { ...summary, apartFrom: [other] },
      (document) => {
        given.push(document);
        return Promise.resolve({ kind: 'nothing emitted' });
      },
      'endpoint definitions',
    );

    expect(given).toEqual([summary.document, summary.control, other]);
  });

  it('judges what Castr made of the two', async () => {
    const cell = await runStructureCase(
      summary,
      () => Promise.resolve({ kind: 'held', projection: [{ method: 'get' }] }),
      'endpoint definitions',
    );

    expect(cell).toEqual({
      verdict: 'missing',
      detail: 'the endpoint definitions are the same without it',
    });
  });

  it('rejects, and gives no cell, where the harness itself fails', async () => {
    await expect(
      runStructureCase(
        summary,
        () => Promise.reject(new Error('ENOSPC: no space left')),
        'endpoint definitions',
      ),
    ).rejects.toThrow('ENOSPC');
  });
});
