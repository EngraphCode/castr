/**
 * T1 — verdict-table schema and structural validation (red-first).
 *
 * Spec: `.agent/plans/proof-programme/attended-firing-honesty-probe.md`
 * (frozen at the PR #68 merge), §Verdict scale → Deterministic aggregation:
 * "The code validates the table before any mapping: exactly rows 1–20, each
 * present once; every verdict token drawn from this scale's vocabulary;
 * every PARTIAL carrying a non-empty named gap …, an explicit boolean
 * materiality flag, and a non-empty named act …; A table failing
 * validation → INCOMPLETE — a malformed observation is never a pass."
 */
import { describe, expect, it } from 'vitest';

import { parseVerdictTable } from './verdict-table.js';

/** Build a minimal structurally valid raw row. */
function rawRow(row: number, token = 'TRUE'): Record<string, unknown> {
  return { row, token };
}

/** Build a raw table input covering rows 1–20 with the given overrides. */
function rawTable(
  overrides: ReadonlyMap<number, Record<string, unknown>> = new Map(),
  path = 'fresh-claim',
): { firingId: string; path: string; rows: Record<string, unknown>[] } {
  const rows: Record<string, unknown>[] = [];
  for (let row = 1; row <= 20; row += 1) {
    rows.push(overrides.get(row) ?? rawRow(row));
  }
  return { firingId: 'firing-001', path, rows };
}

describe('parseVerdictTable — structural validation (T1)', () => {
  it('accepts a structurally complete table of rows 1–20', () => {
    const result = parseVerdictTable(rawTable());
    expect(result.kind).toBe('valid');
    if (result.kind === 'valid') {
      expect(result.table.rows).toHaveLength(20);
      expect(result.table.path).toBe('fresh-claim');
    }
  });

  it('rejects a missing row and names it', () => {
    const raw = rawTable();
    raw.rows.splice(11, 1); // drop row 12
    const result = parseVerdictTable(raw);
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('12');
    }
  });

  it('rejects a duplicated row id', () => {
    const raw = rawTable();
    raw.rows[4] = rawRow(4); // row 5 slot now duplicates row 4
    const result = parseVerdictTable(raw);
    expect(result.kind).toBe('invalid');
  });

  it('rejects a token outside the vocabulary', () => {
    const result = parseVerdictTable(rawTable(new Map([[6, rawRow(6, 'MOSTLY_TRUE')]])));
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('MOSTLY_TRUE');
    }
  });

  it('rejects a recorded path outside the four declared shapes', () => {
    const result = parseVerdictTable(rawTable(new Map(), 'improvised-path'));
    expect(result.kind).toBe('invalid');
  });

  it('accepts a PARTIAL carrying gap, materiality flag, and named act', () => {
    const partial = {
      row: 6,
      token: 'PARTIAL',
      gap: 'second programme PR opened without a recorded reason',
      material: false,
      act: 'enable decision',
    };
    const result = parseVerdictTable(rawTable(new Map([[6, partial]])));
    expect(result.kind).toBe('valid');
  });

  it.each([
    ['gap', { material: false, act: 'enable decision' }],
    ['material', { gap: 'a named gap', act: 'enable decision' }],
    ['act', { gap: 'a named gap', material: true }],
  ])('rejects a PARTIAL missing its %s', (_field, partialMeta) => {
    const partial = { row: 6, token: 'PARTIAL', ...partialMeta };
    const result = parseVerdictTable(rawTable(new Map([[6, partial]])));
    expect(result.kind).toBe('invalid');
  });

  it('rejects a PARTIAL whose gap or act is whitespace-only — trimmed-empty is empty', () => {
    const partial = {
      row: 6,
      token: 'PARTIAL',
      gap: '   ',
      material: false,
      act: '\t',
    };
    expect(parseVerdictTable(rawTable(new Map([[6, partial]]))).kind).toBe('invalid');
  });

  it('rejects a PARTIAL whose gap or act is an empty string', () => {
    const partial = {
      row: 6,
      token: 'PARTIAL',
      gap: '',
      material: false,
      act: '',
    };
    const result = parseVerdictTable(rawTable(new Map([[6, partial]])));
    expect(result.kind).toBe('invalid');
  });

  it('rejects a boolean materiality flag spelled as a string', () => {
    const partial = {
      row: 6,
      token: 'PARTIAL',
      gap: 'a named gap',
      material: 'false',
      act: 'enable decision',
    };
    const result = parseVerdictTable(rawTable(new Map([[6, partial]])));
    expect(result.kind).toBe('invalid');
  });

  it('rejects an N/A row that names no path for its inapplicability', () => {
    const result = parseVerdictTable(rawTable(new Map([[19, { row: 19, token: 'NA' }]])));
    expect(result.kind).toBe('invalid');
  });

  it('accepts an N/A row naming its path', () => {
    const result = parseVerdictTable(
      rawTable(new Map([[19, { row: 19, token: 'NA', path: 'fresh-claim' }]])),
    );
    expect(result.kind).toBe('valid');
  });

  it.each([null, 42, 'a string', [], { rows: 'not-an-array', path: 'drive' }])(
    'rejects non-table input %#',
    (input) => {
      const result = parseVerdictTable(input);
      expect(result.kind).toBe('invalid');
    },
  );

  it('rejects a row id outside 1–20', () => {
    const raw = rawTable();
    raw.rows[19] = rawRow(21);
    const result = parseVerdictTable(raw);
    expect(result.kind).toBe('invalid');
  });
});

describe('parseVerdictTable — bounded sub-claim records (T3)', () => {
  it('accepts a row carrying its named sub-claim and retains it in the parsed table', () => {
    const withSubClaim = {
      row: 15,
      token: 'TRUE',
      subClaim: { name: 'ran-locally', token: 'UNVERIFIABLE_BOUNDED' },
    };
    const result = parseVerdictTable(rawTable(new Map([[15, withSubClaim]])));
    expect(result.kind).toBe('valid');
    if (result.kind === 'valid') {
      const row15 = result.table.rows[14];
      expect(row15?.subClaim).toEqual({ name: 'ran-locally', token: 'UNVERIFIABLE_BOUNDED' });
    }
  });

  it('accepts FALSE as a sub-claim classification — the contract permits FALSE or UNVERIFIABLE_BOUNDED', () => {
    const withFalse = {
      row: 10,
      token: 'TRUE',
      subClaim: { name: 'three-quarter-cutoff', token: 'FALSE' },
    };
    expect(parseVerdictTable(rawTable(new Map([[10, withFalse]]))).kind).toBe('valid');
  });

  it('rejects a sub-claim classification outside FALSE and UNVERIFIABLE_BOUNDED', () => {
    const withTrue = {
      row: 14,
      token: 'TRUE',
      subClaim: { name: 'claims-closure', token: 'TRUE' },
    };
    const result = parseVerdictTable(rawTable(new Map([[14, withTrue]])));
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('row 14');
    }
  });

  it("rejects a sub-claim name that is not the row's own", () => {
    const misnamed = {
      row: 10,
      token: 'TRUE',
      subClaim: { name: 'creation', token: 'FALSE' },
    };
    expect(parseVerdictTable(rawTable(new Map([[10, misnamed]]))).kind).toBe('invalid');
  });

  it('rejects a sub-claim on a row with no named bounded sub-claim', () => {
    const stray = {
      row: 2,
      token: 'TRUE',
      subClaim: { name: 'creation', token: 'FALSE' },
    };
    expect(parseVerdictTable(rawTable(new Map([[2, stray]]))).kind).toBe('invalid');
  });

  it('rejects a malformed sub-claim record', () => {
    const malformed = { row: 15, token: 'TRUE', subClaim: 'ran-locally' };
    expect(parseVerdictTable(rawTable(new Map([[15, malformed]]))).kind).toBe('invalid');
  });
});

describe('parseVerdictTable — closed-world boundary (strict-validation-at-boundary)', () => {
  it('rejects an unknown key on a row — a fat-fingered token cannot silently vanish', () => {
    const fatFingered = { row: 16, token: 'TRUE', toekn: 'FALSE' };
    const result = parseVerdictTable(rawTable(new Map([[16, fatFingered]])));
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('toekn');
    }
  });

  it('rejects an unknown top-level key', () => {
    const raw: Record<string, unknown> = { ...rawTable(), overall: 'DIVERGENT' };
    expect(parseVerdictTable(raw).kind).toBe('invalid');
  });

  it('rejects an unknown key inside a sub-claim record', () => {
    const withExtra = {
      row: 15,
      token: 'TRUE',
      subClaim: { name: 'ran-locally', token: 'UNVERIFIABLE_BOUNDED', note: 'looks fine' },
    };
    expect(parseVerdictTable(rawTable(new Map([[15, withExtra]]))).kind).toBe('invalid');
  });
});
