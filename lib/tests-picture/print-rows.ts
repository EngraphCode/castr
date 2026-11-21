/**
 * Prints the picture: every construct kind of an OpenAPI 3.1 or 3.2 document with its
 * proposed outcome in each of the three outputs, and, for the rows that have a case, what
 * each of Castr's outputs does for it today; and what Castr makes of each whole document.
 *
 * Run with: `pnpm picture`
 */

import { unexercised } from './cases/coverage.js';
import { runSchemaCases, runStructureCases, runTypeScriptCases } from './cases/run-schema-cases.js';
import { SCHEMA_CASES } from './cases/schema-cases.js';
import { SCHEMA_STRUCTURE_CASES } from './cases/schema-structure-cases.js';
import { ROWS_NO_CASE_ISOLATES, STRUCTURE_CASES } from './cases/structure-cases.js';
import {
  typescriptRowsNoCaseIsolates,
  typescriptStructureCases,
} from './cases/typescript-structure-cases.js';
import { DOCUMENTS } from './documents/documents.js';
import { renderDocuments } from './documents/render-documents.js';
import { renderNotRight, renderUsage } from './documents/render-usage.js';
import { rowsUsedBy } from './documents/rows-used.js';
import { readDocument, runDocuments } from './documents/run-documents.js';
import { usageOf } from './documents/usage.js';
import { loadDefinition } from './rows/definitions.js';
import { pictureRows } from './rows/picture-rows.js';
import { renderRows, renderToday, renderUnexercised } from './rows/render.js';

const { rows, problems } = pictureRows(loadDefinition);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  const decided = await runSchemaCases(SCHEMA_CASES);
  const held = await runStructureCases(SCHEMA_STRUCTURE_CASES, 'Zod validators');
  const typed = await runTypeScriptCases(SCHEMA_CASES, rows);
  const typesHeld = await runStructureCases(
    typescriptStructureCases(rows),
    'TypeScript types',
    typescriptRowsNoCaseIsolates(rows),
  );
  const endpoints = await runStructureCases(
    STRUCTURE_CASES,
    'endpoint definitions',
    ROWS_NO_CASE_ISOLATES,
  );
  // A row has a deciding case or a structure case, never both, so a column is the two
  // sets of cells together.
  const zod = new Map([...decided, ...held]);
  const typescript = new Map([...typed, ...typesHeld]);
  console.log(renderToday(rows, decided, "Castr's Zod output does"));
  console.log(renderToday(rows, held, "Castr's Zod output holds"));
  console.log(renderToday(rows, typed, "Castr's TypeScript output does"));
  console.log(renderToday(rows, typesHeld, "Castr's TypeScript output holds"));
  console.log(renderToday(rows, endpoints, "Castr's endpoint definitions hold"));
  console.log(renderDocuments(await runDocuments(DOCUMENTS)));
  const rowIds = new Set(rows.map((row) => row.id));
  const usages = DOCUMENTS.map((document) => {
    const { used, unrecognised } = rowsUsedBy(readDocument(document), rowIds);
    return {
      name: document.name,
      usage: usageOf(used, rows, { zod, typescript, endpoints }),
      unrecognised,
    };
  });
  console.log(renderUsage(usages));
  // The first document is the corpus the specification names.
  const [corpus] = usages;
  if (corpus !== undefined) {
    console.log(renderNotRight(corpus.name, corpus.usage));
  }
  console.log(
    renderUnexercised([
      ['to Zod', unexercised(rows, 'zod').length],
      ['to TypeScript', unexercised(rows, 'typescript').length],
      ['to the endpoint definitions', unexercised(rows, 'endpoints').length],
    ]),
  );
  console.log(renderRows(rows, { zod, typescript, endpoints }));
}
