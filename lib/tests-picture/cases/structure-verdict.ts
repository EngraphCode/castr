import { holds, sameProjection, type Projection } from './projection.js';
import type { Expectation } from './structure-case.js';
import { cellForThrown, type Cell } from './verdict.js';

/**
 * What Castr made of a document, as the endpoint definitions it exports: their
 * projection; nothing, where the module exports none; what Castr threw; or output that
 * cannot be used, with the reason in words that follow "Castr's output".
 */
export type ConvertedEndpoints =
  | { readonly kind: 'endpoints'; readonly projection: Projection }
  | { readonly kind: 'threw'; readonly thrown: unknown }
  | { readonly kind: 'nothing emitted' }
  | { readonly kind: 'output unusable'; readonly reason: string };

function cellWithoutEndpoints(converted: Exclude<ConvertedEndpoints, { kind: 'endpoints' }>): Cell {
  if (converted.kind === 'threw') {
    return cellForThrown(converted.thrown);
  }
  if (converted.kind === 'nothing emitted') {
    return { verdict: 'missing', detail: 'Castr emitted no endpoint definitions' };
  }
  return { verdict: 'crashed', detail: `Castr's output ${converted.reason}` };
}

const RIGHT: Cell = { verdict: 'right', detail: '' };

const SAME: Cell = {
  verdict: 'missing',
  detail: 'the endpoint definitions are the same without it',
};

function judgeValue(value: string | number, held: Projection, control: Projection): Cell {
  const shown = JSON.stringify(value);
  if (holds(control, value)) {
    return {
      verdict: 'not judged',
      detail: `the endpoint definitions hold ${shown} without the construct, so the case decides nothing`,
    };
  }
  if (holds(held, value)) {
    return RIGHT;
  }
  return sameProjection(held, control)
    ? SAME
    : {
        verdict: 'wrong',
        detail: `the endpoint definitions change with the construct and do not hold ${shown}`,
      };
}

function judgeAgainstControl(expects: Expectation, held: Projection, control: Projection): Cell {
  if (expects.kind === 'value') {
    return judgeValue(expects.value, held, control);
  }
  return sameProjection(held, control) ? SAME : RIGHT;
}

function judgeApart(held: Projection, other: ConvertedEndpoints): Cell {
  if (other.kind !== 'endpoints') {
    const { verdict, detail } = cellWithoutEndpoints(other);
    return {
      verdict: 'not judged',
      detail: `a document with another value was ${verdict}: ${detail}`,
    };
  }
  return sameProjection(held, other.projection)
    ? {
        verdict: 'wrong',
        detail: 'the endpoint definitions are the same when the construct has another value',
      }
    : RIGHT;
}

/**
 * The cell for one structure case, from what Castr made of its document, of its control
 * and of each document that gives the construct another value: whether the endpoint
 * definitions hold what the construct states, and tell it apart from the other values.
 *
 * A right cell means the value is somewhere in the definitions, or that they differ. It
 * does not say the value is in the right place.
 */
export function judgeStructure(
  expects: Expectation,
  converted: ConvertedEndpoints,
  control: ConvertedEndpoints,
  others: readonly ConvertedEndpoints[] = [],
): Cell {
  if (converted.kind !== 'endpoints') {
    return cellWithoutEndpoints(converted);
  }
  if (control.kind !== 'endpoints') {
    const { verdict, detail } = cellWithoutEndpoints(control);
    return { verdict: 'not judged', detail: `the control was ${verdict}: ${detail}` };
  }
  const againstControl = judgeAgainstControl(expects, converted.projection, control.projection);
  if (againstControl.verdict !== 'right') {
    return againstControl;
  }
  const notApart = others
    .map((other) => judgeApart(converted.projection, other))
    .find((cell) => cell.verdict !== 'right');
  return notApart ?? RIGHT;
}
