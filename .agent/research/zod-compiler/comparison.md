# zod-compiler at every altitude

The comparison the prior report skipped — `@engraph/castr` against
[`gajus/zod-compiler`](https://github.com/gajus/zod-compiler) at five altitudes,
from low-level code mechanisms up to intent. See [`README.md`](./README.md) for
provenance, verification status, and the homing map.

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

## Altitude 1 — low-level code mechanisms

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

## Altitude 2 — model / seam definitions

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

## Altitude 3 — architecture

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

## Altitude 4 — conceptual approach

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

## Altitude 5 — intent

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

## Lower-novelty items (recorded for completeness)

- Recursion: zod-compiler `RecursiveRefIR` / `RecursionTargetIR(refId)` + a
  `recTargets` name table. Castr already has native recursion (getter syntax,
  Session 3.1b) + `dependencyGraph` + `circularReferences`. Same idea, already present.
- `DiscriminatedUnionIR` precomputes a discriminator→case dispatch table for O(1)
  validation. Irrelevant to Castr (Castr doesn't execute; it emits Zod, which
  dispatches).

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
