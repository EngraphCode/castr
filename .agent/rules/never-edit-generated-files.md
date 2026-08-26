# Never Edit Generated Files

Owner directive (2026-08-26, verbatim substance, ruled at the arming
walk's decision re-read): **"never to edit generated files, always edit
the generator."**
Operationalises the generator-first doctrine
([`generator-first-mindset.md`](generator-first-mindset.md),
[`principles.md`](../directives/principles.md) §Deterministic Output) as
an explicit prohibition.

## Rule

**A generated file is never edited by hand. When generated output must
change, change the generator (or its inputs) and regenerate. When a
generated file and its generator disagree, the generator is fixed first
— the checked-in output is only ever brought back into agreement by
running the generator.**

This applies to every generated artefact in the repository: emitted
code and documents (writer/codegen output), generated fixtures and
snapshots, generated adapter/wrapper tiers, and generated index
regions. A hand edit to any of them creates a second source of truth
that the next regeneration silently destroys or that permanently
diverges from its generator — both are corruption, not maintenance.

## Consequences

- A drifted generated artefact is a **generator bug or a stale
  regeneration** — file the fix against the generator, never against
  the output. Worked instance (2026-08-26): a checked-in fixture estate
  became unregenerable because outputs and generator were maintained
  independently — the repair was routed against the generator; the
  decision register of that day carries the detailed provenance.
- Regeneration is the only sanctioned write path. If regeneration
  breaks consumers, the generator (or the consumer contract) is wrong
  — fix that, with the gates on, per
  [`never-disable-checks.md`](never-disable-checks.md).
- Where a generated file must carry a local deviation, the deviation
  belongs in the generator's inputs or configuration, recorded where
  the generator reads it — never patched into the output.
