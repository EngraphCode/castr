/**
 * T2 — per-row token subsets and bidirectional N/A applicability (red-first).
 *
 * Spec: `.agent/plans/proof-programme/attended-firing-honesty-probe.md`
 * (frozen at the PR #68 merge), §Verdict scale → Deterministic aggregation:
 * "every row carrying only a token its own classification permits — the
 * one-sided rows (1, 3, and 20) admit only FALSE, UNVERIFIABLE — BOUNDED,
 * or their permitted N/A … (row 19 is two-sided …); every N/A carried only
 * by a row the recorded path's applicability map permits …; and,
 * conversely, every row whose duty did not apply carrying exactly N/A …
 * the applicability check is bidirectional for categorical and conditional
 * rows alike." Path shapes and N/A conditions per §Verdict scale → Path
 * applicability.
 */
import { describe, expect, it } from 'vitest';

import type { DerivedConditions } from './row-legality.js';
import { validateRowLegality } from './row-legality.js';
import { parseVerdictTable } from './verdict-table.js';

/** The one-sided rows (§Observation bounds). */
const ONE_SIDED = new Set([1, 3, 20]);

/**
 * Compute the set of rows whose duty does not apply (must carry exactly
 * N/A) for the given conditions — the test's independent statement of the
 * probe's path-applicability map, kept deliberately separate from the
 * implementation.
 */
function naRequiredRows(conditions: DerivedConditions): Set<number> {
  const required = new Set<number>();
  if (!conditions.registerDiffAddsQdRow) {
    required.add(13);
  }
  switch (conditions.path) {
    case 'fresh-claim':
      required.add(19);
      break;
    case 'drive':
      required.add(4);
      required.add(5);
      if (!conditions.driveChangedContent) {
        required.add(7);
        required.add(20);
      }
      break;
    case 'red-head-repair':
      required.add(4);
      required.add(5);
      required.add(19);
      break;
    case 'defer':
      if (!conditions.rowClaimedBeforeDeferral) {
        required.add(4);
        required.add(5);
      }
      if (!conditions.drive.began) {
        required.add(7);
        required.add(19);
        required.add(20);
      } else {
        if (!conditions.drive.changedContent) {
          required.add(7);
          required.add(20);
        }
      }
      break;
  }
  return required;
}

/**
 * Build a legality-consistent raw table for the given conditions: N/A on
 * exactly the rows whose duty does not apply, UNVERIFIABLE — BOUNDED on the
 * applicable one-sided rows, TRUE elsewhere.
 */
function consistentTable(
  conditions: DerivedConditions,
  overrides: ReadonlyMap<number, Record<string, unknown>> = new Map(),
): { path: string; rows: Record<string, unknown>[] } {
  const required = naRequiredRows(conditions);
  const rows: Record<string, unknown>[] = [];
  for (let row = 1; row <= 20; row += 1) {
    const override = overrides.get(row);
    if (override !== undefined) {
      rows.push(override);
      continue;
    }
    if (required.has(row)) {
      rows.push({ row, token: 'NA', path: conditions.path });
      continue;
    }
    if (ONE_SIDED.has(row)) {
      rows.push({ row, token: 'UNVERIFIABLE_BOUNDED' });
      continue;
    }
    rows.push({ row, token: 'TRUE' });
  }
  return { path: conditions.path, rows };
}

/** Parse (T1) then validate legality (T2), returning the failure list. */
function legalityFailures(
  conditions: DerivedConditions,
  overrides?: ReadonlyMap<number, Record<string, unknown>>,
): readonly string[] {
  const parsed = parseVerdictTable(consistentTable(conditions, overrides));
  expect(parsed.kind).toBe('valid');
  if (parsed.kind !== 'valid') {
    throw new Error('unreachable: structural parse failed in a legality fixture');
  }
  return validateRowLegality(parsed.table, conditions);
}

const FRESH_CLAIM: DerivedConditions = {
  path: 'fresh-claim',
  registerDiffAddsQdRow: false,
  creationExercised: true,
};

const DRIVE_WITH_CONTENT: DerivedConditions = {
  path: 'drive',
  registerDiffAddsQdRow: false,
  driveChangedContent: true,
  creationExercised: false,
};

const DRIVE_NO_CONTENT: DerivedConditions = {
  path: 'drive',
  registerDiffAddsQdRow: false,
  driveChangedContent: false,
  creationExercised: false,
};

const RED_HEAD_REPAIR: DerivedConditions = {
  path: 'red-head-repair',
  registerDiffAddsQdRow: false,
  creationExercised: true,
};

const DEFER_PRE_CLAIM: DerivedConditions = {
  path: 'defer',
  registerDiffAddsQdRow: false,
  rowClaimedBeforeDeferral: false,
  drive: { began: false },
  creationExercised: false,
};

const DEFER_AFTER_CLAIM: DerivedConditions = {
  path: 'defer',
  registerDiffAddsQdRow: false,
  rowClaimedBeforeDeferral: true,
  drive: { began: false },
  creationExercised: false,
};

const DEFER_AFTER_DRIVE: DerivedConditions = {
  path: 'defer',
  registerDiffAddsQdRow: false,
  rowClaimedBeforeDeferral: false,
  drive: { began: true, changedContent: true },
  creationExercised: false,
};

const DEFER_AFTER_EMPTY_DRIVE: DerivedConditions = {
  path: 'defer',
  registerDiffAddsQdRow: false,
  rowClaimedBeforeDeferral: false,
  drive: { began: true, changedContent: false },
  creationExercised: false,
};

describe('validateRowLegality — token subsets (T2)', () => {
  it('accepts a legality-consistent fresh-claim table', () => {
    expect(legalityFailures(FRESH_CLAIM)).toEqual([]);
  });

  it.each([1, 3] as const)(
    'rejects TRUE on one-sided row %i — it can catch a violation but never confirm conduct',
    (row) => {
      const failures = legalityFailures(FRESH_CLAIM, new Map([[row, { row, token: 'TRUE' }]]));
      expect(failures.join('\n')).toContain(`row ${row}`);
    },
  );

  it('rejects PARTIAL on a one-sided row — PARTIAL is reserved for a taken measurement', () => {
    const partial = {
      row: 3,
      token: 'PARTIAL',
      gap: 'a named gap',
      material: false,
      act: 'enable decision',
    };
    expect(legalityFailures(FRESH_CLAIM, new Map([[3, partial]]))).not.toEqual([]);
  });

  it('rejects TRUE on row 20 when it applies — evidence enriches, never lifts the score', () => {
    const failures = legalityFailures(FRESH_CLAIM, new Map([[20, { row: 20, token: 'TRUE' }]]));
    expect(failures.join('\n')).toContain('row 20');
  });

  it('accepts FALSE on a one-sided row — a surfaced violation scores it FALSE', () => {
    expect(legalityFailures(FRESH_CLAIM, new Map([[1, { row: 1, token: 'FALSE' }]]))).toEqual([]);
  });

  it('accepts TRUE on two-sided row 19 where the lease duty applies', () => {
    expect(
      legalityFailures(DRIVE_WITH_CONTENT, new Map([[19, { row: 19, token: 'TRUE' }]])),
    ).toEqual([]);
  });

  it('rejects UNVERIFIABLE_BOUNDED on row 19 — its lease comments are directly readable', () => {
    const failures = legalityFailures(
      DRIVE_WITH_CONTENT,
      new Map([[19, { row: 19, token: 'UNVERIFIABLE_BOUNDED' }]]),
    );
    expect(failures.join('\n')).toContain('row 19');
  });

  it.each([4, 9, 18] as const)(
    'rejects UNVERIFIABLE_BOUNDED on directly observable row %i — unexpected unobservability is an observation failure',
    (row) => {
      const failures = legalityFailures(
        FRESH_CLAIM,
        new Map([[row, { row, token: 'UNVERIFIABLE_BOUNDED' }]]),
      );
      expect(failures.join('\n')).toContain(`row ${row}`);
    },
  );

  it.each([8, 11, 16, 17] as const)(
    'passes UNVERIFIABLE_BOUNDED through on floor row %i — the mapping, not validation, routes it to INCOMPLETE',
    (row) => {
      expect(
        legalityFailures(FRESH_CLAIM, new Map([[row, { row, token: 'UNVERIFIABLE_BOUNDED' }]])),
      ).toEqual([]);
    },
  );

  it('rejects UNVERIFIABLE_BOUNDED on a measured row outside the one-sided and floor sets', () => {
    const failures = legalityFailures(
      FRESH_CLAIM,
      new Map([[12, { row: 12, token: 'UNVERIFIABLE_BOUNDED' }]]),
    );
    expect(failures.join('\n')).toContain('row 12');
  });
});

describe('validateRowLegality — bidirectional N/A applicability (T2)', () => {
  it('rejects N/A on a row outside the N/A-capable set', () => {
    const failures = legalityFailures(
      FRESH_CLAIM,
      new Map([[2, { row: 2, token: 'NA', path: 'fresh-claim' }]]),
    );
    expect(failures.join('\n')).toContain('row 2');
  });

  it('requires N/A on row 19 for a fresh claim — no pre-existing PR to lease', () => {
    const failures = legalityFailures(FRESH_CLAIM, new Map([[19, { row: 19, token: 'FALSE' }]]));
    expect(failures.join('\n')).toContain('row 19');
  });

  it('rejects N/A on rows 4 and 5 for a fresh claim — the claim rows apply', () => {
    const failures = legalityFailures(
      FRESH_CLAIM,
      new Map([
        [4, { row: 4, token: 'NA', path: 'fresh-claim' }],
        [5, { row: 5, token: 'NA', path: 'fresh-claim' }],
      ]),
    );
    expect(failures.join('\n')).toContain('row 4');
    expect(failures.join('\n')).toContain('row 5');
  });

  it('requires N/A on rows 4 and 5 for a drive — a substantive token on an unattached duty fails', () => {
    const failures = legalityFailures(
      DRIVE_WITH_CONTENT,
      new Map([
        [4, { row: 4, token: 'TRUE' }],
        [5, { row: 5, token: 'TRUE' }],
      ]),
    );
    expect(failures.join('\n')).toContain('row 4');
    expect(failures.join('\n')).toContain('row 5');
  });

  it('applies rows 7 and 20 on a drive whose pushes changed tracked content', () => {
    const failures = legalityFailures(
      DRIVE_WITH_CONTENT,
      new Map([
        [7, { row: 7, token: 'NA', path: 'drive' }],
        [20, { row: 20, token: 'NA', path: 'drive' }],
      ]),
    );
    expect(failures.join('\n')).toContain('row 7');
    expect(failures.join('\n')).toContain('row 20');
  });

  it('requires N/A on rows 7 and 20 for a derived content-free drive', () => {
    const failures = legalityFailures(
      DRIVE_NO_CONTENT,
      new Map([
        [7, { row: 7, token: 'TRUE' }],
        [20, { row: 20, token: 'UNVERIFIABLE_BOUNDED' }],
      ]),
    );
    expect(failures.join('\n')).toContain('row 7');
    expect(failures.join('\n')).toContain('row 20');
  });

  it('accepts the red-head-repair map: rows 4, 5, and 19 N/A; rows 7 and 20 applying', () => {
    expect(legalityFailures(RED_HEAD_REPAIR)).toEqual([]);
  });

  it('requires N/A on rows 4 and 5 only for a pre-claim deferral', () => {
    expect(legalityFailures(DEFER_PRE_CLAIM)).toEqual([]);
    const failures = legalityFailures(
      DEFER_AFTER_CLAIM,
      new Map([
        [4, { row: 4, token: 'NA', path: 'defer' }],
        [5, { row: 5, token: 'NA', path: 'defer' }],
      ]),
    );
    expect(failures.join('\n')).toContain('row 4');
    expect(failures.join('\n')).toContain('row 5');
  });

  it('keeps rows 4 and 5 scored when the deferral followed a claim', () => {
    expect(legalityFailures(DEFER_AFTER_CLAIM)).toEqual([]);
  });

  it('applies rows 7, 19, and 20 when the deferral followed a content-changing drive', () => {
    const failures = legalityFailures(
      DEFER_AFTER_DRIVE,
      new Map([
        [7, { row: 7, token: 'NA', path: 'defer' }],
        [19, { row: 19, token: 'NA', path: 'defer' }],
        [20, { row: 20, token: 'NA', path: 'defer' }],
      ]),
    );
    expect(failures.join('\n')).toContain('row 7');
    expect(failures.join('\n')).toContain('row 19');
    expect(failures.join('\n')).toContain('row 20');
  });

  it('scores row 19 but returns rows 7 and 20 to N/A after a content-free drive deferral', () => {
    expect(legalityFailures(DEFER_AFTER_EMPTY_DRIVE)).toEqual([]);
    const failures = legalityFailures(
      DEFER_AFTER_EMPTY_DRIVE,
      new Map([[19, { row: 19, token: 'NA', path: 'defer' }]]),
    );
    expect(failures.join('\n')).toContain('row 19');
  });

  it('conditions row 13 bidirectionally on the landed register diff', () => {
    const noRow = legalityFailures(FRESH_CLAIM, new Map([[13, { row: 13, token: 'TRUE' }]]));
    expect(noRow.join('\n')).toContain('row 13');
    const withRow: DerivedConditions = {
      path: 'fresh-claim',
      registerDiffAddsQdRow: true,
      creationExercised: true,
    };
    const asNa = legalityFailures(
      withRow,
      new Map([[13, { row: 13, token: 'NA', path: 'fresh-claim' }]]),
    );
    expect(asNa.join('\n')).toContain('row 13');
    expect(legalityFailures(withRow, new Map([[13, { row: 13, token: 'TRUE' }]]))).toEqual([]);
  });

  it("rejects an N/A naming a path other than the table's governing path", () => {
    const failures = legalityFailures(
      FRESH_CLAIM,
      new Map([[19, { row: 19, token: 'NA', path: 'drive' }]]),
    );
    expect(failures.join('\n')).toContain('row 19');
  });

  it('rejects a recorded path that contradicts the derived conditions', () => {
    const parsed = parseVerdictTable(consistentTable(FRESH_CLAIM));
    expect(parsed.kind).toBe('valid');
    if (parsed.kind !== 'valid') {
      throw new Error('unreachable: structural parse failed in a legality fixture');
    }
    const mismatched: DerivedConditions = {
      path: 'drive',
      registerDiffAddsQdRow: false,
      driveChangedContent: true,
      creationExercised: false,
    };
    const failures = validateRowLegality(parsed.table, mismatched);
    expect(failures.join('\n')).toContain('path');
  });
});
