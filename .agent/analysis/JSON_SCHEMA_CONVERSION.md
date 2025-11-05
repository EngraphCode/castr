# JSON Schema Conversion Strategy

**Created:** November 5, 2025  
**Target:** JSON Schema Draft 07  
**Purpose:** Define OpenAPI Schema Object → JSON Schema Draft 07 conversion rules for MCP tools

---

## Overview

This document defines the strategy for converting OpenAPI 3.1 Schema Objects to JSON Schema Draft 07 format for MCP tool `inputSchema` and `outputSchema` fields.

**Key Decision:** Generate JSON Schema directly from OpenAPI specifications (parallel to Zod), not via Zod → JSON Schema conversion.

---

## Strategic Approach: Parallel Conversion

### Why Not Zod → JSON Schema?

**Rejected Approach:** OpenAPI → Zod → JSON Schema (using `zod-to-json-schema`)

**Reasons for rejection:**

1. **Information loss:** Zod `.transform()` and `.refine()` don't translate to JSON Schema
2. **Limited support:** Complex Zod features have no JSON Schema equivalent
3. **Conversion limitations:** Non-string record keys ignored, effect strategies needed
4. **Maintenance complexity:** Additional conversion layer to debug
5. **Unnecessary dependency:** `zod-to-json-schema` adds complexity

### Chosen Approach: Direct Parallel Conversion

**Selected Approach:** OpenAPI → (Zod + JSON Schema) in parallel

```
                    ┌──────────────┐
                    │   OpenAPI    │
                    │    Schema    │
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
         ┌─────────────┐      ┌─────────────┐
         │ Zod Schema  │      │ JSON Schema │
         │ Converter   │      │ Converter   │
         └─────────────┘      └─────────────┘
                │                     │
                ▼                     ▼
         ┌─────────────┐      ┌─────────────┐
         │ Zod Schemas │      │ Draft 07    │
         │ (Runtime)   │      │ (MCP Tools) │
         └─────────────┘      └─────────────┘
```

**Benefits:**

1. **No information loss:** Direct OpenAPI → JSON Schema mapping
2. **Optimal for each use case:** Zod for TypeScript, JSON Schema for MCP
3. **Clean separation:** Each converter optimized for its target
4. **No external conversion dependency:** Full control over output
5. **Easier testing:** Verify both outputs independently

---

## OpenAPI 3.1 vs JSON Schema Draft 07

### Key Differences

OpenAPI 3.1 uses JSON Schema Draft 2020-12 vocabulary, but MCP requires Draft 07. Key differences:

| Feature                 | OpenAPI 3.1 (Draft 2020-12) | JSON Schema Draft 07                 | Conversion Strategy                    |
| ----------------------- | --------------------------- | ------------------------------------ | -------------------------------------- |
| Nullable types          | `type: ['string', 'null']`  | Not native                           | Use type array (supported in Draft 07) |
| Exclusive bounds        | `exclusiveMinimum: 5`       | `exclusiveMinimum: true, minimum: 5` | Convert to Draft 07 format             |
| `$vocabulary`           | Supported                   | Not supported                        | Strip from output                      |
| `$dynamicRef`           | Supported                   | Not supported                        | Convert to standard `$ref`             |
| `unevaluatedProperties` | Supported                   | Not supported                        | Use `additionalProperties`             |
| `dependentSchemas`      | Supported                   | `dependencies`                       | Convert to Draft 07 `dependencies`     |

---

## Type Conversions

### Primitive Types

#### String

```yaml
# OpenAPI
type: string
minLength: 5
maxLength: 100
pattern: '^[A-Z]'
format: email
```

```json
// JSON Schema Draft 07
{
  "type": "string",
  "minLength": 5,
  "maxLength": 100,
  "pattern": "^[A-Z]",
  "format": "email"
}
```

**Direct mapping:** No conversion needed for basic string properties.

#### Number/Integer

```yaml
# OpenAPI
type: number
minimum: 0
maximum: 100
multipleOf: 5
```

```json
// JSON Schema Draft 07
{
  "type": "number",
  "minimum": 0,
  "maximum": 100,
  "multipleOf": 5
}
```

**Direct mapping:** Basic numeric constraints map directly.

#### Boolean

```yaml
# OpenAPI
type: boolean
```

```json
// JSON Schema Draft 07
{
  "type": "boolean"
}
```

**Direct mapping:** No conversion needed.

#### Null

```yaml
# OpenAPI 3.1
type: 'null'
```

```json
// JSON Schema Draft 07 (in type array)
{
  "type": "null"
}
```

**Note:** Null type is valid in Draft 07 but typically used in type arrays.

---

### Nullable Types

**OpenAPI 3.1 style:**

```yaml
type:
  - string
  - 'null'
```

**JSON Schema Draft 07 conversion:**

```json
{
  "type": ["string", "null"]
}
```

**Note:** Type arrays are supported in Draft 07, so OpenAPI 3.1 nullable syntax works directly.

**Alternative OpenAPI 3.0 style (if encountered):**

```yaml
type: string
nullable: true
```

**Conversion:**

```json
{
  "type": ["string", "null"]
}
```

---

### Array Types

#### Simple Array

```yaml
# OpenAPI
type: array
items:
  type: string
minItems: 1
maxItems: 10
uniqueItems: true
```

```json
// JSON Schema Draft 07
{
  "type": "array",
  "items": {
    "type": "string"
  },
  "minItems": 1,
  "maxItems": 10,
  "uniqueItems": true
}
```

**Direct mapping:** Array constraints map directly.

#### Tuple (Fixed Array)

```yaml
# OpenAPI
type: array
prefixItems:
  - type: string
  - type: number
items: false
```

**JSON Schema Draft 07 conversion:**

```json
{
  "type": "array",
  "items": [{ "type": "string" }, { "type": "number" }],
  "additionalItems": false
}
```

**Note:** OpenAPI 3.1's `prefixItems` becomes Draft 07's positional `items` array.

---

### Object Types

#### Basic Object

```yaml
# OpenAPI
type: object
properties:
  name:
    type: string
  age:
    type: integer
required:
  - name
additionalProperties: false
```

```json
// JSON Schema Draft 07
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer" }
  },
  "required": ["name"],
  "additionalProperties": false
}
```

**Direct mapping:** Object structure maps directly.

#### Pattern Properties

```yaml
# OpenAPI
type: object
patternProperties:
  '^[A-Z]':
    type: string
```

```json
// JSON Schema Draft 07
{
  "type": "object",
  "patternProperties": {
    "^[A-Z]": { "type": "string" }
  }
}
```

**Direct mapping:** Pattern properties work the same.

---

## Constraint Conversions

### Exclusive Bounds (OpenAPI 3.1 → Draft 07)

#### Exclusive Minimum

**OpenAPI 3.1:**

```yaml
type: number
exclusiveMinimum: 5
```

**JSON Schema Draft 07:**

```json
{
  "type": "number",
  "minimum": 5,
  "exclusiveMinimum": true
}
```

**Conversion logic:**

```typescript
if (schema.exclusiveMinimum !== undefined && typeof schema.exclusiveMinimum === 'number') {
  jsonSchema.minimum = schema.exclusiveMinimum;
  jsonSchema.exclusiveMinimum = true;
}
```

#### Exclusive Maximum

**OpenAPI 3.1:**

```yaml
type: number
exclusiveMaximum: 100
```

**JSON Schema Draft 07:**

```json
{
  "type": "number",
  "maximum": 100,
  "exclusiveMaximum": true
}
```

**Conversion logic:**

```typescript
if (schema.exclusiveMaximum !== undefined && typeof schema.exclusiveMaximum === 'number') {
  jsonSchema.maximum = schema.exclusiveMaximum;
  jsonSchema.exclusiveMaximum = true;
}
```

---

## Composition Keywords

### allOf

```yaml
# OpenAPI
allOf:
  - type: object
    properties:
      name:
        type: string
  - type: object
    properties:
      age:
        type: integer
```

```json
// JSON Schema Draft 07
{
  "allOf": [
    {
      "type": "object",
      "properties": {
        "name": { "type": "string" }
      }
    },
    {
      "type": "object",
      "properties": {
        "age": { "type": "integer" }
      }
    }
  ]
}
```

**Direct mapping:** `allOf` works the same in both versions.

### oneOf

```yaml
# OpenAPI
oneOf:
  - type: string
  - type: number
```

```json
// JSON Schema Draft 07
{
  "oneOf": [{ "type": "string" }, { "type": "number" }]
}
```

**Direct mapping:** `oneOf` works the same.

### anyOf

```yaml
# OpenAPI
anyOf:
  - type: string
  - type: number
```

```json
// JSON Schema Draft 07
{
  "anyOf": [{ "type": "string" }, { "type": "number" }]
}
```

**Direct mapping:** `anyOf` works the same.

### not

```yaml
# OpenAPI
not:
  type: string
```

```json
// JSON Schema Draft 07
{
  "not": { "type": "string" }
}
```

**Direct mapping:** `not` works the same.

---

## Discriminator Handling

**OpenAPI discriminator:**

```yaml
oneOf:
  - $ref: '#/components/schemas/Cat'
  - $ref: '#/components/schemas/Dog'
discriminator:
  propertyName: petType
  mapping:
    cat: '#/components/schemas/Cat'
    dog: '#/components/schemas/Dog'
```

**JSON Schema Draft 07 conversion:**

Draft 07 doesn't have native discriminator support. Two approaches:

### Approach 1: Preserve oneOf (Recommended)

```json
{
  "oneOf": [{ "$ref": "#/definitions/Cat" }, { "$ref": "#/definitions/Dog" }]
}
```

**Note:** Add documentation comment explaining discriminator property.

### Approach 2: Expand with Required Property

```json
{
  "oneOf": [
    {
      "allOf": [
        { "$ref": "#/definitions/Cat" },
        { "properties": { "petType": { "const": "cat" } }, "required": ["petType"] }
      ]
    },
    {
      "allOf": [
        { "$ref": "#/definitions/Dog" },
        { "properties": { "petType": { "const": "dog" } }, "required": ["petType"] }
      ]
    }
  ]
}
```

**Recommendation:** Use Approach 1 and document discriminator in tool description.

---

## Reference Handling

### Internal References

**OpenAPI:**

```yaml
$ref: '#/components/schemas/User'
```

**JSON Schema Draft 07:**

```json
{
  "$ref": "#/definitions/User"
}
```

**Conversion:** Change `#/components/schemas/` to `#/definitions/`

### External References

**OpenAPI:**

```yaml
$ref: 'external.yaml#/components/schemas/User'
```

**Strategy:** External references should be resolved during bundling phase (Scalar pipeline). By the time we generate JSON Schema, all schemas should be internal.

**If unresolved:** Log warning and preserve as-is.

---

## Format Strings

### Common Formats

| OpenAPI Format  | Draft 07 Support | Notes                         |
| --------------- | ---------------- | ----------------------------- |
| `date-time`     | ✅ Supported     | ISO 8601 date-time            |
| `date`          | ✅ Supported     | ISO 8601 full-date            |
| `time`          | ✅ Supported     | ISO 8601 time                 |
| `email`         | ✅ Supported     | Email address                 |
| `hostname`      | ✅ Supported     | Hostname                      |
| `ipv4`          | ✅ Supported     | IPv4 address                  |
| `ipv6`          | ✅ Supported     | IPv6 address                  |
| `uri`           | ✅ Supported     | URI                           |
| `uri-reference` | ✅ Supported     | URI reference                 |
| `json-pointer`  | ✅ Supported     | JSON Pointer                  |
| `regex`         | ✅ Supported     | Regular expression            |
| `uuid`          | ⚠️ Not in spec   | Preserve but may not validate |
| `byte`          | ⚠️ Not in spec   | Base64 encoded string         |
| `binary`        | ⚠️ Not in spec   | Binary data                   |
| `password`      | ⚠️ Not in spec   | Password field hint           |

**Strategy:** Preserve all format strings. Validators may support additional formats beyond spec.

---

## Edge Cases

### Empty Schema

**OpenAPI:**

```yaml
{}
```

**JSON Schema Draft 07:**

```json
{}
```

**Meaning:** Accepts any value. Valid but uncommon.

### Boolean Schemas (OpenAPI 3.1)

**OpenAPI:**

```yaml
true   # Accept anything
false  # Accept nothing
```

**JSON Schema Draft 07:**

```json
true   // Supported
false  // Supported
```

**Note:** Boolean schemas are valid in Draft 07.

### const Keyword

**OpenAPI:**

```yaml
type: string
const: 'active'
```

**JSON Schema Draft 07:**

```json
{
  "type": "string",
  "const": "active"
}
```

**Direct mapping:** `const` supported in Draft 07.

### enum Keyword

**OpenAPI:**

```yaml
type: string
enum:
  - active
  - inactive
  - pending
```

**JSON Schema Draft 07:**

```json
{
  "type": "string",
  "enum": ["active", "inactive", "pending"]
}
```

**Direct mapping:** `enum` works the same.

### default Keyword

**OpenAPI:**

```yaml
type: string
default: 'active'
```

**JSON Schema Draft 07:**

```json
{
  "type": "string",
  "default": "active"
}
```

**Direct mapping:** `default` supported (informational in Draft 07).

### readOnly/writeOnly

**OpenAPI:**

```yaml
type: object
properties:
  id:
    type: string
    readOnly: true
  password:
    type: string
    writeOnly: true
```

**JSON Schema Draft 07:**

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "readOnly": true
    },
    "password": {
      "type": "string",
      "writeOnly": true
    }
  }
}
```

**Direct mapping:** Both supported in Draft 07.

**Context for MCP:**

- `readOnly` properties in response schemas (outputSchema)
- `writeOnly` properties in request schemas (inputSchema)

---

## Keywords to Strip

### OpenAPI-Specific Keywords

These OpenAPI-specific keywords should be **removed** when generating JSON Schema:

- `discriminator` - No Draft 07 equivalent (handle via oneOf)
- `xml` - Not relevant for JSON
- `externalDocs` - OpenAPI metadata, not schema
- `example` - Use `examples` array or strip
- `deprecated` - Can preserve (informational)

### Draft 2020-12 Keywords

These newer keywords should be **converted or removed**:

- `$vocabulary` - Remove (Draft 2020-12 only)
- `$dynamicRef`/`$dynamicAnchor` - Convert to standard `$ref`
- `prefixItems` - Convert to positional `items` array
- `unevaluatedProperties` - Convert to `additionalProperties`
- `unevaluatedItems` - Convert to `additionalItems`
- `dependentSchemas` - Convert to `dependencies`

---

## Testing Strategy

### Unit Tests

Test individual conversion functions:

```typescript
describe('convertOpenApiSchemaToJsonSchema', () => {
  test('converts nullable string to type array', () => {
    const openApiSchema = {
      type: ['string', 'null'],
    };
    const result = convertOpenApiSchemaToJsonSchema(openApiSchema);
    expect(result).toEqual({
      type: ['string', 'null'],
    });
  });

  test('converts exclusive minimum to Draft 07 format', () => {
    const openApiSchema = {
      type: 'number',
      exclusiveMinimum: 5,
    };
    const result = convertOpenApiSchemaToJsonSchema(openApiSchema);
    expect(result).toEqual({
      type: 'number',
      minimum: 5,
      exclusiveMinimum: true,
    });
  });
});
```

### Snapshot Tests

Test complete OpenAPI operations → MCP tools:

```typescript
describe('OpenAPI to MCP Tool conversion', () => {
  test('converts petstore getUserById operation', async () => {
    const spec = await loadFixture('petstore.yaml');
    const tools = generateMcpTools(spec);
    expect(tools).toMatchSnapshot();
  });

  test('converts GitHub API operations', async () => {
    const spec = await loadFixture('github-api.yaml');
    const tools = generateMcpTools(spec);
    expect(tools).toMatchSnapshot();
  });
});
```

### JSON Schema Validation

Validate generated schemas against Draft 07 meta-schema:

```typescript
import Ajv from 'ajv';
import draft07MetaSchema from 'ajv/lib/refs/json-schema-draft-07.json';

test('generated schema is valid Draft 07', () => {
  const ajv = new Ajv();
  ajv.addMetaSchema(draft07MetaSchema);

  const generatedSchema = convertOpenApiSchemaToJsonSchema(inputSchema);
  const valid = ajv.validateSchema(generatedSchema);

  expect(valid).toBe(true);
  expect(ajv.errors).toBeNull();
});
```

### Round-Trip Testing

Verify that valid OpenAPI schemas produce valid JSON Schemas:

```typescript
test('round-trip validation', () => {
  const openApiSchema = { type: 'string', minLength: 5 };
  const jsonSchema = convertOpenApiSchemaToJsonSchema(openApiSchema);

  // Validate sample data with both schemas
  const sampleData = 'hello';

  // Should validate against OpenAPI schema
  expect(validateOpenApiSchema(sampleData, openApiSchema)).toBe(true);

  // Should validate against generated JSON Schema
  expect(validateJsonSchema(sampleData, jsonSchema)).toBe(true);
});
```

---

## Implementation Checklist

- [ ] Create `lib/src/conversion/json-schema/` directory
- [ ] Implement core converter function
- [ ] Handle primitive types (string, number, boolean, null)
- [ ] Handle array types (simple and tuple)
- [ ] Handle object types (properties, pattern properties)
- [ ] Convert nullable types (type arrays)
- [ ] Convert exclusive bounds (min/max)
- [ ] Handle composition keywords (allOf, oneOf, anyOf, not)
- [ ] Convert references (`#/components/schemas/` → `#/definitions/`)
- [ ] Strip OpenAPI-specific keywords
- [ ] Convert Draft 2020-12 keywords to Draft 07
- [ ] Preserve format strings
- [ ] Add unit tests for all conversion cases
- [ ] Add snapshot tests with real OpenAPI specs
- [ ] Validate generated schemas with AJV + Draft 07 meta-schema
- [ ] Document any unsupported edge cases

---

## Configuration

### Converter Options

```typescript
interface JsonSchemaConversionOptions {
  targetDraft: '07'; // Always Draft 07 for MCP
  preserveDescription: boolean; // Include descriptions
  preserveExamples: boolean; // Include example values
  strictMode: boolean; // Fail on unsupported features vs warn
  inlineRefs: boolean; // Inline $refs vs preserve
}
```

---

## References

- [JSON Schema Draft 07 Specification](http://json-schema.org/draft-07/schema)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [JSON Schema Migration Guide (Draft 2020-12 → Draft 07)](https://json-schema.org/draft/2020-12/release-notes)
- [AJV JSON Schema Validator](https://ajv.js.org/)

---

**Last Updated:** November 5, 2025  
**Status:** Complete - Ready for implementation
