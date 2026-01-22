# Plan: Zod 4 IR→Zod Improvements

**Status:** 🟡 In Progress  
**Priority:** 3.1b  
**Prerequisite for:** Zod → IR Parser, True Round-Trip Validation

---

## Context

> [!IMPORTANT]
> **Session 3.1a (IR Semantic Audit) is complete.** The IR is now format-agnostic.
> **Research complete.** Priorities confirmed, now implementing.

**Essential reading:**

- [session-entry.prompt.md](../prompts/session-entry.prompt.md) — Critical rules
- [ADR-031](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md) — Current Zod output strategy
- [zod4-advanced-features-research.md](./zod4-advanced-features-research.md) — Feature research

---

## Goal

Produce **idiomatic Zod 4 output** that looks handwritten, leveraging Zod 4's advanced features.

**Why before parser:** The Zod → IR parser gets built for the final output shape from day one.

---

## Priorities (Confirmed)

| Priority | Feature          | Status          | Decision                                |
| -------- | ---------------- | --------------- | --------------------------------------- |
| 1        | Native Recursion | ✅ Complete     | Getter syntax replaces `z.lazy()`       |
| 2        | Codecs           | 🟡 Implementing | Always on, internal plugin architecture |
| 3        | `.overwrite()`   | 🔲 Research     | Investigate OpenAPI trigger patterns    |
| ❌       | ~~Zod Mini~~     | Deferred        | Not a priority                          |

---

## 1. Native Recursion (✅ Complete)

**Before:** `z.lazy()` with type assertions

```typescript
const Category: z.ZodType<Category> = z.lazy(() =>
  z.object({ name: z.string(), children: z.array(Category) }),
);
```

**After:** Getter syntax with full method access

```typescript
const Category = z.object({
  name: z.string(),
  get children() {
    return z.array(Category);
  },
});
```

**Implementation:**

- Modified `lib/src/writers/zod/index.ts` — `writeProperties()` generates getters for circular refs
- Added `hasSchemaReference()` helper for mutual reference detection
- Updated 4 test files, 6 snapshots regenerated
- All 11 quality gates pass

---

## 2. Codecs (Deferred)

**Status:** ⚪ Deferred — not currently relevant

> [!NOTE]
> Zod 4 provides **codec examples** (like `isoDatetimeToDate`, `base64ToBytes`) in the documentation, but these are **not first-class APIs**. Per the Zod docs: _"these are not included as first-class APIs in Zod itself. Instead, you should copy/paste them into your project."_

**Current approach:** Use format-specific validation functions (`z.iso.datetime()`, `z.url()`, etc.) which provide correct validation without runtime transformation.

**Future consideration:** If runtime type transformation becomes a user requirement, we could:

1. Bundle codec implementations in generated output
2. Wait for Zod to promote codecs to first-class APIs

For now, validation-only format functions are sufficient.

## 3. `.overwrite()` (Deferred)

**Status:** ⚪ Deferred — no evidence of real-world usage

Zod 4's `.overwrite()` method could support mutation transforms like `x-trim` or `x-lowercase`, but no evidence these patterns exist in real OpenAPI specs.

**Future consideration:** If vendor extensions triggering mutation transforms are identified, this can be revisited.

---

## Success Criteria

1. ✅ No `z.lazy()` in generated output for circular references (getter syntax instead)
2. ⚪ Codecs deferred (Zod 4 codecs not first-class APIs)
3. ⚪ `.overwrite()` deferred (no real-world usage patterns identified)
4. ✅ All 10 quality gates pass
5. ⬜ Zod → IR parser can parse the output (Session 3.2)

---

## References

- [ADR-031](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)
- [zod4-advanced-features-research.md](./zod4-advanced-features-research.md)
- [Zod 4 Codecs](https://zod.dev/codecs)
