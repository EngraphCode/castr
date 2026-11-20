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

function renderRow(row: Row): string {
  const cells = [
    row.label,
    versionsCell(row),
    zodCell(row),
    row.proposal.typescript,
    row.proposal.endpoints,
    row.source,
    row.proposal.note,
  ];
  return `| ${cells.map(cell).join(' | ')} |`;
}

/**
 * Renders the rows as one Markdown table for each part of a document.
 */
export function renderRows(rows: readonly Row[]): string {
  const lines: string[] = [];
  for (const [group, title] of GROUPS) {
    const inGroup = rows.filter((row) => row.group === group);
    if (inGroup.length === 0) {
      continue;
    }
    lines.push(
      `## ${title} (${String(inGroup.length)})`,
      '',
      '| Construct | OpenAPI | To Zod | To TypeScript | To the endpoint definitions | Defined | Note |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...inGroup.map(renderRow),
      '',
    );
  }
  return lines.join('\n');
}
