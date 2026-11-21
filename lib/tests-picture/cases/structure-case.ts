import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

/**
 * What a case expects the endpoint definitions to show for its construct.
 *
 * - `value`: a string or number that the construct states, found in the definitions made
 *   from the document and not in those made from the control.
 * - `difference`: the construct states no value that can be searched for (a boolean, or a
 *   choice between keywords), so the definitions made from the document need only differ
 *   from those made from the control. This is the weaker proof.
 */
export type Expectation =
  { readonly kind: 'value'; readonly value: string | number } | { readonly kind: 'difference' };

/**
 * One row of a document outside a schema, exercised by two whole documents: one that
 * holds the construct and a control that is the same without it, or with another value.
 */
export interface StructureCase {
  readonly rowId: string;
  readonly document: UnknownRecord;
  readonly control: UnknownRecord;
  readonly expects: Expectation;
}
