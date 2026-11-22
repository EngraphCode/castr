/**
 * Small documents run against the publisher's schema at the revisions specification 0.8.0
 * names and at the latest revisions the picture pins.
 *
 * SPEC-FV-1 case 4 is judged "at the revision this section names". Naming a later
 * revision changes which documents are refused, in both directions. The documents here
 * are the ones known to differ and the ones that prove the judge; each is written once
 * and stamped with a version of each line.
 */

import { judgeDocument, type JsonValue } from './judge.js';

/** A version line of OpenAPI that Castr reads. */
export type Line = '3.1' | '3.2';

const PUBLISHER = 'https://spec.openapis.org/oas';

/**
 * For each line, the revision 0.8.0 names and the latest revision pinned.
 */
export const REVISIONS: Readonly<
  Record<Line, { readonly named: string; readonly latest: string }>
> = {
  '3.1': {
    named: `${PUBLISHER}/3.1/schema/2022-10-07`,
    latest: `${PUBLISHER}/3.1/schema/2026-11-05`,
  },
  '3.2': {
    named: `${PUBLISHER}/3.2/schema/2025-09-17`,
    latest: `${PUBLISHER}/3.2/schema/2026-11-12`,
  },
};

/**
 * For each line, the latest pinned schema that also judges each Schema Object by the
 * line's dialect.
 */
export const WITH_DIALECT: Readonly<Record<Line, string>> = {
  '3.1': `${PUBLISHER}/3.1/schema-base/2026-11-05`,
  '3.2': `${PUBLISHER}/3.2/schema-base/2026-11-12`,
};

type Members = Readonly<Record<string, JsonValue>>;

/** A document's members besides `openapi`, `info` and an empty `paths`. */
export interface RevisionCase {
  readonly name: string;
  readonly members: Members;
}

const OK_RESPONSES: Members = { '200': { description: 'ok' } };

function operationWith(members: Members): Members {
  return { paths: { '/a': { get: { responses: OK_RESPONSES, ...members } } } };
}

function component(kind: string, value: JsonValue): Members {
  return { components: { [kind]: { x: value } } };
}

const QUERY_PARAMETER: Members = { name: 'a', in: 'query', schema: {} };

export const REVISION_CASES: readonly RevisionCase[] = [
  { name: 'nothing besides the required fields', members: {} },
  {
    name: 'a Schema Object `{"type": "string"}`',
    members: component('schemas', { type: 'string' }),
  },
  { name: 'a Schema Object `true`', members: component('schemas', true) },
  { name: 'a Schema Object `{}`', members: component('schemas', {}) },
  { name: 'a Parameter whose `schema` is `{}`', members: component('parameters', QUERY_PARAMETER) },
  { name: 'a Schema Object `{"type": 5}`', members: component('schemas', { type: 5 }) },
  { name: 'a number where a Schema Object stands', members: component('schemas', 7) },
  {
    name: 'a Schema Object whose `discriminator` is a string',
    members: component('schemas', { discriminator: 'x' }),
  },
  { name: 'a field the root does not have', members: { bogus: 1 } },
  { name: 'a path that does not start with a slash', members: { paths: { a: {} } } },
  {
    name: 'a Parameter with no `name`',
    members: component('parameters', { in: 'query', schema: {} }),
  },
  {
    name: 'a Responses Object holding only an `x-` field',
    members: { paths: { '/a': { get: { responses: { 'x-a': 1 } } } } },
  },
  {
    name: '`allowReserved` on a header parameter',
    members: operationWith({
      parameters: [{ name: 'h', in: 'header', schema: {}, allowReserved: true }],
    }),
  },
  {
    name: '`allowReserved` on a Header Object',
    members: component('headers', { schema: {}, allowReserved: true }),
  },
  {
    // 3.1 has no `style: cookie`, so there this fails for the style as well.
    name: 'a cookie parameter with `style: cookie` and `allowReserved`',
    members: operationWith({
      parameters: [{ name: 'c', in: 'cookie', style: 'cookie', schema: {}, allowReserved: true }],
    }),
  },
  {
    name: '`allowReserved` on a cookie parameter with no `style`',
    members: operationWith({
      parameters: [{ name: 'c', in: 'cookie', schema: {}, allowReserved: true }],
    }),
  },
  {
    name: 'a header parameter whose name is not a token',
    members: operationWith({ parameters: [{ name: 'a b', in: 'header', schema: {} }] }),
  },
  {
    name: 'a response header whose name is not a token',
    members: component('responses', { description: 'd', headers: { 'a b': { schema: {} } } }),
  },
  {
    name: 'a Media Type Object with `description`',
    members: component('responses', {
      description: 'd',
      content: { 'text/plain': { description: 'x' } },
    }),
  },
  {
    name: 'a path parameter named `a{b}`',
    members: {
      paths: {
        '/x/{a{b}}': {
          get: {
            responses: OK_RESPONSES,
            parameters: [{ name: 'a{b}', in: 'path', required: true, schema: {} }],
          },
        },
      },
    },
  },
  {
    name: '`example` beside `examples` on a Parameter',
    members: component('parameters', {
      ...QUERY_PARAMETER,
      example: 1,
      examples: { e: { value: 1 } },
    }),
  },
  {
    name: '`example` beside `examples` on a Media Type Object',
    members: component('responses', {
      description: 'd',
      content: { 'text/plain': { example: 1, examples: { e: { value: 1 } } } },
    }),
  },
  {
    name: '`$ref` on a Path Item under `paths`',
    members: {
      paths: { '/a': { $ref: '#/components/pathItems/x' } },
      components: { pathItems: { x: {} } },
    },
  },
  {
    name: '`$ref` on a Path Item beside an operation',
    members: {
      paths: { '/a': { $ref: '#/components/pathItems/x', get: { responses: OK_RESPONSES } } },
      components: { pathItems: { x: {} } },
    },
  },
  {
    name: 'a Reference Object with a field it does not have',
    members: {
      components: {
        parameters: { x: { $ref: '#/components/parameters/y', bogus: 1 }, y: QUERY_PARAMETER },
      },
    },
  },
  {
    name: 'a Reference Object with `summary`',
    members: {
      components: {
        parameters: { x: { $ref: '#/components/parameters/y', summary: 's' }, y: QUERY_PARAMETER },
      },
    },
  },
  {
    name: 'a Link Object with `server`',
    members: component('links', { operationId: 'o', server: { url: 'https://e.example' } }),
  },
  {
    name: 'a Link Object with `body`',
    members: component('links', { operationId: 'o', body: { url: 'https://e.example' } }),
  },
];

/**
 * A document with no `info`, which every revision refuses. It is kept apart because
 * every other case holds the required fields.
 */
export function documentWithoutInfo(line: Line): JsonValue {
  return { openapi: `${line}.0`, paths: {} };
}

/** The whole document a case stands for, at the first version of a line. */
function documentOf(revisionCase: RevisionCase, line: Line): JsonValue {
  return {
    openapi: `${line}.0`,
    info: { title: 't', version: '1' },
    paths: {},
    ...revisionCase.members,
  };
}

/** What three schemas of one line say of one document. */
export interface RevisionOutcome {
  readonly name: string;
  readonly line: Line;
  readonly named: boolean;
  readonly latest: boolean;
  readonly withDialect: boolean;
}

const LINES: readonly Line[] = ['3.1', '3.2'];

/**
 * Judges every case, as a document of each line, against that line's three schemas.
 */
export async function judgeRevisionCases(
  cases: readonly RevisionCase[],
): Promise<readonly RevisionOutcome[]> {
  const outcomes: RevisionOutcome[] = [];
  for (const line of LINES) {
    for (const revisionCase of cases) {
      const document = documentOf(revisionCase, line);
      outcomes.push({
        name: revisionCase.name,
        line,
        named: (await judgeDocument(REVISIONS[line].named, document)).passes,
        latest: (await judgeDocument(REVISIONS[line].latest, document)).passes,
        withDialect: (await judgeDocument(WITH_DIALECT[line], document)).passes,
      });
    }
  }
  return outcomes;
}

function word(passes: boolean): string {
  return passes ? 'passes' : 'fails';
}

/**
 * The section of the picture: the documents the two revisions of a line judge
 * differently.
 */
export function renderRevisionDifferences(outcomes: readonly RevisionOutcome[]): string {
  const differing = outcomes.filter((outcome) => outcome.named !== outcome.latest);
  const rows = differing.map(
    (outcome) =>
      `| ${outcome.name} | ${outcome.line} | ${word(outcome.named)} | ${word(outcome.latest)} |`,
  );
  return [
    `## What a change of the publisher's schema revision does (${String(differing.length)} of ${String(outcomes.length)} documents differ)`,
    '',
    'Each document is judged against the schema its publisher gives, at the revision',
    'specification 0.8.0 names and at the latest revision pinned here. The judge is outside',
    'Castr. A document listed is refused as invalid under one revision and not the other.',
    '',
    '| Document holds | Line | At the revision 0.8.0 names | At the latest revision |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}
