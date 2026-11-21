/**
 * How what Castr made of a whole document becomes a cell.
 */

import { describe, it, expect } from 'vitest';

import { counted, documentCell, statedVersion } from './document-cell.js';

describe('documentCell', () => {
  it('is converted, with what the output holds, where the output can be used', () => {
    expect(documentCell({ kind: 'made', holds: '3 validators' })).toEqual({
      outcome: 'converted',
      detail: '3 validators',
    });
  });

  it('is refused where Castr raised an error of its own, with the error on one line', () => {
    const thrown = new Error('No.\n  This construct is not supported.');

    expect(documentCell({ kind: 'threw', thrown })).toEqual({
      outcome: 'refused',
      detail: 'No. This construct is not supported.',
    });
  });

  it('is crashed where the runtime faulted', () => {
    const thrown = new TypeError('undefined is not a function');

    expect(documentCell({ kind: 'threw', thrown }).outcome).toBe('crashed');
  });

  it('is crashed where the output cannot be used, with the reason', () => {
    expect(documentCell({ kind: 'output unusable', reason: 'does not load: x' })).toEqual({
      outcome: 'crashed',
      detail: "Castr's output does not load: x",
    });
  });
});

describe('statedVersion', () => {
  it('reads the version from a document written as JSON or as YAML', () => {
    expect(statedVersion('{\n  "openapi": "3.1.0",\n  "info": {}\n}')).toBe('3.1.0');
    expect(statedVersion('# a comment\nopenapi: 3.2.0\ninfo: {}\n')).toBe('3.2.0');
    expect(statedVersion("openapi: '3.0.3'\n")).toBe('3.0.3');
    expect(statedVersion('{"openapi":"3.1.0","info":{}}')).toBe('3.1.0');
  });

  it('reads nothing where no version is stated', () => {
    expect(statedVersion('swagger: "2.0"\n')).toBeUndefined();
  });
});

describe('counted', () => {
  it('uses the singular for one and the plural otherwise', () => {
    expect(counted(1, 'type', 'types')).toBe('1 type');
    expect(counted(0, 'type', 'types')).toBe('0 types');
  });
});
