# Gates

Run the canonical quality gates from the repo root.

## Preferred Entry Points

- Local aggregate verification: `pnpm check`
- Non-mutating aggregate verification: `pnpm check:ci`

Do not invoke `pnpm qg` directly. It may remain as a script implementation detail, but the canonical aggregate entrypoints are `pnpm check` and `pnpm check:ci`.

## Local Hook Contract

- Husky `pre-commit` formats staged files with Prettier and refreshes the index.
- Husky `pre-push` runs `pnpm check:ci`.
- Treat hook runs as local enforcement, not as implicit close-out proof. If you are finishing work, still run the canonical aggregate command intentionally and reason from that explicit result.

## Expanded Chain

Use the expanded order below when you need to isolate a failing gate or walk the full chain manually.

## Steps

1. Run each command one at a time:
   - `pnpm clean`
   - `pnpm install --frozen-lockfile`
   - `pnpm build`
   - `pnpm format:check`
   - `pnpm type-check`
   - `pnpm lint`
   - `pnpm madge:circular`
   - `pnpm madge:orphans`
   - `pnpm depcruise`
   - `pnpm knip`
   - `pnpm portability:check`
   - `pnpm test`
   - `pnpm character`
   - `pnpm test:snapshot`
   - `pnpm test:gen`
   - `pnpm test:transforms`
   - `pnpm test:e2e`
2. Treat every failure as blocking.
3. Do not analyze failures until the full sequence completes.
