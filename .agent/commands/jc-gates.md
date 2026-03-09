# Gates

Run the canonical quality gates from the repo root in strict order.

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
   - `pnpm test`
   - `pnpm character`
   - `pnpm test:snapshot`
   - `pnpm test:gen`
   - `pnpm test:transforms`
2. Treat every failure as blocking.
3. Do not analyze failures until the full sequence completes.
