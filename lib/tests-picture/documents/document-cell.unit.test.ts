/**
 * How what Castr made of a whole document becomes a cell.
 */

import { describe, it, expect } from 'vitest';

import { documentCell, statedVersion } from './document-cell.js';

describe('documentCell', () => {
  it('is converted, with a count of what the output holds, where it holds something', () => {
    const made = { kind: 'made', one: 'validator', many: 'validators' } as const;

    expect(documentCell({ ...made, count: 3 })).toEqual({
      outcome: 'converted',
      detail: '3 validators',
    });
    expect(documentCell({ ...made, count: 1 }).detail).toBe('1 validator');
  });

  it('is nothing where the module holds none of the output, or there is no module', () => {
    expect(documentCell({ kind: 'made', count: 0, one: 'type', many: 'types' })).toEqual({
      outcome: 'nothing',
      detail: 'the module holds no types',
    });
    expect(documentCell({ kind: 'nothing emitted' }).outcome).toBe('nothing');
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
    expect(statedVersion('{"openapi"   :   "3.1.0"}')).toBe('3.1.0');
    expect(statedVersion('openapi:    3.2.0\n')).toBe('3.2.0');
  });

  it('reads nothing where no version is stated', () => {
    expect(statedVersion('swagger: "2.0"\n')).toBeUndefined();
  });
});
