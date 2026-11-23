/**
 * The limits the specification declares for the Zod that Castr writes. A row that rests
 * on one reads right, because its samples hold no value the limit concerns; so the limit
 * is printed with the picture, where a reader of a right cell will meet it, and each is
 * held by a test (`declared-limits.gen.test.ts`).
 */

/** Strings `z.url()` accepts and RFC 3986 refuses. */
export const URI_ACCEPTED_BY_ZOD_ALONE: readonly string[] = [
  'https://example.com/%ZZ',
  'https://example.com/a b',
  'https://example.com/é',
  'https://example.com/a\\b',
  'https://example.com/a[1]',
];

/** Strings RFC 3986 accepts and `z.url()` refuses. */
export const URI_REFUSED_BY_ZOD_ALONE: readonly string[] = ['http://'];

interface DeclaredLimit {
  readonly clause: string;
  readonly rows: string;
  readonly limit: string;
}

export const DECLARED_LIMITS: readonly DeclaredLimit[] = [
  {
    clause: 'SPEC-P-7',
    rows: 'an object that allows unknown keys',
    limit:
      'For a value with an own property named `__proto__`, the Zod validator neither ' +
      'checks nor returns that property: it can accept what the source refuses.',
  },
  {
    clause: 'SPEC-P-8',
    rows: '`format: uri`',
    limit:
      'Written `z.url()`, which follows WHATWG where the source is RFC 3986. It accepts ' +
      `some strings the source refuses (${URI_ACCEPTED_BY_ZOD_ALONE.length} are held), ` +
      'and refuses some the source accepts (`http://`).',
  },
];

/** Writes the declared limits, so that a right cell is never read as free of them. */
export function renderDeclaredLimits(limits: readonly DeclaredLimit[] = DECLARED_LIMITS): string {
  const lines = [
    '## Limits the specification declares',
    '',
    'A row below reads right on the values its case holds, and no case holds a value its',
    'limit concerns. For such a value the Zod validator and the source disagree.',
    '',
    '| Clause | Rows | The limit |',
    '| --- | --- | --- |',
    ...limits.map(({ clause, rows, limit }) => `| ${clause} | ${rows} | ${limit} |`),
  ];
  return [...lines, ''].join('\n');
}
