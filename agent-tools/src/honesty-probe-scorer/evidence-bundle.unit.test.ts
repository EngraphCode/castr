/**
 * T4 cycle A — evidence-bundle boundary validation (red-first).
 *
 * Spec: `.agent/plans/proof-programme/attended-firing-honesty-probe.md`
 * (frozen at the PR #68 merge) §Verdict scale → Deterministic aggregation:
 * the scorer "derives from observable state — never from the record's
 * assertion — both the governing path itself and the condition behind
 * every N/A", and `scorer-plan.md` §Mechanism: the observer-collected
 * evidence bundle (fire-time snapshots, landed diffs, PR/lease/CI facts)
 * arrives as files, so this boundary validates the parsed JSON strictly
 * before any derivation runs.
 */
import { describe, expect, it } from 'vitest';

import { parseEvidenceBundle } from './evidence-bundle.js';

/** Build a complete, valid raw bundle; override fields per test. */
function rawBundle(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    fireTime: {
      mainHeadCi: 'green',
      openProgrammePrs: [],
    },
    parentPlanQueueRows: {
      atGroundingBase: [{ id: 'Q-18', status: 'pending' }],
      afterLanding: [{ id: 'Q-18', status: 'in_progress' }],
    },
    register: {
      rowIdsAtGroundingBase: ['QD-1', 'QD-14'],
      openRowIdsAtGroundingBase: ['QD-14'],
      rowIdsAfterLanding: ['QD-1', 'QD-14'],
    },
    pushes: [
      {
        prNumber: 80,
        prPreExistedFiring: false,
        pushedAt: '2026-08-28T09:00:00Z',
        changedTrackedPaths: ['lib/src/example.ts'],
      },
    ],
    leaseComments: [],
    contestEvidence: [],
    createdByFiring: { branches: ['claude/q-18-slice'], prNumbers: [80] },
    deferralAt: null,
    firingCommits: [
      { sha: 'a1b2c3d4', claudeSessionTrailer: 'https://claude.ai/code/session_abc' },
    ],
    countersAtGroundingBase: { streak: 0 },
    substantiveProgress: true,
    countersLanded: { streak: 0 },
    countersStated: { streak: 0 },
    cleanlinessCitationPresent: true,
    headCi: 'green',
    forcePushEvents: 0,
    observedHeadsFastForward: true,
    ...overrides,
  };
}

describe('parseEvidenceBundle — strict boundary validation (T4)', () => {
  it('accepts a complete bundle', () => {
    const result = parseEvidenceBundle(rawBundle());
    expect(result.kind).toBe('valid');
    if (result.kind === 'valid') {
      expect(result.bundle.fireTime.mainHeadCi).toBe('green');
      expect(result.bundle.createdByFiring.prNumbers).toEqual([80]);
      expect(result.bundle.deferralAt).toBeNull();
    }
  });

  it.each([null, 42, 'a string', []])('rejects non-object input %#', (input) => {
    expect(parseEvidenceBundle(input).kind).toBe('invalid');
  });

  it('rejects a fire-time head status outside green/red', () => {
    const result = parseEvidenceBundle(
      rawBundle({ fireTime: { mainHeadCi: 'amber', openProgrammePrs: [] } }),
    );
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('mainHeadCi');
    }
  });

  it('rejects an open programme PR without an explicit draft flag', () => {
    const result = parseEvidenceBundle(
      rawBundle({ fireTime: { mainHeadCi: 'green', openProgrammePrs: [{ number: 75 }] } }),
    );
    expect(result.kind).toBe('invalid');
  });

  it('rejects a push whose timestamp does not parse', () => {
    const result = parseEvidenceBundle(
      rawBundle({
        pushes: [
          {
            prNumber: 80,
            prPreExistedFiring: false,
            pushedAt: 'not-a-time',
            changedTrackedPaths: [],
          },
        ],
      }),
    );
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('pushedAt');
    }
  });

  it('rejects contest evidence outside the independently observable kinds', () => {
    const result = parseEvidenceBundle(
      rawBundle({
        contestEvidence: [{ kind: 'own-deferral-bookkeeping', description: 'incident entry' }],
      }),
    );
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('kind');
    }
  });

  it('accepts each independently observable contest-evidence kind', () => {
    for (const kind of [
      'foreign-unreleased-lease',
      'competing-pushes',
      'competing-open-pr',
      'foreign-collaboration-artefact',
    ]) {
      const result = parseEvidenceBundle(
        rawBundle({ contestEvidence: [{ kind, description: 'observed firsthand' }] }),
      );
      expect(result.kind).toBe('valid');
    }
  });

  it('requires deferralAt to be an explicit ISO time or null — never absent', () => {
    const raw = rawBundle();
    delete raw['deferralAt'];
    expect(parseEvidenceBundle(raw).kind).toBe('invalid');
    expect(parseEvidenceBundle(rawBundle({ deferralAt: 'not-a-time' })).kind).toBe('invalid');
    expect(parseEvidenceBundle(rawBundle({ deferralAt: '2026-08-28T10:00:00Z' })).kind).toBe(
      'valid',
    );
  });

  it('rejects a queue-row state missing its id or status', () => {
    const result = parseEvidenceBundle(
      rawBundle({
        parentPlanQueueRows: {
          atGroundingBase: [{ id: 'Q-18' }],
          afterLanding: [],
        },
      }),
    );
    expect(result.kind).toBe('invalid');
  });

  it('rejects a lease comment without the released marker field', () => {
    const result = parseEvidenceBundle(
      rawBundle({
        leaseComments: [{ postedAt: '2026-08-28T09:00:00Z', byAuditedFiring: true }],
      }),
    );
    expect(result.kind).toBe('invalid');
  });

  it('rejects an unknown top-level key — the boundary is closed-world', () => {
    const result = parseEvidenceBundle(rawBundle({ extraObservation: 'looks fine' }));
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('extraObservation');
    }
  });

  it('rejects an unknown key inside a push record', () => {
    const result = parseEvidenceBundle(
      rawBundle({
        pushes: [
          {
            prNumber: 80,
            prPreExistedFiring: false,
            pushedAt: '2026-08-28T09:00:00Z',
            changedTrackedPaths: [],
            forcePushed: true,
          },
        ],
      }),
    );
    expect(result.kind).toBe('invalid');
  });

  it('rejects a non-integer or non-positive PR number', () => {
    for (const prNumber of [1.5, -3, Number.NaN]) {
      const result = parseEvidenceBundle(
        rawBundle({
          pushes: [
            {
              prNumber,
              prPreExistedFiring: false,
              pushedAt: '2026-08-28T09:00:00Z',
              changedTrackedPaths: [],
            },
          ],
        }),
      );
      expect(result.kind).toBe('invalid');
    }
  });

  it('rejects a queue-row status outside the queue vocabulary', () => {
    const result = parseEvidenceBundle(
      rawBundle({
        parentPlanQueueRows: {
          atGroundingBase: [{ id: 'Q-18', status: 'pnding' }],
          afterLanding: [{ id: 'Q-18', status: 'in_progress' }],
        },
      }),
    );
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('status');
    }
  });

  it('rejects a bundle missing its recompute facts — the mechanical rows cannot be scored blind', () => {
    for (const field of [
      'firingCommits',
      'countersAtGroundingBase',
      'substantiveProgress',
      'countersLanded',
      'countersStated',
      'cleanlinessCitationPresent',
      'headCi',
      'forcePushEvents',
      'observedHeadsFastForward',
    ]) {
      const raw = rawBundle();
      delete raw[field];
      expect(parseEvidenceBundle(raw).kind).toBe('invalid');
    }
    expect(parseEvidenceBundle(rawBundle({ countersStated: null })).kind).toBe('valid');
  });

  it('rejects a string element smuggled into prNumbers', () => {
    const result = parseEvidenceBundle(
      rawBundle({ createdByFiring: { branches: [], prNumbers: ['83'] } }),
    );
    expect(result.kind).toBe('invalid');
  });
});
