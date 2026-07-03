# Mid-Cycle Handoff Records

This directory holds one JSON file per mid-cycle handoff record produced under
the mid-cycle retirement protocol. The protocol fires only when a token-bounded
agent must retire before the natural boundary they were working toward;
natural-boundary closeouts continue to use the `start-right-team` SKILL §Closeout
Contract unchanged.

The portable genotype is
[`PDR-063-mid-cycle-retirement-protocol.md`](../../../practice-core/decision-records/PDR-063-mid-cycle-retirement-protocol.md).
The repo-substrate phenotype (record shape, schema, content-addressed filenames)
is a forward Phase-8 capability; Oak's `ADR-182` (mid-cycle-handoff-record-substrate)
is the cross-host reference for that substrate design.

## File convention (per PDR-063 + the forward substrate)

- One JSON file per active claim, content-addressed by the claim's `claim_id`
  (UUID v4): `<claim_id>.json`. A claim that retires more than once writes a
  versioned successor `<claim_id>.<n>.json` (n from 2). Records are append-only:
  corrections write a new versioned successor rather than mutating a written record.
- Until the substrate schema lands, the record shape is governed by PDR-063 §Step 2's
  four named sections — **current edit state**, **in-flight reasoning**, **decisions
  made**, **decisions deferred** — and validated by readers against that shape only.

## Active-claims pointer

Claims in `../active-claims.json` whose `handoff_record_path` field is populated
are mid-cycle and carry a handoff record at the referenced path. An absent value
signals normal active-claim semantics. The field is optional and additive per
PDR-049 and PDR-050; readers that do not understand it ignore it.

This directory is untracked-by-design except this `README.md`; handoff records are
created on disk per checkout and not carried in git.
