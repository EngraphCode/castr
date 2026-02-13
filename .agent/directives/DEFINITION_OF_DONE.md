# Definition of Done

**Purpose:** A script that validates all work is complete and the codebase is in a releasable state.

---

## Current Definition (Updated December 2025)

**All quality gates must pass. All quality gate issues are blocking at ALL times, regardless of where or why they happen. This rule is absolute and unwavering.**

### Quality Gates (Run One at a Time, In Order)

```bash
#!/bin/bash
# Run this to verify Definition of Done
# From the repo root

set -e  # Exit on first error

echo "🧹 Running clean..."
pnpm clean

echo "📦 Running install..."
pnpm install

echo "🏗️  Running build..."
pnpm build

echo "🔍 Running type-check..."
pnpm type-check

echo "🔍 Running lint..."
pnpm lint

echo "🎨 Running format check..."
pnpm format:check

echo "✅ Running unit tests..."
pnpm test

echo "📸 Running snapshot tests..."
pnpm test:snapshot

echo "⚙️  Running generated code tests..."
pnpm test:gen

echo "🎭 Running character tests (public API)..."
pnpm character

echo ""
echo "✅ ✅ ✅ All quality gates passed! ✅ ✅ ✅"
```

### Quick Reference

| Gate | Command | Purpose |
| ---------------- | -------------------- | ------------------------------ ||
| Clean | `pnpm clean` | Remove build artifacts |
| Install | `pnpm install` | Install dependencies |
| Build | `pnpm build` | Compile ESM + CJS + DTS |
| Type-check | `pnpm type-check` | TypeScript strict mode |
| Lint | `pnpm lint` | ESLint rules enforcement |
| Format | `pnpm format:check` | Prettier formatting |
| Unit Tests | `pnpm test` | Unit test suite |
| Snapshot Tests | `pnpm test:snapshot` | Snapshot comparison |
| Generated Tests | `pnpm test:gen` | Tests on generated code |
| Character Tests | `pnpm character` | Public API behavior |

### Quick Check (Single Command)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && pnpm test:gen && pnpm character
```

If this exits successfully (exit code 0), the Definition of Done is met.

---

## Future Extensions

As we complete work items, we will add to the Definition of Done:

### After Type Assertions Fixed

```bash
# Will add:
pnpm lint  # Must exit 0
```

### After Stryker Added

```bash
# Will add:
pnpm test:mutation  # Must meet threshold (e.g., 80%)
```

### After All Enhancements

```bash
# Final Definition of Done:
pnpm format
pnpm build
pnpm type-check
pnpm lint          # 0 errors, 0 warnings
pnpm test -- --run # 100% passing
pnpm test:mutation # ≥80% mutation score
pnpm audit         # 0 vulnerabilities
```

## Acceptance Metrics (Measurable)

- **100% of fixtures** pass strict validation and output checks
- **0 tolerance paths**: invalid inputs fail with explicit errors
- **Determinism**: 0 diff across repeated runs for all fixtures
- **IR coverage**: all 3.0/3.1 fields from `directives/requirements.md` represented in IR

---

## Status

**All quality gates now pass cleanly.** As of February 2026:

- 1,010+ total tests passing
- 0 lint warnings
- 0 type assertions (`as` usage eliminated)

---

## Verification

Run the Definition of Done check before:

- Committing significant work
- Ending a work session
- Creating a PR (future)
- Tagging a release (future)

---

## Quick Verification Script

Save this as `check-done.sh`:

```bash
#!/bin/bash
set -e
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run && echo "✅ Definition of Done: PASSED"
```

Then:

```bash
chmod +x check-done.sh
./check-done.sh
```
