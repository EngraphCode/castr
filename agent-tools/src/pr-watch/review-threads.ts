import { z } from 'zod';

/**
 * The review-threads boundary for `pr-watch`: parse the slurped GraphQL
 * `reviewThreads` pages into the `{total, unresolved}` summary the snapshot
 * carries. Thread RESOLUTION state exists only on this GraphQL surface — the
 * REST comment endpoints the watcher also polls cannot see it, which is the
 * recorded false-"no problems" error class this module exists to kill.
 */

/** The unresolved-thread summary a {@link PrSnapshot} carries. */
export interface ReviewThreadsSummary {
  readonly total: number;
  readonly unresolved: number;
}

// One page as `gh api graphql --paginate --slurp` returns it (the slurped output is an
// array of these). Unknown keys (e.g. pageInfo, which only gh's paginator consumes) are
// stripped; a missing or misshapen consumed field fails loud.
const reviewThreadsPageSchema = z.object({
  data: z.object({
    repository: z.object({
      pullRequest: z.object({
        reviewThreads: z.object({
          totalCount: z.number().int().nonnegative(),
          nodes: z.array(z.object({ isResolved: z.boolean() })),
        }),
      }),
    }),
  }),
});

const reviewThreadPagesSchema = z.array(reviewThreadsPageSchema).min(1);

/**
 * Parse a slurped multi-page reviewThreads response into the summary.
 *
 * @remarks
 * `totalCount` is the server-side total and identical on every page, so it is read from
 * the first page; `unresolved` is counted across ALL pages' nodes (the paginator brings
 * 100 threads per page — an unresolved thread on a later page must never be invisible).
 *
 * @throws a ZodError when the input is not the expected slurped page-array shape
 *   (strict validation at the external-input boundary — never a silent zero).
 */
export function parseReviewThreadPages(raw: unknown): ReviewThreadsSummary {
  const pages = reviewThreadPagesSchema.parse(raw);
  const threads = pages.map((page) => page.data.repository.pullRequest.reviewThreads);
  return {
    // The .min(1) boundary guarantees a first page; never default a missing
    // page to zero — a silent zero is the degradation this module exists to kill.
    total: threads[0].totalCount,
    unresolved: threads.flatMap((page) => page.nodes).filter((node) => !node.isResolved).length,
  };
}
