# Pack 1 — Boundary Integrity and Public Surface

**Date:** 2026-03-21
**Verdict:** yellow

## Invariants Checked

- Published package entrypoints stay explicit and narrow.
- Internal schema-processing domains declare barrel-only boundary rules instead of relying on convention alone.
- Public docs, CLI help, and public-surface proof artefacts should describe the same surface that the source actually implements.

## Findings

1. Severity: high
   File: [README.md](/Users/jim/code/personal/castr/README.md)
   File: [docs/API-REFERENCE.md](/Users/jim/code/personal/castr/docs/API-REFERENCE.md)
   File: [lib/src/rendering/generate-from-context.ts](/Users/jim/code/personal/castr/lib/src/rendering/generate-from-context.ts)
   File: [lib/src/schema-processing/context/template-context.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/context/template-context.ts)
   File: [lib/src/cli/helpers.ts](/Users/jim/code/personal/castr/lib/src/cli/helpers.ts)
   Issue: The public docs still advertise removed or renamed surfaces such as `openApiFilePath`, `exportSchemas`, `exportTypes`, `schemas-with-client`, `createApiClient`, and `validationMode`, but the current source accepts `input` or `openApiDoc`, only recognises `schemas-only` and `schemas-with-metadata`, and exposes `shouldExportAllSchemas` / `shouldExportAllTypes` on the programmatic options layer.
   Why it matters: Callers following the published docs will target APIs that the package does not implement, so the public boundary is not honest even though the code itself is strict.

2. Severity: medium
   File: [lib/package.json](/Users/jim/code/personal/castr/lib/package.json)
   File: [lib/src/cli/index.ts](/Users/jim/code/personal/castr/lib/src/cli/index.ts)
   File: [lib/src/characterisation/cli.char.test.ts](/Users/jim/code/personal/castr/lib/src/characterisation/cli.char.test.ts)
   Issue: The published binary name is `castr`, but the CLI help text and its characterisation proof still preserve the legacy identity `data-descriptions-tooling`.
   Why it matters: Users and automation see conflicting command identities, and the proof system currently locks the stale one in place instead of the published interface.

3. Severity: medium
   File: [lib/src/index.ts](/Users/jim/code/personal/castr/lib/src/index.ts)
   File: [lib/src/public-api-preservation.test.ts](/Users/jim/code/personal/castr/lib/src/public-api-preservation.test.ts)
   Issue: The root barrel exports a much larger runtime surface than the preservation test asserts, but the test still claims to preserve the whole public API.
   Why it matters: Runtime export regressions or accidental public-surface expansion can slip past the proof suite without a failing test, which weakens Pack 1's boundary-integrity guarantees.

## Doctrine Or Doc Drift

- The package boundary itself is reasonably disciplined: [`lib/package.json`](/Users/jim/code/personal/castr/lib/package.json) exposes only `.`, `./cli`, and `./parsers/zod`, and [`lib/.dependency-cruiser.cjs`](/Users/jim/code/personal/castr/lib/.dependency-cruiser.cjs) enforces barrel-only seams across `schema-processing/*`.
- The cold-start handoff docs had already drifted before this note was written: `session-entry.prompt.md` still said the sweep had not started, and `roadmap.md` did not yet record a Pack 1 verdict or identify Pack 2 as the next pack.
- Public docs remain materially drifted from repo truth, especially [`README.md`](/Users/jim/code/personal/castr/README.md) and [`docs/API-REFERENCE.md`](/Users/jim/code/personal/castr/docs/API-REFERENCE.md).

## Required Follow-On Slices

- Public-surface documentation realignment across `README.md`, API reference, usage, migration, and integration docs so every published example matches the current generator and template set.
- CLI identity cleanup so help output, docs, and characterisation proofs agree on the published `castr` interface.
- Public API proof hardening so the preservation suite enumerates the real root and subpath runtime contracts instead of a legacy subset.

## Unblock Decision

- Pack 2 is unblocked and should be the next review pack.
- Product implementation remains blocked pending the rest of the review sweep.
- [`json-schema-parser.md`](/Users/jim/code/personal/castr/.agent/plans/current/paused/json-schema-parser.md) stays paused until Pack 4 explicitly revalidates or rewrites it.
