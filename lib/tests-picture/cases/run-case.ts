import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import { referenceFor } from './reference.js';
import { documentFor, type SchemaCase } from './schema-case.js';
import { cellForThrown, judge, onOneLine, type Cell, type Decision } from './verdict.js';

/**
 * What Castr made of a case's document: a validator that decides a value; nothing, where
 * Castr ran and emitted no validator for the shape; or output that does not load.
 */
export type Converted =
  | { readonly kind: 'validator'; readonly accepts: (value: unknown) => boolean }
  | { readonly kind: 'no validator' }
  | { readonly kind: 'output does not load'; readonly reason: string };

/**
 * Runs Castr on a document and loads the validator it generated for the case's shape.
 * It rejects with whatever Castr threw while generating.
 */
export type Convert = (document: UnknownRecord) => Promise<Converted>;

/**
 * Runs one case: the reference validator and Castr each read the same document, and the
 * cell says whether Castr decided every sample as the reference did.
 */
export async function runCase(schemaCase: SchemaCase, convert: Convert): Promise<Cell> {
  const document = documentFor(schemaCase);
  const reference = referenceFor(document);
  if (!reference.readable) {
    return { verdict: 'not judged', detail: reference.reason };
  }
  let converted: Converted;
  try {
    converted = await convert(document);
  } catch (error) {
    return cellForThrown(error);
  }
  if (converted.kind === 'no validator') {
    return { verdict: 'missing', detail: 'Castr emitted no validator for the shape' };
  }
  if (converted.kind === 'output does not load') {
    return { verdict: 'crashed', detail: `Castr's output does not load: ${converted.reason}` };
  }
  const { accepts } = converted;
  const decisions: Decision[] = [];
  for (const sample of schemaCase.samples) {
    const expected = reference.accepts(sample);
    try {
      decisions.push({ sample, reference: expected, castr: accepts(sample) });
    } catch (error) {
      const reason = error instanceof Error ? onOneLine(error.message) : String(error);
      return {
        verdict: 'crashed',
        detail: `Castr's validator threw on ${JSON.stringify(sample)}: ${reason}`,
      };
    }
  }
  return judge(decisions);
}
