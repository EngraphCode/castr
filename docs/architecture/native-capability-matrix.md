# Native Capability Matrix

**Status:** Permanent reference  
**Last Updated:** 2026-04-02  
**Related:** [ADR-041](../architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md), [ADR-039](../architectural_decision_records/ADR-039-uuid-subtype-semantics-and-native-only-emission.md)

---

This matrix records the standards-first native-capability rules that govern Castr's parser and writer behavior.

Legend:

- `native` — the format has a native, standards-aligned representation
- `partial` — there is a nearby carrier, but not an exact semantic match
- `none` — no native representation
- `custom-only` — representable only through custom conventions, which Castr rejects

## Numeric And Date-Time Capability Matrix

| Format              | `number`                | `integer`             | `int64`                | `bigint`                | `date`                             | `date-time` / timestamp                          | Notes                                                                                 |
| ------------------- | ----------------------- | --------------------- | ---------------------- | ----------------------- | ---------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| JSON (RFC 8259)     | `native`                | `partial`             | `none`                 | `none`                  | `none`                             | `none`                                           | JSON has only one numeric carrier: `number`                                           |
| OpenAPI 3.1.x       | `native`                | `native`              | `native`               | `none`                  | `native`                           | `native`                                         | Accepted as a bridge input surface                                                    |
| OpenAPI 3.2.0       | `native`                | `native`              | `native`               | `none`                  | `native`                           | `native`                                         | Current canonical OpenAPI output target                                               |
| JSON Schema 2020-12 | `native`                | `native`              | `none`                 | `none`                  | `custom-only`                      | `custom-only`                                    | `format` is annotation-based; Castr does not treat `int64` / `bigint` as native here  |
| Zod 4               | `native` (`z.number()`) | `partial` (`z.int()`) | `native` (`z.int64()`) | `native` (`z.bigint()`) | `native` (`z.iso.date()`)          | `native` (`z.iso.datetime()`)                    | `z.int()` is safe-integer runtime, not an unbounded integer carrier                   |
| TypeScript          | `native` (`number`)     | `partial` (`number`)  | `partial` (`bigint`)   | `native` (`bigint`)     | `partial` (`string` / custom type) | `partial` (`string` / custom type)               | TypeScript has no distinct built-in `int64` or date-time semantic type                |
| JavaScript runtime  | `native` (`Number`)     | `partial` (`Number`)  | `partial` (`BigInt`)   | `native` (`BigInt`)     | `legacy` (`Date`)                  | `legacy` (`Date`) / `native-modern` (`Temporal`) | Follow-on repo direction is to prefer `Temporal` over `Date` for JS/TS date-time work |

## Castr Doctrine Consequences

- OpenAPI 3.2.0 can carry native `int64`, so Castr preserves `int64` semantics there.
- OpenAPI 3.1.x remains accepted as a bridge input surface for the same `int64` semantics.
- OpenAPI 3.1.x and 3.2.0 cannot carry native arbitrary-precision `bigint`, so Castr rejects `bigint` -> OpenAPI.
- JSON Schema 2020-12 does not have native `int64` or `bigint`, so Castr rejects both `int64` and `bigint` -> JSON Schema.
- Zod 4 natively supports both `z.int64()` and `z.bigint()`, so Castr preserves both there.
- TypeScript output uses `bigint` for both `int64` and `bigint` IR semantics because that is the only native carrier that can preserve the full signed-64 domain honestly.
- Castr does not currently support custom portable type extensions to rescue unsupported target pairs.
- Here, a "custom portable type" means an invented nonstandard portable carrier such as a pseudo-`format`, an `x-*` extension, or another convention that only works by consumer agreement.
- ADR-041 generalizes this matrix-driven pattern so future seams can choose exact emission, governed widening, or early rejection explicitly rather than inventing local heuristics.
- The `Temporal` note is recorded as follow-on direction, not as a completed implementation slice.

## Primary Sources

- JSON RFC 8259
- OpenAPI 3.1.x
- OpenAPI 3.2.0
- OpenAPI Format Registry (`int64`)
- JSON Schema 2020-12 Validation
- Zod 4 documentation
- Zod JSON Schema documentation
- TypeScript handbook (`bigint`)
- MDN JavaScript references for `Number`, `BigInt`, `Date`, and `Temporal`
