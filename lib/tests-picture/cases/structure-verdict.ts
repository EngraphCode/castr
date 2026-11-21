import { holds, sameProjection, type Projection } from './projection.js';
import type { Expectation } from './structure-case.js';
import { cellForThrown, type Cell } from './verdict.js';

/**
 * Which of Castr's outputs a structure case is read from, named in the plural as a cell
 * writes it.
 */
export type StructureOutput = 'endpoint definitions' | 'Zod validators';

/**
 * What Castr made of a document, as one of its outputs holds it: the output's
 * projection; nothing, where the module exports none; what Castr threw; or output that
 * cannot be used, with the reason in words that follow "Castr's output".
 */
export type ConvertedStructure =
  | { readonly kind: 'held'; readonly projection: Projection }
  | { readonly kind: 'threw'; readonly thrown: unknown }
  | { readonly kind: 'nothing emitted' }
  | { readonly kind: 'output unusable'; readonly reason: string };

function cellWithoutOutput(
  output: StructureOutput,
  converted: Exclude<ConvertedStructure, { kind: 'held' }>,
): Cell {
  if (converted.kind === 'threw') {
    return cellForThrown(converted.thrown);
  }
  if (converted.kind === 'nothing emitted') {
    return { verdict: 'missing', detail: `Castr emitted no ${output}` };
  }
  return { verdict: 'crashed', detail: `Castr's output ${converted.reason}` };
}

const RIGHT: Cell = { verdict: 'right', detail: '' };

function same(output: StructureOutput): Cell {
  return { verdict: 'missing', detail: `the ${output} are the same without it` };
}

function judgeValue(
  output: StructureOutput,
  value: string | number,
  held: Projection,
  control: Projection,
): Cell {
  const shown = JSON.stringify(value);
  if (holds(control, value)) {
    return {
      verdict: 'not judged',
      detail: `the ${output} hold ${shown} without the construct, so the case decides nothing`,
    };
  }
  if (holds(held, value)) {
    return RIGHT;
  }
  return sameProjection(held, control)
    ? same(output)
    : {
        verdict: 'wrong',
        detail: `the ${output} change with the construct and do not hold ${shown}`,
      };
}

function judgeAgainstControl(
  output: StructureOutput,
  expects: Expectation,
  held: Projection,
  control: Projection,
): Cell {
  if (expects.kind === 'value') {
    return judgeValue(output, expects.value, held, control);
  }
  return sameProjection(held, control) ? same(output) : RIGHT;
}

function judgeApart(output: StructureOutput, held: Projection, other: ConvertedStructure): Cell {
  if (other.kind !== 'held') {
    const { verdict, detail } = cellWithoutOutput(output, other);
    return {
      verdict: 'not judged',
      detail: `a document with another value was ${verdict}: ${detail}`,
    };
  }
  return sameProjection(held, other.projection)
    ? {
        verdict: 'wrong',
        detail: `the ${output} are the same when the construct has another value`,
      }
    : RIGHT;
}

/**
 * The cell for one structure case, from what Castr made of its document, of its control
 * and of each document that gives the construct another value: whether the output holds
 * what the construct states, and tells it apart from the other values. `output` names
 * what was read.
 *
 * A right cell means the value is somewhere in the output, or that the output differs.
 * It does not say the value is in the right place.
 */
export function judgeStructure(
  output: StructureOutput,
  expects: Expectation,
  converted: ConvertedStructure,
  control: ConvertedStructure,
  others: readonly ConvertedStructure[] = [],
): Cell {
  if (converted.kind !== 'held') {
    return cellWithoutOutput(output, converted);
  }
  if (control.kind !== 'held') {
    const { verdict, detail } = cellWithoutOutput(output, control);
    return { verdict: 'not judged', detail: `the control was ${verdict}: ${detail}` };
  }
  const againstControl = judgeAgainstControl(
    output,
    expects,
    converted.projection,
    control.projection,
  );
  if (againstControl.verdict !== 'right') {
    return againstControl;
  }
  // The same definitions for another value is a fact whatever else was refused, so it
  // is reported before a document that could not be converted, in whatever order.
  const apart = others.map((other) => judgeApart(output, converted.projection, other));
  return (
    apart.find((cell) => cell.verdict === 'wrong') ??
    apart.find((cell) => cell.verdict !== 'right') ??
    RIGHT
  );
}
