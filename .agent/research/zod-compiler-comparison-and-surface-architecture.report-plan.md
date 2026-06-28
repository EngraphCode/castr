# Castr × zod-compiler: Comparison, Surface Architecture, and Plan

**Type:** Hybrid session report + forward plan (single-file deliverable)
**Status:** Proposed — not yet executed. Treat as input, verify before acting.
**Date:** 2026-06-19
**Branch of record:** `claude/castr-zod-compiler-review-qpre7n`
**Repo commit at time of analysis:** `393e476` (HEAD of the branch when written)

> **Note to the consuming/homing agent.** This is deliberately one file. It mixes
> provenance, a corrected evaluation of a prior report, a code-level comparison
> with `gajus/zod-compiler`, metacognitive findings, and an executable plan. When
> you integrate it, **split it to its proper homes**: the plan sections belong
> under `.agent/plans/` (likely a new Phase plan + a `castr check`/surface atomic
> plan), the atomisation decision belongs in a new ADR (it supersedes part of
> ADR-043's _scope_, see §7), the zod-compiler findings belong under
> `.agent/research/zod-compiler/`, and the report's correction table belongs with
> the architecture-review provenance. Do not lose the **reasoning trail** (§4) —
> it is the part most likely to be discarded and most expensive to re-derive.

---

## 0. TL;DR

1. The prior "Castr / Zod Compiler Session Report" is **directionally right but stale**:
   several things it framed as future/conceptual already exist in code or in
   Accepted ADRs. Corrections in §2. Do not act on it without those corrections.
2. The genuinely transferable lessons from `zod-compiler` live at the **code and
   model altitude**, not the "packaging discipline" altitude the prior report
   stopped at. The keystone idea: **compute representability as data and propagate
   it; decide policy (fail-fast / fall back / report) separately.** §3.
3. Castr is not "a transformer." It is a **multi-verb fidelity compiler** whose
   real surfaces — **doctor, upgrade, transform, validate** — already exist in
   code but are _implicit_. Only **check** is net-new. Making the verb model
   explicit is the unlock, and it is what reveals where real package seams are. §5–§6.
4. Workspace atomisation is **an open value question, not a closed one**. Judge it
   on value with a written trigger + stability gate (§7). The first real consumer
   that wants a lean embeddable core is the Oak SDK / Phase 5 companions.
5. The metric that aligns everything: **zod-compiler measures _compilation
   coverage %_ against _speed_; Castr should measure _preservation coverage %_
   against _fidelity_.** `castr check` is the fidelity analogue of `zod-compiler check`.

---

## 1. Provenance & verification status

| Claim source                                                                 | Status                       | Evidence                                                                                                          |
| ---------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| HEAD = `393e476`, prior report's claimed commit                              | ✅ verified                  | `git log`                                                                                                         |
| Single workspace (`lib`)                                                     | ✅ verified                  | `pnpm-workspace.yaml`                                                                                             |
| Package `@engraph/castr@1.18.3`, deps incl. ts-morph/mcp-sdk/ajv/scalar/zod  | ✅ verified                  | `lib/package.json`                                                                                                |
| `repository`/`homepage` still point to `jimcresswell/openapi-zod-validation` | ✅ verified (stale)          | `lib/package.json:8,27`                                                                                           |
| Broad semantic IR (`CastrDocument`, `CastrSchema`)                           | ✅ verified                  | `lib/src/schema-processing/ir/models/*`                                                                           |
| OpenAPI canonical **output** target is 3.2.0; 3.1 is input-only              | ✅ verified                  | roadmap "3.x input → 3.2.0 output"; `CastrDocument.openApiVersion`                                                |
| zod-compiler internals (IR, codegen, check)                                  | ✅ verified via source fetch | `gajus/zod-compiler@main` `src/core/types.ts`, `src/core/codegen/context.ts`, `src/cli/commands/check.ts`, README |

**Verification instruction for future agents:** re-pin both repos to exact commits
before implementing. zod-compiler's IR is coupled to Zod internals and will drift.
Re-confirm OpenAPI latest from OAI before treating 3.2.0 as current.

---

## 2. Evaluation of the prior session report (corrections)

The prior report is well-structured and appropriately hedged, but it sampled ~10
files and missed code that changes its conclusions. **Verified corrections** —
future agents should not repeat the prior report's framing:

| Prior report claim                                                                | Reality (verified)                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod-first `defineEndpoint({...})` DSL is "a conceptual sketch, not a decided API" | **Already implemented.** `lib/src/schema-processing/parsers/zod/endpoints/` has `parseEndpointDefinition`, `buildCastrOperationFromEndpoint`, extractors, types, unit tests; exported from `parsers/zod/index.ts`. A top-level `lib/src/endpoints/` module exists (`definition.types.ts`, `parameter-metadata.ts`). Parsed **statically** via ts-morph, no execution. |
| "Draft an ADR for the product/repo + companion boundary"                          | **Already exists:** ADR-043 (Accepted, 2026-04-02), reflected in README + roadmap Phase 5.                                                                                                                                                                                                                                                                            |
| Strictness should _become_ a constitution (Insight 4)                             | **Already is:** "Input-Output Pair Compatibility Model" in `principles.md`, `requirements.md`, `AGENT.md`, `.agent/rules/input-output-pair-compatibility.md`; plus ADR-040/041.                                                                                                                                                                                       |
| Verify whether 3.2.0 is the latest target                                         | Repo **already** canonicalises 3.0/3.1/3.2 → 3.2.0 output. Report **missed** that 3.1 is _input-only_, not a peer output.                                                                                                                                                                                                                                             |
| Split compiler into core/spec/format packages (as if blocked)                     | Initially I said this "conflicts with ADR-043/036." **Corrected:** ADR-043 governs compiler-core vs _runtime/framework companions_, **not** a compiler-internal split. The conflict was overstated. See §7 — it is an open value question.                                                                                                                            |
| `castr check` is the key novel idea                                               | **True and valuable**, but the report overlooked that the _inputs already exist_: round-trip/idempotence proof rigs (ADR-027, ADR-035) and the `doctor` surface. `check` is mostly aggregation + presentation, not greenfield.                                                                                                                                        |
| Heavy `CastrCheckReport` schema proposed                                          | zod-compiler's leaner shape is a better starting point (§3, Appendix A).                                                                                                                                                                                                                                                                                              |

**Accurate in the prior report (keep):** single `lib` workspace; broad
semantic IR; no built-in HTTP client; "API contract compiler" is a sharper
identity than "OpenAPI-to-Zod generator"; companion packages should consume the
same strict diagnostics; premature atomisation is a real risk.

**Minor real defect the report missed:** stale `repository`/`homepage` URLs in
`lib/package.json` (point to the old `openapi-zod-validation` repo).

---

## 3. zod-compiler at every altitude (the comparison the prior report skipped)

**Framing.** Both are compilers with an IR, but they optimise different axes:

- **zod-compiler:** Zod → JavaScript, optimises **execution speed**. _One_ target.
  Metric: **compilation coverage %**. Promise: "2–75× faster, no code changes,
  still a real Zod object."
- **Castr:** any-format → IR → any-format, optimises **semantic fidelity**.
  _Many_ targets. Natural metric: **preservation coverage %**. Promise (proposed):
  "round-trips losslessly, or tells you exactly what it can't — and never invents
  semantics."

> **The mapping that makes zod-compiler legible for Castr:**
> _compilation coverage : speed :: preservation coverage : fidelity._

### Altitude 1 — low-level code mechanisms

- **`FastGen` returns `string | null` (null = ineligible); ineligibility bubbles
  up.** zod-compiler does not throw at the first node it cannot express as a pure
  boolean — it returns `null`, and a parent is fast-path-eligible only if _all
  children_ return non-null. **Representability is computed as data and
  propagated; policy is decided separately.**
  - _Castr today does the opposite:_ writers **throw on the first unsupported
    node** (fail-fast baked into traversal). Correct as _policy_, but it means
    Castr cannot enumerate what _else_ it couldn't represent — it dies at node 1.
  - **Lesson (keystone):** separate "can target T represent node N?" (pure
    computation → typed result) from "what do we do about it?" (fail-fast / fall
    back / report). Fail-fast becomes a _policy applied to_ the representability
    map. This single change makes `castr check` fall out for free and powers
    per-pair divergence tables.
- **Content-addressed dedup:** `effectFnCache` (keyed by source text),
  `sharedSchemas` (structurally-identical subtrees → one shared helper),
  `regexCache`. Lower priority for Castr (codegen-size, not correctness), but the
  concept — **structural hashing to detect repeated anonymous subtrees** — is
  directly useful for naming/reusing inline schemas during OpenAPI→Zod generation.

### Altitude 2 — model / seam definitions

- **`FallbackIR { reason: "transform"|"refine"|"superRefine"|"custom"|"lazy"|
"unsupported"|"coalesced", refIndex? }`.** zod-compiler reifies "I can't compile
  this" as a **first-class IR node carrying a typed reason**. This is exactly the
  prior report's status-taxonomy idea — proven in production — _with a crucial
  nuance the report got wrong:_
  > zod-compiler can put fallback **inside** its IR because its IR is
  > **target-specific** (one target: runtime JS). **Castr's IR is
  > target-independent**, so an equivalent marker must live in a **per-target plan
  > layer (`TargetPlan<T>`), never in `CastrDocument`/`CastrSchema`.**
  > This is the concrete justification for "target plans": the reason Castr needs a
  > separate plan layer is precisely that it has N targets and a canonical IR that
  > must stay format-neutral. Putting representability in the IR would corrupt it.
- **Extraction seam: runtime reflection vs source AST.** zod-compiler's
  `extractSchema()` reaches into Zod's internal `_def` at build time — sees the
  _actually constructed_ schema (including dynamic composition) but is brittle
  against Zod internals and **requires executing user code**. Castr chose the
  other seam: **ts-morph source-AST, no execution** (ADR-026). Trade-off to state
  plainly: Castr cannot see dynamically-constructed schemas, but is immune to
  Zod-internals churn and to build-time side effects. For a strict, deterministic
  tool, Castr's choice is correct (see Altitude 5).

### Altitude 3 — architecture

- **`check` data model (lean, proven) — better than the prior report's heavy one:**
  ```
  JsonSchemaReport { exportName, coverage{total, compilable, percent},
                     fastPath{eligible, blocker?}, fallbacks[{reason, path, hint}] }
  JsonReport { file, schemas[] }
  flags: --json, --fail-under <n>  (exit 1 if minCoverage < n)
  ```
  Castr generalises this one way only: **per `(source → target)` pair** instead of
  per-schema. Note the **`hint`** field carries _actionable remediation_
  ("Extract transform into a separate post-processing step"), not just diagnosis —
  Castr's fail-fast messages already say "Genuinely impossible…"; the lesson is to
  make them _aggregatable and machine-readable_ rather than thrown-and-fatal.
- **`mode: "inline" | "lean"` + `virtual:zod-compiler/runtime`.** Separates
  _what to emit_ from _how to package shared helpers_ (inline everything vs
  reference a shared runtime module). Relevant only if Castr ships runtime
  validation helpers (the `validators.ts` output); if it does, copy this rather
  than reinvent.

### Altitude 4 — conceptual approach

- **Two-phase validation:** zero-allocation fast path for the valid case; lazy
  error-collecting walk only on failure. Doesn't transfer literally (Castr doesn't
  execute validation as its product), but the _concept_ does: **the happy path and
  the diagnostic path are different programs.** Castr currently conflates "emit the
  artifact" with "explain what it couldn't preserve" by throwing inside the emit
  path. Splitting them is the same move as the keystone in Altitude 1.
- **Published behavioral-divergence table.** zod-compiler openly documents where
  compiled output differs from Zod (unknown keys not stripped by default; output
  returned by identity; record iteration only over enumerable string keys).
  Honesty-as-a-feature — the **user-facing artifact** of exactly Castr's IO-Pair
  Compatibility Model. Castr keeps "format tensions" tables _internal_ (roadmap,
  plan docs); it should **publish a per-pair semantic-divergence table** as product.

### Altitude 5 — intent

- **A bounded, measurable promise + ruthless honesty about the boundary.**
  zod-compiler's real discipline isn't packaging; it's "2–75×, no code changes,
  still a real Zod object," followed _immediately_ by the exact fallback list,
  side-effect hazards, and behavioral deltas. Castr's analogue is a **fidelity**
  promise measured by `castr check` coverage.
- **"Still a real Zod object / no code changes" = preserve the user's ecosystem
  surface.** Castr's analogue: generated artifacts stay idiomatic in their target
  ecosystem (real, hand-editable Zod 4; spec-valid OpenAPI). Castr already does
  this (writer/parser lockstep, Zod-4-only output).
- **Build-time side effects — the prior report had this backwards.** It listed
  zod-compiler's mitigations (`ZOD_COMPILER` env guard, `process.exit`
  interception, `include`/`exclude`, content-addressed cache) as things "Castr
  should learn from." But Castr's Zod path is **static ts-morph parsing that never
  executes user modules** (ADR-026; `parseEndpointDefinition` parses source text).
  Castr has already _designed out_ the entire problem class. **Inverted lesson:**
  zod-compiler's side-effect pain is _positive evidence for Castr's static-only
  stance._ Castr should resist any future temptation to runtime-load Zod contract
  files, not import mitigations for a problem it doesn't have.

### Lower-novelty items (recorded for completeness)

- Recursion: zod-compiler `RecursiveRefIR` / `RecursionTargetIR(refId)` + a
  `recTargets` name table. Castr already has native recursion (getter syntax,
  Session 3.1b) + `dependencyGraph` + `circularReferences`. Same idea, already present.
- `DiscriminatedUnionIR` precomputes a discriminator→case dispatch table for O(1)
  validation. Irrelevant to Castr (Castr doesn't execute; it emits Zod, which
  dispatches).

---

## 4. Metacognitive reasoning trail (do not discard)

This section preserves _how_ the conclusions were reached, per
`.agent/directives/metacognition.md`. It is the part most likely to be cut and
most expensive to re-derive.

**Two errors I made and corrected mid-session:**

1. **Flattening.** I first described Castr as "transform + a bit of doctor" and
   asserted "Castr doesn't execute validation." Wrong — there is a full
   `ir/validation/` validator suite, `upgrade-validate.ts`, `openapi-validator.ts`
   (AJV output validation), `doctor/preflight-validator.ts`, and validation-parity
   rigs that run real data. **Root cause:** I let the _thin public surface_ (one
   CLI verb `castr <in> -o <out>`; a grab-bag of root exports) stand in for the
   _actual responsibilities_. The capabilities exist; their articulation doesn't.
2. **Dogma.** I dismissed compiler atomisation because "there's an Accepted ADR."
   That is argument from authority, and it was _imprecise_ authority — ADR-043 is
   about runtime/framework companions, not a compiler-internal split. **Root
   cause:** status-quo bias dressed as principle, to avoid re-opening a question.

**The insight that ties the user's two points together:** they are the same lesson
at two altitudes. "Surfaces are real but implicit" (point 1) and "package
boundaries are a value question" (point 2) are linked by a dependency: **you
cannot honestly judge atomisation until the verb model is explicit, because the
verb model is what reveals where the real seams are. You atomise along articulated
contracts, not along a blur.** Hence the plan sequences surface articulation
_before_ the atomisation decision.

**The four metacognition questions, answered:**

- _What changed?_ Castr reframed from "a transformer" to "a multi-verb fidelity
  compiler whose public surface under-represents it"; atomisation reframed from
  "closed" to "open, gated on contract stability."
- _Why?_ I anchored on existing artifacts (one CLI verb; an ADR) instead of on
  what the system does and what creates value.
- _Would I solve it differently now?_ Yes — surfaces first, diagnostics as
  connective tissue, atomisation as a value-gated decision the surface work makes
  answerable. (The plan, §6–§7.)
- _Outcome → impact → value?_ Explicit verbs + shared diagnostics + value-gated
  split → public surface matches reality and the IR↔adapter boundary becomes a
  tested contract → **trust** (strictness becomes _observable_ via `check`),
  **adoptability** (lean core embeds in Oak/SDK), **cheap optionality** (atomise
  when proven, because seams are already real).

---

## 5. Corrected mental model: Castr as a multi-verb fidelity compiler

Castr already performs all of these; only **check** is net-new. Each is a distinct
operation with a distinct contract, currently implicit in code.

| Verb          | What it does                                                                                     | Exists today? | Where (verified)                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **doctor**    | Repair/normalise malformed input; preflight diagnostics                                          | ✅ implicit   | `shared/doctor/` (`preflight-validator.ts`, `runtime-diagnostics.ts`, `repairOpenApiDocument`)                               |
| **upgrade**   | Canonicalise 3.0/3.1/3.2 → 3.2.0, validating as it goes                                          | ✅ implicit   | `shared/load-openapi-document/upgrade-validate.ts`, `validation-errors.ts`, path-template & additional-operations validation |
| **transform** | any-format → IR → any-format                                                                     | ✅ (core)     | `parsers/*`, `writers/*`, `ir/*`                                                                                             |
| **validate**  | IR-invariant validation; output (AJV) validation; runtime data validation/parity                 | ✅ implicit   | `ir/validation/validators.*`, `writers/openapi/openapi-validator.ts`, validation-parity rigs                                 |
| **check**     | Semantic-preservation report per `(source→target)` pair; coverage %, findings, round-trip status | ❌ net-new    | builds on `doctor` + ADR-027/035 rigs + the new representability map                                                         |

The public surface (one CLI verb; grab-bag exports such as
`generateZodClientFromOpenAPI`, `writeOpenApi`, `loadOpenApiDocument`,
`getZodSchema`) hides this. **Prerelease status means we can reshape the surface to
match reality without migration cost.**

---

## 6. Plan

Sequenced so each phase de-risks the next. Foundational → dependent. This plan
treats current code design as changeable where change earns value (prerelease).

### Phase A — Representability as data (the keystone refactor)

**Change the writer traversal from throw-on-first to compute-then-decide.**

- Introduce a pure pass per target: `assess(ir, target) → RepresentabilityMap`,
  where each IR node maps to `{ kind: "native" | "normalised" | "runtime-helper" |
"widened" | "unsupported" | "impossible", path, reason? }` (Appendix B). Modeled
  on zod-compiler's `FastGen → string | null` eligibility propagation and its
  typed `FallbackIR.reason`, **but stored in a per-target plan layer, not the IR**.
- Writers consume the map. **Fail-fast becomes a policy applied to the map**
  (default: reject on any `unsupported`/`impossible`), not control flow inside
  traversal. Strict-by-default doctrine is preserved exactly — nothing widens,
  invents, or silently drops; the difference is the map is computed _before_ the
  policy decision, so the full set of problems is known.
- Acceptance: existing fail-fast behavior is byte-identical for currently-supported
  inputs; for unsupported inputs the error now enumerates _all_ offending paths,
  not just the first; all quality gates green (`pnpm check:ci`).

### Phase B — `TargetPlan<T>` layer

- Promote the `RepresentabilityMap` into a typed `TargetPlan<"openapi" | "zod" |
"json-schema" | "typescript" | "validators" | "mcp">`. The plan is the single
  source for: (1) writer codegen decisions, (2) `check` reports, (3) published
  divergence tables. Canonical IR stays format-neutral (the §3 Altitude-2 nuance).
- Decision to record: is `TargetPlan` public API and serialisable? Recommend
  **serialisable, semi-public** (it is the contract that companion/Oak packages
  consume to stay honest).

### Phase C — Shared diagnostics substrate

- One `Diagnostic` model emitted by **every verb**: doctor (repairs), upgrade
  (version deltas), validate (invariant/output failures), transform (the plan's
  unsupported/impossible nodes), check (aggregate). Severity, status, path,
  reason, hint (Appendix C). This is the connective tissue; it unifies error
  reporting that is currently per-subsystem and ad hoc.

### Phase D — `castr check` (the net-new verb)

- CLI `castr check <input> --from <fmt> --to <fmt,...> [--round-trip <fmt>]
[--json] [--fail-under <n>]`. Start from zod-compiler's lean report shape
  (Appendix A), generalised per `(source→target)` pair. Reuse the existing
  round-trip/idempotence rigs (ADR-027/035) for `--round-trip`.
- Acceptance: deterministic JSON output; `--fail-under` exits non-zero below
  threshold (CI-usable); coverage computed from the `TargetPlan`, not a parallel
  code path.

### Phase E — Explicit verb surface (public API reshape)

- Promote **doctor / upgrade / transform / validate / check** to first-class CLI
  subcommands and coherent programmatic namespaces, replacing the grab-bag exports.
  Preserve a thin compat shim only if cheap; prerelease means we are not obligated.
- Acceptance: README + docs describe the verb model; each verb has a documented
  contract and emits the shared `Diagnostic` model.

### Phase F — Published per-pair divergence tables

- Generate the behavioral-divergence table (zod-compiler's Altitude-4 lesson) **from
  the `TargetPlan` layer**, not hand-maintained, so docs cannot drift from code.
  This externalises the IO-Pair Compatibility Model as a product surface.

**Sequencing rationale:** A is foundational (everything else reads its output). B
generalises A. C unifies reporting. D and F are presentation layers over B/C. E is
the user-facing reshape. **None of these requires atomisation** — they make the
seams _explicit_, which is the prerequisite for §7.

---

## 7. Atomisation as a value-gated decision (not dogma)

Per the user's correction: a prior decision is not permanent; judge change on
value. The honest position is **gated, not closed.**

**ADR-043 scope clarification.** ADR-043 rules on compiler-core vs _runtime /
transport / framework_ companions. It does **not** rule on whether the _compiler
itself_ splits into `castr-core` + format-adapter packages. A new ADR should
explicitly take up _that_ question and supersede the relevant scope.

**Value of splitting `castr-core` out:**

- Lean, embeddable core — a consumer wanting Zod→IR→OpenAPI should not install
  `ts-morph` (large), `@modelcontextprotocol/sdk`, `ajv`. **Phase 5 / the Oak SDK
  is exactly this consumer.**
- The IR↔adapter boundary becomes a real, tested API instead of an internal import.
- Enables third-party format adapters (e.g. `castr-protobuf`) without forking core.

**Cost:**

- Freezing the IR↔adapter contract while it still churns (the `additionalProperties`
  policy landed the same week as this analysis). Premature = the prior report's Risk 2.
- Monorepo release/versioning overhead.

**Decision gate (write into the new ADR):** split when **both**

1. a concrete consumer needs core-without-heavy-deps (Oak/companion qualifies), **and**
2. the IR↔adapter contract has survived **N (≥2–3) feature cycles unchanged**,

…and _not before_. Internal boundaries are already lint-enforced
(`eslint-plugin-boundaries`, ADR-036/037), so the cost of _waiting_ is low and the
seams are already exercised by Phase A–B. **Phase A–B make this decision
answerable; do not pre-empt it.**

---

## 8. Open questions

- `TargetPlan`: public + serialisable? (Recommend yes — companion honesty contract.)
- `check` report shape: adopt zod-compiler's lean shape verbatim, or the richer
  per-pair variant? (Recommend lean-first, extend on demand.)
- JSON Schema output dialect selection (2020-12 vs Draft-07 for MCP) — should the
  `TargetPlan` carry dialect as a target parameter?
- Should `validate` expose runtime data-validation (parity) as a public verb, or
  remain proof-only?
- CLI compatibility: keep `castr <in> -o <out>` as sugar for `castr transform`, or
  drop it (prerelease)?

## 9. Risks

- **R1 — Phase A scope creep.** The refactor touches every writer. Mitigate: do it
  target-by-target behind the policy boundary; keep byte-identical output for
  supported inputs as the gate.
- **R2 — Diagnostics divergence.** If `check` computes coverage from a parallel
  path instead of the `TargetPlan`, docs and behavior drift. Mitigate: single
  source (Phase B), enforced by Phase F generating tables from it.
- **R3 — Premature atomisation.** §7 gate exists precisely to prevent this.
- **R4 — Strictness erosion.** The representability map must never _enable_ silent
  widening; it makes the unsupported set _visible_, policy still rejects by
  default. Keep "strict, everywhere, all the time."

## 10. Next-agent actions & verification checklist

1. Re-pin both repos to exact commits; re-confirm OpenAPI latest from OAI.
2. Re-read the corrections table (§2) before touching anything the prior report
   recommended — several of its "do this" items are already done.
3. Implement Phase A as a self-contained slice (TDD; existing gates green) before B–F.
4. Open the atomisation ADR with the §7 gate; do **not** split packages yet.
5. Fix the stale `lib/package.json` `repository`/`homepage` URLs opportunistically.
6. Home this document's sections per the note at the top; preserve §4.

---

## Appendix A — `check` report shape (start lean, from zod-compiler)

```ts
type CheckPairReport = {
  source: string; // input identifier
  from: SchemaFormat;
  to: SchemaFormat;
  coverage: { total: number; preserved: number; percent: number };
  roundTrip?: { lossless: boolean; idempotent: boolean; changedPaths: string[] };
  findings: Array<{
    path: string;
    status: NodePlanKind; // see Appendix B
    severity: 'info' | 'warning' | 'error';
    reason: string;
    hint?: string; // actionable remediation (zod-compiler lesson)
  }>;
};
// file-level: { file, pairs: CheckPairReport[] }; flags: --json, --fail-under <n>
```

## Appendix B — `TargetPlan` node kind (per-target, NOT in canonical IR)

```ts
type NodePlanKind =
  | 'native' // 1:1 in target
  | 'normalised' // semantics preserved, shape changed
  | 'runtime-helper' // preserved via emitted runtime check (e.g. Zod .refine)
  | 'widened' // governed widening, must be reported (never silent)
  | 'unsupported' // implementation gap — fail-fast policy by default
  | 'impossible'; // genuinely impossible for this target — always fail-fast

type TargetNodePlan = { path: string; kind: NodePlanKind; reason?: string };
type TargetPlan<T extends SchemaFormat> = { target: T; nodes: TargetNodePlan[] };
```

Modeled on zod-compiler's `FallbackIR.reason` enum, relocated to a per-target layer
because Castr has many targets and a format-neutral IR.

## Appendix C — shared `Diagnostic` model (all verbs emit this)

```ts
type Diagnostic = {
  verb: 'doctor' | 'upgrade' | 'transform' | 'validate' | 'check';
  path: string;
  severity: 'info' | 'warning' | 'error';
  status?: NodePlanKind; // when transform/check-derived
  reason: string;
  hint?: string;
};
```

---

## Appendix D — source map (verified file locations)

- Zod-first endpoint DSL: `lib/src/schema-processing/parsers/zod/endpoints/`,
  `lib/src/endpoints/`
- IR models: `lib/src/schema-processing/ir/models/schema-document.ts`, `schema.ts`,
  `schema.operations.ts`, `schema.components.ts`
- IR validation: `lib/src/schema-processing/ir/validation/validators.*`
- Upgrade: `lib/src/shared/load-openapi-document/upgrade-validate.ts`,
  `validation-errors.ts`
- Doctor: `lib/src/shared/doctor/` (`preflight-validator.ts`, `runtime-diagnostics.ts`)
- Output validation: `lib/src/schema-processing/writers/openapi/openapi-validator.ts`
- Round-trip/parity rigs: ADR-027, ADR-035; `lib/tests-transforms/`
- Doctrine: `.agent/rules/input-output-pair-compatibility.md`, ADR-040/041/043,
  `.agent/directives/principles.md`
- zod-compiler: `gajus/zod-compiler` `src/core/types.ts`,
  `src/core/codegen/context.ts`, `src/cli/commands/check.ts`, README
  </content>
  </invoke>
