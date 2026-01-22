# Requirements: Agent Decision-Making Guide

> **Purpose**: This document helps AI agents make implementation decisions.  
> **For strategic vision**, see `VISION.md`.  
> **For engineering standards**, see `RULES.md`.

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

**P1 BLOCKING Gaps (9 fields):**

**CastrSchema Interface:**

- ❌ `xml` (XMLObject) — OpenAPI extension for XML serialization
- ❌ `externalDocs` (ExternalDocumentationObject) — at schema level
- ❌ `prefixItems` (SchemaObject[]) — JSON Schema 2020-12 tuple validation
- ❌ `unevaluatedProperties` (boolean | SchemaObject) — JSON Schema 2020-12
- ❌ `unevaluatedItems` (boolean | SchemaObject) — JSON Schema 2020-12
- ❌ `dependentSchemas` (Record<string, SchemaObject>) — JSON Schema 2020-12
- ❌ `dependentRequired` (Record<string, string[]>) — JSON Schema 2020-12
- ❌ `minContains` (number) — JSON Schema 2020-12
- ❌ `maxContains` (number) — JSON Schema 2020-12

**IRMediaType Interface:**

- ❌ `encoding` (Record<string, EncodingObject>) — multipart/form-data support

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

## Current Focus: OpenAPI ↔ Zod Pipeline

> [!NOTE]
> **Phase 2 complete.** Now focused on bidirectional transforms and round-trip validation.

| Priority | Focus                      | Status      |
| -------- | -------------------------- | ----------- |
| 1        | OpenAPI → Zod              | ✅ Complete |
| 2        | Zod → IR (Parser)          | 🔲 Next     |
| 3        | True Round-Trip Validation | 🔲 Next     |
| 4        | JSON Schema                | 🔲 Deferred |

---

## Functional Requirements

### Input Handling

- Accept OpenAPI via file path, URL, or in-memory object
- Accept Zod schemas programmatically
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

## Related Documents

| Document                           | Purpose                                 |
| ---------------------------------- | --------------------------------------- |
| `VISION.md`                        | Strategic direction and roadmap         |
| `RULES.md`                         | Engineering standards                   |
| `testing-strategy.md`              | Test methodology                        |
| `DEFINITION_OF_DONE.md`            | Quality gates                           |
| `.agent/research/feature-parity/*` | Parity research and integration targets |
