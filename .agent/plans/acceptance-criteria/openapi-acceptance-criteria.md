# OpenAPI Acceptance Criteria

> Detailed view of `.agent/requirements.md` sections 1-6. If any conflict exists,
> the requirements document is the source of truth.
> Reference schemas: `.agent/reference/openapi_schema/openapi_3_0_x_schema.json` and
> `.agent/reference/openapi_schema/openapi_3_1_x_schema_without_validation.json`.

---

## Scope

- Input: OpenAPI 3.0.x and 3.1.x (all valid fields)
- Output: OpenAPI 3.1.x only
- Internal: IR is normalized to 3.1.x
- OpenAPI 3.2.x is not supported

---

## Part 1: Input Coverage (OpenAPI 3.0.x)

The parser MUST accept and preserve ALL fields listed in requirements section 2.
This section is the detailed checklist.

### Document Root (3.0.x)

- `openapi` (required, semver ^3.0.x)
- `info` (required)
- `servers`
- `paths` (required)
- `components`
- `security`
- `tags`
- `externalDocs`
- `x-*`

### Info Object

- `title` (required)
- `description`
- `termsOfService`
- `contact`
- `license`
- `version` (required)
- `x-*`

### Contact Object

- `name`
- `url`
- `email`
- `x-*`

### License Object

- `name` (required)
- `url`
- `x-*`

### Server Object

- `url` (required)
- `description`
- `variables`
- `x-*`

### ServerVariable Object

- `enum`
- `default` (required)
- `description`
- `x-*`

### Path Item Object

- `$ref`
- `summary`
- `description`
- `get`, `put`, `post`, `delete`, `options`, `head`, `patch`, `trace`
- `servers`
- `parameters`
- `x-*`

### Operation Object

- `tags`
- `summary`
- `description`
- `externalDocs`
- `operationId`
- `parameters`
- `requestBody`
- `responses` (required)
- `callbacks`
- `deprecated`
- `security`
- `servers`
- `x-*`

### Parameter Object (3.0.x)

- `name` (required)
- `in` (required)
- `description`
- `required`
- `deprecated`
- `allowEmptyValue`
- `style`
- `explode`
- `allowReserved`
- `schema`
- `example`
- `examples`
- `content`
- `x-*`

### RequestBody Object

- `description`
- `content` (required)
- `required`
- `x-*`

### MediaType Object (3.0.x)

- `schema`
- `example`
- `examples`
- `encoding` (multipart/form-data)

### Encoding Object

- `contentType`
- `headers`
- `style`
- `explode`
- `allowReserved`
- `x-*`

### Response Object

- `description` (required)
- `headers`
- `content`
- `links`
- `x-*`

### Schema Object (3.0.x)

- Core: `type`, `allOf`, `oneOf`, `anyOf`, `not`, `items`, `properties`, `additionalProperties`
- Validation: `multipleOf`, `maximum`, `minimum`, `exclusiveMaximum` (boolean), `exclusiveMinimum` (boolean),
  `maxLength`, `minLength`, `pattern`, `maxItems`, `minItems`, `uniqueItems`, `maxProperties`, `minProperties`,
  `required`, `enum`
- Metadata: `title`, `description`, `default`, `format`, `example`
- OAS extensions: `nullable`, `discriminator`, `xml`, `externalDocs`, `readOnly`, `writeOnly`, `deprecated`, `x-*`

### Security Schemes (3.0.x)

- `type` (required): `apiKey`, `http`, `oauth2`, `openIdConnect`
- ApiKey: `name`, `in`
- HTTP: `scheme`, `bearerFormat`
- OAuth2: `flows` (implicit, password, clientCredentials, authorizationCode)
- OpenID: `openIdConnectUrl`

### Components (3.0.x)

- `schemas`, `responses`, `parameters`, `examples`, `requestBodies`, `headers`,
  `securitySchemes`, `links`, `callbacks`, `x-*`

### Other Objects

- Tag: `name` (required), `description`, `externalDocs`, `x-*`
- ExternalDocs: `url` (required), `description`, `x-*`
- Link: `operationRef`, `operationId`, `parameters`, `requestBody`, `description`, `server`, `x-*`
- Callback: `{expression} -> PathItem`, `x-*`
- Example: `summary`, `description`, `value`, `externalValue`, `x-*`

---

## Part 2: Input Coverage (OpenAPI 3.1.x Additions)

The parser MUST accept and preserve ALL fields listed in requirements section 3.
These are added on top of 3.0.x input.

### Document Root (3.1 additions)

- `paths` becomes optional if `webhooks` or `components` exist
- `webhooks`
- `jsonSchemaDialect`

### Info Object (3.1)

- `summary`

### License Object (3.1)

- `identifier`

### Components (3.1)

- `pathItems`

### Security Schemes (3.1)

- `mutualTLS`

### Schema Object (3.1 / JSON Schema 2020-12)

- `type` may be an array (e.g., `['string', 'null']`)
- `const`
- `prefixItems` (tuple support)
- `$dynamicRef`, `$dynamicAnchor`
- `unevaluatedProperties`, `unevaluatedItems`
- `dependentSchemas`, `dependentRequired`
- `minContains`, `maxContains`
- `exclusiveMinimum` and `exclusiveMaximum` are numbers
- `nullable` is NOT allowed in 3.1 input

---

## Part 3: Strict Validation and Rejection

Derived from requirements section 4.

### Reject 3.0 specs that include 3.1-only syntax

- `webhooks`, `jsonSchemaDialect`, `info.summary`, `license.identifier`
- Array `type` values, `const`, `prefixItems`, `unevaluatedProperties`
- `exclusiveMinimum`/`exclusiveMaximum` as numbers
- `mutualTLS` security scheme
- `pathItems` in components

### Reject 3.1 specs that include 3.0-only syntax

- `nullable: true`
- `exclusiveMinimum`/`exclusiveMaximum` as booleans
- `items` as array (tuples MUST use `prefixItems`)

### Reject invalid syntax (both versions)

- Invalid `openapi` semver
- Unresolvable `$ref` pointers
- Invalid HTTP methods
- Missing required fields

---

## Part 4: Automatic Upgrade (3.0 -> 3.1)

Derived from requirements section 5.

- `nullable: true` + `type: "string"` -> `type: ["string", "null"]`
- `exclusiveMinimum: true` + `minimum: 10` -> `exclusiveMinimum: 10`
- `exclusiveMaximum: true` + `maximum: 100` -> `exclusiveMaximum: 100`
- `items: [SchemaA, SchemaB]` -> `prefixItems: [SchemaA, SchemaB]`
- Preserve both `example` and `examples` in IR; prefer `examples` in 3.1 output

---

## Part 5: Output Requirements (OpenAPI 3.1.x)

All output documents MUST:

1. Validate against the 3.1 JSON schema
2. Emit `openapi` as 3.1.x (prefer `3.1.0` unless configured)
3. Preserve ALL information from the IR (no content loss)
4. Avoid 3.0-only constructs (`nullable`, boolean exclusive bounds, tuple `items` arrays)

### Root Object Output (when present in IR)

- `openapi`, `info`, `jsonSchemaDialect`, `servers`, `paths`, `webhooks`, `components`, `security`, `tags`, `externalDocs`

### Object-Level Output

Every object type listed in Parts 1 and 2 MUST have ALL of its IR properties
written to output when present.

---

## Part 6: HTTP Methods

Allowed methods for input and output:

- `get`, `put`, `post`, `delete`, `options`, `head`, `patch`, `trace`

---

## Part 7: Test Requirements

### Input Coverage Tests

- For EACH field in Parts 1 and 2, a fixture MUST exist
- Tests MUST assert the IR contains that field after parsing

### Output Coverage Tests

- For EACH field in Parts 1 and 2, a test MUST assert the writer emits it from IR

### Version Rejection Tests

- 3.0 input with 3.1-only syntax MUST throw
- 3.1 input with 3.0-only syntax MUST throw

### Upgrade Tests

- 3.0 -> 3.1 transformations MUST be verified for each rule in Part 4

### Round-Trip Tests

- Input -> IR -> Output preserves semantics
- Normalized specs round-trip byte-for-byte

---

## Part 8: Blocking Gaps (from requirements section 6)

These MUST be implemented before OpenAPI compliance is considered complete:

### CastrSchema missing fields

- `xml`
- `externalDocs`
- `prefixItems`
- `unevaluatedProperties`
- `unevaluatedItems`
- `dependentSchemas`
- `dependentRequired`
- `minContains`
- `maxContains`

### IRMediaType missing field

- `encoding`
