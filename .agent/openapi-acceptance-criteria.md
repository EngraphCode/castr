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

## Part 5: Current Implementation Gaps

### Missing from IR (MUST be added)

| Item                   | Location         |
| ---------------------- | ---------------- |
| trace method           | IRHttpMethod     |
| Operation.externalDocs | CastrOperation   |
| Operation.callbacks    | CastrOperation   |
| Operation.servers      | CastrOperation   |
| PathItem.summary       | IR path handling |
| PathItem.description   | IR path handling |
| PathItem.servers       | IR path handling |
| Response.links         | CastrResponse    |
| components.examples    | IRComponent      |

### Missing Tests

- No systematic per-field input coverage tests
- No systematic per-field output coverage tests
- Fixture tests are smoke tests, not specification compliance tests
