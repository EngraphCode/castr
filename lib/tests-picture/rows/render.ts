import type { Cell } from '../cases/verdict.js';

import type { Row, RowGroup } from './table.js';

const GROUPS: readonly (readonly [RowGroup, string])[] = [
  ['schema keyword', 'Schema keywords'],
  ['type value', 'Values of `type`'],
  ['format value', 'Values of `format`'],
  ['schema construct', 'Other schema constructs'],
  ['schema vocabulary', 'Keywords OpenAPI adds to a schema'],
  ['document', 'Objects and fields of a document'],
];

function cell(text: string): string {
  return text.replaceAll('|', String.raw`\|`);
}

function zodCell(row: Row): string {
  return row.proposal.zodByCastrCheck ? 'carried, by a check Castr writes' : row.proposal.zod;
}

function versionsCell(row: Row): string {
  return row.versions.length === 0 ? 'all' : row.versions.join(', ');
}

/**
 * What one of Castr's outputs does today for each row that has a case, by the row's
 * identity.
 */
export type CellsToday = ReadonlyMap<string, Cell>;

/**
 * What each of Castr's three outputs does today.
 */
export interface Today {
  readonly zod: CellsToday;
  readonly typescript: CellsToday;
  readonly endpoints: CellsToday;
}

const NOTHING_TODAY: Today = { zod: new Map(), typescript: new Map(), endpoints: new Map() };

function renderRow(row: Row, today: Today): string {
  const cells = [
    row.label,
    versionsCell(row),
    today.zod.get(row.id)?.verdict ?? '',
    today.typescript.get(row.id)?.verdict ?? '',
    today.endpoints.get(row.id)?.verdict ?? '',
    zodCell(row),
    row.proposal.typescript,
    row.proposal.endpoints,
    row.source,
    row.proposal.note,
  ];
  return `| ${cells.map(cell).join(' | ')} |`;
}

/**
 * Renders the rows as one Markdown table for each part of a document. A row that has a
 * case shows what Castr's outputs do for it today; a row with no case
 * shows nothing there, which is not a claim that Castr is right.
 */
export function renderRows(rows: readonly Row[], today: Today = NOTHING_TODAY): string {
  const lines: string[] = [];
  for (const [group, title] of GROUPS) {
    const inGroup = rows.filter((row) => row.group === group);
    if (inGroup.length === 0) {
      continue;
    }
    lines.push(
      `## ${title} (${String(inGroup.length)})`,
      '',
      '| Construct | OpenAPI | Castr today, to Zod | Castr today, to TypeScript | Castr today, to the endpoint definitions | Proposed: to Zod | Proposed: to TypeScript | Proposed: to the endpoint definitions | Defined | Note |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...inGroup.map((row) => renderRow(row, today)),
      '',
    );
  }
  return lines.join('\n');
}

const VERDICTS: readonly Cell['verdict'][] = [
  'right',
  'wrong',
  'refused',
  'crashed',
  'missing',
  'not judged',
];

/**
 * Renders what one of Castr's outputs does today: how many cells have each verdict, and
 * the plain words for every cell that is not right.
 */
export function renderToday(rows: readonly Row[], today: CellsToday, output: string): string {
  const cased = rows.filter((row) => today.has(row.id));
  const counts = VERDICTS.map((verdict) => {
    const count = cased.filter((row) => today.get(row.id)?.verdict === verdict).length;
    return `${verdict} ${String(count)}`;
  });
  const lines = [
    `## What ${output} today (${String(cased.length)} cases)`,
    '',
    `${counts.join('; ')}.`,
    '',
    '| Construct | Castr today | What happened |',
    '| --- | --- | --- |',
  ];
  for (const row of cased) {
    const found = today.get(row.id);
    if (found !== undefined && found.verdict !== 'right') {
      lines.push(`| ${cell(row.label)} | ${found.verdict} | ${cell(found.detail)} |`);
    }
  }
  return [...lines, ''].join('\n');
}

/**
 * Writes how many proposed cells of each output nothing exercises yet, so that an empty
 * cell in the tables is read as not built and never as nothing to show.
 */
export function renderUnexercised(counts: readonly (readonly [string, number])[]): string {
  const lines = [
    '## Proposed and not exercised yet',
    '',
    'Rows an output is proposed to carry for which the picture has no kind of case. Their',
    'cell is empty.',
    '',
    ...counts.map(([output, count]) => `- ${output}: ${String(count)} rows`),
  ];
  return [...lines, ''].join('\n');
}
