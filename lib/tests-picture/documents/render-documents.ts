import type { DocumentCell } from './document-cell.js';
import type { DocumentLine } from './run-documents.js';

function cell(text: string): string {
  return text.replaceAll('|', String.raw`\|`);
}

function shown(found: DocumentCell): string {
  return found.outcome === 'converted' ? `converted: ${found.detail}` : found.outcome;
}

/** The reasons a document's outputs were not converted, each given once. */
function reasons(line: DocumentLine): string {
  const given = [line.zod, line.typescript, line.endpoints]
    .filter((found) => found.outcome !== 'converted')
    .map((found) => found.detail);
  return [...new Set(given)].join('; ');
}

/**
 * Writes what Castr makes of each whole document as one table. Converted says a module
 * was generated and the output in it can be used; it does not say the output is right.
 */
export function renderDocuments(lines: readonly DocumentLine[]): string {
  const rows = lines.map((line) => {
    const cells = [
      line.name,
      line.openapi,
      shown(line.zod),
      shown(line.typescript),
      shown(line.endpoints),
      reasons(line),
    ];
    return `| ${cells.map(cell).join(' | ')} |`;
  });
  return [
    `## Whole documents (${String(lines.length)})`,
    '',
    'Converted says Castr generated a module and the output in it can be used. It does not',
    'say the output is right.',
    '',
    '| Document | OpenAPI | To Zod | To TypeScript | To the endpoint definitions | Why not |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}
