# Dangling-reference census — TC3a output (2026-06-26)

Point-in-time census produced by the newly-ported `validate-markdown-links` validator (TC3a of
[`transplant-completeness-supporting-infrastructure.md`](./transplant-completeness-supporting-infrastructure.md)).
This is the **input for TC2/TC4** — the dangling-reference remediation. It is a **snapshot**, not a
frozen contract: the validator is the live source of truth. Regenerate the current census any time with:

```bash
pnpm --filter @engraph/agent-tools validate-markdown-links
```

## Headline (run 2026-06-26)

- **225 broken internal `.md` links** across **642 scanned files** — 107 auto-fixable (unique-basename
  suggestion), 118 manual. Exit 0 (`BLOCKING = false`, report-only — castr's chain stays all-blocking;
  see the TC3b decision).
- **Completeness reconciled:** an independent `find` of scannable `.md` files (`docs/**`, `.agent/**`,
  root `*.md`, excluding `archive/` + `*.original.md`) returned **642** — exactly the validator's
  scanned-file count. The run enumerated the whole surface, not a fragment.
- **Correctness precondition met:** the 34 ported helper unit tests are green (the port's RED→GREEN
  contract) — so the count is trusted, not precise-but-wrong.
- Note: the earlier raw-grep estimate of ~329 was an over-count; the validator excludes `archive/` and
  resolves repo-root-relative paths, giving the true 225.

## Confirmed transplant-origin findings (the TC2/TC4 seed)

These are dangling references caused by the transplant itself — the validator catching exactly the
hollow-transplant class it was brought to catch:

- **`.agent/skills/plan/SKILL-CANONICAL.md`** (the transplanted plan skill):
  - `L13 → ../../../docs/architecture/architectural-decisions/117-plan-templates-and-components.md` —
    carries **Oak's ADR path convention**; castr uses `docs/architectural_decision_records/`, and ADR-117
    itself was never transplanted. → fix on TC2 (templates library bring) + path reconciliation.
  - `L69 → ../../plans/templates/README.md` — the **un-transplanted templates library** (TC2).
- **`.agent/skills/napkin/SKILL-CANONICAL.md`** and peers: a cluster of `../../../…` links that are
  **off-by-one for castr's directory depth** (e.g. `../../../directives/orientation.md#layers`, which
  the validator auto-suggests correcting to `../../directives/orientation.md`). These are ported-with-
  Oak-depth path defects — transplant-origin, mechanically fixable.

## TC2/TC4 disposition guidance

Regenerate the census, then give every finding a recorded decision (disposition-ledger discipline,
sized to unique gaps not to the 225 count):

- **Transplant-origin** (Oak-path convention, off-by-one depth, un-transplanted target) → fix by bringing
  the missing infra or reconciling the ported path (the transplant-completeness cure — never delete the
  reference to hide the gap).
- **Pre-existing castr debt** (castr's own docs referencing moved/deleted files, e.g.
  `collaboration-state-conventions.md`, archived zod-limitations clusters) → **out of this plan's
  non-goals**; route to a separate doc-hygiene pass, do not absorb into transplant completeness.

The 107 auto-fixable (unique-basename) suggestions are advisory — TC2/TC4 dispositions each; no blind auto-fix.
