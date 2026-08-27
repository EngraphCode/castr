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
 * The input arrives as parsed JSON typed by the observer, so this boundary
 * validates `unknown` strictly and returns a discriminated result — the
 * per-row semantic legality (token subsets, applicability, sub-claims,
 * derivation cross-checks) is layered on top by the aggregation module.
 *
 * @packageDocumentation
 */

/** The four compliant live-path shapes the probe's applicability map declares. */
const PATH_SHAPES = ['fresh-claim', 'drive', 'red-head-repair', 'defer'] as const;

/** One of the four compliant live-path shapes. */
type PathShape = (typeof PATH_SHAPES)[number];

/** The verdict-scale vocabulary, spelled as machine tokens. */
const VERDICT_TOKENS = ['TRUE', 'PARTIAL', 'FALSE', 'UNVERIFIABLE_BOUNDED', 'NA'] as const;

/** One token from the verdict-scale vocabulary. */
type VerdictToken = (typeof VERDICT_TOKENS)[number];

/**
 * The classifications a bounded sub-claim's contract permits: "FALSE or
 * UNVERIFIABLE — BOUNDED" (§Verdict scale → Deterministic aggregation) —
 * a sub-claim is never positively confirmable, so TRUE and PARTIAL are
 * outside its vocabulary.
 */
const SUB_CLAIM_TOKENS = ['FALSE', 'UNVERIFIABLE_BOUNDED'] as const;

/** One permitted bounded sub-claim classification. */
export type SubClaimToken = (typeof SUB_CLAIM_TOKENS)[number];

/**
 * The fixed bounded sub-claim name each carrying row owns (§Observation
 * bounds): row 8's creation sub-claim, row 10's ¾-cutoff, row 14's claims
 * closure, row 15's ran-locally, row 19's overlap-guard read. Rows outside
 * this map carry no bounded sub-claim.
 */
const ROW_SUB_CLAIM_NAMES: ReadonlyMap<number, string> = new Map([
  [8, 'creation'],
  [10, 'three-quarter-cutoff'],
  [14, 'claims-closure'],
  [15, 'ran-locally'],
  [19, 'overlap-guard-read'],
]);

/** One recorded bounded sub-claim on a row. */
interface SubClaimRecord {
  readonly name: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPathShape(value: unknown): value is PathShape {
  return typeof value === 'string' && (PATH_SHAPES as readonly string[]).includes(value);
}

function isVerdictToken(value: unknown): value is VerdictToken {
  return typeof value === 'string' && (VERDICT_TOKENS as readonly string[]).includes(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isSubClaimToken(value: unknown): value is SubClaimToken {
  return typeof value === 'string' && (SUB_CLAIM_TOKENS as readonly string[]).includes(value);
}

/**
 * Validate one raw sub-claim record against its row's fixed name and the
 * sub-claim classification contract, appending named failures.
 *
 * @param raw - The raw `subClaim` value on the row, absent when the row
 *   records none.
 * @param row - The validated row id the sub-claim rides on.
 * @param failures - Mutable failure sink for this parse.
 * @returns The validated record, undefined when absent, or null when any
 *   check failed.
 */
function parseSubClaim(
  raw: unknown,
  row: number,
  failures: string[],
): SubClaimRecord | undefined | null {
  if (raw === undefined) {
    return undefined;
  }
  const ownName = ROW_SUB_CLAIM_NAMES.get(row);
  if (ownName === undefined) {
    failures.push(`row ${row}: carries a sub-claim but owns no bounded sub-claim`);
    return null;
  }
  if (!isRecord(raw)) {
    failures.push(`row ${row}: sub-claim is not an object`);
    return null;
  }
  const name = raw['name'];
  if (name !== ownName) {
    failures.push(
      `row ${row}: sub-claim name ${JSON.stringify(name)} is not the row's own (${ownName})`,
    );
    return null;
  }
  const token = raw['token'];
  if (!isSubClaimToken(token)) {
    failures.push(
      `row ${row}: sub-claim classification ${JSON.stringify(token)} is outside the contract ` +
        `(${SUB_CLAIM_TOKENS.join(', ')})`,
    );
    return null;
  }
  return { name, token };
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
  const subClaim = parseSubClaim(raw['subClaim'], row, failures);
  if (subClaim === null) {
    return undefined;
  }
  if (token === 'PARTIAL') {
    const gap = raw['gap'];
    const material = raw['material'];
    const act = raw['act'];
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
    if (partialFailures.length > 0) {
      failures.push(
        `row ${row}: PARTIAL must carry ${partialFailures.join(', ')} — absent, validation fails rather than the row defaulting`,
      );
      return undefined;
    }
    return { row, token, gap, material, act, subClaim } as PartialRowVerdict;
  }
  if (token === 'NA') {
    const path = raw['path'];
    if (!isPathShape(path)) {
      failures.push(`row ${row}: every N/A names its path (one of ${PATH_SHAPES.join(', ')})`);
      return undefined;
    }
    return { row, token, path, subClaim };
  }
  return { row, token, subClaim };
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
  const path = input['path'];
  if (!isPathShape(path)) {
    failures.push(
      `recorded path ${JSON.stringify(path)} is not one of the four declared shapes (${PATH_SHAPES.join(', ')})`,
    );
  }
  const rawRows = input['rows'];
  if (!Array.isArray(rawRows)) {
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
  if (failures.length > 0) {
    return { kind: 'invalid', failures };
  }
  const rows = [...parsed].sort((a, b) => a.row - b.row);
  return { kind: 'valid', table: { path: path as PathShape, rows } };
}
