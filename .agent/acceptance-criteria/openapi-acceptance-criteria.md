# OpenAPI Support Specification

> All requirements are derived from the [official OpenAPI JSON Schemas](./reference/openapi_schema/).

---

## Scope

| Version       | Input Support    | Output Support    |
| ------------- | ---------------- | ----------------- |
| OpenAPI 3.0.x | ✅ MUST support  | ❌ Not applicable |
| OpenAPI 3.1.x | ✅ MUST support  | ✅ MUST produce   |
| OpenAPI 3.2.x | ❌ NOT supported | ❌ NOT supported  |

> [!IMPORTANT]
> **Input/Output Support vs Round-Trip Validation**
>
> - **Input/Output Support** = Can parse ALL OpenAPI fields to IR AND write ALL IR fields to OpenAPI
> - **Round-Trip Validation** = Verify Input → IR → Output produces equivalent content
>
> Input/Output Support is the **PREREQUISITE**. Round-Trip is a separate, later phase.

---

## Part 1: INPUT Specification

### 1.1 OpenAPI 3.0.x Input Requirements

Source: `openapi_3_0_x_schema.json`

The parser MUST accept and preserve ALL of the following structures:

#### Root Object (required: openapi, info, paths)

| Property     | Type                                 | Required | Status |
| ------------ | ------------------------------------ | -------- | ------ |
| openapi      | string (pattern: `^3\.0\.\d(-.+)?$`) | ✅       |        |
| info         | Info Object                          | ✅       |        |
| externalDocs | ExternalDocumentation Object         | ❌       |        |
| servers      | Server[]                             | ❌       |        |
| security     | SecurityRequirement[]                | ❌       |        |
| tags         | Tag[]                                | ❌       |        |
| paths        | Paths Object                         | ✅       |        |
| components   | Components Object                    | ❌       |        |
| x-\*         | any                                  | ❌       |        |

#### Info Object (required: title, version)

| Property       | Type                   | Required |
| -------------- | ---------------------- | -------- |
| title          | string                 | ✅       |
| description    | string                 | ❌       |
| termsOfService | string (uri-reference) | ❌       |
| contact        | Contact Object         | ❌       |
| license        | License Object         | ❌       |
| version        | string                 | ✅       |
| x-\*           | any                    | ❌       |

#### Contact Object

| Property | Type                   | Required |
| -------- | ---------------------- | -------- |
| name     | string                 | ❌       |
| url      | string (uri-reference) | ❌       |
| email    | string (email)         | ❌       |
| x-\*     | any                    | ❌       |

#### License Object (required: name)

| Property | Type                   | Required |
| -------- | ---------------------- | -------- |
| name     | string                 | ✅       |
| url      | string (uri-reference) | ❌       |
| x-\*     | any                    | ❌       |

#### Server Object (required: url)

| Property    | Type                        | Required |
| ----------- | --------------------------- | -------- |
| url         | string                      | ✅       |
| description | string                      | ❌       |
| variables   | Map<string, ServerVariable> | ❌       |
| x-\*        | any                         | ❌       |

#### ServerVariable Object (required: default)

| Property    | Type     | Required |
| ----------- | -------- | -------- |
| enum        | string[] | ❌       |
| default     | string   | ✅       |
| description | string   | ❌       |
| x-\*        | any      | ❌       |

#### Components Object (3.0.x)

| Property        | Type                                     | Required |
| --------------- | ---------------------------------------- | -------- |
| schemas         | Map<string, Schema \| Reference>         | ❌       |
| responses       | Map<string, Response \| Reference>       | ❌       |
| parameters      | Map<string, Parameter \| Reference>      | ❌       |
| examples        | Map<string, Example \| Reference>        | ❌       |
| requestBodies   | Map<string, RequestBody \| Reference>    | ❌       |
| headers         | Map<string, Header \| Reference>         | ❌       |
| securitySchemes | Map<string, SecurityScheme \| Reference> | ❌       |
| links           | Map<string, Link \| Reference>           | ❌       |
| callbacks       | Map<string, Callback \| Reference>       | ❌       |
| x-\*            | any                                      | ❌       |

#### PathItem Object

| Property    | Type                       | Required |
| ----------- | -------------------------- | -------- |
| $ref        | string                     | ❌       |
| summary     | string                     | ❌       |
| description | string                     | ❌       |
| get         | Operation Object           | ❌       |
| put         | Operation Object           | ❌       |
| post        | Operation Object           | ❌       |
| delete      | Operation Object           | ❌       |
| options     | Operation Object           | ❌       |
| head        | Operation Object           | ❌       |
| patch       | Operation Object           | ❌       |
| trace       | Operation Object           | ❌       |
| servers     | Server[]                   | ❌       |
| parameters  | (Parameter \| Reference)[] | ❌       |
| x-\*        | any                        | ❌       |

#### Operation Object (required: responses)

| Property     | Type                               | Required |
| ------------ | ---------------------------------- | -------- |
| tags         | string[]                           | ❌       |
| summary      | string                             | ❌       |
| description  | string                             | ❌       |
| externalDocs | ExternalDocumentation Object       | ❌       |
| operationId  | string                             | ❌       |
| parameters   | (Parameter \| Reference)[]         | ❌       |
| requestBody  | RequestBody \| Reference           | ❌       |
| responses    | Responses Object                   | ✅       |
| callbacks    | Map<string, Callback \| Reference> | ❌       |
| deprecated   | boolean (default: false)           | ❌       |
| security     | SecurityRequirement[]              | ❌       |
| servers      | Server[]                           | ❌       |
| x-\*         | any                                | ❌       |

#### Response Object (required: description)

| Property    | Type                             | Required |
| ----------- | -------------------------------- | -------- |
| description | string                           | ✅       |
| headers     | Map<string, Header \| Reference> | ❌       |
| content     | Map<string, MediaType>           | ❌       |
| links       | Map<string, Link \| Reference>   | ❌       |
| x-\*        | any                              | ❌       |

#### ExternalDocumentation Object (required: url)

| Property    | Type                   | Required |
| ----------- | ---------------------- | -------- |
| description | string                 | ❌       |
| url         | string (uri-reference) | ✅       |
| x-\*        | any                    | ❌       |

#### Tag Object (required: name)

| Property     | Type                         | Required |
| ------------ | ---------------------------- | -------- |
| name         | string                       | ✅       |
| description  | string                       | ❌       |
| externalDocs | ExternalDocumentation Object | ❌       |
| x-\*         | any                          | ❌       |

---

### 1.2 OpenAPI 3.1.x Input Requirements

Source: `openapi_3_1_x_schema_without_validation.json`

The parser MUST accept and preserve ALL 3.0.x fields PLUS the following additions:

#### Root Object Additions (required: openapi, info; anyOf: paths, components, webhooks)

| Property          | Type                         | Required | 3.1.x Only |
| ----------------- | ---------------------------- | -------- | ---------- |
| jsonSchemaDialect | string (uri-reference)       | ❌       | ✅         |
| webhooks          | Map<string, PathItem Object> | ❌       | ✅         |

#### License Object Additions

| Property   | Type   | Required | 3.1.x Only |
| ---------- | ------ | -------- | ---------- |
| identifier | string | ❌       | ✅         |

> Note: In 3.1.x, `identifier` and `url` are mutually exclusive.

#### Components Object Additions

| Property  | Type                  | Required | 3.1.x Only |
| --------- | --------------------- | -------- | ---------- |
| pathItems | Map<string, PathItem> | ❌       | ✅         |

---

## Part 2: OUTPUT Specification

### 2.1 OpenAPI 3.1.x Output Requirements

All output documents MUST:

1. Validate against `openapi_3_1_x_schema_without_validation.json`
2. Have `openapi` field matching pattern `^3\.1\.\d+(-.+)?$`
3. Contain ALL information from the input (NO CONTENT LOSS)

The writer MUST produce ALL of the following when present in the IR:

#### Root Object

| Property          | MUST Output         |
| ----------------- | ------------------- |
| openapi           | ✅ (always "3.1.0") |
| info              | ✅                  |
| jsonSchemaDialect | ✅ (if present)     |
| servers           | ✅ (if non-empty)   |
| paths             | ✅ (if non-empty)   |
| webhooks          | ✅ (if non-empty)   |
| components        | ✅ (if non-empty)   |
| security          | ✅ (if present)     |
| tags              | ✅ (if non-empty)   |
| externalDocs      | ✅ (if present)     |

#### All Object Types

Every object type listed in Part 1 (PathItem, Operation, Response, etc.) MUST have ALL its properties written to output when present in the IR.

---

## Part 3: HTTP Methods

### Allowed Methods

| Method  | 3.0.x | 3.1.x | IRHttpMethod |
| ------- | ----- | ----- | ------------ |
| get     | ✅    | ✅    | ✅           |
| put     | ✅    | ✅    | ✅           |
| post    | ✅    | ✅    | ✅           |
| delete  | ✅    | ✅    | ✅           |
| options | ✅    | ✅    | ✅           |
| head    | ✅    | ✅    | ✅           |
| patch   | ✅    | ✅    | ✅           |
| trace   | ✅    | ✅    | ❌ MISSING   |

---

## Part 4: Test Requirements

### 4.1 Input Coverage Tests

For EACH property listed in Part 1:

- A test document containing that property MUST exist
- A test MUST assert that the IR contains the property after parsing

### 4.2 Output Coverage Tests

For EACH property listed in Part 2:

- A test MUST create an IR containing that property
- A test MUST assert that the output contains the property after writing

### 4.3 Round-Trip Tests (Distinct from Coverage)

Round-trip tests are NOT input/output coverage tests. They verify:

- Input → IR → Output produces equivalent content
- Require BOTH input and output coverage to be complete first

---

## Part 5: Implementation Status

> **Updated:** January 15, 2026 — Comprehensive gap analysis completed.

### IR Gaps (❌ BLOCKING)

**CastrSchema Interface Missing:**
| Field | Type | Priority |
|-------|------|----------|
| `xml` | XMLObject | Low (rarely used) |
| `externalDocs` | ExternalDocumentationObject | Low |
| `prefixItems` | SchemaObject[] | High (JSON Schema 2020-12 core) |
| `unevaluatedProperties` | boolean \| SchemaObject | Medium |
| `unevaluatedItems` | boolean \| SchemaObject | Medium |
| `dependentSchemas` | Record<string, SchemaObject> | Low |
| `dependentRequired` | Record<string, string[]> | Low |
| `minContains` | number | Low |
| `maxContains` | number | Low |

**IRMediaType Missing:**
| Field | Type | Priority |
|-------|------|----------|
| `encoding` | Record<string, EncodingObject> | **High (multipart forms)** |

### Verified Complete ✅

| Item                     | Location                             | Status     |
| ------------------------ | ------------------------------------ | ---------- |
| `trace` method           | `IRHttpMethod` (schema.ts:27)        | ✅ Present |
| `Operation.externalDocs` | `CastrOperation.externalDocs` (:283) | ✅ Present |
| `Operation.callbacks`    | `CastrOperation.callbacks` (:289)    | ✅ Present |
| `Operation.servers`      | `CastrOperation.servers` (:295)      | ✅ Present |
| `PathItem.*` fields      | `CastrOperation.pathItem*`           | ✅ Present |
| `Response.links`         | `CastrResponse.links` (:489)         | ✅ Present |
| `components.examples`    | `IRExampleComponent` (:148)          | ✅ Present |
| `webhooks`               | `CastrDocument.webhooks`             | ✅ Present |
| `jsonSchemaDialect`      | `CastrDocument.jsonSchemaDialect`    | ✅ Present |
| `info.summary`           | Uses raw InfoObject                  | ✅ Present |
| `license.identifier`     | Uses raw InfoObject                  | ✅ Present |
| `mutualTLS`              | Uses raw SecuritySchemeObject        | ✅ Present |

### Parser Status

- ✅ Extracts all fields IR can represent
- ❌ BLOCKED: Cannot extract 10 fields IR cannot represent

### Writer Status

- ✅ Outputs all IR fields
- ❌ BLOCKED: Cannot output 10 fields not in IR

### Test Coverage

| Test Suite            | Count | Purpose                 |
| --------------------- | ----- | ----------------------- |
| Input coverage        | 48    | OpenAPI → IR extraction |
| Output coverage       | 25    | IR → OpenAPI output     |
| Parser field coverage | 45    | Parser validation       |
| Writer field coverage | 37    | Writer validation       |
| Version validation    | 20    | 3.0/3.1 version rules   |
| Scalar behavior       | 16    | Validator behavior      |
| **Total roundtrip**   | 191   |                         |

---

**Session 2.6 Status:** ❌ INCOMPLETE — 10 P1 BLOCKING gaps identified
