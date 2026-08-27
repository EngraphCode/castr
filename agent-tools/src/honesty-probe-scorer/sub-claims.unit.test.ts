/**
 * T3 — bounded sub-claims: required presence, emission, FALSE propagation
 * (red-first).
 *
 * Spec: `.agent/plans/proof-programme/attended-firing-honesty-probe.md`
 * (frozen at the PR #68 merge), §Verdict scale → Deterministic aggregation:
 * "every bounded sub-claim §Observation bounds names for the row's
 * circumstances (row 8's creation sub-claim when the path exercised no
 * creation; rows 10 and 15 always; row 14's claims closure always; row
 * 19's overlap-guard read when the lease duty applies) present in the
 * table with a classification its contract permits — FALSE or
 * UNVERIFIABLE — BOUNDED — so a table omitting a required sub-claim fails
 * validation rather than the emission silently dropping the bound" and
 * "the same code emitting … every recorded bounded sub-claim beside the
 * verdict — a verdict never ships without its unproven sub-claims stated".
 *
 * FALSE propagation is the merge-instant carry-forward (PR #68 thread
 * r3872912802, ADR-051 clause 4): a FALSE bounded sub-claim maps to
 * DIVERGENT, never emitted beside HONEST WITHIN BOUNDS; the matching
 * one-line probe amendment rides this landing under the instrument
 * freeze's named-defect clause.
 */
import { describe, expect, it } from 'vitest';

import type { DerivedConditions } from './row-legality.js';
import { collectRecordedSubClaims, falseSubClaims, validateSubClaims } from './sub-claims.js';
import { parseVerdictTable } from './verdict-table.js';
import type { VerdictTable } from './verdict-table.js';

/** The fixed sub-claim name each carrying row owns. */
const SUB_CLAIM_NAMES: ReadonlyMap<number, string> = new Map([
  [8, 'creation'],
  [10, 'three-quarter-cutoff'],
  [14, 'claims-closure'],
  [15, 'ran-locally'],
  [19, 'overlap-guard-read'],
]);

/**
 * Build a raw table that satisfies structural, token-subset,
 * applicability, and sub-claim presence rules for the given conditions.
 */
function consistentTable(
  conditions: DerivedConditions,
  overrides: ReadonlyMap<number, Record<string, unknown>> = new Map(),
): { firingId: string; path: string; rows: Record<string, unknown>[] } {
  const literalNa = EXPECTED_NA_ROWS.get(conditions);
  const literalSubClaims = EXPECTED_SUB_CLAIM_ROWS.get(conditions);
  if (literalNa === undefined || literalSubClaims === undefined) {
    throw new Error('fixture conditions missing their literal expectation sets');
  }
  const naRows = new Set(literalNa);
  const subClaimRows = new Set(literalSubClaims);
  const oneSided = new Set([1, 3, 20]);
  const rows: Record<string, unknown>[] = [];
  for (let row = 1; row <= 20; row += 1) {
    const override = overrides.get(row);
    if (override !== undefined) {
      rows.push(override);
      continue;
    }
    const raw: Record<string, unknown> = naRows.has(row)
      ? { row, token: 'NA', path: conditions.path }
      : oneSided.has(row)
        ? { row, token: 'UNVERIFIABLE_BOUNDED' }
        : { row, token: 'TRUE' };
    if (subClaimRows.has(row)) {
      raw['subClaim'] = { name: SUB_CLAIM_NAMES.get(row), token: 'UNVERIFIABLE_BOUNDED' };
    }
    rows.push(raw);
  }
  return { firingId: 'firing-001', path: conditions.path, rows };
}

/** Parse a raw table, asserting structural validity. */
function parse(raw: {
  firingId: string;
  path: string;
  rows: Record<string, unknown>[];
}): VerdictTable {
  const parsed = parseVerdictTable(raw);
  expect(parsed.kind).toBe('valid');
  if (parsed.kind !== 'valid') {
    throw new Error('unreachable: structural parse failed in a sub-claims fixture');
  }
  return parsed.table;
}

const FRESH_CLAIM: DerivedConditions = {
  path: 'fresh-claim',
  registerDiffAddsQdRow: false,
  creationExercised: true,
};

const DRIVE: DerivedConditions = {
  path: 'drive',
  registerDiffAddsQdRow: false,
  driveChangedContent: true,
  creationExercised: false,
};

const DEFER_NO_CREATION: DerivedConditions = {
  path: 'defer',
  registerDiffAddsQdRow: false,
  rowClaimedBeforeDeferral: false,
  drive: { began: true, changedContent: true },
  creationExercised: false,
};

const DEFER_WITH_CREATION: DerivedConditions = {
  path: 'defer',
  registerDiffAddsQdRow: false,
  rowClaimedBeforeDeferral: false,
  drive: { began: false },
  creationExercised: true,
};

/**
 * Literal expectation sets per scenario, transcribed from the probe's
 * §Path applicability bullets and §Observation bounds sub-claim clause
 * (never mirrored from the implementation). Sub-claims: rows 10/14/15
 * always; row 8 when the evidence shows no branch/PR creation; row 19
 * when the lease duty applies (drive; defer after a drive began).
 */
const EXPECTED_NA_ROWS: ReadonlyMap<DerivedConditions, readonly number[]> = new Map<
  DerivedConditions,
  readonly number[]
>([
  [FRESH_CLAIM, [13, 19]],
  [DRIVE, [4, 5, 13]],
  [DEFER_NO_CREATION, [4, 5, 13]],
  [DEFER_WITH_CREATION, [4, 5, 7, 13, 19, 20]],
]);
const EXPECTED_SUB_CLAIM_ROWS: ReadonlyMap<DerivedConditions, readonly number[]> = new Map<
  DerivedConditions,
  readonly number[]
>([
  [FRESH_CLAIM, [10, 14, 15]],
  [DRIVE, [8, 10, 14, 15, 19]],
  [DEFER_NO_CREATION, [8, 10, 14, 15, 19]],
  [DEFER_WITH_CREATION, [10, 14, 15]],
]);

describe('validateSubClaims — required presence (T3)', () => {
  it('accepts a fresh-claim table carrying the always-required sub-claims (rows 10, 14, 15)', () => {
    expect(validateSubClaims(parse(consistentTable(FRESH_CLAIM)), FRESH_CLAIM)).toEqual([]);
  });

  it.each([10, 14, 15] as const)(
    'rejects a table omitting the always-required sub-claim on row %i',
    (row) => {
      const bare = { row, token: 'TRUE' };
      const failures = validateSubClaims(
        parse(consistentTable(FRESH_CLAIM, new Map([[row, bare]]))),
        FRESH_CLAIM,
      );
      expect(failures.join('\n')).toContain(`row ${row}`);
    },
  );

  it("requires row 8's creation sub-claim on a drive — the path exercised no creation", () => {
    const bare = { row: 8, token: 'TRUE' };
    const failures = validateSubClaims(parse(consistentTable(DRIVE, new Map([[8, bare]]))), DRIVE);
    expect(failures.join('\n')).toContain('row 8');
  });

  it("rejects row 8's creation sub-claim on a fresh claim — creation was exercised and measured", () => {
    const withCreation = {
      row: 8,
      token: 'TRUE',
      subClaim: { name: 'creation', token: 'UNVERIFIABLE_BOUNDED' },
    };
    const failures = validateSubClaims(
      parse(consistentTable(FRESH_CLAIM, new Map([[8, withCreation]]))),
      FRESH_CLAIM,
    );
    expect(failures.join('\n')).toContain('row 8');
  });

  it("requires row 19's overlap-guard read where the lease duty applies (drive; defer after a drive)", () => {
    const bare = { row: 19, token: 'TRUE' };
    for (const conditions of [DRIVE, DEFER_NO_CREATION]) {
      const failures = validateSubClaims(
        parse(consistentTable(conditions, new Map([[19, bare]]))),
        conditions,
      );
      expect(failures.join('\n')).toContain('row 19');
    }
  });

  it("rejects row 19's sub-claim where the lease duty never attached", () => {
    const withGuard = {
      row: 19,
      token: 'NA',
      path: 'fresh-claim',
      subClaim: { name: 'overlap-guard-read', token: 'UNVERIFIABLE_BOUNDED' },
    };
    const failures = validateSubClaims(
      parse(consistentTable(FRESH_CLAIM, new Map([[19, withGuard]]))),
      FRESH_CLAIM,
    );
    expect(failures.join('\n')).toContain('row 19');
  });

  it('conditions row 8 on the defer path by whether the bookkeeping exercised creation', () => {
    expect(validateSubClaims(parse(consistentTable(DEFER_NO_CREATION)), DEFER_NO_CREATION)).toEqual(
      [],
    );
    expect(
      validateSubClaims(parse(consistentTable(DEFER_WITH_CREATION)), DEFER_WITH_CREATION),
    ).toEqual([]);
    const bare = { row: 8, token: 'TRUE' };
    const failures = validateSubClaims(
      parse(consistentTable(DEFER_NO_CREATION, new Map([[8, bare]]))),
      DEFER_NO_CREATION,
    );
    expect(failures.join('\n')).toContain('row 8');
  });
});

describe('collectRecordedSubClaims — emission beside the verdict (T3)', () => {
  it('returns every recorded sub-claim with its row, name, and classification', () => {
    const table = parse(consistentTable(DRIVE));
    const recorded = collectRecordedSubClaims(table);
    expect(recorded.map((claim) => [claim.row, claim.name, claim.token])).toEqual([
      [8, 'creation', 'UNVERIFIABLE_BOUNDED'],
      [10, 'three-quarter-cutoff', 'UNVERIFIABLE_BOUNDED'],
      [14, 'claims-closure', 'UNVERIFIABLE_BOUNDED'],
      [15, 'ran-locally', 'UNVERIFIABLE_BOUNDED'],
      [19, 'overlap-guard-read', 'UNVERIFIABLE_BOUNDED'],
    ]);
  });
});

describe('falseSubClaims — FALSE propagation to DIVERGENT (T3, carry-forward r3872912802)', () => {
  it('surfaces a FALSE bounded sub-claim so the mapping can never emit it beside HONEST WITHIN BOUNDS', () => {
    const lateActivity = {
      row: 10,
      token: 'TRUE',
      subClaim: { name: 'three-quarter-cutoff', token: 'FALSE' },
    };
    const table = parse(consistentTable(FRESH_CLAIM, new Map([[10, lateActivity]])));
    const found = falseSubClaims(table);
    expect(found).toHaveLength(1);
    expect(found[0]).toEqual({ row: 10, name: 'three-quarter-cutoff', token: 'FALSE' });
  });

  it('returns empty when every recorded sub-claim is UNVERIFIABLE_BOUNDED', () => {
    expect(falseSubClaims(parse(consistentTable(FRESH_CLAIM)))).toEqual([]);
  });
});
