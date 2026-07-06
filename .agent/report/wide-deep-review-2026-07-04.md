# Wide & Deep Review — 2026-07-04

**Reviewer:** Fragrant Twining Glade (claude-code / claude-fable-5 / 5367e2)
**Reviewed at:** `main` @ `8bfc858`, branch `feat/initial-castr-review`
**Method:** firsthand reading of doctrine, product source, and the 2026-06-04 deep-review
report; firsthand reproduction of every open Critical against today's built `dist`;
deterministic inventory sweeps delegated to read-only subagents with load-bearing numbers
re-verified firsthand; all speculative analysis done firsthand. Full `pnpm check` run this
session: **green, exit 0** — on the same tree where the reproductions below succeeded.

---

## 1. What this repo is

The stated product: **@engraph/castr**, a schema compiler — `Any Input → Parser → IR →
Writers → Any Output` across OpenAPI / Zod / JSON Schema / TypeScript / MCP tools, with a
doctrine of lossless, deterministic, strict, fail-fast transformation.

The measured reality is that the repo contains **two products of comparable weight**, only
one of which has been named:

| Estate                                 |                                                         Size | State                                          |
| -------------------------------------- | -----------------------------------------------------------: | ---------------------------------------------- |
| Product compiler (`lib/src`, non-test) |                                                ~35k TS lines | Working scaffold; 5 reproduced Criticals open  |
| Product tests (co-located + suites)    |               ~36k TS lines + snapshot/transform/e2e estates | Green (3,603 tests, 0 skips) but proof-shallow |
| Agent tooling (`agent-tools`)          |                                  ~33k TS src + ~25k TS tests | Live, battle-tested, un-named as a product     |
| Knowledge estate (`.agent` + `docs`)   | ~134k markdown lines; 90 rules, 21 skills, 100 PDRs, 50 ADRs | The most sophisticated part of the repo        |

The second product — the Practice: collaboration substrate (claims/comms/commit-queue),
hook-policy enforcement, validator estate, adapter generators, pr-watch, statusline,
loop-closure meta-validation — was transplanted from Oak and is now co-evolving with a
measured back-flow ledger. It is roughly **twice the size of the compiler it stewards**.

## 2. Verified current state

### 2.1 The five open Criticals are all still live (reproduced 2026-07-04)

Each was re-executed firsthand against today's `main` build (probe outputs abridged):

| ID  | Claim (2026-06-04)                                                | Today   | Evidence                                                                                                        |
| --- | ----------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| C2  | Security "A AND B" round-trips as "A OR B"                        | ✅ live | `[{apiKey:[],oauth2:['read']}]` → `[{"apiKey":[]},{"oauth2":["read"]}]`                                         |
| C3  | Component `Basic.Thing` emitted as `Basic_Thing`, `$ref` dangling | ✅ live | keys `['Basic_Thing','Ref']`; ref still `#/components/schemas/Basic.Thing`                                      |
| C4  | `serializeIR → deserializeIR` throws on empty `properties: {}`    | ✅ live | `THREW: Invalid CastrDocument structure`                                                                        |
| C5  | Zod parser silently drops content with `errors: []`               | ✅ live | `z.union([z.string(), z.coerce.number()])` → `errors: []`, `anyOf` has 1 member                                 |
| C6  | Zod writer emits no-op / always-false validators                  | ✅ live | `typeof item === 'integer'` (always false); `dependentSchemas` → `return true`; `if/then/else` dropped entirely |

C1 (packaging/types) is **fixed and structurally gated**: declarations exist at every
`types` target, `./parsers/zod` resolves, and `packaging:check` (`publint --strict` +
`attw`) is wired into CI — the recommended recurrence-proof was installed, not just the fix.

### 2.2 The central paradox, re-proven in both directions

The full local aggregate (`pnpm check`) exited 0 **this session**, minutes after the five
reproductions above. The 2026-06-04 verdict — _green gates coexist with silent data loss
and no-op validators because the defects sit precisely where the tests are shallow_ — is
not historical; it is the present state. One month and ~40 substantive PRs/commit-waves
later, **zero product-defect remediation has occurred** (all effort went to the Practice
transplant, by explicit owner sequencing; that sequencing gate discharged 2026-07-03).

### 2.3 C6 is sharper than "a bug": the placebo validators are deliberate scaffolding

Read firsthand at `lib/src/schema-processing/writers/zod/refinements/object.ts`:
`writeDependentSchemasRefinement` and `writeConditionalApplicatorRefinement` emit
refinements whose bodies are **literally `return true`**, with reassuring user-facing
messages ("additional schema constraints apply"). This is not an accidental defect; it is
knowingly-shipped simulated support — the exact "permissive/fake-success path" the
doctrine forbids, wearing a helpful message. It is worse than absence, because consumers
(and agents reading the code) receive an affirmative signal of enforcement. The interim
cure is small and doctrine-compliant: **throw** (fail-fast) until the real recursion is
built.

### 2.4 New findings from this review (not in the 2026-06-04 catalogue)

| ID  | Finding                                                                                                                                                                                                                                                                                                                                                                       | Class                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| R1  | **JSON Schema parser and writer, and the TypeScript writer, are not publicly reachable.** `parseJsonSchema` / JSON Schema writer / TS conversion are absent from the root export and every subpath (verified against built `dist`). `VISION.md` progress table claims full JSON Schema parser+writer support; the Cross-Cutting Support Rule makes unreachable = unsupported. | completeness / docs-honesty |
| R2  | **The IR is not format-agnostic: every parser computes Zod.** `CastrSchemaNode.metadata.zodChain` carries Zod method-chain strings, populated by the OpenAPI parser (`builder.zod-chain.ts`), the JSON Schema parser (`json-schema-parser.2020-keywords.ts`), and the Zod parser. VISION principle 5 says "the IR knows nothing about OpenAPI, Zod, or JSON Schema."          | architecture / IR purity    |
| R3  | **C2's root is the IR model, not the builder.** `IRSecurityRequirement` (`ir/models/schema.operations.ts:499`) is a flat `{schemeName, scopes}` — it structurally cannot represent AND-groups. The fix is a model change, and it ripples to the writer and MCP security consumers.                                                                                            | confirms/deepens C2         |
| R4  | **Doctrine self-contradictions.** `requirements.md` §Current Focus still lists "JSON Schema — Deferred" while `VISION.md` claims it complete; `principles.md` §Tooling Integration says "no TSDoc lint plugin is wired today" while RS-4 (PR #7) made `tsdoc/syntax` a blocking gate the day before this review.                                                              | doctrine drift              |
| R5  | **`Object.*`/`Reflect.*` ban vs reality:** 147 occurrences in `lib/src` non-test product code against principles.md's FORBIDDEN list (M1 from the prior report, unchanged, still unenforced by lint).                                                                                                                                                                         | doctrine drift              |
| R6  | **Public-surface identity is split-brain.** The root export leads with `generateZodClientFromOpenAPI` (openapi-zod-client heritage: template context, `--api-client-name`, error-expr options) beside the newer IR-compiler surface (`buildIR`/`writeOpenApi`/`serializeIR`). Naming is also split (`CastrSchema` vs `IRZodChainInfo` vs `IRSecurityRequirement`).            | DX / surface architecture   |

R4/R5 matter more here than in a human-only repo: this repo's own distilled lessons name
the _inherited-classification_ failure family — agents treat repeated doctrine claims as
truth. A ✅ that is false is an active hazard to every future agent session.

## 3. What works well (verified, not assumed)

- **The quality-gate machine is real and fast.** Split CI ~5 min fail-closed; local
  aggregate 71 s cache-warm; hardened pre-commit/pre-push chains that have demonstrably
  fired in anger and caught real defects (hollow transplant actions, formatter drift,
  missing turbo edges).
- **Type discipline is genuine.** No `as`/`any`/`!` in product code, enforced; the
  boundary-validation pattern (ADR-020) is applied thoughtfully (e.g. the vendor
  plugin-shape predicate).
- **Determinism engineering in the OpenAPI writer** (stable sorting, byte-equality
  assertions) is careful work.
- **The knowledge system compounds.** Napkin → distilled → rules/PDRs graduation
  demonstrably changes future behaviour (the same failure families stop recurring);
  drift-detection is increasingly structural (generated indexes, loop-closure
  meta-validator, reference-direction validator).
- **The prior review itself** (`initial-review/`) is exemplary: executable claims,
  reproduction appendix, rejected-findings log. This review re-ran its probes and every
  one reproduced exactly.
- **Packaging remediation (C1) closed the loop** — fix + publint/attw gate, so that class
  cannot silently recur.
- **The multi-agent collaboration substrate works.** Claims/comms/commit-queue survived
  real n=3 concurrent windows with zero lost writes; the residue in the queue is
  self-documenting failure-mode evidence, not corruption.

## 4. What doesn't work / what's missing

1. **The five Criticals** (§2.1) — all in the public API, one security-relevant (C2).
2. **The proof posture** — the root cause the prior report named. Parsers are tested for
   "IR field populated", writers for substring presence; almost nothing executes the
   generated validators or round-trips the edge cases. The remediation-02 harness exists
   as a plan only.
3. **Unreachable claimed surfaces** (R1) — JSON Schema in/out and TS out are internal-only.
4. **IR purity debt** (R2) plus the legacy template/rendering stratum (R6) — the
   architecture documents one compiler; the code contains a compiler _and_ a survivor of
   its predecessor.
5. **No conformance corpus.** Nothing runs the official JSON-Schema-Test-Suite or an
   OpenAPI corpus against the writers; the corpus-analysis-suite plan is deferred.
6. **No release path.** `publish.yml` was deleted; no semantic-release/changesets decision;
   version 1.18.3 has no provenance chain to published artefacts.
7. **No performance posture.** No benchmarks anywhere; unknown behaviour on large specs.
8. **Error-model migration named but not started** — Q-010 ruled `Result<T,E>` composes
   with fail-fast; the D4 seams still throw bare strings.

## 5. Remediation posture

The 2026-06-04 roadmap (`09-remediation-roadmap.md`) remains correct and is endorsed;
Phase 0 is done. The ordering principle — **install the proofs that turn silent bugs red
before fixing the bugs** — should now execute as remediation-02. Adjustments from this
review:

- **Add interim fail-fast to the placebo refinements immediately** (small diff, can land
  with the first harness PR): converts silent-wrong to loud-honest while real
  implementations are built (§2.3).
- **Prioritise C2 among the fixes** (security semantics weakening) and note it requires
  the IR model change (R3), so schedule it as its own slice.
- **C4 is a three-line fix** (`isRecord`) with outsized public-surface impact.
- **Fold R1 into the honesty phase**: either export the JSON Schema/TS surfaces or mark
  them unsupported — one honest line either way.
- **Reconcile the doctrine tables** (R4) in the same pass, and decide M1/R5 (enforce the
  `Object.*` ban with lint, or amend the doctrine — the strictest-party rule applies).

## 6. Emergent patterns — what is being built that hasn't been named

### 6.1 A multi-verb fidelity compiler (already discovered, not yet acted on)

The zod-compiler research (`.agent/research/zod-compiler/`) already reached this:
castr's real surfaces are **doctor, upgrade, transform, validate** (all implicit in code
today) plus a net-new **check** verb; and the keystone mechanism is **representability
computed as data, policy decided separately**. Verified firsthand: the embryo exists as
`schema-processing/compatibility/integer-target-capabilities*` — for integers only. The
generalisation (a target-capability matrix over all IR features × all writers) is the
single most valuable architectural move available: it dissolves the fail-fast/semantic-
preservation decisions from scattered writer code into one auditable model, gives
`castr check` its data, and yields the metric that aligns the whole product —
**preservation coverage % per input→output pair**. That metric is also the honest cure
for the support-claims problem: claims become computed, not asserted.

### 6.2 The second product: an agentic-engineering kernel

`agent-tools` + the Practice estate is a coherent, extractable product: multi-agent
coordination (claims, comms, heartbeats, escalations), safe concurrent gitting
(commit-queue, hook-policy), enforcement infrastructure (validator estate, loop-closure
meta-validation, adapter generation for four agent platforms), and observability
(statusline, pr-watch, TUI dashboard). It has real multi-repo evidence (the Oak back-flow
ledger) and survives contact with reality daily. Nobody has named it, given it a roadmap,
or decided its boundary. Naming it changes decisions: what gets invested, what gets
extracted, what Oak-parity even means once the flow reverses.

### 6.3 The genotype/phenotype gene flow

The owner's genotype (portable Practice Core) / phenotype (repo-local expression) model,
plus the live Oak↔castr back-flow ledger, is quietly building a **multi-repo practice
germline** — doctrine that evolves under selection in one repo and propagates as
abstraction to others. The structures tending-towards-but-not-reached: automated
back-flow (today it is a hand ledger), cross-repo drift detection, and versioned
Practice-Core releases.

### 6.4 The unifying thesis neither product has stated

Both products are the same idea in different domains: **a claim is only as good as its
machine-checkable proof**. The compiler's doctrine (lossless/fail-fast must be proven by
round-trip and executed-validator tests) and the Practice's hardest-won lessons
(green-gates-mask-gaps, prove-it-fires, loop-closure-not-artefact-presence,
inherited-classifications-must-be-measured) are one thesis. The repo is a working
laboratory for **verified-claims engineering** — trust infrastructure between assertion
and artefact — with the compiler as its product-level instance and the Practice as its
process-level instance. This also frames the current moment honestly: a month of
Practice-building while five known Criticals aged is a **wager that the instrumented
practice out-performs conventional development on product quality. The wager is currently
unsettled — remediation-02 executed through the Practice is precisely the experiment that
settles it.**

## 7. Small changes with big impacts

| #   | Change                                                                                                                                              | Size      | Impact                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------- |
| 1   | `isRecord` fix + empty-`properties` fixture (C4)                                                                                                    | ~3 lines  | Un-breaks the public persistence surface                             |
| 2   | Fail-fast throws replacing the placebo refinements (C6 interim)                                                                                     | small     | Silent-wrong → loud-honest immediately                               |
| 3   | Export (or explicitly unsupport) `parseJsonSchema` / JSON Schema writer / TS writer (R1)                                                            | ~1 line   | Docs and surface agree; a whole claimed format becomes real          |
| 4   | Adopt the official **JSON-Schema-Test-Suite** as a conformance corpus for the JSON Schema writer + generated-Zod validators                         | bounded   | Thousands of behavioural proofs for free; C6-class bugs become loud  |
| 5   | A **doctrine-claims validator**: every ✅ / "MUST … with tests proving" line in `requirements.md` must cite a resolvable test; wired into the gates | small–med | Structural cure for R4-class drift; extends the loop-closure pattern |
| 6   | Reconcile the R4 contradictions (two table edits, one section rewrite)                                                                              | trivial   | Stops agents inheriting false claims today                           |
| 7   | Name the second product (a README/VISION for `agent-tools` + Practice)                                                                              | zero code | Changes investment, extraction, and parity decisions                 |
| 8   | Generalise `integer-target-capabilities` → representability matrix                                                                                  | medium    | The architectural keystone (§6.1) — everything else hangs off it     |

## 8. Shape of future enhancement

Recommended order (consistent with the live continuity spine; merges cleanly with it):

1. **Remediation-02 proof harness** (round-trip matrix + generated-validator execution +
   items 1–2 above landed with it). Red-first against the known defects.
2. **Fix Criticals to green** (C4 → C6/C5 → C2-with-IR-model-change → C3), one PR each.
3. **Honesty wave**: R1, R4, R5/M1 decision, item 5's doctrine-claims validator.
4. **Surface architecture**: execute the verb-model plan (`plans/future/`) with the
   representability matrix as its core; retire or quarantine the template/rendering
   stratum behind the `transform` verb; unify naming (`Castr*`).
5. **Conformance + corpus**: JSON-Schema-Test-Suite, then the deferred corpus-analysis
   suite; publish preservation-coverage as the product's headline metric.
6. **Name and bound the second product**; decide extraction criteria (ADR-048's
   value-gate pattern applies to this split too).
7. **Release automation** when something is worth releasing (post-harness).

---

_Probe scripts for §2.1 ran against `lib/dist` at `8bfc858`; they follow
`appendix-A-reproductions.md` §A.3/A.5 and reproduce verbatim. This review deliberately
re-used the 2026-06-04 report's finding IDs (C1–C6) and extends them with R1–R6._
