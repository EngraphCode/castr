# Plan (Future): Castr Surface Architecture & Multi-Verb Fidelity-Compiler Model

**Status:** ⚪ Planned (Proposed — not yet executed; verify before acting)
**Created:** 2026-06-19
**Last Updated:** 2026-06-19
**Source research:** [`.agent/research/zod-compiler/`](../../research/zod-compiler/) (comparison with `gajus/zod-compiler`)
**Decision raised:** [ADR-048](../../../docs/architectural_decision_records/ADR-048-compiler-internal-split-scope-and-value-gate.md) (compiler-internal split — Proposed, gated)
**Atomic sub-plan:** [`castr-check-verb.md`](./castr-check-verb.md) (Phase D — the net-new `check` verb)

> **This is a proposal, not a commitment.** It derives from a research comparison
> (treat as input, verify before acting). It treats current code design as
> changeable where change earns value (prerelease). Nothing here is activated:
> the one primary active plan remains the Practice transplant. Activate via the
> normal lifecycle when the owner sequences it.

---

## Goal

Make Castr's real responsibilities **explicit** as a small set of verbs, with a
single representability/diagnostics substrate underneath them, so that:

- the public surface matches what the system actually does;
- "what can/can't be preserved per `(source → target)` pair" is computed data, not
  thrown control flow;
- the IR↔adapter boundary becomes a tested contract — the prerequisite that makes
  the compiler-internal-split question (ADR-048) _answerable_ rather than dogmatic.

## User Impact To Optimise For

- **Trust** — strictness becomes _observable_ (via `castr check` coverage and
  published per-pair divergence tables), not just asserted.
- **Adoptability** — a lean, articulated core can embed in the Oak SDK / Phase 5
  companions without dragging heavy deps.
- **Cheap optionality** — atomise packages only when proven, because the seams are
  already real and exercised.

## Corrected mental model: Castr as a multi-verb fidelity compiler (research §5)

Castr already performs all of these; only **check** is net-new. Each is a distinct
operation with a distinct contract, currently implicit in code.

| Verb          | What it does                                                                                     | Exists today? | Where (verified)                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **doctor**    | Repair/normalise malformed input; preflight diagnostics                                          | ✅ implicit   | `shared/doctor/` (`preflight-validator.ts`, `runtime-diagnostics.ts`, `repairOpenApiDocument`)                               |
| **upgrade**   | Canonicalise 3.0/3.1/3.2 → 3.2.0, validating as it goes                                          | ✅ implicit   | `shared/load-openapi-document/upgrade-validate.ts`, `validation-errors.ts`, path-template & additional-operations validation |
| **transform** | any-format → IR → any-format                                                                     | ✅ (core)     | `parsers/*`, `writers/*`, `ir/*`                                                                                             |
| **validate**  | IR-invariant validation; output (AJV) validation; runtime data validation/parity                 | ✅ implicit   | `ir/validation/validators.*`, `writers/openapi/openapi-validator.ts`, validation-parity rigs                                 |
| **check**     | Semantic-preservation report per `(source→target)` pair; coverage %, findings, round-trip status | ❌ net-new    | builds on `doctor` + ADR-027/035 rigs + the new representability map ([`castr-check-verb.md`](./castr-check-verb.md))        |

The current public surface (one CLI verb; grab-bag exports such as
`generateZodClientFromOpenAPI`, `writeOpenApi`, `loadOpenApiDocument`,
`getZodSchema`) hides this. **Prerelease status means the surface can be reshaped to
match reality without migration cost.**

## Scope — phases (research §6)

Sequenced so each phase de-risks the next. Foundational → dependent. **None of
these requires atomisation** — they make the seams _explicit_, which is the
prerequisite for the ADR-048 gate.

### Phase A — Representability as data (the keystone refactor)

Change the writer traversal from **throw-on-first** to **compute-then-decide**.

- Introduce a pure pass per target: `assess(ir, target) → RepresentabilityMap`,
  where each IR node maps to `{ kind, path, reason? }` over the node-kind set in
  [`comparison.md` Appendix B](../../research/zod-compiler/comparison.md)
  (`native | normalised | runtime-helper | widened | unsupported | impossible`).
  Modelled on zod-compiler's `FastGen → string | null` eligibility propagation and
  its typed `FallbackIR.reason`, **but stored in a per-target plan layer, not the
  IR**.
- Writers consume the map. **Fail-fast becomes a policy applied to the map**
  (default: reject on any `unsupported`/`impossible`), not control flow inside
  traversal. Strict-by-default doctrine is preserved exactly — nothing widens,
  invents, or silently drops; the difference is the map is computed _before_ the
  policy decision, so the full set of problems is known.
- **Acceptance:** existing fail-fast behaviour is byte-identical for
  currently-supported inputs; for unsupported inputs the error now enumerates _all_
  offending paths, not just the first; all quality gates green (`pnpm check:ci`);
  proof-first (failing test before fix), per the repo TDD mandate.

### Phase B — `TargetPlan<T>` layer

- Promote the `RepresentabilityMap` into a typed `TargetPlan<"openapi" | "zod" |
"json-schema" | "typescript" | "validators" | "mcp">`. The plan is the single
  source for: (1) writer codegen decisions, (2) `check` reports, (3) published
  divergence tables. **Canonical IR stays format-neutral** (research §3 Altitude-2
  nuance — putting representability in `CastrDocument`/`CastrSchema` would corrupt
  it).
- Decision to record: is `TargetPlan` public API and serialisable? Recommend
  **serialisable, semi-public** (it is the contract companion/Oak packages consume
  to stay honest). See open questions.

### Phase C — Shared diagnostics substrate

- One `Diagnostic` model (see [`comparison.md` Appendix C](../../research/zod-compiler/comparison.md))
  emitted by **every verb**: doctor (repairs), upgrade (version deltas), validate
  (invariant/output failures), transform (the plan's unsupported/impossible nodes),
  check (aggregate). This is the connective tissue; it unifies error reporting that
  is currently per-subsystem and ad hoc.

### Phase D — `castr check` (the net-new verb)

Delivered as the atomic sub-plan [`castr-check-verb.md`](./castr-check-verb.md).
Coverage is computed from the `TargetPlan` (Phase B), never a parallel path.

### Phase E — Explicit verb surface (public API reshape)

- Promote **doctor / upgrade / transform / validate / check** to first-class CLI
  subcommands and coherent programmatic namespaces, replacing the grab-bag exports.
  Preserve a thin compat shim only if cheap; prerelease means it is not obligatory.
- **Acceptance:** README + docs describe the verb model; each verb has a documented
  contract and emits the shared `Diagnostic` model.

### Phase F — Published per-pair divergence tables

- Generate the behavioural-divergence table (research §3 Altitude-4 lesson) **from
  the `TargetPlan` layer**, not hand-maintained, so docs cannot drift from code.
  This externalises the IO-Pair Compatibility Model as a product surface.

**Sequencing rationale:** A is foundational (everything else reads its output); B
generalises A; C unifies reporting; D and F are presentation layers over B/C; E is
the user-facing reshape.

## Relationship to existing doctrine & ADRs

- **Strictness preserved.** The representability map makes the unsupported set
  _visible_; policy still rejects by default (`unsupported`/`impossible`). It must
  never _enable_ silent widening (research §9 R4). Consistent with ADR-040/041 and
  `.agent/rules/input-output-pair-compatibility.md`.
- **Static-only seam preserved.** No move toward runtime-loading Zod contract files
  (ADR-026; research §3 Altitude-5 inverted lesson).
- **Atomisation is out of scope here** and deferred to ADR-048's value-gate. Phases
  A–B are what make that decision answerable; do not pre-empt it.

## Open questions (research §8)

- `TargetPlan`: public + serialisable? (Recommend yes.)
- `check` report shape: zod-compiler's lean shape verbatim vs a richer per-pair
  variant? (Recommend lean-first, extend on demand.)
- JSON Schema output dialect (2020-12 vs Draft-07 for MCP) — should `TargetPlan`
  carry dialect as a target parameter? (Touches ADR-047.)
- Should `validate` expose runtime data-validation (parity) as a public verb, or
  remain proof-only?
- CLI compatibility: keep `castr <in> -o <out>` as sugar for `castr transform`, or
  drop it (prerelease)?

## Risks (research §9)

- **R1 — Phase A scope creep** (touches every writer). Mitigate: target-by-target
  behind the policy boundary; byte-identical output for supported inputs is the gate.
- **R2 — Diagnostics divergence.** Mitigate: single source (Phase B), enforced by
  Phase F generating tables from it.
- **R3 — Premature atomisation.** ADR-048's gate exists to prevent this.
- **R4 — Strictness erosion.** See doctrine note above.

## Acceptance / next-agent checklist (research §10)

1. Re-pin both repos to exact commits; re-confirm OpenAPI latest from OAI.
2. Re-read [`corrections.md`](../../research/zod-compiler/corrections.md) before
   touching anything the prior report recommended — several "do this" items are
   already done.
3. Implement **Phase A** as a self-contained slice (TDD; existing gates green)
   before B–F.
4. Keep ADR-048 (atomisation) **Proposed/gated**; do **not** split packages yet.
5. Fix the stale `lib/package.json` `repository`/`homepage` URLs opportunistically.

## Roadmap wiring

This plan and [`castr-check-verb.md`](./castr-check-verb.md) are forward proposals;
when the owner sequences them, surface them in
[`roadmap.md`](../roadmap.md) and activate via the normal lifecycle (one primary
active plan at a time — currently the Practice transplant).
