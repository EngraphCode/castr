# Definition of Done

**Last Updated:** 2026-02-13  
**Purpose:** The canonical, strict quality gate definition for this repository.

All quality gate failures are blocking at ALL times. No exceptions, no workarounds.

---

## Canonical Commands

- **CI (non-mutating):** `pnpm check:ci`
- **Local (may mutate to fix):** `pnpm check`
- **Fast gates (assumes deps installed, non-mutating):** `pnpm qg`

`pnpm check` is intentionally allowed to modify files (formatting, safe lint autofixes).  
If you need a non-mutating verification run, use `pnpm check:ci`.

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

pnpm test
pnpm character
pnpm test:snapshot
pnpm test:gen
pnpm test:transforms
```

---

## Quick Reference

| Gate            | Command                          | Purpose                              |
| --------------- | -------------------------------- | ------------------------------------ |
| Clean           | `pnpm clean`                     | Remove build artifacts               |
| Install         | `pnpm install --frozen-lockfile` | Install deps without lockfile drift  |
| Build           | `pnpm build`                     | Build all packages                   |
| Format          | `pnpm format:check`              | Enforce formatting (non-mutating)    |
| Type-check      | `pnpm type-check`                | TypeScript strict mode               |
| Lint            | `pnpm lint`                      | ESLint rules enforcement             |
| Madge Circular  | `pnpm madge:circular`            | Check for circular dependencies      |
| Madge Orphans   | `pnpm madge:orphans`             | Check for orphaned files (warnings)  |
| Dep Cruiser     | `pnpm depcruise`                 | Architecture boundaries validation   |
| Knip            | `pnpm knip`                      | Find unused exports/dead code        |
| Unit tests      | `pnpm test`                      | Primary test suite                   |
| Character tests | `pnpm character`                 | Public API behavior                  |
| Snapshot tests  | `pnpm test:snapshot`             | Snapshot comparison                  |
| Generated tests | `pnpm test:gen`                  | Tests on generated code              |
| Transform tests | `pnpm test:transforms`           | End-to-end transform pipeline proofs |

---

## Acceptance Metrics (Measurable)

- **0 tolerance paths**: invalid/unsupported inputs fail fast with explicit errors
- **Determinism**: repeated runs produce byte-for-byte identical output for all fixtures
- **IR coverage**: all OpenAPI 3.0/3.1 fields from `.agent/directives/requirements.md` are representable at the IR boundary

---

## Optional Future Gates (Not Yet Part of DoD)

If/when added, they must be implemented as `package.json` scripts and added to the gate list above in the same PR.

- Mutation testing (planned): `pnpm test:mutation`
- Dependency auditing (planned): `pnpm audit`
