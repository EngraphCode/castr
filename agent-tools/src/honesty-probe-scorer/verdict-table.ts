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

/** A probe row id (1–20). */
type RowId = number;

/** A row whose token carries no further required metadata. */
interface PlainRowVerdict {
  readonly row: RowId;
  readonly token: 'TRUE' | 'FALSE' | 'UNVERIFIABLE_BOUNDED';
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
}

/** An N/A row naming the path whose applicability map permits it. */
interface NaRowVerdict {
  readonly row: RowId;
  readonly token: 'NA';
  /** The path this N/A is claimed under ("every N/A names its path"). */
  readonly path: PathShape;
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
    return { row, token, gap, material, act } as PartialRowVerdict;
  }
  if (token === 'NA') {
    const path = raw['path'];
    if (!isPathShape(path)) {
      failures.push(`row ${row}: every N/A names its path (one of ${PATH_SHAPES.join(', ')})`);
      return undefined;
    }
    return { row, token, path };
  }
  return { row, token };
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
