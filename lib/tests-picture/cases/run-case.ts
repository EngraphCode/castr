import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import { referenceFor } from './reference.js';
import { documentFor, type SchemaCase } from './schema-case.js';
import { cellForThrown, judge, onOneLine, type Cell, type Decision } from './verdict.js';

/**
 * What Castr made of a case's document: something that decides a value (a validator, or a
 * type the compiler checks a value against); nothing, where Castr ran and emitted none for
 * the shape; what Castr threw while generating; or output that cannot be used, with the
 * reason in words that follow "Castr's output".
 */
export type Converted =
  | {
      readonly kind: 'decides';
      readonly accepts: (value: unknown) => boolean;
      /** For a validator: the value it returns for a value it accepts. */
      readonly returns?: (value: unknown) => unknown;
    }
  | { readonly kind: 'threw'; readonly thrown: unknown }
  | { readonly kind: 'nothing emitted' }
  | { readonly kind: 'output unusable'; readonly reason: string };

/**
 * Runs Castr on a document and takes what it generated for the case's shape. The samples
 * are given too, for a judge that must decide them all at once. It rejects only where the
 * harness itself fails, as where a file cannot be written: that stops the run, and is
 * never a cell.
 */
export type Convert = (document: UnknownRecord, samples: readonly unknown[]) => Promise<Converted>;

/**
 * Which of Castr's outputs a cell is about, and how its decisions are held against the
 * reference's.
 */
export interface Reading {
  /** What Castr emits for a shape in this output: `validator`, or `type`. */
  readonly emits: string;
  readonly judge: (decisions: readonly Decision[]) => Cell;
}

/** Castr's Zod output: its validator decides every sample as the reference does. */
export const ZOD_READING: Reading = { emits: 'validator', judge };

/**
 * Runs one case: the reference validator and Castr each read the same document, and the
 * cell says how Castr's decisions on the samples stand against the reference's.
 */
export async function runCase(
  schemaCase: SchemaCase,
  convert: Convert,
  reading: Reading = ZOD_READING,
): Promise<Cell> {
  const document = documentFor(schemaCase);
  const reference = referenceFor(document);
  if (!reference.readable) {
    return { verdict: 'not judged', detail: reference.reason };
  }
  const converted = await convert(document, schemaCase.samples);
  if (converted.kind === 'threw') {
    return cellForThrown(converted.thrown);
  }
  if (converted.kind === 'nothing emitted') {
    return { verdict: 'missing', detail: `Castr emitted no ${reading.emits} for the shape` };
  }
  if (converted.kind === 'output unusable') {
    return { verdict: 'crashed', detail: `Castr's output ${converted.reason}` };
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
        detail: `Castr's ${reading.emits} threw on ${JSON.stringify(sample)}: ${reason}`,
      };
    }
  }
  return reading.judge(decisions);
}
