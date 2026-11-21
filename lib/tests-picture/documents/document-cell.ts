import { cellForThrown } from '../cases/verdict.js';

/**
 * What Castr made of one whole document in one of its outputs.
 *
 * - `converted`: Castr generated a module, and the output in it can be used. Nothing
 *   here says the output is right.
 * - `nothing`: Castr generated a module, and there is none of this output in it. Nothing
 *   here says whether the document asks for any.
 * - `refused`: Castr raised an error of its own and generated nothing.
 * - `crashed`: Castr failed with a fault of the runtime, or its output cannot be used.
 */
export interface DocumentCell {
  readonly outcome: 'converted' | 'nothing' | 'refused' | 'crashed';
  readonly detail: string;
}

/**
 * What was found when one output was looked for in what Castr generated: how many of its
 * things the module holds, with the noun for one and for many; that Castr gave no module;
 * what Castr threw; or why the output cannot be used, in words that follow "Castr's
 * output".
 */
export type Found =
  | { readonly kind: 'made'; readonly count: number; readonly one: string; readonly many: string }
  | { readonly kind: 'nothing emitted' }
  | { readonly kind: 'threw'; readonly thrown: unknown }
  | { readonly kind: 'output unusable'; readonly reason: string };

/**
 * The cell for one output of one document.
 */
export function documentCell(found: Found): DocumentCell {
  if (found.kind === 'nothing emitted') {
    return { outcome: 'nothing', detail: 'Castr generated no module' };
  }
  if (found.kind === 'made') {
    return found.count === 0
      ? { outcome: 'nothing', detail: `the module holds no ${found.many}` }
      : { outcome: 'converted', detail: counted(found.count, found.one, found.many) };
  }
  if (found.kind === 'output unusable') {
    return { outcome: 'crashed', detail: `Castr's output ${found.reason}` };
  }
  const { verdict, detail } = cellForThrown(found.thrown);
  return { outcome: verdict === 'refused' ? 'refused' : 'crashed', detail };
}

/**
 * The version of OpenAPI a document says it is written in, read from its text as JSON or
 * as YAML writes it. Nothing is parsed: it is the first mention of the field, which is at
 * the top of every document here.
 */
export function statedVersion(text: string): string | undefined {
  return /\bopenapi["']?\s*:\s*["']?(\d+\.\d+\.\d+)/.exec(text)?.[1];
}

/** A count with its noun, in the singular for one. */
function counted(count: number, one: string, many: string): string {
  return `${String(count)} ${count === 1 ? one : many}`;
}
