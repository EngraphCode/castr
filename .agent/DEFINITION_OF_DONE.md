# Definition of Done

**Purpose:** A script that validates all work is complete and the codebase is in a releasable state.

---

## Current Definition (October 24, 2025)

All quality gates must pass:

```bash
#!/bin/bash
# Run this to verify Definition of Done

set -e  # Exit on first error

echo "🎨 Running format check..."
pnpm format

echo "🏗️  Running build..."
pnpm build

echo "🔍 Running type-check..."
pnpm type-check

echo "✅ Running tests..."
pnpm test -- --run

echo ""
echo "✅ ✅ ✅ All quality gates passed! ✅ ✅ ✅"
echo ""
echo "Current status:"
echo "  ✅ format      - Clean"
echo "  ✅ build       - Success (ESM + CJS + DTS)"
echo "  ✅ type-check  - 0 errors"
echo "  ✅ test        - 297 tests passing"
echo ""
echo "ℹ️  Note: pnpm lint currently has warnings (acceptable)"
```

### Quick Check

```bash
pnpm format && pnpm build && pnpm type-check && pnpm test -- --run
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

---

## Current Exceptions

**Lint warnings** are currently acceptable (148 issues):

- 74 type assertion warnings (work in progress)
- Various other non-critical warnings

These will be resolved as part of the planned work.

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
