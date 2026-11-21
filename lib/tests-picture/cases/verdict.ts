/**
 * What one cell of the picture says about Castr today.
 *
 * - `right`: Castr's validator decides every sample as the reference validator does.
 * - `wrong`: it decides at least one sample differently.
 * - `refused`: Castr gave an error where a valid document should have been converted.
 * - `crashed`: Castr failed with a fault of the runtime, not an error of its own, or
 *   emitted output that does not load.
 * - `missing`: Castr ran and emitted no validator for the shape.
 * - `not judged`: the reference validator cannot read the case, so nothing is claimed.
 */
export type Verdict = 'right' | 'wrong' | 'refused' | 'crashed' | 'missing' | 'not judged';

/**
 * A verdict with the plain words that explain it.
 */
export interface Cell {
  readonly verdict: Verdict;
  readonly detail: string;
}

/**
 * One sample value and how each validator decided it.
 */
export interface Decision {
  readonly sample: unknown;
  readonly reference: boolean;
  readonly castr: boolean;
}

function describeDisagreement({ sample, reference, castr }: Decision): string {
  const said = (accepted: boolean): string => (accepted ? 'valid' : 'invalid');
  return `${JSON.stringify(sample)}: the source says ${said(reference)}, Castr says ${said(castr)}`;
}

/**
 * Compares the two validators' decisions. One disagreement makes the cell wrong, and the
 * detail names every sample they disagree on.
 */
export function judge(decisions: readonly Decision[]): Cell {
  const disagreements = decisions.filter((decision) => decision.reference !== decision.castr);
  if (disagreements.length === 0) {
    return { verdict: 'right', detail: '' };
  }
  return { verdict: 'wrong', detail: disagreements.map(describeDisagreement).join('; ') };
}

const RUNTIME_FAULTS: readonly ErrorConstructor[] = [TypeError, RangeError, ReferenceError];

/**
 * Tells an error Castr raised of its own from a fault of the runtime. A valid document
 * should meet neither; the picture keeps them apart because they are different defects.
 */
export function cellForThrown(thrown: unknown): Cell {
  if (!(thrown instanceof Error)) {
    return { verdict: 'crashed', detail: `threw a value that is not an error: ${String(thrown)}` };
  }
  const isFault = RUNTIME_FAULTS.some((fault) => thrown instanceof fault);
  return { verdict: isFault ? 'crashed' : 'refused', detail: onOneLine(thrown.message) };
}

/** A message on one line, so that it fits a cell. A reason is often not on the first. */
export function onOneLine(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join(' ');
}
