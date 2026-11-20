import { referenceFor } from './reference.js';
import { documentFor, type SchemaCase } from './schema-case.js';

/**
 * The cases whose samples do not decide their construct: by the reference validator's own
 * decisions, the schema accepts every sample or refuses every sample. A validator that
 * ignored the construct could be right on such a case. A case the reference cannot check
 * is not counted, because it is not judged at all.
 */
export function inertCases(cases: readonly SchemaCase[]): readonly string[] {
  const inert: string[] = [];
  for (const schemaCase of cases) {
    const reference = referenceFor(documentFor(schemaCase));
    if (reference.readable) {
      const decisions = schemaCase.samples.map((sample) => reference.accepts(sample));
      if (!decisions.includes(true) || !decisions.includes(false)) {
        inert.push(schemaCase.rowId);
      }
    }
  }
  return inert;
}
