# Zod Round-Trip Limitations

**Status:** Permanent reference  
**Last Updated:** 2026-03-09  
**Related:** [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md), [ADR-032](../architectural_decision_records/ADR-032-zod-input-strategy.md), [ADR-035](../architectural_decision_records/ADR-035-transform-validation-parity.md), [ADR-038](../architectural_decision_records/ADR-038-object-unknown-key-semantics.md)

---

## Purpose

This document is the permanent reference for structural limitations and accepted trade-offs in the Zod → IR → OpenAPI/JSON Schema → IR → Zod pipeline.

Plans are ephemeral. This file exists so contributor-facing technical truth does not depend on active or archived plan documents.

Each unresolved limitation below is documented with:

- the current accepted behavior
- the concrete impact
- the underlying cause
- a minimal example
- the shape of a possible fundamental answer

---

## Resolved: Optional Recursive Properties

Optional recursive getter properties were previously dropped during the **first Zod parse**.

Resolved behavior:

- Optional recursive refs now survive the first parse as direct `$ref` properties.
- Optionality is represented only through parent `required` omission.
- Generated Zod reconstructs canonical getter output like `get left() { return TreeNode.optional(); }`.

Durable rule:

- No new IR field is required for optional recursive refs.

Historical diagnosis note:

- Direct recursive refs were never the broken case. The parser already handled patterns like `get subcategories() { return z.array(Category); }`.
- The actual parser-stage defect was specific to identifier-rooted wrapper chains such as `TreeNode.optional()`, which were previously not recognized as recursive refs.

See:

- [ADR-032](../architectural_decision_records/ADR-032-zod-input-strategy.md)
- [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md)

---

## Resolved: Nullable / Nullish Recursive Properties

Nullable and nullish recursive getter properties were previously dropped as well.

Resolved behavior:

- Nullable and nullish recursion now survives through the first parse and through OpenAPI / JSON Schema detours.
- The durable IR representation is existing composition IR:

```yaml
anyOf:
  - $ref: '#/components/schemas/LinkedListNode'
  - type: 'null'
```

- Parent requiredness distinguishes `.nullable()` from `.nullish()`.
- Generated Zod reconstructs canonical getter output like `.nullable()` and `.nullish()`.

Durable rule:

- Nullable recursive refs should use existing composition IR before any new IR field is considered.

See:

- [ADR-032](../architectural_decision_records/ADR-032-zod-input-strategy.md)
- [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-035](../architectural_decision_records/ADR-035-transform-validation-parity.md)

---

## Limitation: Recursive Unknown-Key-Preserving Output Still Fails Fast

Recursive object schemas still cannot safely emit unknown-key-preserving output (`.passthrough()` or `.catchall(...)`) in canonical generated Zod.

### Current Accepted Behavior

- Zod parsing preserves `strict`, `strip`, `passthrough`, and `catchall` distinctly in IR.
- OpenAPI / JSON Schema preserve strip vs passthrough through `x-castr-unknownKeyBehavior` when required.
- Non-recursive Zod generation emits the exact unknown-key method for all four modes.
- Recursive strip remains supported via bare `z.object({...})`, which is strip-mode by default in Zod.
- Recursive `.passthrough()` and recursive `.catchall()` fail fast with explicit generation errors.

Architecture status:

- The parser/IR/cross-format loss has been remediated.
- The remaining limitation is now a narrow **writer/runtime construction boundary**.
- Durable investigation and policy live in [recursive-unknown-key-semantics.md](./recursive-unknown-key-semantics.md) and [ADR-038](../architectural_decision_records/ADR-038-object-unknown-key-semantics.md).

### Impact

- There is no longer any silent semantic downgrade for recursive preserving modes.
- Callers now receive an explicit generation error instead of an apparently green transform with altered parsed output.
- Parsed-output parity is now proven for supported unknown-key cases in Scenario 2 / 4 / 6.
- A caller who needs recursive preserving output in generated Zod must currently stop at IR / OpenAPI / JSON Schema or accept the explicit generation failure.

### Underlying Cause

- In Zod 4, `.passthrough()` and `.catchall()` eagerly evaluate getter-backed object shapes.
- Recursive getters therefore read the schema identifier before initialization completes.
- That runtime behavior blocks safe canonical recursive preserving reconstruction today.
- Recursive strip does not share this limitation if emitted as bare `z.object({...})`, because strip is Zod's default object mode.

### Example

Original intent:

```ts
export const Category = z
  .object({
    name: z.string(),
    get subcategories() {
      return z.array(Category);
    },
  })
  .passthrough();
```

Current behavior:

```ts
// generation throws:
// Recursive object schemas with unknown-key behavior "passthrough"
// cannot yet be emitted safely in Zod.
```

### What A Fundamental Answer Must Solve

- recursive initialization safety
- canonical getter-based output
- parsed-output retention of unknown keys
- typed catchall validation where applicable

Current architectural direction:

- keep preserving semantics in IR and portable artifacts
- keep failing fast for unsupported recursive preserving output until a safe construction strategy exists

See:

- [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-038](../architectural_decision_records/ADR-038-object-unknown-key-semantics.md)
- [recursive-unknown-key-semantics.md](./recursive-unknown-key-semantics.md)

---

## Limitation: UUID v4 Specificity Is Not Preserved

`z.uuidv4()` and `z.uuid()` both normalize to standard `format: 'uuid'`.

### Current Accepted Behavior

- Canonical generated Zod uses `z.uuid()`.
- Version-4 specificity is not preserved because standard OpenAPI / JSON Schema has no portable way to encode it.

### Impact

- Generated schemas may be more permissive than a UUID-v4-specific original.
- IR, OpenAPI, and JSON Schema artifacts cannot distinguish "any UUID" from "UUID v4 only".
- A caller who relied on `z.uuidv4()` for a domain constraint loses that stricter intent after round-trip.

### Underlying Cause

- Standard `format: 'uuid'` captures UUID validity, not UUID version specificity.
- There is no portable standards-based field for "UUID version must be 4".
- Preserving the distinction would require Castr-specific representation beyond the current interchange standards.

### Example

```ts
const original = z.uuidv4();
const generated = z.uuid();

original.safeParse('6ba7b810-9dad-11d1-80b4-00c04fd430c8').success; // false
generated.safeParse('6ba7b810-9dad-11d1-80b4-00c04fd430c8').success; // true
```

The round-tripped schema is broader than the source schema.

### What A Fundamental Answer Must Solve

- A non-standard extension such as `x-uuid-version`, plus IR/parser/writer support.

Any future solution needs to answer:

- whether Castr is willing to use non-standard extensions for portable formats
- whether UUID versioning is a one-off exception or part of a broader "format refinement" design
- whether the standards-compliant loss should remain the accepted behavior

See:

- [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md)

---

## Limitation: `int64` Means `bigint` in Zod 4

Zod 4 `z.int64()` validates `bigint`, not JavaScript `number`.

### Current Accepted Behavior

- Canonical generated Zod uses `z.int64()`.
- Round-trip behavior stays internally consistent.
- Payload fixtures and runtime callers need `BigInt(...)` / `100n`, not JSON numbers.

### Impact

- This is surprising for JSON-oriented workflows, but it is treated as a Zod 4 runtime trade-off rather than a Castr defect.
- JSON payload examples cannot literally encode `bigint`, so fixtures, docs, and transport boundaries need special handling.
- API consumers may expect `integer/int64` to validate ordinary JavaScript numbers and instead hit runtime failures.
- Cross-format parity is preserved inside Castr, but ergonomics degrade at the edge where JSON payloads meet generated Zod.

### Underlying Cause

- Zod 4 intentionally maps `z.int64()` to `bigint` to preserve the full signed 64-bit domain safely.
- JavaScript `number` cannot safely represent the full int64 range.
- OpenAPI / JSON Schema conventions and Zod runtime semantics therefore diverge here.

### Example

```ts
const schema = z.int64();

schema.safeParse(100).success; // false
schema.safeParse(100n).success; // true
```

From an interchange perspective, both of these often originate from the same conceptual schema:

```yaml
type: integer
format: int64
```

### What A Fundamental Answer Must Solve

- preserve full int64 safety with `bigint`, or
- prefer JSON ergonomics by weakening to `number`, or
- introduce an explicit configurable `int64` strategy

See:

- [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md)

---

## Status Matrix

| Topic                                   | Status   | Durable Representation / Decision              |
| --------------------------------------- | -------- | ---------------------------------------------- |
| Optional recursive properties           | Resolved | Direct `$ref` + parent optionality             |
| Nullable / nullish recursive properties | Resolved | `anyOf: [$ref, null]`                          |
| Recursive `.passthrough()`              | Limited  | Cross-layer semantic loss; remediation planned |
| UUID v4 specificity                     | Limited  | Canonicalize to `z.uuid()`                     |
| `int64` runtime type                    | Limited  | Canonicalize to `z.int64()` / `bigint`         |
