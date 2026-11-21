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
    return { verdict: 'right', detail: '' };
  }
  return sameProjection(held, control)
    ? SAME
    : {
        verdict: 'wrong',
        detail: `the endpoint definitions change with the construct and do not hold ${shown}`,
      };
}

/**
 * The cell for one structure case, from what Castr made of its document and of its
 * control: whether the endpoint definitions hold what the construct states.
 *
 * A right cell means the value is somewhere in the definitions, or that they differ. It
 * does not say the value is in the right place.
 */
export function judgeStructure(
  expects: Expectation,
  converted: ConvertedEndpoints,
  control: ConvertedEndpoints,
): Cell {
  if (converted.kind !== 'endpoints') {
    return cellWithoutEndpoints(converted);
  }
  if (control.kind !== 'endpoints') {
    const { verdict, detail } = cellWithoutEndpoints(control);
    return { verdict: 'not judged', detail: `the control was ${verdict}: ${detail}` };
  }
  if (expects.kind === 'value') {
    return judgeValue(expects.value, converted.projection, control.projection);
  }
  return sameProjection(converted.projection, control.projection)
    ? SAME
    : { verdict: 'right', detail: '' };
}
