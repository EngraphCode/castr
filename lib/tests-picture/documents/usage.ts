import type { Cell } from '../cases/verdict.js';
import type { Today } from '../rows/render.js';
import type { Row } from '../rows/table.js';

/** What a cell says, or that the row has no cell in that output. */
export type Standing = Cell['verdict'] | 'no cell';

export const STANDINGS: readonly Standing[] = [
  'right',
  'wrong',
  'refused',
  'crashed',
  'missing',
  'not judged',
  'no cell',
];

/** One row a document uses, with what each output's cell says for it today. */
export interface UsedRow {
  readonly row: Row;
  readonly zod: Standing;
  readonly typescript: Standing;
  readonly endpoints: Standing;
}

/**
 * Sets the rows a document uses against what Castr does today for each, in the order of
 * the rows. The cells are those of the cases, each made from a small document written
 * for its row: a construct right there is not thereby right beside the others a real
 * document holds.
 */
export function usageOf(
  used: ReadonlySet<string>,
  rows: readonly Row[],
  today: Today,
): readonly UsedRow[] {
  return rows
    .filter((row) => used.has(row.id))
    .map((row) => ({
      row,
      zod: today.zod.get(row.id)?.verdict ?? 'no cell',
      typescript: today.typescript.get(row.id)?.verdict ?? 'no cell',
      endpoints: today.endpoints.get(row.id)?.verdict ?? 'no cell',
    }));
}

/** How many of the rows a document uses have each standing in one output. */
export function tally(
  usage: readonly UsedRow[],
  output: 'zod' | 'typescript' | 'endpoints',
): ReadonlyMap<Standing, number> {
  return new Map(
    STANDINGS.map((standing) => [
      standing,
      usage.filter((usedRow) => usedRow[output] === standing).length,
    ]),
  );
}

const STOPS: ReadonlySet<Standing> = new Set(['refused', 'crashed']);

/**
 * The rows a document uses that Castr refuses or crashes on in some output: each is
 * enough, alone, to stop the whole document.
 */
export function stops(usage: readonly UsedRow[]): readonly UsedRow[] {
  return usage.filter((usedRow) =>
    [usedRow.zod, usedRow.typescript, usedRow.endpoints].some((standing) => STOPS.has(standing)),
  );
}
