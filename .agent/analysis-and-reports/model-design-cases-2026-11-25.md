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

Every JSON document below parses. Every Zod document is run as it stands by a test,
with `z` and a function `check(actual, expected)` in scope; a `check` that does not hold
fails the test. A reader who knows each format then attacked the note: one for OpenAPI, who read the texts
of 3.2.1 and 3.1.2; one for JSON Schema, who ran two validators and read the four texts;
one for Zod, who ran every claim. Their corrections and the cases they found missing are in the note. The seat
checked the OpenAPI reader's quotations against the texts, re-ran the Zod reader's
findings, and re-ran the JSON Schema reader's script for the cases it found missing.

The texts decide what a schema accepts. Each JSON Schema case's stated passes and
failures were run under the Hyperjump validator, which agreed with the texts wherever it
was checked. Ajv 8 departs from them in two cases the seat ran (a lone `if`, and
`contains` with `unevaluatedItems`) and, the reader says, in two more (a Draft-07 `$ref`
with a keyword beside it, and a decimal `multipleOf`). Neither Ajv nor Zod's own
`toJSONSchema` is an oracle.

The documents are fragments: an OpenAPI case shows the part that matters and omits
`openapi`, `info` and the rest. With `openapi` and `info` added, every OpenAPI fragment
is valid under the schema published for 3.2, checked with Hyperjump; cases A18, F6, F8
and F9 use fields 3.2 added and are not valid under the one for 3.1.

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
- **Holds:** a reference to a parameter and to a response as an edge to a thing with an
  identity, as for a schema. Likewise a request body, a header, an example, a link, a
  callback, a path item, a security scheme and, in 3.2, a media type. What stands beside
  the reference is read by a different rule for each of three kinds of reference
  (case A12).
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
- **Holds:** that the path is given by reference, and to what. Where a field stands both
  beside the reference and in the path item referred to, the text leaves the behaviour
  undefined, and the model holds that both were stated.
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
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$defs": {
    "Node": {
      "type": "object",
      "properties": {
        "next": {
          "$ref": "#/$defs/Node"
        }
      }
    }
  },
  "$ref": "#/$defs/Node"
}
```

- **Tests:** SPEC-PR-3. The 2020-12 core text forbids only running a schema into an
  endless loop against an instance (section 9.4.1); this cycle passes through a property,
  so each turn uses up part of the value.
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
  says only the entry document's paths contribute URLs to the API; a path item of another
  document still enters by reference. For a connection made by name it recommends
  resolving from the entry document and leaves the choice to the implementation (case
  A17).
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
- **Holds:** edges that the source writes as a bare name: a security requirement to its
  scheme, an operation to its tag, a link to its operation, and (case A9) a discriminator
  value to a schema. Three things a design must not assume of them:
  - a tag an operation names need not be declared, so that edge may have no target, and
    the tag is still a tag;
  - in 3.2 the key of a security requirement is the name of a declared scheme or the URI
    of one, and a name wins;
  - 3.2 adds an edge from a tag to its `parent` tag, which must exist.
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
  `definitions`, and the validation text says an implementation should assume it behaves
  as `$defs` under that meta-schema. That makes both places hold schemas; it does not
  make `#/definitions/x` and `#/$defs/x` one target. Under another meta-schema
  `definitions` is an unknown keyword, and the core text calls a reference into one
  undefined.
- **A naive structure loses:** one of them, if it merges the two keywords into one table
  keyed by the last path segment.

### A12. Three kinds of reference, and what stands beside each

```json
{
  "paths": {
    "/pets": {
      "get": {
        "parameters": [
          {
            "$ref": "#/components/parameters/Limit",
            "description": "Page size for this list",
            "x-a": 1
          }
        ],
        "responses": {
          "200": {
            "description": "ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/T",
                  "description": "here",
                  "x-a": 1
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "parameters": {
      "Limit": {
        "name": "limit",
        "in": "query",
        "description": "Page size",
        "schema": {
          "type": "integer"
        }
      }
    },
    "schemas": {
      "T": {
        "type": "string",
        "description": "there"
      }
    }
  }
}
```

- **Tests:** SPEC-PR-1; SPEC-PR-2.
- **Holds:** three rules. Beside a Reference Object, `summary` and `description` replace
  the target's and any other key is ignored: here the parameter's description is the new
  one and `x-a` states nothing. Beside a schema's `$ref`, every keyword applies: both
  descriptions stand and `x-a` is kept. Beside a path item's `$ref`, the behaviour is
  undefined (case A3).
- **A naive structure loses:** the override, if an edge carries nothing; or the
  difference, if one node shape is "a reference and its siblings".

### A13. A reference to a place that has no name

```json
{
  "paths": {
    "/pets/{id}": {
      "get": {
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "ok",
            "links": {
              "self": {
                "operationRef": "#/paths/~1pets~1%7Bid%7D/get"
              }
            },
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Pet/properties/owner"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Pet": {
        "type": "object",
        "properties": {
          "owner": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-AR-3.
- **Holds:** an edge to a thing that is not a named definition: an operation, found by
  its path and method, and a property's schema inside another definition. The source
  writes each as a JSON Pointer, with `~1` for a slash and percent-escapes for the
  braces.
- **A naive structure loses:** these edges, if a reference can only point at an entry of
  a table of names; or their target, if the pointer stays text for a writer to decode.

### A14. One path item, referenced from two paths

```json
{
  "paths": {
    "/a": {
      "$ref": "#/components/pathItems/P"
    },
    "/b": {
      "$ref": "#/components/pathItems/P"
    }
  },
  "components": {
    "pathItems": {
      "P": {
        "get": {
          "operationId": "op",
          "responses": {
            "200": {
              "description": "ok",
              "links": {
                "again": {
                  "operationId": "op"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-PR-2.
- **Holds:** one definition used at two paths, which is two operations stated once. The
  text says an `operationId` in a path item referenced more than once cannot be resolved
  unambiguously and leaves the outcome to the implementation; the model holds what was
  stated and that the link's target is ambiguous.
- **A naive structure loses:** one of the two operations, if an operation's identity is
  its object or its `operationId`; or the sharing, if the reader copies the path item.

### A15. A schema that is its own resource inside an OpenAPI document

```json
{
  "components": {
    "schemas": {
      "Legacy": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://example.com/legacy",
        "definitions": {
          "N": {
            "type": "string"
          }
        },
        "properties": {
          "n": {
            "$ref": "#/definitions/N",
            "maxLength": 3
          },
          "o": {
            "$ref": "owner"
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-PR-3; the definition of "document" in section 3.
- **Holds:** a resource with its own dialect and its own base. The OpenAPI text says a
  `$schema` in a resource root always overrides any default. So here `maxLength` beside
  the `$ref` states nothing (case A4), `#/definitions/N` is found inside `Legacy` and not
  at the root of the OpenAPI document, and `owner` is `https://example.com/owner`.
- **A naive structure loses:** all three, if a document has one dialect and one base.

### A16. A discriminator on a parent, with a default

```json
{
  "components": {
    "schemas": {
      "Pet": {
        "type": "object",
        "properties": {
          "petType": {
            "type": "string"
          }
        },
        "discriminator": {
          "propertyName": "petType",
          "defaultMapping": "OtherPet"
        }
      },
      "Cat": {
        "allOf": [
          {
            "$ref": "#/components/schemas/Pet"
          },
          {
            "properties": {
              "petType": {
                "const": "Cat"
              }
            },
            "required": ["petType"]
          }
        ]
      },
      "OtherPet": {
        "allOf": [
          {
            "$ref": "#/components/schemas/Pet"
          }
        ]
      }
    }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-PR-7.
- **Holds:** a discriminator on a schema that lists no alternatives. The alternatives are
  the schemas that build on it through `allOf`, so the edges run from child to parent.
  3.2's `defaultMapping` names the schema for a value no mapping covers. The text says
  validation does not search for child schemas, so none of this changes what validates.
- **A naive structure loses:** the alternatives, if it holds only those listed under
  `oneOf` or `anyOf`; or the meaning, if it builds a `oneOf` from the children.

### A17. A name resolved from the entry document

The entry document, then `other.json`:

```json
{
  "components": {
    "securitySchemes": {
      "S": {
        "type": "http",
        "scheme": "bearer"
      }
    }
  },
  "paths": {
    "/foo": {
      "$ref": "other.json#/components/pathItems/Foo"
    }
  }
}
```

```json
{
  "components": {
    "securitySchemes": {
      "S": {
        "type": "http",
        "scheme": "basic"
      }
    },
    "pathItems": {
      "Foo": {
        "get": {
          "security": [
            {
              "S": []
            }
          ],
          "responses": {
            "200": {
              "description": "ok"
            }
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-PR-7.
- **Holds:** that the requirement names `S`, in which document it was written, and that
  the text recommends the entry document's `S` (bearer) and allows an implementation the
  other (basic).
- **A naive structure loses:** the choice, if a name is resolved in the document it was
  written in before the model sees it.

### A18. More connections made by name

```json
{
  "tags": [
    {
      "name": "cats",
      "parent": "pets"
    },
    {
      "name": "pets"
    }
  ],
  "paths": {
    "/files/{name}.{ext}": {
      "get": {
        "operationId": "getFile",
        "parameters": [
          {
            "name": "name",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "ext",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "ok",
            "links": {
              "same": {
                "operationId": "getFile",
                "parameters": {
                  "path.name": "$request.path.name"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-PR-3; SPEC-AR-3.
- **Holds:** a path as a template whose expressions are edges to path parameters, two of
  them in one segment here; a link's parameter key as an edge to a parameter of the
  target operation, by location and name; a tag's parent. An `encoding` key is a fourth
  (case F8).
- **A naive structure loses:** each, if the path, the key and the name stay text.

### A19. One value read as two kinds

```json
{
  "paths": {
    "/x": {
      "$ref": "#/components/schemas/E"
    }
  },
  "components": {
    "schemas": {
      "E": {}
    }
  }
}
```

- **Tests:** SPEC-PR-2; SPEC-FV-1.
- **Holds:** nothing by guessing. The text's own example: one `{}` reached as a schema
  and as a path item, with the behaviour left to the implementation. Castr either refuses
  it or holds two things read from one place; the design says which.
- **A naive structure loses:** silently, if a thing's kind is decided by where it sits.

### A20. Where a Zod schema's name comes from

```ts
const names = z.registry();
const Name = z.string().register(names, { id: 'Name' });
const written = z.toJSONSchema(z.object({ first: Name, last: Name }), { metadata: names });
check(written.properties, { first: { $ref: '#/$defs/Name' }, last: { $ref: '#/$defs/Name' } });
```

- **Tests:** SPEC-PR-3; SPEC-AR-6, reading runtime data structures.
- **Holds:** a definition named `Name`, referred to twice. In a running Zod schema the
  only name is the `id` in the registry, and the only sign of a reference is the same
  object met twice. The name of the constant is in the source text and not in the
  running schema.
- **A naive structure loses:** the name, if it reads the definition and not the
  registry; and the sharing, if it does not compare objects.

### A21. A JSON Schema reference to a place with no name

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "properties": {
    "a": {
      "type": "string",
      "maxLength": 2
    },
    "b": {
      "$ref": "#/properties/a"
    },
    "self": {
      "$ref": "#"
    }
  }
}
```

- **Tests:** SPEC-PR-3.
- **Holds:** an edge to a property's schema, and an edge to the whole document, neither
  of which is a named definition (case A13 is the same in OpenAPI).
- **A naive structure loses:** both, if a reference can only point into `$defs`.

### A22. A keyword of another draft

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "prefixItems": [
    {
      "type": "string"
    }
  ],
  "additionalItems": false,
  "dependencies": {
    "a": ["b"]
  }
}
```

- **Tests:** SPEC-PR-2.
- **Holds:** for a 2020-12 document, that `additionalItems` and `dependencies` constrain
  nothing: `["s", 1, 2]` and `{"a": 1}` pass. They are names the dialect does not give
  meaning to.
- **A naive structure loses:** the meaning, if it reads a keyword by its name whatever
  the dialect.

### A23. Draft-07's anchors

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "a": {
      "$id": "#here",
      "type": "string"
    },
    "b": {
      "$id": "sub/other.json",
      "definitions": {
        "c": {
          "$id": "#here",
          "type": "number"
        }
      }
    }
  },
  "properties": {
    "x": {
      "$ref": "#here"
    },
    "y": {
      "$ref": "sub/other.json#here"
    }
  }
}
```

- **Tests:** SPEC-PR-3; the definition of "document" in section 3.
- **Holds:** in Draft-07, an anchor and a new base are both made by `$id`: the two
  `here` are different targets, as in case A6.
- **A naive structure loses:** the anchors, if it looks for `$anchor`.

### A24. A dialect that leaves out a vocabulary

A meta-schema, then a schema that names it:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/meta/no-validation",
  "$vocabulary": {
    "https://json-schema.org/draft/2020-12/vocab/core": true,
    "https://json-schema.org/draft/2020-12/vocab/applicator": true
  },
  "$dynamicAnchor": "meta",
  "allOf": [
    {
      "$ref": "https://json-schema.org/draft/2020-12/meta/core"
    },
    {
      "$ref": "https://json-schema.org/draft/2020-12/meta/applicator"
    }
  ]
}
```

```json
{
  "$schema": "https://example.com/meta/no-validation",
  "$id": "https://example.com/s",
  "type": "string",
  "properties": {
    "a": {
      "maxLength": 1
    }
  }
}
```

- **Tests:** SPEC-PR-2; section 6, the dialects Castr reads.
- **Holds:** that a 2020-12 dialect is the set of vocabularies its meta-schema declares.
  This one leaves out validation, so `type` and `maxLength` constrain nothing: `5` and
  `{"a": "long"}` pass.
- **A naive structure loses:** the dialect, if 2020-12 is one fixed set of keywords.

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
- **Holds:** an array of at most two items: a string, then a number where there is one.
  Nothing here sets a least length, and a value that is not an array passes.
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

- **Tests:** SPEC-PR-3; SPEC-PR-2. Adapted from Appendix C of the 2020-12 core text; the rule
  is its section 8.2.3.2.
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

### B8. A keyword says nothing of a value of another type

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "properties": {
    "a": {
      "type": "string"
    }
  },
  "required": ["a"]
}
```

- **Tests:** SPEC-PR-2; SPEC-PR-7.
- **Holds:** a constraint on objects, and nothing about anything else: this schema
  accepts `5`, `"x"`, `[]` and `null`. Cases B2 to B7 state no `type` either.
- **A naive structure loses:** those values, if `properties` makes a schema an object.

### B9. What an unevaluated keyword cannot see

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "allOf": [
    {
      "properties": {
        "a": true
      }
    },
    {
      "unevaluatedProperties": false
    }
  ]
}
```

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$ref": "#/$defs/C",
  "properties": {
    "b": true
  },
  "$defs": {
    "C": {
      "properties": {
        "a": true
      },
      "unevaluatedProperties": false
    }
  }
}
```

- **Tests:** SPEC-P-1.
- **Holds:** that the keyword sees what its own schema object and the schemas under it
  evaluated, and no more. The first refuses `{a}`: `a` was evaluated in a sibling branch.
  The second refuses `{a, b}`: `b` was evaluated by the schema that refers to `C`.
- **A naive structure loses:** the direction, if "closed across composition" means
  closed over every key in sight.

### B10. Keys allowed by pattern

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  },
  "patternProperties": {
    "^x-": {
      "type": "string"
    },
    "y": {
      "maxLength": 2
    }
  },
  "additionalProperties": false
}
```

- **Tests:** SPEC-P-1; SPEC-AR-3.
- **Holds:** a closed object whose allowed keys are a set of names and two patterns. A
  key that matches both patterns must satisfy both schemas: `x-y` with a value of three
  characters fails. The patterns are not anchored: `xy` is allowed.
- **A naive structure loses:** the patterns, if "closed" is a list of key names.

### B11. Negation

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "not": {
    "required": ["a"]
  }
}
```

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "not": {
    "not": {
      "properties": {
        "a": true
      }
    }
  },
  "unevaluatedProperties": false
}
```

- **Tests:** SPEC-PR-1; SPEC-AR-5.
- **Holds:** negation of a shape. The first forbids a key. The second refuses `{a}`:
  nothing under a `not` counts as evaluated, though a double negation accepts the same
  values as its inside.
- **A naive structure loses:** the first, if it has no negation; and the second, if it
  simplifies a double negation away.

### B12. Items found by `contains`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "contains": {
    "type": "string"
  },
  "unevaluatedItems": {
    "type": "number"
  }
}
```

- **Tests:** SPEC-PR-2.
- **Holds:** an array with at least one string, in which every item that is not a string
  is a number: `["s", true]` fails. `minContains` and `maxContains` count the matches.
- **A naive structure loses:** this, if an array is positions and a shape for the rest.

### B13. An `if` with nothing after it

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "if": {
    "properties": {
      "a": {
        "type": "string"
      }
    }
  },
  "unevaluatedProperties": false
}
```

- **Tests:** SPEC-P-1.
- **Holds:** that `{"a": "s"}` passes: an `if` that holds counts what it evaluated, with
  no `then` or `else`. `{"a": 1}` fails.
- **A naive structure loses:** this, if it drops an `if` that has no consequence.

### B14. The same keyword over `oneOf`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "oneOf": [
    {
      "properties": {
        "a": {
          "type": "string"
        }
      },
      "required": ["a"]
    },
    {
      "properties": {
        "b": {
          "type": "string"
        }
      },
      "required": ["b"]
    }
  ],
  "unevaluatedProperties": false
}
```

- **Tests:** SPEC-P-1; SPEC-PR-2.
- **Holds:** exactly one branch, closed over that branch's keys: `{a}` and `{b}` pass,
  and `{a, b}` fails, where under `anyOf` (case B2) it passes.
- **A naive structure loses:** the difference from B2, if `oneOf` is read as `anyOf`.

## C. The four policies for unknown keys

### C1. Each policy, stated

```ts
const value = { a: 'x', b: 1 };
const closed = z.strictObject({ a: z.string() });
const open = z.looseObject({ a: z.string() });
const constrained = z.object({ a: z.string() }).catchall(z.number());
const stripped = z.object({ a: z.string() });
check(closed.safeParse(value).success, false);
check(open.parse(value), { a: 'x', b: 1 });
check(constrained.safeParse(value).success, true);
check(constrained.safeParse({ a: 'x', b: 'n' }).success, false);
check(stripped.parse(value), { a: 'x' });
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
- **Holds:** closed, as a meaning; and beside the meaning, in the record of the reading,
  that the source stated no policy and Castr's profile supplied one. The record is not
  part of the value: this is the same value as an object the author closed, with a
  different record (section I).
- **A naive structure loses:** the report, if nothing records what was supplied; or the
  sameness, if "supplied" is part of the value.
- **What the specification does not yet say:** where a supplied closure lands. Case B1's
  `Base` states no policy. Closed in place, it refuses `extra`, and B1 has no value with
  both keys; the same is true of each branch of B2 and of B6's dependent schema. And one
  place in a value is often reached from several places in a schema, so that no place in
  the schema is the right one. This is a row for the amendment.

### C3. Stripped is a difference of sides

```ts
check(z.object({ a: z.string() }).parse({ a: 'x', b: 1 }), { a: 'x' });
```

- **Tests:** section 3's produced set, which differs from the accepted set where a shape
  strips unknown keys.
- **Holds:** an object that accepts unknown keys and produces none.
- **A naive structure loses:** one side. Zod's own JSON Schema writer writes this object
  closed for output and open for input.

### C4. An intersection of two closed objects

```ts
const A = z.strictObject({ a: z.string() });
const B = z.strictObject({ b: z.string() });
check(z.intersection(A, B).safeParse({ a: 'x', b: 'y' }).success, true);
check(z.intersection(A, B).safeParse({ a: 'x', b: 'y', c: 1 }).success, false);
```

- **Tests:** SPEC-P-1; SPEC-AR-1.
- **Holds:** an object closed over the keys of both sides together. In JSON Schema the
  same meaning is `unevaluatedProperties: false` over an `allOf`, and not an `allOf` of
  two schemas each with `additionalProperties: false`, which no value with both keys
  satisfies (I1).
- **A naive structure loses:** the meaning, if a Zod intersection is read as `allOf` of
  its sides as they stand.

### C5. A record

```ts
const whole = z.record(z.enum(['a', 'b']), z.number()); // both keys required, no others
const partial = z.partialRecord(z.enum(['a', 'b']), z.number()); // neither required
const loose = z.looseRecord(z.string().regex(/^x-/), z.number()); // other keys pass unchecked
check(whole.safeParse({ a: 1 }).success, false);
check(whole.safeParse({ a: 1, b: 2 }).success, true);
check(whole.safeParse({ a: 1, b: 2, c: 3 }).success, false);
check(partial.safeParse({}).success, true);
check(loose.safeParse({ 'x-a': 1, b: 'q' }).success, true);
check(loose.safeParse({ 'x-a': 'no' }).success, false);
```

- **Tests:** SPEC-P-1. Appendix A has no row for a record: a row for the amendment.
- **Holds:** for a finite set of keys, that every key is required unless the record is
  partial; and whether a key the key schema does not match is refused or let through.
- **A naive structure loses:** all of that, if a record is a key shape and a value shape.

### C6. Three kinds of choice

```ts
const A = z.object({ a: z.string() });
const AB = z.object({ a: z.string(), b: z.string() });
const Cat = z.object({ kind: z.literal('cat') });
const Dog = z.object({ kind: z.literal('dog') });
const value = { a: 'x', b: 'y' };
check(z.union([A, AB]).parse(value), { a: 'x' }); // the first that matches
check(z.xor([A, AB]).safeParse(value).success, false); // exactly one must match
check(z.discriminatedUnion('kind', [Cat, Dog]).parse({ kind: 'dog' }), { kind: 'dog' }); // the key picks one
```

- **Tests:** SPEC-PR-2; SPEC-AR-5.
- **Holds:** which of the three. Zod's definition calls all three a union and tells them
  apart by other fields. JSON Schema's `anyOf` accepts where at least one branch does and
  has no order: it accepts what a `z.union` accepts and says nothing of which branch
  produces. `oneOf` accepts where exactly one does, as `z.xor`.
- **A naive structure loses:** two of them, if it reads the kind alone.

## D. The two sides

### D1. A default that inserts, a prefault that is validated, and an annotation

```ts
check(z.string().min(5).default('x').parse(undefined), 'x'); // not validated
check(z.string().min(5).prefault('x').safeParse(undefined).success, false); // validated
```

```json
{ "type": "string", "minLength": 5, "default": "x" }
```

- **Tests:** SPEC-P-6, a source `default` is an annotation; Appendix A's rows for
  `.default` and `.prefault`.
- **Holds:** three different facts.
  - Zod's default is a value of the produced side. Where the input is absent or
    `undefined`, it is produced as it is: the inner schema is not run, so it is neither
    validated nor transformed.
  - Zod's prefault is a value of the accepted side. It is put in place of the absent
    input and the inner schema is run on it, so it is validated and transformed.
  - JSON Schema's `default` inserts nothing.
  - Both Zod forms make a key optional on the accepted side and present on the produced
    side. A default given as a function has no one value: each read calls it.
- **A naive structure loses:** two of the three, if `default` is one field; and the side
  each belongs to.

### D2. A union whose result depends on its order

```ts
const A = z.object({ a: z.string() });
const AB = z.object({ a: z.string(), b: z.string() });
check(z.union([A, AB]).parse({ a: 'x', b: 'y' }), { a: 'x' });
check(z.union([AB, A]).parse({ a: 'x', b: 'y' }), { a: 'x', b: 'y' });
```

- **Tests:** section 3's produced set; SPEC-PR-2.
- **Holds:** the order of the alternatives, where an alternative produces something other
  than what it accepts. The two unions accept the same values and produce different ones.
  This is true of `z.union`, where the first match wins. It is not true of `z.xor`, which
  fails when two match, nor of `z.discriminatedUnion`, where the key picks one (case C6).
- **A naive structure loses:** the produced side, if it sorts or merges alternatives.

### D3. Read-only and write-only

```json
{
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "required": ["id", "password"],
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
    }
  }
}
```

- **Tests:** SPEC-PR-1; section 3's meaning includes read-only and write-only.
- **Holds:** an annotation of direction on each of two properties, which may stand on
  any schema. In OpenAPI 3.1 and 3.2 it changes nothing a schema accepts: the text says
  a tool may check it against the direction of a message, and that the owner of the API
  may ignore a read-only value sent to it or treat it as an error. Both properties are
  required in both directions.
- **A naive structure loses:** the annotation, if it holds only what validates; or the
  meaning, if it makes `required` differ by direction. That was OpenAPI 3.0's rule, and
  the text of 3.1 and 3.2 says its behaviour differs from 3.0's.

### D4. Values that are changed on the way through

```ts
check(z.string().trim().min(2).safeParse(' a ').success, false); // trimmed first
check(z.coerce.number().parse('12'), 12);
check(z.string().min(5).catch('x').parse(1), 'x');
check(z.string().default('x').nonoptional().parse(undefined), 'x');
const keyed = z.object({ a: z.string().default('x').nonoptional() });
check(keyed.safeParse({}).success, false); // at a key, absent is refused
check(keyed.parse({ a: undefined }), { a: 'x' }); // and `undefined` is defaulted
check(z.tuple([z.string(), z.number().default(5)]).parse(['a']), ['a', 5]);
```

- **Tests:** section 3's two sides; SPEC-PR-2; SPEC-P-2, the declarative subset, decides which
  of these Castr reads at all.
- **Holds:** where it reads them, each as a difference of sides.
  - A check that overwrites (`trim`) changes what later checks see, so checks have an
    order.
  - A coercion accepts what `Number()` turns into a finite number.
  - A catch accepts every value.
  - `nonoptional` checks the produced value. At the top that lets a default stand in for
    `undefined`; at a key, an absent key is refused and a key set to `undefined` is
    defaulted.
  - A tuple's minimum length is one on the accepted side and two on the produced side.
- **A naive structure loses:** the accepted side of each, if it takes Zod's own JSON
  Schema for it: that says `minLength: 2`, `type: number`, and a string of five or more.

## E. Values held exactly

### E1. Numbers beyond a double

```json
{
  "type": "number",
  "minimum": 0,
  "maximum": 18446744073709551615,
  "multipleOf": 0.01
}
```

- **Tests:** section 3's value: numbers are exact, arbitrary-precision decimals.
- **Holds:** the bound and the divisor exactly. `18446744073709551615` is not a double,
  and `0.01` has no exact binary form.
- **A naive structure loses:** the last digits of the bound and the meaning of the
  divisor, if either is a JavaScript number.

### E2. One number, written two ways

```json
{ "const": 1.0 }
```

```json
{ "enum": [1] }
```

- **Tests:** section 3: `1.0` and `1` are one value.
- **Holds:** one value, the number one, from both.
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

- **Tests:** SPEC-P-3, `format` asserts. That is Castr's rule. The 2020-12 text makes
  `format` an annotation unless the dialect declares the assertion vocabulary.
- **Holds:** the format's name as a fact, apart from what any one target does with it;
  and whether the source's dialect made it an annotation or an assertion. `int64` is
  named in none of the JSON Schema texts.
- **A naive structure loses:** the name, if it is turned into a range of numbers on
  reading.

### E6. Formats with parameters, and one meaning in two places

```ts
check(z.int().safeParse(2 ** 53).success, false); // a safe integer
check(z.int64().safeParse(1).success, false); // a bigint, not a number
check(z.url({ protocol: /^https$/ }).safeParse('http://example.com').success, false);
check(z.string().regex(/a/i).safeParse('A').success, true);
check(z.email().safeParse('a').success, false); // the schema is the check
check(z.string().email().safeParse('a').success, false); // the check is in the schema's list
```

- **Tests:** SPEC-P-3; SPEC-AR-1; SPEC-PR-2.
- **Holds:** a format with its parameters (a protocol, a version, an offset, a
  precision), a pattern with its flags, and that `z.int()` is bounded. The last two lines
  are one value.
- **A naive structure loses:** the parameters and the flags, if a format is a name and a
  pattern is a string; and it makes JSON Schema's `format: int64` into a Zod schema that
  refuses every JSON number, if it matches the names.

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
  "paths": {
    "/pets/{id}": {
      "get": {
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "q",
            "in": "query",
            "style": "deepObject",
            "explode": true,
            "schema": {
              "type": "object"
            }
          },
          {
            "name": "X-Trace",
            "in": "header",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "session",
            "in": "cookie",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "filter",
            "in": "query",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "ok"
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-P-5, anything in a closed OpenAPI specification can be carried.
- **Holds:** the location; and that a parameter is described either by a schema and a
  style or by a media type, never both. In 3.2 a fifth location, `querystring`, takes the
  whole query string as one value. It still has a name, which with its location is its
  identity and is not used when the value is serialised; it is described by `content`
  only, and does not stand beside a `query` parameter.
- **A naive structure loses:** `content`, if a parameter always has a schema.

### F3. Defaults the text supplies

```json
{
  "paths": {
    "/pets": {
      "get": {
        "parameters": [
          {
            "name": "ids",
            "in": "query",
            "schema": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "ok"
          }
        }
      }
    }
  }
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
  "paths": {
    "/pets": {
      "get": {
        "responses": {
          "200": {
            "description": "ok",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "204": {
            "description": "nothing"
          },
          "4XX": {
            "description": "your fault"
          },
          "default": {
            "description": "anything else"
          }
        }
      }
    }
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
  "paths": {
    "/pets": {
      "get": {
        "parameters": [
          {
            "name": "Content-Type",
            "in": "header",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "ok",
            "headers": {
              "content-type": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
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
  A path item has eight fixed method fields in 3.1 and nine in 3.2, where `query` is the
  ninth.
- **A naive structure loses:** `PURGE`, and `query` too, if a method is one of 3.1's eight
  field names.

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
- **Holds:** requests the provider makes. A webhook is keyed by a name. A callback has
  two keys: the operation's `callbacks` map is keyed by a name, and inside the callback
  each key is a URL template, literal text with one or more runtime expressions in it.
  The expression has a grammar; the template around it is the text and the expressions in
  order. A key there that begins `x-` is an extension.
- **A naive structure loses:** the template's structure, if the key stays text.

### F8. A request body

```json
{
  "paths": {
    "/up": {
      "post": {
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "file": {
                    "contentMediaType": "image/png"
                  },
                  "meta": {
                    "type": "object"
                  }
                }
              },
              "encoding": {
                "meta": {
                  "contentType": "application/json"
                }
              }
            },
            "text/*": {
              "schema": {
                "type": "string"
              }
            },
            "text/plain": {
              "schema": {
                "type": "string",
                "maxLength": 10
              }
            },
            "application/jsonl": {
              "itemSchema": {
                "type": "object"
              }
            }
          }
        },
        "responses": {
          "204": {
            "description": "ok"
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-P-5; SPEC-AR-3.
- **Holds:** a body that may be required; a media type key that is an exact type or a
  range, of which only the most specific applies; an `encoding` key as an edge to a
  property of the schema; and, in 3.2, `itemSchema`, which describes each item of a
  sequential media type and not the whole body.
- **A naive structure loses:** all four, if a body is one schema.

### F9. The whole query string as one parameter

```json
{
  "paths": {
    "/search": {
      "get": {
        "parameters": [
          {
            "name": "q",
            "in": "querystring",
            "content": {
              "application/x-www-form-urlencoded": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "term": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "ok"
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-P-5; section 6, OpenAPI 3.2.x is read.
- **Holds:** a parameter whose location is the whole query string, described by a media
  type (case F2 says the rest).
- **A naive structure loses:** it, if a parameter's location is one of four.

## G. Document content

### G1. Servers, security and their cascades

```json
{
  "servers": [
    {
      "url": "https://{region}.example.com",
      "variables": {
        "region": {
          "default": "eu",
          "enum": ["eu", "us"]
        }
      }
    }
  ],
  "security": [
    {
      "oauth": ["read"]
    },
    {}
  ],
  "paths": {
    "/pets": {
      "servers": [
        {
          "url": "https://pets.example.com"
        }
      ],
      "get": {
        "security": [],
        "responses": {
          "200": {
            "description": "ok"
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "oauth": {
        "type": "oauth2",
        "flows": {
          "clientCredentials": {
            "tokenUrl": "https://example.com/token",
            "scopes": {
              "read": "read things"
            }
          }
        }
      }
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

### G3. A key that begins `x-`, by where it stands

```json
{
  "components": {
    "x-a": 1,
    "schemas": {
      "x-a": {
        "type": "string"
      }
    },
    "securitySchemes": {
      "x-a": {
        "type": "apiKey",
        "name": "k",
        "in": "header"
      }
    },
    "responses": {
      "R": {
        "description": "ok",
        "headers": {
          "x-a": {
            "schema": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "security": [
    {
      "x-a": []
    }
  ],
  "webhooks": {
    "x-a": {
      "post": {
        "responses": {
          "200": {
            "description": "ok"
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-PR-1; SPEC-AR-3.
- **Holds:** one extension, directly under `components`. The other five are a schema, a
  security scheme, a header, a requirement's key and a webhook, each named `x-a`.
- **A naive structure loses:** five things, if the reader takes every key that begins
  `x-` as an extension.

### G4. No security, optional security, and two schemes at once

```json
{
  "security": [
    {
      "key": []
    }
  ],
  "paths": {
    "/a": {
      "get": {
        "security": [],
        "responses": {
          "200": {
            "description": "ok"
          }
        }
      }
    },
    "/b": {
      "get": {
        "security": [{}],
        "responses": {
          "200": {
            "description": "ok"
          }
        }
      }
    },
    "/c": {
      "get": {
        "security": [
          {
            "key": [],
            "oauth": ["read"]
          }
        ],
        "responses": {
          "200": {
            "description": "ok"
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "key": {
        "type": "apiKey",
        "name": "k",
        "in": "header"
      },
      "oauth": {
        "type": "oauth2",
        "flows": {
          "clientCredentials": {
            "tokenUrl": "https://example.com/token",
            "scopes": {
              "read": "read things"
            }
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-PR-1; SPEC-PR-2.
- **Holds:** a list of alternatives, each a set of schemes all required together. `/a`
  removes the document's requirement with an empty list. `/b` states one empty
  requirement, which the text calls making security optional. `/c` needs both schemes.
- **A naive structure loses:** the difference between `/a` and `/b`, or the "all of" in
  `/c`, if security is a flat list of scheme names.

### G5. What a document says about itself

```json
{
  "info": {
    "title": "Pets",
    "version": "1.2.0",
    "summary": "A pet shop",
    "license": {
      "name": "MIT",
      "identifier": "MIT"
    }
  },
  "externalDocs": {
    "url": "https://example.com/docs"
  },
  "tags": [
    {
      "name": "pets",
      "description": "Pets",
      "externalDocs": {
        "url": "https://example.com/docs/pets"
      }
    }
  ],
  "paths": {
    "/pets": {
      "get": {
        "tags": ["pets"],
        "externalDocs": {
          "url": "https://example.com/docs/list"
        },
        "responses": {
          "200": {
            "description": "ok"
          }
        }
      }
    }
  }
}
```

- **Tests:** SPEC-PR-1; section 3's document content.
- **Holds:** the document's title, version and licence, and external documentation at
  each of the places it may stand: the document, a tag, an operation and a schema.
- **A naive structure loses:** whatever no generated type or validator uses, if the
  model is built from what the writers need.

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
const template = z.templateLiteral(['id-', z.number()]);
check(template.safeParse('id-5').success, true);
check(z.templateLiteral(['id-', z.number().positive()]).safeParse('id--1').success, true);

const keys = z.object({ a: z.string().exactOptional(), b: z.string().optional() });
check(keys.safeParse({}).success, true);
check(keys.safeParse({ a: undefined }).success, false);
check(keys.safeParse({ b: undefined }).success, true);

check(Object.isFrozen(z.object({ a: z.string() }).readonly().parse({ a: 'x' })), true);
check(z.string().readonly().parse('x'), 'x');

const Node = z.object({
  name: z.string(),
  get next() {
    return Node.optional();
  },
});
check(Node.shape.next.unwrap() === Node, true);

const plain = z.string();
check(plain.brand('Id') === plain, true);

const said = z.registry();
const named = z.string().register(said, { title: 'A name' });
check(said.get(named.min(3)), { title: 'A name' });
check(said.get(named.optional()), undefined);
```

- **Tests:** Appendix A's rows for each.
- **Holds:**
  - **A template literal:** its parts in order. What Zod accepts is a regular expression
    it builds from the parts, which keeps a string's length and pattern and drops a
    number's range: a part `z.number().positive()` accepts `-1`. The model holds the
    parts; what Zod drops is for the report.
  - **An exact optional key:** it may be absent and may not be `undefined`. It differs
    from an optional only in Zod's class; the two definitions are the same.
  - **Read-only:** a wrapper on any schema, not a fact of an object. It changes nothing
    that is accepted and freezes what is produced. It is not JSON Schema's `readOnly`.
  - **A cycle:** `Node` refers to itself. In the running schema that is the same object
    met again; nothing of the getter is kept once it has been read. A getter is how the
    Zod writer must write a cycle, not what a reference is.
  - **A brand:** leaves nothing; `.brand()` returns the same schema.
  - **Metadata:** held in a registry beside one node. It follows the node through a
    check (`.min`), all but its `id`, and not through a wrapper (`.optional()`).
- **A naive structure loses:** the exact optional, if it reads Zod's definition alone;
  metadata, if it reads the schema and not the registry; and the cycle, if it looks for a
  getter.

## I. Equivalence sets: one meaning, one value

For each set, the model built from every member is the same value. The place each came
from, and what the source left unsaid, are held beside the value.

### I1. Closed

```ts
const closed = z.strictObject({ a: z.string().optional() });
check(closed.safeParse({}).success, true);
check(closed.safeParse({ a: 's' }).success, true);
check(closed.safeParse({ a: 's', b: 1 }).success, false);
check(closed.safeParse({ a: 1 }).success, false);
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
- **One value:** an object of one optional string, closed. The three accept and
  refuse the same values: in each, the only key a passing value may hold is `a`.
- **Not the same value:** `additionalProperties: false` written inside one branch of an
  `allOf` of two. That closes the branch over its own keys only, so the whole refuses
  every key of the other branch.

### I2. A tuple

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": [
    {
      "type": "string"
    },
    {
      "type": "number"
    }
  ],
  "additionalItems": false,
  "minItems": 2
}
```

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "prefixItems": [
    {
      "type": "string"
    },
    {
      "type": "number"
    }
  ],
  "items": false,
  "minItems": 2
}
```

```ts
const tuple = z.tuple([z.string(), z.number()]);
check(tuple.safeParse(['s']).success, false);
check(tuple.safeParse(['s', 1]).success, true);
check(tuple.safeParse(['s', 1, 2]).success, false);
```

- **Tests:** SPEC-AR-1.
- **One value:** two positions, nothing after them, and a least length of two.
- **Not the same value:** either JSON Schema form without `minItems`. A positional
  keyword puts no lower bound on length, so those accept `[]` and `["s"]`, which Zod's
  tuple refuses.

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
check(z.string().nullable().safeParse(null).success, true);
check(z.string().nullable().safeParse(1).success, false);
```

- **Tests:** SPEC-AR-1.
- **One value:** string or null. Zod holds the third as a kind of its own (`nullable`) and a union
  of the two as a union: two definitions, one value.

### I5. A constant and a one-member enumeration

```json
{ "const": "a" }
```

```json
{ "enum": ["a"] }
```

```ts
check(z.literal('a').safeParse('a').success, true);
check(z.literal('a').safeParse('b').success, false);
```

- **Tests:** SPEC-AR-1. The 2020-12 validation text says `const` is the same as an `enum`
  of one value.
- **One value:** the value `a`.

### I6. A boolean schema and its object form

```json
true
```

```json
{}
```

- **Tests:** SPEC-AR-1. The 2020-12 core text, section 4.3.2.
- **One value:** every value. Likewise `false` and `{"not": {}}` are one value, no
  value.

### I7. Sets with an OpenAPI member

Each is one value. For the first three, what differs between the members is that one
of them left the thing unsaid, and that fact is held beside the value.

- **Servers.** `servers` absent, `[]`, and `[{"url": "/"}]` (3.2.1, section 4.1.1).
- **A query parameter's style.** No `style` or `explode`, and `"style": "form",
"explode": true`.
- **A discriminator's implicit value.** No mapping, and `"mapping": {"Cat": "Cat"}` for
  an alternative named `Cat`.
- **A header's name.** `X-Rate` and `x-rate` in a response's `headers`.

### I8. Pairs that are not one value

Each pair looks alike. A design that makes them one value is wrong.

- **A1 against a schema written in line.** `{"$ref": "#/$defs/Name"}` and the body of
  `Name` often accept the same values, and not always: the core text says removing a reference
  is not always safe. The name is part of meaning (SPEC-PR-3), so they differ either way.
- **A11.** `#/definitions/x` and `#/$defs/x`.
- **D1.** A Zod `.default`, a Zod `.prefault` and a JSON Schema `default`.
- **D2.** A union and the same union in another order, where an alternative strips.
- **`oneOf` and `anyOf`** over alternatives that can overlap.
- **An operation's `security` absent, `[]`, and `[{}]`** (G4).
- **A Reference Object and a schema, each a `$ref` with a `description` beside it**
  (A12).
- **`x-a` under `components` and `x-a` under `components.schemas`** (G3).
- **Zod's `.readonly()` and JSON Schema's `readOnly`** (H2, D3).
- **`z.union`, `z.xor` and `z.discriminatedUnion`** over the same alternatives (C6).
- **A Zod intersection of two closed objects and an `allOf` of two closed schemas**
  (C4).
- **`z.int64()` and `{"type": "integer", "format": "int64"}`** (E6).
- **A Zod schema and what Zod's own `toJSONSchema` writes for it,** wherever a value is
  changed on the way through (D4).
- **An absent keyword and the keyword with a value that asserts nothing** (B7), wherever
  another keyword reads what it evaluated.
- **An unknown keyword in 2020-12 and in Draft-07.** The first should be collected as an
  annotation; the second should be ignored. The values accepted are the same.
- **A Draft-07 `$ref` with a keyword beside it and a 2020-12 one** (A4).

## What these cases do not cover

- OpenAPI 3.0.x, Swagger 2.0, MCP and Markdown, which the plan puts outside the design.
- Serialisation at run time: what a style does to a value on the wire. The model holds
  the fields; the rules are for whoever serialises.
- XML, beyond the fields the published schemas hold.
- Validity rules of a document, which are the reader's and belong to SPEC-FV-2.
