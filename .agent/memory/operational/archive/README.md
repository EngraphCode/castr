# Operational Memory Archive

Rotation home for **operational-tier** memory surfaces once their live copy
has been drained or superseded. The operational tier
([`../`](../)) carries working state that grows during a thread —
[`pending-graduations.md`](../pending-graduations.md),
[`open-questions.md`](../open-questions.md),
[`repo-continuity.md`](../repo-continuity.md), and the per-thread records
under [`../threads/`](../threads/). When a register is fully drained, or a
continuity snapshot is replaced by a newer one, the settled copy moves here
for provenance instead of being deleted.

## What belongs here

- Drained graduation registers (`pending-graduations-archive-<date>.md`).
- Superseded continuity snapshots (`repo-continuity-current-state-<date>-<agent>.md`).
- Resolved/archived open-questions registers (`open-questions-archive-<date>.md`).

## What does not

- **Substance.** Like every operational surface, the archive holds working
  records and pointers, never the canonical home of an insight. Graduated
  knowledge lives at its permanent home (PDRs, ADRs, rules, patterns,
  directives, skills); the archive only preserves the working artefact that
  routed it there. See [`../curator-passes/README.md`](../curator-passes/README.md)
  for the metadata-only contract this mirrors.

## Convention

- One file per rotation, named `<surface>-archive-<YYYY-MM-DD>[-<agent-codename>].md`.
- Files are write-once; a correction writes a new dated file rather than
  editing an archived one.
- Knowledge is never trimmed for size — it is conserved here when it leaves
  active circulation (see [`knowledge-preservation-over-fitness-warnings`](../../../rules/knowledge-preservation-over-fitness-warnings.md)).
