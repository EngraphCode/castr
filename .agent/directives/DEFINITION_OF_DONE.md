# Definition of Done

**Last Updated:** 2026-06-09  
**Purpose:** The canonical, strict and complete quality gate definition for this repository.

All quality gate failures are blocking at ALL times. No exceptions, no workarounds.

Done means strict and complete everywhere, all the time: claimed supported behaviour, proofs, and live execution surfaces must agree, or the work is not done.

---

## Canonical Commands

- **CI (non-mutating):** `pnpm check:ci`
- **Local (may mutate to fix):** `pnpm check`

`pnpm check` is intentionally allowed to modify files (formatting, safe lint autofixes).  
If you need a non-mutating verification run, use `pnpm check:ci`.
Do not invoke `pnpm qg` directly. It may remain as a script implementation detail, but the canonical aggregate entrypoints are `pnpm check` and `pnpm check:ci`.

## Local Git Hook Contract

- Husky is active as the repo-local Git hook runner.
- `pnpm install` activates Husky locally via the repo `prepare` script.
- `pre-commit` formats staged files with Prettier and refreshes the index.
- `pre-push` runs `pnpm check:ci`.
- Hook passes are supportive local enforcement, not close-out proof. A slice still closes only after an intentional repo-root aggregate verification run whose result you have inspected directly.

---

## Quality Gates (Expanded, Run From Repo Root)

```bash
#!/usr/bin/env bash
set -euo pipefail

pnpm clean
pnpm install --frozen-lockfile

pnpm build
pnpm format:check
pnpm type-check
pnpm lint
pnpm madge:circular
pnpm madge:orphans
pnpm depcruise
pnpm knip
pnpm portability:check
pnpm packaging:check

pnpm test
pnpm character
pnpm test:snapshot
pnpm test:gen
pnpm test:transforms
pnpm test:e2e
```

`pnpm packaging:check` (2026-06-09, remediation plan 01 / finding C1) verifies the **published package shape**:
`publint --strict` lints the packed tarball's manifest/field integrity, and `attw --pack . --profile esm-only`
(`@arethetypeswrong/cli`) proves every `exports` target's types and runtime files resolve for ESM consumers and
bundlers — the package is deliberately ESM-only (`"type": "module"`, Node 24 LTS), so the CJS/node10 resolution modes
are declared out of the support matrix rather than shimmed. The companion e2e proof
(`lib/tests-e2e/packaging-integrity.test.ts`) packs the real tarball and imports every entrypoint as a consumer
would, including the README's `parseZodSource` example and the CLI bin.

## Transitional gate states (owner, 2026-06-10)

**No quality-gate rule is ever turned off** — that is absolute (see `principles.md` §Strict And Complete, and
`.agent/rules/never-disable-checks.md`). The single sanctioned transitional state, owner-directed, is a **severity
downgrade to `warn`** for rules whose findings require complex refactors that must not be handled ad-hoc:

- A rule may be set to `warn` (never `off`) while its violations are being refactored away deliberately.
- **DoD requirement:** every such in-flight rule MUST be back at `error` before the deep enhancement of castr (the
  Oak-Practice transplant arc, including engineering-infrastructure parity) can be considered complete. This is a
  hard completion gate, not an undefined-later; the migration is tracked as deliverable **D1** in
  [`.agent/plans/transplant/README.md`](../plans/transplant/README.md) §Deep-enhancement arc.
- `warn` is never a resting state: a rule left at `warn` with no active migration and no completion gate is the
  forbidden `gate-off-fix-gate-on` anti-pattern in disguise.

~~In flight as of 2026-06-10~~ **RESOLVED 2026-06-19:** the sonarjs-4.0.3 recommended-set additions
(`sonarjs/function-return-type`, `sonarjs/in-operator-type-error`) are **back at `error`**. Their 126 "violations" were a
TypeScript-version skew (the plugin's bundled TS 5.9.3 `TypeFlags` constants applied to TS-6.0.3 type objects — a wrong-bit
mask), **not** refactorable code; fixed at root by pinning a single workspace TypeScript in `pnpm-workspace.yaml`, after
which both rules compute correctly and flag zero. No rule was left at `warn` as a resting state. Full root cause: D1 in
[`.agent/plans/transplant/README.md`](../plans/transplant/README.md) §Deep-enhancement arc +
[`d1-sonarjs-findings.md` §0](../plans/transplant/d1-sonarjs-findings.md).

Off-chain development aids (not in the canonical gate, green, documented honestly):

- `pnpm --dir lib test:scalar-guard` — Scalar legacy import guard. Runs via `vitest.scalar-guard.config.ts`. Not in the canonical chain because it tests a single narrow vendor-specific invariant; it is useful for targeted regression checks but does not contribute to broader proof coverage.

---

## Quick Reference

| Gate            | Command                          | Purpose                                      |
| --------------- | -------------------------------- | -------------------------------------------- |
| Clean           | `pnpm clean`                     | Remove build artifacts                       |
| Install         | `pnpm install --frozen-lockfile` | Install deps without lockfile drift          |
| Build           | `pnpm build`                     | Build all packages                           |
| Format          | `pnpm format:check`              | Enforce formatting (non-mutating)            |
| Type-check      | `pnpm type-check`                | TypeScript strict mode                       |
| Lint            | `pnpm lint`                      | ESLint rules enforcement                     |
| Madge Circular  | `pnpm madge:circular`            | Check for circular dependencies              |
| Madge Orphans   | `pnpm madge:orphans`             | Check for orphaned files (warnings)          |
| Dep Cruiser     | `pnpm depcruise`                 | Architecture boundaries validation           |
| Knip            | `pnpm knip`                      | Find unused exports/dead code                |
| Portability     | `pnpm portability:check`         | Validate canonical agent/adapter cohesion    |
| Unit tests      | `pnpm test`                      | Primary test suite                           |
| Character tests | `pnpm character`                 | Public API behavior                          |
| Snapshot tests  | `pnpm test:snapshot`             | Snapshot comparison                          |
| Generated tests | `pnpm test:gen`                  | Tests on generated code                      |
| Transform tests | `pnpm test:transforms`           | End-to-end transform pipeline proofs         |
| E2E tests       | `pnpm test:e2e`                  | IR fidelity, OpenAPI round-trip, persistence |

---

## Acceptance Metrics (Measurable)

- **0 tolerance paths**: invalid/unsupported inputs fail fast with explicit errors
- **Claimed-support completeness**: every claimed supported behaviour is parser/IR/writer/runtime-validator/test/doc consistent, or explicitly marked unsupported or paused
- **Determinism**: repeated runs produce byte-for-byte identical output for all fixtures
- **IR coverage**: all fields from the currently claimed OpenAPI 3.x surface in `.agent/directives/requirements.md` are representable at the IR boundary

---

## Optional Future Gates (Not Yet Part of DoD)

If/when added, they must be implemented as `package.json` scripts and added to the gate list above in the same PR.

- Mutation testing (planned) — would add a `test:mutation` script
- Dependency auditing (planned): `pnpm audit`
