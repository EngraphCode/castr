# No Skipped Tests

Operationalises [`testing-strategy.md`](../directives/testing-strategy.md)
§Rules "No skipped tests (except upstream quarantines)" — castr's
authoritative policy. Origin: Oak ADR-011 and ADR-121 (cross-host; castr's
ADRs with those numbers are unrelated decisions).

NEVER use `it.skip`, `describe.skip`, `test.todo`, `it.todo`, `xit`, `xdescribe`, or any other skipping or pending mechanism to mask our own regressions. Fix it or delete it. External-resource tests must fail fast with a helpful error, never skip.

The single sanctioned quarantine shape (per `testing-strategy.md`): a test
that exposes an **upstream library defect beyond our control** may be
explicitly segregated (e.g. passing `DEFECT_FIXTURES` to `it.skip.each()`)
so coverage keeps expanding without relaxing main strictness rules. The
segregation must be explicit, named, and traceable to the upstream defect —
never a bare `it.skip` on our own behaviour.

Conditional execution is governed separately. See `.agent/rules/no-conditional-tests.md` for the prohibition on `skipIf`, `runIf`, runtime branching, and conditional assertions.
