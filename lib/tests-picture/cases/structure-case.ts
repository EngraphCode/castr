import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

/**
 * What a case expects one of Castr's outputs to show for its construct.
 *
 * - `value`: a string or number that the construct states, found in the output made from
 *   the document and not in that made from the control.
 * - `difference`: the construct states no value that can be searched for (a boolean, or a
 *   choice between keywords), so the output made from the document need only differ from
 *   that made from the control. This is the weaker proof.
 */
export type Expectation =
  { readonly kind: 'value'; readonly value: string | number } | { readonly kind: 'difference' };

/**
 * One row whose construct decides no value, exercised by two whole documents: one that
 * holds the construct and a control that is the same without it, or with another value.
 */
export interface StructureCase {
  readonly rowId: string;
  readonly document: UnknownRecord;
  readonly control: UnknownRecord;
  readonly expects: Expectation;
  /**
   * Documents that give the construct another of its values. The output made from the
   * document must differ from that made from each, or the value is not told apart:
   * a cookie parameter written as a header parameter is held and is still wrong.
   */
  readonly apartFrom?: readonly UnknownRecord[];
}
