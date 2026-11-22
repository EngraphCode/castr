/**
 * One small input for each of the first three cases of SPEC-FV-1, and for a document no
 * case describes, with the case decided here and not by Castr's reader.
 *
 * What is decided here, and what is not yet:
 *
 * - Case 1: the text parses as neither JSON nor YAML 1.2.
 * - Case 2: a `swagger` field, or an `openapi` field that is absent or does not match the
 *   pattern either pinned schema gives for its version line.
 * - Case 3: a `jsonSchemaDialect`, or the `$schema` of a schema directly under
 *   `components.schemas`, that is a string and is neither the line's OpenAPI dialect nor
 *   JSON Schema Draft 2020-12. The line's dialect is the address the publisher gives it:
 *   for 3.1, `.../oas/3.1/dialect/base` or the same with a date in place of `base`; for
 *   3.2, the address with a date. An address is compared as written: no fragment, case
 *   or other equivalence of URIs is applied. A dialect that is not a string names none,
 *   and is left to case 4. A `$schema` deeper in the document is not looked for yet.
 * - Case 4: the document fails the publisher's schema at the revision 0.8.0 names. Whether
 *   each Schema Object passes its dialect's meta-schema is not decided yet.
 * - Case 5 and the rules of SPEC-FV-2 are not decided yet.
 * - Not decided: a text that is well formed and holds a value JSON cannot state, such as
 *   a number beyond the largest a JavaScript number holds, a YAML `.inf`, or a YAML alias
 *   to its own ancestor. JSON with a key twice is read as its parser reads it, last wins.
 */

import { parseDocument } from 'yaml';

import { loadDefinition } from '../rows/definitions.js';
import { isJsonObject, type JsonObject } from '../rows/json.js';

import { isJsonValue, judgeDocument } from './judge.js';
import { REVISIONS, type Line } from './revision-cases.js';

/** The case of SPEC-FV-1 that holds for an input, or none. */
export type CaseThatHolds = 1 | 2 | 3 | 4 | 'none' | 'not decided';

/** One input, as the text a consumer would give Castr in a file. */
export interface ReaderCase {
  readonly name: string;
  readonly extension: 'json' | 'yaml';
  readonly text: string;
}

const DRAFT_2020_12 = 'https://json-schema.org/draft/2020-12/schema';
const DRAFT_07 = 'http://json-schema.org/draft-07/schema#';

const PINNED: Readonly<Record<Line, string>> = {
  '3.1': 'oas-3.1-schema-2022-10-07.json',
  '3.2': 'oas-3.2-schema-2025-09-17.json',
};

function json(value: unknown): string {
  return JSON.stringify(value);
}

const SCHEMAS = { A: { type: 'string' } };
const YAML_REST =
  'info:\n  title: t\n  version: "1"\npaths: {}\ncomponents:\n  schemas:\n    A:\n      type: string\n';

// Every document that can be read holds one schema, so that reading it shows.
function documentWith(openapi: string, members: JsonObject = {}): JsonObject {
  return {
    openapi,
    info: { title: 't', version: '1' },
    paths: {},
    components: { schemas: SCHEMAS },
    ...members,
  };
}

export const READER_CASES: readonly ReaderCase[] = [
  {
    name: 'a 3.1 document with the required fields',
    extension: 'json',
    text: json(documentWith('3.1.0')),
  },
  {
    name: 'a 3.2 document with the required fields',
    extension: 'json',
    text: json(documentWith('3.2.0')),
  },
  {
    name: 'the same 3.1 document written as YAML',
    extension: 'yaml',
    text: `openapi: 3.1.0\n${YAML_REST}`,
  },
  {
    name: 'JSON that stops before it closes',
    extension: 'json',
    text: '{"openapi": "3.1.0", "info": ',
  },
  {
    name: 'YAML with a mapping that does not close',
    extension: 'yaml',
    text: 'openapi: 3.1.0\ninfo: {title: t\npaths: {}\n',
  },
  {
    name: 'an OpenAPI 2.0 document',
    extension: 'json',
    text: json({
      swagger: '2.0',
      info: { title: 't', version: '1' },
      paths: {},
      definitions: SCHEMAS,
    }),
  },
  {
    name: 'a `swagger` field beside `openapi: 3.1.0`',
    extension: 'json',
    text: json(documentWith('3.1.0', { swagger: '2.0' })),
  },
  {
    name: 'no `openapi` field',
    extension: 'json',
    text: json({ info: { title: 't', version: '1' }, paths: {}, components: { schemas: SCHEMAS } }),
  },
  { name: 'an OpenAPI 3.0.3 document', extension: 'json', text: json(documentWith('3.0.3')) },
  { name: '`openapi: 4.0.0`', extension: 'json', text: json(documentWith('4.0.0')) },
  {
    name: '`openapi: 3.1` written as a YAML number',
    extension: 'yaml',
    text: `openapi: 3.1\n${YAML_REST}`,
  },
  {
    name: '`jsonSchemaDialect` naming Draft-07',
    extension: 'json',
    text: json(documentWith('3.1.0', { jsonSchemaDialect: DRAFT_07 })),
  },
  {
    name: '`jsonSchemaDialect` naming Draft 2020-12',
    extension: 'json',
    text: json(documentWith('3.1.0', { jsonSchemaDialect: DRAFT_2020_12 })),
  },
  {
    name: 'a component schema whose `$schema` names Draft-07',
    extension: 'json',
    text: json(documentWith('3.1.0', { components: { schemas: { A: { $schema: DRAFT_07 } } } })),
  },
  {
    name: 'a 3.2 document whose `jsonSchemaDialect` names the 3.1 dialect',
    extension: 'json',
    text: json(
      documentWith('3.2.0', {
        jsonSchemaDialect: 'https://spec.openapis.org/oas/3.1/dialect/2024-11-10',
      }),
    ),
  },
  {
    name: 'a 3.1 document whose `jsonSchemaDialect` names the 3.1 dialect at a revision',
    extension: 'json',
    text: json(
      documentWith('3.1.0', {
        jsonSchemaDialect: 'https://spec.openapis.org/oas/3.1/dialect/2024-11-10',
      }),
    ),
  },
  {
    name: 'a 3.1 document whose `jsonSchemaDialect` names the 3.1 dialect as `base`',
    extension: 'json',
    text: json(
      documentWith('3.1.0', {
        jsonSchemaDialect: 'https://spec.openapis.org/oas/3.1/dialect/base',
      }),
    ),
  },
  {
    name: 'a `jsonSchemaDialect` with a path below the 3.1 dialect',
    extension: 'json',
    text: json(
      documentWith('3.1.0', {
        jsonSchemaDialect: 'https://spec.openapis.org/oas/3.1/dialect/base/x',
      }),
    ),
  },
  {
    name: 'a `jsonSchemaDialect` that is a number',
    extension: 'json',
    text: json(documentWith('3.1.0', { jsonSchemaDialect: 5 })),
  },
  {
    name: '`swagger: null` beside `openapi: 3.1.0`',
    extension: 'json',
    text: json(documentWith('3.1.0', { swagger: null })),
  },
  { name: 'a list where the document stands', extension: 'json', text: '[]' },
  {
    name: 'a 3.1 document that passes the revision 0.8.0 names and fails the latest',
    extension: 'json',
    text: json(documentWith('3.1.0', { paths: { '/a': { get: { responses: { 'x-a': 1 } } } } })),
  },
  {
    name: 'a number larger than a JavaScript number holds',
    extension: 'json',
    text: '{"openapi":"3.1.0","info":{"title":"t","version":"1"},"paths":{},"components":{"schemas":{"A":{"type":"string"}}},"x-n":1e999}',
  },
  {
    name: 'a document with no `info`',
    extension: 'json',
    text: json({ openapi: '3.1.0', paths: {}, components: { schemas: SCHEMAS } }),
  },
  {
    name: 'a field the root does not have',
    extension: 'json',
    text: json(documentWith('3.2.0', { bogus: 1 })),
  },
];

type Parsed =
  { readonly wellFormed: false } | { readonly wellFormed: true; readonly value: unknown };

function parse(text: string): Parsed {
  try {
    const value: unknown = JSON.parse(text);
    return { wellFormed: true, value };
  } catch {
    const document = parseDocument(text, { version: '1.2' });
    if (document.errors.length > 0) {
      return { wellFormed: false };
    }
    const value: unknown = document.toJS();
    return { wellFormed: true, value };
  }
}

function versionPattern(line: Line): RegExp {
  const { properties } = loadDefinition(PINNED[line]).schema;
  const openapi = isJsonObject(properties) ? properties['openapi'] : undefined;
  const pattern = isJsonObject(openapi) ? openapi['pattern'] : undefined;
  if (typeof pattern !== 'string') {
    throw new TypeError(`${PINNED[line]} gives no pattern for \`openapi\``);
  }
  return new RegExp(pattern, 'u');
}

function lineOf(document: JsonObject): Line | undefined {
  const { openapi } = document;
  if (typeof openapi !== 'string') {
    return undefined;
  }
  const lines: readonly Line[] = ['3.1', '3.2'];
  return lines.find((line) => versionPattern(line).test(openapi));
}

const LINE_DIALECT: Readonly<Record<Line, RegExp>> = {
  '3.1': /^https:\/\/spec\.openapis\.org\/oas\/3\.1\/dialect\/(?:base|\d{4}-\d{2}-\d{2})$/u,
  '3.2': /^https:\/\/spec\.openapis\.org\/oas\/3\.2\/dialect\/\d{4}-\d{2}-\d{2}$/u,
};

function isDialectRead(dialect: string, line: Line): boolean {
  return dialect === DRAFT_2020_12 || LINE_DIALECT[line].test(dialect);
}

function statedDialects(document: JsonObject): readonly string[] {
  const { jsonSchemaDialect, components } = document;
  const schemas = isJsonObject(components) ? components['schemas'] : undefined;
  const ofSchemas = isJsonObject(schemas)
    ? Object.values(schemas)
        .filter(isJsonObject)
        .map((schema) => schema['$schema'])
    : [];
  // A dialect that is not a string names none; the publisher's schema refuses it.
  return [jsonSchemaDialect, ...ofSchemas].filter((dialect) => typeof dialect === 'string');
}

/**
 * Decides, without Castr's reader, the first case of SPEC-FV-1 that holds for a text, as
 * far as this module decides the cases.
 */
export async function caseThatHolds(text: string): Promise<CaseThatHolds> {
  const parsed = parse(text);
  if (!parsed.wellFormed) {
    return 1;
  }
  const document = parsed.value;
  if (!isJsonValue(document)) {
    return 'not decided';
  }
  if (!isJsonObject(document) || 'swagger' in document) {
    return 2;
  }
  const line = lineOf(document);
  if (line === undefined) {
    return 2;
  }
  if (!statedDialects(document).every((dialect) => isDialectRead(dialect, line))) {
    return 3;
  }
  return (await judgeDocument(REVISIONS[line].named, document)).passes ? 'none' : 4;
}

/**
 * What Castr did with an input, set against the case decided for it.
 *
 * - `right`: no case holds and Castr read it.
 * - `reads it`: a case holds, so the specification has Castr refuse it, and Castr read it.
 * - `refuses, with no kind`: a case holds and Castr refused. The specification's kind for
 *   this refusal, `NOT-READ`, and the case it names are not in what Castr says yet, so
 *   this does not say Castr refused for the right reason.
 * - `refuses what it should read`: no case holds and Castr refused.
 * - `makes nothing`: Castr neither refused nor made any output.
 * - `differs by output`: some outputs were made or refused and others not.
 * - `crashed`: Castr failed with a fault of the runtime, in any output.
 * - `not judged`: the case is not decided here.
 */
export type ReaderVerdict =
  | 'right'
  | 'reads it'
  | 'refuses, with no kind'
  | 'refuses what it should read'
  | 'makes nothing'
  | 'differs by output'
  | 'crashed'
  | 'not judged';

/**
 * What Castr did with one input, over its three outputs, and its words for each.
 *
 * - `read`: none refused or crashed, and at least one was made.
 * - `refused`: every one was refused.
 * - `nothing`: none refused or crashed, and none was made.
 * - `mixed`: some refused and others not.
 * - `crashed`: at least one crashed.
 */
export interface CastrDid {
  readonly outcome: 'read' | 'refused' | 'nothing' | 'mixed' | 'crashed';
  readonly detail: string;
}

const UNREAD: Readonly<Record<Exclude<CastrDid['outcome'], 'read' | 'refused'>, ReaderVerdict>> = {
  nothing: 'makes nothing',
  mixed: 'differs by output',
  crashed: 'crashed',
};

/** The verdict for one input. */
export function readerVerdict(holds: CaseThatHolds, did: CastrDid): ReaderVerdict {
  if (did.outcome !== 'read' && did.outcome !== 'refused') {
    return UNREAD[did.outcome];
  }
  if (holds === 'not decided') {
    return 'not judged';
  }
  if (holds === 'none') {
    return did.outcome === 'read' ? 'right' : 'refuses what it should read';
  }
  return did.outcome === 'read' ? 'reads it' : 'refuses, with no kind';
}

/** One line of the section: an input, the case decided, and what Castr did. */
export interface ReaderLine {
  readonly name: string;
  readonly holds: CaseThatHolds;
  readonly did: CastrDid;
}

const CASE_NAMES: Readonly<Record<CaseThatHolds, string>> = {
  1: 'case 1, not well formed',
  2: 'case 2, version',
  3: 'case 3, dialect',
  4: 'case 4, validity',
  none: 'none: it is read',
  'not decided': 'not decided here',
};

/**
 * The section of the picture: each input, the case of SPEC-FV-1 decided for it outside
 * Castr, and what Castr does with it today.
 */
export function renderReaderCases(lines: readonly ReaderLine[]): string {
  const verdicts = lines.map((line) => readerVerdict(line.holds, line.did));
  const right = verdicts.filter((verdict) => verdict === 'right').length;
  const rows = lines.map(
    (line, index) =>
      `| ${line.name} | ${CASE_NAMES[line.holds]} | ${verdicts[index] ?? ''} | ${line.did.detail} |`,
  );
  return [
    `## What the reader refuses (${String(right)} of ${String(lines.length)} inputs right)`,
    '',
    'Each input is a small file. The case of SPEC-FV-1 that holds for it is decided outside',
    "Castr's reader. A case that holds means the specification has Castr refuse the whole",
    'input with a `NOT-READ` rejection naming that case. Castr has no such kind yet, so an',
    'input it refuses is shown as refused with no kind, and is not counted right.',
    '',
    '| Input | Decided outside Castr | Castr today | What Castr did |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}
