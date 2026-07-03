import { describe, expect, it } from 'vitest';

import { parseReviewThreadPages } from './review-threads.js';

// One GraphQL reviewThreads page in the exact shape `gh api graphql --paginate --slurp`
// returns (verified against the live schema on PR #296): the slurped output is an ARRAY
// of these pages.
const page = (input: {
  readonly totalCount: number;
  readonly hasNextPage: boolean;
  readonly endCursor: string | null;
  readonly resolved: readonly boolean[];
}) => ({
  data: {
    repository: {
      pullRequest: {
        reviewThreads: {
          totalCount: input.totalCount,
          pageInfo: { hasNextPage: input.hasNextPage, endCursor: input.endCursor },
          nodes: input.resolved.map((isResolved) => ({ isResolved })),
        },
      },
    },
  },
});

describe('parseReviewThreadPages', () => {
  it('aggregates a slurped multi-page response: server totalCount, unresolved summed across pages', () => {
    // Discriminating fixture: the unresolved witness sits on PAGE TWO with asymmetric
    // per-page counts, so a no-pagination read (unresolved 0), an inverted-polarity
    // count (2), a node count (3 via nodes... distinct), and a summed totalCount (6)
    // each fail loud against the single expected aggregate.
    const summary = parseReviewThreadPages([
      page({ totalCount: 3, hasNextPage: true, endCursor: 'C1', resolved: [true, true] }),
      page({ totalCount: 3, hasNextPage: false, endCursor: null, resolved: [false] }),
    ]);
    expect(summary).toStrictEqual({ total: 3, unresolved: 1 });
  });

  it('reads a thread-free pull request as zero of zero', () => {
    const summary = parseReviewThreadPages([
      page({ totalCount: 0, hasNextPage: false, endCursor: null, resolved: [] }),
    ]);
    expect(summary).toStrictEqual({ total: 0, unresolved: 0 });
  });

  it('fails loud on a malformed page shape rather than degrading to zero', () => {
    expect(() => parseReviewThreadPages([{ data: {} }])).toThrow();
    expect(() => parseReviewThreadPages('not pages')).toThrow();
  });

  it('fails loud on an empty pages array (a slurped response always carries at least one page)', () => {
    expect(() => parseReviewThreadPages([])).toThrow();
  });
});
