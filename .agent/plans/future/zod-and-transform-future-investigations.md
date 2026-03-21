# Future Investigation: Zod and Transform Architecture Threads

**Status:** Future — no immediate action required
**Created:** 2026-03-21
**Related:** [ADR-038](../../docs/architectural_decision_records/ADR-038-object-unknown-key-semantics.md), [ADR-040](../../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md), [ADR-041](../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md), [ADR-035](../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)

---

This file consolidates residual investigation threads from three closed-out workstreams. Each thread has a concrete reopen trigger — do not reopen without new evidence.

Closed-out plans that produced these threads:

- [zod-limitations-architecture-investigation.md](../current/complete/zod-limitations-architecture-investigation.md)
- [recursive-unknown-key-preserving-zod-emission-investigation.md](../current/complete/recursive-unknown-key-preserving-zod-emission-investigation.md)
- [transform-proof-budgeting-and-runtime-architecture-investigation.md](../current/complete/transform-proof-budgeting-and-runtime-architecture-investigation.md)

---

## 1. Recursive Preserving-Mode Emission

### Problem

Castr uses **getter syntax** as the canonical recursive construction strategy for Zod output. This avoids circular reference errors by lazily resolving the schema reference at access time rather than at declaration time:

```ts
// ✅ Canonical recursive Zod output — getters defer evaluation
export const Category = z.object({
  name: z.string(),
  get children() {
    return z.array(Category);
  },
});
```

This works for the default object mode (`strip`) because bare `z.object({...})` is Zod's default strip-mode constructor — no method chain is needed.

**The problem occurs when the schema needs to preserve unknown keys.** In Zod 4, chaining `.passthrough()`, `.catchall()`, or `.strict()` onto a getter-backed object **eagerly evaluates** the getter, reading the `Category` constant before its initialisation completes:

```ts
// ❌ Runtime error: Cannot access 'Category' before initialization
export const Category = z
  .object({
    name: z.string(),
    get children() {
      return z.array(Category); // ← getter is read HERE, during .passthrough()
    },
  })
  .passthrough();
```

```ts
// ❌ Same error with .catchall()
export const Category = z
  .object({
    name: z.string(),
    get children() {
      return z.array(Category);
    },
  })
  .catchall(z.string());
```

```ts
// ❌ Same error with .strict()
export const Category = z
  .object({
    name: z.string(),
    get children() {
      return z.array(Category);
    },
  })
  .strict();
```

The `.strict()` case is solved by using `z.strictObject({...})` (a constructor, not a chain), which Castr already emits. But `.passthrough()` and `.catchall()` have no equivalent non-chaining constructor — except `z.looseObject()`.

### The Only Known Viable Candidate

`z.looseObject({...})` is Zod 4's dedicated passthrough-equivalent constructor. It works with getter recursion because it is a constructor call, not a chained method:

```ts
// ✅ Runtime-viable — z.looseObject() is a constructor, not a chain
export const Category = z.looseObject({
  name: z.string(),
  get children() {
    return z.array(Category);
  },
});

// Preserves unknown keys recursively:
Category.parse({
  name: 'root',
  extraKey: 'preserved', // ← kept
  children: [
    {
      name: 'child',
      nestedExtra: 'also preserved', // ← kept recursively
      children: [],
    },
  ],
});
```

**However**, Castr's Zod parser currently rejects `z.looseObject()` as unsupported input, so parser/writer lockstep is not satisfied. If the writer emitted `z.looseObject()`, the parser could not re-ingest it.

### Impact on the Library

1. **Generation fails fast** — under IDENTITY.md doctrine, non-strict object semantics (passthrough, catchall) are rejected ontologies. The Zod writer does not generate them. If future product direction re-introduces non-strict recursive objects, the writer would need to fail fast for recursive passthrough/catchall until a safe emission strategy exists.

2. **Scope is narrow** — this only affects recursive schemas that also need to preserve unknown keys. Non-recursive passthrough/catchall works fine. Recursive strict works via `z.strictObject()`. Recursive strip works via bare `z.object()`.

3. **ADR-040 limits practical impact** — the current product doctrine defaults to strict object generation and rejects non-strict object input unless the caller explicitly opts into strip normalisation. Passthrough and catchall are not the forward product target. A caller who needs them must currently stop at IR / OpenAPI / JSON Schema output, or accept the explicit generation failure.

4. **No silent data loss** — the fail-fast error prevents any scenario where unknown keys are silently stripped from generated Zod that was supposed to preserve them.

### Reopen Trigger

- Zod makes `.passthrough()` / `.catchall()` lazy-compatible with getter shapes
- `z.looseObject()` becomes standard enough to warrant adding parser support
- The project changes IDENTITY.md's strict-only object doctrine

### Evidence

Runtime characterisation tests that previously lived in `lib/src/schema-processing/writers/zod/recursive-unknown-key.runtime.integration.test.ts` were deleted during the IDENTITY alignment (the test covered non-strict object behavior that is no longer part of the product). The full stage map and option comparison live in [recursive-unknown-key-semantics.md](../../docs/architecture/recursive-unknown-key-semantics.md).

---

## 2. Transform-Proof Scheduling

The rescue-loop redesign reduced `pnpm test:transforms` from 25.88s to 6.92s, removing the immediate pressure that motivated this investigation. The doctor proof now runs in ~0.5s isolated (was 23.76s).

Residual questions:

- Whether future heavier proofs need a dedicated serialised or low-concurrency lane
- Whether ADR-035 should absorb a durable proof-budget policy with explicit cost classes
- Whether proof-class scheduling (normal / heavy / pathological) should be reflected in separate configs while preserving a single canonical `pnpm test:transforms` gate

**Reopen trigger:** transform suite runtime exceeds ~15s again, or a new pathological proof is added that destabilises the existing scheduling.

The cost map and doctor runtime diagnosis live in [doctor-runtime-characterisation-and-transform-proof-budget-decision.md](../current/complete/doctor-runtime-characterisation-and-transform-proof-budget-decision.md).

---

## 3. Setup Churn Reduction

The Zod parser's `createZodProject()` is called 8+ times during a single parse operation (once for top-level source, plus additional calls from `zod-parser.object.ts`, `zod-parser.union.ts`, `zod-parser.intersection.ts`, `zod-parser.composition.ts`, `zod-parser.primitives.ts`, `zod-parser.references.ts`, `zod-parser.endpoint.ts`, and `zod-parser.detection.ts`). Each call creates a new in-memory `ts-morph` `Project`, adds a synthetic `zod` declaration file, and creates a source file.

Residual questions:

- Whether a single `Project` could be reused across sub-expression parses without introducing shared mutable state
- Whether declaration caching or a centralised parse session concept would improve cost
- Whether test-harness-only reduction (keeping product architecture unchanged) is sufficient

Currently classified as acceptable isolation overhead. The full transform suite runs in ~7s, and `createZodProject()` has not been profiled as a dominant contributor to non-doctor runtime.

**Reopen trigger:** the transform matrix grows significantly, or profiling shows `createZodProject()` dominates non-doctor transform runtime.

The original investigation questions live in [transform-proof-budgeting-and-runtime-architecture-investigation.md](../current/complete/transform-proof-budgeting-and-runtime-architecture-investigation.md), Tranche 3.
