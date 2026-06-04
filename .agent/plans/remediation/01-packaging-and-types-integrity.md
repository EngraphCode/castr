# Plan: Packaging and Types Integrity

**Status:** Backlog (remediation) · **Findings:** C1 · **Risk:** Low
**References:** report `02-findings-critical.md` (C1); `lib/tsconfig.json`, root `tsconfig.json`, `lib/tsup.config.ts`, `lib/package.json`

---

## User impact

A published `@engraph/castr` install currently ships with **no type declarations** and a **broken `./parsers/zod`
import** (the README's documented Zod entrypoint fails to resolve). Consumers get no IntelliSense/type-checking and a
module-not-found error — directly against "Developer Experience is Priority #1".

## Root cause (verified)

- Root `tsconfig.json:22` sets `"noEmit": true`; `lib/tsconfig.json` extends it and never overrides, so
  `tsc --emitDeclarationOnly` is a silent no-op → **0 `.d.ts`** emitted.
- Even when forced, `rootDir: "."` emits to `dist/src/**`, not the `dist/index.d.ts` the `types` field points to.
- `tsup` (`bundle:false`) mirrors the source layout, so `./parsers/zod` → `./dist/parsers/zod/index.js` does not exist
  (the real file is `dist/schema-processing/parsers/zod/index.js`).

## Scope

In scope: emit `.d.ts` at the declared `types` paths; fix the `./parsers/zod` runtime + types targets; add a packaging
gate. Out of scope: any API surface change; bundling strategy change beyond what's needed for correct paths.

## Assumptions to validate

1. `noEmit:false` override (or `tsup --dts`) emits declarations without breaking the build.
2. `declarationDir`/`rootDir` (or `tsup --dts`) can place `.d.ts` at the `types` paths the package declares.
3. `./parsers/zod` either needs a real `src/parsers/zod/index.ts` re-export entry or the export must repoint to the
   built `dist/schema-processing/parsers/zod/`.

## Success criteria (measurable)

- A clean build emits a `.d.ts` at **every** `package.json` `types` target.
- `node` resolves `@engraph/castr`, `@engraph/castr/cli`, and `@engraph/castr/parsers/zod` from a packed tarball.
- `publint` and `@arethetypeswrong/cli` run green and are wired into `pnpm qg` / `DEFINITION_OF_DONE.md`.
- The README's `parseZodSource` import example works against the packed package.

## TDD order

1. Add the packaging gate (`publint` + `attw`) — it should go **red** against current `main`.
2. Fix declaration emission (override `noEmit`; correct `rootDir`/`declarationDir` or adopt `tsup --dts`).
3. Fix the `./parsers/zod` export target (re-export entry or repoint).
4. Gate green; add a CI assertion that imports the packed tarball's three entrypoints.

## Documentation outputs

- Update `DEFINITION_OF_DONE.md` gate list with the packaging gate.
- Note in `docs/` that types + the Zod subpath are gate-verified.
