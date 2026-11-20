import type { Inventory, KeywordKind, ObjectKind } from './inventory.js';
import type { ObjectProposals } from './object-proposals.js';
import { proposalOf, type Coded, type Proposal } from './outcomes.js';
import type { TextRow } from './schema-proposals.js';

/**
 * Which part of a document a row belongs to. The first five are parts of a schema.
 */
export type RowGroup =
  | 'schema keyword'
  | 'type value'
  | 'format value'
  | 'schema construct'
  | 'schema vocabulary'
  | 'document';

/**
 * One construct kind, with where it was found and what is proposed for it.
 */
export interface Row {
  readonly id: string;
  readonly group: RowGroup;
  readonly label: string;
  /** `computed`, or the section of a specification's text that defines the row. */
  readonly source: string;
  /** The OpenAPI versions whose definitions declare the row. Empty for a row from text. */
  readonly versions: readonly string[];
  readonly proposal: Proposal;
}

/**
 * Rows, and everything that stops them being a whole and honest list.
 */
export interface RowsResult {
  readonly rows: readonly Row[];
  readonly problems: readonly string[];
}

/**
 * One version's reading of a published definition.
 */
export interface VersionedInventory {
  readonly version: string;
  readonly inventory: Inventory;
}

const COMPUTED = 'computed';

/**
 * Joins computed names to their proposals: a name with no proposal, and a proposal for a
 * name that was not computed, are both problems.
 */
function joinByName(
  names: readonly string[],
  proposals: ReadonlyMap<string, Coded>,
  describe: (name: string) => Omit<Row, 'proposal'>,
): RowsResult {
  const rows: Row[] = [];
  const problems: string[] = [];
  for (const name of names) {
    const coded = proposals.get(name);
    const described = describe(name);
    if (coded === undefined) {
      problems.push(`no proposal for ${described.id}`);
    } else {
      rows.push({ ...described, proposal: proposalOf(coded) });
    }
  }
  for (const name of proposals.keys()) {
    if (!names.includes(name)) {
      problems.push(`a proposal names a row that was not computed: ${describe(name).id}`);
    }
  }
  return { rows, problems };
}

/**
 * One row for each keyword of the JSON Schema vocabularies.
 */
export function keywordRows(
  keywords: readonly KeywordKind[],
  proposals: ReadonlyMap<string, Coded>,
): RowsResult {
  const vocabularyOf = new Map(keywords.map((entry) => [entry.keyword, entry.vocabulary]));
  return joinByName(
    keywords.map((entry) => entry.keyword),
    proposals,
    (keyword) => ({
      id: `keyword:${keyword}`,
      group: 'schema keyword',
      label: `${keyword} (${vocabularyOf.get(keyword) ?? 'no vocabulary'})`,
      source: COMPUTED,
      versions: [],
    }),
  );
}

/**
 * One row for each value `type` may take.
 */
export function typeValueRows(
  values: readonly string[],
  proposals: ReadonlyMap<string, Coded>,
): RowsResult {
  return joinByName(values, proposals, (value) => ({
    id: `type:${value}`,
    group: 'type value',
    label: `type: ${value}`,
    source: COMPUTED,
    versions: [],
  }));
}

/**
 * Rows that only a specification's text defines.
 */
export function textRows(group: RowGroup, entries: readonly TextRow[]): RowsResult {
  return {
    rows: entries.map((entry) => ({
      id: `text:${entry.label}`,
      group,
      label: entry.label,
      source: entry.definedIn,
      versions: [],
      proposal: proposalOf(entry.proposal),
    })),
    problems: [],
  };
}

interface MergedField {
  readonly versions: string[];
  readonly values: Map<string, string[]>;
}

interface MergedObject {
  readonly fields: Map<string, MergedField>;
  readonly keyedIn: string[];
}

function mergeObject(merged: MergedObject, version: string, object: ObjectKind): void {
  for (const field of object.fields) {
    const entry: MergedField = merged.fields.get(field.name) ?? {
      versions: [],
      values: new Map(),
    };
    merged.fields.set(field.name, entry);
    entry.versions.push(version);
    for (const value of field.values) {
      entry.values.set(value, [...(entry.values.get(value) ?? []), version]);
    }
  }
  if (object.keyedBy.length > 0) {
    merged.keyedIn.push(version);
  }
}

function mergeVersions(inventories: readonly VersionedInventory[]): Map<string, MergedObject> {
  const objects = new Map<string, MergedObject>();
  for (const { version, inventory } of inventories) {
    for (const object of inventory.objects) {
      const merged: MergedObject = objects.get(object.name) ?? {
        fields: new Map(),
        keyedIn: [],
      };
      objects.set(object.name, merged);
      mergeObject(merged, version, object);
    }
  }
  return objects;
}

function fieldRows(
  group: RowGroup,
  objectName: string,
  fieldName: string,
  field: MergedField,
  coded: Coded,
): readonly Row[] {
  const proposal = proposalOf(coded);
  const base = { group, source: COMPUTED, proposal };
  // A field with a fixed set of values is one row per value: each value is a construct
  // of its own, and a case for the field would exercise one of them.
  if (field.values.size > 1) {
    return [...field.values].map(([value, versions]) => ({
      ...base,
      id: `${objectName}.${fieldName}=${value}`,
      label: `${objectName}: ${fieldName}: ${value}`,
      versions,
    }));
  }
  return [
    {
      ...base,
      id: `${objectName}.${fieldName}`,
      label: `${objectName}: ${fieldName}`,
      versions: field.versions,
    },
  ];
}

function objectRowsOf(
  group: RowGroup,
  name: string,
  merged: MergedObject,
  proposals: ObjectProposals | undefined,
): RowsResult {
  const rows: Row[] = [];
  const problems: string[] = [];
  for (const [fieldName, field] of merged.fields) {
    const coded = proposals?.fields?.get(fieldName) ?? proposals?.fallback;
    if (coded === undefined) {
      problems.push(`no proposal for ${name}.${fieldName}`);
    } else {
      rows.push(...fieldRows(group, name, fieldName, field, coded));
    }
  }
  for (const fieldName of proposals?.fields?.keys() ?? []) {
    if (!merged.fields.has(fieldName)) {
      problems.push(`a proposal names a field that was not computed: ${name}.${fieldName}`);
    }
  }
  if (merged.keyedIn.length > 0 && proposals?.keyed === undefined) {
    problems.push(`no proposal for the keyed entries of ${name}`);
  }
  if (merged.keyedIn.length === 0 && proposals?.keyed !== undefined) {
    problems.push(`a proposal names keyed entries that were not computed: ${name}`);
  }
  if (merged.keyedIn.length > 0) {
    for (const [what, coded] of proposals?.keyed ?? []) {
      rows.push({
        id: `${name}[${what}]`,
        group,
        label: `${name}: an entry keyed by ${what}`,
        source: COMPUTED,
        versions: merged.keyedIn,
        proposal: proposalOf(coded),
      });
    }
  }
  return { rows, problems };
}

/**
 * One row for each field, fixed value and keyed entry of the objects a published
 * definition declares, across the versions given.
 */
export function objectRows(
  group: RowGroup,
  inventories: readonly VersionedInventory[],
  proposals: ReadonlyMap<string, ObjectProposals>,
): RowsResult {
  const rows: Row[] = [];
  const problems: string[] = [];
  for (const { version, inventory } of inventories) {
    problems.push(...inventory.problems.map((problem) => `${version}: ${problem}`));
  }
  const objects = mergeVersions(inventories);
  for (const [name, merged] of objects) {
    const result = objectRowsOf(group, name, merged, proposals.get(name));
    rows.push(...result.rows);
    problems.push(...result.problems);
  }
  for (const name of proposals.keys()) {
    if (!objects.has(name)) {
      problems.push(`a proposal names an object that was not computed: ${name}`);
    }
  }
  return { rows, problems };
}

const OUTSIDE = 'outside the target';
const READ = 'read';

/** The four declarations a reader spends in reading (the owner, 20 November 2026). */
const READ_ROWS: ReadonlySet<string> = new Set([
  'keyword:$schema',
  'keyword:$vocabulary',
  'openapi.openapi',
  'openapi.jsonSchemaDialect',
]);

function outcomesOf(row: Row): readonly string[] {
  return [row.proposal.zod, row.proposal.typescript, row.proposal.endpoints];
}

/**
 * The bars on the fifth class and the sixth outcome. No part of a schema is ever outside
 * a target, and only the four declarations a reader spends are ever read. A check Castr
 * writes is a way Zod carries, and nothing else.
 */
export function barProblems(rows: readonly Row[]): readonly string[] {
  const problems: string[] = [];
  for (const row of rows) {
    const outcomes = outcomesOf(row);
    if (row.group !== 'document' && outcomes.includes(OUTSIDE)) {
      problems.push(`${row.id} is part of a schema and is proposed as outside a target`);
    }
    const isRead = outcomes.includes(READ);
    if (isRead && !READ_ROWS.has(row.id)) {
      problems.push(`${row.id} is proposed as read and is not a declaration a reader spends`);
    }
    if (READ_ROWS.has(row.id) && outcomes.some((outcome) => outcome !== READ)) {
      problems.push(`${row.id} is a declaration a reader spends and is not proposed as read`);
    }
    if (row.proposal.zodByCastrCheck && row.proposal.zod !== 'carried') {
      problems.push(`${row.id} names a check Castr writes without Zod carrying it`);
    }
  }
  return problems;
}

/**
 * Puts several results together, refusing two rows with one identity.
 */
export function combine(results: readonly RowsResult[]): RowsResult {
  const rows = results.flatMap((result) => result.rows);
  const problems = results.flatMap((result) => result.problems);
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.id)) {
      problems.push(`two rows share the identity ${row.id}`);
    }
    seen.add(row.id);
  }
  return { rows, problems: [...problems, ...barProblems(rows)] };
}
