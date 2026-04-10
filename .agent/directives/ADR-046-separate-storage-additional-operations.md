# ADR-046: Separate Storage for `additionalOperations` on `CastrDocument`

**Status:** Accepted  
**Date:** 2026-04-03  
**Revised:** 2026-04-10 — Promoted into the durable ADR docs set during the post-Phase A₂ consolidation pass  
**Context:** OAS 3.2 Full Feature Support arc — IR model decision for custom HTTP methods

---

## Decision

OAS 3.2 `additionalOperations` (custom-method operations) will be stored in a dedicated field on `CastrDocument`, separate from the existing `operations` array.

## Context

OAS 3.2 introduces `additionalOperations` on `PathItemObject` — a map of `Record<string, OperationObject>` for custom HTTP methods beyond the standard set (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD, TRACE, QUERY).

Two storage strategies were evaluated:

### Option A: Fold into existing `operations` array (REJECTED)

Extend `IRHttpMethod` to include a `string` branch (e.g., `'custom:PURGE'`) and store custom operations alongside standard ones.

**Rejected because:**

1. Breaks `IRHttpMethod` type safety — the union becomes open-ended; exhaustiveness checks, `VALID_HTTP_METHODS`, `PATH_ITEM_METHOD_SETTERS`, and sorting logic all break
2. Writers must reconstruct which operations go to `additionalOperations` vs `pathItem[method]` — error-prone and violates round-trip fidelity
3. Contaminates existing validation logic that assumes a closed method set

### Option B: Separate storage (ACCEPTED)

Add a dedicated `additionalOperations` field to `CastrDocument` (or per-path structure).

**Accepted because:**

1. `IRHttpMethod` stays a closed union — exhaustiveness checks and validation are preserved
2. Writers know exactly which operations go into `additionalOperations` — lossless round-trip guaranteed
3. Custom method names are validated separately (non-empty, no overlap with standard methods)
4. An `allOperations(doc)` helper provides convenient iteration for consumers that need both lists

## Consequences

- Standard operations and custom operations have distinct storage and validation paths
- The writer emits `additionalOperations` on `PathItemObject` exactly as received, preserving spec fidelity
- Consumers that need to iterate all operations use the `allOperations()` helper; consumers that only care about standard methods continue using `operations` unchanged
