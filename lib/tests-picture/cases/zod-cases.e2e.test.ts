/**
 * The Zod documents of the cases, run against the installed Zod.
 *
 * The last tests read the cases note from the repository and run its Zod documents as
 * they stand, so this is an end-to-end test.
 */

import { describe, it, expect } from 'vitest';

import { readCaseDocuments, readCasesNote } from './case-documents.js';
import { runZodDocument, zodDocumentsThatFail } from './zod-cases.js';

describe('running one Zod document', () => {
  it('counts the checks of a document whose checks all hold', async () => {
    const run = await runZodDocument(
      ["check(z.string().safeParse('a').success, true);", 'check(1 + 1, 2);'].join('\n'),
    );

    expect(run).toEqual({ checks: 2, failures: [] });
  });

  it('reports a check that does not hold, with what was got', async () => {
    const run = await runZodDocument(
      "check(z.object({ a: z.string() }).parse({ a: 'x', b: 1 }), {});",
    );

    expect(run).toEqual({ checks: 1, failures: ['check 1: got {"a":"x"}'] });
  });

  it('reports a document that throws', async () => {
    const run = await runZodDocument('z.string().parse(5);\ncheck(1, 1);');

    expect(run.checks).toBe(0);
    expect(run.failures).toHaveLength(1);
  });

  it('reports a document that is not statements', async () => {
    const run = await runZodDocument('})(');

    expect(run.failures).toHaveLength(1);
  });
});

describe('running the Zod documents of a note', () => {
  const cases = readCaseDocuments(
    [
      '### A1. A document that holds',
      '```ts',
      "check(z.literal('a').safeParse('a').success, true);",
      '```',
      '### A2. A document that makes no check',
      '```ts',
      'z.string();',
      '```',
      '### A3. A document with a check that fails',
      '```ts',
      'check(z.string().safeParse(1).success, true);',
      '```',
    ].join('\n'),
  );

  it('names a document that makes no check and one whose check fails, and no other', async () => {
    expect(await zodDocumentsThatFail(cases)).toEqual([
      'A2 document 0: makes no check',
      'A3 document 0: check 1: got false',
    ]);
  });
});

describe('the Zod documents of the cases note', () => {
  const cases = readCasesNote();

  it('each make a check, and every check holds', async () => {
    expect(await zodDocumentsThatFail(cases)).toEqual([]);
  });

  it('are in fifteen cases', () => {
    expect(cases.filter((entry) => entry.zod.length > 0)).toHaveLength(15);
  });
});
