# Oak Support Plan (Negotiated Enablement)

**Date:** 2026-01-24  
**Status:** Phase 0 in progress (requires owner input), Phase 1 planned  
**Scope:** Enable Oak use cases without matching exact legacy adapter outputs.  
**Constraints:** No compatibility layers, no string-based schema outputs.

---

## Phase 0 — Alignment & Negotiation (In Progress)

### Proposed outcomes (pending owner input)

- **Contract stance:** Castr will **enable Oak’s use cases** without mirroring Oak’s current adapter shapes.
- **No compatibility layers:** we will not ship legacy wrappers or stringified schema outputs.
- **Strict-by-default maintained:** object schemas are strict; validation is fail-fast.
- **Determinism is required:** output ordering must be stable and repeatable.

### Use-case mapping (from Oak fixtures)

1. **SDK generation** — needs strongly typed endpoints + schema registry (as real Zod objects).
2. **Runtime validation** — needs strict Zod schemas and clear errors.
3. **Metadata access** — needs operationId, response status map, and per-endpoint metadata.
4. **OpenAPI round-trip** — needs lossless IR and valid OpenAPI 3.1 output (not byte-identical).

### Negotiation positions (draft)

<!-- configurable; default to curly braces; boolean switch enables colon -->

- **Path format** is configurable: default **curly braces**, optional **colon** via a boolean config switch.
- **Output shape** is Castr’s, not Oak’s; we will provide stable, documented exports that satisfy Oak’s workflows.
- **Artifact emission** will be first-class (TS outputs), not stringified schema fragments.

### Options (non-canonical, to be revisited)

**Option A — Metadata TS emitter (Castr-native)**

- Emit dedicated metadata outputs (paths registry, operations registry, response code helpers, parameter enums).
- All artifacts are **rule-compliant TS** (no `as` except `as const`, no `Object.*`, no stringified schemas).
- Pros: first-class, explicit, deterministic.
- Cons: new emitter surface area; more artifacts to version/document.

**Option B — Zod-first enablement**

- Keep core output Zod-centric, but add **rule-compliant helper exports** that enable the same impact (e.g., typed endpoints + registry builders).
- Metadata is derived from IR and Zod outputs, not from stringified code.
- Pros: smaller surface; leverages existing Zod output.
- Cons: some Oak workflows may still need explicit registries; derivation must remain rule-compliant.

**Both options must (and will be revisited once we learn more):**

- Avoid compatibility layers and string-based schema outputs.
- Preserve determinism and strict-by-default behavior.
- Provide stable, documented exports (even if shape differs from Oak’s current adapter).

### Example output analysis (metadata TS)

Reference: `example-oak-sdk-output-ts-metadata.ts` (illustrative, not exhaustive).

**Artifacts in the example and current Castr coverage**

- **PATHS / ValidPath / isValidPath**: not emitted today; could be derived from endpoints but would need explicit generated maps (no `Object.*`).
- **Allowed methods + guards**: not emitted; would need a generated literal list (no `as` except `as const`).
- **PATH_OPERATIONS / OPERATIONS_BY_ID**: not emitted; current endpoints array is similar but uses Zod schemas, not raw OpenAPI shapes.
- **Response code registry + helpers**: not emitted.
- **Path parameter enums / groupings**: not emitted; would need a dedicated emitter or a Zod-driven alternative.
- **OpenAPI-TS `paths` types**: not emitted by Castr; would require a separate type output or a Zod-first equivalent.

**Implication**
The example highlights metadata and runtime registries that Castr does **not** currently emit. We must either:

1. emit equivalent metadata directly (TS outputs), or
2. enable the same impact via Zod outputs and documented derivations.

### Rule-compliant generation constraints

- **No** `as` type assertions (except `as const`).
- **No** `Object.*` or `Reflect.*` usage in generated code.
- **No** `Record<string, unknown>` or stringified schema outputs.
- Prefer **generated literal arrays/objects** and `value in MAP` guards.

### Rule-compliant pseudocode patterns (examples)

**Paths registry + guard**

```typescript
export const PATHS = {
  '/changelog': '/changelog',
  '/subjects/{subject}': '/subjects/{subject}',
} as const;

export type ValidPath = keyof typeof PATHS;

export function isValidPath(value: string): value is ValidPath {
  return value in PATHS;
}
```

**Allowed methods (no `Object.*`, no `as`)**

```typescript
export const ALLOWED_METHODS = ['get', 'post', 'put', 'delete'] as const;
export type AllowedMethod = (typeof ALLOWED_METHODS)[number];

export function isAllowedMethod(value: string): value is AllowedMethod {
  if (value === 'get') return true;
  if (value === 'post') return true;
  if (value === 'put') return true;
  if (value === 'delete') return true;
  return false;
}
```

**Operation registry**

```typescript
export const OPERATIONS_BY_ID = {
  'getLessons-getLesson': { path: '/lessons/{lesson}', method: 'get' },
} as const;

export type OperationId = keyof typeof OPERATIONS_BY_ID;

export function isOperationId(value: string): value is OperationId {
  return value in OPERATIONS_BY_ID;
}
```

**Parameter enums + validator (no casts)**

```typescript
export const KEY_STAGES = ['ks1', 'ks2', 'ks3', 'ks4'] as const;
export type KeyStage = (typeof KEY_STAGES)[number];

export function isKeyStage(value: string): value is KeyStage {
  return value === 'ks1' || value === 'ks2' || value === 'ks3' || value === 'ks4';
}
```

### Owner decisions needed

<!-- enablement, NOT matching -->

- Confirm the negotiated contract stance (enablement vs. shape matching).
<!-- allow config, default to curly braces -->
- Confirm path format preference and whether both formats must be supported.
<!-- yes, and we will definitely need to iterate on this, but will do so in collaboration with the Oak team -->
- Confirm required Phase 1 outputs (metadata maps, schema collection, endpoint ordering).

---

## Phase 1 — Enablement Plan (Planned, pending Phase 0 sign-off)

### Goal

Provide Castr-native exports that satisfy Oak’s SDK generation + validation workflows, with strictness and determinism, without any legacy adapter compatibility.

### Workstreams

1. **Endpoint definition tightening**
   - Require `operationId` in IR → endpoint output (fail-fast if missing).
   - Ensure deterministic ordering by `method + path`.
   - Preserve explicit status-code handling; no fallback empty schemas.

2. **Path format configuration**
   - Add a `pathFormat` option with `colon` / `curly` output.
   - Ensure normalization is deterministic and type-safe.

3. **Schema collections**
   - Export a `schemas` object alongside individual schema exports.
   - Provide a strict, stable schema registry builder (no stringification).

4. **Metadata maps**
   - Export `OPERATION_ID_BY_METHOD_AND_PATH`.
   - Export `PRIMARY_RESPONSE_STATUS_BY_OPERATION_ID`.
   - These are **first-class TS exports**, not derived via string parsing.

5. **Parameter typing completeness**
   - Add `Cookie` as a distinct parameter type.
   - Do not coerce cookie → header; preserve location semantics.

6. **OpenAPI strictness**
   - Emit explicit strict object behavior in OpenAPI output where required (`additionalProperties: false`).
   - Align IR → OpenAPI writer so strictness is explicit, not implicit.

7. **Output Patterns**
   - Where we are outputting metadata patterns, e.g. lists of endpoints, we will do so using `as const`, and then we will use that runtime object to define types and type-predicate functions, e.g.

```typescript
export type ValidPath = keyof Paths;

/**

- Convenience map for all the paths
 */
export const PATHS = {
  '/changelog': '/changelog',
  '/changelog/latest': '/changelog/latest',
  '/key-stages': '/key-stages',
  '/key-stages/{keyStage}/subject/{subject}/assets':
    '/key-stages/{keyStage}/subject/{subject}/assets',
  '/key-stages/{keyStage}/subject/{subject}/lessons':
    '/key-stages/{keyStage}/subject/{subject}/lessons',
  '/key-stages/{keyStage}/subject/{subject}/questions':
    '/key-stages/{keyStage}/subject/{subject}/questions',
  '/key-stages/{keyStage}/subject/{subject}/units':
    '/key-stages/{keyStage}/subject/{subject}/units',
  '/lessons/{lesson}/assets': '/lessons/{lesson}/assets',
  '/lessons/{lesson}/assets/{type}': '/lessons/{lesson}/assets/{type}',
  '/lessons/{lesson}/quiz': '/lessons/{lesson}/quiz',
  '/lessons/{lesson}/summary': '/lessons/{lesson}/summary',
  '/lessons/{lesson}/transcript': '/lessons/{lesson}/transcript',
  '/rate-limit': '/rate-limit',
  '/search/lessons': '/search/lessons',
  '/search/transcripts': '/search/transcripts',
  '/sequences/{sequence}/assets': '/sequences/{sequence}/assets',
  '/sequences/{sequence}/questions': '/sequences/{sequence}/questions',
  '/sequences/{sequence}/units': '/sequences/{sequence}/units',
  '/subjects': '/subjects',
  '/subjects/{subject}': '/subjects/{subject}',
  '/subjects/{subject}/key-stages': '/subjects/{subject}/key-stages',
  '/subjects/{subject}/sequences': '/subjects/{subject}/sequences',
  '/subjects/{subject}/years': '/subjects/{subject}/years',
  '/threads': '/threads',
  '/threads/{threadSlug}/units': '/threads/{threadSlug}/units',
  '/units/{unit}/summary': '/units/{unit}/summary',
} as const;

/**

- Types derived from the runtime schema object.
*/
export type RawPaths = Schema['paths'];

export function isValidPath(value: string): value is ValidPath {
  const paths = Object.keys(schema.paths);
  return paths.includes(value);
}
export const apiPaths: RawPaths = schema.paths;
```

### Acceptance criteria (Phase 1)

- Generation succeeds on Oak fixtures with **deterministic output** (repeatable byte-for-byte).
- Zod output is **strict-by-default** and uses Zod 4 only.
- Endpoints include **operationId** and stable ordering.
- Exports include **schemas**, **metadata maps**, and endpoint definitions without stringification.

### Deliverables

- New/updated exports in the main TypeScript output file(s).
- Updated CLI flags/options for `pathFormat` (if needed) and metadata map emission.
- Documentation updates describing the new exports and configuration.

### Non-goals (Phase 1)

- Matching Oak’s current adapter file layout.
- Any string-based schema outputs or compatibility layers.

---

## Future Directions (Not part of Phase 1)

### Phase 2 — Additional artifacts

- Optional bundle manifest emission for Oak’s verifier.
- Dedicated “request parameter map” export using real Zod objects.

### Phase 3 — Extended outputs

- JSON Schema artifact export (for MCP or validation tooling).
- Additional endpoint metadata formats if required by Oak tooling.
