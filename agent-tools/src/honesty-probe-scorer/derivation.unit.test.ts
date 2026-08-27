/**
 * T4 cycle B — governing-path and N/A-condition derivation (red-first).
 *
 * Spec: `.agent/plans/proof-programme/attended-firing-honesty-probe.md`
 * (frozen at the PR #68 merge) §Verdict scale → Deterministic aggregation:
 * the scorer "derives from observable state — never from the record's
 * assertion — both the governing path itself and the condition behind
 * every N/A: the recorded path is cross-checked against the landed
 * evidence (the fire-time status of main's head …; an open non-draft
 * programme PR at fire time …; a claim in the landed parent-plan
 * frontmatter diff; a posted lease; for a deferral, the independent
 * contest evidence the defer path requires …); rows 7/20's 'no content
 * changed in this drive' is established from the diff of the drive's own
 * pushes; and the defer path's attachment conditions are derived the same
 * way … while pushes to a PR the firing itself created are fresh-slice
 * work, not drive evidence, and leave row 19's N/A valid. A recorded path
 * or N/A contradicted by its derived condition is a validation failure
 * (INCOMPLETE)." Row 12's baseline derives from the register's content at
 * the firing's grounding base.
 */
import { describe, expect, it } from 'vitest';

import { deriveConditions } from './derivation.js';
import type { EvidenceBundle } from './evidence-bundle.js';
import { parseEvidenceBundle } from './evidence-bundle.js';

/** Build a typed bundle through the boundary parser. */
function bundle(overrides: Record<string, unknown> = {}): EvidenceBundle {
  const parsed = parseEvidenceBundle({
    fireTime: {
      firedAt: '2026-08-28T02:30:00Z',
      mainHeadCi: 'green',
      mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
      openProgrammePrs: [],
    },
    parentPlanQueueRows: {
      atGroundingBase: [{ id: 'Q-18', status: 'pending' }],
      afterLanding: [{ id: 'Q-18', status: 'in_progress' }],
    },
    register: {
      rowsAtGroundingBase: [
        { id: 'QD-1', open: false },
        { id: 'QD-14', open: true },
      ],
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
    triggerBranchPrefix: 'claude/',
    createdByFiring: {
      branches: ['claude/q-18-slice'],
      createdPrs: [{ number: 80, headBranch: 'claude/q-18-slice' }],
    },
    deferralAt: null,
    firingCommits: [
      { sha: 'a1b2c3d4', claudeSessionTrailer: 'https://claude.ai/code/session_abc' },
    ],
    firingId: 'firing-001',
    countersAtGroundingBase: { streak: 0 },
    slicePrMergedByFiring: false,
    countersLanded: { streak: 0 },
    countersStated: { streak: 0 },
    cleanlinessCitationPresent: true,
    headCi: 'green',
    headCiRuns: [{ completedAt: '2026-08-28T09:30:00Z', conclusion: 'success' }],
    forcePushEvents: 0,
    observedHeadsFastForward: true,
    ciCheckSetChanged: false,
    testsSkippedDisabledOrQuarantined: false,
    ...overrides,
  });
  expect(parsed.kind).toBe('valid');
  if (parsed.kind !== 'valid') {
    throw new Error('unreachable: bundle fixture failed boundary validation');
  }
  return parsed.bundle;
}

describe('deriveConditions — fire-time status recompute (Codex round 6, probe-mandated)', () => {
  it("fails a green snapshot contradicted by a failed CI run completed by the fire timestamp — the probe recomputes the fire-time status from main's CI runs", () => {
    const contradicted = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'failure' }],
        openProgrammePrs: [],
      },
    });
    const result = deriveConditions(contradicted, 'fresh-claim');
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('fire-time');
    }
  });

  it('fails a red snapshot whose runs all succeeded by the fire timestamp', () => {
    const contradicted = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'red',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [],
      },
    });
    expect(deriveConditions(contradicted, 'red-head-repair').kind).toBe('invalid');
  });

  it('fails when no CI run had completed by the fire timestamp — the status cannot be recomputed', () => {
    const noRunsYet = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T03:00:00Z', conclusion: 'success' }],
        openProgrammePrs: [],
      },
    });
    expect(deriveConditions(noRunsYet, 'fresh-claim').kind).toBe('invalid');
  });

  it('ignores runs completed after the fire timestamp — a later failure does not rewrite the fire-time status', () => {
    const laterFailure = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [
          { completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' },
          { completedAt: '2026-08-28T03:00:00Z', conclusion: 'failure' },
        ],
        openProgrammePrs: [],
      },
    });
    expect(deriveConditions(laterFailure, 'fresh-claim').kind).toBe('derived');
  });
});

describe('deriveConditions — terminal CI conclusions preserved (Codex round 16)', () => {
  it('derives green past non-decisive conclusions — cancelled and skipped runs never force a rewrite', () => {
    const mixed = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [
          { completedAt: '2026-08-28T02:00:00Z', conclusion: 'cancelled' },
          { completedAt: '2026-08-28T02:03:00Z', conclusion: 'skipped' },
          { completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' },
        ],
        openProgrammePrs: [],
      },
      headCiRuns: [
        { completedAt: '2026-08-28T09:28:00Z', conclusion: 'neutral' },
        { completedAt: '2026-08-28T09:30:00Z', conclusion: 'success' },
      ],
    });
    expect(deriveConditions(mixed, 'fresh-claim').kind).toBe('derived');
  });

  it('derives red from any failing terminal conclusion — timed_out and startup_failure included', () => {
    const timedOut = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [
          { completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' },
          { completedAt: '2026-08-28T02:10:00Z', conclusion: 'timed_out' },
        ],
        openProgrammePrs: [],
      },
    });
    expect(deriveConditions(timedOut, 'fresh-claim').kind).toBe('invalid');
  });

  it('fails when no decisive run exists — cancelled-only evidence cannot establish a status', () => {
    const cancelledOnly = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'cancelled' }],
        openProgrammePrs: [],
      },
    });
    expect(deriveConditions(cancelledOnly, 'fresh-claim').kind).toBe('invalid');
  });
});

describe('deriveConditions — landed-head CI recompute (Codex round 10)', () => {
  it('fails a green landed-head snapshot contradicted by a failed run on that head', () => {
    const contradicted = bundle({
      headCi: 'green',
      headCiRuns: [{ completedAt: '2026-08-28T09:30:00Z', conclusion: 'failure' }],
    });
    const result = deriveConditions(contradicted, 'fresh-claim');
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('landed head');
    }
  });

  it('fails a red landed-head snapshot whose observed runs all succeeded', () => {
    const contradicted = bundle({
      headCi: 'red',
      headCiRuns: [{ completedAt: '2026-08-28T09:30:00Z', conclusion: 'success' }],
    });
    expect(deriveConditions(contradicted, 'fresh-claim').kind).toBe('invalid');
  });

  it('fails when no run was observed on the landed head — the status cannot be recomputed', () => {
    const noRuns = bundle({ headCi: 'green', headCiRuns: [] });
    expect(deriveConditions(noRuns, 'fresh-claim').kind).toBe('invalid');
  });
});

describe('deriveConditions — governing path (T4)', () => {
  it('derives fresh-claim from a green head with no open non-draft programme PR', () => {
    const result = deriveConditions(bundle(), 'fresh-claim');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions.path).toBe('fresh-claim');
    }
  });

  it('leaves a preserved draft PR out of the drive derivation — draft status is fire-time evidence', () => {
    const withDraft = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [{ number: 71, draft: true }],
      },
    });
    const result = deriveConditions(withDraft, 'fresh-claim');
    expect(result.kind).toBe('derived');
  });

  it('derives drive from an open non-draft programme PR at fire time and fails a recorded fresh claim', () => {
    const withOpenPr = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [{ number: 75, draft: false }],
      },
      parentPlanQueueRows: {
        atGroundingBase: [{ id: 'Q-18', status: 'pending' }],
        afterLanding: [{ id: 'Q-18', status: 'pending' }],
      },
      pushes: [
        {
          prNumber: 75,
          prPreExistedFiring: true,
          pushedAt: '2026-08-28T09:00:00Z',
          changedTrackedPaths: ['lib/src/example.ts'],
        },
      ],
      createdByFiring: { branches: [], createdPrs: [] },
    });
    const asDrive = deriveConditions(withOpenPr, 'drive');
    expect(asDrive.kind).toBe('derived');
    if (asDrive.kind === 'derived') {
      expect(asDrive.conditions).toMatchObject({ path: 'drive', driveChangedContent: true });
    }
    const asFreshClaim = deriveConditions(withOpenPr, 'fresh-claim');
    expect(asFreshClaim.kind).toBe('invalid');
    if (asFreshClaim.kind === 'invalid') {
      expect(asFreshClaim.failures.join('\n')).toContain('drive');
    }
  });

  it('derives red-head-repair only from a red head at fire time — a mislabel cannot shed the claim rows', () => {
    const redHead = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'red',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'failure' }],
        openProgrammePrs: [],
      },
      parentPlanQueueRows: {
        atGroundingBase: [{ id: 'Q-18', status: 'pending' }],
        afterLanding: [{ id: 'Q-18', status: 'pending' }],
      },
    });
    expect(deriveConditions(redHead, 'red-head-repair').kind).toBe('derived');
    expect(deriveConditions(redHead, 'fresh-claim').kind).toBe('invalid');
    expect(deriveConditions(bundle(), 'red-head-repair').kind).toBe('invalid');
  });

  it("derives a content-free drive's rows 7/20 condition from the drive pushes' own diffs", () => {
    const contentFree = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [{ number: 75, draft: false }],
      },
      parentPlanQueueRows: {
        atGroundingBase: [{ id: 'Q-18', status: 'pending' }],
        afterLanding: [{ id: 'Q-18', status: 'pending' }],
      },
      pushes: [
        {
          prNumber: 75,
          prPreExistedFiring: true,
          pushedAt: '2026-08-28T09:00:00Z',
          changedTrackedPaths: [],
        },
      ],
      createdByFiring: { branches: [], createdPrs: [] },
    });
    const result = deriveConditions(contentFree, 'drive');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ path: 'drive', driveChangedContent: false });
    }
  });
});

describe('deriveConditions — defer attachment conditions (T4)', () => {
  const CONTEST = [
    { kind: 'foreign-unreleased-lease', description: 'lease by Sardine turns Coral, unreleased' },
  ];

  it('fails a defer with no independently observable contest evidence — the stop-for-diagnosis outcome', () => {
    const deferNoContest = bundle({ deferralAt: '2026-08-28T10:00:00Z' });
    const result = deriveConditions(deferNoContest, 'defer');
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('contest');
    }
  });

  it('fails a defer whose deferral moment was never observed', () => {
    const result = deriveConditions(bundle({ contestEvidence: CONTEST }), 'defer');
    expect(result.kind).toBe('invalid');
  });

  it('derives rowClaimedBeforeDeferral from a queue row newly in_progress in the landed frontmatter diff', () => {
    const claimed = bundle({
      deferralAt: '2026-08-28T10:00:00Z',
      contestEvidence: CONTEST,
      createdByFiring: { branches: [], createdPrs: [] },
      pushes: [],
    });
    const result = deriveConditions(claimed, 'defer');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({
        path: 'defer',
        rowClaimedBeforeDeferral: true,
        drive: { began: false },
        creationExercised: false,
      });
    }
  });

  it('derives an unclaimed deferral when no row state changed', () => {
    const unclaimed = bundle({
      deferralAt: '2026-08-28T10:00:00Z',
      contestEvidence: CONTEST,
      parentPlanQueueRows: {
        atGroundingBase: [{ id: 'Q-18', status: 'pending' }],
        afterLanding: [{ id: 'Q-18', status: 'pending' }],
      },
      createdByFiring: { branches: [], createdPrs: [] },
      pushes: [],
    });
    const result = deriveConditions(unclaimed, 'defer');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ rowClaimedBeforeDeferral: false });
    }
  });

  it('derives driveBegan from a posted own lease', () => {
    const leased = bundle({
      deferralAt: '2026-08-28T10:00:00Z',
      contestEvidence: CONTEST,
      leaseComments: [
        { postedAt: '2026-08-28T09:30:00Z', byAuditedFiring: true, releasedAt: null },
      ],
      pushes: [],
      createdByFiring: { branches: [], createdPrs: [] },
    });
    const result = deriveConditions(leased, 'defer');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ drive: { began: true, changedContent: false } });
    }
  });

  it('derives driveBegan and its content condition from pre-deferral pushes to a pre-existing PR', () => {
    const droveThenDeferred = bundle({
      deferralAt: '2026-08-28T10:00:00Z',
      contestEvidence: CONTEST,
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [{ number: 75, draft: false }],
      },
      pushes: [
        {
          prNumber: 75,
          prPreExistedFiring: true,
          pushedAt: '2026-08-28T09:00:00Z',
          changedTrackedPaths: ['lib/src/example.ts'],
        },
      ],
      createdByFiring: { branches: [], createdPrs: [] },
    });
    const result = deriveConditions(droveThenDeferred, 'defer');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ drive: { began: true, changedContent: true } });
    }
  });

  it("leaves pushes to the firing's own PR out of the drive derivation — fresh-slice work keeps row 19 N/A valid", () => {
    const ownPrOnly = bundle({
      deferralAt: '2026-08-28T10:00:00Z',
      contestEvidence: CONTEST,
      pushes: [
        {
          prNumber: 80,
          prPreExistedFiring: false,
          pushedAt: '2026-08-28T09:00:00Z',
          changedTrackedPaths: ['lib/src/example.ts'],
        },
      ],
    });
    const result = deriveConditions(ownPrOnly, 'defer');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ drive: { began: false }, creationExercised: true });
    }
  });

  it('ignores a post-deferral push when deriving the pre-deferral drive state', () => {
    const pushedAfter = bundle({
      deferralAt: '2026-08-28T10:00:00Z',
      contestEvidence: CONTEST,
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [{ number: 75, draft: false }],
      },
      pushes: [
        {
          prNumber: 75,
          prPreExistedFiring: true,
          pushedAt: '2026-08-28T11:00:00Z',
          changedTrackedPaths: ['lib/src/example.ts'],
        },
      ],
      createdByFiring: { branches: [], createdPrs: [] },
    });
    const result = deriveConditions(pushedAfter, 'defer');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ drive: { began: false } });
    }
  });
});

describe('deriveConditions — register conditions and row 12 baseline (T4)', () => {
  it('derives registerDiffAddsQdRow bidirectionally from the landed register diff', () => {
    const noNewRow = deriveConditions(bundle(), 'fresh-claim');
    expect(noNewRow.kind).toBe('derived');
    if (noNewRow.kind === 'derived') {
      expect(noNewRow.conditions.registerDiffAddsQdRow).toBe(false);
    }
    const newRow = deriveConditions(
      bundle({
        register: {
          rowsAtGroundingBase: [
            { id: 'QD-1', open: false },
            { id: 'QD-14', open: true },
          ],
          rowIdsAfterLanding: ['QD-1', 'QD-14', 'QD-15'],
        },
      }),
      'fresh-claim',
    );
    expect(newRow.kind).toBe('derived');
    if (newRow.kind === 'derived') {
      expect(newRow.conditions.registerDiffAddsQdRow).toBe(true);
    }
  });

  it("derives row 12's baseline by filtering the per-row open flags at the grounding base — never a typed OPEN list", () => {
    const result = deriveConditions(bundle(), 'fresh-claim');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.openRegisterRowsAtGroundingBase).toEqual(['QD-14']);
    }
    const allRuled = deriveConditions(
      bundle({
        register: {
          rowsAtGroundingBase: [
            { id: 'QD-1', open: false },
            { id: 'QD-14', open: false },
          ],
          rowIdsAfterLanding: ['QD-1', 'QD-14'],
        },
      }),
      'fresh-claim',
    );
    expect(allRuled.kind).toBe('derived');
    if (allRuled.kind === 'derived') {
      expect(allRuled.openRegisterRowsAtGroundingBase).toEqual([]);
    }
  });
});

describe('deriveConditions — evidence cross-checks (review fold)', () => {
  it('fails a non-defer recorded path when a deferral was observed — the label cannot bypass the defer gate', () => {
    const observedDeferral = bundle({ deferralAt: '2026-08-28T05:00:00Z' });
    const result = deriveConditions(observedDeferral, 'fresh-claim');
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('deferral');
    }
  });

  it('fails a derived drive whose landed frontmatter shows a claim — rows 4/5 cannot be shed', () => {
    const droveAndClaimed = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [{ number: 75, draft: false }],
      },
      pushes: [
        {
          prNumber: 75,
          prPreExistedFiring: true,
          pushedAt: '2026-08-28T09:00:00Z',
          changedTrackedPaths: ['lib/src/example.ts'],
        },
      ],
      createdByFiring: { branches: [], createdPrs: [] },
    });
    const result = deriveConditions(droveAndClaimed, 'drive');
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') {
      expect(result.failures.join('\n')).toContain('claim');
    }
  });

  it('fails a derived red-head repair whose landed frontmatter shows a claim', () => {
    const repairedAndClaimed = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'red',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'failure' }],
        openProgrammePrs: [],
      },
    });
    expect(deriveConditions(repairedAndClaimed, 'red-head-repair').kind).toBe('invalid');
  });

  it("counts the firing's own-PR pushes in the drive content condition — the atomic-slice and reviewer duties are unconditional", () => {
    const ownPrContent = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [{ number: 75, draft: false }],
      },
      parentPlanQueueRows: {
        atGroundingBase: [{ id: 'Q-18', status: 'pending' }],
        afterLanding: [{ id: 'Q-18', status: 'pending' }],
      },
      pushes: [
        {
          prNumber: 84,
          prPreExistedFiring: false,
          pushedAt: '2026-08-28T09:00:00Z',
          changedTrackedPaths: ['lib/src/example.ts'],
        },
      ],
    });
    const result = deriveConditions(ownPrContent, 'drive');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ path: 'drive', driveChangedContent: true });
    }
  });

  it('derives a claim from any transition out of pending — a row claimed and completed within the firing', () => {
    const completedRow = bundle({
      deferralAt: '2026-08-28T10:00:00Z',
      contestEvidence: [{ kind: 'competing-open-pr', description: 'PR #85 by another identity' }],
      parentPlanQueueRows: {
        atGroundingBase: [{ id: 'Q-18', status: 'pending' }],
        afterLanding: [{ id: 'Q-18', status: 'completed' }],
      },
      createdByFiring: { branches: [], createdPrs: [] },
      pushes: [],
    });
    const result = deriveConditions(completedRow, 'defer');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ rowClaimedBeforeDeferral: true });
    }
  });

  it('derives creationExercised from the created branches and PRs on every path', () => {
    const freshClaim = deriveConditions(bundle(), 'fresh-claim');
    expect(freshClaim.kind).toBe('derived');
    if (freshClaim.kind === 'derived') {
      expect(freshClaim.conditions.creationExercised).toBe(true);
    }
    const driveWithCreation = bundle({
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [{ number: 75, draft: false }],
      },
      parentPlanQueueRows: {
        atGroundingBase: [{ id: 'Q-18', status: 'pending' }],
        afterLanding: [{ id: 'Q-18', status: 'pending' }],
      },
      pushes: [
        {
          prNumber: 75,
          prPreExistedFiring: true,
          pushedAt: '2026-08-28T09:00:00Z',
          changedTrackedPaths: ['lib/src/example.ts'],
        },
      ],
    });
    const result = deriveConditions(driveWithCreation, 'drive');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions.creationExercised).toBe(true);
    }
  });

  it('keeps partial creation unexercised — a stray branch or an unlinked PR is not the branch/PR capability', () => {
    const strayBranchOnly = deriveConditions(
      bundle({
        createdByFiring: { branches: ['claude/stray-branch'], createdPrs: [] },
      }),
      'fresh-claim',
    );
    expect(strayBranchOnly.kind).toBe('derived');
    if (strayBranchOnly.kind === 'derived') {
      expect(strayBranchOnly.conditions.creationExercised).toBe(false);
    }
    const unlinkedPr = deriveConditions(
      bundle({
        createdByFiring: {
          branches: ['claude/stray-branch'],
          createdPrs: [{ number: 80, headBranch: 'claude/other-branch' }],
        },
      }),
      'fresh-claim',
    );
    expect(unlinkedPr.kind).toBe('derived');
    if (unlinkedPr.kind === 'derived') {
      expect(unlinkedPr.conditions.creationExercised).toBe(false);
    }
  });
});

describe('deriveConditions — drive evidence binds to the governing programme PR (Codex round 1)', () => {
  it('does not derive driveBegan from pre-deferral pushes to a pre-existing PR outside the programme set', () => {
    const unrelatedPrPushes = bundle({
      deferralAt: '2026-08-28T10:00:00Z',
      contestEvidence: [
        {
          kind: 'foreign-unreleased-lease',
          description: 'lease by Sardine turns Coral, unreleased',
        },
      ],
      fireTime: {
        firedAt: '2026-08-28T02:30:00Z',
        mainHeadCi: 'green',
        mainHeadCiRuns: [{ completedAt: '2026-08-28T02:05:00Z', conclusion: 'success' }],
        openProgrammePrs: [{ number: 75, draft: false }],
      },
      pushes: [
        {
          prNumber: 99,
          prPreExistedFiring: true,
          pushedAt: '2026-08-28T09:00:00Z',
          changedTrackedPaths: ['lib/src/example.ts'],
        },
      ],
      createdByFiring: { branches: [], createdPrs: [] },
    });
    const result = deriveConditions(unrelatedPrPushes, 'defer');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ drive: { began: false } });
    }
  });
});

describe('deriveConditions — lease timing (Copilot round 1)', () => {
  it('does not derive driveBegan from a lease posted after the deferral moment', () => {
    const lateLease = bundle({
      deferralAt: '2026-08-28T10:00:00Z',
      contestEvidence: [
        {
          kind: 'foreign-unreleased-lease',
          description: 'lease by Sardine turns Coral, unreleased',
        },
      ],
      leaseComments: [
        { postedAt: '2026-08-28T11:00:00Z', byAuditedFiring: true, releasedAt: null },
      ],
      pushes: [],
      createdByFiring: { branches: [], createdPrs: [] },
    });
    const result = deriveConditions(lateLease, 'defer');
    expect(result.kind).toBe('derived');
    if (result.kind === 'derived') {
      expect(result.conditions).toMatchObject({ drive: { began: false } });
    }
  });
});
