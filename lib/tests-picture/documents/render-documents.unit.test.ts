/**
 * How the whole documents are written out as a table.
 */

import { describe, it, expect } from 'vitest';

import { renderDocuments } from './render-documents.js';
import type { DocumentLine } from './run-documents.js';

const refused = { outcome: 'refused', detail: 'a|b is not supported' } as const;

const lines: readonly DocumentLine[] = [
  {
    name: 'kestrels',
    openapi: '3.1.0',
    zod: { outcome: 'converted', detail: '2 validators' },
    typescript: { outcome: 'crashed', detail: "Castr's output does not compile: x" },
    endpoints: { outcome: 'nothing', detail: 'the module holds no endpoint definitions' },
  },
  { name: 'ospreys', openapi: '3.2.0', zod: refused, typescript: refused, endpoints: refused },
];

describe('renderDocuments', () => {
  it('writes a line for each document, with what each output came to', () => {
    const written = renderDocuments(lines);

    expect(written).toContain('## Whole documents (2)');
    expect(written).toContain(
      "| kestrels | 3.1.0 | converted: 2 validators | crashed | nothing | Castr's output does not compile: x |",
    );
  });

  it('gives a reason once where every output has the same one', () => {
    expect(renderDocuments(lines)).toContain(
      String.raw`| ospreys | 3.2.0 | refused | refused | refused | a\|b is not supported |`,
    );
  });

  it('says that converted is not right', () => {
    expect(renderDocuments(lines)).toContain('It does not\nsay the output is right.');
    expect(renderDocuments(lines)).toContain('it does\nnot say whether the document asks for any.');
  });
});
