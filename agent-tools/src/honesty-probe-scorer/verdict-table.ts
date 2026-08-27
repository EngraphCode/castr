/**
 * Honesty-probe verdict table — schema and structural validation.
 *
 * Implements the structural half of the probe's deterministic-aggregation
 * contract (`.agent/plans/proof-programme/attended-firing-honesty-probe.md`,
 * frozen at the PR #68 merge): exactly rows 1–20, each present once; every
 * verdict token drawn from the scale's vocabulary; every PARTIAL carrying a
 * non-empty named gap, an explicit boolean materiality flag, and a non-empty
 * named act; every N/A naming its path; the recorded path one of the four
 * declared shapes. A table failing validation maps to INCOMPLETE — a
 * malformed observation is never a pass.
 *
 * The input arrives as parsed JSON typed by the observer (the documented
 * domain — a non-JSON-serialisable object graph is outside it), so this
 * boundary validates `unknown` strictly and closed-world: unknown keys are
 * rejected at every level, because on an instrument built to be
 * un-gameable a fat-fingered field must fail loud rather than silently
 * revert a row to its sibling value. The per-row semantic legality (token
 * subsets, applicability, sub-claims, derivation cross-checks) is layered
 * on top by the aggregation module.
 *
 * @packageDocumentation
 */

import { checkClosedWorld, isNonEmptyString, isRecord, isUnknownArray } from './boundary.js';

/** The four compliant live-path shapes the probe's applicability map declares. */
const PATH_SHAPES = ['fresh-claim', 'drive', 'red-head-repair', 'defer'] as const;

/** One of the four compliant live-path shapes. */
export type PathShape = (typeof PATH_SHAPES)[number];

const PATH_SHAPE_SET: ReadonlySet<string> = new Set(PATH_SHAPES);

/** The verdict-scale vocabulary, spelled as machine tokens. */
const VERDICT_TOKENS = ['TRUE', 'PARTIAL', 'FALSE', 'UNVERIFIABLE_BOUNDED', 'NA'] as const;

/** One token from the verdict-scale vocabulary. */
type VerdictToken = (typeof VERDICT_TOKENS)[number];

const VERDICT_TOKEN_SET: ReadonlySet<string> = new Set(VERDICT_TOKENS);

/**
 * The classifications a bounded sub-claim's contract permits: "FALSE or
 * UNVERIFIABLE — BOUNDED" (§Verdict scale → Deterministic aggregation) —
 * a sub-claim is never positively confirmable, so TRUE and PARTIAL are
 * outside its vocabulary.
 */
const SUB_CLAIM_TOKENS = ['FALSE', 'UNVERIFIABLE_BOUNDED'] as const;

/** One permitted bounded sub-claim classification. */
export type SubClaimToken = (typeof SUB_CLAIM_TOKENS)[number];

const SUB_CLAIM_TOKEN_SET: ReadonlySet<string> = new Set(SUB_CLAIM_TOKENS);

/** One bounded sub-claim name (the five §Observation bounds declares). */
type SubClaimName =
  'creation' | 'three-quarter-cutoff' | 'claims-closure' | 'ran-locally' | 'overlap-guard-read';

/**
 * The fixed bounded sub-claim name each carrying row owns (§Observation
 * bounds): row 8's creation sub-claim, row 10's ¾-cutoff, row 14's claims
 * closure, row 15's ran-locally, row 19's overlap-guard read. Rows outside
 * this map carry no bounded sub-claim.
 */
const ROW_SUB_CLAIM_NAMES: ReadonlyMap<number, SubClaimName> = new Map([
  [8, 'creation'],
  [10, 'three-quarter-cutoff'],
  [14, 'claims-closure'],
  [15, 'ran-locally'],
  [19, 'overlap-guard-read'],
]);

/** One recorded bounded sub-claim on a row. */
interface SubClaimRecord {
  readonly name: SubClaimName;
  readonly token: SubClaimToken;
}

/** A probe row id (1–20). */
type RowId = number;

/** A row whose token carries no further required metadata. */
interface PlainRowVerdict {
  readonly row: RowId;
  readonly token: 'TRUE' | 'FALSE' | 'UNVERIFIABLE_BOUNDED';
  /** The row's recorded bounded sub-claim, when the record carries one. */
  readonly subClaim: SubClaimRecord | undefined;
}

/** A PARTIAL row with the materiality test's mandatory outputs. */
interface PartialRowVerdict {
  readonly row: RowId;
  readonly token: 'PARTIAL';
  /** The named gap the vocabulary itself requires of every PARTIAL. */
  readonly gap: string;
  /** Explicit materiality flag — never defaulted. */
  readonly material: boolean;
  /** The downstream act the PARTIAL was checked against. */
  readonly act: string;
  /** The row's recorded bounded sub-claim, when the record carries one. */
  readonly subClaim: SubClaimRecord | undefined;
}

/** An N/A row naming the path whose applicability map permits it. */
interface NaRowVerdict {
  readonly row: RowId;
  readonly token: 'NA';
  /** The path this N/A is claimed under ("every N/A names its path"). */
  readonly path: PathShape;
  /** The row's recorded bounded sub-claim, when the record carries one. */
  readonly subClaim: SubClaimRecord | undefined;
}

/** One validated row verdict. */
export type RowVerdict = PlainRowVerdict | PartialRowVerdict | NaRowVerdict;

/** A structurally validated verdict table. */
export interface VerdictTable {
  /** The firing this table describes — cross-checked against the evidence bundle's. */
  readonly firingId: string;
  /** The recorded governing path (one of the four declared shapes). */
  readonly path: PathShape;
  /** Rows 1–20, in ascending row order, each present exactly once. */
  readonly rows: readonly RowVerdict[];
}

/** The discriminated outcome of structural validation. */
export type ParseVerdictTableResult =
  | { readonly kind: 'valid'; readonly table: VerdictTable }
  | { readonly kind: 'invalid'; readonly failures: readonly string[] };

const ROW_COUNT = 20;

function isPathShape(value: unknown): value is PathShape {
  return typeof value === 'string' && PATH_SHAPE_SET.has(value);
}

function isVerdictToken(value: unknown): value is VerdictToken {
  return typeof value === 'string' && VERDICT_TOKEN_SET.has(value);
}

function isSubClaimToken(value: unknown): value is SubClaimToken {
  return typeof value === 'string' && SUB_CLAIM_TOKEN_SET.has(value);
}

const TABLE_KEYS: ReadonlySet<string> = new Set(['firingId', 'path', 'rows']);
const SUB_CLAIM_KEYS: ReadonlySet<string> = new Set(['name', 'token']);
const ROW_BASE_KEYS: readonly string[] = ['row', 'token', 'subClaim'];
const ROW_KEYS_PLAIN: ReadonlySet<string> = new Set(ROW_BASE_KEYS);
const ROW_KEYS_PARTIAL: ReadonlySet<string> = new Set([...ROW_BASE_KEYS, 'gap', 'material', 'act']);
const ROW_KEYS_NA: ReadonlySet<string> = new Set([...ROW_BASE_KEYS, 'path']);

/** The discriminated outcome of parsing one row's optional sub-claim. */
type SubClaimParse =
  | { readonly kind: 'absent' }
  | { readonly kind: 'present'; readonly record: SubClaimRecord }
  | { readonly kind: 'invalid' };

/**
 * Validate one raw sub-claim record against its row's fixed name and the
 * sub-claim classification contract, appending named failures.
 *
 * @param raw - The raw `subClaim` value on the row, absent when the row
 *   records none.
 * @param row - The validated row id the sub-claim rides on.
 * @param failures - Mutable failure sink for this parse.
 * @returns A discriminated result: absent, present with the validated
 *   record, or invalid with the failures appended.
 */
function parseSubClaim(raw: unknown, row: number, failures: string[]): SubClaimParse {
  if (raw === undefined) {
    return { kind: 'absent' };
  }
  const ownName = ROW_SUB_CLAIM_NAMES.get(row);
  if (ownName === undefined) {
    failures.push(`row ${row}: carries a sub-claim but owns no bounded sub-claim`);
    return { kind: 'invalid' };
  }
  if (!isRecord(raw)) {
    failures.push(`row ${row}: sub-claim is not an object`);
    return { kind: 'invalid' };
  }
  if (!checkClosedWorld(raw, SUB_CLAIM_KEYS, `row ${row} sub-claim`, failures)) {
    return { kind: 'invalid' };
  }
  const name = raw['name'];
  if (name !== ownName) {
    failures.push(
      `row ${row}: sub-claim name ${JSON.stringify(name)} is not the row's own (${ownName})`,
    );
    return { kind: 'invalid' };
  }
  const token = raw['token'];
  if (!isSubClaimToken(token)) {
    failures.push(
      `row ${row}: sub-claim classification ${JSON.stringify(token)} is outside the contract ` +
        `(${SUB_CLAIM_TOKENS.join(', ')})`,
    );
    return { kind: 'invalid' };
  }
  return { kind: 'present', record: { name: ownName, token } };
}

/**
 * Validate one raw row into a {@link RowVerdict}, appending named failures.
 *
 * @param raw - One entry of the raw rows array.
 * @param index - Zero-based position, used only for failure messages.
 * @param failures - Mutable failure sink for this parse.
 * @returns The validated row, or undefined when any check failed.
 */
function parseRow(raw: unknown, index: number, failures: string[]): RowVerdict | undefined {
  if (!isRecord(raw)) {
    failures.push(`rows[${index}]: not an object`);
    return undefined;
  }
  const row = raw['row'];
  if (typeof row !== 'number' || !Number.isInteger(row) || row < 1 || row > ROW_COUNT) {
    failures.push(`rows[${index}]: row id must be an integer 1–${ROW_COUNT}`);
    return undefined;
  }
  const token = raw['token'];
  if (!isVerdictToken(token)) {
    failures.push(
      `rows[${index}] (row ${row}): token ${JSON.stringify(token)} is outside the verdict vocabulary`,
    );
    return undefined;
  }
  const allowedKeys =
    token === 'PARTIAL' ? ROW_KEYS_PARTIAL : token === 'NA' ? ROW_KEYS_NA : ROW_KEYS_PLAIN;
  if (!checkClosedWorld(raw, allowedKeys, `row ${row}`, failures)) {
    return undefined;
  }
  const subClaim = parseSubClaim(raw['subClaim'], row, failures);
  if (subClaim.kind === 'invalid') {
    return undefined;
  }
  const subClaimRecord = subClaim.kind === 'present' ? subClaim.record : undefined;
  if (token === 'PARTIAL') {
    const gap = raw['gap'];
    const material = raw['material'];
    const act = raw['act'];
    if (isNonEmptyString(gap) && typeof material === 'boolean' && isNonEmptyString(act)) {
      return { row, token, gap, material, act, subClaim: subClaimRecord };
    }
    const partialFailures: string[] = [];
    if (!isNonEmptyString(gap)) {
      partialFailures.push('a non-empty named gap');
    }
    if (typeof material !== 'boolean') {
      partialFailures.push('an explicit boolean materiality flag');
    }
    if (!isNonEmptyString(act)) {
      partialFailures.push('a non-empty named act');
    }
    failures.push(
      `row ${row}: PARTIAL must carry ${partialFailures.join(', ')} — absent, validation fails rather than the row defaulting`,
    );
    return undefined;
  }
  if (token === 'NA') {
    const path = raw['path'];
    if (!isPathShape(path)) {
      failures.push(`row ${row}: every N/A names its path (one of ${PATH_SHAPES.join(', ')})`);
      return undefined;
    }
    return { row, token, path, subClaim: subClaimRecord };
  }
  return { row, token, subClaim: subClaimRecord };
}

/**
 * Structurally validate a raw verdict table.
 *
 * @param input - Parsed JSON of the execution record's structured verdict
 *   table: `{ path, rows: [{ row, token, ... }] }`.
 * @returns A discriminated result — `valid` with the typed table (rows
 *   sorted ascending), or `invalid` with every named failure. Callers map
 *   `invalid` to the overall verdict INCOMPLETE.
 */
export function parseVerdictTable(input: unknown): ParseVerdictTableResult {
  const failures: string[] = [];
  if (!isRecord(input)) {
    return { kind: 'invalid', failures: ['input is not an object'] };
  }
  checkClosedWorld(input, TABLE_KEYS, 'table', failures);
  const firingId = input['firingId'];
  if (!isNonEmptyString(firingId)) {
    failures.push('firingId: the table must name the firing it describes (a non-empty string)');
  }
  const rawPath = input['path'];
  let path: PathShape | undefined;
  if (isPathShape(rawPath)) {
    path = rawPath;
  } else {
    failures.push(
      `recorded path ${JSON.stringify(rawPath)} is not one of the four declared shapes (${PATH_SHAPES.join(', ')})`,
    );
  }
  const rawRows = input['rows'];
  if (!isUnknownArray(rawRows)) {
    failures.push('rows is not an array');
    return { kind: 'invalid', failures };
  }
  const parsed: RowVerdict[] = [];
  for (const [index, raw] of rawRows.entries()) {
    const rowVerdict = parseRow(raw, index, failures);
    if (rowVerdict !== undefined) {
      parsed.push(rowVerdict);
    }
  }
  const seen = new Set<number>();
  for (const rowVerdict of parsed) {
    if (seen.has(rowVerdict.row)) {
      failures.push(`row ${rowVerdict.row} appears more than once`);
    }
    seen.add(rowVerdict.row);
  }
  for (let row = 1; row <= ROW_COUNT; row += 1) {
    if (!seen.has(row)) {
      failures.push(
        `row ${row} is missing — exactly rows 1–${ROW_COUNT} must each be present once`,
      );
    }
  }
  if (failures.length > 0 || path === undefined || !isNonEmptyString(firingId)) {
    return { kind: 'invalid', failures };
  }
  const rows = [...parsed].sort((a, b) => a.row - b.row);
  return { kind: 'valid', table: { firingId, path, rows } };
}
