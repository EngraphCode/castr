# The cases the model's design must hold

25 November 2026. Written by the seat (Firefly binds Tallow, Claude Fable 5.2) for step M2
of [the plan for the model's design](../plans/active/model-design.md).

Each case is a small document, the sentence of [the specification](../../docs/SPECIFICATION.md)
it tests, what the model has to hold for it, and what a structure that copies each
format's keywords loses. The design is proved against these in step M4: a case the
structure cannot hold changes the structure, and a case is never dropped.

Two kinds of case. Sections A to H are single documents. Section I is the equivalence
sets: one meaning written two or three ways, which the model holds as **one value**; and
the pairs that look alike and are **not** one value.

Every JSON document below parses, and every Zod fragment runs against Zod 4.6.7 and does
what its case says; the seat checked both by program. The documents are fragments: an
OpenAPI case shows the part that matters and omits `openapi`, `info` and the rest.

The cases come from the plan's first list, from the three hand-made lists of what the
texts and Zod define (`lib/tests-picture/`), and from the two surveys. The list is a
floor.

## A. Names, identity and references

### A1. A reference to a named schema

```json
{
  "components": {
    "schemas": {
      "Pet": {
        "type": "object",
        "properties": { "owner": { "$ref": "#/components/schemas/Person" } }
      },
      "Person": { "type": "object" }
    }
  }
}
```

- **Tests:** SPEC-PR-3, a named definition stays named and is written once.
- **Holds:** two definitions, each with the identity its source gives it, and an edge from
  one to the other.
- **A naive structure loses:** the edge, if it keeps the string `#/components/schemas/Person`.
  A JSON Schema writer needs `#/$defs/Person` and a Zod writer needs an identifier. The
  string is one format's spelling of the edge.

### A2. A reference to each other kind of named thing

```json
{
  "paths": {
    "/pets": {
      "get": {
        "parameters": [{ "$ref": "#/components/parameters/Limit" }],
        "responses": { "200": { "$ref": "#/components/responses/Pets" } }
      }
    }
  },
  "components": {
    "parameters": { "Limit": { "name": "limit", "in": "query", "schema": { "type": "integer" } } },
    "responses": { "Pets": { "description": "ok" } }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-AR-1, the model is format-agnostic.
- **Holds:** a reference to a parameter and to a response in the same way as to a schema:
  an edge to a thing with an identity. Likewise a request body, a header, an example, a
  link, a callback, a path item, a security scheme and, in 3.2, a media type.
- **A naive structure loses:** the kinds other than schema, if "reference" is a kind of
  schema node.

### A3. A path item given by reference

```json
{
  "paths": { "/pets": { "$ref": "#/components/pathItems/Pets" } },
  "components": {
    "pathItems": { "Pets": { "get": { "responses": { "200": { "description": "ok" } } } } }
  }
}
```

- **Tests:** SPEC-PR-3; Appendix B.4's rows for a path.
- **Holds:** that the path is given by reference, and to what.
- **A naive structure loses:** the name, if the reader resolves the reference and keeps
  only the operations.

### A4. A reference with keywords beside it, in each draft

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$defs": { "Name": { "type": "string" } },
  "properties": { "name": { "$ref": "#/$defs/Name", "maxLength": 10, "description": "short" } }
}
```

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": { "Name": { "type": "string" } },
  "properties": { "name": { "$ref": "#/definitions/Name", "maxLength": 10 } }
}
```

- **Tests:** SPEC-PR-1, anything a document states is carried; SPEC-PR-2, nothing changes
  silently.
- **Holds:** for 2020-12, a reference and a constraint that both apply. For Draft-07, a
  reference alone: the text says every other property in the object is ignored, so
  `maxLength` states nothing there.
- **A naive structure loses:** the difference. One node shape with "a reference and its
  siblings" reads the two documents as the same, and they are not.

### A5. A cycle

```json
{
  "$defs": {
    "Node": { "type": "object", "properties": { "next": { "$ref": "#/$defs/Node" } } }
  },
  "$ref": "#/$defs/Node"
}
```

- **Tests:** SPEC-PR-3. The OpenAPI text says references may form a cycle.
- **Holds:** a definition that refers to itself, as an edge, with no expansion.
- **A naive structure loses:** termination, if it inlines; or the Zod writer's knowledge
  that this edge needs a getter, if cycles are not a fact the model can be asked for.

### A6. A resource with an identifier, an anchor and an embedded resource

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/root",
  "$defs": {
    "a": { "$anchor": "here", "type": "string" },
    "b": {
      "$id": "https://example.com/other",
      "$defs": { "c": { "$anchor": "here", "type": "number" } }
    }
  },
  "properties": {
    "x": { "$ref": "#here" },
    "y": { "$ref": "https://example.com/other#here" }
  }
}
```

- **Tests:** SPEC-PR-3; the definition of "document" in section 3.
- **Holds:** two resources, each with its own identifier and its own anchors. The same
  anchor name in each is a different target.
- **A naive structure loses:** which `here` a reference means, if anchors are one table
  for the document.

### A7. A reference into another document

```json
{
  "paths": {
    "/pets": {
      "get": {
        "responses": {
          "200": {
            "description": "ok",
            "content": {
              "application/json": { "schema": { "$ref": "./schemas.json#/components/schemas/Pet" } }
            }
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-FV-1, what the reader refuses.
- **Holds:** an edge to a thing in another document, with which document. The OpenAPI text
  says only the entry document's paths add to the API, and leaves how a name is resolved
  from another document to the implementation.
- **A naive structure loses:** the boundary between documents, if the reader bundles
  everything into one before the model sees it.

### A8. Connections made by name, not by reference

```json
{
  "security": [{ "apiKey": [] }],
  "paths": {
    "/pets": {
      "get": {
        "tags": ["pets"],
        "operationId": "listPets",
        "responses": {
          "200": { "description": "ok", "links": { "next": { "operationId": "listPets" } } }
        }
      }
    }
  },
  "tags": [{ "name": "pets" }],
  "components": {
    "securitySchemes": { "apiKey": { "type": "apiKey", "name": "k", "in": "header" } }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-AR-3, semantic operations only.
- **Holds:** four edges that the source writes as a bare name: a security requirement to
  its scheme, an operation to its tag, a link to its operation, and (case A9) a
  discriminator value to a schema.
- **A naive structure loses:** the edges. They are strings in the source, and a model
  that keeps them as strings makes every writer look the name up again by matching text.

### A9. A discriminator, with and without a mapping

```json
{
  "components": {
    "schemas": {
      "Pet": {
        "oneOf": [{ "$ref": "#/components/schemas/Cat" }, { "$ref": "#/components/schemas/Dog" }],
        "discriminator": {
          "propertyName": "kind",
          "mapping": { "hound": "#/components/schemas/Dog" }
        }
      },
      "Cat": {
        "type": "object",
        "properties": { "kind": { "type": "string" } },
        "required": ["kind"]
      },
      "Dog": {
        "type": "object",
        "properties": { "kind": { "type": "string" } },
        "required": ["kind"]
      }
    }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-PR-7, the source's stated meaning governs.
- **Holds:** for each alternative, the values that select it: `hound` and, by the implicit
  rule, `Dog` for the second; `Cat` for the first. Each is an edge to a definition. The
  discriminator is a hint and never changes what validates.
- **A naive structure loses:** the implicit values, if it keeps only the `mapping` object;
  and the edge, if a mapped value stays a string that is sometimes a name and sometimes a
  URI.

### A10. A name the target cannot write

```json
{
  "components": {
    "schemas": { "pet.v2-draft": { "type": "object" }, "class": { "type": "string" } }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-PR-2.
- **Holds:** the name the source gave, exactly. What a TypeScript or Zod writer calls the
  definition is the writer's, derived from that name by a rule the specification states.
- **A naive structure loses:** the source's name, if the model holds an identifier already
  made safe for one target.

### A11. Two locations that look like one

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$defs": { "x": { "type": "string" } },
  "definitions": { "x": { "type": "number" } },
  "properties": { "a": { "$ref": "#/$defs/x" }, "b": { "$ref": "#/definitions/x" } }
}
```

- **Tests:** SPEC-PR-3.
- **Holds:** two definitions. The 2020-12 dialect's meta-schema still constrains
  `definitions`, and the text says to treat it as behaving like `$defs`; that makes both
  places hold schemas, and does not make `#/definitions/x` and `#/$defs/x` one target.
- **A naive structure loses:** one of them, if it merges the two keywords into one table
  keyed by the last path segment.

## B. Evaluation that is not local to one schema object

### B1. Closing an object across a composition

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "allOf": [{ "$ref": "#/$defs/Base" }],
  "properties": { "extra": { "type": "string" } },
  "unevaluatedProperties": false,
  "$defs": { "Base": { "type": "object", "properties": { "id": { "type": "string" } } } }
}
```

- **Tests:** SPEC-P-1, written across composition and references with
  `unevaluatedProperties`.
- **Holds:** an object that is closed over `id` and `extra`, and that `id` comes from a
  named definition which is not itself closed.
- **A naive structure loses:** either the closure, if it reads `unevaluatedProperties` as
  `additionalProperties`; or the reference, if it merges `Base` in to compute the closure.

### B2. The same keyword over a choice

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "anyOf": [
    { "properties": { "a": { "type": "string" } }, "required": ["a"] },
    { "properties": { "b": { "type": "string" } }, "required": ["b"] }
  ],
  "unevaluatedProperties": false
}
```

- **Tests:** SPEC-P-1; SPEC-PR-2.
- **Holds:** that which properties are allowed depends on which branches the value
  satisfies: `{a}` and `{b}` and `{a, b}` pass, and `{a, c}` fails. This cannot be stated
  as one fixed set of key names.
- **A naive structure loses:** the meaning, if "closed" is a flag on an object with a list
  of its keys. The survey reports that rewriting this without the keyword grows
  exponentially in the number of branches.

### B3. The same keyword over a condition

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "properties": { "kind": { "type": "string" } },
  "if": { "properties": { "kind": { "const": "a" } }, "required": ["kind"] },
  "then": { "properties": { "x": { "type": "string" } } },
  "else": { "properties": { "y": { "type": "string" } } },
  "unevaluatedProperties": false
}
```

- **Tests:** SPEC-P-1.
- **Holds:** that `x` is allowed only where `kind` is `a`, and `y` only where it is not.
- **A naive structure loses:** the dependence of the allowed keys on the condition.

### B4. Unevaluated items

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "prefixItems": [{ "type": "string" }],
  "allOf": [{ "prefixItems": [true, { "type": "number" }] }],
  "unevaluatedItems": false
}
```

- **Tests:** SPEC-P-1's sibling for arrays; SPEC-PR-2.
- **Holds:** a tuple of two, closed, whose second position is constrained inside the
  `allOf`.
- **A naive structure loses:** the second position, if it reads the outer `prefixItems`
  alone and takes `unevaluatedItems` as `items`.

### B5. A dynamic reference

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/strict-tree",
  "$dynamicAnchor": "node",
  "$ref": "tree",
  "unevaluatedProperties": false,
  "$defs": {
    "tree": {
      "$id": "tree",
      "$dynamicAnchor": "node",
      "type": "object",
      "properties": { "children": { "type": "array", "items": { "$dynamicRef": "#node" } } }
    }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-PR-2. This is the worked example of the 2020-12 core text.
- **Holds:** that the items of `children` are whatever the outermost resource in the
  current evaluation names `node`: here the strict tree, so every level is closed.
  Reached another way, the same `tree` definition is open.
- **A naive structure loses:** the meaning, if `$dynamicRef` is read as `$ref`: the
  children would be the open tree. Writing it for a target with no such reference means a
  copy for each way of reaching it, which is against "written once".

### B6. A schema that applies when a key is present

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": { "card": { "type": "string" } },
  "dependentSchemas": {
    "card": { "properties": { "billing": { "type": "string" } }, "required": ["billing"] }
  },
  "unevaluatedProperties": false
}
```

- **Tests:** SPEC-P-1; SPEC-PR-1.
- **Holds:** that `billing` is required and allowed where `card` is present, and not
  allowed where it is absent.
- **A naive structure loses:** that `dependentSchemas` feeds what `unevaluatedProperties`
  sees.

### B7. An absent keyword against one that asserts nothing

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "allOf": [{ "properties": { "a": true }, "additionalProperties": {} }],
  "unevaluatedProperties": false
}
```

- **Tests:** SPEC-PR-2.
- **Holds:** that every property is allowed. `additionalProperties: {}` evaluates every
  property, so `unevaluatedProperties` finds none left. Without it, only `a` would be
  allowed.
- **A naive structure loses:** the difference, if it normalises `additionalProperties: {}`
  to "not stated".

## C. The four policies for unknown keys

### C1. Each policy, stated

```ts
z.strictObject({ a: z.string() }); // closed
z.looseObject({ a: z.string() }); // open
z.object({ a: z.string() }).catchall(z.number()); // constrained
z.object({ a: z.string() }); // stripped
```

- **Tests:** SPEC-P-1, the four policies are all meanings.
- **Holds:** one of four facts on the object. Zod holds the first three as what the rest
  of the object must be (nothing, anything, a schema) and the fourth as no such thing.
- **A naive structure loses:** stripped, if the policy is a boolean; and constrained, if
  it is a three-valued flag with no shape.

### C2. A policy the source did not state

```json
{ "type": "object", "properties": { "a": { "type": "string" } } }
```

- **Tests:** SPEC-P-1's reading and reporting: an object that does not state its policy
  is read as closed, and every object whose policy Castr supplied is listed in the report.
- **Holds:** closed, **and that Castr supplied it**. The two are different facts from
  `additionalProperties: false` written by the author.
- **A naive structure loses:** the report, if "closed" is all the model can say.

### C3. Stripped is a difference of sides

```ts
z.object({ a: z.string() }).parse({ a: 'x', b: 1 }); // { a: 'x' }
```

- **Tests:** section 3's produced set, which differs from the accepted set where a shape
  strips unknown keys.
- **Holds:** an object that accepts unknown keys and produces none.
- **A naive structure loses:** one side. Zod's own JSON Schema writer writes this object
  closed for output and open for input.

## D. The two sides

### D1. A default that inserts, a prefault that is validated, and an annotation

```ts
z.string().min(5).default('x').parse(undefined); // 'x', not validated
z.string().min(5).prefault('x'); // parse(undefined) throws: 'x' is validated
```

```json
{ "type": "string", "minLength": 5, "default": "x" }
```

- **Tests:** SPEC-P-6, a source `default` is an annotation; Appendix A's rows for
  `.default` and `.prefault`.
- **Holds:** three different facts. Zod's default makes an absent value acceptable and
  produces the default unvalidated. Zod's prefault produces it validated. JSON Schema's
  `default` inserts nothing.
- **A naive structure loses:** two of the three, if `default` is one field.

### D2. A union whose result depends on its order

```ts
const A = z.object({ a: z.string() });
const AB = z.object({ a: z.string(), b: z.string() });
z.union([A, AB]).parse({ a: 'x', b: 'y' }); // { a: 'x' }
z.union([AB, A]).parse({ a: 'x', b: 'y' }); // { a: 'x', b: 'y' }
```

- **Tests:** section 3's produced set; SPEC-PR-2.
- **Holds:** the order of the alternatives, where an alternative produces something other
  than what it accepts. The two unions accept the same values and produce different ones.
- **A naive structure loses:** the produced side, if it sorts or merges alternatives.

## E. Values held exactly

### E1. Numbers beyond a double

```json
{ "type": "integer", "minimum": 0, "maximum": 18446744073709551615, "multipleOf": 0.01 }
```

- **Tests:** section 3's value: numbers are exact, arbitrary-precision decimals.
- **Holds:** the bound and the divisor exactly. `18446744073709551615` is not a double,
  and `0.01` has no exact binary form.
- **A naive structure loses:** the last digits of the bound and the meaning of the
  divisor, if either is a JavaScript number.

### E2. One number, written two ways

```json
{ "enum": [1, 1.0, 1] }
```

- **Tests:** section 3: `1.0` and `1` are one value.
- **Holds:** a set of one member.
- **A naive structure loses:** nothing here by accident, since a double happens to merge
  them; a model that keeps the source text of a number to stay exact has to merge them on
  purpose.

### E3. A boolean schema

```json
{ "properties": { "anything": true, "nothing": false }, "required": ["anything"] }
```

- **Tests:** SPEC-PR-1; SPEC-AR-5, writers are total.
- **Holds:** "every value" and "no value" as shapes, wherever a shape may stand.
- **A naive structure loses:** `false`, if a schema is always an object of keywords.

### E4. A constant beside a keyword that also decides

```json
{ "type": "string", "const": 5 }
```

- **Tests:** SPEC-PR-7, a shape no value can satisfy is carried faithfully and reported.
- **Holds:** both constraints, and nothing merged or repaired. The diagnostic names the
  location, the two constraints and why no value satisfies them.
- **A naive structure loses:** the conflict, if `const` replaces the type; or the shape,
  if an empty shape is refused when it is built.

### E5. A format beyond the listed ones

```json
{ "type": "integer", "format": "int64" }
```

- **Tests:** SPEC-P-3, `format` asserts.
- **Holds:** the format's name as a fact, apart from what any one target does with it.
- **A naive structure loses:** the name, if it is turned into a range of numbers on
  reading.

## F. Boundaries

### F1. A path with no operation, and parameters at two levels

```json
{
  "paths": {
    "/empty": {},
    "/pets/{id}": {
      "parameters": [
        { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "get": {
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": { "200": { "description": "ok" } }
      },
      "delete": { "responses": { "204": { "description": "gone" } } }
    }
  }
}
```

- **Tests:** Appendix B.4's rows for a path and for its parameters; SPEC-PR-1.
- **Holds:** a path that exists and has no operation; a parameter stated on the path item;
  that `get` overrides it by its name and location together, and `delete` inherits it.
- **A naive structure loses:** the empty path, if paths exist only as owners of
  operations; and where a parameter was stated, if the reader copies it into each
  operation.

### F2. Every place a parameter may be, and both ways to describe one

```json
{
  "parameters": [
    { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } },
    {
      "name": "q",
      "in": "query",
      "style": "deepObject",
      "explode": true,
      "schema": { "type": "object" }
    },
    { "name": "X-Trace", "in": "header", "schema": { "type": "string" } },
    { "name": "session", "in": "cookie", "schema": { "type": "string" } },
    {
      "name": "filter",
      "in": "query",
      "content": { "application/json": { "schema": { "type": "object" } } }
    }
  ]
}
```

- **Tests:** SPEC-P-5, anything in a closed OpenAPI specification can be carried.
- **Holds:** the location; and that a parameter is described either by a schema and a
  style or by a media type, never both. In 3.2 a fifth location, `querystring`, takes the
  whole query string as one value and has no use for a name.
- **A naive structure loses:** `content`, if a parameter always has a schema.

### F3. Defaults the text supplies

```json
{
  "parameters": [
    { "name": "ids", "in": "query", "schema": { "type": "array", "items": { "type": "string" } } }
  ]
}
```

- **Tests:** SPEC-PR-1; SPEC-PR-2.
- **Holds:** that the style is `form` and `explode` is true, **and that the document did
  not say so**. Likewise `required` false and `deprecated` false, and absent `servers`
  meaning one server at `/`.
- **A naive structure loses:** either the meaning, if absent stays absent and each writer
  guesses; or the fact that the source was silent, if the reader fills the value in.

### F4. A status given three ways, and a response with no body

```json
{
  "responses": {
    "200": {
      "description": "ok",
      "content": { "application/json": { "schema": { "type": "object" } } }
    },
    "204": { "description": "nothing" },
    "4XX": { "description": "your fault" },
    "default": { "description": "anything else" }
  }
}
```

- **Tests:** SPEC-PR-1; SPEC-AR-3.
- **Holds:** an exact code, a range and "every other code" as three kinds of key; that an
  exact code wins over its range; and a response with no content.
- **A naive structure loses:** the kinds, if the key stays the text `4XX` for a writer to
  parse.

### F5. A header the text says is ignored

```json
{
  "parameters": [{ "name": "Content-Type", "in": "header", "schema": { "type": "string" } }],
  "responses": {
    "200": {
      "description": "ok",
      "headers": { "content-type": { "schema": { "type": "string" } } }
    }
  }
}
```

- **Tests:** SPEC-PR-2: nothing changes silently.
- **Holds:** that the document states them and that OpenAPI gives them no effect. Header
  names are not case-sensitive, so `content-type` is the same header.
- **A naive structure loses:** silently, either way: by dropping them, or by writing them
  as live parameters.

### F6. Methods beyond the fixed ones

```json
{
  "paths": {
    "/search": {
      "query": { "responses": { "200": { "description": "ok" } } },
      "additionalOperations": { "PURGE": { "responses": { "204": { "description": "gone" } } } }
    }
  }
}
```

- **Tests:** SPEC-P-5; section 6, OpenAPI 3.2.x is read.
- **Holds:** a method as a value that is not from a fixed list, with its capitals as sent.
- **A naive structure loses:** `PURGE`, if a method is one of eight field names.

### F7. Webhooks and callbacks

```json
{
  "webhooks": { "newPet": { "post": { "responses": { "200": { "description": "ok" } } } } },
  "paths": {
    "/subscribe": {
      "post": {
        "responses": { "201": { "description": "ok" } },
        "callbacks": {
          "onEvent": {
            "{$request.body#/url}": { "post": { "responses": { "200": { "description": "ok" } } } }
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-C-1's five types include `webhooks`; SPEC-AR-3.
- **Holds:** requests the provider makes. A webhook is keyed by a name. A callback is
  keyed by a runtime expression, which has a grammar.
- **A naive structure loses:** the expression's structure, if the key stays text.

## G. Document content

### G1. Servers, security and their cascades

```json
{
  "servers": [
    {
      "url": "https://{region}.example.com",
      "variables": { "region": { "default": "eu", "enum": ["eu", "us"] } }
    }
  ],
  "security": [{ "oauth": ["read"] }, {}],
  "paths": {
    "/pets": {
      "servers": [{ "url": "https://pets.example.com" }],
      "get": { "security": [], "responses": { "200": { "description": "ok" } } }
    }
  }
}
```

- **Tests:** SPEC-PR-1; SPEC-AR-3.
- **Holds:** a server URL as a template with a variable; security as a choice of
  requirements, of which the empty one means "none needed"; that the path item's servers
  replace the document's; and that the operation's empty `security` removes the
  document's.
- **A naive structure loses:** the cascade, if each level is kept with no rule for which
  applies; or where each was stated, if the reader flattens them into the operation.

### G2. An extension at each place one may stand

```json
{
  "x-root": 1,
  "info": { "title": "t", "version": "1", "x-info": { "a": [1, 2] } },
  "paths": {
    "x-paths": true,
    "/pets": {
      "x-item": null,
      "get": { "x-op": "s", "responses": { "200": { "description": "ok" } } }
    }
  },
  "components": { "schemas": { "Pet": { "type": "object", "x-schema": 1, "unknownKeyword": 2 } } }
}
```

- **Tests:** section 3's meaning includes extensions; SPEC-PR-1.
- **Holds:** an extension with any JSON value, on every kind of object that takes one; and
  inside a schema, any property at all, where the `x-` prefix is not needed.
- **A naive structure loses:** extensions on the kinds it forgot.

## H. What a report needs, and what Zod alone can say

### H1. The place in the source of every construct

```json
{ "type": "object", "properties": { "a": { "type": "string", "const": 5 } } }
```

- **Tests:** SPEC-PR-8, reports are explicit and informative; section 3's located
  rejection names where the construct is in the source.
- **Holds:** for the conflict at `a`, where it is in the source. The place is held beside
  the value and is not part of it: two documents that state the same shape at different
  places are still one value (section I).
- **A naive structure loses:** either the place, or the sameness.

### H2. Constructs only Zod has

```ts
z.templateLiteral(['id-', z.number()]);
z.object({ a: z.string().exactOptional(), b: z.string().optional() });
z.object({ a: z.string() }).readonly();
z.object({
  get self() {
    return z.string();
  },
});
z.string().brand('Id');
z.string().meta({ title: 'A name' });
```

- **Tests:** Appendix A's rows for each.
- **Holds:** a template literal's parts in order; that an exact optional key may be absent
  and may not be `undefined`, which differs from an optional only in Zod's class;
  read-only as a fact of an object; a reference Zod writes as a getter. A brand leaves
  nothing in the schema Zod builds. Metadata is held in a registry beside the schema.
- **A naive structure loses:** the exact optional, if it reads Zod's definition alone; and
  metadata, if it reads the schema and not the registry.

## I. Equivalence sets: one meaning, one value

For each set, the model built from every member is the same value. The place each came
from, and what the source left unsaid, are held beside the value.

### I1. Closed

```ts
z.strictObject({ a: z.string() });
```

```json
{ "type": "object", "properties": { "a": { "type": "string" } }, "additionalProperties": false }
```

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "allOf": [{ "type": "object", "properties": { "a": { "type": "string" } } }],
  "unevaluatedProperties": false
}
```

- **Tests:** SPEC-AR-1; SPEC-P-1.
- **One value:** an object of one optional string, closed. The third is the same value
  because its composition has one branch that every value takes.
- **Not the same value:** `additionalProperties: false` written inside one branch of an
  `allOf` of two. That closes the branch over its own keys only, which makes the whole
  unsatisfiable for any key of the other branch.

### I2. A tuple

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": [{ "type": "string" }, { "type": "number" }],
  "additionalItems": false
}
```

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "prefixItems": [{ "type": "string" }, { "type": "number" }],
  "items": false
}
```

```ts
z.tuple([z.string(), z.number()]);
```

- **Tests:** SPEC-AR-1.
- **One value:** positions and a shape for the rest. The JSON Schema forms put no lower
  bound on length; Zod's tuple requires both positions. So the JSON Schema pair is one
  value and the Zod tuple is that value with a minimum length of two.

### I3. A dependency

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "dependencies": { "a": ["b"], "c": { "required": ["d"] } }
}
```

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "dependentRequired": { "a": ["b"] },
  "dependentSchemas": { "c": { "required": ["d"] } }
}
```

- **Tests:** SPEC-AR-1.
- **One value:** a presence rule on `a`, and a schema that applies when `c` is present.
  Draft-07 writes both under one keyword.

### I4. Nullable

```json
{ "type": ["string", "null"] }
```

```json
{ "anyOf": [{ "type": "string" }, { "type": "null" }] }
```

```ts
z.string().nullable();
```

- **Tests:** SPEC-AR-1.
- **One value:** string or null.

### I5. A constant and a one-member enumeration

```json
{ "const": "a" }
```

```json
{ "enum": ["a"] }
```

```ts
z.literal('a');
```

- **Tests:** SPEC-AR-1. The 2020-12 validation text says `const` is the same as an `enum`
  of one value.
- **One value:** the value `a`.

### I6. Pairs that are not one value

Each pair looks alike. A design that makes them one value is wrong.

- **A1 against a schema written in line.** `{"$ref": "#/$defs/Name"}` and the body of
  `Name` accept the same values. The name is part of meaning (SPEC-PR-3), so they differ.
- **A11.** `#/definitions/x` and `#/$defs/x`.
- **C2.** Closed because the author wrote it, and closed because Castr supplied it.
- **D1.** A Zod `.default`, a Zod `.prefault` and a JSON Schema `default`.
- **D2.** A union and the same union in another order, where an alternative strips.
- **`oneOf` and `anyOf`** over alternatives that can overlap.
- **An absent keyword and the keyword with a value that asserts nothing** (B7), wherever
  another keyword reads what it evaluated.
- **An unknown keyword in 2020-12 and in Draft-07.** The first is an annotation; the
  second is ignored.
- **A Draft-07 `$ref` with a keyword beside it and a 2020-12 one** (A4).

## What these cases do not cover

- OpenAPI 3.0.x, Swagger 2.0, MCP and Markdown, which the plan puts outside the design.
- Serialisation at run time: what a style does to a value on the wire. The model holds
  the fields; the rules are for whoever serialises.
- XML, beyond the fields the published schemas hold.
- Validity rules of a document, which are the reader's and belong to SPEC-FV-2.
