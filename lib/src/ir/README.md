# IR (Intermediate Representation)

The **Intermediate Representation (IR)** is the single source of truth for all processed data in Castr.

## Architecture

```
Input (OpenAPI, Zod, etc.) → Parser → IR (CastrDocument) → Writer → Output
```

After parsing, the input document is **conceptually discarded**—only the IR matters. See [VISION.md](../../../.agent/VISION.md).

## Key Files

| File               | Purpose                         |
| ------------------ | ------------------------------- |
| `schema.ts`        | IR type definitions             |
| `validators.ts`    | IR validation functions         |
| `context.ts`       | Parser/writer context utilities |
| `serialization.ts` | JSON serialization helpers      |

## Version Fields

`CastrDocument` has two version fields:

| Field            | Example   | Meaning                                |
| ---------------- | --------- | -------------------------------------- |
| `version`        | `"1.0.0"` | IR schema version (Castr-defined)      |
| `openApiVersion` | `"3.1.1"` | From Scalar `upgrade()` — always 3.1.x |

> **Note:** OpenAPI 3.1.1 was released October 2024. Scalar upgrades all input documents to latest 3.1.x semantics.

## NO CONTENT LOSS Principle

**Inviolable:** All transforms to and from the IR must preserve every aspect of the input document. Format can change, content cannot.

## Related

- [RULES.md](../../../.agent/RULES.md) — Engineering standards
- [requirements.md](../../../.agent/requirements.md) — IR completeness requirements
