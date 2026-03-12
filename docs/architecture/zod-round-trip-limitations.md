# Zod Round-Trip Limitations

**Status:** Permanent reference  
**Last Updated:** 2026-03-11  
**Related:** [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md), [ADR-032](../architectural_decision_records/ADR-032-zod-input-strategy.md), [ADR-035](../architectural_decision_records/ADR-035-transform-validation-parity.md), [ADR-038](../architectural_decision_records/ADR-038-object-unknown-key-semantics.md), [ADR-039](../architectural_decision_records/ADR-039-uuid-subtype-semantics-and-native-only-emission.md)

---

> [!IMPORTANT]
> On 2026-03-11, [ADR-040](../architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md) changed the forward product direction for object schemas to default strict generation, reject-by-default ingest, and one explicit lossy strip-normalization compatibility mode.
>
> That enforcement is now in place. This document keeps only the remaining durable limitations plus the historical context needed to explain why the compatibility path is deliberately lossy.

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

## Resolved: Strict-By-Default Object Enforcement

Current object doctrine is now implemented:

- non-strict object inputs reject by default across Zod, OpenAPI, and JSON Schema ingest
- one explicit compatibility mode may normalize non-strict object inputs to strip semantics
- default generated strict objects emit `z.strictObject({...})`
- compatibility-normalized recursive strip output remains bare `z.object({...})` for runtime safety

The remaining object-related material below is historical context explaining why the compatibility path is intentionally lossy and why preserving recursive passthrough / catchall is no longer the active product target.

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

## Historical Seam: Recursive Unknown-Key-Preserving Output Still Fails Fast

Recursive object schemas still cannot safely emit unknown-key-preserving output (`.passthrough()` or `.catchall(...)`) in canonical generated Zod.

### Current Accepted Behavior

Current forward behavior under ADR-040 is:

- default ingest rejects non-strict object input with an explicit `nonStrictObjectPolicy: 'strip'` hint
- compatibility-mode ingest normalizes strip / passthrough / catchall input to strip IR only
- default strict Zod output uses `z.strictObject({...})`
- compatibility-mode recursive strip output remains supported via bare `z.object({...})`, which is strip-mode by default in Zod

Architecture status:

- The remaining preserving-mode limitation is now historical rather than a forward product gap.
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

Historical architectural direction:

- keep preserving semantics in IR and portable artifacts
- keep failing fast for unsupported recursive preserving output until a safe construction strategy exists
- determine whether getter syntax remains a universal canonical recursion form or whether recursive preserving modes require one tightly-scoped second canonical strategy

Current forward doctrine under ADR-040 is different:

- default ingest rejects non-strict object behavior
- one explicit compatibility mode may normalize non-strict object inputs to strip semantics
- preserving-mode remediation is no longer the primary product target

See:

- [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-038](../architectural_decision_records/ADR-038-object-unknown-key-semantics.md)
- [recursive-unknown-key-semantics.md](./recursive-unknown-key-semantics.md)

---

## Limitation: UUID Subtype Semantics Widen Across Portable Detours

UUID subtype semantics are now preserved in IR, but standard portable detours still widen when the target cannot carry subtype natively.

### Current Accepted Behavior

- Direct native Zod generation preserves supported subtype helpers:
  - `uuidVersion: 4` -> `z.uuidv4()`
  - `uuidVersion: 7` -> `z.uuidv7()`
- Standard OpenAPI / JSON Schema output remains plain `format: 'uuid'`.
- Writers preserve an existing `pattern` if IR already carries it, but they do not synthesize subtype-preserving regex.
- Detours through standard OpenAPI / JSON Schema may therefore widen subtype semantics back to plain UUID.

### Impact

- Direct IR -> Zod is more expressive than before.
- Standard portable artifacts still cannot natively distinguish "any UUID" from subtype-specific UUID semantics.
- A caller who detours subtype-specific UUID schemas through OpenAPI / JSON Schema may receive broader generated Zod on the far side of that detour.

### Underlying Cause

- UUID subtype is now first-class IR truth via `uuidVersion`.
- Standard OpenAPI / JSON Schema still only natively carries `format: 'uuid'`.
- This slice deliberately rejects non-native UUID subtype extensions and synthesized subtype regex as durable portable output.

### Example

```ts
const direct = z.uuidv4(); // IR carried uuidVersion: 4
const viaPortableDetour = z.uuid(); // standard portable detour only carried format: 'uuid'
```

The widening is now an accepted target-capacity limitation, not an IR modeling gap.

### What A Fundamental Answer Must Solve

- A future change would need to justify one of:
  - a native portable standard for UUID subtype/version semantics
  - a newly accepted custom portable extension
  - a broader project-level policy shift away from native-only portable emission

See:

- [ADR-031](../architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-039](../architectural_decision_records/ADR-039-uuid-subtype-semantics-and-native-only-emission.md)

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
| Recursive `.passthrough()`              | Limited  | Writer/runtime reconstruction boundary remains |
| UUID subtype widening                   | Limited  | `uuidVersion` in IR; native-only emission      |
| `int64` runtime type                    | Limited  | Canonicalize to `z.int64()` / `bigint`         |
