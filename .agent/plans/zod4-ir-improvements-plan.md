# Plan: Zod 4 IR→Zod Improvements

**Status:** 🔲 Not Started  
**Priority:** 3.1b  
**Prerequisite for:** Zod → IR Parser, True Round-Trip Validation

---

## Goal

Leverage Zod 4's advanced features to produce **richer, more idiomatic** Zod output from the IR before building the Zod → IR parser.

**Why before parser:** If we improve the output first, the parser gets built for the final shape from day one.

---

## Features to Explore

### 1. Native Recursion (High Priority)

**Current:** `z.lazy()` with type assertions

```typescript
const Category: z.ZodType<Category> = z.lazy(() =>
  z.object({ name: z.string(), children: z.array(Category) }),
);
```

**Proposed:** Getter syntax with full method access

```typescript
const Category = z.object({
  name: z.string(),
  get children() {
    return z.array(Category);
  },
});
```

**Investigation:**

- [ ] Verify getter syntax works with ts-morph generation
- [ ] Test type inference with recursive schemas
- [ ] Compare bundle size impact

---

### 2. Codecs (High Priority)

**Current:** Plain string types for date-time

```typescript
z.string(); // for format: date-time
```

**Proposed:** Bidirectional codec with runtime type

```typescript
z.codec(
  z.iso.datetime(), // wire format (string)
  z.date(), // runtime type (Date)
  { decode: (s) => new Date(s), encode: (d) => d.toISOString() },
);
```

**Investigation:**

- [ ] When should we use codecs vs plain format functions?
- [ ] Impact on SDK generation (decode for input, encode for output)
- [ ] Configuration option: `--useCodecs` vs `--formatOnly`?

**Candidate mappings:**

| OpenAPI Format | Codec Option        |
| -------------- | ------------------- |
| `date-time`    | `isoDatetimeToDate` |
| `date`         | `isoDateToDate`     |
| `byte`         | `base64ToBytes`     |
| `uri`          | `stringToUrl`       |

---

### 3. `.overwrite()` (Medium Priority)

**Use case:** Type-preserving transforms like `.trim()`, `.toLowerCase()`

**Investigation:**

- [ ] When would OpenAPI trigger `.overwrite()`?
- [ ] Map to `x-*` extensions for transforms?

---

### 4. Zod Mini Target (Low Priority)

**Use case:** Bundle-size-sensitive applications

**Investigation:**

- [ ] Functional API differences from chained API
- [ ] ts-morph generation changes needed
- [ ] Configuration option: `--zodTarget mini`

---

## Decision Points

| Question                 | Options                   | Decision |
| ------------------------ | ------------------------- | -------- |
| Codecs by default?       | Always / Opt-in / Never   | TBD      |
| Recursive getter syntax? | Yes if ts-morph supports  | TBD      |
| Zod Mini support?        | Separate target / Not now | TBD      |

---

## Success Criteria

1. IR → Zod produces idiomatic Zod 4 output using available features
2. Changes are opt-in or backward compatible
3. Zod → IR parser can parse the improved output
4. All quality gates pass

---

## Sequence

1. **Investigate** each feature with minimal experiments
2. **Decide** which features to adopt and how
3. **Implement** changes to `writers/zod/`
4. **Test** with existing fixtures
5. **Document** in ADR if significant

---

## References

- [zod4-advanced-features-research.md](./zod4-advanced-features-research.md)
- [ADR-031](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)
- [Zod 4 Codecs](https://zod.dev/codecs)
