---
name: 'Boundary Narrowing for Schema Types'
polarity: pattern
use_this_when: 'a schema type is optional but at a specific call site the value is known to exist, and a non-null assertion or runtime throw is tempting'
category: code
proven_in: imported
proven_date: 2026-04-01
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: 'non-null assertions (lint violations) or over-widening schema types to always-required (schema infidelity)'
  stable: true
---

> **POLARITY: PATTERN.** This entry names a _shape to repeat_, not a failure mode to avoid.
>
> See [`patterns/README.md` § Polarity](README.md#polarity-required-every-pattern) for the polarity discipline.

# Boundary Narrowing for Schema Types

## Principle

Schema types must stay faithful to the schema. If the upstream
source defines a field as optional, the generated type must be
optional. But at boundaries where the value is _known_ to exist,
express that knowledge via a required typed parameter — moving
validation from runtime throws to compile-time requirements.

## The Anti-Pattern

```typescript
// Anti-pattern 1: non-null assertion (lint violation)
const url = summary.canonicalUrl!;

// Anti-pattern 2: widening the schema type (infidelity)
interface Summary {
  canonicalUrl: string;
} // was string | undefined
```

## The Pattern

1. Keep the schema type faithful: `canonicalUrl?: string`
2. Create a narrowing helper that validates and throws descriptively:

```typescript
function requireCanonicalUrl(summary: Summary): string {
  if (summary.canonicalUrl === undefined) {
    throw new TypeError(`Expected canonicalUrl on summary ${summary.slug}`);
  }
  return summary.canonicalUrl;
}
```

3. At the boundary where the value is consumed, accept a
   required parameter:

```typescript
interface DocumentParams {
  unitUrl: string; // required — caller must narrow
}
```

4. The caller narrows before passing:

```typescript
const url = requireCanonicalUrl(summary);
createDocument({ unitUrl: url });
```

## Why This Works

- Schema types remain faithful to the upstream source
- Non-null assertions are eliminated (lint-clean)
- The narrowing helper provides a descriptive error if the
  invariant ever breaks
- The required parameter makes the compile-time contract
  explicit — callers cannot forget to validate
