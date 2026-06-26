---
fitness_line_target: 1100
fitness_line_limit: 1467
fitness_char_limit: 200000
fitness_line_length: 100
lifecycle_model: >-
  canonical pending-graduations register — owner-gated and pending items live
  here until graduated, duplicated, stale-withdrawn, or owner-resolved
access_pattern: >-
  consolidation-pass-only — read at consolidations and drain sessions; not
  loaded every session by every agent
drain_strategy: >-
  Graduate items to PDRs/ADRs/rules/permanent docs; keep owner-gated items here
  until owner direction resolves them; do not split, shard, or hide buffer depth
fitness_rationale: >-
  Fitness on a drainable buffer is a drain-cadence signal, not a size cap. The
  register reads `hard` while an owner-gated backlog waits to be walked down with
  the owner present; it goes green when the backlog is genuinely graduated, not by
  tombstone-removal. Fitness here is informational-only (not wired into any
  commit/push hook), so a standing `hard` never blocks a commit and must be
  reported, not chased: owner-gated items that legitimately wait are never trimmed
  to clear it. Materialised fresh in castr by the Practice transplant (Phase 6,
  2026-06-18); the register starts near-empty and is populated by napkin drains and
  consolidation passes.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

# Pending Graduations

This is the canonical pending-graduations register. Do not create dated,
windowed, backlog, split, or shard-like pending-graduation files. New capture,
owner-gated items, and unresolved pending-graduation decisions belong here until
they graduate, duplicate, become stale-withdrawn, or receive owner direction.

Each entry should record: the captured substance, its candidate permanent home
(PDR / ADR / rule / distilled / pattern / README), and a
`[captured: <date> | source: <surface>]` provenance stamp. When an item
graduates, route its substance to the permanent home and remove it here — the
commit and the permanent doc are the record (no tombstone; see
[`permanent-doc-is-the-consolidation-record`](../../rules/permanent-doc-is-the-consolidation-record.md)).

> **Materialised 2026-06-18 (Practice transplant Phase 6).** The register is new
> in castr. Items below are populated by napkin drains and consolidation passes
> from castr's own state — not copied from any other repo.

<!-- Entries appended below by napkin drains and consolidation passes. -->

## dependency-currency-discipline → PDR (candidate)

- **Substance:** a reusable method for keeping a types/codegen library's dependency estate current without
  regressing type fidelity, executed firsthand 2026-06-21 (DC0/DC0b/DC6/DC7/DC8). The method: split bumps by
  **type/emission/runtime-risk, not semver size**; classify each dep by its **actual call-sites firsthand**,
  not its reputation as "tooling"; **one type-affecting major per commit**; **capture an emitted/CLI baseline
  BEFORE install, diff AFTER** (a non-empty diff is STOP-and-understand); for tooling whose changelog is poorly
  version-mapped, the **empirical consumer-side test** is the decisive proof; **roll-forward-only** (revert a
  bad bump with a forward commit).
- **Home (owner-decided 2026-06-21, four-lenses pass):** a **practice-core `pdr_kind: pattern` PDR** in
  `.agent/practice-core/decision-records/` — portable (this is how any Practice-bearing repo should run
  dependency currency) and **Oak-bound** (flows back via the bidirectional-node policy). Currently captured in
  [`../../plans/current/dependency-currency.md`](../../plans/current/dependency-currency.md) (controlling) +
  five `distilled.md` entries.
- **Trigger (sharpened, owner-decided 2026-06-21):** graduate at **dependency-currency lane close — after the
  full DC2–DC5 emission tier completes** (not now). Rationale: DC1 (crown jewel, 2026-06-21) is the confirming
  second execution, but DC2 (IR-input vendor reconciliation) and DC3 (emission-formatter diff) still exercise
  parts of the method DC1 did not, and lane-close is the natural conservation moment (the plan moves to
  `complete/`, which would otherwise orphan the method). Instances so far: the low-risk tier
  (DC0/DC0b/DC6/DC7/DC8) and the DC1 emission crown jewel.
- `[captured: 2026-06-21 | source: dependency-currency lane (Woodland Bending Glade / dc3825); home+trigger sharpened 2026-06-21 (Soaring Lifting Current / f7e30d, owner four-lenses pass)]`

## dissolve-owner-gating-with-four-lenses → PDR amendment (candidate)

- **Substance:** before surfacing a question as owner-gated, run it through **strict / everywhere / all-the-time
  / long-term-architectural-excellence**; a question only survives to the owner if its defensible outcomes
  genuinely diverge under those lenses (a real product/strategy/governance fork). Engineering-correctness
  questions almost always collapse to one determination — present the verdict, don't ask. Owner directive
  2026-06-21 (twice this session). It is a **sharpening of existing doctrine** (`present-verdicts-not-menus`
  rule + PDR-057 apply-don't-ask + PDR-058 stop-inventing-optionality), not wholly new.
- **Candidate home:** an amendment to PDR-057/PDR-058 (or `present-verdicts-not-menus.md`) adding the four-lens
  dissolution test; possibly a `pdr_kind: pattern`. Currently captured in user-memory
  `dissolve-owner-gating-with-four-lenses` + the napkin.
- **Trigger:** graduate on a SECOND independent instance (a future session where the lenses dissolve a gated
  item), OR owner-graduate now (owner stated the doctrine and is the Practice-governance authority). Instance 1:
  the 2026-06-21 four-lenses decision-pass (Q-006 + the currency-PDR home/timing dissolved; only the Node-support
  stance + Oak-governance survived).
- `[captured: 2026-06-21 | source: owner four-lenses decision-pass (Soaring Lifting Current / f7e30d)]`
- **INSTANCE 2 FIRED (2026-06-26, Coppery Warming Magma / 48b4a5):** I manufactured an "OWNER DISPOSITION"
  gate for `pr-watch`/`install-cursor-statusline` instead of classifying them BRING; owner corrected with the
  bring-by-default directive (long-term + parity lens dissolves it to "bring"). Trigger condition met — this
  candidate is now **due** (second independent instance; owner may also graduate directly). Same family as the
  transplant-completeness candidate below (both are "acting on incomplete context").

## transplant-completeness — bring the iceberg → PDR pattern (candidate)

- **Substance:** a transplanted capability is complete only when its supporting infrastructure (script proxies,
  template libraries, catch-validators) resolves. An "incomplete transplant" presents as doc-drift, but the cure
  is the OPPOSITE of a doc-patch: **bring the missing infrastructure** so the reference resolves — patching the
  doc deletes the reference and hides the gap. The structural enforcement is a validator that fails the gate on a
  dangling reference; the iceberg must be enumerated TRANSITIVELY (a restored proxy can call further-dropped
  infra). Generalises to: **a capability is only as good as the supporting context it carries** (the session
  through-line — the same shape recurred at the Oak pin, the hollow skills, the recursive proxies, and twice in
  my own reasoning). Owner-named 2026-06-26.
- **Candidate home:** a Practice-governance PDR with `pdr_kind: pattern` (portable — every Practice-bearing repo
  that hydrates from another faces this). Currently lives in `transplant-completeness-supporting-infrastructure.md`,
  the `oak-backflow/castr-innovations-ledger.md` insights table, the thread standing decision, and the napkin.
- **Trigger:** graduate after the transplant-completeness program lands a second sub-program cleanly (proving the
  pattern generalises beyond the first instance), OR owner-graduate now (owner named the principle). Instance 1:
  the commit/plan-skill hollow-transplant gaps + the recursive proxy iceberg (2026-06-26, this session).
- `[captured: 2026-06-26 | source: transplant-completeness program (Coppery Warming Magma / 48b4a5)]`
