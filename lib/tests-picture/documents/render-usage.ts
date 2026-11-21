import { STANDINGS, tally, type Standing, type UsedRow } from './usage.js';

function cell(text: string): string {
  return text.replaceAll('|', String.raw`\|`);
}

function summary(usage: readonly UsedRow[], output: 'zod' | 'typescript' | 'endpoints'): string {
  const counts = tally(usage, output);
  return STANDINGS.map((standing) => [standing, counts.get(standing) ?? 0] as const)
    .filter(([, count]) => count > 0)
    .map(([standing, count]) => `${standing} ${String(count)}`)
    .join(', ');
}

/** One document with the rows it uses and what it states that is no row. */
export interface DocumentUsage {
  readonly name: string;
  readonly usage: readonly UsedRow[];
  readonly unrecognised: readonly string[];
}

/**
 * Writes, for each document, how many rows it uses and what today's cells say for them
 * in each output.
 */
export function renderUsage(documents: readonly DocumentUsage[]): string {
  const lines = documents.map(({ name, usage, unrecognised }) => {
    const cells = [
      name,
      String(usage.length),
      summary(usage, 'zod'),
      summary(usage, 'typescript'),
      summary(usage, 'endpoints'),
      unrecognised.join(', '),
    ];
    return `| ${cells.map(cell).join(' | ')} |`;
  });
  return [
    '## The rows each document uses',
    '',
    'A row is used where the document states its construct. The counts are of the cells of',
    'the cases, each made from a small document written for its row: a construct right',
    'there is not thereby right beside the others a real document holds. No cell means',
    'the row has no case in that output, or nothing is proposed for it there.',
    '',
    '| Document | Rows used | To Zod | To TypeScript | To the endpoint definitions | Stated and no row |',
    '| --- | --- | --- | --- | --- | --- |',
    ...lines,
    '',
  ].join('\n');
}

function shown(standing: Standing): string {
  return standing === 'no cell' ? '' : standing;
}

/**
 * Writes the rows one document uses for which some output's cell is neither right nor
 * empty: what stands between that document and a right conversion, as far as the cases
 * can say.
 */
export function renderNotRight(name: string, usage: readonly UsedRow[]): string {
  const notRight = usage.filter((usedRow) =>
    [usedRow.zod, usedRow.typescript, usedRow.endpoints].some(
      (standing) => standing !== 'right' && standing !== 'no cell',
    ),
  );
  return [
    `## ${name}: the rows it uses that are not right (${String(notRight.length)} of ${String(usage.length)})`,
    '',
    '| Construct | To Zod | To TypeScript | To the endpoint definitions |',
    '| --- | --- | --- | --- |',
    ...notRight.map(
      (usedRow) =>
        `| ${cell(usedRow.row.label)} | ${shown(usedRow.zod)} | ${shown(usedRow.typescript)} | ${shown(usedRow.endpoints)} |`,
    ),
    '',
  ].join('\n');
}
