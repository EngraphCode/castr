# Requirements: Agent Decision-Making Guide

> **Purpose**: This document helps AI agents make implementation decisions.  
> **For strategic vision**, see `VISION.md`.  
> **For engineering standards**, see [RULES.md](RULES.md).

---

## Acceptance Criteria (Formal Checklists)

Acceptance criteria documents expand these requirements into concrete checklists for tests and validation.  
If any conflict exists, **this requirements document is the source of truth**.

| Area                 | Acceptance Criteria                                            |
| -------------------- | -------------------------------------------------------------- |
| OpenAPI input/output | `.agent/acceptance-criteria/openapi-acceptance-criteria.md`    |
| Zod writer output    | `.agent/acceptance-criteria/zod-output-acceptance-criteria.md` |
| Zod parser input     | `.agent/acceptance-criteria/zod-parser-acceptance-criteria.md` |

---

## OpenAPI Compliance (Non-negotiable)

The system is NOT ready for production until these criteria are met.

### 1. Internal Representation (IR)

- **Version**: OpenAPI 3.1.x (Source of Truth)
- **Coupling**: Decoupled from OpenAPI 3.0 semantics; optimized for generic validation but fully capable of expressing all 3.1 concepts.
- **Completeness**: MUST support every concept in the OpenAPI 3.1 Specification.

### 2. Input Support: ALL Valid OpenAPI 3.0.x Syntax

The system MUST accept and parse EVERY field from the OpenAPI 3.0.x specification:

**Document Root**

- `openapi`, `info`, `servers`, `paths` (REQUIRED), `components`, `security`, `tags`, `externalDocs`, `x-*`

**Info Object**

- `title` (REQUIRED), `description`, `termsOfService`, `contact`, `license`, `version` (REQUIRED), `x-*`

**Contact/License**

- Contact: `name`, `url`, `email`, `x-*`
- License: `name` (REQUIRED), `url`, `x-*`

**Server Object**

- `url` (REQUIRED), `description`, `variables`, `x-*`
- ServerVariable: `enum`, `default` (REQUIRED), `description`, `x-*`

**Path Item**

- `$ref`, `summary`, `description`
- Methods: `get`, `put`, `post`, `delete`, `options`, `head`, `patch`, **`trace`** (3.0.3+)
- `servers`, `parameters`, `x-*`

**Operation**

- `tags`, `summary`, `description`, `externalDocs`, `operationId`
- `parameters`, `requestBody`, `responses` (REQUIRED)
- `callbacks`, `deprecated`, `security`, `servers`, `x-*`

**Parameter (3.0.x specific)**

- `name` (REQUIRED), `in` (REQUIRED), `description`, `required`, `deprecated`
- **`allowEmptyValue`** (deprecated in 3.0.2)
- `style`, `explode`, `allowReserved`
- `schema`, `example`, `examples`, `content`, `x-*`

**Request Body**

- `description`, `content` (REQUIRED), `required`, `x-*`

**Media Type (3.0.x)**

- `schema`, `example`, `examples`
- **`encoding`** (Map<string, EncodingObject>) — multipart/form-data

**Encoding Object**

- `contentType`, `headers`, `style`, `explode`, `allowReserved`, `x-*`

**Response**

- `description` (REQUIRED), `headers`, `content`, `links`, `x-*`

**Schema (3.0.x = JSON Schema Draft 7 + OAS)**

- Core: `type` (string), `allOf`, `oneOf`, `anyOf`, `not`, `items`, `properties`, `additionalProperties`
- Validation: `multipleOf`, `maximum`, `minimum`, **`exclusiveMaximum` (boolean)**, **`exclusiveMinimum` (boolean)**, `maxLength`, `minLength`, `pattern`, `maxItems`, `minItems`, `uniqueItems`, `maxProperties`, `minProperties`, `required`, `enum`
- Metadata: `title`, `description`, `default`, `format`, `example`
- **OAS Extensions:**
  - **`nullable`** (boolean, 3.0 specific)
  - `discriminator`, **`xml`**, `externalDocs`, `readOnly`, `writeOnly`, `deprecated`, `x-*`

**XML Object**

- `name`, `namespace`, `prefix`, `attribute`, `wrapped`, `x-*`

**Components**

- `schemas`, `responses`, `parameters`, `examples`, `requestBodies`
- `headers`, `securitySchemes`, `links`, `callbacks`, `x-*`

**Security Schemes (3.0.x)**

- `type` (REQUIRED): "apiKey", "http", "oauth2", "openIdConnect"
- ApiKey: `name`, `in`
- HTTP: `scheme`, `bearerFormat`
- OAuth2: `flows` (implicit, password, clientCredentials, authorizationCode)
- OpenID: `openIdConnectUrl`

**Other Objects**

- Tag: `name`, `description`, `externalDocs`, `x-*`
- ExternalDocs: `description`, `url` (REQUIRED), `x-*`
- Link: `operationRef`, `operationId`, `parameters`, `requestBody`, `description`, `server`, `x-*`
- Callback: `{expression}` → PathItem, `x-*`
- Example: `summary`, `description`, `value`, `externalValue`, `x-*`

### 3. Input Support: ALL Valid OpenAPI 3.1.x Syntax

In addition to 3.0.x syntax (with upgrades), the system MUST support 3.1.x additions:

**Document Root (3.1 changes)**

- `paths` is **OPTIONAL** (if `webhooks` or `components` present)
- **NEW:** `webhooks` (Map<string, PathItem>)
- **NEW:** `jsonSchemaDialect` (string, URI)

**Info Object (3.1)**

- **NEW:** `summary` (string)

**License Object (3.1)**

- **NEW:** `identifier` (string, SPDX expression)

**Schema Object (3.1.x = JSON Schema 2020-12 + OAS)**

- **Type as array:** `type: ["string", "null"]`
- **NEW:** `const`, `prefixItems` (replaces tuple `items`), `$dynamicRef`, `$dynamicAnchor`
- **NEW:** `unevaluatedProperties`, `unevaluatedItems`, `dependentSchemas`, `dependentRequired`, `minContains`, `maxContains`
- **`exclusiveMaximum`, `exclusiveMinimum` are NUMBERS** (not booleans)
- **REMOVED:** `nullable` (MUST reject in 3.1 input)

**Security Schemes (3.1)**

- **NEW type:** `mutualTLS`

**Components (3.1)**

- **NEW:** `pathItems` (Map<string, PathItem>)

### 4.Strict Validation & Rejection

**REJECT 3.0 specs with 3.1-only syntax:**

- `webhooks`, `jsonSchemaDialect`, `info.summary`, `license.identifier`
- Array `type` values, `const`, `prefixItems`, `unevaluatedProperties`
- `exclusiveMinimum`/`exclusiveMaximum` as numbers
- `mutualTLS` security scheme
- `pathItems` in components

**REJECT 3.1 specs with 3.0-only syntax:**

- `nullable: true` (MUST use `type: [..., "null"]`)
- `exclusiveMinimum`/`exclusiveMaximum` as booleans
- `items` as array (tuples MUST use `prefixItems`)

**REJECT invalid syntax (both versions):**

- Invalid semver in `openapi` field
- Unresolvable `$ref` pointers
- Invalid HTTP methods
- Missing REQUIRED fields

### 5. Automatic Upgrade (3.0 → 3.1)

ALL 3.0.x input MUST be normalized to 3.1 IR:

**Type System Upgrades**

- `nullable: true` with `type: "string"` → `type: ["string", "null"]`
- `exclusiveMinimum: true` + `minimum: 10` → `exclusiveMinimum: 10`
- `exclusiveMaximum: true` + `maximum: 100` → `exclusiveMaximum: 100`
- `items: [SchemaA, SchemaB]` → `prefixItems: [SchemaA, SchemaB]`

**Example/Examples Normalization**

- Preserve both `example` and `examples` in IR
- Write to 3.1 using preferred `examples` format

### 6. IR Completeness: Support ALL OpenAPI 3.1 Concepts

The IR MUST be capable of representing EVERY field listed in sections 2 and 3.

**Regression-critical fields (implemented):** these fields exist in IR and MUST remain supported end-to-end (parse → IR → write) with tests proving preservation.

**CastrSchema Interface:**

- ✅ `xml` (XMLObject) — OpenAPI extension for XML serialization
- ✅ `externalDocs` (ExternalDocumentationObject) — at schema level
- ✅ `prefixItems` (SchemaObject[]) — JSON Schema 2020-12 tuple validation
- ✅ `unevaluatedProperties` (boolean | SchemaObject) — JSON Schema 2020-12
- ✅ `unevaluatedItems` (boolean | SchemaObject) — JSON Schema 2020-12
- ✅ `dependentSchemas` (Record<string, SchemaObject>) — JSON Schema 2020-12
- ✅ `dependentRequired` (Record<string, string[]>) — JSON Schema 2020-12
- ✅ `minContains` (number) — JSON Schema 2020-12
- ✅ `maxContains` (number) — JSON Schema 2020-12

**IRMediaType Interface:**

- ✅ `encoding` (Record<string, EncodingObject>) — multipart/form-data support

**Verified Complete:**

- ✅ `info.summary`, `license.identifier` — uses raw InfoObject from openapi3-ts
- ✅ `webhooks`, `jsonSchemaDialect`, `pathItems` — present in IR
- ✅ `mutualTLS` — uses raw SecuritySchemeObject
- ✅ `externalDocs` — at document/operation level
- ✅ All basic JSON Schema keywords — type, format, validation, composition

### 7. Output: ALL Valid OpenAPI 3.1.x Syntax

The writer MUST produce valid 3.1.x output containing ALL fields from the IR, including:

- All document, component, operation, parameter, response, schema fields
- All OAS extensions: `discriminator`, `xml`, `externalDocs`, `example`
- All 3.1 additions: `webhooks`, `jsonSchemaDialect`, `mutualTLS`, etc.
- **NO content loss** during 3.0 → 3.1 transformation

---

### 8. Union Semantics (anyOf vs oneOf) — Lossless by Design

**Non‑negotiable:** We MUST preserve `anyOf` vs `oneOf` semantics end‑to‑end.  
Collapsing them into a single form is NOT allowed because it loses meaning.

**IR Requirements**

- IR MUST represent `anyOf` and `oneOf` distinctly (never normalize one into the other).
- If input is OpenAPI `oneOf`/`anyOf`, the IR MUST preserve that choice exactly.
- Writers MUST emit the same union semantics that exist in the IR (lossless round‑trip).

**Zod → IR Policy**

- `z.union([...])` defaults to IR `anyOf` unless disjointness is provable or explicit metadata requests `oneOf`.
- `z.discriminatedUnion(...)` maps to IR `oneOf` with discriminator (if discriminator values are provably unique).
- `z.xor(a, b)` maps to IR `oneOf` (exactly‑one semantics).
- Any refinement/transform that prevents proof of disjointness MUST fall back to `anyOf` unless explicit metadata forces `oneOf` (see below).

**Provable Disjointness (Minimum Proof Rules)**

We may emit `oneOf` for Zod unions only when disjointness can be **proven** by static inspection:

1. **Disjoint `type` sets**
   - Example: `{ type: 'string' }` vs `{ type: 'number' }`
   - If both schemas share any possible type (including `null`), disjointness is NOT proven.

2. **Discriminator with unique literal/enum values**
   - Every branch has the discriminator property as a literal/enum with **no overlap** across branches.
   - If any branch lacks the discriminator or uses non‑literal values, disjointness is NOT proven.

3. **Literal/enum unions with non‑overlapping values**
   - Example: `z.union([z.literal('a'), z.literal('b')])`
   - If values overlap or include broad types (e.g., `z.string()`), disjointness is NOT proven.

If none of the above is satisfied, the union is treated as **potentially overlapping** and MUST be `anyOf` unless explicitly overridden.

**Explicit Metadata Requests**

We MUST support explicit metadata to request union semantics, but we cannot violate strictness:

- If metadata requests **`anyOf`** → always allowed.
- If metadata requests **`oneOf`**:
  - Allowed only when disjointness is provable **OR** the input format already used `oneOf` (losslessness).
  - Otherwise we MUST fail fast with a helpful error explaining why disjointness cannot be proven and how to fix it (add discriminator + literals, use `z.xor`, or choose `anyOf`).

This keeps behavior strict, predictable, and lossless while still honoring explicit user intent when safe.

---

### 9. Zod Input (Idiomatic Zod 4 Only)

**Non‑negotiable:** The parser MUST support idiomatic Zod 4 input and remain lossless.

- **Zod 4 only** — reject Zod 3 syntax with actionable errors.
- **Standard API only** — Zod 4 mini is out of scope.
- **Static parsing only** — dynamic patterns (computed keys, spreads, runtime indirection) MUST fail fast.
- **Getter‑based recursion only** — `z.lazy()` is not supported.
- **Metadata is preserved when present** using idiomatic Zod 4 mechanisms (see ADR‑032).

---

## Current Focus: OpenAPI ↔ Zod Pipeline

> [!NOTE]
> **Phase 2 complete.** Now focused on strict bidirectional transforms and end-to-end round-trip validation (Session 3.3).

| Priority | Focus                      | Status      |
| -------- | -------------------------- | ----------- |
| 1        | OpenAPI → Zod              | ✅ Complete |
| 2        | Zod → IR (Parser)          | ✅ Complete |
| 3        | ADR-026 + Strictness       | 🔄 Active   |
| 4        | True Round-Trip Validation | 🔄 Active   |
| 5        | JSON Schema                | 🔲 Deferred |

---

## Functional Requirements

### Input Handling

- Accept OpenAPI via file path, URL, or in-memory object
- Accept idiomatic Zod 4 schemas programmatically
- Dereference and bundle at load time
- Validate before processing

### Output Generation

- Generate Zod schemas with full validation chains
- Generate TypeScript type definitions
- Generate MCP tool definitions (JSON Schema input/output)
- Generate endpoint metadata (method, path, parameters, responses)

### Delivery

- Programmatic API (primary)
- CLI (secondary)

---

## What This Library IS

**Building blocks** for SDK construction:

- Zod schemas
- Validation helpers
- Endpoint metadata
- MCP tool definitions

Consumers use these building blocks with their HTTP client of choice.

---

## What This Library IS NOT

- ❌ A complete HTTP client
- ❌ An opinionated SDK
- ❌ A runtime API client

---

## Decision Heuristics

When uncertain about implementation choices, use these priorities:

1. **Type safety** over convenience
2. **Explicit** over implicit
3. **Fail fast** over graceful degradation
4. **IR correctness** over output appearance
5. **Test coverage** over feature velocity

---

## Fixture Provenance

All test fixtures must have documented provenance:

- **First-party fixtures**: Created in-house for Castr (e.g., Oak SDK-decorated, Castr normalized)
- **Synthetic fixtures**: Inspired by external projects (e.g., OpenAPI-TS edge cases), but always recreated independently — never copied
- **Third-party reuse**: If MIT-licensed content is reused, confirm the specific file's license and add `docs/THIRD_PARTY_NOTICES.md` with attribution and the MIT license text
- **Provenance metadata**: Record fixture origin (synthetic vs first-party) in test metadata or fixture READMEs

---

## Related Documents

| Document                           | Purpose                                 |
| ---------------------------------- | --------------------------------------- |
| `directives/VISION.md`             | Strategic direction and roadmap         |
| `directives/RULES.md`              | Engineering standards                   |
| `directives/testing-strategy.md`   | Test methodology                        |
| `directives/DEFINITION_OF_DONE.md` | Quality gates                           |
| `.agent/research/feature-parity/*` | Parity research and integration targets |
