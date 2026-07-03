# Metacognitive reasoning trail (do not discard)

This section preserves _how_ the conclusions in this research home were reached, per
[`.agent/directives/metacognition.md`](../../directives/metacognition.md). It is the
part most likely to be cut and most expensive to re-derive — it is kept as its own
durable file for exactly that reason.

**Two errors made and corrected mid-session:**

1. **Flattening.** Castr was first described as "transform + a bit of doctor" with
   the assertion "Castr doesn't execute validation." Wrong — there is a full
   `ir/validation/` validator suite, `upgrade-validate.ts`, `openapi-validator.ts`
   (AJV output validation), `doctor/preflight-validator.ts`, and validation-parity
   rigs that run real data. **Root cause:** letting the _thin public surface_ (one
   CLI verb `castr <in> -o <out>`; a grab-bag of root exports) stand in for the
   _actual responsibilities_. The capabilities exist; their articulation doesn't.
2. **Dogma.** Compiler atomisation was first dismissed because "there's an Accepted
   ADR." That is argument from authority, and it was _imprecise_ authority — ADR-043
   is about runtime/framework companions, not a compiler-internal split. **Root
   cause:** status-quo bias dressed as principle, to avoid re-opening a question.

**The insight that ties the two analysis points together:** they are the same lesson
at two altitudes. "Surfaces are real but implicit" and "package boundaries are a
value question" are linked by a dependency: **you cannot honestly judge atomisation
until the verb model is explicit, because the verb model is what reveals where the
real seams are. You atomise along articulated contracts, not along a blur.** Hence
the plan sequences surface articulation _before_ the atomisation decision (see the
future surface-architecture plan and ADR-048's gate).

**The four metacognition questions, answered:**

- _What changed?_ Castr reframed from "a transformer" to "a multi-verb fidelity
  compiler whose public surface under-represents it"; atomisation reframed from
  "closed" to "open, gated on contract stability."
- _Why?_ The analysis anchored on existing artifacts (one CLI verb; an ADR) instead
  of on what the system does and what creates value.
- _Would I solve it differently now?_ Yes — surfaces first, diagnostics as
  connective tissue, atomisation as a value-gated decision the surface work makes
  answerable.
- _Outcome → impact → value?_ Explicit verbs + shared diagnostics + value-gated
  split → public surface matches reality and the IR↔adapter boundary becomes a
  tested contract → **trust** (strictness becomes _observable_ via `check`),
  **adoptability** (lean core embeds in Oak/SDK), **cheap optionality** (atomise
  when proven, because seams are already real).
