import { describe, expect, it } from 'vitest';

import type { PrSnapshot } from './index.js';
import { diffSnapshots, formatSnapshot, isAllGreen, isTerminalState } from './report.js';

function makeSnapshot(overrides: Partial<PrSnapshot> = {}): PrSnapshot {
  return {
    number: 221,
    state: 'OPEN',
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    reviewDecision: '',
    headRefOid: '20d61cb74d4c9cffdcd536d11992be960756f800',
    checks: { total: 4, passed: 2, failed: 1, pending: 1 },
    reviewComments: [{ id: '3465383611', author: 'Copilot' }],
    issueComments: [{ id: 'IC_kwDO1', author: 'vercel' }],
    reviewThreads: { total: 2, unresolved: 1 },
    ...overrides,
  };
}

describe('formatSnapshot', () => {
  it('renders a single line with state, mergeability, review, checks, comments, unresolved threads, and short head sha', () => {
    expect(formatSnapshot(makeSnapshot())).toBe(
      'PR #221 OPEN · merge=MERGEABLE/CLEAN · review=(none) · checks 2✓ 1✗ 1⋯ · comments 1r/1i · unresolved 1/2 · head 20d61cb7',
    );
  });
});

describe('diffSnapshots', () => {
  it('returns no lines when the snapshots are identical', () => {
    expect(diffSnapshots(makeSnapshot(), makeSnapshot())).toStrictEqual([]);
  });

  it('reports each changed state field as its own line, in field order', () => {
    const next = makeSnapshot({ mergeStateStatus: 'BLOCKED', reviewDecision: 'APPROVED' });
    expect(diffSnapshots(makeSnapshot(), next)).toStrictEqual([
      'mergeStateStatus: CLEAN → BLOCKED',
      'review: (none) → APPROVED',
    ]);
  });

  it('emits a head change (force-push) comparing full shas but displaying the short form', () => {
    const next = makeSnapshot({ headRefOid: 'abcdef0123456789abcdef0123456789abcdef01' });
    expect(diffSnapshots(makeSnapshot(), next)).toStrictEqual(['head: 20d61cb7 → abcdef01']);
  });

  it('emits a line naming the author of a NEW review comment (the bot-finding signal)', () => {
    const next = makeSnapshot({
      reviewComments: [
        { id: '3465383611', author: 'Copilot' },
        { id: '999', author: 'bugbot' },
      ],
    });
    expect(diffSnapshots(makeSnapshot(), next)).toStrictEqual(['new review comment from bugbot']);
  });

  it('emits a line for a new issue comment', () => {
    const next = makeSnapshot({
      issueComments: [
        { id: 'IC_kwDO1', author: 'vercel' },
        { id: 'IC_2', author: 'octocat' },
      ],
    });
    expect(diffSnapshots(makeSnapshot(), next)).toStrictEqual(['new issue comment from octocat']);
  });

  it('emits a line when a thread becomes unresolved with no other change (the REST-blind signal)', () => {
    const next = makeSnapshot({ reviewThreads: { total: 2, unresolved: 2 } });
    expect(diffSnapshots(makeSnapshot(), next)).toStrictEqual(['unresolved threads: 1/2 → 2/2']);
  });

  it('emits a line when a thread is resolved, total unchanged (the merge-readiness progress signal)', () => {
    const next = makeSnapshot({ reviewThreads: { total: 2, unresolved: 0 } });
    expect(diffSnapshots(makeSnapshot(), next)).toStrictEqual(['unresolved threads: 1/2 → 0/2']);
  });
});

describe('isTerminalState', () => {
  it('is true once the PR is merged or closed', () => {
    expect(isTerminalState(makeSnapshot({ state: 'MERGED' }))).toBe(true);
    expect(isTerminalState(makeSnapshot({ state: 'CLOSED' }))).toBe(true);
  });

  it('is false while the PR is open', () => {
    expect(isTerminalState(makeSnapshot())).toBe(false);
  });
});

describe('isAllGreen', () => {
  it('is green when every check has settled passing and zero threads are unresolved', () => {
    expect(
      isAllGreen(
        makeSnapshot({
          checks: { total: 4, passed: 4, failed: 0, pending: 0 },
          reviewThreads: { unresolved: 0, total: 7 },
        }),
      ),
    ).toBe(true);
  });

  it.each([
    ['a failed check', { checks: { total: 4, passed: 3, failed: 1, pending: 0 } }],
    ['a pending check', { checks: { total: 4, passed: 3, failed: 0, pending: 1 } }],
    ['an unresolved thread', { reviewThreads: { unresolved: 1, total: 1 } }],
  ] as const)('is not green with %s', (_label, overrides) => {
    expect(
      isAllGreen(
        makeSnapshot({
          checks: { total: 4, passed: 4, failed: 0, pending: 0 },
          reviewThreads: { unresolved: 0, total: 0 },
          ...overrides,
        }),
      ),
    ).toBe(false);
  });

  it.each([
    ['BLOCKED', 'BLOCKED'],
    ['BEHIND', 'BEHIND'],
    ['DRAFT', 'DRAFT'],
    ['UNKNOWN', 'UNKNOWN'],
  ] as const)(
    'is not green while the merge state is %s (protection, staleness, or draft unsatisfied)',
    (_label, mergeStateStatus) => {
      expect(
        isAllGreen(
          makeSnapshot({
            mergeStateStatus,
            checks: { total: 4, passed: 4, failed: 0, pending: 0 },
            reviewThreads: { unresolved: 0, total: 0 },
          }),
        ),
      ).toBe(false);
    },
  );

  it('is not green before any check has attached (the rollup race, not a no-CI verdict)', () => {
    expect(
      isAllGreen(
        makeSnapshot({
          checks: { total: 0, passed: 0, failed: 0, pending: 0 },
          reviewThreads: { unresolved: 0, total: 0 },
        }),
      ),
    ).toBe(false);
  });
});
