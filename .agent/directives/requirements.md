# Requirements: Agent Decision-Making Guide

> **Purpose**: This document helps AI agents make implementation decisions.  
> **For strategic vision**, see `VISION.md`.  
> **For engineering standards**, see [principles.md](principles.md).

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

## Cross-Cutting Support Rule

**Amended: 2026-09-06.** Retain strictness, completeness and canonical IR;
supersede universal-schema/superset and unconditional closed-object claims with
the ratified application-contract charter. The requirements below describe
obligations, not a blanket statement that the implementation already meets them.

Castr compiles application value and interaction contracts between compatible
representations without silently changing their meaning. Every advertised source
grammar is bounded and versioned; every valid construct inside it must be parsed
completely. Source admission and target capability are distinct decisions.

The target public boundary distinguishes
`CastrValueContractDocument | CastrInteractionContractDocument`, replacing
`CastrDocument` in one migration. The IR must persist accepted-input,
produced-output, ordered-processing, annotation and interaction facets, including
presence, identity and reference distinctions. This documentation does not
perform that API migration.

[Input-output compatibility](principles.md#-input-output-pair-compatibility-model)
requires exact native or behaviourally proven encoded output for the selected
profile, or atomic rejection for genuine impossibility. Separately named,
caller-authorised projections report complete semantic deltas and do not count
as lossless. Missing implementation remains planning debt and blocks support.

Object semantics preserve source-dialect defaults, explicit additional-property
constraints, input acceptance, output stripping/retention and ordered processing;
they are not reduced to one closed-object encoding. Same-family opaque extensions
retain typed provenance without claiming target execution. Graph semantics remain
outside the application-contract domain.

A supported feature requires parser, IR, runtime validation, writers, independent
proofs and documentation to agree end to end. Partial landings can be reported
as delivery evidence; they do not establish complete support.

---

## OpenAPI Compliance (Non-negotiable)

The system is NOT ready for production until these criteria are met.

### 1. Intermediate Representation and OpenAPI Target

- **Artifact version**: independent of the source/target format version; preserve both.
- **OpenAPI output profile**: the existing canonical writer targets `3.2.0`; that is not the universal IR version. OpenAPI 3.0/3.1 preparation and any version migration must preserve declared semantic channels.
- **Completeness**: MUST support every concept in the currently claimed OpenAPI surface. Native 3.2 ingest/output at the version boundary is mandatory; the remaining 3.2-only expansion stays in the separately tracked parent slice, with the landed native 3.2 surface now including `pathItem.query`, hierarchical tags, Example Object `dataValue` / `serializedValue`, `oauth2.flows.deviceAuthorization`, `xml.nodeType`, and strict top-level path-templating validation.

### 2. OpenAPI 3.0.x Profile Obligations

Within the declared OpenAPI interaction profile, admission and semantic carriage must cover the following fields completely. This inventory is an implementation/proof obligation, not a certification table:

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

**Schema (the OpenAPI 3.0 Schema Object dialect)**

The [OpenAPI 3.0 Schema Object](https://spec.openapis.org/oas/v3.0.4.html#schema-object)
has its own restrictions; its `items` value is an object, not a tuple array.

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

### 3. OpenAPI 3.1.x Profile Obligations

In addition to 3.0.x syntax (with upgrades), the system MUST support 3.1.x additions. Native 3.2.x documents using this same field surface MUST also be accepted and canonicalised to `3.2.0`.

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
- `nullable` has no OpenAPI-defined 3.1 nullability semantics; Castr's current
  admission restriction is described below.

**Security Schemes (3.1)**

- **NEW type:** `mutualTLS`

**Components (3.1)**

- **NEW:** `pathItems` (Map<string, PathItem>)

### 3A. OpenAPI 3.2.x Addition Obligations

In addition to the 3.0.x and 3.1.x field surfaces above, the system MUST accept and preserve the currently claimed native OpenAPI 3.2-only additions below when the input document is truly 3.2.x:

**Path Item (3.2)**

- `query`

**Tag (3.2)**

- `summary`, `parent`, `kind`

**OAuth Flows (3.2)**

- `deviceAuthorization`

**Example Object (3.2)**

- `dataValue`
- `serializedValue`

**XML Object (3.2)**

- `nodeType`

**Path Templating (3.2 grammar surface)**

- valid top-level `paths` keys using balanced template expressions such as `/users/{userId}`

### 4. Strict Validation and Rejection

**REJECT 3.0 specs with 3.1-only syntax:**

- `webhooks`, `jsonSchemaDialect`, `info.summary`, `license.identifier`
- Array `type` values, `const`, `prefixItems`, `unevaluatedProperties`
- `exclusiveMinimum`/`exclusiveMaximum` as numbers
- `mutualTLS` security scheme
- `pathItems` in components

**REJECT 3.0/3.1 specs with 3.2-only syntax:**

- `pathItem.query`
- `tag.summary`, `tag.parent`, `tag.kind`
- `example.dataValue`, `example.serializedValue`

**Current admission restrictions for 3.1/3.2 input:**

The following list records Castr's present profile restrictions, not a claim
that every such property makes an arbitrary Schema Object invalid. OpenAPI
3.1 permits additional Schema Object properties/vocabularies; complete dialect
and unknown-keyword treatment remains an implementation/proof obligation.
See the [OpenAPI 3.1 Schema Object](https://spec.openapis.org/oas/v3.1.2.html#schema-object).

- `nullable: true` (MUST use `type: [..., "null"]`)
- `exclusiveMinimum`/`exclusiveMaximum` as booleans
- `items` as array (tuples MUST use `prefixItems`)

**REJECT invalid syntax (both versions):**

- Invalid semver in `openapi` field
- Unresolvable `$ref` pointers
- Invalid HTTP methods
- Malformed top-level path template syntax in `paths` keys (unbalanced braces, stray `}`, empty `{}`)
- Missing REQUIRED fields

### 5. Existing OpenAPI Preparation Profile (3.2 Target)

The existing preparation/writer profile normalises accepted OpenAPI input to
`3.2.0`. This describes that profile, not a universal requirement for all future
edges. Same-version preservation and explicit migration policy remain staged
consumer-charter obligations; this documentation does not pre-decide them:

- Swagger/OpenAPI 2.0 ingress is rejected under the ratified charter; no legacy upgrade shim is promised.
- OpenAPI 3.0.x input may bridge through the explicitly supported preparation path
- OpenAPI 3.1.x input is accepted as a bridge version
- Native OpenAPI 3.2.x input is accepted directly
- The existing OpenAPI writer target is `3.2.0`; artifact version and source-profile identity remain separate

**Type System Upgrades**

- `nullable: true` with `type: "string"` → `type: ["string", "null"]`
- `exclusiveMinimum: true` + `minimum: 10` → `exclusiveMinimum: 10`
- `exclusiveMaximum: true` + `maximum: 100` → `exclusiveMaximum: 100`

**Example/Examples Normalization**

- Preserve both `example` and `examples` in IR
- Preserve Example Object `value`, `dataValue`, `serializedValue`, and `externalValue` losslessly when present
- For singular parameter raw-example derivation, prefer `parameter.example` -> `parameter.examples.default.value` -> `parameter.examples.default.dataValue` -> `schema.example`; do not derive from `serializedValue` or `externalValue` alone
- Write to canonical 3.2 output using preferred `examples` format

### 6. IR Carriage and End-to-End Proof Obligations

The admitted OpenAPI interaction profile must carry the fields listed in sections 2, 3 and 3A, with source version and target policy kept explicit. Existing `openApiVersion: '3.2.0'` storage does not define the new artifact-version contract.

**Regression-critical field inventory:** field presence and historical tests identify obligations; neither proves all target edges or nested positions. Each claimed edge still requires independent end-to-end preservation evidence.

**CastrSchema Interface:**

- `xml` (XMLObject) — OpenAPI extension for XML serialization
- `externalDocs` (ExternalDocumentationObject) — at schema level
- `prefixItems` (SchemaObject[]) — JSON Schema 2020-12 tuple validation
- `unevaluatedProperties` (boolean | SchemaObject) — JSON Schema 2020-12
- `unevaluatedItems` (boolean | SchemaObject) — JSON Schema 2020-12
- `dependentSchemas` (Record<string, SchemaObject>) — JSON Schema 2020-12
- `dependentRequired` (Record<string, string[]>) — JSON Schema 2020-12
- `minContains` (number) — JSON Schema 2020-12
- `maxContains` (number) — JSON Schema 2020-12

**IRMediaType Interface:**

- `encoding` (Record<string, EncodingObject>) — multipart/form-data support

**Further preservation obligations (not a completion certificate):**

- `info.summary`, `license.identifier` — uses explicit interfaces from our canonical shared module
- `webhooks`, `jsonSchemaDialect`, `pathItems` — present in IR
- `mutualTLS` — uses raw SecuritySchemeObject
- `pathItem.query` — survives parser -> IR -> writer and downstream method consumers
- `tag.summary`, `tag.parent`, `tag.kind` — explicitly proved through parser/writer round-trip coverage
- Example Object `dataValue` / `serializedValue` — survive shared load boundary -> IR -> writer across component, parameter, response-header, and media-type carriers; singular parameter example derivation now falls back to `default.dataValue` but never `serializedValue` alone
- `oauth2.flows.deviceAuthorization` — survives shared load boundary -> IR -> writer and MCP security consumers
- `xml.nodeType` — survives shared load boundary -> IR -> writer on schema and property metadata
- valid top-level path templating — survives shared load boundary -> IR -> writer -> endpoint/MCP consumers unchanged, while malformed templates fail fast before upgrade
- `externalDocs` — at document/operation level
- The declared JSON Schema keyword vocabularies — type, format, validation and composition — require complete recursive-position proof

### 7. OpenAPI 3.2.x Output Profile

The writer MUST produce valid canonical 3.2.0 output containing ALL fields from the IR, including:

- All document, component, operation, parameter, response, schema fields
- All OAS extensions: `discriminator`, `xml`, `externalDocs`, `example`
- All 3.1 additions: `webhooks`, `jsonSchemaDialect`, `mutualTLS`, etc.
- All currently claimed 3.2 additions: `pathItem.query`, `tag.summary`, `tag.parent`, `tag.kind`, Example Object `dataValue` / `serializedValue`, `oauth2.flows.deviceAuthorization`, `xml.nodeType`
- **NO content loss** during 3.0/3.1 bridge normalization or final 3.2 canonicalisation

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

**Non-negotiable:** the intended source dialect is standard Zod `>=4.5 <5`, admitted through a declared static grammar with complete facet preservation. Output follows the supported current Zod 4 surface; the vendor-conformance corpus and dialect manifest must prove that claim.

- **Zod 4 only** — reject Zod 3 syntax with actionable errors.
- **Standard API only** — Zod 4 mini is out of scope.
- **Static parsing only** — dynamic patterns (computed keys, spreads, runtime indirection) MUST fail fast.
- **Static recursive input** — getters and statically analysable `z.lazy()` reference forms are admitted under the bounded parser grammar; dynamic lazy bodies reject. Writer output uses the canonical getter form. See [ADR-032](../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md).
- **Metadata is preserved when present** using idiomatic Zod 4 mechanisms (see ADR‑032).

---

## Current Implementation and Proof Boundaries

The implementation contains OpenAPI, JSON Schema and Zod parser/writer paths and
TypeScript/MCP output paths. Existence does not establish complete support for a
format or every directed profile. The former Phase-2 completion table and
JSON-Schema-deferred label are superseded.

| Surface                       | Evidence boundary and outstanding obligation                                                                                                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic proof foundation     | The generic outcome runner and its independent-oracle tests exist; the complete profile-bearing harness and support inventory remain outstanding.                                                                                  |
| Security requirements         | [Security-formula proofs](../../lib/tests-transforms/__tests__/security-formula.integration.test.ts) cover AND-groups, alternatives and anonymous entries. Explicit operation-level `security: []` remains an excluded loss class. |
| Nested boolean schemas        | [Nested-boolean proofs](../../lib/tests-transforms/__tests__/nested-boolean-schema.integration.test.ts) cover their named regression corpus; they do not certify every keyword position or normalisation rule.                     |
| Zod generated validation      | [Object refinement emission](../../lib/src/schema-processing/writers/zod/refinements/object.ts) still contains placebo conditional/dependent-schema predicates; generated syntax is not behavioural proof.                         |
| JSON Schema                   | Parser and writer paths exist. Broader dialect, vocabulary and recursive-position fidelity still require their consuming proofs.                                                                                                   |
| Architecture enforcement      | [Boundary configuration](../../lib/eslint.config.ts) records missing resolver wiring. A green aggregate does not prove this boundary rule is enforced.                                                                             |
| Ratified artifact/facet model | The new roots and separated semantic facets are target requirements; the existing public model has not been migrated by this documentation work.                                                                                   |

The [Practice bridge](../practice-index.md) locates the current queue, delivery
evidence, profile contracts and outstanding decision carriers. No support
percentage is asserted before the proof estate computes its complete denominator
and discharged obligations.

---

## Functional Requirements

### Input Handling

- Accept OpenAPI via file path, URL, or in-memory object
- Accept bounded standard Zod source through the documented public parsing API; do not evaluate arbitrary source at runtime
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

**Application-contract compiler building blocks** for compatible representation and SDK construction:

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

| Document                                       | Purpose                                 |
| ---------------------------------------------- | --------------------------------------- |
| [VISION.md](VISION.md)                         | Strategic direction and roadmap         |
| [principles.md](principles.md)                 | Engineering standards                   |
| [testing-strategy.md](testing-strategy.md)     | Test methodology                        |
| [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) | Quality gates                           |
| `.agent/research/feature-parity/*`             | Parity research and integration targets |
